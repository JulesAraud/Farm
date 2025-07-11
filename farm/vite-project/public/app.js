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

  const res = await fetch('/creer-champ', {
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

  document.getElementById('creerChampBtn')?.addEventListener('click', creerChamp);
  document.getElementById('semerBtn')?.addEventListener('click', semerChamp);
  document.getElementById('recolterBtn')?.addEventListener('click', recolterChamps);
  document.getElementById('labourerBtn')?.addEventListener('click', labourerChamps);
  document.getElementById('fertiliserBtn')?.addEventListener('click', fertiliserTous);
  document.getElementById('transformerBtn')?.addEventListener('click', transformerUsine);
};

// Rafraîchit la liste toutes les 5 secondes
setInterval(() => {
  chargerChamps();
  chargerUsinesEnCours();

}, 5000);
