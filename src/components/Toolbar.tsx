import React from 'react';
import { 
  PlusCircle, 
  Save, 
  Trash2, 
  Printer, 
  FileDown, 
  Users, 
  Upload, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  FileText,
  Eye,
  SlidersHorizontal,
  HardDriveDownload
} from 'lucide-react';

interface ToolbarProps {
  onNew: () => void;
  onSave: () => void;
  onClear: () => void;
  onPrint: () => void;
  onPdf: () => void;
  onOpenList: () => void;
  onPreview: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: () => void;
  onDownloadStandalone: () => void;
  savedCount: number;
  currentStudentName: string;
  isModified: boolean;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  showAssistant: boolean;
  setShowAssistant: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onNew,
  onSave,
  onClear,
  onPrint,
  onPdf,
  onOpenList,
  onPreview,
  onExportJson,
  onExportCsv,
  onImportJson,
  onDownloadStandalone,
  savedCount,
  currentStudentName,
  isModified,
  zoom,
  setZoom,
  showAssistant,
  setShowAssistant
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg print:hidden">
      {/* Top Bar Contract: Zone 1 (Brand), Zone 2 (Primary Actions), Zone 3 (Utility / Status) */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Active Student Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
                نظام استمارة EMIS المدرسية
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                إلكتروني متكامل
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>الطالب الحالي: <strong className="text-amber-300 font-semibold">{currentStudentName}</strong></span>
              {isModified && (
                <span className="text-amber-400 font-medium">(تعديلات غير محفوظة)</span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Functional Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-xs font-semibold rounded-md border border-slate-700 transition-colors shadow-sm"
            title="إنشاء استمارة لطالب جديد"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>استمارة جديدة</span>
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-md shadow transition-colors"
            title="حفظ بيانات الطالب في السجل المحلي"
          >
            <Save className="w-4 h-4" />
            <span>حفظ البيانات</span>
          </button>

          <button
            onClick={onOpenList}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-xs font-semibold rounded-md border border-slate-700 transition-colors shadow-sm"
            title="فتح سجلات الطلاب المحفوظة والبحث"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>سجلات الطلاب</span>
            <span className="bg-sky-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
              {savedCount}
            </span>
          </button>

          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition-colors"
            title="معاينة الاستمارة المكتملة قبل الطباعة"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>معاينة</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-md shadow transition-colors"
            title="طباعة الاستمارة على ورق A4 بجودة أصلية"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الاستمارة</span>
          </button>

          <button
            onClick={onPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-md shadow transition-colors"
            title="تحميل ملف PDF مستقل باسم الطالب"
          >
            <FileDown className="w-4 h-4" />
            <span>تصدير PDF</span>
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-rose-900/60 active:bg-rose-800 text-slate-300 hover:text-rose-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
            title="مسح حقول الاستمارة الحالية بعد التأكيد"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>مسح الحقول</span>
          </button>
        </div>

        {/* View / Assistant / Backup Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/90 rounded-md border border-slate-700 px-1 py-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-slate-200 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded text-[10px] font-medium"
              title="إعادة ضبط الحجم 100%"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Assistant Toggle */}
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              showAssistant 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="مساعد التعبئة وتدقيق الحقول"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مساعد الإدخال</span>
          </button>

          {/* Import / Export dropdown or buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onImportJson}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-700 transition-colors"
              title="استيراد نسخة احتياطية (JSON)"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onExportJson}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-700 transition-colors"
              title="تصدير نسخة احتياطية لكافة الطلاب (JSON)"
            >
              <Download className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onExportCsv}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md border border-slate-700 transition-colors"
              title="تصدير جدول الطلاب إلى Excel (CSV)"
            >
              <FileText className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={onDownloadStandalone}
              className="flex items-center gap-1 px-2 py-1.5 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-700/50 rounded-md text-xs font-semibold transition-colors"
              title="تحميل ملف HTML مستقل يعمل بدون إنترنت على أي جهاز"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">ملف مستقل</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
