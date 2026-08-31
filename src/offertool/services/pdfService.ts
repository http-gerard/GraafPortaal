import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuoteData } from '../types';

export const cleanCategoryName = (name?: string): string => {
  if (!name) return '';
  return name.replace(/^\d+\.\s*/, '').trim();
};

export const generatePdfDocument = async (quote: QuoteData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let currentY = 16;

  // Design Tokens & Brand Colors
  const darkNavy = [24, 26, 32]; // slate-900 Studio Graaf Charcoal
  const limeColor = [193, 237, 0]; // #7b68ee Studio Graaf Lime
  const slateDark = [30, 41, 59]; // #1E293B
  const slateBody = [51, 65, 85]; // #334155
  const slateMuted = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0

  // Running Header
  const renderHeader = (isFirstPage: boolean) => {
    // Top decorative brand bar
    doc.setFillColor(193, 237, 0); // Lime #7b68ee
    doc.rect(0, 0, pageWidth, 3.5, 'F');

    // Brand Logo & Monogram
    doc.setFillColor(24, 26, 32); // Dark Navy badge
    doc.roundedRect(margin, 9, 8.5, 8.5, 1.8, 1.8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(193, 237, 0); // Lime S
    doc.text('S', margin + 2.8, 15.2);

    // Studio Graaf Wordmark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(24, 26, 32);
    doc.text('studio graaf', margin + 11.5, 15.5);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Digitaal bureau voor merk & web', margin + 11.5, 19);

    // Right-aligned official company meta
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(24, 26, 32);
    doc.text('Studio Graaf VOF', pageWidth - margin, 10.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('BTW: BE 1035.446.987', pageWidth - margin, 14.2, { align: 'right' });
    doc.text('Maaiwanters 10, 2230 Herselt', pageWidth - margin, 17.7, { align: 'right' });
    doc.text('warre@studio-graaf.be • www.studio-graaf.be', pageWidth - margin, 21.2, { align: 'right' });

    // Subtle header divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 24.5, pageWidth - margin, 24.5);
  };

  // Running Footer
  const renderFooter = (pageNumber: number, totalPages: number) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    // Top footer line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.text(`Offerte ${quote.quoteNumber} • ${quote.client.companyName}`, margin, pageHeight - 7);
    doc.text('Studio Graaf VOF • www.studio-graaf.be', pageWidth / 2, pageHeight - 7, { align: 'center' });
    doc.text(`Pagina ${pageNumber} van ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  };

  // Render Page 1 Header
  renderHeader(true);
  currentY = 28;

  // ----------------------------------------------------
  // CLIENT & QUOTE META CARDS (Side by Side)
  // (Removed hero OFFERTEVOORSTEL header per request)
  // ----------------------------------------------------
  const cardWidth = (pageWidth - (margin * 2) - 8) / 2;
  const cardHeight = 32;

  // Left Card: Client
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('OPGESTELD VOOR:', margin + 4.5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 26, 32);
  doc.text(quote.client.companyName, margin + 4.5, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`T.a.v. ${quote.client.contactPerson}${quote.client.jobTitle ? ` (${quote.client.jobTitle})` : ''}`, margin + 4.5, currentY + 16);
  doc.text(`${quote.client.address}, ${quote.client.postalCode} ${quote.client.city}`, margin + 4.5, currentY + 20.5);
  doc.text(`BTW: ${quote.client.vatNumber || 'Niet opgegeven'} • ${quote.client.email}`, margin + 4.5, currentY + 25);

  // Right Card: Quote Details
  const rightCardX = margin + cardWidth + 8;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightCardX, currentY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightCardX, currentY, cardWidth, cardHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFERTE GEGEVENS:', rightCardX + 4.5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(24, 26, 32);
  doc.text('Offertenummer:', rightCardX + 4.5, currentY + 11);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.quoteNumber, rightCardX + 32, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.text('Offertedatum:', rightCardX + 4.5, currentY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.createdAt, rightCardX + 32, currentY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Geldig tot:', rightCardX + 4.5, currentY + 20.5);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.validUntil, rightCardX + 32, currentY + 20.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Contactpersoon:', rightCardX + 4.5, currentY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text('Warre Geerts (Co-Founder)', rightCardX + 32, currentY + 25);

  currentY += cardHeight + 8;

  const activeCategories = quote.categories.filter(cat =>
    quote.items.some(item => item.categoryId === cat.id && item.selected)
  );

  // ----------------------------------------------------
  // SECTION 1: SPECIFICATIE VAN DIENSTEN & INVESTERING (FIRST)
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(24, 26, 32);
  doc.text('Specificatie van Diensten & Investering', margin, currentY);

  // Decorative underline
  doc.setFillColor(193, 237, 0);
  doc.rect(margin, currentY + 1.5, 24, 0.8, 'F');
  currentY += 5.5;

  const tableData: any[] = [];

  activeCategories.forEach((cat) => {
    const catItems = quote.items.filter(item => item.categoryId === cat.id && item.selected);
    if (catItems.length === 0) return;

    const cleanName = cleanCategoryName(cat.name || '').toUpperCase();

    // Group banner row for category (Clean, no numbers)
    tableData.push([
      {
        content: cleanName,
        colSpan: 5,
        styles: {
          fillColor: [241, 245, 249],
          fontStyle: 'bold',
          textColor: [24, 26, 32],
          fontSize: 8,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 }
        }
      }
    ]);

    catItems.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      const lineTotal = itemPrice * itemQty;
      const typeLabel = item.billingType === 'monthly' ? '/ mnd' : 'eenmalig';

      const scopeText = item.detailedScope && item.detailedScope.length > 0
        ? `\n• ${item.detailedScope.slice(0, 2).join('  • ')}`
        : '';

      tableData.push([
        item.billingType === 'monthly' ? `${item.name}\n(Maandelijkse Service)` : item.name,
        `${item.shortDescription || ''}${scopeText}`,
        `${itemQty} ${item.unit || 'stuk'}`,
        `€ ${itemPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
        `€ ${lineTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} ${typeLabel}`
      ]);
    });
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Dienst / Onderdeel', 'Omschrijving & Scope', 'Aantal', 'Prijs excl.', 'Totaal excl.']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [24, 26, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 }
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: { top: 2.8, bottom: 2.8, left: 3, right: 3 },
      lineColor: [226, 232, 240],
      lineWidth: { bottom: 0.2 }
    },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: [24, 26, 32] },
      1: { cellWidth: 68 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [24, 26, 32] }
    },
    margin: { left: margin, right: margin }
  });

  // Calculate position after table
  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if financial summary fits
  if (currentY > pageHeight - 65) {
    doc.addPage();
    renderHeader(false);
    currentY = 32;
  }

  // ----------------------------------------------------
  // TOTALS & INVESTMENT BREAKDOWN
  // ----------------------------------------------------
  const selectedItems = (quote.items || []).filter(i => i.selected);
  const oneOffItems = selectedItems.filter(i => i.billingType === 'one_off');
  const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');

  const oneOffSubtotal = oneOffItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);
  const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);

  const discountVal = Number(quote.overallDiscountValue) || 0;
  const discountAmount = quote.overallDiscountType === 'percentage'
    ? (oneOffSubtotal * discountVal) / 100
    : discountVal;

  const finalOneOff = Math.max(0, oneOffSubtotal - discountAmount);
  const vatRate = Number(quote.vatRate) || 21;
  const vatAmount = (finalOneOff * vatRate) / 100;
  const totalInclVat = finalOneOff + vatAmount;

  // Left Box: Payment Terms & Notes
  const summaryBoxW = 86;
  const summaryBoxX = pageWidth - margin - summaryBoxW;
  const termsBoxW = summaryBoxX - margin - 8;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, termsBoxW, 44, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, termsBoxW, 44, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(24, 26, 32);
  doc.text('BETALINGSVOORWAARDEN & PROJECTKADER:', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const splitTerms = doc.splitTextToSize(quote.paymentTerms || '30% voorschot bij akkoord, 40% bij oplevering ontwerpfase, 30% bij finale livegang.', termsBoxW - 8);
  doc.text(splitTerms, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Rechtstreeks contact:', margin + 4, currentY + 32);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(24, 26, 32);
  doc.text('Warre Geerts • warre@studio-graaf.be', margin + 4, currentY + 36.5);

  // Right Box: Financial Summary Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxW, 44, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(summaryBoxX, currentY, summaryBoxW, 44, 2, 2, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  let sumY = currentY + 5.5;
  doc.text('Subtotaal Eenmalig (excl. BTW):', summaryBoxX + 4.5, sumY);
  doc.text(`€ ${(Number(oneOffSubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxW - 4.5, sumY, { align: 'right' });

  if ((quote.overallDiscountValue || 0) > 0) {
    sumY += 4.5;
    doc.setTextColor(220, 38, 38);
    doc.text(`Korting (${quote.overallDiscountValue}%):`, summaryBoxX + 4.5, sumY);
    doc.text(`- € ${(Number(discountAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxW - 4.5, sumY, { align: 'right' });
    doc.setTextColor(71, 85, 105);
  }

  sumY += 4.5;
  doc.text(`BTW (${quote.vatRate || 21}%):`, summaryBoxX + 4.5, sumY);
  doc.text(`€ ${(Number(vatAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxW - 4.5, sumY, { align: 'right' });

  sumY += 6;
  // Total Bar (Signature Dark Charcoal + Lime Text)
  doc.setFillColor(24, 26, 32);
  doc.roundedRect(summaryBoxX + 2.5, sumY - 3.8, summaryBoxW - 5, 8.5, 1.2, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(193, 237, 0); // Studio Graaf Lime
  doc.text('Totaal Eenmalig (incl. BTW):', summaryBoxX + 5, sumY + 1.6);
  doc.text(`€ ${(Number(totalInclVat) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, summaryBoxX + summaryBoxW - 5, sumY + 1.6, { align: 'right' });

  if (monthlySubtotal > 0) {
    sumY += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(24, 26, 32);
    doc.text('Doorlopend / Maandelijks:', summaryBoxX + 4.5, sumY);
    doc.text(`€ ${(Number(monthlySubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })} / mnd excl.`, summaryBoxX + summaryBoxW - 4.5, sumY, { align: 'right' });
  }

  currentY += 52;

  // ----------------------------------------------------
  // SECTION 2: STRATEGISCHE AANPAK & MEERWAARDE (AFTER PRICING)
  // ----------------------------------------------------
  if (activeCategories.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      renderHeader(false);
      currentY = 32;
    }

    // Section Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(24, 26, 32);
    doc.text('Strategische Aanpak & Toegevoegde Waarde', margin, currentY);

    // Decorative underline
    doc.setFillColor(193, 237, 0);
    doc.rect(margin, currentY + 1.5, 24, 0.8, 'F');
    currentY += 6;

    activeCategories.forEach((cat) => {
      const cleanName = cleanCategoryName(cat.name);

      // Check page break safety
      if (currentY > pageHeight - 45) {
        doc.addPage();
        renderHeader(false);
        currentY = 32;
      }

      // Category Card Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 6.5, 1.2, 1.2, 'F');

      // Category color pip
      doc.setFillColor(193, 237, 0);
      doc.circle(margin + 4, currentY + 3.25, 1.5, 'F');

      // Category Title (NO NUMBERS)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(24, 26, 32);
      doc.text(cleanName, margin + 8, currentY + 4.4);

      if (cat.badge) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const titleWidth = doc.getTextWidth(cleanName);
        doc.text(`•  ${cat.badge}`, margin + 10 + titleWidth, currentY + 4.4);
      }

      currentY += 9;

      // Description text
      if (cat.valueProposition?.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const splitDesc = doc.splitTextToSize(cat.valueProposition.description, pageWidth - (margin * 2) - 6);
        doc.text(splitDesc, margin + 3, currentY);
        currentY += (splitDesc.length * 3.8) + 2;
      }

      // Business Impact Bullets
      if (cat.valueProposition?.businessImpacts && cat.valueProposition.businessImpacts.length > 0) {
        cat.valueProposition.businessImpacts.slice(0, 3).forEach((impact) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(16, 185, 129); // Emerald checkmark
          doc.text('✓', margin + 3.5, currentY);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(impact, margin + 7.5, currentY);
          currentY += 3.8;
        });
      }

      currentY += 3;
    });

    currentY += 2;
  }

  // ----------------------------------------------------
  // SECTION 3: AKKOORDVERKLARING & HANDTEKENINGEN
  // ----------------------------------------------------
  if (currentY > pageHeight - 48) {
    doc.addPage();
    renderHeader(false);
    currentY = 32;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 26, 32);
  doc.text('Akkoordverklaring & Handtekening', margin, currentY);

  // Decorative underline
  doc.setFillColor(193, 237, 0);
  doc.rect(margin, currentY + 1.5, 20, 0.8, 'F');
  currentY += 5.5;

  const sigBoxW = (pageWidth - (margin * 2) - 8) / 2;
  const sigBoxH = 30;

  // Studio Graaf Signature
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, sigBoxW, sigBoxH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, sigBoxW, sigBoxH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(24, 26, 32);
  doc.text('VOOR AKKOORD NAMENS STUDIO GRAAF VOF:', margin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Bedrijf: Studio Graaf VOF', margin + 4, currentY + 9.5);
  doc.text('Naam: Warre Geerts', margin + 4, currentY + 13.5);
  doc.text(`Datum: ${quote.createdAt}`, margin + 4, currentY + 17.5);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 4, currentY + 24, margin + sigBoxW - 4, currentY + 24);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('(Handtekening Warre Geerts)', margin + 4, currentY + 27.5);

  // Client Signature
  const clientSigX = margin + sigBoxW + 8;
  doc.setFillColor(quote.digitalSignature ? 240 : 248, quote.digitalSignature ? 253 : 250, quote.digitalSignature ? 244 : 252);
  doc.roundedRect(clientSigX, currentY, sigBoxW, sigBoxH, 2, 2, 'F');
  doc.setDrawColor(quote.digitalSignature ? 16 : 226, quote.digitalSignature ? 185 : 232, quote.digitalSignature ? 129 : 240);
  doc.roundedRect(clientSigX, currentY, sigBoxW, sigBoxH, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(24, 26, 32);
  doc.text(`VOOR AKKOORD NAMENS ${(quote.client?.companyName || 'KLANT').toUpperCase()}:`, clientSigX + 4, currentY + 5);

  if (quote.digitalSignature) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.text('✓ DIGITAAL ONDERTEKEND', clientSigX + 4, currentY + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Ondertekenaar: ${quote.digitalSignature.signedBy} (${quote.digitalSignature.jobTitle || 'Zaakvoerder'})`, clientSigX + 4, currentY + 14);
    doc.text(`Datum & Tijd: ${quote.digitalSignature.signedAt}`, clientSigX + 4, currentY + 18);
    doc.text(`E-mail: ${quote.digitalSignature.email}`, clientSigX + 4, currentY + 22);
    
    // Add the visual drawn signature if it exists
    if (quote.digitalSignature.signatureImage) {
      try {
        // signatureImage is a base64 data URL (e.g. data:image/png;base64,...)
        // Canvas aspect ratio is 450x120 = 3.75
        doc.addImage(quote.digitalSignature.signatureImage, 'PNG', clientSigX + sigBoxW - 38, currentY + 14, 35, 9.3);
      } catch (e) {
        console.warn('Could not add signature image to PDF:', e);
      }
    }

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Digitale verificatie ID: SG-SIG-${quote.quoteNumber.replace(/[^0-9]/g, '')}`, clientSigX + 4, currentY + 26.5);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Bedrijf: ${quote.client.companyName}`, clientSigX + 4, currentY + 9.5);
    doc.text(`Naam: ${quote.client.contactPerson}`, clientSigX + 4, currentY + 13.5);
    doc.text('Datum: .....................................................', clientSigX + 4, currentY + 17.5);

    doc.setDrawColor(203, 213, 225);
    doc.line(clientSigX + 4, currentY + 24, clientSigX + sigBoxW - 4, currentY + 24);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`(Handtekening ${quote.client.contactPerson})`, clientSigX + 4, currentY + 27.5);
  }

  // Add Page Numbers across all generated pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderFooter(i, totalPages);
  }

  // Save the PDF
  const sanitizedFilename = `Offerte_${quote.quoteNumber}_${quote.client.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(sanitizedFilename);
};
