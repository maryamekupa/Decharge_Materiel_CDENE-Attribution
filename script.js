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

  block.appendChild(header);
  block.appendChild(content);
  content.appendChild(otherDesc);

  select.addEventListener('change', (e) => {
    const val = e.target.value;
    [retourBlock, nouveauBlock].forEach(sb => { if (sb.parentNode === content) content.removeChild(sb); });
    otherDesc.style.display = 'none';
    if (val === 'Ajout') content.appendChild(nouveauBlock);
    else if (val === 'Changement') { content.appendChild(retourBlock); content.appendChild(nouveauBlock); }
    else if (val === 'Retour') content.appendChild(retourBlock);
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
  clone.querySelectorAll('button').forEach(b => { if (!b.classList.contains('no-pdf')) b.classList.add('no-pdf'); });
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
  'Cles': { columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
  'Badge': { columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
  'LigneTel': { columns:[{key:'Marque',label:'Marque',type:'text'},{key:'info',label:'N° de série',type:'text'}], defaultRow:{Marque:'', info:''}},
  'Laptop': { columns:[{key:'marque',label:'Marque',type:'text'},{key:'nom',label:"Nom de l'ordinateur",type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',nom:'',serie:''}},
  'Moniteur': { columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
  'Tablette': { columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
  'Accessoire': { columns:[{key:'detail',label:'Précisez',type:'text'},{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{detail:'',marque:'',serie:''}},
  'Autres': { columns:[{key:'detail',label:'Veuillez préciser',type:'text'}], defaultRow:{detail:''}},
};

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

document.addEventListener('input', e=>{
  if(e.target && e.target.tagName==='TEXTAREA') {
    e.target.style.height='auto';
    e.target.style.height=(e.target.scrollHeight)+'px';
  }
});

const btnPDF = document.getElementById('btnDownloadPDF');
if (btnPDF) {
  btnPDF.addEventListener('click', genererPDFGlobal);
}

async function genererPDFGlobal() {
  try {
    if (!window.html2canvas) {
      await showCustomAlert('Erreur: html2canvas n\'est pas chargé.');
      return;
    }
    if (!window.jspdf || !window.jspdf.jsPDF) {
      await showCustomAlert('Erreur: jsPDF n\'est pas chargé.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p','pt','a4');
    const imgWidth = 595.28;
    const pageHeight = 841.89;
    const marginTop = 10;
    let yOffset = marginTop;

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
          span.style.minHeight = "20px";
          span.style.padding = "0";
          span.style.border = "none";
          span.style.background = "transparent";
          span.style.fontSize = "16px";
          span.style.lineHeight = "1.4";
          span.style.fontWeight = "600";
          sel.parentNode.insertBefore(span, sel);
          sel.style.display = 'none';
          selectReplacements.push({ original: sel, replacement: span });
      });

      const textareaReplacements = [];
      textareas.forEach(textarea => {
          const div = document.createElement("div");
          div.textContent = textarea.value;
          div.style.fontFamily = 'Segoe UI, Arial, sans-serif';
          div.style.fontSize = '16px';
          div.style.lineHeight = '1.6';
          div.style.whiteSpace = 'pre-wrap';
          div.style.wordWrap = 'break-word';
          div.style.padding = '0';
          div.style.margin = '0';
          div.style.border = 'none';
          div.style.background = 'transparent';
          div.style.width = textarea.offsetWidth + 'px';
          
          textarea.parentNode.insertBefore(div, textarea);
          textarea.style.display = 'none';
          textareaReplacements.push({ original: textarea, replacement: div });
      });

      const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#c9d9e8',
          logging: false
      });

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

    async function captureAndAdd(element, currentYOffset) {
      const canvas = await captureElementToCanvas(element);
      const imgHeightPt = (canvas.height * imgWidth) / canvas.width;
      if (currentYOffset + imgHeightPt <= pageHeight) {
        pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,currentYOffset,imgWidth,imgHeightPt);
        return currentYOffset + imgHeightPt + 10;
      } else {
        let srcY = 0;
        const pxPerPt = canvas.height/imgHeightPt;
        let yOffsetPt = currentYOffset;
        while (srcY < canvas.height) {
          const spacePt = pageHeight - yOffsetPt;
          const srcSliceH = Math.floor(spacePt * pxPerPt);
          const tmpCanvas = document.createElement('canvas');
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = Math.min(srcSliceH, canvas.height - srcY);
          const ctx = tmpCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, srcY, tmpCanvas.width, tmpCanvas.height, 0, 0, tmpCanvas.width, tmpCanvas.height);
          const dataUrl = tmpCanvas.toDataURL('image/png');
          const drawHeightPt = (tmpCanvas.height * imgWidth) / tmpCanvas.width;
          pdf.addImage(dataUrl,'PNG',0,yOffsetPt,imgWidth,drawHeightPt);
          srcY += tmpCanvas.height;
          if (srcY < canvas.height) {
            pdf.addPage();
            yOffsetPt = marginTop;
          } else {
            yOffsetPt += drawHeightPt + 10;
          }
        }
        return yOffsetPt;
      }
    }

   

    const blocAttribution = document.getElementById('blocAttribution');
    if(blocAttribution) {
        yOffset = await captureAndAdd(blocAttribution, yOffset);
        pdf.save('Attribution_CDENE.pdf');
        return;
    }

    const blocSuivi = document.getElementById('blocSuivi');
    if(blocSuivi) {
        yOffset = await captureAndAdd(blocSuivi, yOffset);
    }

    const blocRest = document.getElementById('blocDécharge');
    if(blocRest) {
        yOffset = await captureAndAdd(blocRest, yOffset);
    }

    pdf.save('Suivi_Restitution_CDENE.pdf');

  } catch (error) {
    console.log('Erreur PDF:', error);
    await showCustomAlert('Une erreur est survenue lors de la génération du PDF: ' + error.message);
  }
}
