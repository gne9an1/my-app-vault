/*
 * Design: Glass Vault / Frosted Modern
 * Import/Export dialog
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
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" style={{
        background: 'oklch(0.16 0.02 260)',
        border: '1px solid oklch(0.35 0.015 260 / 30%)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold" style={{
            color: 'oklch(0.95 0.005 260)',
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {mode === 'export' ? 'تصدير البيانات' : 'استيراد البيانات'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'export' ? (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl text-center" style={{
              background: 'oklch(0.20 0.015 260 / 50%)',
              border: '1px solid oklch(0.30 0.015 260 / 20%)',
            }}>
              <FileJson size={40} className="mx-auto mb-2" style={{ color: 'oklch(0.75 0.15 180)' }} />
              <p className="text-sm font-medium" style={{ color: 'oklch(0.85 0.005 260)' }}>
                {apps.length} تطبيق جاهز للتصدير
              </p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.01 260)' }}>
                احفظ الملف في Google Drive أو أي كلاود عشان يكون متاح بعد الفورمات
              </p>
            </div>

            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                color: 'oklch(0.15 0.015 260)',
              }}
            >
              <Download size={16} />
              تحميل ملف JSON
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
              style={{
                color: 'oklch(0.70 0.01 260)',
                border: '1px solid oklch(0.35 0.015 260 / 30%)',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'تم النسخ' : 'نسخ للحافظة'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="p-4 rounded-xl text-center" style={{
              background: 'oklch(0.20 0.015 260 / 50%)',
              border: '1px solid oklch(0.30 0.015 260 / 20%)',
            }}>
              <Upload size={40} className="mx-auto mb-2" style={{ color: 'oklch(0.78 0.15 80)' }} />
              <p className="text-sm font-medium" style={{ color: 'oklch(0.85 0.005 260)' }}>
                استورد بياناتك
              </p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.01 260)' }}>
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, oklch(0.78 0.15 80), oklch(0.70 0.18 60))',
                color: 'oklch(0.15 0.015 260)',
              }}
            >
              <Upload size={16} />
              اختر ملف JSON
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
