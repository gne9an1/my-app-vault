/*
 * Design: Glass Vault / Frosted Modern
 * Add/Edit app dialog with smart URL detection and auto-fetch
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem, AppSource, Priority } from '@/lib/types';
import { fetchAppData, detectSource } from '@/lib/fetcher';
import { useState, useEffect } from 'react';
import { Loader2, Link2, Sparkles, Github, Play, Box, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editApp?: AppItem | null;
}

export default function AddAppDialog({ open, onOpenChange, editApp }: AddAppDialogProps) {
  const { addApp, updateApp, categories, devices } = useAppContext();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [version, setVersion] = useState('');
  const [downloadPageUrl, setDownloadPageUrl] = useState('');
  const [source, setSource] = useState<AppSource>('manual');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [developer, setDeveloper] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  useEffect(() => {
    if (editApp) {
      setName(editApp.name);
      setDescription(editApp.description);
      setIconUrl(editApp.iconUrl);
      setVersion(editApp.version);
      setDownloadPageUrl(editApp.downloadPageUrl);
      setSource(editApp.source);
      setCategory(editApp.category);
      setPriority(editApp.priority);
      setSelectedDevices(editApp.devices);
      setNotes(editApp.notes);
      setDeveloper(editApp.developer || '');
      setUrl(editApp.sourceUrl);
      setIsManualMode(true);
    } else {
      resetForm();
    }
  }, [editApp, open]);

  function resetForm() {
    setUrl('');
    setName('');
    setDescription('');
    setIconUrl('');
    setVersion('');
    setDownloadPageUrl('');
    setSource('manual');
    setCategory('other');
    setPriority('medium');
    setSelectedDevices([]);
    setNotes('');
    setDeveloper('');
    setFetchError('');
    setIsManualMode(false);
  }

  async function handleFetch() {
    if (!url.trim()) return;
    setIsFetching(true);
    setFetchError('');

    try {
      const data = await fetchAppData(url.trim());
      setName(data.name);
      setDescription(data.description);
      setIconUrl(data.iconUrl);
      setVersion(data.version);
      setDownloadPageUrl(data.downloadPageUrl);
      setSource(data.source);
      setDeveloper(data.developer || '');
      setIsManualMode(true);
      toast.success('تم سحب بيانات التطبيق بنجاح');
    } catch (err: any) {
      setFetchError(err.message || 'حدث خطأ في سحب البيانات');
      setIsManualMode(true);
      const detected = detectSource(url.trim());
      if (detected) {
        setSource(detected);
        setDownloadPageUrl(url.trim());
      }
    } finally {
      setIsFetching(false);
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم التطبيق');
      return;
    }

    const appData = {
      name: name.trim(),
      description: description.trim(),
      iconUrl: iconUrl.trim(),
      source,
      sourceUrl: url.trim(),
      downloadPageUrl: downloadPageUrl.trim() || url.trim(),
      version: version.trim(),
      developer: developer.trim(),
      category,
      priority,
      devices: selectedDevices,
      notes: notes.trim(),
    };

    if (editApp) {
      updateApp(editApp.id, appData);
      toast.success('تم تحديث التطبيق');
    } else {
      addApp(appData);
      toast.success('تم إضافة التطبيق');
    }

    onOpenChange(false);
    resetForm();
  }

  function toggleDevice(deviceId: string) {
    setSelectedDevices(prev =>
      prev.includes(deviceId) ? prev.filter(d => d !== deviceId) : [...prev, deviceId]
    );
  }

  const inputStyle = {
    background: 'oklch(0.18 0.015 260 / 70%)',
    border: '1px solid oklch(0.35 0.015 260 / 30%)',
    color: 'oklch(0.92 0.005 260)',
  };

  const labelStyle = { color: 'oklch(0.65 0.01 260)' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{
        background: 'oklch(0.16 0.02 260)',
        border: '1px solid oklch(0.35 0.015 260 / 30%)',
        backdropFilter: 'blur(24px)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold" style={{
            color: 'oklch(0.95 0.005 260)',
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {editApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* URL Input with Fetch */}
          {!editApp && (
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={labelStyle}>
                رابط التطبيق (GitHub / Google Play / F-Droid)
              </label>
              <div className="flex gap-2">
                <div className="glow-input flex-1 flex items-center gap-2 rounded-lg px-3 py-2">
                  <Link2 size={15} style={{ color: 'oklch(0.50 0.01 260)' }} />
                  <input
                    type="url"
                    placeholder="الصق الرابط هنا..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                    className="bg-transparent border-none outline-none w-full text-sm"
                    style={{ color: 'oklch(0.90 0.005 260)' }}
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleFetch}
                  disabled={isFetching || !url.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                    color: 'oklch(0.15 0.015 260)',
                  }}
                >
                  {isFetching ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  جلب
                </button>
              </div>
              {fetchError && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: 'oklch(0.70 0.18 40)' }}>
                  <AlertCircle size={12} />
                  {fetchError} - يمكنك الإضافة يدوياً
                </div>
              )}
              <button
                onClick={() => { setIsManualMode(true); setSource('manual'); }}
                className="text-xs mt-2 transition-all hover:underline"
                style={{ color: 'oklch(0.60 0.12 180)' }}
              >
                أو أضف يدوياً بدون رابط
              </button>
            </div>
          )}

          {/* Manual/Fetched Form */}
          {(isManualMode || editApp) && (
            <>
              {/* App Icon Preview + Name */}
              <div className="flex gap-3 items-start">
                <div className="shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="w-16 h-16 rounded-xl object-cover"
                      style={{ border: '1px solid oklch(0.35 0.015 260 / 30%)' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold"
                      style={{
                        background: 'oklch(0.22 0.02 260)',
                        border: '1px solid oklch(0.35 0.015 260 / 30%)',
                        color: 'oklch(0.75 0.15 180)',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}>
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={labelStyle}>اسم التطبيق *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal/30"
                      style={inputStyle}
                      placeholder="مثال: Magisk"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={labelStyle}>رابط الأيقونة</label>
                    <input
                      type="url"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal/30"
                      style={inputStyle}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={labelStyle}>الوصف</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  rows={2}
                  placeholder="وصف مختصر للتطبيق..."
                />
              </div>

              {/* Download Page URL */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={labelStyle}>رابط صفحة التحميل</label>
                <input
                  type="url"
                  value={downloadPageUrl}
                  onChange={(e) => setDownloadPageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>

              {/* Version + Source Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={labelStyle}>الإصدار</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal/30"
                    style={inputStyle}
                    placeholder="1.0.0"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={labelStyle}>المصدر</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as AppSource)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="github">GitHub</option>
                    <option value="playstore">Google Play</option>
                    <option value="fdroid">F-Droid</option>
                    <option value="manual">يدوي</option>
                  </select>
                </div>
              </div>

              {/* Category + Priority Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={labelStyle}>التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={labelStyle}>الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={inputStyle}
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              {/* Devices */}
              {devices.length > 0 && (
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={labelStyle}>الأجهزة (اختياري)</label>
                  <div className="flex flex-wrap gap-2">
                    {devices.map(dev => (
                      <button
                        key={dev.id}
                        onClick={() => toggleDevice(dev.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={selectedDevices.includes(dev.id) ? {
                          background: 'oklch(0.75 0.15 180 / 15%)',
                          color: 'oklch(0.85 0.12 180)',
                          border: '1px solid oklch(0.75 0.15 180 / 30%)',
                        } : {
                          background: 'oklch(0.20 0.015 260 / 50%)',
                          color: 'oklch(0.60 0.01 260)',
                          border: '1px solid oklch(0.35 0.015 260 / 20%)',
                        }}
                      >
                        {dev.icon} {dev.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'oklch(0.45 0.01 260)' }}>
                    لو ما اخترت جهاز، التطبيق يظهر لكل الأجهزة
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-medium mb-1 block" style={labelStyle}>ملاحظات شخصية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none focus:ring-1 focus:ring-teal/30"
                  style={inputStyle}
                  rows={2}
                  placeholder="مثال: لازم أفعل إعداد معين بعد التثبيت..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                  color: 'oklch(0.15 0.015 260)',
                  boxShadow: '0 0 20px oklch(0.75 0.15 180 / 20%)',
                }}
              >
                {editApp ? 'حفظ التعديلات' : 'إضافة التطبيق'}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
