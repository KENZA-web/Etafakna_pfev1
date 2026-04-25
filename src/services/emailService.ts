import api from './api';

export const sendInvoiceEmail = async (invoiceId: string): Promise<void> => {
  try {
    await api.post(`/invoices/${invoiceId}/send`);
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email :', error);
    throw new Error('Impossible d’envoyer l’email');
  }
};