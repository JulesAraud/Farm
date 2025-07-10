export interface Usine {
  nom: string;
  intrants: string[];
  resultat: string;
  multiplicateur: number;
  quantiteEgale?: boolean;
}

export const UsinesDisponibles: Usine[] = [
  {
    nom: 'Moulin à huile',
    intrants: ['tournesol', 'olive', 'canola', 'riz'],
    resultat: 'huile',
    multiplicateur: 2
  },
  {
    nom: 'Scierie',
    intrants: ['peuplier'],
    resultat: 'planches',
    multiplicateur: 2
  },
  {
    nom: 'Fabrique de wagons',
    intrants: ['planches'],
    resultat: 'wagons',
    multiplicateur: 4
  },
  {
    nom: 'Usine de jouets',
    intrants: ['planches'],
    resultat: 'jouets',
    multiplicateur: 3
  },
  {
    nom: 'Moulin à grains',
    intrants: ['blé', 'orge', 'sorgho'],
    resultat: 'farine',
    multiplicateur: 2
  },
  {
    nom: 'Raffinerie de sucre',
    intrants: ['betterave', 'canne à sucre'],
    resultat: 'sucre',
    multiplicateur: 2
  },
  {
    nom: 'Filature',
    intrants: ['coton'],
    resultat: 'tissu',
    multiplicateur: 2
  },
  {
    nom: 'Atelier de couture',
    intrants: ['tissu'],
    resultat: 'vêtements',
    multiplicateur: 2
  },
  {
    nom: 'Boulangerie',
    intrants: ['sucre', 'farine'],
    resultat: 'gâteau',
    multiplicateur: 6,
    quantiteEgale: true
  },
  {
    nom: 'Usine de chips',
    intrants: ['pomme de terre', 'huile'],
    resultat: 'chips',
    multiplicateur: 6,
    quantiteEgale: true
  },
  {
    nom: 'Cave à vin',
    intrants: ['raisin'],
    resultat: 'vin',
    multiplicateur: 2
  }
];
