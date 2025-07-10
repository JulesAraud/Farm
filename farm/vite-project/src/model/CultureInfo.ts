import { CultureType, VehicleType } from './FarmModels';

export interface CultureInfo {
  type: CultureType;
  rendement: number;
  materiels: VehicleType[];
}

export const CulturesDisponibles: CultureInfo[] = [
  { type: 'blé', rendement: 1000, materiels: ['tracteur', 'semeuse', 'moissonneuse', 'remorque'] },
  { type: 'raisin', rendement: 1500, materiels: ['tracteur', 'semeuse', 'moissonneuse à raisin'] },
  { type: 'olive', rendement: 1500, materiels: ['tracteur', 'planteuse à arbre', 'moissonneuse à olive', 'remorque'] },
  { type: 'pomme de terre', rendement: 5000, materiels: ['tracteur', 'planteuse à pomme de terre', 'moissonneuse à pomme de terre', 'remorque'] },
  { type: 'betterave', rendement: 3500, materiels: ['tracteur', 'semeuse', 'moissonneuse à betterave', 'remorque'] },
  { type: 'coton', rendement: 750, materiels: ['tracteur', 'semeuse', 'moissonneuse à coton', 'remorque semi'] },
  { type: 'maïs', rendement: 3000, materiels: ['tracteur', 'semeuse', 'moissonneuse', 'remorque'] },
  { type: 'canne à sucre', rendement: 5000, materiels: ['tracteur', 'planteuse à canne', 'moissonneuse à canne', 'remorque'] },
  { type: 'légumes', rendement: 2500, materiels: ['tracteur', 'planteuse légumes', 'moissonneuse à légumes', 'remorque'] },
  { type: 'pois', rendement: 7500, materiels: ['tracteur', 'semeuse', 'moissonneuse à pois', 'remorque'] }
];
