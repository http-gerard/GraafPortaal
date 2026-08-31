import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/auth/LoginScreen';
import { SetPasswordScreen } from './components/auth/SetPasswordScreen';
import { DatabaseProvider } from './contexts/DatabaseContext';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { TopBar } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Tasks } from './components/Tasks';
import { Clients } from './components/Clients';
import { Projects } from './components/Projects';
import { TeamMembers } from './components/TeamMembers';
import { ProjectDetails } from './components/ProjectDetails';
import { ClientPortal } from './components/ClientPortal';
import { TaskModal } from './components/TaskModal';
import { TicketOverview } from './components/TicketOverview';
import { Settings } from './components/Settings';
import { ClientDetails } from './components/ClientDetails';
import { Agenda } from './components/Agenda';
import OffertoolApp from './offertool/App';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('type=invite') || window.location.hash.includes('type=recovery')) {
      setNeedsPassword(true);
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = React.useState('overview');
  const [viewMode, setViewMode] = React.useState<'agency' | 'client'>('agency');

  // Set role automatically based on metadata or email when session loads
  const hasInitializedRole = React.useRef(false);
  useEffect(() => {
    if (session?.user && !hasInitializedRole.current) {
      hasInitializedRole.current = true;
      const role = session.user.user_metadata?.role;
      
      if (role === 'client') {
        setViewMode('client');
        setActiveTab('portal');
        if (session.user.user_metadata?.client_id) {
          setPortalClientId(session.user.user_metadata.client_id);
        }
      } else if (session.user.email && session.user.email.endsWith('@studio-graaf.be')) {
        setViewMode('agency');
      } else {
        // Fallback for the demo if someone logs in with a random email but no role metadata
        // Real app would probably block this or default to client
        setViewMode('agency'); 
      }
    } else if (!session?.user) {
      hasInitializedRole.current = false;
    }
  }, [session]);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [portalClientId, setPortalClientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portalId = params.get('portal');
    const quoteId = params.get('quoteId');
    const view = params.get('view');
    
    if (portalId) {
      setPortalClientId(portalId);
      setViewMode('client');
      setActiveTab('portal');
    } else if (quoteId && view === 'client') {
      // Direct link to Quote Presentation
      setActiveTab('offertes');
    }
  }, []);

  const handleViewProject = (id: string) => {
    setSelectedProjectId(id);
    setActiveTab('project-details');
  };

  const handleViewClient = (id: string) => {
    setSelectedClientId(id);
    setActiveTab('client-details');
  };

  const renderView = () => {
    if (viewMode === 'client') {
      switch (activeTab) {
        case 'portal':
          return (
            <ClientPortal 
              clientId={portalClientId || undefined}
              onViewProject={handleViewProject} 
              onViewAllProjects={() => setActiveTab('projects')}
            />
          );
        case 'projects':
        case 'project-details':
          return (
            <ProjectDetails 
              projectId={selectedProjectId || undefined} 
              onAddTask={() => setIsTaskModalOpen(true)}
              onNavigateToProject={handleViewProject}
              onNavigateToClient={handleViewClient}
              viewMode={viewMode}
            />
          );
        case 'settings':
          return <Settings viewMode={viewMode} />;
        default:
          return (activeTab === 'project-details' || activeTab === 'projects') ? renderView() : (
            <ClientPortal 
              clientId={portalClientId || undefined}
              onViewProject={handleViewProject} 
              onViewAllProjects={() => setActiveTab('projects')}
            />
          );
      }
    }

    switch (activeTab) {
      case 'overview':
        return <Dashboard onViewProject={handleViewProject} />;
      case 'projects':
        return <Projects onViewProject={handleViewProject} />;
      case 'agenda':
        return <Agenda />;
      case 'offertes':
        return <OffertoolApp />;
      case 'project-details':
        return (
          <ProjectDetails 
            projectId={selectedProjectId || undefined} 
            onAddTask={() => setIsTaskModalOpen(true)}
            onNavigateToProject={handleViewProject}
            onNavigateToClient={handleViewClient}
            viewMode={viewMode}
          />
        );
      case 'tasks':
        return <Tasks onNavigateToProject={handleViewProject} onNavigateToClient={handleViewClient} onAddTask={() => setIsTaskModalOpen(true)} />;
      case 'tickets':
        return <TicketOverview />;
      case 'client-details':
        return <ClientDetails clientId={selectedClientId || undefined} />;
      case 'team':
        return <Clients onViewClient={handleViewClient} />;

      case 'settings':
          return <Settings viewMode={viewMode} />;
      default:
        return <Dashboard onViewProject={handleViewProject} />;
    }
  };

  
  // Special exception: Unauthenticated Prospect View for Quotes
  const isProspectQuoteView = new URLSearchParams(window.location.search).get('view') === 'client';

  if (isCheckingAuth && !isProspectQuoteView) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#7b68ee] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!session && !isProspectQuoteView) {
    return <LoginScreen onLoginSuccess={setSession} />;
  }

  // If this is a direct link to the quote presentation, bypass the entire App layout
  if (isProspectQuoteView) {
    return <OffertoolApp />;
  }

  if (needsPassword && session) {
    return <SetPasswordScreen onComplete={() => setNeedsPassword(false)} />;
  }

  return (
    <DatabaseProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-body">
      <TopBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />
      
      <main className="min-h-screen flex flex-col">
        <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewMode}-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
    
      </main>

      <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      </div>
    </DatabaseProvider>
  );
}

