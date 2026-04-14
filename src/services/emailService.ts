// src/services/emailService.ts
import emailjs from '@emailjs/browser';

// Vos identifiants EmailJS
const EMAILJS_SERVICE_ID = 'service_etafakna';
const EMAILJS_TEMPLATE_ID = 'template_e2yzt89';
const EMAILJS_USER_ID = 'BpfDcwESWfKfKl1u_';

export interface EmailParams {
  to_email: string;
  to_name: string;
  invoice_id: string;
  invoice_amount: string;
  invoice_date: string;
}

export const sendInvoiceEmail = async (params: EmailParams): Promise<void> => {
  try {
    const templateParams = {
      to_email: params.to_email,
      to_name: params.to_name,
      invoice_id: params.invoice_id,
      invoice_amount: params.invoice_amount,
      invoice_date: params.invoice_date,
    };
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email :', error);
    throw new Error('Impossible d’envoyer l’email');
  }
};