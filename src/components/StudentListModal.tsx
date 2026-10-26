import React, { useState, useMemo } from 'react';
import { StudentRecord } from '../data/emisData';
import { 
  X, 
  Search, 
  Trash2, 
  Printer, 
  FileDown, 
  Edit3, 
  Plus, 
  Calendar, 
  Phone, 
  CreditCard, 
  GraduationCap, 
  FileSpreadsheet, 
  Upload, 
  Download,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  currentStudentId: string | null;
  onSelectStudent: (student: StudentRecord) => void;
  onDeleteStudent: (id: string) => void;
  onNewStudent: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onImportJson: () => void;
  onPrintStudent: (student: StudentRecord) => void;
  onPdfStudent: (student: StudentRecord) => void;
}

export const StudentListModal: React.FC<StudentListModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudentId,
  onSelectStudent,
  onDeleteStudent,
  onNewStudent,
  onExportJson,
  onExportCsv,
  onImportJson,
  onPrintStudent,
  onPdfStudent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique grades for filtering
  const grades = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.grade && s.grade.trim()) set.add(s.grade.trim());
    });
    return Array.from(set);
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery = 
        !q ||
        s.studentName.toLowerCase().includes(q) ||
        s.nationalId.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        (s.fields.n1 as string || '').toLowerCase().includes(q) ||
        (s.fields.n5 as string || '').toLowerCase().includes(q);

      const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;

      return matchesQuery && matchesGrade;
    });
  }, [students, searchQuery, selectedGrade]);

  if (!isOpen) return null;

  const studentToDelete = students.find(s => s.id === deleteConfirmId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">سجلات الطلاب والتلاميذ المحفوظة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                إجمالي السجلات المسجلة محلياً: <span className="font-bold font-mono text-sky-600 dark:text-sky-400">{students.length}</span> طالب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>طالب جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الرقم الوطني/الهوية، الهاتف..."
                className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-sky-500 text-slate-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {grades.length > 0 && (
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="all">كل الصفوف ({students.length})</option>
                {grades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>

          {/* Quick Import / Export actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700"
              title="تصدير إلى جدول Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700"
              title="تصدير ملف النسخ الاحتياطي JSON"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>نسخ احتياطي</span>
            </button>
            <button
              onClick={onImportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700"
              title="استرجاع من ملف نسخ احتياطي"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>استيراد</span>
            </button>
          </div>
        </div>

        {/* Student Records List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold mb-1">لم يتم العثور على سجلات مطابقة</p>
              <p className="text-xs">
                {searchQuery ? 'جرّب البحث بكلمات أخرى أو مسح معايير الفلترة' : 'ابدأ بملء الاستمارة والضغط على حفظ البيانات'}
              </p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const isCurrent = student.id === currentStudentId;
              return (
                <div
                  key={student.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-sky-50/70 dark:bg-sky-950/20 border-sky-400 dark:border-sky-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {student.photoURL ? (
                        <img 
                          src={student.photoURL} 
                          alt={student.studentName}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          بلا صورة
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {student.studentName}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-sky-500 text-white px-2 py-0.2 rounded-full font-bold">
                            الاستمارة المعروضة
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {student.nationalId && (
                          <div className="flex items-center gap-1 font-mono">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.nationalId}</span>
                          </div>
                        )}
                        {student.grade && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            <span>الصف: {student.grade}</span>
                          </div>
                        )}
                        {student.birthDate !== '—' && (
                          <div className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.birthDate}</span>
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectStudent(student);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 rounded text-xs font-semibold transition-colors"
                      title="فتح الاستمارة للتعديل والتحرير"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>فتح الاستمارة</span>
                    </button>

                    <button
                      onClick={() => onPrintStudent(student)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 text-slate-700 dark:text-slate-200 hover:text-amber-800 rounded transition-colors"
                      title="طباعة استمارة الطالب"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onPdfStudent(student)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 text-slate-700 dark:text-slate-200 hover:text-sky-800 rounded transition-colors"
                      title="تصدير استمارة الطالب إلى PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(student.id)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 text-slate-700 dark:text-slate-200 hover:text-rose-700 rounded transition-colors"
                      title="حذف هذا السجل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <span>
            يتم حفظ السجلات محلياً في ذاكرة هذا المتصفح. احرص على تصدير نسخة احتياطية دورياً.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && studentToDelete && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-rose-500/30 shadow-2xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                تأكيد حذف سجل الطالب
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
                هل أنت متأكد من حذف سجل الطالب: <strong>{studentToDelete.studentName}</strong>؟
                لا يمكن التراجع عن هذه العملية بعد الحذف.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onDeleteStudent(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-colors shadow"
                >
                  نعم، احذف السجل
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
