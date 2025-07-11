async function chargerChamps() {
  const res = await fetch('/champs');
  const champs = await res.json();

  const select = document.getElementById('champSelect');
  select.innerHTML = '';

  champs.forEach(champ => {
    const option = document.createElement('option');
    option.value = champ.id;
    option.textContent = `Champ ${champ.id} - ${champ.state}`;
    select.appendChild(option);
  });
}

async function creerChamp() {
  const id = document.getElementById('newChampId').value;
  const lot = document.getElementById('newChampLot').value;

  const res = await fetch('/champs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, lot })
  });

  const data = await res.json();
  alert(data.success ? 'Champ créé' : 'Erreur: ' + data.error);
  chargerChamps();
}

async function semerChamp() {
  const id = document.getElementById('champSelect').value;
  const culture = document.getElementById('cultureSelect').value;

  const res = await fetch('/semer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, culture })
  });

  const data = await res.json();
  alert(data.success ? 'Champ semé avec succès' : 'Erreur lors du semis');
  chargerChamps();
}

async function labourerChamps() {
  const res = await fetch('/labourer', { method: 'POST' });
  const data = await res.json();
  alert(data.success ? `✅ Champs labourés : ${data.updated || 0}` : 'Erreur lors du labourage');
  chargerChamps();
}

async function fertiliserTous() {
  const res = await fetch('/fertiliser', { method: 'POST' });
  const data = await res.json();
  alert(data.success ? data.message : data.message || 'Erreur lors de la fertilisation');
  chargerChamps();
}

async function recolterChamps() {
  const res = await fetch('/recolter', { method: 'POST' });
  const data = await res.json();
  alert(data.success ? `🌾 Champs récoltés : ${data.champsRecoltés.join(', ')}` : 'Erreur : ' + data.error);
  chargerChamps();
}

async function chargerUsines() {
  const res = await fetch('/usines-disponibles'); // 🔁 Mise à jour du bon endpoint
  const usines = await res.json();

  const select = document.getElementById('usineSelect');
  select.innerHTML = '';

  usines.forEach(usine => {
    const option = document.createElement('option');
    option.value = usine.nom;
    option.textContent = `${usine.nom}`;
    select.appendChild(option);

  if (usines.length === 0) {
  const option = document.createElement('option');
  option.textContent = 'Aucune usine disponible';
  option.disabled = true;
  select.appendChild(option);
}

  });
}

async function chargerUsinesEnCours() {
  const res = await fetch('/usines-utilisation');
  const usines = await res.json();

  const ul = document.getElementById('usinesEnCours');
  ul.innerHTML = '';

  if (usines.length === 0) {
    ul.innerHTML = '<li>Aucune usine en fonctionnement</li>';
    return;
  }

  usines.forEach(usine => {
    const li = document.createElement('li');
    li.textContent = `${usine.nom} → ${usine.resultat} (${usine.quantite_produite} L)`;
    ul.appendChild(li);
  });
}

async function chargerStock() {
  const res = await fetch('/ferme');
  const data = await res.json();

  document.getElementById('stockActuel').textContent = data.stockage;
  document.getElementById('revenuTotal').textContent = data.revenu_total + ' 💰';
}

async function chargerProduitsTransformes() {
  const res = await fetch('/produits-transformes');
  const produits = await res.json();

  const select = document.getElementById('produitSelect');
  select.innerHTML = '';

  produits.forEach(p => {
    const option = document.createElement('option');
    option.value = p.produit;
    option.textContent = `${p.produit} (${p.quantite} L)`;
    select.appendChild(option);
  });
}

async function vendreProduit() {
  const produit = document.getElementById('produitSelect').value;
  const quantite = parseInt(document.getElementById('quantiteProduitVente').value, 10);

  if (!produit || isNaN(quantite) || quantite <= 0) {
    alert("Sélectionnez un produit et une quantité valide.");
    return;
  }

  const res = await fetch('/vendre-produit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produit, quantite })
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById('venteMessage').textContent = `✅ ${quantite} L de ${produit} vendu(s)`;
    chargerProduitsTransformes();
    chargerStock();
  } else {
    document.getElementById('venteMessage').textContent = `❌ ${data.error}`;
  }
}



async function vendreQuantite() {
  const quantite = parseInt(document.getElementById('quantiteVente').value);

  if (isNaN(quantite) || quantite <= 0) {
    alert("Quantité invalide");
    return;
  }

  const res = await fetch('/vendre-quantite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantite })
  });

  const data = await res.json();
  if (res.ok && data.success) {
    alert("✅ Vente réussie");
    chargerStock();
  } else {
    alert(data.error || 'Erreur de vente');
  }
}



async function transformerUsine() {
  const select = document.getElementById('usineSelect');
  const usine = select.value;

  const res = await fetch('/transformer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usine })
  });

  const data = await res.json();
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = res.ok && data.success ? data.message : data.error || 'Erreur inconnue';
}

window.onload = () => {
  chargerChamps();
  chargerUsines();
  chargerUsinesEnCours();
  chargerStock();
  chargerProduitsTransformes();

  document.getElementById('vendreQuantiteBtn')?.addEventListener('click', vendreQuantite);

  document.getElementById('creerChampBtn')?.addEventListener('click', creerChamp);
  document.getElementById('semerBtn')?.addEventListener('click', semerChamp);
  document.getElementById('recolterBtn')?.addEventListener('click', recolterChamps);
  document.getElementById('labourerBtn')?.addEventListener('click', labourerChamps);
  document.getElementById('fertiliserBtn')?.addEventListener('click', fertiliserTous);
  document.getElementById('transformerBtn')?.addEventListener('click', transformerUsine);
  document.getElementById('vendreProduitBtn')?.addEventListener('click', vendreProduit);

};

// Rafraîchit la liste toutes les 5 secondes
setInterval(() => {
  chargerChamps();
  chargerUsinesEnCours();

}, 5000);
