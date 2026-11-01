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
import { PowerFormPublicView } from './components/powerforms/PowerFormPublicView';
import { ObligationTrackerHub } from './components/clm/ObligationTrackerHub';
import { AnalyticsFunnelExplorer } from './components/analytics/AnalyticsFunnelExplorer';
import { EmailDispatcherConsole } from './components/admin/EmailDispatcherConsole';
import { CertificateOfCompletionModal } from './components/certificate/CertificateOfCompletionModal';
import { CreateEnvelopeModal } from './components/envelopes/CreateEnvelopeModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { ComplianceTrustCenter } from './components/admin/ComplianceTrustCenter';
import { LocalDatabaseManagerView } from './components/database/LocalDatabaseManagerView';
import { AuthView } from './components/auth/AuthView';

const MainLayout: React.FC = () => {
  const { 
    isAuthenticated,
    activeView, 
    setActiveView, 
    selectedCertificateEnvelopeId, 
    activeEnvelopeId,
    activeSigningRecipientId,
    isCreateEnvelopeModalOpen,
    closeCreateEnvelopeModal,
    isCertificateModalOpen,
    closeCertificateView
  } = useSignFlow();
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

  // If unauthenticated (no active session or invited guest), show Auth & Identity Gateway
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans">
        <AuthView 
          pendingEnvelopeId={activeEnvelopeId} 
          pendingSignerId={activeSigningRecipientId} 
        />
        <NotificationToast />
      </div>
    );
  }

  // Full-screen signing experience
  if (activeView === 'signing') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <SigningExperience />
        <CertificateOfCompletionModal
          isOpen={isCertificateModalOpen}
          onClose={closeCertificateView}
          envelopeId={selectedCertificateEnvelopeId || activeEnvelopeId || ''}
        />
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
          <div className="flex items-center space-x-2 px-4 py-4 border-r border-slate-100 shrink-0">
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
            {activeView === 'obligations' && <ObligationTrackerHub />}
            {activeView === 'co-browsing' && <div className="p-8 max-w-6xl mx-auto"><CoBrowsingRoomView /></div>}
            {activeView === 'crm-sync' && <div className="p-8 max-w-6xl mx-auto"><CRMMapperView /></div>}
            {activeView === 'offline-queue' && <div className="p-8 max-w-6xl mx-auto"><OfflineSigningQueueView /></div>}
            {activeView === 'migration' && <div className="p-8 max-w-6xl mx-auto"><LegacyMigrationImporterView /></div>}
            {activeView === 'notary' && <div className="p-8 max-w-6xl mx-auto"><NotarySessionView /></div>}
            {activeView === 'qes-tsp' && <div className="p-8 max-w-6xl mx-auto"><QESTSPVerificationView /></div>}
            {activeView === 'templates' && <div className="p-8 max-w-6xl mx-auto"><TemplateLibraryView /></div>}
            {activeView === 'powerforms' && <PowerFormPublicView powerFormId={activeEnvelopeId || undefined} onExit={() => setActiveView('dashboard')} />}
            {activeView === 'analytics' && <div className="p-8 max-w-6xl mx-auto"><AnalyticsFunnelExplorer /></div>}
            {activeView === 'emails' && <div className="p-8 max-w-6xl mx-auto"><EmailDispatcherConsole /></div>}
            {activeView === 'compliance' && <div className="p-8 max-w-6xl mx-auto"><ComplianceTrustCenter /></div>}
            {activeView === 'admin' && <div className="p-8 max-w-6xl mx-auto"><AdminPortal /></div>}
            {activeView === 'local-db' && <div className="p-8 max-w-6xl mx-auto"><LocalDatabaseManagerView /></div>}
            {activeView === 'certificate' && <div className="p-8 max-w-6xl mx-auto"><DocumentPrepStudio /></div>}
          </main>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <CreateEnvelopeModal
        isOpen={isCreateEnvelopeModalOpen}
        onClose={closeCreateEnvelopeModal}
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <CertificateOfCompletionModal
        isOpen={isCertificateModalOpen || activeView === 'certificate'}
        onClose={closeCertificateView}
        envelopeId={selectedCertificateEnvelopeId || activeEnvelopeId || ''}
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
