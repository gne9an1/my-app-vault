/*
 * Design: Glass Vault / Frosted Modern
 * Main page - assembles Header, Sidebar, AppCards, Dialogs
 * Dark background with teal accents, glass morphism cards
 * MOBILE-FIRST: single column on phones, sidebar on desktop
 * - Mobile: full-width cards, FAB for filters, compact spacing
 * - Desktop: sidebar + 2-3 column grid
 */
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem } from '@/lib/types';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import AppCard from '@/components/AppCard';
import AddAppDialog from '@/components/AddAppDialog';
import SettingsDialog from '@/components/SettingsDialog';
import ImportExportDialog from '@/components/ImportExportDialog';
import FormatModeBar from '@/components/FormatModeBar';
import EmptyState from '@/components/EmptyState';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

export default function Home() {
  const { apps, getFilteredApps, isFormatMode, setIsFormatMode } = useAppContext();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredApps = getFilteredApps();

  function handleEdit(app: AppItem) {
    setEditingApp(app);
    setShowAddDialog(true);
  }

  function handleFormatModeToggle() {
    setIsFormatMode(!isFormatMode);
  }

  return (
    <div className="min-h-screen min-h-[100dvh] relative" style={{ background: 'oklch(0.13 0.015 260)' }}>
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("https://d2xsxph8kpxj0f.cloudfront.net/310519663296462128/hPcSjJmyRTSXUtFyPw4oDE/sidebar-pattern-EAermaWhLaErufZVzodi9a.webp")`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Header */}
      <Header
        onAddClick={() => { setEditingApp(null); setShowAddDialog(true); }}
        onExportClick={() => setShowExport(true)}
        onImportClick={() => setShowImport(true)}
        onSettingsClick={() => setShowSettings(true)}
        onFormatModeClick={handleFormatModeToggle}
      />

      {/* Format Mode Bar */}
      <AnimatePresence>
        {isFormatMode && <FormatModeBar />}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex relative">
        {/* Mobile: Sheet-based sidebar (RTL: opens from left) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="p-0 border-r-0 w-[82%] max-w-[300px]"
            style={{
              background: 'oklch(0.15 0.02 260 / 98%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="pt-12 h-full overflow-y-auto pb-6">
              <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} isMobile />
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile FAB for filters */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-5 left-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          style={{
            background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
            color: 'oklch(0.15 0.015 260)',
            boxShadow: '0 4px 25px oklch(0.75 0.15 180 / 35%), 0 0 40px oklch(0.75 0.15 180 / 15%)',
          }}
          aria-label="فتح الفلاتر"
        >
          <SlidersHorizontal size={20} />
        </button>

        {/* Desktop: Sticky sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-57px)] min-h-[calc(100dvh-57px)]">
          {apps.length === 0 ? (
            <EmptyState
              onAddClick={() => { setEditingApp(null); setShowAddDialog(true); }}
              onImportClick={() => setShowImport(true)}
            />
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Results count */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm" style={{ color: 'oklch(0.55 0.01 260)' }}>
                  {filteredApps.length === apps.length
                    ? `${apps.length} تطبيق`
                    : `${filteredApps.length} من ${apps.length} تطبيق`
                  }
                </p>
              </div>

              {/* Apps Grid */}
              {filteredApps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredApps.map((app, i) => (
                      <AppCard key={app.id} app={app} index={i} onEdit={handleEdit} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 sm:py-20"
                >
                  <p className="text-sm sm:text-base" style={{ color: 'oklch(0.50 0.01 260)' }}>
                    لا توجد نتائج مطابقة للفلتر الحالي
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <AddAppDialog
        open={showAddDialog}
        onOpenChange={(open) => { setShowAddDialog(open); if (!open) setEditingApp(null); }}
        editApp={editingApp}
      />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <ImportExportDialog open={showExport} onOpenChange={setShowExport} mode="export" />
      <ImportExportDialog open={showImport} onOpenChange={setShowImport} mode="import" />
    </div>
  );
}
