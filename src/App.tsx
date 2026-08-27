import React, { useState, useEffect } from 'react';
import { SignFlowProvider, useSignFlow } from './context/SignFlowContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationToast } from './components/layout/NotificationToast';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EnvelopeVaultList } from './components/envelopes/EnvelopeVaultList';
import { DocumentPrepStudio } from './components/prepare/DocumentPrepStudio';
import { SigningExperience } from './components/signing/SigningExperience';
import { AILegalHub } from './components/ai/AILegalHub';
import { NotarySessionView } from './components/notary/NotarySessionView';
import { TemplateLibraryView } from './components/templates/TemplateLibraryView';
import { PowerFormsView } from './components/templates/PowerFormsView';
import { CertificateOfCompletionModal } from './components/certificate/CertificateOfCompletionModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { ComplianceTrustCenter } from './components/admin/ComplianceTrustCenter';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, selectedCertificateEnvelopeId, activeEnvelopeId } = useSignFlow();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When signing view is active, render full-screen distraction-free signing experience
  if (activeView === 'signing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <SigningExperience />
        <NotificationToast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && <DashboardOverview />}
          {activeView === 'envelopes' && <EnvelopeVaultList />}
          {activeView === 'prepare' && <DocumentPrepStudio />}
          {activeView === 'ai-hub' && <AILegalHub />}
          {activeView === 'notary' && <NotarySessionView />}
          {activeView === 'templates' && <TemplateLibraryView />}
          {activeView === 'powerforms' && <PowerFormsView />}
          {activeView === 'compliance' && <ComplianceTrustCenter />}
          {activeView === 'admin' && <AdminPortal />}
          {activeView === 'certificate' && (
            <CertificateOfCompletionModal
              isOpen={true}
              onClose={() => setActiveView('envelopes')}
              envelopeId={selectedCertificateEnvelopeId || activeEnvelopeId || ''}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Floating Toasts */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <NotificationToast />
    </div>
  );
};

export function App() {
  return (
    <SignFlowProvider>
      <MainLayout />
    </SignFlowProvider>
  );
}

export default App;
