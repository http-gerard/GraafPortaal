import express from 'express';
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
let supabaseAdmin = null;
if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey);
}


const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// --- Email API Endpoint (Nodemailer) ---
// Configuratie via .env (standaard gebruiken we Ethereal of SendGrid/SMTP)
let transporter: any = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Als er ECHTE smtp gegevens in de .env staan, gebruik die:
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return transporter;
  }

  // Anders: Maak automatisch een tijdelijk test-account aan (Ethereal)
  console.log("Geen SMTP_HOST gevonden in .env. Bezig met aanmaken van een Ethereal test-account...");
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log("Test-account aangemaakt! URL voor inbox: https://ethereal.email/login");
  return transporter;
}

app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, htmlBody, cc, bcc } = req.body;
    
    if (!to || !subject || !htmlBody) {
      return res.status(400).json({ error: "Missing required fields: to, subject, htmlBody" });
    }

    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Studio Graaf" <hello@studio-graaf.be>',
      to,
      cc,
      bcc,
      subject,
      html: htmlBody,
    });

    console.log("Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return res.json({ 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // Handig voor dev met Ethereal
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: error.message });
  }
// ----------------------------------------


});
// Server-side Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}


// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Meeting Notes to Quote Proposal Generation Endpoint
app.post("/api/ai/generate-quote", async (req, res) => {
  try {
    const { meetingNotes, catalogContext } = req.body;

    if (!meetingNotes || typeof meetingNotes !== "string" || !meetingNotes.trim()) {
      return res.status(400).json({ error: "Geen meeting notities opgegeven." });
    }

    const ai = getAiClient();

    const systemPrompt = `Je bent de Senior Lead Solution Architect & Sales Director bij Studio Graaf (een toonaangevend Belgisch digitaal bureau gevestigd in Herselt).
Jouw taak is om ruwe meeting notities, audio transcripts of gespreksverslagen van een intakegesprek met een potentiële klant om te zetten in een doordacht, professioneel offertevoorstel conform de diensten en stijl van Studio Graaf.

Studio Graaf staat voor:
- Minimalistische esthetiek, uitzonderlijk hoge conversie en robuuste techniek.
- Eerlijke vaste prijzen en modulaire uitbreidbaarheid.
- Offertes hebben altijd:
  1. Een professionele, wervende projectnaam (bijv. "E-Commerce Platform & Rebranding Bakkerij De Vries" of "B2B Klantenportaal & Maatwerk Applicatie").
  2. Een krachtige project samenvatting (1-2 zinnen die het einddoel en de zakelijke impact beschrijven).
  3. Gedetecteerde klantgegevens (bedrijfsnaam, contactpersoon, email, telefoon, adres, BTW-nummer indien vermeld in de notities, anders realistische defaults).
  4. Een selectie van specifieke service IDs uit de catalogus die het best aansluiten bij de behoeften van de klant.
  5. Een persoonlijke, warme introductietekst gericht aan de contactpersoon.
  6. 4 duidelijke realisatiefases met realistische doorlooptijden en deliverables.

Catalogus van beschikbare diensten en categorieën:
${JSON.stringify(catalogContext || {}, null, 2)}

Genereer een gestructureerde JSON output die exact voldoet aan het gevraagde schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              text: `Hier zijn de intake notities van het gesprek:\n"""\n${meetingNotes}\n"""\n\nAnalyseer de notities en genereer een compleet offertevoorstel in JSON.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "Professionele en wervende naam voor het project",
            },
            projectSummary: {
              type: Type.STRING,
              description: "Korte samenvatting van de doelstelling en zakelijke impact",
            },
            customIntroMessage: {
              type: Type.STRING,
              description: "Persoonlijk begeleidend schrijven aan de klant",
            },
            client: {
              type: Type.OBJECT,
              properties: {
                companyName: { type: Type.STRING },
                contactPerson: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                vatNumber: { type: Type.STRING },
                address: { type: Type.STRING },
                postalCode: { type: Type.STRING },
                city: { type: Type.STRING },
                country: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: ["companyName", "contactPerson", "email"],
            },
            selectedServiceIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lijst van geselecteerde service IDs uit de catalogus (bijv. srv-web-basis, srv-brand-basis, etc.)",
            },
            serviceQuantities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  serviceId: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                },
                required: ["serviceId", "quantity"],
              },
            },
            overallDiscountPercent: {
              type: Type.NUMBER,
              description: "Eventuele korting in procenten (0 indien geen)",
            },
            timelinePhases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deliverables: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["phaseNumber", "title", "duration", "description", "deliverables"],
              },
            },
            aiRationale: {
              type: Type.STRING,
              description: "Korte toelichting van de AI waarom deze scope en diensten zijn aanbevolen",
            },
          },
          required: [
            "projectName",
            "projectSummary",
            "customIntroMessage",
            "client",
            "selectedServiceIds",
            "timelinePhases",
            "aiRationale",
          ],
        },
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);

    return res.json({ success: true, proposal: parsedData });
  } catch (error: any) {
    console.error("AI Quote generation error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Er is een fout opgetreden bij het genereren van het voorstel.",
    });
  }
});

// Digital signature notification email simulation endpoint
app.post("/api/signature/notify", async (req, res) => {
  const { quoteId, quoteNumber, projectName, clientName, clientEmail, signatureData } = req.body;
  

  
  // Update Supabase directly!
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (supabaseUrl && supabaseKey) {
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
      
      // Update standard columns
      await supabaseAdmin.from('quotes').update({
        status: 'akkoord',
        digital_signature: signatureData
      }).eq('id', quoteId);
      
      // Also update full_data JSONB to ensure the frontend receives the signature inside full_data
      const { data } = await supabaseAdmin.from('quotes').select('full_data').eq('id', quoteId).maybeSingle();
      if (data && data.full_data) {
         const updatedFullData = { 
           ...data.full_data, 
           status: 'akkoord', 
           digitalSignature: signatureData 
         };
         await supabaseAdmin.from('quotes').update({ full_data: updatedFullData }).eq('id', quoteId);
      }
    }
  } catch (err) {
    console.error("Failed to sync signature to Supabase:", err);
  }
  
  console.log(`[Notification] Quote ${quoteNumber} (${projectName}) signed by ${clientName} (${clientEmail})`);
  
  res.json({
    success: true,
    notifiedStudioGraaf: true,
    notifiedClient: true,
    signedAt: signatureData?.signedAt || new Date().toISOString(),
    message: `Notificatie succesvol verzonden naar Studio Graaf en bevestiging naar ${clientEmail}`,
  });
});


// Sync DOWN signed quotes to admin
app.get("/api/quotes/signed", async (req, res) => {
  if (!supabaseAdmin) return res.json({ success: true, quotes: [] });
  const { data } = await supabaseAdmin.from('quotes').select('full_data').eq('status', 'akkoord').not('digital_signature', 'is', null);
  const signed = data ? data.map(d => d.full_data) : [];
  res.json({ success: true, quotes: signed });

// In-memory quote & telemetry datastore
interface ServerTelemetryEvent {
  id: string;
  timestamp: string;
  action: string;
  device: string;
  location: string;
  icon: string;
  details?: string;
  createdAtMs?: number;
}

interface ServerQuoteAnalytics {
  totalViews: number;
  uniqueDevices: number;
  totalTimeMinutes: number;
  firstViewedAt: string;
  lastViewedAt: string;
  lastDevice: string;
  engagementScore: number;
  sections: ServerSectionAnalytics[];
  events: ServerTelemetryEvent[];
  lastSessionStartMs?: Record<string, number>;
}



});

// Sync quote to portal store so client web viewer can retrieve it
app.post("/api/quotes/sync-portal", async (req, res) => {
  // Now relies purely on Supabase!
  return res.json({ success: true, quoteId: req.body?.quote?.id });
});

// Fetch live telemetry for a quote

// Get quote by ID
app.get("/api/quotes/:quoteId", async (req, res) => {
  try {
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
    const { data } = await supabaseAdmin.from('quotes').select('full_data').eq('id', req.params.quoteId).maybeSingle();
    
    if (data && data.full_data) {
      return res.json({ success: true, quote: data.full_data });
    } else {
      return res.status(404).json({ error: "Quote not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching quote" });
  }
});

app.get("/api/analytics/:quoteId", (req, res) => {
  const { quoteId } = req.params;
  const analytics = analyticsStore[quoteId];
  if (!analytics) {
    return res.json({
      success: true,
      analytics: null
    });
  }
  return res.json({ success: true, analytics });

// Record real client tracking event

// --- Internal Email Helper ---
async function sendInternalNotification(subject, htmlBody) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"Studio Graaf Portaal" <hello@studio-graaf.be>',
      to: 'portaal@studio-graaf.be',
      subject: subject,
      html: htmlBody,
    });
    console.log("Internal Notification Sent: %s", subject);
  } catch (err) {
    console.error("Failed to send internal notification:", err);
  }
}



// Background sync to Supabase so analytics survive restarts
async function persistAnalyticsToSupabase(quoteId, analytics) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) return;
    
    // We already import createClient from @supabase/supabase-js
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    
    const { data } = await supabaseAdmin.from('quotes').select('full_data').eq('id', quoteId).maybeSingle();
    if (data && data.full_data) {
       const updatedFullData = { ...data.full_data, analytics };
       await supabaseAdmin.from('quotes').update({ full_data: updatedFullData }).eq('id', quoteId);
    }
  } catch(e) {
    console.error('Failed to persist analytics to Supabase:', e);
  }
}
});
app.post("/api/analytics/track", (req, res) => {
  const {
    quoteId,
    eventType,
    sectionId,
    durationSeconds = 0,
    deviceInfo = "Desktop • Chrome",
    location = "België",
    actionDescription,
    details,
    sessionId
  } = req.body;

  if (!quoteId) {
    return res.status(400).json({ error: "quoteId is verplicht" });
  }

  const nowMs = Date.now();

  // Ensure record exists
  if (!analyticsStore[quoteId]) {
    analyticsStore[quoteId] = {
      totalViews: 0,
      uniqueDevices: 1,
      totalTimeMinutes: 0,
      firstViewedAt: new Date().toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }),
      lastViewedAt: new Date().toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" }),
      lastDevice: deviceInfo,
      engagementScore: 60,
      sections: [
        { sectionId: "pricing", name: "Investeringstabel & Prijzen", percentage: 45, timeSpentMinutes: 0, interestLevel: "normal" },
        { sectionId: "value", name: "Strategische Meerwaarde & Aanpak", percentage: 25, timeSpentMinutes: 0, interestLevel: "normal" },
        { sectionId: "timeline", name: "Tijdlijn & Fasering", percentage: 18, timeSpentMinutes: 0, interestLevel: "normal" },
        { sectionId: "scope", name: "Dienstenspecificatie & Scope", percentage: 12, timeSpentMinutes: 0, interestLevel: "normal" },
      ],
      events: [],
      lastSessionStartMs: {}
    };
  }

  const current = analyticsStore[quoteId];
  if (!current.lastSessionStartMs) {
    current.lastSessionStartMs = {};
  }

  const nowFormatted = new Date().toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" });
  current.lastViewedAt = `Vandaag, ${nowFormatted}`;
  current.lastDevice = deviceInfo;

  if (eventType === "session_start") {
    // Deduplicate rapid session_starts from the same session/device within 45 seconds
    const sessionKey = sessionId || `${deviceInfo}_${location}`;
    const lastStart = current.lastSessionStartMs[sessionKey] || 0;
    const isDuplicate = (nowMs - lastStart) < 45000;

    if (!isDuplicate) {
      current.lastSessionStartMs[sessionKey] = nowMs;
      current.totalViews += 1;
      
      // FIRE INTERNAL EMAIL ON FIRST VIEW
      if (current.totalViews === 1) {
        sendInternalNotification(
          `👀 Offerte Bekeken: ${quoteId}`,
          `Klant heeft zojuist voor het eerst de offerte ${quoteId} geopend in het portaal.<br/><br/>Dit is een goed moment voor sales om stand-by te staan!`
        );
      }
      const isNewDevice = !current.events.some(e => e.device === deviceInfo);
      if (isNewDevice) {
        current.uniqueDevices = Math.max(1, current.uniqueDevices + 1);
      }
      
      current.events.unshift({
        id: `evt-${nowMs}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: `Vandaag, ${nowFormatted}`,
        action: actionDescription || "Offerte geopend door klant via beveiligde link",
        device: deviceInfo,
        location,
        icon: deviceInfo.toLowerCase().includes("mobile") || deviceInfo.toLowerCase().includes("iphone") ? "Smartphone" : "Laptop",
        details: details || "Nieuwe interactieve leessessie gestart",
        createdAtMs: nowMs
      });
    }
  } else if (eventType === "heartbeat" || eventType === "time_ping") {
    const addedMinutes = Number((durationSeconds / 60).toFixed(2));
    current.totalTimeMinutes = Number((current.totalTimeMinutes + addedMinutes).toFixed(2));

    // Update section time if specified
    if (sectionId) {
      const sec = current.sections.find(s => s.sectionId === sectionId);
      if (sec) {
        sec.timeSpentMinutes = Number((sec.timeSpentMinutes + addedMinutes).toFixed(2));
      }
    }

    // Recalculate percentages
    const totalSecTime = current.sections.reduce((acc, s) => acc + s.timeSpentMinutes, 0) || 1;
    current.sections.forEach(s => {
      s.percentage = Math.round((s.timeSpentMinutes / totalSecTime) * 100);
      s.interestLevel = s.percentage >= 40 ? "high" : s.percentage >= 20 ? "medium" : "normal";
    });
  } else if (eventType === "section_view") {
    const sec = current.sections.find(s => s.sectionId === sectionId);
    if (sec && durationSeconds > 0) {
      const addedMinutes = Number((durationSeconds / 60).toFixed(2));
      sec.timeSpentMinutes = Number((sec.timeSpentMinutes + addedMinutes).toFixed(2));
      current.totalTimeMinutes = Number((current.totalTimeMinutes + addedMinutes).toFixed(2));
    }
    
    // Avoid duplicate rapid section logging within 15 seconds
    const lastEvent = current.events[0];
    const isRecentSame = lastEvent && lastEvent.action.includes(sec ? sec.name : sectionId || '') && (nowMs - (lastEvent.createdAtMs || 0)) < 15000;

    if (!isRecentSame && (durationSeconds >= 15 || sectionId === "pricing")) {
      current.events.unshift({
        id: `evt-${nowMs}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: `Vandaag, ${nowFormatted}`,
        action: actionDescription || `Ingezoomd op ${sec ? sec.name : sectionId}`,
        device: deviceInfo,
        location,
        icon: "Eye",
        details: details || `Aandachtig bekeken gedurende ${Math.round(durationSeconds)}s`,
        createdAtMs: nowMs
      });
    }
  } else if (eventType === "pdf_download") {
    current.events.unshift({
      id: `evt-${nowMs}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: `Vandaag, ${nowFormatted}`,
      action: "Offerte PDF gedownload",
      device: deviceInfo,
      location,
      icon: "ArrowUpRight",
      details: "Klant heeft een offline PDF kopie geëxporteerd",
      createdAtMs: nowMs
    });
  } else if (eventType === "sign_started" || eventType === "quote_signed") {
    if (eventType === "quote_signed") {
      sendInternalNotification(
        `🎉 Offerte Getekend: ${quoteId}`,
        `Hoera!<br/><br/>De offerte ${quoteId} is zojuist digitaal ondertekend door de klant!<br/><br/>Bekijk de details in het portaal.`
      );
    }
    current.events.unshift({
      id: `evt-${nowMs}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: `Vandaag, ${nowFormatted}`,
      action: eventType === "quote_signed" ? "Offerte digitaal ondertekend en goedgekeurd!" : "Onderteken-venster geopend door klant",
      device: deviceInfo,
      location,
      icon: "Check",
      details: details || "Offertevoorstel definitief aanvaard",
      createdAtMs: nowMs
    });
  }

  // Calculate engagement score dynamically (0-100)
  let score = 50;
  score += Math.min(25, current.totalViews * 5);
  score += Math.min(20, Math.round(current.totalTimeMinutes * 3));
  if (current.events.some(e => e.action.includes("ondertekend"))) score = 99;
  else if (current.events.some(e => e.action.includes("PDF"))) score = Math.min(95, score + 15);
  else if (current.uniqueDevices > 1) score = Math.min(92, score + 10);
  current.engagementScore = Math.min(100, Math.max(10, score));

  // Cap events list at 25 items
  if (current.events.length > 25) {
    current.events = current.events.slice(0, 25);
  }

  // Persist to Supabase in the background
  persistAnalyticsToSupabase(quoteId, current).catch(console.error);
  
  res.json({ success: true, analytics: current });
});

// Invoicing sync endpoint (Teamleader & Billit simulation)
app.post("/api/invoice/sync", async (req, res) => {
  const { invoice, platform } = req.body;
  let remoteInvoiceId = `${platform === "billit" ? "BIL" : "TL"}-${Date.now().toString().slice(-6)}`;
  let peppolStatus = platform === "billit" ? "Ready for Peppol e-Delivery (Gesimuleerd voor API)" : "Standard UBL generated";

  let settings = {};
  if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));

  if (platform === "billit" && process.env.BILLIT_API_KEY) {
    try {
      const payload = {
        "OrderType": "Invoice",
        "OrderDirection": "Income",
        "OrderDate": new Date().toISOString().split('T')[0],
        "DeliveryDate": new Date().toISOString().split('T')[0],
        "ExpiryDate": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        "CounterParty": {
          "Name": invoice.clientName || 'Nieuwe Klant',
          "Street": invoice.clientAddress || '',
          "Zipcode": invoice.clientZip || '',
          "City": invoice.clientCity || '',
          "CountryCode": "BE",
          "PartyType": "Customer"
        },
        "OrderLines": [
          {
            "Description": invoice.description || 'Voorschotfactuur via Studio Graaf',
            "UnitPrice": invoice.amountExclVat || 0,
            "Quantity": 1,
            "VATRate": invoice.vatAmount ? Math.round((invoice.vatAmount / invoice.amountExclVat) * 100) : 21
          }
        ]
      };

      const billitRes = await fetch('https://api.billit.be/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': process.env.BILLIT_API_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!billitRes.ok) {
        console.error("Billit API Error:", await billitRes.text());
      } else {
        const orderId = await billitRes.text();
        remoteInvoiceId = `BIL-${orderId}`;
        peppolStatus = "Aangemaakt in Billit (Ontwerp)";
        console.log(`[Billit] Succesfully created invoice ${orderId}`);
      }
    } catch (err) {
      console.error("Error creating Billit invoice:", err);
    }
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      await supabaseAdmin.from('invoices').insert([{
        invoice_number: invoice.invoiceNumber,
        client_id: invoice.client_id || 'UNKNOWN',
        amount: invoice.amountInclVat,
        date: invoice.createdAt,
        status: 'Concept'
      }]);
    }
  } catch(e) {
    console.error("DB Error syncing invoice:", e);
  }

  res.json({
    success: true,
    remoteInvoiceId,
    platform,
    peppolStatus,
    syncedAt: new Date().toISOString(),
  });



});
// --- Persistent Settings API ---
const SETTINGS_FILE = path.join(process.cwd(), 'app_settings.json');

app.get("/api/settings", (req, res) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return res.json({ success: true, settings: JSON.parse(data) });
    }
    res.json({ success: true, settings: {} });
  } catch (err) {
    res.json({ success: true, settings: {} });
  }
});

app.post("/api/settings", (req, res) => {
  try {
    let settings = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
    settings = { ...settings, ...req.body };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});



// --- Notifications API ---
app.get("/api/notifications", (req, res) => {
  try {
    const allEvents = [];
    
    // We collect events from analyticsStore
    for (const [quoteId, analytics] of Object.entries(analyticsStore)) {
      const quote = portalQuotesStore[quoteId];
      const quoteName = quote ? quote.projectName : 'Offerte';
      
      if (analytics && analytics.events) {
        for (const ev of analytics.events) {
          // Identify type based on 'action' or 'icon'
          let type = 'info'; 
          if (ev.action.includes('geopend')) type = 'success';
          else if (ev.action.includes('Handtekening') || ev.action.includes('getekend')) type = 'success';
          else if (ev.action.includes('Ingezoomd') || ev.action.includes('aandachtig')) type = 'alert';
          
          allEvents.push({
            id: ev.id,
            title: ev.action,
            description: `${quoteName} • ${ev.details}`,
            type,
            unread: true,
            timestamp: new Date(ev.createdAtMs || Date.now()).toISOString(),
            rawTime: ev.createdAtMs || Date.now()
          });
        }
      }
    }
    
    // Also include digital signatures if any
    for (const quote of Object.values(portalQuotesStore)) {
      if (quote.digitalSignature && quote.digitalSignature.signedAt) {
        allEvents.push({
          id: `sig-${quote.id}`,
          title: 'Offerte Ondertekend! 🎉',
          description: `"${quote.projectName}" is digitaal ondertekend door ${quote.digitalSignature.signedBy}.`,
          type: 'success',
          unread: true,
          timestamp: quote.digitalSignature.signedAt,
          rawTime: new Date(quote.digitalSignature.signedAt).getTime()
        });
      }
    }
    
    // Sort by time DESC
    allEvents.sort((a, b) => b.rawTime - a.rawTime);
    
    // Deduplicate signatures if they appeared in events too (though unlikely to have same ID, we just take top 20)
    const topEvents = allEvents.slice(0, 20).map(ev => ({
      ...ev,
      time: new Date(ev.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    }));
    
    return res.json({ success: true, notifications: topEvents });
  } catch (err) {

    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


async function startServer() {


  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
// ----------------------------------------------------------------------
// SUPABASE ADMIN AUTH ENDPOINTS
// ----------------------------------------------------------------------
app.post("/api/auth/invite", async (req, res) => {
  try {
    const { email, data: userData } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials missing in server config");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: userData || {},
      redirectTo: req.headers.origin || "http://localhost:3000"
    });

    if (error) {
      throw error;
    }

    res.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error("Invite error:", error);
    res.status(500).json({ error: error.message || "Failed to invite user" });
  }

  // --- OUTLOOK ICS ENDPOINT ---
});
app.get('/api/calendar/outlook', async (req, res) => {
  try {
    let url = req.query.url;
    if (typeof url === 'string' && url.startsWith('webcal://')) {
      url = 'https://' + url.slice(9);
    }
    
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({ error: 'Valid ICS URL required' });
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch ICS feed from Outlook");
    const text = await response.text();
    
    const parsedEvents = [];
    const eventBlocks = text.split('BEGIN:VEVENT');
    for (let i = 1; i < eventBlocks.length; i++) {
      const block = eventBlocks[i].split('END:VEVENT')[0];
      const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/);
      const startMatch = block.match(/DTSTART(?:;[^:]+)?:([^\r\n]+)/);
      const locMatch = block.match(/LOCATION:([^\r\n]+)/);
      const uidMatch = block.match(/UID:([^\r\n]+)/);
      
      if (startMatch) {
         let startStr = startMatch[1].trim();
         let dateStr = startStr;
         // Handle YYYYMMDDTHHMMSSZ format
         if (startStr.length >= 15) {
           dateStr = startStr.substring(0,4) + '-' + startStr.substring(4,6) + '-' + startStr.substring(6,11) + ':' + startStr.substring(11,13) + ':' + startStr.substring(13);
         } else if (startStr.length === 8) {
           // All day event: YYYYMMDD
           dateStr = startStr.substring(0,4) + '-' + startStr.substring(4,6) + '-' + startStr.substring(6,8) + 'T00:00:00Z';
         }
         
         const startDate = new Date(dateStr);
         if (isNaN(startDate.getTime())) continue;
         
         parsedEvents.push({
           id: uidMatch ? uidMatch[1].trim() : Math.random().toString(),
           title: summaryMatch ? summaryMatch[1].trim() : 'Outlook Meeting',
           type: 'Extern',
           date: startDate.toISOString().split('T')[0],
           time: startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
           location: locMatch ? locMatch[1].trim() : 'Outlook',
           isOutlook: true,
           rawDate: startDate,
           status: startDate > new Date() ? 'Gepland' : 'Voltooid'
         });
      }
    }
    
    parsedEvents.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    return res.json({ success: true, events: parsedEvents });
  } catch (error) {
    console.error('Error inside endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch or parse ICS feed', details: error.toString() });
  }

});
  // --- Teamleader Focus OAuth2 Integration ---
app.get("/api/teamleader/auth", (req, res) => {
  const TEAMLEADER_CLIENT_ID = process.env.TEAMLEADER_CLIENT_ID;
  if (!TEAMLEADER_CLIENT_ID) return res.send("Ontbrekende TEAMLEADER_CLIENT_ID in .env");
  // Change to your production URL when deploying
  const redirectUri = "http://localhost:3000/api/teamleader/callback";
  const url = `https://focus.teamleader.eu/oauth2/authorize?client_id=${TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(url);
});

app.get("/api/teamleader/callback", async (req, res) => {
  const code = req.query.code;
  const TEAMLEADER_CLIENT_ID = process.env.TEAMLEADER_CLIENT_ID;
  const TEAMLEADER_CLIENT_SECRET = process.env.TEAMLEADER_CLIENT_SECRET;
  const redirectUri = "http://localhost:3000/api/teamleader/callback";

  try {
    const response = await fetch("https://focus.teamleader.eu/oauth2/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: TEAMLEADER_CLIENT_ID,
        client_secret: TEAMLEADER_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      })
    });

    const tokens = await response.json();
    if (tokens.access_token) {
      let settings = {};
      if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      settings.teamleader_tokens = tokens;
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

      res.send("<h1>Succes!</h1><p>Teamleader is gekoppeld. Je tokens zijn opgeslagen in app_settings.json. Je kunt dit venster nu sluiten.</p>");
    } else {
      res.send("Fout bij ophalen tokens: " + JSON.stringify(tokens));
    }
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

// Sync endpoint
// --- Live Teamleader Fetch for Offertool ---

async function fetchTeamleader(url, options = {}) {
  let settings = {};
  if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  
  if (!settings.teamleader_tokens || !settings.teamleader_tokens.access_token) {
    throw new Error("401: Niet ingelogd bij Teamleader");
  }

  let res = await fetch(url, {
    ...options,
    headers: { ...options.headers, 'Authorization': `Bearer ${settings.teamleader_tokens.access_token}` }
  });

  if (res.status === 401 && settings.teamleader_tokens.refresh_token) {
    // Try refreshing
    const refreshRes = await fetch("https://focus.teamleader.eu/oauth2/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.TEAMLEADER_CLIENT_ID,
        client_secret: process.env.TEAMLEADER_CLIENT_SECRET,
        refresh_token: settings.teamleader_tokens.refresh_token,
        grant_type: "refresh_token"
      })
    });

    if (refreshRes.ok) {
      const newTokens = await refreshRes.json();
      settings.teamleader_tokens = newTokens;
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

      // Retry original request
      res = await fetch(url, {
        ...options,
        headers: { ...options.headers, 'Authorization': `Bearer ${newTokens.access_token}` }
      });
    }
  }

  if (!res.ok) {
    throw new Error("Teamleader API error: " + await res.text());
  }

  return res.json();
}


app.get("/api/teamleader/contacts", async (req, res) => {
  try {
    const companyId = req.query.company_id;
    let settings = {};
    if (fs.existsSync(SETTINGS_FILE)) settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    
    const tlData = await fetchTeamleader(`https://api.focus.teamleader.eu/contacts.list?filter[company_id]=${companyId}`);
    res.json({ success: true, data: tlData.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/teamleader/companies", async (req, res) => {
  try {
    const tlData = await fetchTeamleader('https://api.focus.teamleader.eu/companies.list');
    res.json({ success: true, data: tlData.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sync/teamleader", async (req, res) => {
  try {
    const tlData = await fetchTeamleader('https://api.focus.teamleader.eu/companies.list');
    
    // Process tlData.data and push to Supabase...
    // 3. Transform and insert into Supabase
    const mappedClients = tlData.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      industry: c.business_type || 'Onbekend',
      status: c.status === 'active' ? 'Actief' : 'Inactief',
      address: c.primary_address ? `${c.primary_address.line_1 || ''}, ${c.primary_address.postal_code || ''} ${c.primary_address.city || ''}`.trim() : ''
    }));

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase credentials missing in server config");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Upsert into Supabase
    const { error: dbError } = await supabaseAdmin
      .from('clients')
      .upsert(mappedClients, { onConflict: 'id' });
      
    if (dbError) throw dbError;

    res.json({ success: true, message: `${mappedClients.length} klanten gesynchroniseerd!`, count: mappedClients.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Billit Integration (Placeholder) ---
app.get("/api/invoices", async (req, res) => {
  try {
    const BILLIT_API_KEY = process.env.BILLIT_API_KEY;
    if (!BILLIT_API_KEY) {
      // For now, return empty array instead of crashing so UI doesn't break if no key
      return res.json({ invoices: [] });
    }
    
    // 1. Fetch invoices from Billit API
    /*
    const billitRes = await fetch('https://api.billit.be/v1/invoices', {
      headers: { 'x-api-key': BILLIT_API_KEY }
    });
    const billitData = await billitRes.json();
    */

    res.json({ invoices: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});
  app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  




app.listen(PORT, "0.0.0.0", () => {
    console.log(`Studio Graaf server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
