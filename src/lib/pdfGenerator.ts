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
  sellerPhone?: string;
}

/**
 * Generates a beautiful professional corporate PDF for Sono Show Móveis.
 * Saves the file directly to the device.
 */
export async function generateProfessionalQuotePDF({
  quote,
  sellerName,
  branchName,
  sellerPhone
}: GeneratePDFParams): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let currentY = 15;

    // --- Clean Corporate Brand Header Frame ---
    doc.setFillColor(248, 250, 252); // soft slate background box
    doc.rect(12, currentY, 182, 24, 'F');
    doc.setDrawColor(226, 232, 240); // slate 200 frame border
    doc.setLineWidth(0.3);
    doc.rect(12, currentY, 182, 24, 'S');

    // Draw the high-fidelity premium SonoShow Oval Logo Badge
    // Outer silver shadow ellipse
    doc.setFillColor(220, 222, 225); // silver grey (#dcdee1)
    doc.ellipse(37.5, currentY + 12, 24.5, 9, 'F');

    // Inner navy blue ellipse matching original logo background
    doc.setFillColor(18, 30, 49); // Dark navy (#121e31)
    doc.ellipse(39, currentY + 12, 23.5, 8.2, 'F');

    // Gold "SONO" Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(241, 179, 48); // Golden yellow (#f1b330)
    doc.text('SONO', 24.5, currentY + 11.2, { align: 'left' });

    // White "SHOW" Text
    doc.setTextColor(255, 255, 255);
    doc.text('SHOW', 40.5, currentY + 11.2, { align: 'left' });

    // "MÓVEIS" Text centered below
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('M Ó V E I S', 39, currentY + 16.2, { align: 'center' });

    // Right-aligned header titles
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('PROPOSTA COMERCIAL', 190, currentY + 10.5, { align: 'right' });

    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ATENDEPRO • ORÇAMENTO EXCLUSIVO', 190, currentY + 15.5, { align: 'right' });

    currentY += 30;

    // --- Document Meta / Title ---
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`PROPOSTA COMERCIAL #${quote.id.substring(0, 8).toUpperCase()}`, 12, currentY);
    
    // Thin line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(12, currentY + 3, 194, currentY + 3);

    currentY += 10;

    // --- Two Column Metadata Layout ---
    // Column 1: Client Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DADOS DO CLIENTE', 15, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFontSize(8.5);
    const clientNameClamped = quote.clientName.toUpperCase();
    doc.text(`NOME: ${clientNameClamped}`, 15, currentY + 6);
    
    // Format Client Phone
    const cleanPhone = quote.clientPhone;
    const formattedPhone = cleanPhone.length === 11 
      ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}` 
      : cleanPhone.length === 10
      ? `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`
      : cleanPhone;
    doc.text(`WHATSAPP: ${formattedPhone}`, 15, currentY + 12);

    // Column 2: Salesperson info / Dates (Formulário do Vendedor)
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('INFORMAÇÕES DE VENDA', 108, currentY);

    const emissionDateStr = new Date(quote.createdAt).toLocaleDateString('pt-BR');
    const validityDays = quote.validityDays || 5;
    const limitDate = new Date(new Date(quote.createdAt).getTime() + (validityDays * 24 * 60 * 60 * 1000));
    const limitDateStr = limitDate.toLocaleDateString('pt-BR');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.setFontSize(8.5);
    
    // Strip suffixes like (Vendedor Centro)
    const cleanSellerName = sellerName
      .replace(/\s*\(vendedor\s+centro\)/i, '')
      .replace(/\s*\(vendedora\s+centro\)/i, '')
      .replace(/\s*\(gerente\s+centro\)/i, '')
      .replace(/\s*\(supervisor\s+geral\)/i, '');

    doc.text(`VENDEDOR: ${cleanSellerName.toUpperCase()}`, 108, currentY + 6);
    doc.text(`FILIAL: ${branchName.toUpperCase()}`, 108, currentY + 12);
    
    const formattedSellerPhone = sellerPhone || '(21) 97777-3333';
    doc.text(`CONTATO: ${formattedSellerPhone}`, 108, currentY + 18);

    // Decorative internal line inside info box separating human info from dates
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.3);
    doc.line(12, currentY + 22.5, 194, currentY + 22.5);

    // Horizontal secondary metadata strip at the card bottom floor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`EMISSÃO: ${emissionDateStr}`, 15, currentY + 27.5);
    doc.text(`VALIDADE: ${validityDays} DIAS`, 191, currentY + 27.5, { align: 'right' });

    // Structural border for info box
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(12, currentY - 5, 182, 36, 'S');

    currentY += 36;

    // --- Product List Details ---
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('DESCRIÇÃO DA PROPOSTA', 12, currentY);

    currentY += 4;

    // Items Header Table
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(12, currentY, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.text('CÓD / PRODUTO', 14, currentY + 5.5);
    doc.text('CATEGORIA', 110, currentY + 5.5);
    doc.text('VALOR UN.', 150, currentY + 5.5, { align: 'right' });
    doc.text('QTD', 170, currentY + 5.5, { align: 'right' });
    doc.text('TOTAL', 192, currentY + 5.5, { align: 'right' });

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
      doc.line(12, itemY + 16, 194, itemY + 16);

      // Draw beautiful thumbnail / image placeholder
      doc.setFillColor(248, 250, 252);
      doc.rect(14, itemY + 2, 12, 12, 'F');
      
      // Let's try drawing actual product images if we have them
      let imageRendered = false;
      if (item.imageUrl) {
        try {
          const base64Img = await loadImageToBase64(item.imageUrl);
          if (base64Img) {
            doc.addImage(base64Img, 'JPEG', 14, itemY + 2, 12, 12);
            imageRendered = true;
          }
        } catch (e) {
          console.warn('Could not load image to PDF safely:', e);
        }
      }

      // If no image rendered, draw an elegant minimalist Box shape icon in vector
      if (!imageRendered) {
        doc.setDrawColor(148, 163, 184); // Slate 400
        doc.line(17, itemY + 4, 23, itemY + 4);
        doc.line(17, itemY + 4, 17, itemY + 10);
        doc.line(23, itemY + 4, 23, itemY + 10);
        doc.line(17, itemY + 10, 23, itemY + 10);
        
        doc.line(17, itemY + 4, 20, itemY + 6);
        doc.line(23, itemY + 4, 20, itemY + 6);
        doc.line(20, itemY + 6, 20, itemY + 10);
      }

      // Item code and title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      
      const titleLines = doc.splitTextToSize(item.name, 76);
      doc.text(titleLines.slice(0, 2), 29, itemY + 5.5);

      const subtitleYOffset = titleLines.length > 1 ? 12.5 : 9.5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.setFontSize(7.5);
      doc.text(`CÓD: ${item.code} | ${item.nickname || 'Geral'}`, 29, itemY + subtitleYOffset);

      // Category
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      const categoryLabel = (item.productId === 'custom-item') ? 'Geral' : (quote.category === 'other' ? 'Especial' : 'Mobiliário');
      doc.text(categoryLabel.toUpperCase(), 110, itemY + 8);

      // Quantities and prices
      doc.text(formatReal(item.price), 150, itemY + 8, { align: 'right' });
      doc.text(item.quantity.toString(), 170, itemY + 8, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(formatReal(item.price * item.quantity), 192, itemY + 8, { align: 'right' });

      currentY += 16;
    }

    currentY += 5;

    // --- Observations / Terms Section ---
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.rect(12, currentY, 110, 32, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('OBSERVAÇÕES & CONDIÇÕES INTEGRADA', 16, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    
    const obsText = quote.notes || 'Nenhuma observação cadastrada.';
    const lines = doc.splitTextToSize(obsText, 102);
    doc.text(lines, 16, currentY + 11);

    // Standard conditions
    doc.text('* Preços e condições sujeitos a alteração sem prévio aviso.', 16, currentY + 22);
    doc.text('* Garantia contratual contra defeitos de fabricação de até 90 dias.', 16, currentY + 26);

    // --- Highlighted Calculations Block ---
    const rightColX = 124;
    doc.setFillColor(248, 250, 252);
    doc.rect(rightColX, currentY, 70, 32, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(rightColX, currentY, 70, 32, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('SUBTOTAL', rightColX + 5, currentY + 6);
    doc.text(formatReal(quote.value), rightColX + 65, currentY + 6, { align: 'right' });

    doc.text('FRETE / MONTAGEM', rightColX + 5, currentY + 12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green 500
    doc.text('GRÁTIS', rightColX + 65, currentY + 12, { align: 'right' });

    // Separation line
    doc.setDrawColor(226, 232, 240);
    doc.line(rightColX, currentY + 18, rightColX + 70, currentY + 18);

    // Active Total Box
    doc.setFillColor(2, 6, 23); // Dark slate bg for intense professional total emphasis
    doc.rect(rightColX, currentY + 18, 70, 14, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(251, 191, 36); // Golden Amber 400
    doc.setFontSize(10.5);
    doc.text('TOTAL', rightColX + 5, currentY + 27);
    doc.text(formatReal(quote.value), rightColX + 65, currentY + 27, { align: 'right' });

    currentY += 40;

    // --- Footer / Signature Sign-off ---
    doc.setDrawColor(226, 232, 240);
    doc.line(12, currentY, 194, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('Sono Show Móveis S.A. | Atendimento Exclusivo AtendePro', 12, currentY + 5);
    doc.text('Documento gerado digitalmente pelo comitê de vendas e relacionamento ao consumidor.', 12, currentY + 9);
    doc.text('Agradecemos a sua preferência!', 194, currentY + 5, { align: 'right' });

    // Save and download locally
    const filename = `Orcamento_${quote.clientName.replace(/\s+/g, '_')}_${quote.id.substring(0,6)}.pdf`;
    doc.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
