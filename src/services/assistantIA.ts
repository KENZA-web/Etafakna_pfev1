// services/assistantIA.ts
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Simulation d'appel API (à remplacer par ton vrai endpoint)
export async function sendMessageToAssistant(
  messages: ChatMessage[],
  documentContext: any
): Promise<string> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));

  const lastQuestion = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  if (lastQuestion.includes('tva')) {
    return "Le taux de TVA applicable est de 19% sur les prestations de services (sauf exceptions).";
  }
  if (lastQuestion.includes('timbre')) {
    return "Un timbre fiscal de 1 TND est obligatoire pour les factures d'un montant supérieur à 10 TND.";
  }
  if (lastQuestion.includes('résumé') || lastQuestion.includes('resume')) {
    return `📄 Document : ${documentContext.id} – Client : ${documentContext.client} – Montant TTC : ${documentContext.ttc} TND. Statut : ${documentContext.status}. Date d'émission : ${documentContext.date}.`;
  }
  return "Je suis votre assistant. Vous pouvez me poser des questions sur ce document (ex: 'Résumé', 'TVA', 'Timbre fiscal').";
}