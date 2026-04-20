/*
 * Design: Glass Vault / Frosted Modern - Vibrant refresh
 * Settings dialog: "فرز حسب" (SmartGroups) + Categories management
 * Users create custom groups (device, use-case, etc.) and pick apps for each
 * MOBILE-FIRST: compact inputs, comfortable touch targets
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

  // Group management state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupIcon, setNewGroupIcon] = useState('📱');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('');

  // App selection state for a group
  const [selectingForGroupId, setSelectingForGroupId] = useState<string | null>(null);
  const [tempSelectedApps, setTempSelectedApps] = useState<string[]>([]);
  const [appSearchQuery, setAppSearchQuery] = useState('');

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2DD4BF');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');

  const inputStyle = {
    background: 'oklch(0.20 0.02 260 / 85%)',
    border: '1px solid oklch(0.45 0.03 260 / 45%)',
    color: 'oklch(0.95 0.005 260)',
  };

  // --- Group handlers ---
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

  // --- Category handlers ---
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

  // Filter apps by search
  const filteredApps = appSearchQuery
    ? apps.filter(a => a.name.toLowerCase().includes(appSearchQuery.toLowerCase()))
    : apps;

  // Get the group being selected for
  const selectingGroup = smartGroups.find(g => g.id === selectingForGroupId);

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) { setSelectingForGroupId(null); setEditingGroupId(null); setEditingCatId(null); }
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-md max-h-[85vh] max-h-[85dvh] overflow-y-auto" style={{
        background: 'oklch(0.16 0.02 260)',
        border: '1px solid oklch(0.35 0.015 260 / 30%)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold" style={{
            color: 'oklch(0.95 0.005 260)',
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            {selectingForGroupId ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectingForGroupId(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                  style={{ color: 'oklch(0.78 0.16 170)' }}
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
            <div className="glow-input flex items-center gap-2 rounded-xl px-3 py-2.5">
              <Search size={16} style={{ color: 'oklch(0.50 0.02 260)' }} />
              <input
                type="text"
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                placeholder="ابحث عن تطبيق..."
                className="bg-transparent border-none outline-none w-full text-sm"
                style={{ color: 'oklch(0.95 0.005 260)' }}
              />
            </div>

            {/* Selection info */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs" style={{ color: 'oklch(0.60 0.02 200)' }}>
                تم اختيار <span style={{ color: 'oklch(0.82 0.16 170)', fontWeight: 600 }}>{tempSelectedApps.length}</span> من {apps.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTempSelectedApps(apps.map(a => a.id))}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ color: 'oklch(0.78 0.16 170)', background: 'oklch(0.78 0.16 170 / 10%)' }}
                >
                  اختر الكل
                </button>
                <button
                  onClick={() => setTempSelectedApps([])}
                  className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                  style={{ color: 'oklch(0.65 0.01 260)', background: 'oklch(0.25 0.015 260 / 50%)' }}
                >
                  إلغاء الكل
                </button>
              </div>
            </div>

            {/* App list */}
            <div className="space-y-1 max-h-[50vh] max-h-[50dvh] overflow-y-auto">
              {filteredApps.map(app => {
                const isSelected = tempSelectedApps.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => toggleAppInSelection(app.id)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-right transition-all"
                    style={isSelected ? {
                      background: 'oklch(0.78 0.16 170 / 12%)',
                      border: '1px solid oklch(0.78 0.16 170 / 25%)',
                    } : {
                      background: 'oklch(0.20 0.015 260 / 40%)',
                      border: '1px solid oklch(0.30 0.015 260 / 15%)',
                    }}
                  >
                    {/* Checkbox */}
                    <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all"
                      style={isSelected ? {
                        background: 'linear-gradient(135deg, oklch(0.78 0.16 170), oklch(0.60 0.16 170))',
                      } : {
                        border: '2px solid oklch(0.45 0.02 260 / 50%)',
                        background: 'oklch(0.18 0.015 260 / 50%)',
                      }}
                    >
                      {isSelected && <Check size={13} style={{ color: 'oklch(0.15 0.015 260)' }} />}
                    </div>

                    {/* App icon */}
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"
                        style={{ border: '1px solid oklch(0.35 0.015 260 / 20%)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{
                          background: 'oklch(0.25 0.02 260)',
                          color: 'oklch(0.78 0.16 170)',
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* App name */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block" style={{
                        color: isSelected ? 'oklch(0.95 0.005 260)' : 'oklch(0.80 0.005 260)',
                      }}>
                        {app.name}
                      </span>
                      {app.developer && (
                        <span className="text-[11px] block truncate" style={{ color: 'oklch(0.50 0.01 260)' }}>
                          {app.developer}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredApps.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'oklch(0.45 0.01 260)' }}>
                  {appSearchQuery ? 'لا توجد نتائج' : 'لم تضف أي تطبيق بعد'}
                </p>
              )}
            </div>

            {/* Save button */}
            <button
              onClick={saveAppSelection}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.78 0.16 170), oklch(0.60 0.16 170))',
                color: 'oklch(0.15 0.015 260)',
                boxShadow: '0 0 20px oklch(0.78 0.16 170 / 20%)',
              }}
            >
              حفظ الاختيار ({tempSelectedApps.length} تطبيق)
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 sm:p-1.5 rounded-xl" style={{ background: 'oklch(0.18 0.015 260)' }}>
              <button
                onClick={() => setActiveTab('groups')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all"
                style={activeTab === 'groups' ? {
                  background: 'oklch(0.78 0.16 170 / 15%)',
                  color: 'oklch(0.88 0.13 170)',
                } : { color: 'oklch(0.60 0.01 260)' }}
              >
                <Filter size={15} /> فرز حسب
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all"
                style={activeTab === 'categories' ? {
                  background: 'oklch(0.78 0.16 170 / 15%)',
                  color: 'oklch(0.88 0.13 170)',
                } : { color: 'oklch(0.60 0.01 260)' }}
              >
                <Tag size={15} /> التصنيفات
              </button>
            </div>

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="space-y-3 mt-1">
                {/* Add new group */}
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.60 0.02 200)' }}>
                      اسم المجموعة
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                        placeholder="مثال: جوال بيكسل، تطبيقات مهمة..."
                      />
                      <button
                        onClick={handleAddGroup}
                        className="p-2.5 rounded-xl shrink-0 transition-all active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, oklch(0.78 0.16 170), oklch(0.60 0.16 170))',
                          color: 'oklch(0.15 0.015 260)',
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.60 0.02 200)' }}>أيقونة</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {GROUP_EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewGroupIcon(emoji)}
                          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-base sm:text-lg flex items-center justify-center transition-all"
                          style={{
                            background: newGroupIcon === emoji ? 'oklch(0.78 0.16 170 / 15%)' : 'oklch(0.20 0.015 260)',
                            border: `1px solid ${newGroupIcon === emoji ? 'oklch(0.78 0.16 170 / 30%)' : 'oklch(0.30 0.015 260 / 30%)'}`,
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Groups list */}
                <div className="space-y-1.5">
                  {smartGroups.map(group => (
                    <div key={group.id} className="rounded-xl overflow-hidden" style={{
                      background: 'oklch(0.20 0.015 260 / 50%)',
                      border: '1px solid oklch(0.30 0.015 260 / 20%)',
                    }}>
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
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: 'oklch(0.90 0.005 260)' }}
                          />
                          <button onClick={() => handleSaveGroup(group.id)} className="p-2 text-green-400"><Check size={16} /></button>
                          <button onClick={() => setEditingGroupId(null)} className="p-2 text-red-400"><X size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <span className="text-lg">{group.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block" style={{ color: 'oklch(0.88 0.005 260)' }}>
                              {group.name}
                            </span>
                            <span className="text-[11px]" style={{ color: 'oklch(0.50 0.02 200)' }}>
                              {group.appIds.length} تطبيق
                            </span>
                          </div>

                          {/* Select apps button */}
                          <button
                            onClick={() => openAppSelector(group.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                            style={{
                              background: 'oklch(0.78 0.16 170 / 10%)',
                              color: 'oklch(0.82 0.14 170)',
                              border: '1px solid oklch(0.78 0.16 170 / 20%)',
                            }}
                          >
                            اختر التطبيقات
                            <ChevronRight size={12} />
                          </button>

                          <button
                            onClick={() => { setEditingGroupId(group.id); setEditGroupName(group.name); setEditGroupIcon(group.icon); }}
                            className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                            style={{ color: 'oklch(0.70 0.01 260)' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => { if (confirm('حذف هذه المجموعة؟')) deleteSmartGroup(group.id); }}
                            className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                            style={{ color: 'oklch(0.60 0.18 25)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {smartGroups.length === 0 && (
                    <p className="text-xs text-center py-5" style={{ color: 'oklch(0.45 0.01 260)' }}>
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
                    <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.60 0.02 200)' }}>اسم التصنيف</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={inputStyle}
                        placeholder="مثال: ألعاب"
                      />
                      <button
                        onClick={handleAddCategory}
                        className="p-2.5 rounded-xl shrink-0 transition-all active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, oklch(0.78 0.16 170), oklch(0.60 0.16 170))',
                          color: 'oklch(0.15 0.015 260)',
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.60 0.02 200)' }}>اللون</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {CATEGORY_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCatColor(color)}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all"
                          style={{
                            background: color,
                            border: newCatColor === color ? '3px solid white' : '2px solid transparent',
                            boxShadow: newCatColor === color ? `0 0 10px ${color}60` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{
                      background: 'oklch(0.20 0.015 260 / 50%)',
                      border: '1px solid oklch(0.30 0.015 260 / 20%)',
                    }}>
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
                                  border: editCatColor === color ? '2px solid white' : '1px solid transparent',
                                }}
                              />
                            ))}
                          </div>
                          <input
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm"
                            style={{ color: 'oklch(0.90 0.005 260)' }}
                          />
                          <button onClick={() => handleSaveCategory(cat.id)} className="p-2 text-green-400"><Check size={16} /></button>
                          <button onClick={() => setEditingCatId(null)} className="p-2 text-red-400"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 rounded-full shrink-0" style={{ background: cat.color }} />
                          <span className="flex-1 text-sm" style={{ color: 'oklch(0.85 0.005 260)' }}>{cat.name}</span>
                          <button
                            onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); setEditCatColor(cat.color); }}
                            className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                            style={{ color: 'oklch(0.70 0.01 260)' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => { if (confirm('حذف هذا التصنيف؟')) deleteCategory(cat.id); }}
                            className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                            style={{ color: 'oklch(0.60 0.18 25)' }}
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
