import pptxgen from 'pptxgenjs';
import { QuoteData } from '../types';

export const cleanCategoryName = (name?: string): string => {
  if (!name) return '';
  return name.replace(/^\d+\.\s*/, '').trim();
};

export const generatePowerPointPresentation = async (quote: QuoteData): Promise<void> => {
  const pptx = new pptxgen();

  // Explicitly define 16:9 widescreen layout (13.333 x 7.5 inches)
  // This guarantees exact coordinates matching modern PowerPoint / Keynote / Google Slides
  pptx.defineLayout({ name: 'CUSTOM_16_9', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM_16_9';

  pptx.author = 'Studio Graaf';
  pptx.company = 'Studio Graaf VOF';
  pptx.title = `${quote.projectName} - ${quote.client.companyName}`;

  // Brand Palette Constants (Matching PresentationModal Light Theme)
  const BG_WHITE = 'FFFFFF';
  const BG_LIGHT_CARD = 'F7F8F9';
  const BG_WHITE_CARD = 'FFFFFF';
  const BG_DARK_NAVY = '181A20';
  const LIME_ACCENT = 'C1ED00';
  const TEXT_DARK = '181A20';
  const TEXT_BODY = '292D34';
  const TEXT_MUTED = '7C828D';
  const BORDER_COLOR = 'E8E9EB';
  const EMERALD_GREEN = '059669';

  // Filter categories that have selected items
  const activeCategories = (quote.categories || []).filter(cat => 
    (quote.items || []).some(item => item.categoryId === cat.id && item.selected)
  );

  // Financial calculations
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

  // Slide Count: Cover + Vision + Categories + Investment + Timeline + Closing
  const totalSlideCount = 2 + activeCategories.length + 3;

  // Helper: Top Brand Bar across inner slides
  const addSlideHeader = (slide: pptxgen.Slide, eyebrow: string, title: string) => {
    // Top subtle brand line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.08,
      fill: { color: LIME_ACCENT },
      line: { color: LIME_ACCENT }
    });

    // Eyebrow
    slide.addText((eyebrow || '').toUpperCase(), {
      x: 0.8,
      y: 0.42,
      w: 8.0,
      h: 0.25,
      fontSize: 8.5,
      bold: true,
      color: TEXT_DARK,
      charSpacing: 1.5
    });

    // Title
    slide.addText(title, {
      x: 0.8,
      y: 0.68,
      w: 11.5,
      h: 0.55,
      fontSize: 20,
      bold: true,
      color: TEXT_DARK,
      fontFace: 'Arial'
    });
  };

  // Helper: Slide Footer
  const addSlideFooter = (slide: pptxgen.Slide, leftNote: string, slideNum: string) => {
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 6.85,
      w: 11.733,
      h: 0,
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    slide.addText(leftNote, {
      x: 0.8,
      y: 6.95,
      w: 8.5,
      h: 0.3,
      fontSize: 8.5,
      color: TEXT_MUTED
    });

    slide.addText(slideNum, {
      x: 9.5,
      y: 6.95,
      w: 3.033,
      h: 0.3,
      fontSize: 8.5,
      color: TEXT_MUTED,
      align: 'right'
    });
  };

  // ----------------------------------------------------
  // SLIDE 1: COVER SLIDE (Matching Slide 0 in Modal)
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_WHITE };

  // Top Lime Accent Bar
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.1,
    fill: { color: LIME_ACCENT },
    line: { color: LIME_ACCENT }
  });

  // Logo Monogram Badge [S]
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.5,
    w: 0.48,
    h: 0.48,
    rectRadius: 0.08,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  slide1.addText('S', {
    x: 0.8,
    y: 0.52,
    w: 0.48,
    h: 0.44,
    fontSize: 14,
    bold: true,
    color: LIME_ACCENT,
    align: 'center'
  });

  // Wordmark "studio graaf"
  slide1.addText('studio graaf', {
    x: 1.4,
    y: 0.48,
    w: 4.0,
    h: 0.32,
    fontSize: 15,
    bold: true,
    color: TEXT_DARK,
    fontFace: 'Arial'
  });

  slide1.addText('Digitaal bureau voor merk & web', {
    x: 1.4,
    y: 0.78,
    w: 4.0,
    h: 0.22,
    fontSize: 8.5,
    color: TEXT_MUTED
  });

  // Quote number pill on the right
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 10.5,
    y: 0.5,
    w: 2.033,
    h: 0.42,
    rectRadius: 0.21,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  slide1.addText(quote.quoteNumber, {
    x: 10.5,
    y: 0.55,
    w: 2.033,
    h: 0.32,
    fontSize: 9.5,
    bold: true,
    color: LIME_ACCENT,
    align: 'center'
  });

  // Center Main Box
  // Project Tag Pill
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.85,
    w: 3.2,
    h: 0.38,
    rectRadius: 0.19,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  slide1.addText('✦  PROJECTVOORSTEL & STRATEGIE', {
    x: 0.8,
    y: 1.9,
    w: 3.2,
    h: 0.28,
    fontSize: 8,
    bold: true,
    color: LIME_ACCENT,
    align: 'center'
  });

  // Project Name Title
  slide1.addText(quote.projectName, {
    x: 0.8,
    y: 2.35,
    w: 11.7,
    h: 1.05,
    fontSize: 30,
    bold: true,
    color: TEXT_DARK,
    fontFace: 'Arial'
  });

  // Subtitle
  slide1.addText(`Op maat samengesteld voor ${quote.client.companyName}`, {
    x: 0.8,
    y: 3.5,
    w: 11.7,
    h: 0.45,
    fontSize: 14,
    color: TEXT_MUTED
  });

  // Bottom 3 Info Cards
  const metaCards = [
    { label: 'OPGESTELD VOOR', val: `${quote.client.companyName}\nT.a.v. ${quote.client.contactPerson}` },
    { label: 'DATUM & GELDIGHEID', val: `${quote.createdAt}\nGeldig t/m ${quote.validUntil}` },
    { label: 'STRATEGISCH ADVISEUR', val: `${quote.salesRepresentative.name}\n${quote.salesRepresentative.email}` }
  ];

  metaCards.forEach((card, idx) => {
    const cx = 0.8 + (idx * 4.0);
    slide1.addShape(pptx.ShapeType.roundRect, {
      x: cx,
      y: 4.8,
      w: 3.733,
      h: 1.6,
      rectRadius: 0.08,
      fill: { color: BG_LIGHT_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    slide1.addText(card.label, {
      x: cx + 0.25,
      y: 5.0,
      w: 3.233,
      h: 0.25,
      fontSize: 7.5,
      bold: true,
      color: TEXT_MUTED,
      charSpacing: 1
    });

    slide1.addText(card.val, {
      x: cx + 0.25,
      y: 5.35,
      w: 3.233,
      h: 0.85,
      fontSize: 10,
      bold: true,
      color: TEXT_DARK
    });
  });

  addSlideFooter(slide1, 'Studio Graaf VOF • www.studio-graaf.be', `Slide 1 van ${totalSlideCount}`);

  // ----------------------------------------------------
  // SLIDE 2: VISIE & AANPAK / DOELSTELLINGEN (Matching Slide 1 in Modal)
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  slide2.background = { color: BG_WHITE };
  addSlideHeader(slide2, 'Visie & Aanpak', 'Waarom dit traject uw marktleiderschap verstevigt');

  // Left Box: Executive Summary & Promise
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 5.4,
    h: 5.15,
    rectRadius: 0.1,
    fill: { color: BG_LIGHT_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  slide2.addText('Het Doel van het Project', {
    x: 1.1,
    y: 1.75,
    w: 4.8,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: TEXT_DARK
  });

  slide2.addText(quote.projectSummary, {
    x: 1.1,
    y: 2.2,
    w: 4.8,
    h: 2.0,
    fontSize: 10,
    color: TEXT_MUTED
  });

  // White promise inner sub-card
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 1.1,
    y: 4.5,
    w: 4.8,
    h: 1.75,
    rectRadius: 0.08,
    fill: { color: BG_WHITE_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  slide2.addText('Onze Belofte:', {
    x: 1.3,
    y: 4.7,
    w: 4.4,
    h: 0.25,
    fontSize: 9,
    bold: true,
    color: TEXT_DARK
  });

  slide2.addText('Geen standaardsjablonen of loze beloftes, maar een meetbaar en onderscheidend digitaal platform dat direct resultaat en omzet genereert.', {
    x: 1.3,
    y: 5.0,
    w: 4.4,
    h: 1.0,
    fontSize: 9.5,
    color: TEXT_BODY
  });

  // Right Side: 3 Key Pillars
  const pillars = [
    { num: '01', title: 'Onderscheidend Merk', desc: 'Creëer direct vertrouwen en autoriteit. Klanten kiezen resoluut voor uw bewezen expertise.', tag: 'Autoriteit & Prestige' },
    { num: '02', title: 'Conversie Engine', desc: 'Elke pagina en interactie is ontworpen om bezoekers soepel naar een offerte-aanvraag te leiden.', tag: 'Meetbare Leads' },
    { num: '03', title: 'Schaalbaarheid', desc: 'Gebouwd met moderne technologie die naadloos meegroeit met uw bedrijf zonder technische belemmeringen.', tag: 'Toekomstbestendig' }
  ];

  pillars.forEach((pillar, idx) => {
    const px = 6.5 + (idx * 2.05);
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: px,
      y: 1.45,
      w: 1.95,
      h: 5.15,
      rectRadius: 0.1,
      fill: { color: BG_LIGHT_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    // Number badge
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: px + 0.2,
      y: 1.7,
      w: 0.45,
      h: 0.45,
      rectRadius: 0.08,
      fill: { color: BG_DARK_NAVY },
      line: { color: BG_DARK_NAVY }
    });

    slide2.addText(pillar.num, {
      x: px + 0.2,
      y: 1.75,
      w: 0.45,
      h: 0.35,
      fontSize: 10,
      bold: true,
      color: LIME_ACCENT,
      align: 'center'
    });

    slide2.addText(pillar.title, {
      x: px + 0.2,
      y: 2.35,
      w: 1.55,
      h: 0.6,
      fontSize: 11,
      bold: true,
      color: TEXT_DARK
    });

    slide2.addText(pillar.desc, {
      x: px + 0.2,
      y: 3.05,
      w: 1.55,
      h: 2.2,
      fontSize: 8.5,
      color: TEXT_MUTED
    });

    slide2.addText(pillar.tag, {
      x: px + 0.2,
      y: 5.95,
      w: 1.55,
      h: 0.4,
      fontSize: 8.5,
      bold: true,
      color: TEXT_DARK
    });
  });

  addSlideFooter(slide2, `Studio Graaf Pitch Deck • ${quote.client.companyName}`, `Slide 2 van ${totalSlideCount}`);

  // ----------------------------------------------------
  // SLIDES 3+: PER-CATEGORY DEEP DIVES WITH MEERWAARDE (Matching Modal)
  // ----------------------------------------------------
  activeCategories.forEach((cat, catIdx) => {
    const catItems = quote.items.filter(item => item.categoryId === cat.id && item.selected);
    const catSlide = pptx.addSlide();
    catSlide.background = { color: BG_WHITE };

    const cleanName = cleanCategoryName(cat.name);
    addSlideHeader(catSlide, `Categorie • ${cat.badge || 'Strategische Fase'}`, cleanName);

    // Left Box: Strategic Value & ROI
    catSlide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.45,
      w: 5.65,
      h: 5.15,
      rectRadius: 0.1,
      fill: { color: BG_LIGHT_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    catSlide.addText('Meerwaarde voor uw onderneming', {
      x: 1.1,
      y: 1.75,
      w: 5.0,
      h: 0.35,
      fontSize: 12.5,
      bold: true,
      color: TEXT_DARK
    });

    catSlide.addText(cat.valueProposition.description, {
      x: 1.1,
      y: 2.2,
      w: 5.0,
      h: 1.5,
      fontSize: 9.5,
      color: TEXT_MUTED
    });

    catSlide.addText('Belangrijkste resultaten & impact:', {
      x: 1.1,
      y: 3.8,
      w: 5.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: TEXT_DARK
    });

    let currentImpactY = 4.1;
    (cat.valueProposition.businessImpacts || []).slice(0, 3).forEach((impact) => {
      catSlide.addText(`✓  ${impact}`, {
        x: 1.1,
        y: currentImpactY,
        w: 5.0,
        h: 0.32,
        fontSize: 9,
        color: TEXT_BODY
      });
      currentImpactY += 0.35;
    });

    // White ROI Focus Box
    catSlide.addShape(pptx.ShapeType.roundRect, {
      x: 1.1,
      y: 5.4,
      w: 5.05,
      h: 0.9,
      rectRadius: 0.08,
      fill: { color: BG_WHITE_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    catSlide.addText(
      [
        { text: 'Studio Graaf Focus: ', options: { bold: false, color: TEXT_MUTED } },
        { text: cat.valueProposition.roiFocus || 'Rendement en conversieoptimalisatie', options: { bold: true, color: TEXT_DARK } }
      ],
      {
        x: 1.3,
        y: 5.6,
        w: 4.65,
        h: 0.5,
        fontSize: 9
      }
    );

    // Right Box: Included Deliverables & Selected Services
    catSlide.addShape(pptx.ShapeType.roundRect, {
      x: 6.75,
      y: 1.45,
      w: 5.783,
      h: 5.15,
      rectRadius: 0.1,
      fill: { color: BG_LIGHT_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    catSlide.addText(`Inbegrepen Diensten (${catItems.length})`, {
      x: 7.05,
      y: 1.75,
      w: 5.183,
      h: 0.35,
      fontSize: 12.5,
      bold: true,
      color: TEXT_DARK
    });

    let itemBoxY = 2.2;
    catItems.slice(0, 3).forEach((item) => {
      catSlide.addShape(pptx.ShapeType.roundRect, {
        x: 7.05,
        y: itemBoxY,
        w: 5.183,
        h: 1.15,
        rectRadius: 0.08,
        fill: { color: BG_WHITE_CARD },
        line: { color: BORDER_COLOR, width: 0.8 }
      });

      // Item Name
      catSlide.addText(item.name, {
        x: 7.25,
        y: itemBoxY + 0.1,
        w: 3.8,
        h: 0.3,
        fontSize: 10,
        bold: true,
        color: TEXT_DARK
      });

      // Quantity Badge
      catSlide.addText(`${item.quantity} ${item.unit}`, {
        x: 10.9,
        y: itemBoxY + 0.1,
        w: 1.1,
        h: 0.25,
        fontSize: 8,
        bold: true,
        color: TEXT_DARK,
        align: 'right'
      });

      // Short Description
      catSlide.addText(item.shortDescription, {
        x: 7.25,
        y: itemBoxY + 0.4,
        w: 4.75,
        h: 0.65,
        fontSize: 8.5,
        color: TEXT_MUTED
      });

      itemBoxY += 1.25;
    });

    if (catItems.length > 3) {
      catSlide.addText(`+ nog ${catItems.length - 3} extra opties inbegrepen in deze fase`, {
        x: 7.05,
        y: itemBoxY + 0.1,
        w: 5.183,
        h: 0.3,
        fontSize: 8.5,
        italic: true,
        color: TEXT_MUTED,
        align: 'right'
      });
    }

    addSlideFooter(catSlide, `Onderdeel van het projectvoorstel voor ${quote.client.companyName}`, `Slide ${3 + catIdx} van ${totalSlideCount}`);
  });

  // ----------------------------------------------------
  // SLIDE: INVESTERINGSOVERZICHT (Matching Modal)
  // ----------------------------------------------------
  const investSlide = pptx.addSlide();
  investSlide.background = { color: BG_WHITE };
  addSlideHeader(investSlide, 'Transparante Investering', 'Overzicht van de Investering');

  // Left Card: One-Off Project Investment
  investSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.45,
    w: 5.65,
    h: 5.15,
    rectRadius: 0.1,
    fill: { color: BG_LIGHT_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  // Top lime stripe
  investSlide.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 1.45,
    w: 5.65,
    h: 0.08,
    fill: { color: LIME_ACCENT },
    line: { color: LIME_ACCENT }
  });

  investSlide.addText('EENMALIGE PROJECTINVESTERING', {
    x: 1.1,
    y: 1.75,
    w: 5.0,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    color: TEXT_MUTED,
    charSpacing: 1
  });

  investSlide.addText(`€ ${(Number(finalOneOff) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, {
    x: 1.1,
    y: 2.1,
    w: 5.0,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: TEXT_DARK,
    fontFace: 'Arial'
  });

  investSlide.addText(`excl. BTW`, {
    x: 5.0,
    y: 2.3,
    w: 1.2,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: TEXT_MUTED,
    align: 'right'
  });

  let investDetailsY = 2.85;
  if ((quote.overallDiscountValue || 0) > 0) {
    investSlide.addText(`Inclusief ${quote.overallDiscountValue}% projectkorting (-€ ${(Number(discountAmount) || 0).toFixed(2)})`, {
      x: 1.1,
      y: investDetailsY,
      w: 5.0,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: EMERALD_GREEN
    });
    investDetailsY += 0.28;
  }

  investSlide.addText(`BTW (${quote.vatRate || 21}%): € ${(Number(vatAmount) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, {
    x: 1.1,
    y: investDetailsY,
    w: 5.0,
    h: 0.25,
    fontSize: 9,
    color: TEXT_MUTED
  });
  investDetailsY += 0.28;

  investSlide.addText(`Totaal incl. BTW: € ${(Number(totalInclVat) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, {
    x: 1.1,
    y: investDetailsY,
    w: 5.0,
    h: 0.25,
    fontSize: 9.5,
    bold: true,
    color: TEXT_DARK
  });

  // White Box with Payment Terms
  investSlide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1,
    y: 3.9,
    w: 5.05,
    h: 1.8,
    rectRadius: 0.08,
    fill: { color: BG_WHITE_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  investSlide.addText('Betalingsvoorwaarden & Projectkader:', {
    x: 1.3,
    y: 4.05,
    w: 4.65,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    color: TEXT_DARK
  });

  investSlide.addText(quote.paymentTerms || '30% voorschot bij akkoord, 40% bij ontwerpfase, 30% bij finale livegang.', {
    x: 1.3,
    y: 4.35,
    w: 4.65,
    h: 0.75,
    fontSize: 8.5,
    color: TEXT_MUTED
  });

  investSlide.addText('✓  Geen verborgen meerkosten. Vaste prijsgarantie.', {
    x: 1.3,
    y: 5.25,
    w: 4.65,
    h: 0.3,
    fontSize: 8.5,
    bold: true,
    color: EMERALD_GREEN
  });

  // Right Card: Monthly Retainer / SLA
  investSlide.addShape(pptx.ShapeType.roundRect, {
    x: 6.75,
    y: 1.45,
    w: 5.783,
    h: 5.15,
    rectRadius: 0.1,
    fill: { color: BG_LIGHT_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  // Top dark stripe
  investSlide.addShape(pptx.ShapeType.rect, {
    x: 6.75,
    y: 1.45,
    w: 5.783,
    h: 0.08,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  investSlide.addText('DOORLOPEND ONDERHOUD & HOSTING (SLA)', {
    x: 7.05,
    y: 1.75,
    w: 5.183,
    h: 0.25,
    fontSize: 8.5,
    bold: true,
    color: TEXT_DARK,
    charSpacing: 1
  });

  investSlide.addText(`€ ${(Number(monthlySubtotal) || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, {
    x: 7.05,
    y: 2.1,
    w: 3.5,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: TEXT_DARK,
    fontFace: 'Arial'
  });

  investSlide.addText('/ maand excl.', {
    x: 10.5,
    y: 2.3,
    w: 1.7,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: TEXT_MUTED,
    align: 'right'
  });

  investSlide.addText('Zorgeloze werking, continue updates en prioriteit-ondersteuning.', {
    x: 7.05,
    y: 2.85,
    w: 5.183,
    h: 0.35,
    fontSize: 9,
    color: TEXT_MUTED
  });

  const monthlyBenefits = [
    'Dedicated Cloud Hosting & 99.9% Uptime garantie',
    'Wekelijkse beveiligingspatches & back-ups',
    'Directe helpdesk support & kwartaal monitoring'
  ];

  let mbY = 3.35;
  monthlyBenefits.forEach((mb) => {
    investSlide.addText(`✓  ${mb}`, {
      x: 7.05,
      y: mbY,
      w: 5.183,
      h: 0.32,
      fontSize: 9,
      color: TEXT_BODY
    });
    mbY += 0.38;
  });

  // White notice box
  investSlide.addShape(pptx.ShapeType.roundRect, {
    x: 7.05,
    y: 5.2,
    w: 5.183,
    h: 0.65,
    rectRadius: 0.08,
    fill: { color: BG_WHITE_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  investSlide.addText('Maandelijks opzegbaar na initiële contracttermijn.', {
    x: 7.25,
    y: 5.35,
    w: 4.783,
    h: 0.35,
    fontSize: 8.5,
    color: TEXT_MUTED
  });

  const investSlideNum = 3 + activeCategories.length;
  addSlideFooter(investSlide, 'Studio Graaf Investeringssamenvatting', `Slide ${investSlideNum} van ${totalSlideCount}`);

  // ----------------------------------------------------
  // SLIDE: TIJDLIJN & FASERING (Matching Modal)
  // ----------------------------------------------------
  const timelineSlide = pptx.addSlide();
  timelineSlide.background = { color: BG_WHITE };
  addSlideHeader(timelineSlide, 'Realisatie Tijdlijn', 'Gefaseerde Aanpak & Oplevering');

  const phaseWidth = 2.78;
  quote.timelinePhases.forEach((phase, idx) => {
    const px = 0.8 + (idx * 2.98);
    timelineSlide.addShape(pptx.ShapeType.roundRect, {
      x: px,
      y: 1.45,
      w: phaseWidth,
      h: 5.15,
      rectRadius: 0.1,
      fill: { color: BG_LIGHT_CARD },
      line: { color: BORDER_COLOR, width: 0.8 }
    });

    // Phase Number Badge
    timelineSlide.addShape(pptx.ShapeType.roundRect, {
      x: px + 0.2,
      y: 1.7,
      w: 0.4,
      h: 0.4,
      rectRadius: 0.08,
      fill: { color: BG_DARK_NAVY },
      line: { color: BG_DARK_NAVY }
    });

    timelineSlide.addText(`${phase.phaseNumber}`, {
      x: px + 0.2,
      y: 1.74,
      w: 0.4,
      h: 0.32,
      fontSize: 10,
      bold: true,
      color: LIME_ACCENT,
      align: 'center'
    });

    // Duration
    timelineSlide.addText(phase.duration, {
      x: px + 0.7,
      y: 1.75,
      w: 1.88,
      h: 0.3,
      fontSize: 8.5,
      bold: true,
      color: TEXT_MUTED
    });

    // Title
    timelineSlide.addText(phase.title, {
      x: px + 0.2,
      y: 2.3,
      w: 2.38,
      h: 0.5,
      fontSize: 11,
      bold: true,
      color: TEXT_DARK
    });

    // Description
    timelineSlide.addText(phase.description, {
      x: px + 0.2,
      y: 2.9,
      w: 2.38,
      h: 1.5,
      fontSize: 8.5,
      color: TEXT_MUTED
    });

    // Deliverables
    timelineSlide.addText('Oplevering:', {
      x: px + 0.2,
      y: 4.6,
      w: 2.38,
      h: 0.25,
      fontSize: 8,
      bold: true,
      color: TEXT_DARK
    });

    let delivY = 4.9;
    (phase.deliverables || []).slice(0, 3).forEach((d) => {
      timelineSlide.addText(`✓  ${d}`, {
        x: px + 0.2,
        y: delivY,
        w: 2.38,
        h: 0.28,
        fontSize: 8,
        color: TEXT_BODY
      });
      delivY += 0.32;
    });
  });

  const timelineSlideNum = 3 + activeCategories.length + 1;
  addSlideFooter(timelineSlide, 'Volledige projectbegeleiding van start tot oplevering', `Slide ${timelineSlideNum} van ${totalSlideCount}`);

  // ----------------------------------------------------
  // SLIDE: AFSLUITING & AKKOORD (Matching Slide 5/Closing in Modal)
  // ----------------------------------------------------
  const closingSlide = pptx.addSlide();
  closingSlide.background = { color: BG_WHITE };

  // Top Lime Bar
  closingSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.1,
    fill: { color: LIME_ACCENT },
    line: { color: LIME_ACCENT }
  });

  // Large Monogram Badge
  closingSlide.addShape(pptx.ShapeType.roundRect, {
    x: 6.26,
    y: 1.1,
    w: 0.8,
    h: 0.8,
    rectRadius: 0.15,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  closingSlide.addText('S', {
    x: 6.26,
    y: 1.15,
    w: 0.8,
    h: 0.7,
    fontSize: 22,
    bold: true,
    color: LIME_ACCENT,
    align: 'center'
  });

  // Next Step Pill
  closingSlide.addShape(pptx.ShapeType.roundRect, {
    x: 5.06,
    y: 2.15,
    w: 3.2,
    h: 0.38,
    rectRadius: 0.19,
    fill: { color: BG_DARK_NAVY },
    line: { color: BG_DARK_NAVY }
  });

  closingSlide.addText('✦  KLAAR VOOR DE VOLGENDE STAP', {
    x: 5.06,
    y: 2.2,
    w: 3.2,
    h: 0.28,
    fontSize: 8,
    bold: true,
    color: LIME_ACCENT,
    align: 'center'
  });

  // Big Call to action title
  closingSlide.addText('Laten we samen bouwen aan uw succes!', {
    x: 1.66,
    y: 2.75,
    w: 10.0,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: TEXT_DARK,
    align: 'center',
    fontFace: 'Arial'
  });

  // Subtitle
  closingSlide.addText(`Heeft u nog vragen over het voorstel voor ${quote.client.companyName}? Wij starten graag binnenkort met de kick-off sessie.`, {
    x: 2.16,
    y: 3.65,
    w: 9.0,
    h: 0.7,
    fontSize: 12,
    color: TEXT_MUTED,
    align: 'center'
  });

  // Contact Info Card (Comfortably positioned inside slide height)
  closingSlide.addShape(pptx.ShapeType.roundRect, {
    x: 3.66,
    y: 4.65,
    w: 6.0,
    h: 1.6,
    rectRadius: 0.1,
    fill: { color: BG_LIGHT_CARD },
    line: { color: BORDER_COLOR, width: 0.8 }
  });

  closingSlide.addText('Studio Graaf VOF  •  Warre Geerts', {
    x: 3.86,
    y: 4.9,
    w: 5.6,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
    align: 'center'
  });

  closingSlide.addText(`www.studio-graaf.be  •  ${quote.salesRepresentative.email}`, {
    x: 3.86,
    y: 5.3,
    w: 5.6,
    h: 0.35,
    fontSize: 9.5,
    color: TEXT_MUTED,
    align: 'center'
  });

  closingSlide.addText('Maaiwanters 10, 2230 Herselt  •  BTW BE 1035.446.987', {
    x: 3.86,
    y: 5.68,
    w: 5.6,
    h: 0.3,
    fontSize: 8.5,
    color: TEXT_MUTED,
    align: 'center'
  });

  addSlideFooter(closingSlide, `Studio Graaf VOF • ${quote.salesRepresentative.email}`, `Slide ${totalSlideCount} van ${totalSlideCount}`);

  // Save the presentation file
  const sanitizedFilename = `Studio_Graaf_Presentatie_${quote.client.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${quote.quoteNumber}.pptx`;
  await pptx.writeFile({ fileName: sanitizedFilename });
};
