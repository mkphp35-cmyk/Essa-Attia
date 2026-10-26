import { StudentRecord, FORM_WIDTH, FORM_HEIGHT, TEXT_FIELDS, CHECKBOXES, HEADER_CHECKBOXES, PHOTO_COORDS, WRAPPED_FIELDS } from '../data/emisData';

const DB_KEY = 'emis_students_database_v2';
const CURRENT_STUDENT_KEY = 'emis_current_student_id_v2';

// In-memory / local storage service
export function getSavedStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load students', err);
    return [];
  }
}

export function saveStudents(students: StudentRecord[]) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage', err);
  }
}

export function getCurrentStudentId(): string | null {
  try {
    return localStorage.getItem(CURRENT_STUDENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentStudentId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(CURRENT_STUDENT_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_STUDENT_KEY);
    }
  } catch {}
}

export function computeFullName(fields: Record<string, string | boolean>): string {
  const n1 = (fields.n1 as string) || '';
  const n2 = (fields.n2 as string) || '';
  const n3 = (fields.n3 as string) || '';
  const n4 = (fields.n4 as string) || '';
  const n5 = (fields.n5 as string) || '';
  const parts = [n1, n2, n3, n4, n5].map(s => s.trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'طالب جديد';
}

export function computeBirthDate(fields: Record<string, string | boolean>): string {
  const y = (fields.d1 as string) || '';
  const m = (fields.d2 as string) || '';
  const d = (fields.d3 as string) || '';
  if (!y && !m && !d) return '—';
  return `${y || '----'}/${m ? m.padStart(2, '0') : '--'}/${d ? d.padStart(2, '0') : '--'}`;
}

export function createBlankStudent(): StudentRecord {
  const id = 'std_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    studentName: 'طالب جديد',
    nationalId: '',
    grade: '',
    birthDate: '—',
    phone: '',
    photoURL: '',
    fields: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Text fitting and wrapping helpers
const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
const FONT_STACK = 'Cairo, Tahoma, Arial, sans-serif';
const BASE_FONT_SIZE = 17;

export function wrapText(text: string, maxWidth: number, ctx: CanvasRenderingContext2D): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const candidate = current ? current + ' ' + w : w;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function layoutField(
  key: string,
  text: string,
  boxWidth: number,
  boxHeight: number
): { size: number; lines: string[] } {
  if (!measureCanvas) return { size: BASE_FONT_SIZE, lines: [text] };
  const paddingWidth = boxWidth - 8;
  const isWrapped = WRAPPED_FIELDS.includes(key);

  if (!isWrapped) {
    let size = BASE_FONT_SIZE;
    measureCanvas.font = `bold ${size}px ${FONT_STACK}`;
    const m = measureCanvas.measureText(text).width;
    if (m > paddingWidth && paddingWidth > 0) {
      size = Math.max(8, (size * paddingWidth) / m);
    }
    return { size, lines: [text] };
  }

  for (let s = BASE_FONT_SIZE; s >= 7; s -= 0.5) {
    measureCanvas.font = `bold ${s}px ${FONT_STACK}`;
    const lines = wrapText(text, paddingWidth, measureCanvas);
    if (lines.length * s * 1.15 <= boxHeight - 2) {
      return { size: s, lines };
    }
  }

  measureCanvas.font = `bold 7px ${FONT_STACK}`;
  return { size: 7, lines: wrapText(text, paddingWidth, measureCanvas) };
}

// Draw checkmark
export function drawTick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lineWidth = 3.5
) {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(x + 0.2 * w, y + 0.55 * h);
  ctx.lineTo(x + 0.42 * w, y + 0.82 * h);
  ctx.lineTo(x + 0.85 * w, y + 0.18 * h);
  ctx.stroke();
  ctx.restore();
}

// Minimal A4 PDF creator from JPEG buffer (zero-dependency, ultra-reliable)
export function makeA4Pdf(jpegBuffer: Uint8Array, pixelWidth: number, pixelHeight: number): Blob {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const offsets: number[] = [];
  let length = 0;

  const add = (data: Uint8Array | string) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    parts.push(bytes as BlobPart);
    length += bytes.length;
  };

  const addObj = (objNum: number, content: string) => {
    offsets[objNum] = length;
    add(`${objNum} 0 obj\n${content}\nendobj\n`);
  };

  add('%PDF-1.4\n');
  addObj(1, '<</Type/Catalog/Pages 2 0 R>>');
  addObj(2, '<</Type/Pages/Kids[3 0 R]/Count 1>>');
  addObj(3, '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>');

  offsets[4] = length;
  add(`4 0 obj\n<</Type/XObject/Subtype/Image/Width ${pixelWidth}/Height ${pixelHeight}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpegBuffer.length}>>\nstream\n`);
  add(jpegBuffer);
  add('\nendstream\nendobj\n');

  const contentStream = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
  addObj(5, `<</Length ${contentStream.length}>>\nstream\n${contentStream}\nendstream`);

  const startXref = length;
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i] || 0).padStart(10, '0') + ' 00000 n \n';
  }
  add(xref);
  add(`trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${startXref}\n%%EOF`);

  return new Blob(parts, { type: 'application/pdf' });
}

// Generate high-resolution canvas with student data & background
export async function renderStudentCanvas(
  student: StudentRecord,
  bgImageSrc = '/assets/emis_form_bg.jpg',
  scale = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = FORM_WIDTH * scale;
  canvas.height = FORM_HEIGHT * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2d context');

  // 1. Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw background template
  const bgImg = await loadImage(bgImageSrc);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Set coordinate scale
  ctx.scale(scale, scale);

  // 3. Draw Student Photo if present
  if (student.photoURL) {
    try {
      const pImg = await loadImage(student.photoURL);
      const [pa, pb, pc, pd] = PHOTO_COORDS;
      const pw = pc - pa;
      const ph = pd - pb;
      const r = Math.max(pw / pImg.width, ph / pImg.height);
      const sw = pw / r;
      const sh = ph / r;
      const sx = (pImg.width - sw) / 2;
      const sy = (pImg.height - sh) / 2;
      ctx.drawImage(pImg, sx, sy, sw, sh, pa, pb, pw, ph);
    } catch (e) {
      console.warn('Failed to load student photo', e);
    }
  }

  // 4. Render Text Fields
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';

  TEXT_FIELDS.forEach(field => {
    const rawVal = student.fields[field.key];
    const val = typeof rawVal === 'string' ? rawVal.trim() : '';
    if (!val) return;

    const [a, b, c, d] = [field.left, field.top, field.right, field.bottom];
    const w = c - a;
    const h = d - b;
    const layout = layoutField(field.key, val, w, h);

    ctx.font = `bold ${layout.size}px ${FONT_STACK}`;
    const isArabic = /[\u0600-\u06FF]/.test(val);
    const isCentered = /^d[123]$/.test(field.key);

    ctx.direction = isCentered ? 'ltr' : isArabic ? 'rtl' : 'ltr';
    ctx.textAlign = isCentered ? 'center' : isArabic ? 'right' : 'left';

    const px = isCentered ? (a + c) / 2 : isArabic ? c - 4 : a + 4;
    const lh = layout.size * 1.15;
    const numLines = layout.lines.length;

    layout.lines.forEach((line, idx) => {
      const py = (b + d) / 2 - (numLines * lh) / 2 + lh / 2 + idx * lh;
      ctx.fillText(line, px, py);
    });
  });

  // 5. Render Square Checkboxes
  CHECKBOXES.forEach(cb => {
    if (student.fields[cb.key]) {
      drawTick(ctx, cb.left, cb.top, cb.right - cb.left, cb.bottom - cb.top, 3.2);
    }
  });

  // 6. Render Section Header Checkboxes (with border box & check)
  HEADER_CHECKBOXES.forEach(cb => {
    if (student.fields[cb.key]) {
      const a = cb.left;
      const b = cb.top;
      const w = cb.right - a;
      const h = cb.bottom - b;
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(a + 2, b + 2, w - 4, h - 4);
      drawTick(ctx, a + 6, b + h / 2 - 12, 24, 24, 3.5);
      ctx.restore();
    }
  });

  return canvas;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    img.src = src;
  });
}

// Download file utility
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// CSV Export for school spreadsheets
export function exportStudentsToCsv(students: StudentRecord[]): string {
  const headers = [
    'الرقم التعريفي',
    'اسم الطالب الكامل',
    'الاسم الأول',
    'اسم الأب',
    'اسم الجد',
    'اسم والد الجد',
    'اللقب',
    'اسم الأم',
    'تاريخ الميلاد',
    'محل الولادة',
    'رقم الهوية / الوطنية',
    'الصف الدراسي',
    'الشعبة',
    'الهاتف',
    'المحافظة',
    'القضاء',
    'الحي/القرية',
    'تاريخ التسجيل'
  ];

  const rows = students.map(s => {
    const f = s.fields;
    return [
      s.id,
      s.studentName,
      (f.n1 as string) || '',
      (f.n2 as string) || '',
      (f.n3 as string) || '',
      (f.n4 as string) || '',
      (f.n5 as string) || '',
      (f.m1 as string) || '',
      s.birthDate,
      (f.pob as string) || '',
      (f.f_r as string) || '',
      (f.cls as string) || '',
      (f.sec as string) || '',
      (f.tel as string) || '',
      (f.a1 as string) || (f.s_bn as string) || '',
      (f.a2 as string) || (f.s_cv as string) || '',
      (f.a4 as string) || '',
      new Date(s.createdAt).toLocaleDateString('ar-IQ')
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
  });

  // UTF-8 BOM for Arabic in Excel
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}
