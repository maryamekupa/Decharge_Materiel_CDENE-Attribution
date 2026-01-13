/* ========== Modales personnalisées ========== */
function showCustomConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
          <div class="modal-message">${message}</div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(false);">Annuler</button>
            <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(true);">Confirmer</button>
          </div>
        </div>
      `;
    document.body.appendChild(overlay);
    window._confirmResolve = resolve;
  });
}

function showCustomAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
          <div class="modal-message">${message}</div>
          <div class="modal-buttons">
            <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal-overlay').remove(); window._alertResolve();">OK</button>
          </div>
        </div>
      `;
    document.body.appendChild(overlay);
    window._alertResolve = resolve;
  });
}

/* ========== Attribution (si le bouton existe) ========== */
const attributionTypes = {
  'Cles': { label:'Clés du bureau', show:{marque:false, nom:false, serie:false, quantite:true} },
  'Badge': { label:'Badge d\'accès', show:{marque:false, nom:false, serie:false, quantite:true} },
  'LigneTel': { label:'Téléphone Cellulaire', show:{marque:true, nom:false, serie:true, quantite:false} },
  'Laptop': { label:'Ordinateur / Laptop', show:{marque:true, nom:true, serie:true, quantite:false} },
  'Moniteur': { label:'Moniteur', show:{marque:true, nom:false, serie:true, quantite:false} },
  'Tablette': { label:'Tablette', show:{marque:true, nom:false, serie:true, quantite:false} },
  'Accessoire': { label:'Accessoires', show:{marque:true, nom:true, serie:true, quantite:false} },
  'Autres': { label:'Autres', show:{marque:true, nom:true, serie:true, quantite:false} }
};

let attrID = 0;

function addAttributionRow() {
  attrID++;
  const tbody = document.getElementById("attributionTbody");
  if (!tbody) return;

  const tr = document.createElement("tr");
  tr.innerHTML = `
      <td>
        <select class="typeSelect" onchange="updateAttrRow(this)">
          <option value="">--</option>
          ${Object.entries(attributionTypes).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" class="marque" placeholder="Marque" /></td>
      <td><input type="text" class="nom" placeholder="Nom" /></td>
      <td><input type="text" class="serie" placeholder="N° de série" /></td>
      <td><input type="number" class="quantite smallQty" min="1" value="1" /></td>
      <td><button type="button" class="no-pdf" onclick="removeAttributionRow(this)">❌</button></td>
    `;
  tbody.appendChild(tr);
}

async function removeAttributionRow(button) {
  const row = button.closest('tr');
  const confirmed = await showCustomConfirm("Êtes-vous sûr de vouloir supprimer cette ligne ?");
  if (confirmed) {
    row.remove();
  }
}

function updateAttrRow(select){
  const tr = select.closest("tr");
  const marque = tr.querySelector(".marque");
  const nom = tr.querySelector(".nom");
  const serie = tr.querySelector(".serie");
  const quantite = tr.querySelector(".quantite");

  const type = attributionTypes[select.value];
  if (!type) {
    if (marque) marque.disabled = nom.disabled = serie.disabled = quantite.disabled = true;
    return;
  }

  if (marque) { marque.disabled = !type.show.marque; if(!type.show.marque) marque.value = ''; }
  if (nom) { nom.disabled = !type.show.nom; if(!type.show.nom) nom.value = ''; }
  if (serie) { serie.disabled = !type.show.serie; if(!type.show.serie) serie.value = ''; }
  if (quantite) { quantite.disabled = !type.show.quantite; if(!type.show.quantite) quantite.value = ''; }
}

const btnAddAttr = document.getElementById("btnAddAttributionRow");
if (btnAddAttr) {
  btnAddAttr.onclick = addAttributionRow;
}

/* ========== Bloc Suivi (si le bouton existe) ========== */
const typesMateriel = ['Cles','Badge','LigneTel','Laptop','Moniteur','Tablette','Accessoire','Autres'];
const materielFields = [
  { key: 'type', label: 'Type de matériel', type: 'select', options: typesMateriel },
  { key: 'marque', label: 'Marque', type: 'text' },
  { key: 'nom', label: "Nom de l'ordinateur (si applicable)", type: 'text' },
  { key: 'serie', label: 'N° de série', type: 'text' },
  { key: 'etat', label: 'État', type: 'select', options: ['-- Sélectionner --','Bon','Moyen','Mauvais'] },
  { key: 'comment', label: 'Commentaire', type: 'textarea' }
];

let actionCounter = 0;
const actionsContainer = document.getElementById('actionsSuiviContainer');
const btnAddAction = document.getElementById('btnAddAction');

if (btnAddAction && actionsContainer) {
  btnAddAction.addEventListener('click', () => {
    const actionId = ++actionCounter;
    const actionBlock = createActionBlock(actionId);
    actionsContainer.appendChild(actionBlock);
    const firstInput = actionBlock.querySelector('select, input, textarea');
    if (firstInput) firstInput.focus();
  });
}

function createActionBlock(id) {
  const block = document.createElement('div');
  block.className = 'action-block';
  block.dataset.actionId = id;

  const header = document.createElement('div');
  header.className = 'action-header';

  const left = document.createElement('div');
  left.className = 'actions-left';

  const select = document.createElement('select');
  select.className = 'small';
  select.name = `action[${id}][type]`;
  select.innerHTML = `
      <option value="">-- Sélectionner l'action --</option>
      <option value="Ajout">Ajout</option>
      <option value="Changement">Changement</option>
      <option value="Retour">Retour matériel</option>
      <option value="Autre">Autre</option>
    `;
  left.appendChild(select);

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.name = `action[${id}][date]`;
  dateInput.className = 'small';
  dateInput.style.width = '150px';
  dateInput.title = 'Date de l\'action';
  left.appendChild(dateInput);

  header.appendChild(left);

  const btns = document.createElement('div');
  btns.style.display = 'flex';
  btns.style.gap = '8px';
  btns.style.alignItems = 'center';

  const btnDup = document.createElement('button');
  btnDup.type = 'button';
  btnDup.className = 'no-pdf small';
  btnDup.textContent = 'Dupliquer';
  btnDup.onclick = () => duplicateAction(block);
  btns.appendChild(btnDup);

  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.className = 'no-pdf small';
  btnRemove.textContent = 'Supprimer';
  btnRemove.onclick = () => block.remove();
  btns.appendChild(btnRemove);

  header.appendChild(btns);

  const content = document.createElement('div');
  content.className = 'action-content';

  const otherDesc = document.createElement('textarea');
  otherDesc.name = `action[${id}][otherDesc]`;
  otherDesc.placeholder = 'Description (si Autre)';
  otherDesc.style.display = 'none';

  const retourBlock = createMaterielSubBlock(id, 'retour');
  const nouveauBlock = createMaterielSubBlock(id, 'nouveau');
  const retourParActionBlock = createRetourParActionBlock(id);

  block.appendChild(header);
  block.appendChild(content);
  content.appendChild(otherDesc);

  select.addEventListener('change', (e) => {
    const val = e.target.value;
    [retourBlock, nouveauBlock, retourParActionBlock].forEach(sb => { if (sb.parentNode === content) content.removeChild(sb); });
    otherDesc.style.display = 'none';
    if (val === 'Ajout') content.appendChild(nouveauBlock);
    else if (val === 'Changement') { content.appendChild(retourBlock); content.appendChild(nouveauBlock); }
    else if (val === 'Retour') content.appendChild(retourParActionBlock);
    else if (val === 'Autre') otherDesc.style.display = 'block';
  });

  const moveControls = document.createElement('div');
  moveControls.style.marginTop = '8px';
  moveControls.className = 'no-pdf';
  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.textContent = '↑';
  upBtn.title = 'Déplacer vers le haut';
  upBtn.className = 'small';
  upBtn.onclick = () => {
    const prev = block.previousElementSibling;
    if (prev) block.parentNode.insertBefore(block, prev);
  };
  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.textContent = '↓';
  downBtn.title = 'Déplacer vers le bas';
  downBtn.className = 'small';
  downBtn.onclick = () => {
    const next = block.nextElementSibling;
    if (next) block.parentNode.insertBefore(next, block);
  };
  moveControls.appendChild(upBtn);
  moveControls.appendChild(downBtn);
  block.appendChild(moveControls);

  return block;
}

function duplicateAction(block) {
  const clone = block.cloneNode(true);
  const newId = ++actionCounter;
  clone.dataset.actionId = newId;
  clone.querySelectorAll('[name]').forEach(el => {
    const name = el.getAttribute('name') || '';
    const newName = name.replace(/action\[\d+\]/, `action[${newId}]`);
    el.setAttribute('name', newName);
  });
  // Supprimer le bouton Dupliquer du clone
  clone.querySelectorAll('button').forEach(btn => {
    if (btn.textContent === 'Dupliquer') btn.remove();
  });
  block.parentNode.insertBefore(clone, block.nextSibling);
}

function createMaterielSubBlock(actionId, role) {
  const container = document.createElement('div');
  container.className = 'sub-block';
  container.dataset.role = role;
  const title = document.createElement('strong');
  title.textContent = (role === 'retour') ? 'Matériel retourné' : 'Matériel reçu';
  container.appendChild(title);

  materielFields.forEach(field => {
    const fieldWrapper = document.createElement('div');
    fieldWrapper.style.marginTop = '8px';
    const label = document.createElement('label');
    label.textContent = field.label;
    fieldWrapper.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      input.name = `action[${actionId}][${role}][${field.key}]`;
      field.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        input.appendChild(o);
      });
    } else if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.name = `action[${actionId}][${role}][${field.key}]`;
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.name = `action[${actionId}][${role}][${field.key}]`;
    }
    fieldWrapper.appendChild(input);
    container.appendChild(fieldWrapper);
  });

  return container;
}

/* ========== Bloc Restitution ========== */
const returnConfig = {
  'Cles': { title: 'Clés du bureau', columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
  'Badge': { title: 'Badge d\'accès', columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
  'LigneTel': { title: 'Téléphone Cellulaire', columns:[{key:'Marque',label:'Marque',type:'text'},{key:'info',label:'N° de série',type:'text'}], defaultRow:{Marque:'', info:''}},
  'Laptop': { title: 'Ordinateur / Laptop', columns:[{key:'marque',label:'Marque',type:'text'},{key:'nom',label:"Nom de l'ordinateur",type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',nom:'',serie:''}},
  'Moniteur': { title: 'Moniteur', columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
  'Tablette': { title: 'Tablette', columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
  'Accessoire': { title: 'Accessoires', columns:[{key:'detail',label:'Précisez',type:'text'},{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{detail:'',marque:'',serie:''}},
  'Autres': { title: 'Autres', columns:[{key:'detail',label:'Veuillez préciser',type:'text'}], defaultRow:{detail:''}},
};

/* ========== Restitution PAR ACTION (Bloc 3 complet) ========== */
function createRetourParActionBlock(actionId) {
  const container = document.createElement('div');
  container.className = 'sub-block restitution-block';
  container.style.cssText = 'margin-top:12px;padding:15px;background:#fef9f0;border-radius:8px;border:2px solid #e74c3c;';

  const title = document.createElement('h4');
  title.textContent = 'Restitution du Matériel';
  title.style.cssText = 'margin:0 0 15px 0;color:#c0392b;border-bottom:2px solid #e74c3c;padding-bottom:8px;';
  container.appendChild(title);

  const labelCb = document.createElement('label');
  labelCb.textContent = 'Matériel restitué (Sélectionnez tous les matériels correspondants)';
  labelCb.style.cssText = 'font-weight:bold;display:block;margin-bottom:10px;';
  container.appendChild(labelCb);

  const checkboxesDiv = document.createElement('div');
  checkboxesDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;';

  const types = [
    { type: 'Cles', label: 'Clés du bureau' },
    { type: 'Badge', label: 'Badge d\'accès' },
    { type: 'LigneTel', label: 'Téléphone Cellulaire' },
    { type: 'Laptop', label: 'Ordinateur / Laptop' },
    { type: 'Moniteur', label: 'Moniteur' },
    { type: 'Tablette', label: 'Tablette' },
    { type: 'Accessoire', label: 'Accessoires' },
    { type: 'Autres', label: 'Autres' }
  ];

  const tablesContainer = document.createElement('div');
  tablesContainer.className = 'restitution-tables';

  types.forEach(t => {
    const lbl = document.createElement('label');
    lbl.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:6px 10px;background:#fff;border:1px solid #ccc;border-radius:5px;cursor:pointer;';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.type = t.type;
    cb.dataset.actionId = actionId;
    cb.onchange = function () {
      toggleRestitutionTable(this, tablesContainer, actionId);
    };
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(t.label));
    checkboxesDiv.appendChild(lbl);
  });

  container.appendChild(checkboxesDiv);
  container.appendChild(tablesContainer);

  // Motif
  const motifDiv = document.createElement('div');
  motifDiv.style.marginTop = '15px';
  motifDiv.innerHTML = '<label style="font-weight:bold;">Motif de restitution :</label>';
  const motifSelect = document.createElement('select');
  motifSelect.innerHTML = '<option value="">-- Sélectionner --</option><option value="Réparation">Réparation</option><option value="Changement">Changement</option><option value="Départ">Départ</option><option value="Autres">Autres</option>';
  motifDiv.appendChild(motifSelect);
  container.appendChild(motifDiv);

  const autresDiv = document.createElement('div');
  autresDiv.style.cssText = 'display:none;margin-top:8px;';
  autresDiv.innerHTML = '<label>Veuillez préciser :</label><input type="text" style="width:100%;">';
  container.appendChild(autresDiv);

  const dateDiv = document.createElement('div');
  dateDiv.style.cssText = 'display:none;margin-top:8px;';
  dateDiv.innerHTML = '<label>Date de départ :</label><input type="date">';
  container.appendChild(dateDiv);

  motifSelect.onchange = function () {
    dateDiv.style.display = this.value === 'Départ' ? 'block' : 'none';
    autresDiv.style.display = this.value === 'Autres' ? 'block' : 'none';
  };

  // Déclaration
  const declDiv = document.createElement('div');
  declDiv.style.marginTop = '15px';
  declDiv.innerHTML = '<label style="font-weight:bold;">Déclaration de l\'employé</label><textarea readonly style="width:100%;min-height:60px;background:#f5f5f5;">L\'employé déclare avoir restitué tout matériel appartenant au CDÉNÉ et avoir complété la passation de consignes.</textarea>';
  container.appendChild(declDiv);

  // Réserves
  const resDiv = document.createElement('div');
  resDiv.style.marginTop = '12px';
  resDiv.innerHTML = '<label style="font-weight:bold;">Réserves éventuelles</label><textarea style="width:100%;min-height:80px;" placeholder="Entrez vos réserves éventuelles ici..."></textarea>';
  container.appendChild(resDiv);

  // Date restitution
  const dateRestDiv = document.createElement('div');
  dateRestDiv.style.marginTop = '12px';
  dateRestDiv.innerHTML = '<label style="font-weight:bold;">Date de restitution</label><input type="date" style="width:100%;">';
  container.appendChild(dateRestDiv);

  // Signatures
  const sigDiv = document.createElement('div');
  sigDiv.className = 'two-col';
  sigDiv.style.marginTop = '12px';
  sigDiv.innerHTML = '<div><label style="font-weight:bold;">Signature de l\'employé</label><input type="text"></div><div><label style="font-weight:bold;">Signature du gestionnaire</label><input type="text"></div>';
  container.appendChild(sigDiv);

  return container;
}

function toggleRestitutionTable(checkbox, container, actionId) {
  const type = checkbox.dataset.type;
  const tableId = `restTable-${actionId}-${type}`;

  if (checkbox.checked) {
    if (!document.getElementById(tableId)) {
      const table = createRestitutionTable(type, actionId);
      table.id = tableId;
      container.appendChild(table);
    }
  } else {
    const el = document.getElementById(tableId);
    if (el) el.remove();
  }
}

function createRestitutionTable(type, actionId) {
  const cfg = returnConfig[type];
  const wrap = document.createElement('div');
  wrap.style.cssText = 'margin:10px 0;padding:10px;border:1px solid #7a9ab8;border-radius:8px;background:#eef6fb;';

  const hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
  hdr.innerHTML = `<strong>${cfg.title}</strong>`;

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = 'Ajouter';
  addBtn.className = 'no-pdf';
  addBtn.onclick = () => addRestitutionRow(type, actionId);
  hdr.appendChild(addBtn);
  wrap.appendChild(hdr);

  const table = document.createElement('table');
  table.style.cssText = 'width:100%;border-collapse:collapse;margin-top:10px;';

  let thHtml = '<tr>';
  cfg.columns.forEach(c => {
    thHtml += `<th style="text-align:left;padding:6px;border-bottom:2px solid #b8d5e8;">${c.label}</th>`;
  });
  thHtml += '<th style="width:80px;"></th></tr>';
  table.innerHTML = `<thead>${thHtml}</thead><tbody></tbody>`;
  wrap.appendChild(table);

  addRestitutionRow(type, actionId);
  return wrap;
}

function addRestitutionRow(type, actionId) {
  const cfg = returnConfig[type];
  const tableId = `restTable-${actionId}-${type}`;
  const wrap = document.getElementById(tableId);
  if (!wrap) return;

  const tbody = wrap.querySelector('tbody');
  const tr = document.createElement('tr');
  tr.style.borderBottom = '1px solid #e0eef7';

  cfg.columns.forEach(() => {
    const td = document.createElement('td');
    td.style.padding = '6px';
    td.innerHTML = '<input type="text" style="width:100%;padding:6px;border:1px solid #9fb7cc;border-radius:6px;">';
    tr.appendChild(td);
  });

  const tdDel = document.createElement('td');
  tdDel.style.padding = '6px';
  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.textContent = 'Supprimer';
  delBtn.className = 'no-pdf';
  delBtn.onclick = () => tr.remove();
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  tbody.appendChild(tr);
}

/* ========== Restitution statique (si présent dans HTML) ========== */
function handleReturnToggle(checkbox) {
  const type = checkbox.dataset.type;
  if (checkbox.checked) {
    if (!document.querySelector(`#returnTableBlock-${type}`)) {
      const block = createReturnTable(type);
      const labels = Array.from(document.querySelectorAll('#returnMaterialCheckboxes label'));
      const after = labels.find(l => l.querySelector(`input[data-type="${type}"]`));
      if (after && after.parentNode) after.parentNode.insertBefore(block, after.nextSibling);
      else {
        const container = document.getElementById('returnTablesContainer');
        if (container) container.appendChild(block);
      }
    }
  } else {
    const b = document.querySelector(`#returnTableBlock-${type}`);
    if (b) b.remove();
  }
}

function createReturnTable(type) {
  const cfg = returnConfig[type];
  const wrap = document.createElement('div');
  wrap.id = `returnTableBlock-${type}`;
  wrap.className = 'material-table-block';
  wrap.style.margin = '10px 0 18px 0';
  wrap.style.padding = '10px';
  wrap.style.border = '1px solid #7a9ab8';
  wrap.style.borderRadius = '8px';
  wrap.style.background = '#eef6fb';

  const header = document.createElement('div');
  header.style.display='flex';
  header.style.justifyContent='space-between';
  header.style.alignItems='center';

  const t = document.createElement('strong');
  t.textContent = (returnConfig[type].title || type);
  header.appendChild(t);

  const controls = document.createElement('div');
  controls.className = 'controls';

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '➕ Ajouter';
  addBtn.style.marginRight = '8px';
  addBtn.classList.add('no-pdf');
  addBtn.onclick = () => addReturnRow(type);
  controls.appendChild(addBtn);

  const removeBlockBtn = document.createElement('button');
  removeBlockBtn.type = 'button';
  removeBlockBtn.textContent = '❌';
  removeBlockBtn.classList.add('no-pdf');
  removeBlockBtn.onclick = () => {
    const cb = document.querySelector(`#returnMaterialCheckboxes input[data-type="${type}"]`);
    if (cb) { cb.checked = false; }
    wrap.remove();
  };
  controls.appendChild(removeBlockBtn);

  header.appendChild(controls);
  wrap.appendChild(header);

  const table = document.createElement('table');
  table.style.width='100%';
  table.style.borderCollapse='collapse';
  table.style.marginTop='10px';
  table.dataset.type = type;

  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  cfg.columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.label;
    th.style.borderBottom='2px solid #b8d5e8';
    th.style.padding='6px';
    trh.appendChild(th);
  });
  const thd = document.createElement('th'); thd.style.width='60px'; trh.appendChild(thd);
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  wrap.appendChild(table);

  addReturnRow(type);
  return wrap;
}

function addReturnRow(type) {
  const cfg = returnConfig[type];
  const block = document.querySelector(`#returnTableBlock-${type}`);
  if (!block) return;
  const table = block.querySelector('table');
  const tbody = table.querySelector('tbody');

  const tr = document.createElement('tr');
  tr.style.borderBottom='1px solid #e0eef7';

  cfg.columns.forEach(col => {
    const td = document.createElement('td');
    td.style.padding='6px';
    const input = document.createElement('input');
    input.type='text';
    input.name=`restitution[${type}][][${col.key}]`;
    input.value=cfg.defaultRow[col.key] || '';
    input.style.width='100%';
    input.style.boxSizing='border-box';
    input.style.padding='6px';
    input.style.border='1px solid #9fb7cc';
    input.style.borderRadius='6px';
    td.appendChild(input);
    tr.appendChild(td);
  });

  const tdDel = document.createElement('td');
  tdDel.style.padding='6px';
  const delBtn = document.createElement('button');
  delBtn.type='button';
  delBtn.textContent='Supprimer';
  delBtn.classList.add('no-pdf');
  delBtn.onclick = () => tr.remove();
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  tbody.appendChild(tr);
}

function toggleDepartDateReturn() {
  const motif = document.getElementById('motifRestitution');
  if (!motif) return;

  const dateDepartBlock = document.getElementById('dateDepartBlock');
  const dernierBlock = document.getElementById('dernierJourBlock');
  if (motif.value === 'Départ') {
    if (dernierBlock) dernierBlock.style.display = 'block';
    if (dateDepartBlock) dateDepartBlock.style.display = 'block';
  } else {
    if (dernierBlock) dernierBlock.style.display = 'none';
    if (dateDepartBlock) dateDepartBlock.style.display = 'none';
    const dj = document.getElementById('dernierJour'); if (dj) dj.value = '';
    const dd = document.getElementById('dateDepart'); if (dd) dd.value = '';
  }
}

// Auto-ajustement des textareas à la hauteur du contenu
function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  const scrollHeight = textarea.scrollHeight;
  const newHeight = Math.max(60, Math.min(scrollHeight, 400));
  textarea.style.height = newHeight + 'px';
}

// Fonction globale pour redimensionner tous les textareas
function resizeAllTextareas() {
  document.querySelectorAll('textarea').forEach(ta => {
    autoResizeTextarea(ta);
  });
}

// Événement input pour le redimensionnement en temps réel
document.addEventListener('input', (e) => {
  if (e.target && e.target.tagName === 'TEXTAREA') {
    autoResizeTextarea(e.target);
  }
});

// Observer pour détecter les nouveaux textareas ajoutés dynamiquement
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.tagName === 'TEXTAREA') {
            setTimeout(() => autoResizeTextarea(node), 10);
            node.addEventListener('input', () => autoResizeTextarea(node));
          } else if (node.querySelectorAll) {
            const textareas = node.querySelectorAll('textarea');
            if (textareas.length > 0) {
              textareas.forEach(ta => {
                setTimeout(() => autoResizeTextarea(ta), 10);
                ta.addEventListener('input', () => autoResizeTextarea(ta));
              });
            }
          }
        }
      });
    }
  });
});

// Initialiser l'observateur au chargement du DOM
function initTextareaObserver() {
  const form = document.querySelector('form') || document.body;
  mutationObserver.observe(form, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false
  });
  
  resizeAllTextareas();
  document.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', () => autoResizeTextarea(ta));
    ta.addEventListener('change', () => autoResizeTextarea(ta));
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTextareaObserver);
} else {
  initTextareaObserver();
}

/* ========== PDF - FIT SUR UNE PAGE ========== */
const btnPDF = document.getElementById('btnDownloadPDF');
if (btnPDF) {
  btnPDF.addEventListener('click', genererPDFGlobal);
}

async function genererPDFGlobal() {
  try { // Début obligatoire pour correspondre au catch de la fin
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 10;

    // Fonction interne pour capturer un élément
    async function captureElementToCanvas(element) {
      const noPdfElements = element.querySelectorAll(".no-pdf");
      const selects = element.querySelectorAll("select");
      const textareas = element.querySelectorAll("textarea");

      noPdfElements.forEach(el => el.style.display = 'none');

      const selectReplacements = [];
      selects.forEach(sel => {
        const span = document.createElement("span");
        span.textContent = sel.options[sel.selectedIndex]?.text || "";
        span.style.display = "inline-block";
        span.style.minWidth = sel.offsetWidth + "px";
        span.style.fontWeight = "600";
        sel.parentNode.insertBefore(span, sel);
        sel.style.display = 'none';
        selectReplacements.push({ original: sel, replacement: span });
      });

      const textareaReplacements = [];
      textareas.forEach(textarea => {
        const div = document.createElement("div");
        div.innerHTML = textarea.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        div.style.border = '1px solid #888';
        div.style.borderRadius = '6px';
        div.style.padding = '8px';
        div.style.width = (textarea.offsetWidth - 16) + 'px';
        div.style.minHeight = Math.max(textarea.scrollHeight, 60) + 'px';
        div.style.display = 'block';
        textarea.parentNode.insertBefore(div, textarea);
        textarea.style.display = 'none';
        textareaReplacements.push({ original: textarea, replacement: div });
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#c9d9e8'
      });

      // Remise en état de l'interface
      noPdfElements.forEach(el => el.style.display = '');
      selectReplacements.forEach(({original, replacement}) => {
        original.style.display = '';
        replacement.remove();
      });
      textareaReplacements.forEach(({original, replacement}) => {
        original.style.display = '';
        replacement.remove();
      });

      return canvas;
    }

    const element = document.getElementById('formMateriel') || 
                    document.getElementById('blocAttribution') || 
                    document.querySelector('.bloc-formulaire');

    if (!element) {
      await showCustomAlert('Erreur: Aucun formulaire trouvé.');
      return;
    }

    const canvas = await captureElementToCanvas(element);
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    let imgWidth = usableWidth;
    let imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > usableHeight) {
      const scaleFactor = usableHeight / imgHeight;
      imgHeight = usableHeight;
      imgWidth = imgWidth * scaleFactor;
    }

    const xOffset = margin + (usableWidth - imgWidth) / 2;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, margin, imgWidth, imgHeight);
    pdf.save('Formulaire_CDENE.pdf');

  } catch (error) {
    console.error('Erreur PDF:', error);
    await showCustomAlert('Une erreur est survenue lors de la génération du PDF: ' + error.message);
  }
}


/* ========== Fonction pour envoyer le PDF par email ========== */
async function envoyerParEmail() {
  try {
    const email = document.getElementById('courrielSuivi')?.value || '';
    const nomEmployee = document.getElementById('nomAttribution')?.value || 'Attribution Matériel';

    if (!email) {
      await showCustomAlert('Veuillez remplir le champ email avant d\'envoyer.');
      return;
    }

    if (!email.includes('@')) {
      await showCustomAlert('Veuillez entrer une adresse email valide.');
      return;
    }

    await showCustomAlert('Génération du PDF en cours...');

    if (!window.html2canvas) {
      await showCustomAlert('Erreur: html2canvas n\'est pas chargé.');
      return;
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      await showCustomAlert('Erreur: jsPDF n\'est pas chargé.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 10;

    async function captureElementToCanvas(element) {
      const noPdfElements = element.querySelectorAll(".no-pdf");
      const selects = element.querySelectorAll("select");
      const textareas = element.querySelectorAll("textarea");

      noPdfElements.forEach(el => el.style.display = 'none');

      const selectReplacements = [];
      selects.forEach(sel => {
        const span = document.createElement("span");
        span.textContent = sel.options[sel.selectedIndex]?.text || "";
        span.style.display = "inline-block";
        span.style.minWidth = sel.offsetWidth + "px";
        span.style.fontSize = "16px";
        span.style.fontWeight = "600";
        sel.parentNode.insertBefore(span, sel);
        sel.style.display = 'none';
        selectReplacements.push({ original: sel, replacement: span });
      });

      const textareaReplacements = [];
      textareas.forEach(textarea => {
        const div = document.createElement("div");
        div.innerHTML = textarea.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        div.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        div.style.fontSize = '16px';
        div.style.lineHeight = '1.6';
        div.style.whiteSpace = 'pre-wrap';
        div.style.padding = '8px';
        div.style.border = '1px solid #888';
        div.style.borderRadius = '6px';
        div.style.background = '#fff';
        div.style.width = (textarea.offsetWidth - 16) + 'px';
        div.style.minHeight = Math.max(textarea.scrollHeight, 60) + 'px';

        textarea.parentNode.insertBefore(div, textarea);
        textarea.style.display = 'none';
        textareaReplacements.push({ original: textarea, replacement: div });
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#c9d9e8',
        logging: false,
        windowHeight: element.scrollHeight + 100
      });

      noPdfElements.forEach(el => el.style.display = '');
      selectReplacements.forEach(({ original, replacement }) => {
        original.style.display = '';
        replacement.remove();
      });
      textareaReplacements.forEach(({ original, replacement }) => {
        original.style.display = '';
        replacement.remove();
      });

      return canvas;
    }

    const blocAttribution = document.getElementById('blocAttribution');
    if (blocAttribution) {
      const canvas = await captureElementToCanvas(blocAttribution);

      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      let imgWidth = usableWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > usableHeight) {
        const scaleFactor = usableHeight / imgHeight;
        imgHeight = usableHeight;
        imgWidth = imgWidth * scaleFactor;
      }

      const xOffset = margin + (usableWidth - imgWidth) / 2;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, margin, imgWidth, imgHeight);
    }

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = 'Attribution_CDENE_' + new Date().toISOString().split('T')[0] + '.pdf';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(pdfUrl);

    await showCustomAlert('✅ Formulaire téléchargé avec succès!\n\nVeuillez l\'envoyer à:\n' + email + '\n\nNote: Le fichier a été téléchargé automatiquement.');

  } catch (error) {
    console.error('Erreur:', error);
    await showCustomAlert('❌ Une erreur est survenue:\n' + error.message);
  }
}

const btnSendEmail = document.getElementById('btnSendEmail');
if (btnSendEmail) {
  btnSendEmail.addEventListener('click', envoyerParEmail);
}
