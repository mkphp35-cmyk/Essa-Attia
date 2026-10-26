import React, { useState } from 'react';
import { TEXT_FIELDS, CHECKBOXES, HEADER_CHECKBOXES, StudentRecord } from '../data/emisData';
import { 
  User, 
  Home, 
  CreditCard, 
  GraduationCap, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

interface SideAssistantProps {
  student: StudentRecord;
  onChangeField: (key: string, value: string | boolean) => void;
  onClose: () => void;
}

export const SideAssistant: React.FC<SideAssistantProps> = ({
  student,
  onChangeField,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'residence' | 'identity' | 'academic' | 'address'>('personal');

  // Calculate completion percentage of required fields
  const requiredFields = TEXT_FIELDS.filter(f => f.required);
  const filledRequiredCount = requiredFields.filter(f => {
    const v = student.fields[f.key];
    return typeof v === 'string' && v.trim().length > 0;
  }).length;
  const completionPercentage = Math.round((filledRequiredCount / requiredFields.length) * 100);

  const tabs = [
    { id: 'personal' as const, label: 'البيانات الشخصية', icon: User },
    { id: 'residence' as const, label: 'وثيقة السكن', icon: Home },
    { id: 'identity' as const, label: 'وثيقة التعريف', icon: CreditCard },
    { id: 'academic' as const, label: 'البيانات الدراسية', icon: GraduationCap },
    { id: 'address' as const, label: 'العنوان الحالي', icon: MapPin },
  ];

  const currentFields = TEXT_FIELDS.filter(f => f.category === activeTab);

  return (
    <aside 
      className="w-full lg:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-lg print:hidden z-30"
      dir="rtl"
    >
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
        <div>
          <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>مساعد الإدخال الإداري</span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {completionPercentage}% مكتمل
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          title="إخفاء المساعد"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 gap-1 scrollbar-none">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Specific Section Options / Checkboxes */}
        {activeTab === 'personal' && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              الجنس:
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!student.fields.g_m}
                  onChange={e => {
                    if (e.target.checked) onChangeField('g_f', false);
                    onChangeField('g_m', e.target.checked);
                  }}
                  className="rounded text-black"
                />
                <span>ذكر</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!student.fields.g_f}
                  onChange={e => {
                    if (e.target.checked) onChangeField('g_m', false);
                    onChangeField('g_f', e.target.checked);
                  }}
                  className="rounded text-black"
                />
                <span>أنثى</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'residence' && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              نوع وثيقة السكن:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {HEADER_CHECKBOXES.filter(c => c.group === 'st').map(item => (
                <label key={item.key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!student.fields[item.key]}
                    onChange={e => {
                      if (e.target.checked) {
                        HEADER_CHECKBOXES.filter(c => c.group === 'st').forEach(x => {
                          if (x.key !== item.key) onChangeField(x.key, false);
                        });
                      }
                      onChangeField(item.key, e.target.checked);
                    }}
                    className="rounded text-black"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
              نوع وثيقة التعريف الرسمية:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {HEADER_CHECKBOXES.filter(c => c.group === 'ft').map(item => (
                <label key={item.key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!student.fields[item.key]}
                    onChange={e => {
                      if (e.target.checked) {
                        HEADER_CHECKBOXES.filter(c => c.group === 'ft').forEach(x => {
                          if (x.key !== item.key) onChangeField(x.key, false);
                        });
                      }
                      onChangeField(item.key, e.target.checked);
                    }}
                    className="rounded text-black"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Regular Field Inputs */}
        {currentFields.map(field => {
          const val = (student.fields[field.key] as string) || '';
          const isFilled = val.trim().length > 0;
          return (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>{field.label}</span>
                  {field.required && (
                    <span className="text-rose-500 font-bold" title="حقل إلزامي">*</span>
                  )}
                </label>
                {field.required && (
                  isFilled ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  )
                )}
              </div>

              <input
                type="text"
                value={val}
                onChange={e => onChangeField(field.key, e.target.value)}
                placeholder={`أدخل ${field.label}`}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors text-slate-900 dark:text-slate-100"
              />
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>مزامنة مباشرة مع الاستمارة</span>
        <button
          onClick={() => {
            const nextIdx = (tabs.findIndex(t => t.id === activeTab) + 1) % tabs.length;
            setActiveTab(tabs[nextIdx].id);
          }}
          className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
        >
          القسم التالي ←
        </button>
      </div>
    </aside>
  );
};
