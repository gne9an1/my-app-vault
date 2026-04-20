/*
 * LIGHT MODE - Vibrant colorful Add/Edit dialog
 * White background, clear borders, orange primary, colorful accents
 * All inputs have clear visible borders and labels
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import type { AppItem, AppSource, Priority } from '@/lib/types';
import { fetchAppData, detectSource } from '@/lib/fetcher';
import { useState, useEffect } from 'react';
import { Loader2, Link2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editApp?: AppItem | null;
}

export default function AddAppDialog({ open, onOpenChange, editApp }: AddAppDialogProps) {
  const { addApp, updateApp, categories, smartGroups } = useAppContext();

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
    setUrl(''); setName(''); setDescription(''); setIconUrl('');
    setVersion(''); setDownloadPageUrl(''); setSource('manual');
    setCategory('other'); setPriority('medium'); setSelectedDevices([]);
    setNotes(''); setDeveloper(''); setFetchError(''); setIsManualMode(false);
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

  // Light mode input styles - clear and visible
  const inputCls = "w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-sm outline-none bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";
  const selectCls = "w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-sm outline-none bg-white border-2 border-gray-200 text-gray-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] max-h-[85dvh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900" style={{
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {editApp ? 'تعديل التطبيق' : 'إضافة تطبيق جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 sm:space-y-4 mt-2">
          {/* URL Input */}
          {!editApp && (
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
                رابط التطبيق (GitHub / Google Play / F-Droid)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3.5 py-2.5 sm:py-3 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                  <Link2 size={16} className="shrink-0 text-gray-400" />
                  <input
                    type="url"
                    placeholder="الصق الرابط هنا..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                    className="bg-transparent border-none outline-none w-full text-sm text-gray-900 placeholder-gray-400"
                    dir="ltr"
                  />
                </div>
                <button
                  onClick={handleFetch}
                  disabled={isFetching || !url.trim()}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all disabled:opacity-40 shrink-0 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    boxShadow: '0 2px 10px rgba(34,197,94,0.25)',
                  }}
                >
                  {isFetching ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  جلب
                </button>
              </div>
              {fetchError && (
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-red-500">
                  <AlertCircle size={14} />
                  {fetchError} - يمكنك الإضافة يدوياً
                </div>
              )}
              <button
                onClick={() => { setIsManualMode(true); setSource('manual'); }}
                className="text-xs sm:text-sm mt-2 text-blue-600 font-medium hover:underline transition-all"
              >
                أو أضف يدوياً بدون رابط
              </button>
            </div>
          )}

          {/* Form */}
          {(isManualMode || editApp) && (
            <>
              {/* Icon + Name */}
              <div className="flex gap-3 items-start">
                <div className="shrink-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-gray-100 shadow-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold bg-orange-50 border-2 border-orange-200 text-orange-600"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">اسم التطبيق *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className={inputCls} placeholder="مثال: Magisk" />
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">رابط الأيقونة</label>
                    <input type="url" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)}
                      className={inputCls + " text-xs"} placeholder="https://..." dir="ltr" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">الوصف</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className={inputCls + " resize-none"} rows={2} placeholder="وصف مختصر للتطبيق..." />
              </div>

              {/* Download URL */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">رابط صفحة التحميل</label>
                <input type="url" value={downloadPageUrl} onChange={(e) => setDownloadPageUrl(e.target.value)}
                  className={inputCls + " text-xs"} placeholder="https://..." dir="ltr" />
              </div>

              {/* Developer */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">المطور</label>
                <input type="text" value={developer} onChange={(e) => setDeveloper(e.target.value)}
                  className={inputCls} placeholder="اسم المطور" />
              </div>

              {/* Version + Source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">الإصدار</label>
                  <input type="text" value={version} onChange={(e) => setVersion(e.target.value)}
                    className={inputCls} placeholder="1.0.0" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">المصدر</label>
                  <select value={source} onChange={(e) => setSource(e.target.value as AppSource)} className={selectCls}>
                    <option value="github">GitHub</option>
                    <option value="playstore">Google Play</option>
                    <option value="fdroid">F-Droid</option>
                    <option value="manual">يدوي</option>
                  </select>
                </div>
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">التصنيف</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">الأولوية</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={selectCls}>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              {/* Smart Groups */}
              {smartGroups.length > 0 && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">فرز حسب (اختياري)</label>
                  <div className="flex flex-wrap gap-2">
                    {smartGroups.map(group => (
                      <button
                        key={group.id}
                        onClick={() => toggleDevice(group.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                          selectedDevices.includes(group.id)
                            ? 'bg-violet-50 text-violet-700 border-2 border-violet-300 shadow-sm'
                            : 'bg-gray-50 text-gray-500 border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {group.icon} {group.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] sm:text-xs mt-1.5 text-gray-400">
                    يمكنك أيضاً إدارة المجموعات من الإعدادات &gt; فرز حسب
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">ملاحظات شخصية</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  className={inputCls + " resize-none"} rows={2}
                  placeholder="مثال: لازم أفعل إعداد معين بعد التثبيت..." />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold text-white transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
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
