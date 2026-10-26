import React, { useEffect, useState } from 'react';
import { StudentRecord } from '../data/emisData';
import { renderStudentCanvas } from '../utils/emisStorage';
import { X, Printer, FileDown, Loader2 } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRecord;
  onPrint: () => void;
  onPdf: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  student,
  onPrint,
  onPdf
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      return;
    }

    let isMounted = true;
    setLoading(true);

    renderStudentCanvas(student, '/assets/emis_form_bg.jpg', 2)
      .then(canvas => {
        canvas.toBlob(blob => {
          if (!isMounted || !blob) return;
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setLoading(false);
        }, 'image/jpeg', 0.95);
      })
      .catch(err => {
        console.error('Failed to generate preview', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen, student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div>
            <h3 className="font-bold text-sm">معاينة الاستمارة قبل الطباعة</h3>
            <p className="text-xs text-slate-500">
              طالب: <strong className="text-slate-700 dark:text-slate-200">{student.studentName}</strong> | مقاس A4 مطابق للنموذج الأصلي
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-md shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الآن</span>
            </button>

            <button
              onClick={onPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-md shadow transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas / Image Preview Viewport */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-200 dark:bg-slate-950 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <span className="text-xs font-semibold">جاري تجهيز الاستمارة بدقة عالية...</span>
            </div>
          ) : previewUrl ? (
            <div className="shadow-2xl border border-slate-300 dark:border-slate-800 rounded bg-white overflow-hidden max-w-[620px] w-full">
              <img 
                src={previewUrl} 
                alt="معاينة الاستمارة" 
                className="w-full h-auto block"
              />
            </div>
          ) : (
            <div className="text-xs text-rose-500">
              تعذر تجهيز المعاينة، يرجى المحاولة مرة أخرى.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            تأكد في نافذة الطباعة من تفعيل خيار: «الرسومات في الخلفية / Background graphics» لطباعة الخلفية الأصلية كاملة.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded font-semibold text-xs"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
};
