// services/moteurFiscal.ts
export interface FiscalAnalysis {
  ht: number;
  tvaRate: number;
  tvaAmount: number;
  timbreAmount: number;
  rasRate: number;
  rasAmount: number;
  ttc: number;
  suggestions?: string[];
}

// Simulation d'analyse fiscale
export async function analyzeFiscal(document: any): Promise<FiscalAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Calcul à partir des lignes du document
  const ht = document.lines?.reduce((sum: number, line: any) => sum + (line.quantity * line.unitPrice), 0) || 0;
  const tvaRate = 19;
  const tvaAmount = ht * (tvaRate / 100);
  const timbreAmount = 1; // 1 TND fixe
  const rasRate = 15;
  const rasAmount = ht * (rasRate / 100);
  const ttc = ht + tvaAmount + timbreAmount - rasAmount;

  // Suggestions éventuelles
  const suggestions: string[] = [];
  if (document.fiscal?.tva !== true) suggestions.push("Activer la TVA 19% pour être conforme.");
  if (document.fiscal?.timbre !== true && ht > 10) suggestions.push("Ajouter le timbre fiscal (1 TND).");
  if (document.fiscal?.ras !== true && ht > 1000) suggestions.push("Appliquer la retenue à la source (15%) pour les prestations B2B.");

  return { ht, tvaRate, tvaAmount, timbreAmount, rasRate, rasAmount, ttc, suggestions };
}