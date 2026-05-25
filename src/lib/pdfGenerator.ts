import { jsPDF } from 'jspdf';
import { Quote, QuoteItem } from '../types';

/**
 * Utility to convert an image URL to a base64 string safely, honoring CORS.
 * Returns null if the load fails or is blocked by CORS.
 */
function loadImageToBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataURL);
        } else {
          resolve(null);
        }
      } catch (err) {
        console.warn('Failed to convert image to base64, likely CORS:', err);
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Formats values to Brazilian Real currency format.
 */
function formatReal(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface GeneratePDFParams {
  quote: Quote;
  sellerName: string;
  branchName: string;
}

/**
 * Generates a beautiful professional corporate PDF for Sono Show Móveis.
 * Saves the file directly to the device.
 */
export async function generateProfessionalQuotePDF({
  quote,
  sellerName,
  branchName
}: GeneratePDFParams): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageCount = 1;
    let currentY = 15;

    // --- Elegant Brand Header ---
    // Background Slate Header
    doc.setFillColor(2, 6, 23); // #020617 Slate 950
    doc.rect(10, currentY, 190, 24, 'F');

    // Logo & System Text
    doc.setTextColor(251, 191, 36); // #fbbf24 Amber 400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SONO SHOW MÓVEIS', 15, currentY + 15);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('ATENDEPRO • ORÇAMENTO EXCLUSIVO', 150, currentY + 14);

    currentY += 30;

    // --- Document Meta / Title ---
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`PROPOSTA COMERCIAL #${quote.id.substring(0, 8).toUpperCase()}`, 10, currentY);
    
    // Thin line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(10, currentY + 3, 200, currentY + 3);

    currentY += 10;

    // --- Two Column Metadata Layout ---
    // Column 1: Client Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DADOS DO CLIENTE', 12, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`NOME: ${quote.clientName.toUpperCase()}`, 12, currentY + 6);
    
    // Format Client Phone
    const cleanPhone = quote.clientPhone;
    const formattedPhone = cleanPhone.length === 11 
      ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}` 
      : cleanPhone.length === 10
      ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`
      : cleanPhone;
    doc.text(`WHATSAPP: ${formattedPhone}`, 12, currentY + 12);

    // Column 2: Salesperson info / Dates
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMAÇÕES DE VENDA', 110, currentY);

    const emissionDateStr = new Date(quote.createdAt).toLocaleDateString('pt-BR');
    const validityDays = quote.validityDays || 5;
    const limitDate = new Date(new Date(quote.createdAt).getTime() + (validityDays * 24 * 60 * 60 * 1000));
    const limitDateStr = limitDate.toLocaleDateString('pt-BR');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`VENDEDOR: ${sellerName.toUpperCase()}`, 110, currentY + 6);
    doc.text(`UNIDADE: ${branchName}`, 110, currentY + 12);
    doc.text(`DATA EMISSÃO: ${emissionDateStr}`, 110, currentY + 18);
    doc.text(`VALIDADE DO ORÇAMENTO: ${validityDays} dias (Até ${limitDateStr})`, 110, currentY + 24);

    // Structural border for info box
    doc.setDrawColor(241, 245, 249); // Slate 100
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(10, currentY - 4, 190, 32, 'S');

    currentY += 34;

    // --- Product List Details ---
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DESCRIÇÃO DA PROPOSTA', 10, currentY);

    currentY += 4;

    // Items Header Table
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(10, currentY, 190, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text('CÓD / PRODUTO', 12, currentY + 5.5);
    doc.text('CATEGORIA', 105, currentY + 5.5);
    doc.text('VALOR UN.', 135, currentY + 5.5);
    doc.text('QTD', 160, currentY + 5.5);
    doc.text('TOTAL', 178, currentY + 5.5);

    currentY += 8;

    const items: QuoteItem[] = quote.items && quote.items.length > 0 
      ? quote.items 
      : [{
          productId: 'custom-item',
          code: 'GEN-01',
          name: quote.productInterest || 'Atendimento / Produtos Diversos',
          nickname: 'Item de Desejo',
          price: quote.value,
          quantity: 1,
          imageUrl: '',
          description: 'Produtos de mobiliário residencial a combinar na loja.'
        }];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemY = currentY;

      // Draw light horizontal separator
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(10, itemY + 16, 200, itemY + 16);

      // Draw beautiful thumbnail / image placeholder
      doc.setFillColor(248, 250, 252);
      doc.rect(12, itemY + 2, 12, 12, 'F');
      
      // Let's try drawing actual product images if we have them
      let imageRendered = false;
      if (item.imageUrl) {
        try {
          const base64Img = await loadImageToBase64(item.imageUrl);
          if (base64Img) {
            doc.addImage(base64Img, 'JPEG', 12, itemY + 2, 12, 12);
            imageRendered = true;
          }
        } catch (e) {
          console.warn('Could not load image to PDF safely:', e);
        }
      }

      // If no image rendered, draw an elegant minimalist Box shape icon in vector
      if (!imageRendered) {
        doc.setDrawColor(148, 163, 184); // Slate 400
        doc.line(15, itemY + 4, 21, itemY + 4);
        doc.line(15, itemY + 4, 15, itemY + 10);
        doc.line(21, itemY + 4, 21, itemY + 10);
        doc.line(15, itemY + 10, 21, itemY + 10);
        
        doc.line(15, itemY + 4, 18, itemY + 6);
        doc.line(21, itemY + 4, 18, itemY + 6);
        doc.line(18, itemY + 6, 18, itemY + 10);
      }

      // Item code and title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      
      const titleLimit = 48;
      const cleanTitle = item.name.length > titleLimit ? `${item.name.substring(0, titleLimit)}...` : item.name;
      doc.text(cleanTitle, 27, itemY + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.setFontSize(7.5);
      doc.text(`CÓDIGO: ${item.code} | ${item.nickname}`, 27, itemY + 10);

      // Category
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8.5);
      const categoryLabel = (item.productId === 'custom-item') ? 'Geral' : (quote.category === 'other' ? 'Especial' : 'Mobiliário');
      doc.text(categoryLabel.toUpperCase(), 105, itemY + 8);

      // Quantities and prices
      doc.text(formatReal(item.price), 135, itemY + 8);
      doc.text(item.quantity.toString(), 162, itemY + 8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatReal(item.price * item.quantity), 178, itemY + 8);

      currentY += 16;
    }

    currentY += 5;

    // --- Observations / Terms Section ---
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.rect(10, currentY, 115, 30, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('OBSERVAÇÕES & CONDIÇÕES INTEGRADA', 14, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7);
    
    const obsText = quote.notes || 'Nenhuma observação cadastrada.';
    const lines = doc.splitTextToSize(obsText, 105);
    doc.text(lines, 14, currentY + 10);

    // Standard conditions
    doc.text('* Preços e condições sujeitos a alteração sem prévio aviso.', 14, currentY + 22);
    doc.text('* Garantia contratual contra defeitos de fabricação de até 90 dias.', 14, currentY + 26);

    // --- Highlighted Calculations Block ---
    const rightColX = 130;
    doc.setFillColor(248, 250, 252);
    doc.rect(rightColX, currentY, 70, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(rightColX, currentY, 70, 30, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('SUBTOTAL', rightColX + 5, currentY + 6);
    doc.text(formatReal(quote.value), rightColX + 45, currentY + 6);

    doc.text('FRETE / MONTAGEM', rightColX + 5, currentY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green 500
    doc.text('GRÁTIS', rightColX + 45, currentY + 12);

    // Separation line
    doc.setDrawColor(226, 232, 240);
    doc.line(rightColX, currentY + 16, rightColX + 70, currentY + 16);

    // Active Total Box
    doc.setFillColor(2, 6, 23); // Dark slate bg for intense professional total emphasis
    doc.rect(rightColX, currentY + 16, 70, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36); // Golden Amber 400
    doc.setFontSize(10.5);
    doc.text('TOTAL', rightColX + 5, currentY + 25);
    doc.text(formatReal(quote.value), rightColX + 40, currentY + 25);

    currentY += 38;

    // --- Footer / Signature Sign-off ---
    doc.setDrawColor(226, 232, 240);
    doc.line(10, currentY, 200, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Sono Show Móveis S.A. | Atendimento Exclusivo AtendePro', 10, currentY + 5);
    doc.text('Documento gerado digitalmente pelo comitê de vendas e relacionamento ao consumidor.', 10, currentY + 9);
    doc.text('Agradecemos a sua preferência!', 150, currentY + 5);

    // Save and download locally
    const filename = `Orçamento_${quote.clientName.replace(/\s+/g, '_')}_${quote.id.substring(0,6)}.pdf`;
    doc.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
