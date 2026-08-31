import * as React from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Ticket, ClipboardCheck, Group, History, Settings, LogOut, Plus, Search, Bell, LayoutGrid, ChevronRight, CreditCard, Users, CheckCircle2, AlertCircle, User, FileText, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './UI';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'agency' | 'client';
  setViewMode: (mode: 'agency' | 'client') => void;
}

export const TopBar = ({ activeTab, setActiveTab, viewMode, setViewMode }: TopBarProps) => {
      const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [userEmail, setUserEmail] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('Gebruiker');

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email || '');
        const metadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
        if (metadataName) {
          setUserName(metadataName);
        } else if (session.user.email) {
          const emailName = session.user.email.split('@')[0];
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      }
    });

    // Listen for manual profile updates
    const handleProfileUpdate = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const metadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          if (metadataName) setUserName(metadataName);
        }
      });
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  
  React.useEffect(() => {
    const fetchNotifs = () => {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

    const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const agencyNavItems = [
    { id: 'overview', label: 'Overzicht', icon: LayoutDashboard },
    { id: 'projects', label: 'Projecten', icon: LayoutGrid },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'offertes', label: 'Offertes', icon: FileText },
    { id: 'tasks', label: 'Taken', icon: ClipboardCheck },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'team', label: 'Klanten', icon: Group },
  ];

  const clientNavItems = [
    { id: 'portal', label: 'Portaal', icon: LayoutDashboard },
    { id: 'projects', label: 'Projecten', icon: LayoutGrid },
  ];

  const navItems = viewMode === 'agency' ? agencyNavItems : clientNavItems;

  return (
    <header className="bg-white h-16 flex items-center px-8 w-full sticky top-0 z-40 border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-12 flex-1">
        <div className="flex flex-col items-start justify-center h-full">
          <img src="/logo.png" alt="Studio Graaf" className="h-6 object-contain" />
          
        </div>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
                (activeTab === item.id || 
                (activeTab === 'project-details' && item.id === 'projects'))
                  ? "text-[#7b68ee] bg-[#7b68ee]/10" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

            <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className={cn(
              "text-slate-500 hover:text-[#7b68ee] transition-colors p-2 hover:bg-slate-100 rounded-md relative",
              showNotifications && "text-[#7b68ee] bg-slate-100"
            )}
            title="Meldingen"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-sm text-slate-800">Recente Meldingen</h3>
                  <span className="text-[10px] font-semibold text-[#7b68ee] bg-[#7b68ee]/10 px-2 py-0.5 rounded-md">
                    {notifications.length} Actief
                  </span>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">Geen recente meldingen.</p>
                  ) : notifications.map((notif: any) => (
                    <div key={notif.id} className="group cursor-pointer">
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                          notif.type === 'success' ? "bg-emerald-50 text-emerald-500" :
                          notif.type === 'alert' ? "bg-amber-50 text-amber-500" :
                          "bg-indigo-50 text-indigo-500"
                        )}>
                          {notif.type === 'success' ? <CheckCircle2 size={16} /> :
                           notif.type === 'alert' ? <AlertCircle size={16} /> :
                           <Bell size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn(
                              "text-xs font-semibold text-slate-800",
                              notif.unread && "flex items-center gap-1.5 after:content-[''] after:w-1 after:h-1 after:bg-red-500 after:rounded-full"
                            )}>
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                            {notif.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-9 w-9 ml-2 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200 group"
          >
            <User size={18} className="text-slate-500 group-hover:text-slate-700" />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 mb-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{userName}</p>
                  <p className="text-[10px] text-slate-500">{userEmail}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-600 hover:text-[#7b68ee] transition-all group"
                >
                  <Settings size={16} className="text-slate-400 group-hover:text-[#7b68ee]" />
                  <span className="text-sm font-medium">Instellingen</span>
                </button>
                
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-slate-600 hover:text-red-600 transition-all group"
                >
                  <LogOut size={16} className="text-slate-400 group-hover:text-red-600" />
                  <span className="text-sm font-medium">Afmelden</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

  );
};
