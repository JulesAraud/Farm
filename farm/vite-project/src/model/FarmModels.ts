export type ChampEtat =
  | 'récolté'
  | 'labouré'
  | 'semé'
  | 'fertilisé'
  | 'prêt à récolter';

export interface Recolte {
  champId: number;
  culture: CultureType;
  quantite: number;
  revenu: number;
  date: Date;
}

export interface Usine {
  nom: string;
  intrants: { [culture: string]: number };
  resultat: string;
  multiplicateur: number;
}


export type CultureType =
  | 'blé'
  | 'orge'
  | 'avoine'
  | 'canola'
  | 'soja'
  | 'raisin'
  | 'olive'
  | 'pomme de terre'
  | 'betterave'
  | 'coton'
  | 'légumes'
  | 'maïs'
  | 'tournesol'
  | 'canne à sucre'
  | 'peuplier'
  | 'épinard'
  | 'pois'
  | 'haricots verts';

export interface Champ {
  id: number;
  state: ChampEtat;
  culture: CultureType;
  lot: string;
}

export interface Vehicle {
  type: VehicleType;
  available: number;
}

export type VehicleType =
  | 'tracteur'
  | 'remorque'
  | 'moissonneuse'
  | 'charrue'
  | 'fertilisateur'
  | 'semeuse'
  | 'remorque semi'
  | 'moissonneuse à raisin'
  | 'moissonneuse à olive'
  | 'moissonneuse à pomme de terre'
  | 'moissonneuse à betterave'
  | 'moissonneuse à coton'
  | 'moissonneuse à canne'
  | 'moissonneuse à arbre'
  | 'moissonneuse à légumes'
  | 'moissonneuse à épinard'
  | 'moissonneuse à pois'
  | 'moissonneuse à haricots'
  | 'planteuse à arbre'
  | 'planteuse à pomme de terre'
  | 'planteuse à canne'
  | 'planteuse légumes';
