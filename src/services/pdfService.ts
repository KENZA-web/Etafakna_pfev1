// src/services/pdfService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Génère un PDF à partir d'un élément HTML et le télécharge.
 * @param elementId - L'ID de l'élément HTML à capturer (ex: "invoice-preview")
 * @param fileName - Nom du fichier PDF (ex: "facture_FAC-123.pdf")
 */
export const downloadPDFFromElement = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément avec l'ID "${elementId}" introuvable.`);
    return;
  }

  try {
    // Capturer l'élément en image
    const canvas = await html2canvas(element, {
      scale: 2,           // Meilleure résolution
      backgroundColor: '#ffffff',
      logging: false,
    });
    const imgData = canvas.toDataURL('image/png');

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const imgWidth = 210; // mm (A4 largeur)
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF :', error);
    throw new Error('Impossible de générer le PDF');
  }
};