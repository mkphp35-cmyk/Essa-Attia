import React, { useRef, useEffect } from 'react';
import { 
  FORM_WIDTH, 
  FORM_HEIGHT, 
  PHOTO_COORDS, 
  WRAPPED_FIELDS, 
  TEXT_FIELDS, 
  CHECKBOXES, 
  HEADER_CHECKBOXES,
  StudentRecord
} from '../data/emisData';
import { layoutField } from '../utils/emisStorage';
import { Camera, X } from 'lucide-react';

interface EmisSheetProps {
  student: StudentRecord;
  onChangeField: (key: string, value: string | boolean) => void;
  onPhotoUpload: (file: File) => void;
  onClearPhoto: () => void;
  zoom: number;
}

export const EmisSheet: React.FC<EmisSheetProps> = ({
  student,
  onChangeField,
  onPhotoUpload,
  onClearPhoto,
  zoom
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Compute position percentage style based on original coordinates
  const getStyle = (a: number, b: number, c: number, d: number): React.CSSProperties => {
    return {
      left: `${((a / FORM_WIDTH) * 100).toFixed(3)}%`,
      top: `${((b / FORM_HEIGHT) * 100).toFixed(3)}%`,
      width: `${(((c - a) / FORM_WIDTH) * 100).toFixed(3)}%`,
      height: `${(((d - b) / FORM_HEIGHT) * 100).toFixed(3)}%`,
    };
  };

  const handleCheckboxChange = (
    key: string,
    group: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked;
    // If it belongs to a radio group, uncheck other checkboxes in the same group
    if (isChecked && group) {
      const allCb = [...CHECKBOXES, ...HEADER_CHECKBOXES];
      allCb.forEach(item => {
        if (item.group === group && item.key !== key) {
          onChangeField(item.key, false);
        }
      });
    }
    onChangeField(key, isChecked);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
    }
    if (e.target) e.target.value = '';
  };

  // Auto-fit font sizes dynamically on inputs
  useEffect(() => {
    if (!sheetRef.current) return;
    TEXT_FIELDS.forEach(field => {
      const el = sheetRef.current?.querySelector(`[data-k="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!el) return;
      const val = (student.fields[field.key] as string) || '';
      const w = field.right - field.left;
      const h = field.bottom - field.top;
      const layout = layoutField(field.key, val, w, h);
      
      // Use container query units (cqw) for responsive fidelity
      el.style.fontSize = `${((layout.size / FORM_WIDTH) * 100).toFixed(3)}cqw`;
      if (WRAPPED_FIELDS.includes(field.key)) {
        const pt = Math.max(0, (h - layout.lines.length * layout.size * 1.15) / 2);
        el.style.paddingTop = `${((pt / FORM_WIDTH) * 100).toFixed(3)}cqw`;
      }
    });
  }, [student.fields]);

  const [pa, pb, pc, pd] = PHOTO_COORDS;
  const photoStyle = getStyle(pa, pb, pc, pd);

  return (
    <div 
      className="emis-sheet-wrapper w-full flex justify-center py-4 px-2 select-none overflow-x-auto print:p-0 print:overflow-visible"
    >
      <div 
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out'
        }}
        className="print:transform-none"
      >
        <div 
          ref={sheetRef}
          id="emis-print-sheet"
          className="emis-sheet relative mx-auto bg-white shadow-2xl print:shadow-none print:m-0"
          style={{
            width: 'min(96vw, 980px)',
            aspectRatio: `${FORM_WIDTH} / ${FORM_HEIGHT}`,
            containerType: 'inline-size',
            backgroundImage: "url('/assets/emis_form_bg.jpg')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0 0'
          }}
        >
          {/* 1. TEXT & TEXTAREA INPUTS */}
          {TEXT_FIELDS.map(f => {
            const isWrapped = WRAPPED_FIELDS.includes(f.key);
            const isDateNumber = /^d[123]$/.test(f.key);
            const value = (student.fields[f.key] as string) || '';
            const style = getStyle(f.left, f.top, f.right, f.bottom);

            if (isWrapped) {
              return (
                <textarea
                  key={f.key}
                  dir="auto"
                  data-k={f.key}
                  style={style}
                  value={value}
                  onChange={e => onChangeField(f.key, e.target.value)}
                  placeholder={f.label}
                  title={f.label}
                  className="emis-field emis-textarea absolute border-0 bg-transparent text-slate-900 font-bold resize-none outline-none focus:bg-amber-100/40 focus:ring-1 focus:ring-amber-500 rounded-[2px] transition-colors leading-[1.18] px-1 overflow-hidden"
                />
              );
            }

            return (
              <input
                key={f.key}
                type="text"
                data-k={f.key}
                dir={isDateNumber ? 'ltr' : 'auto'}
                style={style}
                value={value}
                maxLength={f.key === 'd1' ? 4 : f.key === 'd2' || f.key === 'd3' ? 2 : undefined}
                inputMode={isDateNumber ? 'numeric' : f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
                onChange={e => {
                  let v = e.target.value;
                  if (isDateNumber) {
                    v = v.replace(/\D/g, '');
                  }
                  onChangeField(f.key, v);
                }}
                placeholder={f.label}
                title={f.label}
                autoComplete="off"
                className={`emis-field absolute border-0 bg-transparent text-slate-900 font-bold outline-none focus:bg-amber-100/40 focus:ring-1 focus:ring-amber-500 rounded-[2px] transition-colors px-1 ${
                  isDateNumber ? 'text-center font-mono tracking-wider' : ''
                }`}
              />
            );
          })}

          {/* 2. REGULAR SQUARE CHECKBOXES */}
          {CHECKBOXES.map(cb => {
            const isChecked = !!student.fields[cb.key];
            const style = getStyle(cb.left, cb.top, cb.right, cb.bottom);
            return (
              <input
                key={cb.key}
                type="checkbox"
                data-k={cb.key}
                data-g={cb.group}
                checked={isChecked}
                onChange={e => handleCheckboxChange(cb.key, cb.group, e)}
                style={style}
                title={cb.label || cb.key}
                className="emis-cb-square absolute cursor-pointer opacity-75 hover:opacity-100 accent-black transition-opacity"
              />
            );
          })}

          {/* 3. SECTION HEADER CHECKBOXES (LARGE BORDER BOXES) */}
          {HEADER_CHECKBOXES.map(cb => {
            const isChecked = !!student.fields[cb.key];
            const style = getStyle(cb.left, cb.top, cb.right, cb.bottom);
            return (
              <div
                key={cb.key}
                style={style}
                onClick={() => {
                  handleCheckboxChange(cb.key, cb.group, {
                    target: { checked: !isChecked }
                  } as any);
                }}
                title={cb.label}
                className={`emis-cb-header absolute cursor-pointer transition-all flex items-center justify-start pr-2 ${
                  isChecked 
                    ? 'border-2 border-black bg-black/5 font-extrabold text-black' 
                    : 'hover:bg-amber-500/10'
                }`}
              >
                {isChecked && (
                  <span className="text-xl font-black text-black select-none pointer-events-none">
                    ✓
                  </span>
                )}
              </div>
            );
          })}

          {/* 4. STUDENT PHOTO CONTAINER */}
          <div
            id="emis-photo-box"
            style={photoStyle}
            onClick={() => fileInputRef.current?.click()}
            title="اضغط لتحميل أو تغيير الصورة الشخصية للطالب"
            className="group absolute cursor-pointer border border-dashed border-slate-400 hover:border-amber-500 bg-slate-100/60 hover:bg-amber-50/50 flex flex-col items-center justify-center overflow-hidden transition-all print:border-none print:bg-transparent"
          >
            {student.photoURL ? (
              <>
                <img
                  src={student.photoURL}
                  alt={student.studentName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onClearPhoto();
                  }}
                  className="absolute top-1 left-1 p-1 bg-rose-600/80 hover:bg-rose-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden shadow"
                  title="حذف الصورة"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-1 text-center text-slate-500 group-hover:text-amber-600 print:hidden">
                <Camera className="w-5 h-5 mb-0.5 opacity-60" />
                <span className="text-[9px] font-semibold leading-tight">
                  الصورة الشخصية
                </span>
                <span className="text-[7px] text-slate-400">
                  اضغط للرفع
                </span>
              </div>
            )}
          </div>

          {/* Hidden File Input for Student Photo */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

        </div>
      </div>
    </div>
  );
};
