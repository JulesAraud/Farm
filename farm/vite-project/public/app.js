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
  if (data.success) {
    alert('Champ semé avec succès');
    chargerChamps();
  } else {
    alert('Erreur lors du semis');
  }
}


async function labourerChamps() {
  const res = await fetch('/labourer', { method: 'POST' });
  const data = await res.json();

  if (data.success) {
    alert(`✅ Champs labourés : ${data.updated || 0}`);
    chargerChamps();
  } else {
    alert('Erreur lors du labourage');
  }
}




async function fertiliserChamp() {
  const id = document.getElementById('champSelect').value;

  const res = await fetch('/fertiliser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  const data = await res.json();
  if (data.success) {
    alert('Champ fertilisé avec succès');
    chargerChamps();
  } else {
    alert('Erreur : ' + data.error);
  }
}

async function fertiliserTous() {
  const res = await fetch('/fertiliser', {
    method: 'POST',
  });

  const data = await res.json();
  if (data.success) {
    alert(data.message);
    chargerChamps();
  } else {
    alert(data.message || 'Erreur lors de la fertilisation.');
  }
}


async function recolterChamps() {
  const res = await fetch('/recolter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (data.success) {
    alert(`🌾 Champs récoltés : ${data.champsRecoltés.join(', ')}`);
    chargerChamps();
  } else {
    alert('Erreur : ' + data.error);
  }
}


async function chargerUsinesDisponibles() {
  const res = await fetch('/usines-disponibles');
  const usines = await res.json();

  const select = document.getElementById('usineSelect');
  select.innerHTML = '';

  usines.forEach(u => {
    const option = document.createElement('option');
    option.value = u.nom;
    option.textContent = u.nom;
    select.appendChild(option);
  });
}

async function transformer() {
  const usine = document.getElementById('usineSelect').value;

  const res = await fetch('/transformer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usine })
  });

  const data = await res.json();
  alert(data.success ? `Transformation réussie : ${data.produit}L produits` : 'Erreur: ' + data.error);
}




window.onload = () => {
  chargerChamps();
  chargerUsinesDisponibles();
  document.getElementById('creerChampBtn')?.addEventListener('click', creerChamp);
  document.getElementById('semerBtn')?.addEventListener('click', semerChamp);
const boutonRecolter = document.getElementById('recolterBtn');
if (boutonRecolter) {
  boutonRecolter.addEventListener('click', recolterChamps);
}
const boutonLabourer = document.getElementById('labourerBtn');
if (boutonLabourer) {
  boutonLabourer.addEventListener('click', labourerChamps);
}
  document.getElementById('fertiliserBtn')?.addEventListener('click', fertiliserChamp);
  document.getElementById('transformerBtn')?.addEventListener('click', transformer);
};

setInterval(() => {
  chargerChamps();
}, 5000); // rafraîchit la liste toutes les 5 secondes
