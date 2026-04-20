/*
 * LIGHT MODE - Vibrant colorful Settings dialog
 * White bg, clear borders, orange/green/blue/violet accents
 * "فرز حسب" SmartGroups + Categories management
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Filter, Tag, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GROUP_EMOJIS = ['📱', '📲', '💻', '🖥️', '⌚', '🎮', '⭐', '💎', '🔥', '📌', '🎯', '🛠️'];
const CATEGORY_COLORS = ['#2DD4BF', '#F59E0B', '#EF4444', '#A855F7', '#3B82F6', '#10B981', '#EC4899', '#F97316', '#6366F1', '#84CC16'];

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const {
    apps, smartGroups, categories,
    addSmartGroup, updateSmartGroup, deleteSmartGroup, setGroupApps,
    addCategory, updateCategory, deleteCategory,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'groups' | 'categories'>('groups');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('📱');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('');
  const [selectingForGroupId, setSelectingForGroupId] = useState<string | null>(null);
  const [tempSelectedApps, setTempSelectedApps] = useState<string[]>([]);
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2DD4BF');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');

  const inputCls = "flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

  function handleAddGroup() {
    if (!newGroupName.trim()) { toast.error('أدخل اسم المجموعة'); return; }
    addSmartGroup(newGroupName.trim(), newGroupIcon);
    setNewGroupName('');
    setNewGroupIcon('📱');
    toast.success('تم إضافة المجموعة');
  }

  function handleSaveGroup(id: string) {
    if (!editGroupName.trim()) return;
    updateSmartGroup(id, editGroupName.trim(), editGroupIcon);
    setEditingGroupId(null);
    toast.success('تم تحديث المجموعة');
  }

  function openAppSelector(groupId: string) {
    const group = smartGroups.find(g => g.id === groupId);
    setSelectingForGroupId(groupId);
    setTempSelectedApps(group?.appIds || []);
    setAppSearchQuery('');
  }

  function toggleAppInSelection(appId: string) {
    setTempSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  }

  function saveAppSelection() {
    if (selectingForGroupId) {
      setGroupApps(selectingForGroupId, tempSelectedApps);
      toast.success('تم حفظ التطبيقات');
      setSelectingForGroupId(null);
      setTempSelectedApps([]);
    }
  }

  function handleAddCategory() {
    if (!newCatName.trim()) { toast.error('أدخل اسم التصنيف'); return; }
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    toast.success('تم إضافة التصنيف');
  }

  function handleSaveCategory(id: string) {
    if (!editCatName.trim()) return;
    updateCategory(id, editCatName.trim(), editCatColor);
    setEditingCatId(null);
    toast.success('تم تحديث التصنيف');
  }

  const filteredApps = appSearchQuery
    ? apps.filter(a => a.name.toLowerCase().includes(appSearchQuery.toLowerCase()))
    : apps;

  const selectingGroup = smartGroups.find(g => g.id === selectingForGroupId);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) { setSelectingForGroupId(null); setEditingGroupId(null); setEditingCatId(null); }
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-md max-h-[85vh] max-h-[85dvh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900" style={{
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {selectingForGroupId ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectingForGroupId(null)}
                  className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-all"
                >
                  <ArrowRight size={18} />
                </button>
                <span>اختر تطبيقات لـ {selectingGroup?.icon} {selectingGroup?.name}</span>
              </div>
            ) : 'الإعدادات'}
          </DialogTitle>
        </DialogHeader>

        {/* App Selection View */}
        {selectingForGroupId ? (
          <div className="space-y-3 mt-1">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                placeholder="ابحث عن تطبيق..."
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Selection info */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-gray-500">
                تم اختيار <span className="text-orange-600 font-bold">{tempSelectedApps.length}</span> من {apps.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTempSelectedApps(apps.map(a => a.id))}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-all"
                >
                  اختر الكل
                </button>
                <button
                  onClick={() => setTempSelectedApps([])}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-medium hover:bg-gray-200 transition-all"
                >
                  إلغاء الكل
                </button>
              </div>
            </div>

            {/* App list */}
            <div className="space-y-1.5 max-h-[50vh] max-h-[50dvh] overflow-y-auto">
              {filteredApps.map(app => {
                const isSelected = tempSelectedApps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleAppInSelection(app.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-right transition-all ${
                      isSelected
                        ? 'bg-orange-50 border-2 border-orange-200'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-orange-500 shadow-sm' : 'border-2 border-gray-300 bg-white'
                    }`}>
                      {isSelected && <Check size={13} className="text-white" />}
                    </div>

                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-100"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-orange-50 text-orange-600 border border-orange-200"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium truncate block ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {app.name}
                      </span>
                      {app.developer && (
                        <span className="text-[11px] block truncate text-gray-400">
                          {app.developer}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredApps.length === 0 && (
                <p className="text-xs text-center py-6 text-gray-400">
                  {appSearchQuery ? 'لا توجد نتائج' : 'لا توجد تطبيقات. أضف تطبيقات أولاً.'}
                </p>
              )}
            </div>

            {/* Save */}
            <button
              onClick={saveAppSelection}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
              }}
            >
              حفظ الاختيار ({tempSelectedApps.length} تطبيق)
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1.5 rounded-xl bg-gray-100">
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'groups'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Filter size={15} /> فرز حسب
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'categories'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Tag size={15} /> التصنيفات
              </button>
            </div>

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="space-y-3 mt-1">
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">اسم المجموعة</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                        className={inputCls}
                        placeholder="مثال: جوال بيكسل، تطبيقات مهمة..."
                      />
                      <button
                        onClick={handleAddGroup}
                        className="p-2.5 rounded-xl shrink-0 transition-all active:scale-95 text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">أيقونة</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {GROUP_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewGroupIcon(emoji)}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-lg flex items-center justify-center transition-all ${
                            newGroupIcon === emoji
                              ? 'bg-orange-50 border-2 border-orange-300 shadow-sm'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Groups list */}
                <div className="space-y-2">
                  {smartGroups.map(group => (
                    <div key={group.id} className="rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-200">
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <select
                            value={editGroupIcon}
                            onChange={(e) => setEditGroupIcon(e.target.value)}
                            className="w-10 bg-transparent text-center text-base outline-none"
                          >
                            {GROUP_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                          <input
                            type="text"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                          />
                          <button onClick={() => handleSaveGroup(group.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                          <button onClick={() => setEditingGroupId(null)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <span className="text-lg">{group.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-800 block">{group.name}</span>
                            <span className="text-[11px] text-gray-400">{group.appIds.length} تطبيق</span>
                          </div>

                          <button
                            onClick={() => openAppSelector(group.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all"
                          >
                            اختر التطبيقات
                            <ChevronRight size={12} />
                          </button>

                          <button
                            onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name); setEditGroupIcon(group.icon); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => { if (confirm('حذف هذه المجموعة؟')) deleteSmartGroup(group.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {smartGroups.length === 0 && (
                    <p className="text-xs text-center py-5 text-gray-400">
                      لم تضف أي مجموعة بعد. أضف مجموعات مثل "جوال بيكسل" أو "تطبيقات مهمة" واختر التطبيقات لكل مجموعة.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-3 mt-1">
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">اسم التصنيف</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        className={inputCls}
                        placeholder="مثال: ألعاب"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="p-2.5 rounded-xl shrink-0 transition-all active:scale-95 text-white shadow-md"
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">اللون</label>
                    <div className="flex gap-2 flex-wrap">
                      {CATEGORY_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCatColor(color)}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all shadow-sm"
                          style={{
                            background: color,
                            border: newCatColor === color ? '3px solid #1f2937' : '2px solid #e5e7eb',
                            boxShadow: newCatColor === color ? `0 0 12px ${color}50` : 'none',
                            transform: newCatColor === color ? 'scale(1.15)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200">
                      {editingCatId === cat.id ? (
                        <>
                          <div className="flex gap-1 flex-wrap">
                            {CATEGORY_COLORS.map(color => (
                              <button
                                key={color}
                                onClick={() => setEditCatColor(color)}
                                className="w-5 h-5 rounded-full"
                                style={{
                                  background: color,
                                  border: editCatColor === color ? '2px solid #1f2937' : '1px solid #e5e7eb',
                                }}
                              />
                            ))}
                          </div>
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                          />
                          <button onClick={() => handleSaveCategory(cat.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Check size={16} /></button>
                          <button onClick={() => setEditingCatId(null)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ background: cat.color }} />
                          <span className="flex-1 text-sm font-semibold text-gray-800">{cat.name}</span>
                          <button
                            onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); setEditCatColor(cat.color); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => { if (confirm('حذف هذا التصنيف؟')) deleteCategory(cat.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
