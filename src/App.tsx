import React, { useState, useEffect } from 'react';
import { SignFlowProvider, useSignFlow } from './context/SignFlowContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationToast } from './components/layout/NotificationToast';
import { NotificationCenterDrawer } from './components/layout/NotificationCenterDrawer';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EnvelopeVaultList } from './components/envelopes/EnvelopeVaultList';
import { DocumentPrepStudio } from './components/prepare/DocumentPrepStudio';
import { SigningExperience } from './components/signing/SigningExperience';
import { AILegalHub } from './components/ai/AILegalHub';
import { AINegotiationWorkbench } from './components/clm/AINegotiationWorkbench';
import { WorkflowCanvasBuilder } from './components/workflows/WorkflowCanvasBuilder';
import { CoBrowsingRoomView } from './components/collaborate/CoBrowsingRoomView';
import { CRMMapperView } from './components/integrations/CRMMapperView';
import { OfflineSigningQueueView } from './components/offline/OfflineSigningQueueView';
import { LegacyMigrationImporterView } from './components/migration/LegacyMigrationImporterView';
import { NotarySessionView } from './components/notary/NotarySessionView';
import { QESTSPVerificationView } from './components/compliance/QESTSPVerificationView';
import { TemplateLibraryView } from './components/templates/TemplateLibraryView';
import { PowerFormsView } from './components/templates/PowerFormsView';
import { AnalyticsFunnelExplorer } from './components/analytics/AnalyticsFunnelExplorer';
import { EmailDispatcherConsole } from './components/admin/EmailDispatcherConsole';
import { CertificateOfCompletionModal } from './components/certificate/CertificateOfCompletionModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { ComplianceTrustCenter } from './components/admin/ComplianceTrustCenter';
import { LocalDatabaseManagerView } from './components/database/LocalDatabaseManagerView';

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

  // Full-screen signing experience
  if (activeView === 'signing') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <SigningExperience />
        <NotificationToast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-[#eaeff8] to-slate-200 text-slate-900 flex flex-col font-sans p-2 sm:p-4 lg:p-6 antialiased">
      {/* Outer macOS Application Frame Window */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-300/40 overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Top Window Bar with Traffic Lights and Navbar */}
        <div className="flex items-center border-b border-slate-100 bg-white">
          {/* Traffic Lights */}
          <div className="flex items-center space-x-2 px-5 py-4 border-r border-slate-100 w-64 shrink-0">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-2xs inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs inline-block" />
          </div>

          {/* Top Search & Actions */}
          <div className="flex-1">
            <Navbar onOpenSearch={() => setIsSearchOpen(true)} />
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />

          <main className="flex-1 overflow-y-auto bg-[#fafafa]/50">
            {activeView === 'dashboard' && <DashboardOverview />}
            {activeView === 'envelopes' && <div className="p-8 max-w-6xl mx-auto"><EnvelopeVaultList /></div>}
            {activeView === 'prepare' && <div className="p-8 max-w-6xl mx-auto"><DocumentPrepStudio /></div>}
            {activeView === 'ai-hub' && <div className="p-8 max-w-6xl mx-auto"><AILegalHub /></div>}
            {activeView === 'clm-workbench' && <div className="p-8 max-w-6xl mx-auto"><AINegotiationWorkbench /></div>}
            {activeView === 'workflows' && <div className="p-8 max-w-6xl mx-auto"><WorkflowCanvasBuilder /></div>}
            {activeView === 'co-browsing' && <div className="p-8 max-w-6xl mx-auto"><CoBrowsingRoomView /></div>}
            {activeView === 'crm-sync' && <div className="p-8 max-w-6xl mx-auto"><CRMMapperView /></div>}
            {activeView === 'offline-queue' && <div className="p-8 max-w-6xl mx-auto"><OfflineSigningQueueView /></div>}
            {activeView === 'migration' && <div className="p-8 max-w-6xl mx-auto"><LegacyMigrationImporterView /></div>}
            {activeView === 'notary' && <div className="p-8 max-w-6xl mx-auto"><NotarySessionView /></div>}
            {activeView === 'qes-tsp' && <div className="p-8 max-w-6xl mx-auto"><QESTSPVerificationView /></div>}
            {activeView === 'templates' && <div className="p-8 max-w-6xl mx-auto"><TemplateLibraryView /></div>}
            {activeView === 'powerforms' && <div className="p-8 max-w-6xl mx-auto"><PowerFormsView /></div>}
            {activeView === 'analytics' && <div className="p-8 max-w-6xl mx-auto"><AnalyticsFunnelExplorer /></div>}
            {activeView === 'emails' && <div className="p-8 max-w-6xl mx-auto"><EmailDispatcherConsole /></div>}
            {activeView === 'compliance' && <div className="p-8 max-w-6xl mx-auto"><ComplianceTrustCenter /></div>}
            {activeView === 'admin' && <div className="p-8 max-w-6xl mx-auto"><AdminPortal /></div>}
            {activeView === 'local-db' && <div className="p-8 max-w-6xl mx-auto"><LocalDatabaseManagerView /></div>}
            {activeView === 'certificate' && (
              <CertificateOfCompletionModal
                isOpen={true}
                onClose={() => setActiveView('envelopes')}
                envelopeId={selectedCertificateEnvelopeId || activeEnvelopeId || ''}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <NotificationCenterDrawer />
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
