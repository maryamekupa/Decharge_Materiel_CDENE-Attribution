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

/* ========== Restitution PAR ACTION (AJOUT) ========== */
function createRetourParActionBlock(actionId) {
  const wrap = document.createElement('div');
  wrap.className = 'sub-block';
  wrap.style.marginTop = '10px';

  const title = document.createElement('strong');
  title.textContent = 'Matériel retourné';
  wrap.appendChild(title);

  Object.entries(returnConfig).forEach(([type, cfg]) => {
    const line = document.createElement('div');
    line.style.marginTop = '6px';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.dataset.type = type;

    const lbl = document.createElement('label');
    lbl.style.marginLeft = '6px';
    lbl.textContent = cfg.title || type;

    cb.addEventListener('change', () => {
      const id = `action-${actionId}-return-${type}`;
      if (cb.checked) {
        if (!wrap.querySelector(`#${id}`)) {
          const table = createReturnTable(type);
          table.id = id;
          wrap.appendChild(table);
        }
      } else {
        wrap.querySelector(`#${id}`)?.remove();
      }
    });

    line.appendChild(cb);
    line.appendChild(lbl);
    wrap.appendChild(line);
  });

  return wrap;
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
  let hasNewTextarea = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Node.ELEMENT_NODE
          if (node.tagName === 'TEXTAREA') {
            hasNewTextarea = true;
            setTimeout(() => autoResizeTextarea(node), 10);
            node.addEventListener('input', () => autoResizeTextarea(node));
          } else if (node.querySelectorAll) {
            const textareas = node.querySelectorAll('textarea');
            if (textareas.length > 0) {
              hasNewTextarea = true;
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
  
  // Redimensionner tous les textareas existants
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

const btnPDF = document.getElementById('btnDownloadPDF');
if (btnPDF) {
  btnPDF.addEventListener('click', genererPDFGlobal);
}


//Generate pdf global/////////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////////////
//Generate pdf global////////////////////////////////
async function genererPDFGlobal() {
  try {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('formMateriel');
    if (!element) return;

    // --- 1. PRÉPARATION DES STYLES (ÉCRAN -> CAPTURE) ---
    const originalStyle = element.style.cssText;
    
    // On uniformise le fond et on protège le contour vert
    element.style.boxShadow = 'none'; 
    element.style.margin = '0';
    element.style.padding = '20px'; 
    element.style.width = '1000px'; 
    element.style.backgroundColor = '#c9d9e8'; // Même couleur que le formulaire

    // --- 2. TRANSFORMATION DU TEXTAREA EN "FICHE" ---
    // On cible le champ Réserves pour qu'il s'affiche en entier comme du texte simple
    const reserveTextarea = document.querySelector('textarea');
    let tempDiv = null;

    if (reserveTextarea) {
        tempDiv = document.createElement('div');
        tempDiv.innerText = reserveTextarea.value || reserveTextarea.placeholder;
        
        // On copie le style pour que ça ressemble au bloc "Déclaration de l'employé"
        tempDiv.style.width = reserveTextarea.offsetWidth + 'px';
        tempDiv.style.fontSize = window.getComputedStyle(reserveTextarea).fontSize;
        tempDiv.style.fontFamily = window.getComputedStyle(reserveTextarea).fontFamily;
        tempDiv.style.color = "#222";
        tempDiv.style.whiteSpace = "pre-wrap"; // Important pour voir toutes les lignes
        tempDiv.style.background = "transparent";
        tempDiv.style.border = "none";
        tempDiv.style.padding = "0";
        tempDiv.style.marginBottom = "20px";

        // On masque le champ blanc et on insère le texte pur
        reserveTextarea.style.display = 'none';
        reserveTextarea.parentNode.insertBefore(tempDiv, reserveTextarea);
    }

    // --- 3. CAPTURE HAUTE DÉFINITION ---
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#c9d9e8', // Remplit les bords extérieurs avec votre couleur
      logging: false
    });

    // --- 4. RESTAURATION DE L'INTERFACE UTILISATEUR ---
    element.style.cssText = originalStyle;
    if (reserveTextarea && tempDiv) {
        reserveTextarea.style.display = 'block';
        tempDiv.remove();
    }

    // --- 5. CRÉATION DU PDF ---
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = 595.28; // Largeur A4
    const margin = 15; // Marge de sécurité pour ne pas couper le cadre vert
    const usableWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    // On crée le PDF (la hauteur s'adapte au contenu pour ne rien couper)
    const pdf = new jsPDF('p', 'pt', [pdfWidth, imgHeight + (margin * 2)]);

    // On peint tout le fond du PDF avec votre couleur bleu-gris
    // (RGB pour #c9d9e8 est environ 201, 217, 232)
    pdf.setFillColor(201, 217, 232); 
    pdf.rect(0, 0, pdfWidth, pdf.internal.pageSize.getHeight(), 'F');

    // On pose l'image centrée (X=15, Y=15)
    pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
    
    pdf.save('Formulaire_CDENE_vrf.pdf');

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert("Une erreur est survenue lors de la création du PDF.");
  }
}
// Ajouter l'écouteur pour le bouton Envoyer par Email
const btnSendEmail = document.getElementById('btnSendEmail');
if (btnSendEmail) {
  btnSendEmail.addEventListener('click', envoyerParEmail);
}


