+   1 /* ========== Modales personnalisées ========== */
+   2 function showCustomConfirm(message) {
+   3   return new Promise((resolve) => {
+   4     const overlay = document.createElement('div');
+   5     overlay.className = 'modal-overlay';
+   6     overlay.innerHTML = `
+   7       <div class="modal-content">
+   8         <div class="modal-message">${message}</div>
+   9         <div class="modal-buttons">
+  10           <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(false);">Annuler</button>
+  11           <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal-overlay').remove(); window._confirmResolve(true);">Confirmer</button>
+  12         </div>
+  13       </div>
+  14     `;
+  15     document.body.appendChild(overlay);
+  16     window._confirmResolve = resolve;
+  17   });
+  18 }
+  19 
+  20 function showCustomAlert(message) {
+  21   return new Promise((resolve) => {
+  22     const overlay = document.createElement('div');
+  23     overlay.className = 'modal-overlay';
+  24     overlay.innerHTML = `
+  25       <div class="modal-content">
+  26         <div class="modal-message">${message}</div>
+  27         <div class="modal-buttons">
+  28           <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal-overlay').remove(); window._alertResolve();">OK</button>
+  29         </div>
+  30       </div>
+  31     `;
+  32     document.body.appendChild(overlay);
+  33     window._alertResolve = resolve;
+  34   });
+  35 }
+  36 
+  37 /* ========== Attribution (si le bouton existe) ========== */
+  38 const attributionTypes = {
+  39   'Cles': { label:'Clés du bureau', show:{marque:false, nom:false, serie:false, quantite:true} },
+  40   'Badge': { label:'Badge d\'accès', show:{marque:false, nom:false, serie:false, quantite:true} },
+  41   'LigneTel': { label:'Téléphone Cellulaire', show:{marque:true, nom:false, serie:true, quantite:false} },
+  42   'Laptop': { label:'Ordinateur / Laptop', show:{marque:true, nom:true, serie:true, quantite:false} },
+  43   'Moniteur': { label:'Moniteur', show:{marque:true, nom:false, serie:true, quantite:false} },
+  44   'Tablette': { label:'Tablette', show:{marque:true, nom:false, serie:true, quantite:false} },
+  45   'Accessoire': { label:'Accessoires', show:{marque:true, nom:true, serie:true, quantite:false} },
+  46   'Autres': { label:'Autres', show:{marque:true, nom:true, serie:true, quantite:false} }
+  47 };
+  48 
+  49 let attrID = 0;
+  50 
+  51 function addAttributionRow() {
+  52   attrID++;
+  53   const tbody = document.getElementById("attributionTbody");
+  54   if (!tbody) return;
+  55 
+  56   const tr = document.createElement("tr");
+  57   tr.innerHTML = `
+  58     <td>
+  59       <select class="typeSelect" onchange="updateAttrRow(this)">
+  60         <option value="">--</option>
+  61         ${Object.entries(attributionTypes).map(([key, value]) => `<option value="${key}">${value.label}</option>`).join('')}
+  62       </select>
+  63     </td>
+  64     <td><input type="text" class="marque" placeholder="Marque" /></td>
+  65     <td><input type="text" class="nom" placeholder="Nom" /></td>
+  66     <td><input type="text" class="serie" placeholder="N° de série" /></td>
+  67     <td><input type="number" class="quantite smallQty" min="1" value="1" /></td>
+  68     <td><button type="button" class="no-pdf" onclick="removeAttributionRow(this)">❌</button></td>
+  69   `;
+  70   tbody.appendChild(tr);
+  71 }
+  72 
+  73 async function removeAttributionRow(button) {
+  74   const row = button.closest('tr');
+  75   const confirmed = await showCustomConfirm("Êtes-vous sûr de vouloir supprimer cette ligne ?");
+  76   if (confirmed) {
+  77     row.remove();
+  78   }
+  79 }
+  80 
+  81 function updateAttrRow(select){
+  82   const tr = select.closest("tr");
+  83   const marque = tr.querySelector(".marque");
+  84   const nom = tr.querySelector(".nom");
+  85   const serie = tr.querySelector(".serie");
+  86   const quantite = tr.querySelector(".quantite");
+  87 
+  88   const type = attributionTypes[select.value];
+  89   if (!type) {
+  90     if (marque) marque.disabled = nom.disabled = serie.disabled = quantite.disabled = true;
+  91     return;
+  92   }
+  93 
+  94   if (marque) { marque.disabled = !type.show.marque; if(!type.show.marque) marque.value = ''; }
+  95   if (nom) { nom.disabled = !type.show.nom; if(!type.show.nom) nom.value = ''; }
+  96   if (serie) { serie.disabled = !type.show.serie; if(!type.show.serie) serie.value = ''; }
+  97   if (quantite) { quantite.disabled = !type.show.quantite; if(!type.show.quantite) quantite.value = ''; }
+  98 }
+  99 
+ 100 const btnAddAttr = document.getElementById("btnAddAttributionRow");
+ 101 if (btnAddAttr) {
+ 102   btnAddAttr.onclick = addAttributionRow;
+ 103 }
+ 104 
+ 105 /* ========== Bloc Suivi (si le bouton existe) ========== */
+ 106 const typesMateriel = ['Cles','Badge','LigneTel','Laptop','Moniteur','Tablette','Accessoire','Autres'];
+ 107 const materielFields = [
+ 108   { key: 'type', label: 'Type de matériel', type: 'select', options: typesMateriel },
+ 109   { key: 'marque', label: 'Marque', type: 'text' },
+ 110   { key: 'nom', label: "Nom de l'ordinateur (si applicable)", type: 'text' },
+ 111   { key: 'serie', label: 'N° de série', type: 'text' },
+ 112   { key: 'etat', label: 'État', type: 'select', options: ['-- Sélectionner --','Bon','Moyen','Mauvais'] },
+ 113   { key: 'comment', label: 'Commentaire', type: 'textarea' }
+ 114 ];
+ 115 
+ 116 let actionCounter = 0;
+ 117 const actionsContainer = document.getElementById('actionsSuiviContainer');
+ 118 const btnAddAction = document.getElementById('btnAddAction');
+ 119 
+ 120 if (btnAddAction && actionsContainer) {
+ 121   btnAddAction.addEventListener('click', () => {
+ 122     const actionId = ++actionCounter;
+ 123     const actionBlock = createActionBlock(actionId);
+ 124     actionsContainer.appendChild(actionBlock);
+ 125     const firstInput = actionBlock.querySelector('select, input, textarea');
+ 126     if (firstInput) firstInput.focus();
+ 127   });
+ 128 }
+ 129 
+ 130 function createActionBlock(id) {
+ 131   const block = document.createElement('div');
+ 132   block.className = 'action-block';
+ 133   block.dataset.actionId = id;
+ 134 
+ 135   const header = document.createElement('div');
+ 136   header.className = 'action-header';
+ 137 
+ 138   const left = document.createElement('div');
+ 139   left.className = 'actions-left';
+ 140 
+ 141   const select = document.createElement('select');
+ 142   select.className = 'small';
+ 143   select.name = `action[${id}][type]`;
+ 144   select.innerHTML = `
+ 145     <option value="">-- Sélectionner l'action --</option>
+ 146     <option value="Ajout">Ajout</option>
+ 147     <option value="Changement">Changement</option>
+ 148     <option value="Retour">Retour matériel</option>
+ 149     <option value="Autre">Autre</option>
+ 150   `;
+ 151   left.appendChild(select);
+ 152 
+ 153   const dateInput = document.createElement('input');
+ 154   dateInput.type = 'date';
+ 155   dateInput.name = `action[${id}][date]`;
+ 156   dateInput.className = 'small';
+ 157   dateInput.style.width = '150px';
+ 158   dateInput.title = 'Date de l\'action';
+ 159   left.appendChild(dateInput);
+ 160 
+ 161   header.appendChild(left);
+ 162 
+ 163   const btns = document.createElement('div');
+ 164   btns.style.display = 'flex';
+ 165   btns.style.gap = '8px';
+ 166   btns.style.alignItems = 'center';
+ 167 
+ 168   const btnDup = document.createElement('button');
+ 169   btnDup.type = 'button';
+ 170   btnDup.className = 'no-pdf small';
+ 171   btnDup.textContent = 'Dupliquer';
+ 172   btnDup.onclick = () => duplicateAction(block);
+ 173   btns.appendChild(btnDup);
+ 174 
+ 175   const btnRemove = document.createElement('button');
+ 176   btnRemove.type = 'button';
+ 177   btnRemove.className = 'no-pdf small';
+ 178   btnRemove.textContent = 'Supprimer';
+ 179   btnRemove.onclick = () => block.remove();
+ 180   btns.appendChild(btnRemove);
+ 181 
+ 182   header.appendChild(btns);
+ 183 
+ 184   const content = document.createElement('div');
+ 185   content.className = 'action-content';
+ 186 
+ 187   const otherDesc = document.createElement('textarea');
+ 188   otherDesc.name = `action[${id}][otherDesc]`;
+ 189   otherDesc.placeholder = 'Description (si Autre)';
+ 190   otherDesc.style.display = 'none';
+ 191 
+ 192   const retourBlock = createMaterielSubBlock(id, 'retour');
+ 193   const nouveauBlock = createMaterielSubBlock(id, 'nouveau');
+ 194   const retourParActionBlock = createRetourParActionBlock(id);
+ 195 
+ 196   block.appendChild(header);
+ 197   block.appendChild(content);
+ 198   content.appendChild(otherDesc);
+ 199 
+ 200   select.addEventListener('change', (e) => {
+ 201     const val = e.target.value;
+ 202     [retourBlock, nouveauBlock, retourParActionBlock].forEach(sb => { if (sb.parentNode === content) content.removeChild(sb); });
+ 203     otherDesc.style.display = 'none';
+ 204     if (val === 'Ajout') content.appendChild(nouveauBlock);
+ 205     else if (val === 'Changement') { content.appendChild(retourBlock); content.appendChild(nouveauBlock); }
+ 206     else if (val === 'Retour') content.appendChild(retourParActionBlock);
+ 207     else if (val === 'Autre') otherDesc.style.display = 'block';
+ 208   });
+ 209 
+ 210   const moveControls = document.createElement('div');
+ 211   moveControls.style.marginTop = '8px';
+ 212   moveControls.className = 'no-pdf';
+ 213   const upBtn = document.createElement('button');
+ 214   upBtn.type = 'button';
+ 215   upBtn.textContent = '↑';
+ 216   upBtn.title = 'Déplacer vers le haut';
+ 217   upBtn.className = 'small';
+ 218   upBtn.onclick = () => {
+ 219     const prev = block.previousElementSibling;
+ 220     if (prev) block.parentNode.insertBefore(block, prev);
+ 221   };
+ 222   const downBtn = document.createElement('button');
+ 223   downBtn.type = 'button';
+ 224   downBtn.textContent = '↓';
+ 225   downBtn.title = 'Déplacer vers le bas';
+ 226   downBtn.className = 'small';
+ 227   downBtn.onclick = () => {
+ 228     const next = block.nextElementSibling;
+ 229     if (next) block.parentNode.insertBefore(next, block);
+ 230   };
+ 231   moveControls.appendChild(upBtn);
+ 232   moveControls.appendChild(downBtn);
+ 233   block.appendChild(moveControls);
+ 234 
+ 235   return block;
+ 236 }
+ 237 
+ 238 function duplicateAction(block) {
+ 239   const clone = block.cloneNode(true);
+ 240   const newId = ++actionCounter;
+ 241   clone.dataset.actionId = newId;
+ 242   clone.querySelectorAll('[name]').forEach(el => {
+ 243     const name = el.getAttribute('name') || '';
+ 244     const newName = name.replace(/action\[\d+\]/, `action[${newId}]`);
+ 245     el.setAttribute('name', newName);
+ 246   });
+ 247   // Supprimer le bouton Dupliquer du clone
+ 248   clone.querySelectorAll('button').forEach(btn => {
+ 249     if (btn.textContent === 'Dupliquer') btn.remove();
+ 250   });
+ 251   block.parentNode.insertBefore(clone, block.nextSibling);
+ 252 }
+ 253 
+ 254 function createMaterielSubBlock(actionId, role) {
+ 255   const container = document.createElement('div');
+ 256   container.className = 'sub-block';
+ 257   container.dataset.role = role;
+ 258   const title = document.createElement('strong');
+ 259   title.textContent = (role === 'retour') ? 'Matériel retourné' : 'Matériel reçu';
+ 260   container.appendChild(title);
+ 261 
+ 262   materielFields.forEach(field => {
+ 263     const fieldWrapper = document.createElement('div');
+ 264     fieldWrapper.style.marginTop = '8px';
+ 265     const label = document.createElement('label');
+ 266     label.textContent = field.label;
+ 267     fieldWrapper.appendChild(label);
+ 268 
+ 269     let input;
+ 270     if (field.type === 'select') {
+ 271       input = document.createElement('select');
+ 272       input.name = `action[${actionId}][${role}][${field.key}]`;
+ 273       field.options.forEach(opt => {
+ 274         const o = document.createElement('option');
+ 275         o.value = opt;
+ 276         o.textContent = opt;
+ 277         input.appendChild(o);
+ 278       });
+ 279     } else if (field.type === 'textarea') {
+ 280       input = document.createElement('textarea');
+ 281       input.name = `action[${actionId}][${role}][${field.key}]`;
+ 282     } else {
+ 283       input = document.createElement('input');
+ 284       input.type = 'text';
+ 285       input.name = `action[${actionId}][${role}][${field.key}]`;
+ 286     }
+ 287     fieldWrapper.appendChild(input);
+ 288     container.appendChild(fieldWrapper);
+ 289   });
+ 290 
+ 291   return container;
+ 292 }
+ 293 
+ 294 /* ========== Bloc Restitution ========== */
+ 295 const returnConfig = {
+ 296   'Cles': { title: 'Clés du bureau', columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
+ 297   'Badge': { title: 'Badge d\'accès', columns:[{key:'info',label:'Quantité',type:'text'}], defaultRow:{info:''} },
+ 298   'LigneTel': { title: 'Téléphone Cellulaire', columns:[{key:'Marque',label:'Marque',type:'text'},{key:'info',label:'N° de série',type:'text'}], defaultRow:{Marque:'', info:''}},
+ 299   'Laptop': { title: 'Ordinateur / Laptop', columns:[{key:'marque',label:'Marque',type:'text'},{key:'nom',label:"Nom de l'ordinateur",type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',nom:'',serie:''}},
+ 300   'Moniteur': { title: 'Moniteur', columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
+ 301   'Tablette': { title: 'Tablette', columns:[{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{marque:'',serie:''}},
+ 302   'Accessoire': { title: 'Accessoires', columns:[{key:'detail',label:'Précisez',type:'text'},{key:'marque',label:'Marque',type:'text'},{key:'serie',label:'N° de série',type:'text'}], defaultRow:{detail:'',marque:'',serie:''}},
+ 303   'Autres': { title: 'Autres', columns:[{key:'detail',label:'Veuillez préciser',type:'text'}], defaultRow:{detail:''}},
+ 304 };
+ 305 
+ 306 /* ========== Restitution PAR ACTION (Bloc 3 complet) ========== */
+ 307 function createRetourParActionBlock(actionId) {
+ 308   const container = document.createElement('div');
+ 309   container.className = 'sub-block restitution-block';
+ 310   container.style.cssText = 'margin-top:12px;padding:15px;background:#fef9f0;border-radius:8px;border:2px solid #e74c3c;';
+ 311 
+ 312   const title = document.createElement('h4');
+ 313   title.textContent = 'Restitution du Matériel';
+ 314   title.style.cssText = 'margin:0 0 15px 0;color:#c0392b;border-bottom:2px solid #e74c3c;padding-bottom:8px;';
+ 315   container.appendChild(title);
+ 316 
+ 317   const labelCb = document.createElement('label');
+ 318   labelCb.textContent = 'Matériel restitué (Sélectionnez tous les matériels correspondants)';
+ 319   labelCb.style.cssText = 'font-weight:bold;display:block;margin-bottom:10px;';
+ 320   container.appendChild(labelCb);
+ 321 
+ 322   const checkboxesDiv = document.createElement('div');
+ 323   checkboxesDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px;';
+ 324 
+ 325   const types = [
+ 326     { type: 'Cles', label: 'Clés du bureau' },
+ 327     { type: 'Badge', label: 'Badge d\'accès' },
+ 328     { type: 'LigneTel', label: 'Téléphone Cellulaire' },
+ 329     { type: 'Laptop', label: 'Ordinateur / Laptop' },
+ 330     { type: 'Moniteur', label: 'Moniteur' },
+ 331     { type: 'Tablette', label: 'Tablette' },
+ 332     { type: 'Accessoire', label: 'Accessoires' },
+ 333     { type: 'Autres', label: 'Autres' }
+ 334   ];
+ 335 
+ 336   const tablesContainer = document.createElement('div');
+ 337   tablesContainer.className = 'restitution-tables';
+ 338 
+ 339   types.forEach(t => {
+ 340     const lbl = document.createElement('label');
+ 341     lbl.style.cssText = 'display:inline-flex;align-items:center;gap:5px;padding:6px 10px;background:#fff;border:1px solid #ccc;border-radius:5px;cursor:pointer;';
+ 342     const cb = document.createElement('input');
+ 343     cb.type = 'checkbox';
+ 344     cb.dataset.type = t.type;
+ 345     cb.dataset.actionId = actionId;
+ 346     cb.onchange = function () {
+ 347       toggleRestitutionTable(this, tablesContainer, actionId);
+ 348     };
+ 349     lbl.appendChild(cb);
+ 350     lbl.appendChild(document.createTextNode(t.label));
+ 351     checkboxesDiv.appendChild(lbl);
+ 352   });
+ 353 
+ 354   container.appendChild(checkboxesDiv);
+ 355   container.appendChild(tablesContainer);
+ 356 
+ 357   // Motif
+ 358   const motifDiv = document.createElement('div');
+ 359   motifDiv.style.marginTop = '15px';
+ 360   motifDiv.innerHTML = '<label style="font-weight:bold;">Motif de restitution :</label>';
+ 361   const motifSelect = document.createElement('select');
+ 362   motifSelect.innerHTML = '<option value="">-- Sélectionner --</option><option value="Réparation">Réparation</option><option value="Changement">Changement</option><option value="Départ">Départ</option><option value="Autres">Autres</option>';
+ 363   motifDiv.appendChild(motifSelect);
+ 364   container.appendChild(motifDiv);
+ 365 
+ 366   const autresDiv = document.createElement('div');
+ 367   autresDiv.style.cssText = 'display:none;margin-top:8px;';
+ 368   autresDiv.innerHTML = '<label>Veuillez préciser :</label><input type="text" style="width:100%;">';
+ 369   container.appendChild(autresDiv);
+ 370 
+ 371   const dateDiv = document.createElement('div');
+ 372   dateDiv.style.cssText = 'display:none;margin-top:8px;';
+ 373   dateDiv.innerHTML = '<label>Date de départ :</label><input type="date">';
+ 374   container.appendChild(dateDiv);
+ 375 
+ 376   motifSelect.onchange = function () {
+ 377     dateDiv.style.display = this.value === 'Départ' ? 'block' : 'none';
+ 378     autresDiv.style.display = this.value === 'Autres' ? 'block' : 'none';
+ 379   };
+ 380 
+ 381   // Déclaration
+ 382   const declDiv = document.createElement('div');
+ 383   declDiv.style.marginTop = '15px';
+ 384   declDiv.innerHTML = '<label style="font-weight:bold;">Déclaration de l\'employé</label><textarea readonly style="width:100%;min-height:60px;background:#f5f5f5;">L\'employé déclare avoir restitué tout matériel appartenant au CDÉNÉ et avoir complété la passation de consignes.</textarea>';
+ 385   container.appendChild(declDiv);
+ 386 
+ 387   // Réserves
+ 388   const resDiv = document.createElement('div');
+ 389   resDiv.style.marginTop = '12px';
+ 390   resDiv.innerHTML = '<label style="font-weight:bold;">Réserves éventuelles</label><textarea style="width:100%;min-height:80px;" placeholder="Entrez vos réserves éventuelles ici..."></textarea>';
+ 391   container.appendChild(resDiv);
+ 392 
+ 393   // Date restitution
+ 394   const dateRestDiv = document.createElement('div');
+ 395   dateRestDiv.style.marginTop = '12px';
+ 396   dateRestDiv.innerHTML = '<label style="font-weight:bold;">Date de restitution</label><input type="date" style="width:100%;">';
+ 397   container.appendChild(dateRestDiv);
+ 398 
+ 399   // Signatures
+ 400   const sigDiv = document.createElement('div');
+ 401   sigDiv.className = 'two-col';
+ 402   sigDiv.style.marginTop = '12px';
+ 403   sigDiv.innerHTML = '<div><label style="font-weight:bold;">Signature de l\'employé</label><input type="text"></div><div><label style="font-weight:bold;">Signature du gestionnaire</label><input type="text"></div>';
+ 404   container.appendChild(sigDiv);
+ 405 
+ 406   return container;
+ 407 }
+ 408 
+ 409 function toggleRestitutionTable(checkbox, container, actionId) {
+ 410   const type = checkbox.dataset.type;
+ 411   const tableId = `restTable-${actionId}-${type}`;
+ 412 
+ 413   if (checkbox.checked) {
+ 414     if (!document.getElementById(tableId)) {
+ 415       const table = createRestitutionTable(type, actionId);
+ 416       table.id = tableId;
+ 417       container.appendChild(table);
+ 418     }
+ 419   } else {
+ 420     const el = document.getElementById(tableId);
+ 421     if (el) el.remove();
+ 422   }
+ 423 }
+ 424 
+ 425 function createRestitutionTable(type, actionId) {
+ 426   const cfg = returnConfig[type];
+ 427   const wrap = document.createElement('div');
+ 428   wrap.style.cssText = 'margin:10px 0;padding:10px;border:1px solid #7a9ab8;border-radius:8px;background:#eef6fb;';
+ 429 
+ 430   const hdr = document.createElement('div');
+ 431   hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';
+ 432   hdr.innerHTML = `<strong>${cfg.title}</strong>`;
+ 433 
+ 434   const addBtn = document.createElement('button');
+ 435   addBtn.type = 'button';
+ 436   addBtn.textContent = 'Ajouter';
+ 437   addBtn.className = 'no-pdf';
+ 438   addBtn.onclick = () => addRestitutionRow(type, actionId);
+ 439   hdr.appendChild(addBtn);
+ 440   wrap.appendChild(hdr);
+ 441 
+ 442   const table = document.createElement('table');
+ 443   table.style.cssText = 'width:100%;border-collapse:collapse;margin-top:10px;';
+ 444 
+ 445   let thHtml = '<tr>';
+ 446   cfg.columns.forEach(c => {
+ 447     thHtml += `<th style="text-align:left;padding:6px;border-bottom:2px solid #b8d5e8;">${c.label}</th>`;
+ 448   });
+ 449   thHtml += '<th style="width:80px;"></th></tr>';
+ 450   table.innerHTML = `<thead>${thHtml}</thead><tbody></tbody>`;
+ 451   wrap.appendChild(table);
+ 452 
+ 453   addRestitutionRow(type, actionId);
+ 454   return wrap;
+ 455 }
+ 456 
+ 457 function addRestitutionRow(type, actionId) {
+ 458   const cfg = returnConfig[type];
+ 459   const tableId = `restTable-${actionId}-${type}`;
+ 460   const wrap = document.getElementById(tableId);
+ 461   if (!wrap) return;
+ 462 
+ 463   const tbody = wrap.querySelector('tbody');
+ 464   const tr = document.createElement('tr');
+ 465   tr.style.borderBottom = '1px solid #e0eef7';
+ 466 
+ 467   cfg.columns.forEach(() => {
+ 468     const td = document.createElement('td');
+ 469     td.style.padding = '6px';
+ 470     td.innerHTML = '<input type="text" style="width:100%;padding:6px;border:1px solid #9fb7cc;border-radius:6px;">';
+ 471     tr.appendChild(td);
+ 472   });
+ 473 
+ 474   const tdDel = document.createElement('td');
+ 475   tdDel.style.padding = '6px';
+ 476   const delBtn = document.createElement('button');
+ 477   delBtn.type = 'button';
+ 478   delBtn.textContent = 'Supprimer';
+ 479   delBtn.className = 'no-pdf';
+ 480   delBtn.onclick = () => tr.remove();
+ 481   tdDel.appendChild(delBtn);
+ 482   tr.appendChild(tdDel);
+ 483 
+ 484   tbody.appendChild(tr);
+ 485 }
+ 486 
+ 487 /* ========== Restitution statique (si présent dans HTML) ========== */
+ 488 function handleReturnToggle(checkbox) {
+ 489   const type = checkbox.dataset.type;
+ 490   if (checkbox.checked) {
+ 491     if (!document.querySelector(`#returnTableBlock-${type}`)) {
+ 492       const block = createReturnTable(type);
+ 493       const labels = Array.from(document.querySelectorAll('#returnMaterialCheckboxes label'));
+ 494       const after = labels.find(l => l.querySelector(`input[data-type="${type}"]`));
+ 495       if (after && after.parentNode) after.parentNode.insertBefore(block, after.nextSibling);
+ 496       else {
+ 497         const container = document.getElementById('returnTablesContainer');
+ 498         if (container) container.appendChild(block);
+ 499       }
+ 500     }
+ 501   } else {
+ 502     const b = document.querySelector(`#returnTableBlock-${type}`);
+ 503     if (b) b.remove();
+ 504   }
+ 505 }
+ 506 
+ 507 function createReturnTable(type) {
+ 508   const cfg = returnConfig[type];
+ 509   const wrap = document.createElement('div');
+ 510   wrap.id = `returnTableBlock-${type}`;
+ 511   wrap.className = 'material-table-block';
+ 512   wrap.style.margin = '10px 0 18px 0';
+ 513   wrap.style.padding = '10px';
+ 514   wrap.style.border = '1px solid #7a9ab8';
+ 515   wrap.style.borderRadius = '8px';
+ 516   wrap.style.background = '#eef6fb';
+ 517 
+ 518   const header = document.createElement('div');
+ 519   header.style.display='flex';
+ 520   header.style.justifyContent='space-between';
+ 521   header.style.alignItems='center';
+ 522 
+ 523   const t = document.createElement('strong');
+ 524   t.textContent = (returnConfig[type].title || type);
+ 525   header.appendChild(t);
+ 526 
+ 527   const controls = document.createElement('div');
+ 528   controls.className = 'controls';
+ 529 
+ 530   const addBtn = document.createElement('button');
+ 531   addBtn.type = 'button';
+ 532   addBtn.textContent = '➕ Ajouter';
+ 533   addBtn.style.marginRight = '8px';
+ 534   addBtn.classList.add('no-pdf');
+ 535   addBtn.onclick = () => addReturnRow(type);
+ 536   controls.appendChild(addBtn);
+ 537 
+ 538   const removeBlockBtn = document.createElement('button');
+ 539   removeBlockBtn.type = 'button';
+ 540   removeBlockBtn.textContent = '❌';
+ 541   removeBlockBtn.classList.add('no-pdf');
+ 542   removeBlockBtn.onclick = () => {
+ 543     const cb = document.querySelector(`#returnMaterialCheckboxes input[data-type="${type}"]`);
+ 544     if (cb) { cb.checked = false; }
+ 545     wrap.remove();
+ 546   };
+ 547   controls.appendChild(removeBlockBtn);
+ 548 
+ 549   header.appendChild(controls);
+ 550   wrap.appendChild(header);
+ 551 
+ 552   const table = document.createElement('table');
+ 553   table.style.width='100%';
+ 554   table.style.borderCollapse='collapse';
+ 555   table.style.marginTop='10px';
+ 556   table.dataset.type = type;
+ 557 
+ 558   const thead = document.createElement('thead');
+ 559   const trh = document.createElement('tr');
+ 560   cfg.columns.forEach(c => {
+ 561     const th = document.createElement('th');
+ 562     th.textContent = c.label;
+ 563     th.style.borderBottom='2px solid #b8d5e8';
+ 564     th.style.padding='6px';
+ 565     trh.appendChild(th);
+ 566   });
+ 567   const thd = document.createElement('th'); thd.style.width='60px'; trh.appendChild(thd);
+ 568   thead.appendChild(trh);
+ 569   table.appendChild(thead);
+ 570 
+ 571   const tbody = document.createElement('tbody');
+ 572   table.appendChild(tbody);
+ 573   wrap.appendChild(table);
+ 574 
+ 575   addReturnRow(type);
+ 576   return wrap;
+ 577 }
+ 578 
+ 579 function addReturnRow(type) {
+ 580   const cfg = returnConfig[type];
+ 581   const block = document.querySelector(`#returnTableBlock-${type}`);
+ 582   if (!block) return;
+ 583   const table = block.querySelector('table');
+ 584   const tbody = table.querySelector('tbody');
+ 585 
+ 586   const tr = document.createElement('tr');
+ 587   tr.style.borderBottom='1px solid #e0eef7';
+ 588 
+ 589   cfg.columns.forEach(col => {
+ 590     const td = document.createElement('td');
+ 591     td.style.padding='6px';
+ 592     const input = document.createElement('input');
+ 593     input.type='text';
+ 594     input.name=`restitution[${type}][][${col.key}]`;
+ 595     input.value=cfg.defaultRow[col.key] || '';
+ 596     input.style.width='100%';
+ 597     input.style.boxSizing='border-box';
+ 598     input.style.padding='6px';
+ 599     input.style.border='1px solid #9fb7cc';
+ 600     input.style.borderRadius='6px';
+ 601     td.appendChild(input);
+ 602     tr.appendChild(td);
+ 603   });
+ 604 
+ 605   const tdDel = document.createElement('td');
+ 606   tdDel.style.padding='6px';
+ 607   const delBtn = document.createElement('button');
+ 608   delBtn.type='button';
+ 609   delBtn.textContent='Supprimer';
+ 610   delBtn.classList.add('no-pdf');
+ 611   delBtn.onclick = () => tr.remove();
+ 612   tdDel.appendChild(delBtn);
+ 613   tr.appendChild(tdDel);
+ 614 
+ 615   tbody.appendChild(tr);
+ 616 }
+ 617 
+ 618 function toggleDepartDateReturn() {
+ 619   const motif = document.getElementById('motifRestitution');
+ 620   if (!motif) return;
+ 621 
+ 622   const dateDepartBlock = document.getElementById('dateDepartBlock');
+ 623   const dernierBlock = document.getElementById('dernierJourBlock');
+ 624   if (motif.value === 'Départ') {
+ 625     if (dernierBlock) dernierBlock.style.display = 'block';
+ 626     if (dateDepartBlock) dateDepartBlock.style.display = 'block';
+ 627   } else {
+ 628     if (dernierBlock) dernierBlock.style.display = 'none';
+ 629     if (dateDepartBlock) dateDepartBlock.style.display = 'none';
+ 630     const dj = document.getElementById('dernierJour'); if (dj) dj.value = '';
+ 631     const dd = document.getElementById('dateDepart'); if (dd) dd.value = '';
+ 632   }
+ 633 }
+ 634 
+ 635 // Auto-ajustement des textareas à la hauteur du contenu
+ 636 function autoResizeTextarea(textarea) {
+ 637   if (!textarea) return;
+ 638   textarea.style.height = 'auto';
+ 639   const scrollHeight = textarea.scrollHeight;
+ 640   const newHeight = Math.max(60, Math.min(scrollHeight, 400));
+ 641   textarea.style.height = newHeight + 'px';
+ 642 }
+ 643 
+ 644 // Fonction globale pour redimensionner tous les textareas
+ 645 function resizeAllTextareas() {
+ 646   document.querySelectorAll('textarea').forEach(ta => {
+ 647     autoResizeTextarea(ta);
+ 648   });
+ 649 }
+ 650 
+ 651 // Événement input pour le redimensionnement en temps réel
+ 652 document.addEventListener('input', (e) => {
+ 653   if (e.target && e.target.tagName === 'TEXTAREA') {
+ 654     autoResizeTextarea(e.target);
+ 655   }
+ 656 });
+ 657 
+ 658 // Observer pour détecter les nouveaux textareas ajoutés dynamiquement
+ 659 const mutationObserver = new MutationObserver((mutations) => {
+ 660   mutations.forEach((mutation) => {
+ 661     if (mutation.addedNodes.length > 0) {
+ 662       mutation.addedNodes.forEach((node) => {
+ 663         if (node.nodeType === 1) {
+ 664           if (node.tagName === 'TEXTAREA') {
+ 665             setTimeout(() => autoResizeTextarea(node), 10);
+ 666             node.addEventListener('input', () => autoResizeTextarea(node));
+ 667           } else if (node.querySelectorAll) {
+ 668             const textareas = node.querySelectorAll('textarea');
+ 669             if (textareas.length > 0) {
+ 670               textareas.forEach(ta => {
+ 671                 setTimeout(() => autoResizeTextarea(ta), 10);
+ 672                 ta.addEventListener('input', () => autoResizeTextarea(ta));
+ 673               });
+ 674             }
+ 675           }
+ 676         }
+ 677       });
+ 678     }
+ 679   });
+ 680 });
+ 681 
+ 682 // Initialiser l'observateur au chargement du DOM
+ 683 function initTextareaObserver() {
+ 684   const form = document.querySelector('form') || document.body;
+ 685   mutationObserver.observe(form, {
+ 686     childList: true,
+ 687     subtree: true,
+ 688     characterData: false,
+ 689     attributes: false
+ 690   });
+ 691   
+ 692   resizeAllTextareas();
+ 693   document.querySelectorAll('textarea').forEach(ta => {
+ 694     ta.addEventListener('input', () => autoResizeTextarea(ta));
+ 695     ta.addEventListener('change', () => autoResizeTextarea(ta));
+ 696   });
+ 697 }
+ 698 
+ 699 if (document.readyState === 'loading') {
+ 700   document.addEventListener('DOMContentLoaded', initTextareaObserver);
+ 701 } else {
+ 702   initTextareaObserver();
+ 703 }
+ 704 
+ 705 /* ========== PDF - FIT SUR UNE PAGE ========== */
+ 706 const btnPDF = document.getElementById('btnDownloadPDF');
+ 707 if (btnPDF) {
+ 708   btnPDF.addEventListener('click', genererPDFGlobal);
+ 709 }
+ 710 
+ 711 async function genererPDFGlobal() {
+ 712   try {
+ 713     if (!window.html2canvas) {
+ 714       await showCustomAlert('Erreur: html2canvas n\'est pas chargé.');
+ 715       return;
+ 716     }
+ 717     if (!window.jspdf || !window.jspdf.jsPDF) {
+ 718       await showCustomAlert('Erreur: jsPDF n\'est pas chargé.');
+ 719       return;
+ 720     }
+ 721 
+ 722     const { jsPDF } = window.jspdf;
+ 723     const pdf = new jsPDF('p','pt','a4');
+ 724     const pageWidth = 595.28;
+ 725     const pageHeight = 841.89;
+ 726     const margin = 10;
+ 727 
+ 728     // Fonction pour capturer un élément en canvas
+ 729     async function captureElementToCanvas(element) {
+ 730       const noPdfElements = element.querySelectorAll(".no-pdf");
+ 731       const selects = element.querySelectorAll("select");
+ 732       const textareas = element.querySelectorAll("textarea");
+ 733 
+ 734       noPdfElements.forEach(el => el.style.display = 'none');
+ 735 
+ 736       const selectReplacements = [];
+ 737       selects.forEach(sel => {
+ 738           const span = document.createElement("span");
+ 739           span.textContent = sel.options[sel.selectedIndex]?.text || "";
+ 740           span.style.display = "inline-block";
+ 741           span.style.minWidth = sel.offsetWidth + "px";
+ 742           span.style.minHeight = "20px";
+ 743           span.style.padding = "0";
+ 744           span.style.border = "none";
+ 745           span.style.background = "transparent";
+ 746           span.style.fontSize = "16px";
+ 747           span.style.lineHeight = "1.4";
+ 748           span.style.fontWeight = "600";
+ 749           sel.parentNode.insertBefore(span, sel);
+ 750           sel.style.display = 'none';
+ 751           selectReplacements.push({ original: sel, replacement: span });
+ 752       });
+ 753 
+ 754       const textareaReplacements = [];
+ 755       textareas.forEach(textarea => {
+ 756           const div = document.createElement("div");
+ 757           div.innerHTML = textarea.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
+ 758           div.style.fontFamily = 'Segoe UI, Arial, sans-serif';
+ 759           div.style.fontSize = '16px';
+ 760           div.style.lineHeight = '1.6';
+ 761           div.style.whiteSpace = 'pre-wrap';
+ 762           div.style.wordWrap = 'break-word';
+ 763           div.style.padding = '8px';
+ 764           div.style.margin = '0';
+ 765           div.style.border = '1px solid #888';
+ 766           div.style.borderRadius = '6px';
+ 767           div.style.background = '#fff';
+ 768           div.style.width = (textarea.offsetWidth - 16) + 'px';
+ 769           div.style.minHeight = Math.max(textarea.scrollHeight, 60) + 'px';
+ 770           div.style.boxSizing = 'border-box';
+ 771           div.style.display = 'block';
+ 772           
+ 773           textarea.parentNode.insertBefore(div, textarea);
+ 774           textarea.style.display = 'none';
+ 775           textareaReplacements.push({ original: textarea, replacement: div });
+ 776       });
+ 777 
+ 778       const canvas = await html2canvas(element, {
+ 779           scale: 2,
+ 780           useCORS: true,
+ 781           allowTaint: true,
+ 782           backgroundColor: '#c9d9e8',
+ 783           logging: false,
+ 784           windowHeight: element.scrollHeight + 100,
+ 785           windowWidth: element.scrollWidth
+ 786       });
+ 787 
+ 788       noPdfElements.forEach(el => el.style.display = '');
+ 789       selectReplacements.forEach(({original, replacement}) => {
+ 790           original.style.display = '';
+ 791           replacement.remove();
+ 792       });
+ 793       textareaReplacements.forEach(({original, replacement}) => {
+ 794           original.style.display = '';
+ 795           replacement.remove();
+ 796       });
+ 797 
+ 798       return canvas;
+ 799     }
+ 800 
+ 801     // Trouver l'élément principal à capturer
+ 802     const element = document.getElementById('formMateriel') || 
+ 803                     document.getElementById('blocAttribution') || 
+ 804                     document.getElementById('blocSuivi') ||
+ 805                     document.getElementById('blocSuiviRestitution') ||
+ 806                     document.querySelector('.bloc-formulaire');
+ 807     
+ 808     if (!element) {
+ 809       await showCustomAlert('Erreur: Aucun formulaire trouvé.');
+ 810       return;
+ 811     }
+ 812 
+ 813     // Capturer le canvas
+ 814     const canvas = await captureElementToCanvas(element);
+ 815 
+ 816     // Calculer les dimensions pour FIT sur UNE page
+ 817     const usableWidth = pageWidth - margin * 2;
+ 818     const usableHeight = pageHeight - margin * 2;
+ 819 
+ 820     let imgWidth = usableWidth;
+ 821     let imgHeight = (canvas.height * imgWidth) / canvas.width;
+ 822 
+ 823     // Si l'image est trop haute, réduire pour fit sur une page
+ 824     if (imgHeight > usableHeight) {
+ 825       const scaleFactor = usableHeight / imgHeight;
+ 826       imgHeight = usableHeight;
+ 827       imgWidth = imgWidth * scaleFactor;
+ 828     }
+ 829 
+ 830     // Centrer horizontalement si l'image est plus petite que la largeur
+ 831     const xOffset = margin + (usableWidth - imgWidth) / 2;
+ 832 
+ 833     pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, margin, imgWidth, imgHeight);
+ 834     pdf.save('Formulaire_CDENE.pdf');
+ 835 
+ 836   } catch (error) {
+ 837     console.log('Erreur PDF:', error);
+ 838     await showCustomAlert('Une erreur est survenue lors de la génération du PDF: ' + error.message);
+ 839   }
+ 840 }
+ 841 
+ 842 // Fonction pour envoyer le PDF par email
+ 843 async function envoyerParEmail() {
+ 844   try {
+ 845     const email = document.getElementById('courrielSuivi')?.value || '';
+ 846     const nomEmployee = document.getElementById('nomAttribution')?.value || 'Attribution Matériel';
+ 847     
+ 848     if (!email) {
+ 849       await showCustomAlert('Veuillez remplir le champ email avant d\'envoyer.');
+ 850       return;
+ 851     }
+ 852 
+ 853     if (!email.includes('@')) {
+ 854       await showCustomAlert('Veuillez entrer une adresse email valide.');
+ 855       return;
+ 856     }
+ 857 
+ 858     await showCustomAlert('Génération du PDF en cours...');
+ 859 
+ 860     if (!window.html2canvas) {
+ 861       await showCustomAlert('Erreur: html2canvas n\'est pas chargé.');
+ 862       return;
+ 863     }
+ 864     if (!window.jspdf || !window.jspdf.jsPDF) {
+ 865       await showCustomAlert('Erreur: jsPDF n\'est pas chargé.');
+ 866       return;
+ 867     }
+ 868 
+ 869     const { jsPDF } = window.jspdf;
+ 870     const pdf = new jsPDF('p','pt','a4');
+ 871     const pageWidth = 595.28;
+ 872     const pageHeight = 841.89;
+ 873     const margin = 10;
+ 874 
+ 875     async function captureElementToCanvas(element) {
+ 876       const noPdfElements = element.querySelectorAll(".no-pdf");
+ 877       const selects = element.querySelectorAll("select");
+ 878       const textareas = element.querySelectorAll("textarea");
+ 879 
+ 880       noPdfElements.forEach(el => el.style.display = 'none');
+ 881 
+ 882       const selectReplacements = [];
+ 883       selects.forEach(sel => {
+ 884           const span = document.createElement("span");
+ 885           span.textContent = sel.options[sel.selectedIndex]?.text || "";
+ 886           span.style.display = "inline-block";
+ 887           span.style.minWidth = sel.offsetWidth + "px";
+ 888           span.style.fontSize = "16px";
+ 889           span.style.fontWeight = "600";
+ 890           sel.parentNode.insertBefore(span, sel);
+ 891           sel.style.display = 'none';
+ 892           selectReplacements.push({ original: sel, replacement: span });
+ 893       });
+ 894 
+ 895       const textareaReplacements = [];
+ 896       textareas.forEach(textarea => {
+ 897           const div = document.createElement("div");
+ 898           div.innerHTML = textarea.value.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
+ 899           div.style.fontFamily = 'Segoe UI, Arial, sans-serif';
+ 900           div.style.fontSize = '16px';
+ 901           div.style.lineHeight = '1.6';
+ 902           div.style.whiteSpace = 'pre-wrap';
+ 903           div.style.padding = '8px';
+ 904           div.style.border = '1px solid #888';
+ 905           div.style.borderRadius = '6px';
+ 906           div.style.background = '#fff';
+ 907           div.style.width = (textarea.offsetWidth - 16) + 'px';
+ 908           div.style.minHeight = Math.max(textarea.scrollHeight, 60) + 'px';
+ 909           
+ 910           textarea.parentNode.insertBefore(div, textarea);
+ 911           textarea.style.display = 'none';
+ 912           textareaReplacements.push({ original: textarea, replacement: div });
+ 913       });
+ 914 
+ 915       const canvas = await html2canvas(element, {
+ 916           scale: 2,
+ 917           useCORS: true,
+ 918           allowTaint: true,
+ 919           backgroundColor: '#c9d9e8',
+ 920           logging: false,
+ 921           windowHeight: element.scrollHeight + 100
+ 922       });
+ 923 
+ 924       noPdfElements.forEach(el => el.style.display = '');
+ 925       selectReplacements.forEach(({original, replacement}) => {
+ 926           original.style.display = '';
+ 927           replacement.remove();
+ 928       });
+ 929       textareaReplacements.forEach(({original, replacement}) => {
+ 930           original.style.display = '';
+ 931           replacement.remove();
+ 932       });
+ 933 
+ 934       return canvas;
+ 935     }
+ 936 
+ 937     const blocAttribution = document.getElementById('blocAttribution');
+ 938     if(blocAttribution) {
+ 939         const canvas = await captureElementToCanvas(blocAttribution);
+ 940         
+ 941         const usableWidth = pageWidth - margin * 2;
+ 942         const usableHeight = pageHeight - margin * 2;
+ 943         let imgWidth = usableWidth;
+ 944         let imgHeight = (canvas.height * imgWidth) / canvas.width;
+ 945 
+ 946         if (imgHeight > usableHeight) {
+ 947           const scaleFactor = usableHeight / imgHeight;
+ 948           imgHeight = usableHeight;
+ 949           imgWidth = imgWidth * scaleFactor;
+ 950         }
+ 951 
+ 952         const xOffset = margin + (usableWidth - imgWidth) / 2;
+ 953         pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, margin, imgWidth, imgHeight);
+ 954     }
+ 955 
+ 956     const pdfBlob = pdf.output('blob');
+ 957     const pdfUrl = URL.createObjectURL(pdfBlob);
+ 958     
+ 959     const downloadLink = document.createElement('a');
+ 960     downloadLink.href = pdfUrl;
+ 961     downloadLink.download = 'Attribution_CDENE_' + new Date().toISOString().split('T')[0] + '.pdf';
+ 962     downloadLink.style.display = 'none';
+ 963     document.body.appendChild(downloadLink);
+ 964     downloadLink.click();
+ 965     
+ 966     document.body.removeChild(downloadLink);
+ 967     URL.revokeObjectURL(pdfUrl);
+ 968 
+ 969     await showCustomAlert('✅ Formulaire téléchargé avec succès!\n\nVeuillez l\'envoyer à:\n' + email + '\n\nNote: Le fichier a été téléchargé automatiquement.');
+ 970 
+ 971   } catch (error) {
+ 972     console.error('Erreur:', error);
+ 973     await showCustomAlert('❌ Une erreur est survenue:\n' + error.message);
+ 974   }
+ 975 }
+ 976 
+ 977 const btnSendEmail = document.getElementById('btnSendEmail');
+ 978 if (btnSendEmail) {
+ 979   btnSendEmail.addEventListener('click', envoyerParEmail);
+ 980 }
