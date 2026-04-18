/*
 * Design: Glass Vault / Frosted Modern
 * Settings dialog for managing devices and categories
 * MOBILE-FIRST: compact inputs, comfortable touch targets
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppContext } from '@/contexts/AppContext';
import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Smartphone, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEVICE_EMOJIS = ['📱', '📲', '💻', '🖥️', '⌚', '📟', '🎮'];
const CATEGORY_COLORS = ['#2DD4BF', '#F59E0B', '#EF4444', '#A855F7', '#3B82F6', '#10B981', '#EC4899', '#F97316', '#6366F1', '#84CC16'];

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { devices, categories, addDevice, updateDevice, deleteDevice, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [activeTab, setActiveTab] = useState<'devices' | 'categories'>('devices');

  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIcon, setNewDeviceIcon] = useState('📱');
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceIcon, setEditDeviceIcon] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2DD4BF');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatColor, setEditCatColor] = useState('');

  const inputStyle = {
    background: 'oklch(0.18 0.015 260 / 70%)',
    border: '1px solid oklch(0.35 0.015 260 / 30%)',
    color: 'oklch(0.92 0.005 260)',
  };

  function handleAddDevice() {
    if (!newDeviceName.trim()) { toast.error('أدخل اسم الجهاز'); return; }
    addDevice(newDeviceName.trim(), newDeviceIcon);
    setNewDeviceName('');
    setNewDeviceIcon('📱');
    toast.success('تم إضافة الجهاز');
  }

  function handleSaveDevice(id: string) {
    if (!editDeviceName.trim()) return;
    updateDevice(id, editDeviceName.trim(), editDeviceIcon);
    setEditingDeviceId(null);
    toast.success('تم تحديث الجهاز');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] max-h-[85dvh] overflow-y-auto" style={{
        background: 'oklch(0.16 0.02 260)',
        border: '1px solid oklch(0.35 0.015 260 / 30%)',
      }}>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold" style={{
            color: 'oklch(0.95 0.005 260)',
            fontFamily: "'Space Grotesk', 'IBM Plex Sans Arabic', sans-serif",
          }}>
            الإعدادات
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 p-1 sm:p-1.5 rounded-xl" style={{ background: 'oklch(0.18 0.015 260)' }}>
          <button
            onClick={() => setActiveTab('devices')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={activeTab === 'devices' ? {
              background: 'oklch(0.75 0.15 180 / 15%)',
              color: 'oklch(0.85 0.12 180)',
            } : { color: 'oklch(0.60 0.01 260)' }}
          >
            <Smartphone size={15} /> الأجهزة
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={activeTab === 'categories' ? {
              background: 'oklch(0.75 0.15 180 / 15%)',
              color: 'oklch(0.85 0.12 180)',
            } : { color: 'oklch(0.60 0.01 260)' }}
          >
            <Tag size={15} /> التصنيفات
          </button>
        </div>

        {activeTab === 'devices' && (
          <div className="space-y-3 mt-1">
            <div className="space-y-2.5">
              <div>
                <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.55 0.01 260)' }}>اسم الجهاز</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDevice()}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    placeholder="مثال: Pixel 8"
                  />
                  <button
                    onClick={handleAddDevice}
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                      color: 'oklch(0.15 0.015 260)',
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.55 0.01 260)' }}>أيقونة</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DEVICE_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewDeviceIcon(emoji)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-base sm:text-lg flex items-center justify-center transition-all ${
                        newDeviceIcon === emoji ? 'ring-1 ring-teal' : ''
                      }`}
                      style={{
                        background: newDeviceIcon === emoji ? 'oklch(0.75 0.15 180 / 15%)' : 'oklch(0.20 0.015 260)',
                        border: `1px solid ${newDeviceIcon === emoji ? 'oklch(0.75 0.15 180 / 30%)' : 'oklch(0.30 0.015 260 / 30%)'}`,
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              {devices.map(dev => (
                <div key={dev.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{
                  background: 'oklch(0.20 0.015 260 / 50%)',
                  border: '1px solid oklch(0.30 0.015 260 / 20%)',
                }}>
                  {editingDeviceId === dev.id ? (
                    <>
                      <select
                        value={editDeviceIcon}
                        onChange={(e) => setEditDeviceIcon(e.target.value)}
                        className="w-10 bg-transparent text-center text-base outline-none"
                      >
                        {DEVICE_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <input
                        type="text"
                        value={editDeviceName}
                        onChange={(e) => setEditDeviceName(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: 'oklch(0.90 0.005 260)' }}
                      />
                      <button onClick={() => handleSaveDevice(dev.id)} className="p-2 text-green-400"><Check size={16} /></button>
                      <button onClick={() => setEditingDeviceId(null)} className="p-2 text-red-400"><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">{dev.icon}</span>
                      <span className="flex-1 text-sm" style={{ color: 'oklch(0.85 0.005 260)' }}>{dev.name}</span>
                      <button
                        onClick={() => { setEditingDeviceId(dev.id); setEditDeviceName(dev.name); setEditDeviceIcon(dev.icon); }}
                        className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                        style={{ color: 'oklch(0.70 0.01 260)' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm('حذف هذا الجهاز؟')) deleteDevice(dev.id); }}
                        className="p-2 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                        style={{ color: 'oklch(0.60 0.18 25)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {devices.length === 0 && (
                <p className="text-xs text-center py-5" style={{ color: 'oklch(0.45 0.01 260)' }}>
                  لم تضف أي جهاز بعد. أضف أجهزتك عشان تقدر تصنف التطبيقات لكل جهاز.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-3 mt-1">
            <div className="space-y-2.5">
              <div>
                <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.55 0.01 260)' }}>اسم التصنيف</label>
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
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, oklch(0.75 0.15 180), oklch(0.60 0.15 180))',
                      color: 'oklch(0.15 0.015 260)',
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm mb-1 block" style={{ color: 'oklch(0.55 0.01 260)' }}>اللون</label>
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
      </DialogContent>
    </Dialog>
  );
}
