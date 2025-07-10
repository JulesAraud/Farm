import type {
  Champ,
  ChampEtat,
  CultureType,
  VehicleType,
  Recolte
} from '../model/FarmModels';
import { initialVehicles } from '../model/vehicles';
import { UsinesDisponibles } from '../model/Factory';
import { db } from '../db';

export async function getAllChamps() {
  const [rows] = await db.query('SELECT * FROM champs');
  return rows;
}


export class FarmService {
  private champs: Champ[] = [];
  private stockage: number = 0;
  private maxStock: number = 100_000;
  private materiels: Record<VehicleType, number> = { ...initialVehicles };
  private recoltes: Recolte[] = [];
  private revenuTotal: number = 0;

  private stockageParCulture: Record<string, number> = {};
  private produitsTransformes: Record<string, number> = {};

  addChamp(champ: Champ) {
    this.champs.push(champ);
  }

  getChamps(): Champ[] {
    return this.champs;
  }

  getChamp(id: number): Champ | undefined {
    return this.champs.find(c => c.id === id);
  }

  reserverMateriel(type: VehicleType): boolean {
    if (this.materiels[type] > 0) {
      this.materiels[type]--;
      return true;
    }
    return false;
  }

  libererMateriel(type: VehicleType): void {
    this.materiels[type]++;
  }

  checkStockageDispo(volume: number): boolean {
    return this.stockage + volume <= this.maxStock;
  }

  recolterChamp(id: number): boolean | 'no-storage' | 'no-machine' {
    const champ = this.getChamp(id);
    if (!champ || champ.state !== 'prêt à récolter') return false;

    const rendement = this.getRendement(champ.culture);
    if (!this.checkStockageDispo(rendement)) return 'no-storage';

    if (!this.reserverMateriel('moissonneuse')) return 'no-machine';

    this.stockage += rendement;
    this.stockageParCulture[champ.culture] = (this.stockageParCulture[champ.culture] || 0) + rendement;
    champ.state = 'récolté';
    this.libererMateriel('moissonneuse');

    const revenu = rendement;
    this.recoltes.push({
      champId: id,
      culture: champ.culture,
      quantite: rendement,
      revenu,
      date: new Date()
    });
    this.revenuTotal += revenu;

    return true;
  }

  viderStockage(): number {
    const vendu = this.stockage;
    this.stockage = 0;
    this.stockageParCulture = {};
    return vendu;
  }

  semerChamp(id: number, culture: CultureType): boolean {
    const champ = this.getChamp(id);
    if (!champ || champ.state !== 'labouré') return false;

    if (!this.reserverMateriel('semeuse')) return false;

    champ.culture = culture;
    champ.state = 'semé';
    this.libererMateriel('semeuse');
    return true;
  }

  fertiliserChamp(id: number): boolean {
    const champ = this.getChamp(id);
    if (!champ || champ.state !== 'semé') return false;

    if (!this.reserverMateriel('fertilisateur')) return false;

    champ.state = 'fertilisé';
    this.libererMateriel('fertilisateur');
    return true;
  }

  preparerChamp(id: number): boolean {
    const champ = this.getChamp(id);
    if (!champ || champ.state !== 'récolté') return false;

    if (!this.reserverMateriel('charrue')) return false;

    champ.state = 'labouré';
    this.libererMateriel('charrue');
    return true;
  }

  transformer(usineNom: string): boolean {
    const usine = UsinesDisponibles.find(u => u.nom === usineNom);
    if (!usine) return false;

    if (usine.quantiteEgale) {
      const quantites = usine.intrants.map(i => this.stockageParCulture[i] || 0);
      const minDispo = Math.min(...quantites);
      if (minDispo === 0) return false;

      for (const i of usine.intrants) {
        this.stockageParCulture[i] -= minDispo;
        this.stockage -= minDispo;
      }

      const totalIn = minDispo * usine.intrants.length;
      const produit = totalIn * usine.multiplicateur;
      this.produitsTransformes[usine.resultat] = (this.produitsTransformes[usine.resultat] || 0) + produit;
      return true;

    } else {
      const intrant = usine.intrants.find(i => (this.stockageParCulture[i] || 0) > 0);
      if (!intrant) return false;

      const quantite = this.stockageParCulture[intrant];
      this.stockageParCulture[intrant] -= quantite;
      this.stockage -= quantite;

      const produit = quantite * usine.multiplicateur;
      this.produitsTransformes[usine.resultat] = (this.produitsTransformes[usine.resultat] || 0) + produit;
      return true;
    }
  }

  getProduitsTransformes(): Record<string, number> {
    return this.produitsTransformes;
  }

  getStockParCulture(): Record<string, number> {
    return this.stockageParCulture;
  }

  getStockageActuel(): number {
    return this.stockage;
  }

  getRevenuTotal(): number {
    return this.revenuTotal;
  }

  getRecoltes(): Recolte[] {
    return this.recoltes;
  }

  getRevenuParCulture(): Record<CultureType, number> {
    const revenus: Partial<Record<CultureType, number>> = {};
    for (const r of this.recoltes) {
      revenus[r.culture] = (revenus[r.culture] || 0) + r.revenu;
    }
    return revenus as Record<CultureType, number>;
  }

  private getRendement(culture: CultureType): number {
    const rendements: Partial<Record<CultureType, number>> = {
      blé: 1000,
      orge: 1000,
      soja: 1000,
      avoine: 1000,
      canola: 1000,
      raisin: 1500,
      olive: 1500,
      'pomme de terre': 5000,
      betterave: 3500,
      coton: 750,
      maïs: 3000,
      tournesol: 3000,
      'canne à sucre': 5000,
      légumes: 2500,
      épinard: 3000,
      pois: 7500,
      'haricots verts': 7500,
      peuplier: 1500
    };
    return rendements[culture] || 0;
  }
}
