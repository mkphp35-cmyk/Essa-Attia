import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getSavedStudents, 
  saveStudents, 
  getCurrentStudentId, 
  setCurrentStudentId, 
  createBlankStudent, 
  computeFullName, 
  computeBirthDate,
  renderStudentCanvas, 
  makeA4Pdf, 
  downloadFile, 
  exportStudentsToCsv 
} from './utils/emisStorage';
import { StudentRecord } from './data/emisData';
import { Toolbar } from './components/Toolbar';
import { EmisSheet } from './components/EmisSheet';
import { SideAssistant } from './components/SideAssistant';
import { StudentListModal } from './components/StudentListModal';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ShieldCheck, 
  X,
  FileCheck
} from 'lucide-react';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentRecord>(createBlankStudent);
  const [isModified, setIsModified] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showAssistant, setShowAssistant] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(current => (current?.message === message ? null : current));
    }, 4000);
  };

  // Initial load from storage
  useEffect(() => {
    const list = getSavedStudents();
    setStudents(list);

    const savedActiveId = getCurrentStudentId();
    if (savedActiveId) {
      const found = list.find(s => s.id === savedActiveId);
      if (found) {
        setCurrentStudent(found);
        return;
      }
    }

    if (list.length > 0) {
      setCurrentStudent(list[0]);
    } else {
      const fresh = createBlankStudent();
      setCurrentStudent(fresh);
    }
  }, []);

  // Update field handler
  const handleFieldChange = (key: string, value: string | boolean) => {
    setCurrentStudent(prev => {
      const nextFields = { ...prev.fields, [key]: value };
      const nextName = computeFullName(nextFields);
      const nextNationalId = (nextFields.f_r as string) || '';
      const nextGrade = (nextFields.cls as string) || '';
      const nextBirthDate = computeBirthDate(nextFields);
      const nextPhone = (nextFields.tel as string) || '';

      return {
        ...prev,
        studentName: nextName,
        nationalId: nextNationalId,
        grade: nextGrade,
        birthDate: nextBirthDate,
        phone: nextPhone,
        fields: nextFields,
        updatedAt: Date.now()
      };
    });
    setIsModified(true);
  };

  // Photo upload handler
  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentStudent(prev => ({
        ...prev,
        photoURL: result,
        updatedAt: Date.now()
      }));
      setIsModified(true);
      showToast('تم تحميل الصورة الشخصية للطالب بنجاح', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setCurrentStudent(prev => ({
      ...prev,
      photoURL: '',
      updatedAt: Date.now()
    }));
    setIsModified(true);
    showToast('تم حذف الصورة الشخصية', 'info');
  };

  // 1. New Student Record
  const handleNewStudent = () => {
    if (isModified) {
      const confirmNew = window.confirm('لديك تعديلات غير محفوظة على الاستمارة الحالية. هل تود المتابعة وإنشاء استمارة جديدة؟');
      if (!confirmNew) return;
    }
    const fresh = createBlankStudent();
    setCurrentStudent(fresh);
    setCurrentStudentId(fresh.id);
    setIsModified(false);
    showToast('تم فتح استمارة جديدة وجاهزة للإدخال', 'info');
  };

  // 2. Save Current Student
  const handleSaveStudent = () => {
    // Check if duplicate national ID or full name exists in other records
    const cleanId = currentStudent.nationalId.trim();
    const cleanName = currentStudent.studentName.trim();

    if (!currentStudent.fields.n1 || !(currentStudent.fields.n1 as string).trim()) {
      showToast('تنبيه: يُفضل إدخال الاسم الأول للطالب على الأقل قبل الحفظ', 'info');
    }

    if (cleanId) {
      const existing = students.find(s => s.id !== currentStudent.studentName && s.id !== currentStudent.id && s.nationalId && s.nationalId.trim() === cleanId);
      if (existing) {
        const proceed = window.confirm(`تنبيه: رقم الهوية/البطاقة الوطنية (${cleanId}) مسجل مسبقاً للطالب (${existing.studentName}). هل تريد المتابعة وتحديث السجل؟`);
        if (!proceed) return;
      }
    }

    const updatedStudents = [...students];
    const existingIndex = updatedStudents.findIndex(s => s.id === currentStudent.id);

    const recordToSave: StudentRecord = {
      ...currentStudent,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      updatedStudents[existingIndex] = recordToSave;
    } else {
      updatedStudents.unshift(recordToSave);
    }

    setStudents(updatedStudents);
    saveStudents(updatedStudents);
    setCurrentStudentId(recordToSave.id);
    setIsModified(false);

    showToast(`تم حفظ بيانات الطالب (${recordToSave.studentName}) بنجاح`, 'success');
  };

  // 3. Clear Fields with confirmation
  const handleClearFields = () => {
    const confirmed = window.confirm('هل أنت متأكد من مسح جميع الحقول الحالية في الاستمارة؟');
    if (!confirmed) return;

    setCurrentStudent(prev => ({
      ...prev,
      studentName: 'طالب جديد',
      nationalId: '',
      grade: '',
      birthDate: '—',
      phone: '',
      photoURL: '',
      fields: {},
      updatedAt: Date.now()
    }));
    setIsModified(true);
    showToast('تم مسح جميع الحقول', 'info');
  };

  // 4. Select Student from List
  const handleSelectStudent = (student: StudentRecord) => {
    if (isModified) {
      const proceed = window.confirm('لديك تعديلات غير محفوظة على الاستمارة الحالية. هل تريد فتح هذا السجل وتجاهل التعديلات؟');
      if (!proceed) return;
    }
    setCurrentStudent(student);
    setCurrentStudentId(student.id);
    setIsModified(false);
    showToast(`تم فتح سجل الطالب: ${student.studentName}`, 'info');
  };

  // 5. Delete Student
  const handleDeleteStudent = (id: string) => {
    const remaining = students.filter(s => s.id !== id);
    setStudents(remaining);
    saveStudents(remaining);

    if (currentStudent.id === id) {
      if (remaining.length > 0) {
        setCurrentStudent(remaining[0]);
        setCurrentStudentId(remaining[0].id);
      } else {
        const fresh = createBlankStudent();
        setCurrentStudent(fresh);
        setCurrentStudentId(fresh.id);
      }
      setIsModified(false);
    }

    showToast('تم حذف سجل الطالب بنجاح', 'success');
  };

  // 6. Print Form (A4)
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 7. Export High-DPI PDF
  const handleExportPdf = async (targetStudent = currentStudent) => {
    try {
      showToast('جاري إنشاء ملف PDF فائق الدقة...', 'info');
      const canvas = await renderStudentCanvas(targetStudent, '/assets/emis_form_bg.jpg', 2.5);
      
      const blob = await new Promise<Blob | null>(resolve => {
        canvas.toBlob(b => resolve(b), 'image/jpeg', 0.95);
      });

      if (!blob) throw new Error('Failed to create JPEG blob');

      const buffer = new Uint8Array(await blob.arrayBuffer());
      const pdfBlob = makeA4Pdf(buffer, canvas.width, canvas.height);

      const cleanName = (targetStudent.studentName || 'طالب').replace(/[\\/:*?"<>|]/g, '-').trim();
      const cleanId = (targetStudent.nationalId || targetStudent.id).replace(/[\\/:*?"<>|]/g, '-').trim();
      const filename = `استمارة-EMIS-${cleanName}-${cleanId}.pdf`;

      downloadFile(pdfBlob, filename);
      showToast(`تم تصدير ملف PDF بنجاح: ${filename}`, 'success');
    } catch (err: any) {
      console.error('PDF export error:', err);
      showToast('تعذر إنشاء ملف PDF: ' + (err?.message || err), 'error');
    }
  };

  // 8. Export All to JSON Backup
  const handleExportJson = () => {
    try {
      const dataStr = JSON.stringify(students, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(blob, `emis_students_backup_${dateStr}.json`);
      showToast(`تم تصدير نسخة احتياطية لعدد ${students.length} طالب`, 'success');
    } catch (err) {
      showToast('فشل تصدير النسخة الاحتياطية', 'error');
    }
  };

  // 9. Export All to Excel CSV
  const handleExportCsv = () => {
    try {
      const csvContent = exportStudentsToCsv(students);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(blob, `emis_students_excel_${dateStr}.csv`);
      showToast('تم تصدير ملف Excel بنجاح', 'success');
    } catch (err) {
      showToast('فشل تصدير ملف Excel', 'error');
    }
  };

  // 10. Import JSON Backup
  const handleTriggerImport = () => {
    importFileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) {
          throw new Error('الملف لا يحتوي على مصفوفة سجلات صالحة');
        }

        // Validate basic records
        const validList: StudentRecord[] = parsed.filter(item => item && item.id && item.fields);
        if (validList.length === 0) {
          throw new Error('لم يتم العثور على سجلات متوافقة في هذا الملف');
        }

        const confirmMsg = `تم العثور على ${validList.length} سجل في ملف النسخ الاحتياطي.\n\nاضغط "موافق" لدمج وتحديث السجلات الحالية.\nأو "إلغاء" لإلغاء العملية.`;
        if (!window.confirm(confirmMsg)) return;

        // Merge logic
        const map = new Map<string, StudentRecord>();
        students.forEach(s => map.set(s.id, s));
        validList.forEach(s => map.set(s.id, s));

        const merged = Array.from(map.values());
        setStudents(merged);
        saveStudents(merged);

        if (validList.length > 0) {
          setCurrentStudent(validList[0]);
          setCurrentStudentId(validList[0].id);
          setIsModified(false);
        }

        showToast(`تم استيراد ${validList.length} سجل بنجاح`, 'success');
      } catch (err: any) {
        console.error('Import error:', err);
        showToast('خطأ في استيراد الملف: ' + (err.message || 'الملف غير صالح'), 'error');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // 11. Download Standalone HTML
  const handleDownloadStandalone = () => {
    const link = document.createElement('a');
    link.href = '/استمارة_معلومات_الطلاب_والتلاميذ_EMIS_نسخة_أصلية_احتياطية.html';
    link.download = 'استمارة معلومات الطلاب والتلاميذ EMIS.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تحميل ملف الاستمارة المستقل للتشغيل بدون إنترنت', 'info');
  };

  // Keyboard Shortcuts (Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveStudent();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStudent, students, handlePrint]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 antialiased selection:bg-amber-400 selection:text-slate-900" dir="rtl">
      
      {/* 1. Main Navigation Toolbar */}
      <Toolbar
        onNew={handleNewStudent}
        onSave={handleSaveStudent}
        onClear={handleClearFields}
        onPrint={handlePrint}
        onPdf={() => handleExportPdf(currentStudent)}
        onOpenList={() => setShowListModal(true)}
        onPreview={() => setShowPreviewModal(true)}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onImportJson={handleTriggerImport}
        onDownloadStandalone={handleDownloadStandalone}
        savedCount={students.length}
        currentStudentName={currentStudent.studentName}
        isModified={isModified}
        zoom={zoom}
        setZoom={setZoom}
        showAssistant={showAssistant}
        setShowAssistant={setShowAssistant}
      />

      {/* Security & Local Storage Compliance Banner */}
      <div className="bg-slate-200/80 border-b border-slate-300 text-slate-600 px-4 py-1.5 text-xs flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>تنبيه أمان البيانات:</strong> يتم تخزين كافة بيانات الطلاب والتلاميذ والصور محلياً 100% داخل هذا الجهاز والمتصفح دون إرسالها إلى أي خوادم خارجية.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500 font-mono">
          <span>اختصار الحفظ: <kbd className="bg-white border rounded px-1 text-slate-700">Ctrl + S</kbd></span>
          <span>اختصار الطباعة: <kbd className="bg-white border rounded px-1 text-slate-700">Ctrl + P</kbd></span>
        </div>
      </div>

      {/* 2. Main Work Area (Canvas + Side Assistant) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Visual Form Canvas Area */}
        <main className="flex-1 overflow-y-auto bg-slate-200/90 dark:bg-slate-950 p-2 sm:p-4 flex flex-col items-center">
          <EmisSheet
            student={currentStudent}
            onChangeField={handleFieldChange}
            onPhotoUpload={handlePhotoUpload}
            onClearPhoto={handleClearPhoto}
            zoom={zoom}
          />
        </main>

        {/* Side Form Assistant Panel */}
        {showAssistant && (
          <SideAssistant
            student={currentStudent}
            onChangeField={handleFieldChange}
            onClose={() => setShowAssistant(false)}
          />
        )}

      </div>

      {/* 3. Student List Modal */}
      <StudentListModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        students={students}
        currentStudentId={currentStudent.id}
        onSelectStudent={handleSelectStudent}
        onDeleteStudent={handleDeleteStudent}
        onNewStudent={() => {
          handleNewStudent();
          setShowListModal(false);
        }}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onImportJson={handleTriggerImport}
        onPrintStudent={student => {
          setCurrentStudent(student);
          setCurrentStudentId(student.id);
          setIsModified(false);
          setShowListModal(false);
          setTimeout(() => window.print(), 200);
        }}
        onPdfStudent={student => {
          handleExportPdf(student);
        }}
      />

      {/* 4. Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        student={currentStudent}
        onPrint={() => {
          setShowPreviewModal(false);
          setTimeout(() => window.print(), 200);
        }}
        onPdf={() => {
          handleExportPdf(currentStudent);
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 print:hidden bg-slate-900 border border-slate-700">
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="mr-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hidden File Input for JSON Backup Import */}
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

    </div>
  );
}
