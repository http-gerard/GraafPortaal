import * as React from 'react';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  Mail, 
  Smartphone,
  ChevronRight,
  Check,
  Users
} from 'lucide-react';
import { Card, Button } from './UI';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { TeamMembers } from './TeamMembers';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profiel', icon: User },
  { id: 'team', label: 'Mijn Team', icon: Users },
  { id: 'notifications', label: 'Meldingen', icon: Bell },
  { id: 'security', label: 'Beveiliging', icon: Lock },
  { id: 'emails', label: 'E-mail Sjablonen', icon: Mail },
];

export const Settings = ({ viewMode = 'agency' }: { viewMode?: 'agency' | 'client' }) => {
  const [activeTab, setActiveTab] = React.useState('profile');
  const [profileName, setProfileName] = React.useState('');
  const [profileEmail, setProfileEmail] = React.useState('');
  const [profilePhone, setProfilePhone] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [icsUrl, setIcsUrl] = React.useState('');
  // Email Templates State
  const defaultTemplates = {
    quote_invite: { subject: 'Jouw Offerte van Studio Graaf is klaar: {offerte_nummer}', body: 'Beste {klantnaam},\n\nHierbij sturen we je met veel plezier ons voorstel.\n\nJe kunt de offerte interactief bekijken, downloaden of direct digitaal ondertekenen via jouw persoonlijke beveiligde portaal:\n{portaal_link}\n\nMet vriendelijke groet,\nTeam Studio Graaf' },
    quote_reminder: { subject: 'Heb je ons voorstel goed ontvangen?', body: 'Hoi {klantnaam},\n\nEven een kort berichtje om te checken of je alles goed hebt ontvangen.\nMocht je vragen hebben over {offerte_nummer}, dan plannen we graag een call in.\n\nPortaal: {portaal_link}' },
    portal_invite: { subject: 'Welkom bij Studio Graaf! Jouw persoonlijke portaal', body: 'Beste {klantnaam},\n\nWelkom! Om onze samenwerking vlot te laten verlopen hebben we een persoonlijk portaal voor {bedrijfsnaam} aangemaakt.\n\nHier vind je al je bestanden, afspraken en feedback terug:\n{portaal_link}' },
    feedback_request: { subject: 'We horen graag jouw mening', body: 'Hoi {klantnaam},\n\nWe hebben nieuwe updates of documenten voor je klaargezet in het portaal.\nZou je hier even naar willen kijken en ons van feedback voorzien?\n\n{portaal_link}' },
    internal_signed: { subject: '🎉 Offerte Getekend: {bedrijfsnaam}', body: 'Hoera!\n\nDe offerte {offerte_nummer} is zojuist digitaal ondertekend door {klantnaam} van {bedrijfsnaam}.\n\nBekijk de details in het systeem.' },
    internal_viewed: { subject: '👀 Offerte Bekeken: {bedrijfsnaam}', body: 'Klant {klantnaam} is op dit moment de offerte {offerte_nummer} aan het bekijken.\n\nDit is een goed moment voor sales om stand-by te staan!' },
    internal_feedback: { subject: '💬 Nieuwe reactie van {bedrijfsnaam}', body: '{klantnaam} heeft zojuist een reactie of vraag achtergelaten in het portaal.\n\nLog in om deze direct te beantwoorden.' },
  };

  const [templates, setTemplates] = React.useState(defaultTemplates);
  
  const [activeEmailTab, setActiveEmailTab] = React.useState('quote_invite');

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setProfileEmail(session.user.email || '');
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        if (metaName) setProfileName(metaName);
        if (session.user.user_metadata?.phone) setProfilePhone(session.user.user_metadata.phone);
        else if (session.user.email) {
          const emailName = session.user.email.split('@')[0];
          setProfileName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    });

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.outlook_ics_url) setIcsUrl(data.settings.outlook_ics_url);
        if (data.settings?.graaf_email_templates) setTemplates(data.settings.graaf_email_templates);
      })
      .catch(console.error);
  }, []);

  
  const updateTemplate = (key: string, field: 'subject' | 'body', value: string) => {
    setTemplates(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update profile name in Supabase Auth
      if (profileName || profilePhone !== undefined) {
        await supabase.auth.updateUser({
          data: { full_name: profileName, name: profileName, phone: profilePhone }
        });
        window.dispatchEvent(new Event('profileUpdated'));
      }
      
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          alert("Nieuwe wachtwoorden komen niet overeen!");
          setIsSaving(false);
          return;
        }
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwError) {
          alert("Fout bij updaten wachtwoord: " + pwError.message);
          setIsSaving(false);
          return;
        }
        setNewPassword('');
        setConfirmPassword('');
      }

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outlook_ics_url: icsUrl, graaf_email_templates: templates })
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch(e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Instellingen</h1>
          <p className="text-slate-500 text-sm font-medium">Beheer uw accountvoorkeuren en applicatie-instellingen.</p>
        </div>
        <div className="flex gap-3">
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100"
            >
              <Check size={16} />
              Wijzigingen opgeslagen
            </motion.div>
          )}
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Opslaan..." : "Opslaan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Nav */}
        <aside className="space-y-1">
          {SETTINGS_TABS.filter(t => viewMode === 'agency' || ['profile', 'notifications', 'security'].includes(t.id)).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-[#7b68ee] text-white shadow-lg shadow-[#7b68ee]/20" 
                  : "text-slate-500 hover:bg-[#f1f5f9] hover:text-slate-900"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <>
            <Card className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Persoonlijke Gegevens</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">Volledige Naam</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#f1f5f9] border-none text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#7b68ee] transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">E-mailadres</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="email" 
                      value={profileEmail}
                      disabled
                      title="Je e-mailadres is gekoppeld aan je account en kan hier niet worden gewijzigd"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#e2e8f0] text-slate-500 border-none text-xs font-bold cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">Telefoonnummer</label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+32 456 78 90 12"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#f1f5f9] border-none text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#7b68ee] transition-all"
                    />
                  </div>
                </div>
              </div>
            </Card>
            
            {viewMode === 'agency' && (
            <Card className="p-8 mt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Microsoft Outlook Koppeling</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Agenda ICS (iCal) Link</label>
                  <input 
                    type="url" 
                    value={icsUrl}
                    onChange={(e) => setIcsUrl(e.target.value)}
                    placeholder="https://outlook.office365.com/owa/calendar/.../reachcalendar.ics"
                    className="w-full bg-[#f1f5f9] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#7b68ee]/30 transition-all font-bold text-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-2">
                    Genereer deze link in Outlook via: Instellingen &gt; Agenda &gt; Gedeelde Agenda's &gt; Een agenda publiceren (Kies 'Kan alle details bekijken').
                  </p>
                </div>
              </div>
            </Card>
          )}
            </>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <TeamMembers />
            </div>
          )}

          {activeTab === 'notifications' && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Meldingen Voorkeuren</h2>
              <div className="space-y-6">
                {[
                  { title: "E-mail Meldingen", desc: "Ontvang updates via e-mail bij belangrijke wijzigingen." },
                  { title: "Browser Meldingen", desc: "Toon real-time notificaties in uw browser." },
                  { title: "Ticket Updates", desc: "Melding krijgen wanneer een ticket status verandert." },
                  { title: "Project Deadlines", desc: "Waarschuwing wanneer een deadline naderbij komt." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7b68ee] focus:ring-offset-2 bg-[#7b68ee]">
                      <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Account Beveiliging</h2>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <Shield className="text-amber-500" size={20} />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Twee-factor Authenticatie</p>
                      <p className="text-[10px] text-amber-700">Verhoog uw accountbeveiliging door 2FA in te schakelen.</p>
                    </div>
                    <Button variant="secondary" size="sm" className="ml-auto bg-white hover:bg-amber-100">Inschakelen</Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400">Huidig Wachtwoord</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl bg-[#e2e8f0] text-slate-400 border-none text-xs font-bold cursor-not-allowed" disabled title="Niet nodig" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">Nieuw Wachtwoord</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 rounded-xl bg-[#f1f5f9] border-none text-xs font-bold text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400">Bevestig Wachtwoord</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 rounded-xl bg-[#f1f5f9] border-none text-xs font-bold text-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

                            {activeTab === 'emails' && (
            <Card className="p-0 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
              
              {/* Left sidebar: List of templates */}
              <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">E-mail Sjablonen</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 mt-2">Naar de Klant</div>
                  {[
                    { id: 'quote_invite', label: 'Offerte Uitnodiging' },
                    { id: 'quote_reminder', label: 'Offerte Herinnering' },
                    { id: 'portal_invite', label: 'Portaal Uitnodiging' },
                    { id: 'feedback_request', label: 'Feedback Verzoek' }
                  ].map(t => (
                    <button key={t.id} onClick={() => setActiveEmailTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeEmailTab === t.id ? 'bg-[#7b68ee] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                      {t.label}
                    </button>
                  ))}

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 mt-4">Interne Meldingen (Naar Studio Graaf)</div>
                  {[
                    { id: 'internal_signed', label: 'Offerte Getekend 🎉' },
                    { id: 'internal_viewed', label: 'Offerte Bekeken 👀' },
                    { id: 'internal_feedback', label: 'Nieuwe Reactie 💬' }
                  ].map(t => (
                    <button key={t.id} onClick={() => setActiveEmailTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${activeEmailTab === t.id ? 'bg-[#7b68ee] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right side: Editor */}
              <div className="flex-1 p-8 bg-white flex flex-col">
                <div className="p-4 rounded-xl bg-[#7b68ee]/5 border border-[#7b68ee]/20 mb-6">
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    Gebruik <strong className="text-[#7b68ee]">{'{klantnaam}'}</strong>, <strong className="text-[#7b68ee]">{'{bedrijfsnaam}'}</strong>, <strong className="text-[#7b68ee]">{'{portaal_link}'}</strong> of <strong className="text-[#7b68ee]">{'{offerte_nummer}'}</strong> om de mails te personaliseren.
                  </p>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Onderwerp</label>
                    <input 
                      type="text" 
                      value={templates[activeEmailTab].subject} 
                      onChange={(e) => updateTemplate(activeEmailTab, 'subject', e.target.value)} 
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#7b68ee] outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5 h-full flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bericht (HTML Body)</label>
                    <textarea 
                      value={templates[activeEmailTab].body} 
                      onChange={(e) => updateTemplate(activeEmailTab, 'body', e.target.value)} 
                      className="w-full flex-1 min-h-[300px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#7b68ee] outline-none resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>
              </div>

            </Card>
          )}

        </div>
      </div>
    </div>
  );
};
