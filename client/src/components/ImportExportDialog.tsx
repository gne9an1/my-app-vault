/*
 * LIGHT MODE - Vibrant Import/Export dialog
 * White bg, green export, amber import, clear buttons
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import { useRef } from 'react';
import { Download, Upload, FileJson, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'export' | 'import';
}

export default function ImportExportDialog({ open, onOpenChange, mode }: ImportExportDialogProps) {
  const { exportData, importData, apps } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  function handleExport() {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير البيانات بنجاح');
  }

  function handleCopyToClipboard() {
    const data = exportData();
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      toast.success('تم نسخ البيانات');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (importData(text)) {
        toast.success('تم استيراد البيانات بنجاح');
        onOpenChange(false);
      } else {
        toast.error('ملف غير صالح. تأكد إنه ملف JSON من App Vault');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[85vh] max-h-[85dvh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900" style={{
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {mode === 'export' ? 'تصدير البيانات' : 'استيراد البيانات'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'export' ? (
          <div className="space-y-3 sm:space-y-4 mt-2">
            <div className="p-5 rounded-xl text-center bg-green-50 border-2 border-green-200">
              <FileJson size={44} className="mx-auto mb-3 text-green-500" />
              <p className="text-sm sm:text-base font-bold text-gray-800">
                {apps.length} تطبيق جاهز للتصدير
              </p>
              <p className="text-xs sm:text-sm mt-1.5 text-gray-500 leading-relaxed">
                احفظ الملف في Google Drive أو أي كلاود عشان يكون متاح بعد الفورمات
              </p>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white transition-all active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
              }}
            >
              <Download size={18} />
              تحميل ملف JSON
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold text-gray-600 border-2 border-gray-200 bg-white hover:bg-gray-50 transition-all"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? 'تم النسخ' : 'نسخ للحافظة'}
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 mt-2">
            <div className="p-5 rounded-xl text-center bg-amber-50 border-2 border-amber-200">
              <Upload size={44} className="mx-auto mb-3 text-amber-500" />
              <p className="text-sm sm:text-base font-bold text-gray-800">
                استورد بياناتك
              </p>
              <p className="text-xs sm:text-sm mt-1.5 text-gray-500 leading-relaxed">
                اختر ملف JSON اللي صدرته سابقاً. البيانات الحالية بتنحذف وتتبدل بالبيانات المستوردة.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white transition-all active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
              }}
            >
              <Upload size={18} />
              اختر ملف JSON
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
