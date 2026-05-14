import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessageToAssistant(
  messages: ChatMessage[],
  documentContext: any,
): Promise<string> {
  const question = messages[messages.length - 1]?.content || '';
  const invoiceId = documentContext?.id;

  if (!invoiceId) return "Contexte de document manquant.";

  try {
    const response = await api.post<{ success: boolean; data: { answer: string } }>(
      `/invoices/${invoiceId}/chat`,
      { question },
    );
    return response.data.data.answer;
  } catch {
    return "Désolé, une erreur est survenue lors de la communication avec l'assistant.";
  }
}
