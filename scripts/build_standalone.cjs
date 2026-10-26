const fs = require('fs');

const origHtml = fs.readFileSync('public/assets/aistudio/EMIS_original_backup.html', 'utf8');
const match = origHtml.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/);
if (!match) {
  console.error('Base64 not found in backup');
  process.exit(1);
}
const bgBase64 = match[1];

// We can read template parts or load from public/assets/aistudio/EMIS_original_backup.html
// Notice that the original file is already an HTML file with the form!
// We can inject the enhanced toolbar, student modal, and student database script into the original HTML!
let enhanced = origHtml;

// Replace title
enhanced = enhanced.replace(
  '<title>استمارة معلومات الطلاب والتلاميذ EMIS</title>',
  '<title>برنامج استمارة معلومات الطلاب والتلاميذ EMIS</title>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">'
);

// Enhance body styling to use Cairo font
enhanced = enhanced.replace(
  'body{background:var(--bg);font-family:Tahoma,Arial,sans-serif;',
  'body{background:var(--bg);font-family:"Cairo",Tahoma,Arial,sans-serif;'
);

// Replace toolbar with comprehensive administrative toolbar
const oldBarRegex = /<div class="bar">[\s\S]*?<\/div>/;
const newBar = `<header class="bar" style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 16px;background:#0f172a;color:#fff;box-shadow:0 4px 16px rgba(0,0,0,0.25)">
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-weight:800;font-size:15px;color:#fff">نظام استمارة EMIS المدرسية</span>
    <span style="background:rgba(16,185,129,0.2);color:#34d399;font-size:11px;padding:2px 6px;border-radius:4px;font-weight:700;border:1px solid rgba(16,185,129,0.4)">إلكتروني متكامل</span>
    <span style="font-size:11px;color:#94a3b8">طالب: <strong id="lblStudentName" style="color:#fde047;font-weight:700">طالب جديد</strong></span>
  </div>
  <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
    <button style="background:#1e293b;color:#e2e8f0;border:1px solid #334155" onclick="doNewStudent()">➕ استمارة جديدة</button>
    <button style="background:#059669;color:#fff" onclick="doSaveCurrent()">💾 حفظ البيانات</button>
    <button style="background:#1e293b;color:#e2e8f0;border:1px solid #334155" onclick="openStudentModal()">👥 سجلات الطلاب (<span id="lblCount">0</span>)</button>
    <button class="p" style="background:#f59e0b;color:#0f172a;font-weight:900" onclick="window.print()">🖨️ طباعة الاستمارة</button>
    <button id="pdfb" style="background:#0284c7;color:#fff" onclick="pdf()">⬇️ تصدير PDF</button>
    <button style="background:#334155;color:#fca5a5;border:1px solid #475569" onclick="doClearFields()">🗑️ مسح الحقول</button>
    <button style="background:#1e293b;color:#e2e8f0;border:1px solid #334155" onclick="exportJsonBackup()" title="نسخ احتياطي">📤 نسخ احتياطي</button>
    <button style="background:#1e293b;color:#e2e8f0;border:1px solid #334155" onclick="fileImportJson.click()" title="استيراد">📥 استيراد</button>
    <button style="background:#1e293b;color:#e2e8f0;border:1px solid #334155" onclick="exportExcelCsv()" title="تصدير إلى Excel">📊 Excel</button>
  </div>
</header>
<div style="background:#cbd5e1;color:#334155;padding:4px 16px;font-size:11px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #94a3b8">
  <span>🛡️ <strong>أمان البيانات:</strong> جميع سجلات الطلاب والتلاميذ والصور مخزنة محلياً 100% داخل هذا الجهاز والمتصفح دون إرسالها إلى أي خوادم خارجية.</span>
  <span>اختصار الحفظ: <kbd>Ctrl+S</kbd> | اختصار الطباعة: <kbd>Ctrl+P</kbd></span>
</div>
<input type="file" id="fileImportJson" accept=".json" hidden>
<!-- Modal -->
<div id="studentModal" style="display:none;position:fixed;inset:0;z-index:100;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);align-items:center;justify-content:center;padding:16px">
  <div style="background:#fff;border-radius:12px;width:100%;max-width:820px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,0.3);overflow:hidden">
    <div style="padding:12px 20px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:space-between">
      <div style="font-weight:bold;font-size:14px">📁 إدارة سجلات الطلاب والتلاميذ</div>
      <button style="background:#1e293b;color:#fff;border:0;border-radius:4px;padding:4px 8px;cursor:pointer" onclick="closeStudentModal()">✕</button>
    </div>
    <div style="padding:10px 16px;border-bottom:1px solid #e2e8f0;display:flex;gap:8px">
      <input type="text" id="txtSearch" placeholder="ابحث بالاسم الكامل، رقم الهوية / الوطنية، الهاتف..." style="flex:1;padding:6px 12px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;outline:none" oninput="renderStudentList()">
      <button style="background:#059669;color:#fff" onclick="doNewStudent();closeStudentModal()">➕ إضافة طالب</button>
    </div>
    <div id="studentListContainer" style="padding:16px;overflow-y:auto;flex:1"></div>
    <div style="padding:10px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:12px">
      <span>تنبيه: يتم الحفظ على جهازك المحلي. قم بتصدير نسخة احتياطية دورية لضمان عدم فقدان البيانات.</span>
      <button style="background:#334155;color:#fff" onclick="closeStudentModal()">إغلاق</button>
    </div>
  </div>
</div>
<div id="toast" style="position:fixed;bottom:20px;right:20px;z-index:110;background:#0f172a;color:#fff;padding:10px 18px;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.3);font-size:12px;font-weight:700;display:none;border:1px solid #334155"></div>`;

enhanced = enhanced.replace(oldBarRegex, newBar);

// Enhance script logic: replace the save/storage logic with complete multi-student management
const oldScriptStart = "const KEY='emis_form_v2';let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}";
const enhancedScript = `
const DB_KEY = 'emis_students_database_v2';
let students = [];
try { students = JSON.parse(localStorage.getItem(DB_KEY) || '[]'); } catch(e) { students = []; }
let currentStudentId = localStorage.getItem('emis_active_id') || '';

function notify(msg){
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.style.display = 'block';
  setTimeout(()=>{ t.style.display = 'none'; }, 3500);
}
function updateStudentCounter(){
  document.getElementById('lblCount').innerText = students.length;
}
function computeFullName(){
  const parts = ['n1','n2','n3','n4','n5'].map(k=>(sh.querySelector('[data-k="'+k+'"]')?.value||'').trim()).filter(Boolean);
  return parts.length ? parts.join(' ') : 'طالب جديد';
}
function getFormState(){
  const o = {};
  sh.querySelectorAll('[data-k]').forEach(e=>{
    o[e.dataset.k] = e.type === 'checkbox' ? e.checked : e.value;
  });
  return o;
}
function setFormState(o, photoUrl=''){
  sh.querySelectorAll('[data-k]').forEach(e=>{
    const v = o[e.dataset.k];
    if(e.type === 'checkbox') e.checked = !!v;
    else e.value = (v !== undefined ? v : '');
  });
  phURL = photoUrl || '';
  if(phURL){
    ph.style.backgroundImage = 'url(' + phURL + ')';
    ph.innerText = '';
  } else {
    ph.style.backgroundImage = '';
    ph.innerText = '';
  }
  fitAll();
  document.getElementById('lblStudentName').innerText = computeFullName();
}
function saveCurrent(){
  const name = computeFullName();
  document.getElementById('lblStudentName').innerText = name;
  const f = getFormState();
  if(!currentStudentId){
    currentStudentId = 'std_' + Date.now();
  }
  const idx = students.findIndex(s=>s.id === currentStudentId);
  const rec = {
    id: currentStudentId,
    studentName: name,
    nationalId: f.f_r || '',
    grade: f.cls || '',
    birthDate: (f.d1||'----') + '/' + (f.d2||'--') + '/' + (f.d3||'--'),
    phone: f.tel || '',
    photoURL: phURL,
    fields: f,
    updatedAt: Date.now()
  };
  if(idx >= 0) students[idx] = rec;
  else students.unshift(rec);
  localStorage.setItem(DB_KEY, JSON.stringify(students));
  localStorage.setItem('emis_active_id', currentStudentId);
  updateStudentCounter();
}
function doSaveCurrent(){
  saveCurrent();
  notify('تم حفظ بيانات الطالب بنجاح!');
}
function doNewStudent(){
  currentStudentId = 'std_' + Date.now();
  setFormState({}, '');
  saveCurrent();
  notify('تم فتح استمارة جديدة لطالب جديد');
}
function doClearFields(){
  if(!confirm('مسح جميع الحقول والبدء بطالب جديد؟')) return;
  setFormState({}, '');
  saveCurrent();
  notify('تم مسح الحقول');
}
function openStudentModal(){
  renderStudentList();
  document.getElementById('studentModal').style.display = 'flex';
}
function closeStudentModal(){
  document.getElementById('studentModal').style.display = 'none';
}
function renderStudentList(){
  const q = (document.getElementById('txtSearch').value || '').trim().toLowerCase();
  const c = document.getElementById('studentListContainer');
  const filtered = students.filter(s=>{
    return !q || s.studentName.toLowerCase().includes(q) || (s.nationalId||'').toLowerCase().includes(q) || (s.phone||'').includes(q);
  });
  if(!filtered.length){
    c.innerHTML = '<div style="text-align:center;padding:30px;color:#94a3b8">لم يتم العثور على سجلات مطابقة</div>';
    return;
  }
  let h = '';
  filtered.forEach(s=>{
    const isActive = s.id === currentStudentId;
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid '+(isActive?'#0284c7':'#e2e8f0')+';border-radius:8px;margin-bottom:8px;background:'+(isActive?'#f0f9ff':'#fff')+'">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="width:40px;height:50px;border-radius:4px;border:1px solid #cbd5e1;background:#e2e8f0 center/cover no-repeat;'+(s.photoURL?'background-image:url('+s.photoURL+')':'')+'"></div>' +
        '<div>' +
          '<div style="font-weight:bold;font-size:13px">' + s.studentName + (isActive?' <span style="color:#0284c7;font-size:10px">(المعروض حالياً)</span>':'') + '</div>' +
          '<div style="display:flex;gap:12px;font-size:11px;color:#64748b;margin-top:3px">' +
            (s.nationalId?'<span>🪪 '+s.nationalId+'</span>':'') +
            (s.grade?'<span>🏫 الصف: '+s.grade+'</span>':'') +
            (s.phone?'<span>📞 '+s.phone+'</span>':'') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button style="background:#0f172a;color:#fff;padding:5px 10px" onclick="selectStudent(\\x27'+s.id+'\\x27)">تعديل</button>' +
        '<button style="background:#dc2626;color:#fff;padding:5px 10px" onclick="deleteStudent(\\x27'+s.id+'\\x27)">حذف</button>' +
      '</div>' +
    '</div>';
  });
  c.innerHTML = h;
}
function selectStudent(id){
  const found = students.find(s=>s.id === id);
  if(found){
    currentStudentId = found.id;
    setFormState(found.fields, found.photoURL);
    closeStudentModal();
    notify('تم فتح استمارة: ' + found.studentName);
  }
}
function deleteStudent(id){
  const found = students.find(s=>s.id === id);
  if(!found) return;
  if(!confirm('هل أنت متأكد من حذف سجل الطالب: ' + found.studentName + '؟')) return;
  students = students.filter(s=>s.id !== id);
  localStorage.setItem(DB_KEY, JSON.stringify(students));
  updateStudentCounter();
  if(currentStudentId === id){
    if(students.length) selectStudent(students[0].id);
    else doNewStudent();
  } else {
    renderStudentList();
  }
  notify('تم حذف السجل بنجاح');
}
function exportJsonBackup(){
  const blob = new Blob([JSON.stringify(students, null, 2)], {type:'application/json'});
  downloadBlob(blob, 'emis_students_backup_' + new Date().toISOString().split('T')[0] + '.json');
  notify('تم تصدير النسخة الاحتياطية بنجاح');
}
const fileImportJson = document.getElementById('fileImportJson');
fileImportJson.onchange = ()=>{
  const f = fileImportJson.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{
    try {
      const list = JSON.parse(r.result);
      if(!Array.isArray(list)) throw new Error('الملف غير متوافق');
      if(!confirm('تم العثور على ' + list.length + ' سجل. هل تريد دمج السجلات مع البيانات الحالية؟')) return;
      const map = new Map();
      students.forEach(s=>map.set(s.id, s));
      list.forEach(s=>{ if(s && s.id && s.fields) map.set(s.id, s); });
      students = Array.from(map.values());
      localStorage.setItem(DB_KEY, JSON.stringify(students));
      updateStudentCounter();
      if(students.length) selectStudent(students[0].id);
      notify('تم استيراد ' + list.length + ' سجل بنجاح');
    } catch(err){
      alert('خطأ في استيراد ملف النسخ الاحتياطي: ' + err.message);
    }
  };
  r.readAsText(f);
  fileImportJson.value = '';
};
function exportExcelCsv(){
  let csv = '\\uFEFFالرقم التعريفي,اسم الطالب,الاسم الأول,اسم الأب,اسم الجد,اللقب,اسم الأم,الميلاد,الهاتف,المحافظة\\r\\n';
  students.forEach(s=>{
    const f = s.fields || {};
    const row = [s.id, s.studentName, f.n1||'', f.n2||'', f.n3||'', f.n5||'', f.m1||'', s.birthDate||'', f.tel||'', f.a1||f.s_bn||''];
    csv += row.map(v=>'"'+String(v).replace(/"/g, '""')+'"').join(',') + '\\r\\n';
  });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
  downloadBlob(blob, 'emis_students_excel_' + new Date().toISOString().split('T')[0] + '.csv');
  notify('تم تصدير ملف Excel بنجاح');
}
function downloadBlob(blob, filename){
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(u), 1000);
}
window.addEventListener('keydown', (e)=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){ e.preventDefault(); doSaveCurrent(); }
  else if((e.ctrlKey||e.metaKey)&&e.key==='p'){ e.preventDefault(); window.print(); }
});
`;

enhanced = enhanced.replace(oldScriptStart, enhancedScript);

// Fix the PDF download function to use standard browser downloads (no claude.use dependency)
enhanced = enhanced.replace(
  /async function pdf\(\)[\s\S]*?finally\{btn\.disabled=false\}\}/,
  `async function pdf(){
  const btn = document.getElementById('pdfb');
  btn.disabled = true;
  notify('جاري إنشاء ملف PDF فائق الدقة...');
  try {
    const S = 2.5, cv = document.createElement('canvas');
    cv.width = W * S; cv.height = H * S;
    const x = cv.getContext('2d');
    const bg = getComputedStyle(sh).backgroundImage.replace(/^url\\(["']?/,'').replace(/["']?\\)$/,'');
    x.fillStyle = '#fff'; x.fillRect(0,0,cv.width,cv.height);
    x.drawImage(await ld(bg), 0, 0, W*S, H*S);
    x.scale(S, S);
    if(phURL){
      const im = await ld(phURL), [a,b,c,d] = PH, w = c - a, h = d - b, r = Math.max(w/im.width, h/im.height), sw = w/r, sh2 = h/r;
      x.drawImage(im, (im.width-sw)/2, (im.height-sh2)/2, sw, sh2, a, b, w, h);
    }
    x.fillStyle = '#000'; x.strokeStyle = '#000'; x.textBaseline = 'middle';
    T.forEach(([k,a,b,c,d])=>{
      const el = sh.querySelector('[data-k="'+k+'"]'), v = (el?.value || '').trim();
      if(!v) return;
      const r = lay(k,v); x.font = 'bold ' + r.size + 'px ' + FS;
      const ar = /[\\u0600-\\u06FF]/.test(v), ctr = /^d[123]$/.test(k);
      x.direction = ctr ? 'ltr' : ar ? 'rtl' : 'ltr';
      x.textAlign = ctr ? 'center' : ar ? 'right' : 'left';
      const px = ctr ? (a+c)/2 : ar ? c - 4 : a + 4, lh = r.size * 1.15, n = r.lines.length;
      r.lines.forEach((l,i)=>x.fillText(l, px, (b+d)/2 - n*lh/2 + lh/2 + i*lh));
    });
    x.lineWidth = 3.5; x.lineJoin = 'round';
    C.forEach(([k,g,a,b,c,d])=>{ if(sh.querySelector('[data-k="'+k+'"]')?.checked) tick(x,a,b,c-a,d-b); });
    K.forEach(([k,g,a,b,c,d])=>{
      if(sh.querySelector('[data-k="'+k+'"]')?.checked){
        x.lineWidth = 3; x.strokeRect(a+2,b+2,c-a-4,d-b-4); tick(x,a+6,b+(d-b)/2-12,24,24);
      }
    });
    const blob = await new Promise(r=>cv.toBlob(r, 'image/jpeg', 0.95));
    const jpg = new Uint8Array(await blob.arrayBuffer());
    const nm = (computeFullName() || 'طالب').replace(/[\\\\/:*?"<>|]/g, '-');
    downloadBlob(mkpdf(jpg, cv.width, cv.height), 'استمارة-EMIS-' + nm + '.pdf');
    notify('تم تصدير ملف PDF بنجاح!');
  } catch(e) {
    alert('تعذر إنشاء PDF: ' + (e?.message || e));
  } finally {
    btn.disabled = false;
  }
}`
);

// Add init logic at the end of the script
enhanced = enhanced.replace(
  'fitAll();',
  `fitAll();
if(students.length){
  const found = students.find(s=>s.id === currentStudentId) || students[0];
  currentStudentId = found.id;
  setFormState(found.fields, found.photoURL);
} else {
  doNewStudent();
}
updateStudentCounter();
`
);

// Save standalone file
fs.writeFileSync('public/استمارة معلومات الطلاب والتلاميذ EMIS.html', enhanced, 'utf8');
fs.writeFileSync('public/assets/aistudio/_________________________________EMIS_1ca48110.html', enhanced, 'utf8');
console.log('Standalone HTML built successfully.');
