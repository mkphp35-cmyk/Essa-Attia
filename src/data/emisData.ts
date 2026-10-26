// Dimensions of the original EMIS official form
export const FORM_WIDTH = 967;
export const FORM_HEIGHT = 1375;

// Photo container coordinates: [left, top, right, bottom]
export const PHOTO_COORDS: [number, number, number, number] = [66, 35, 152, 120];

// Wrapped fields that can span multiple lines (textarea in visual sheet)
export const WRAPPED_FIELDS = ['pob', 'bp', 'a8'];

export interface FieldDefinition {
  key: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  label: string;
  category: 'personal' | 'residence' | 'identity' | 'academic' | 'address';
  type?: 'text' | 'number' | 'email' | 'tel';
  required?: boolean;
}

export const TEXT_FIELDS: FieldDefinition[] = [
  // المعلومات الشخصية للطالب
  { key: "n1", left: 752, top: 186, right: 860, bottom: 227, label: "الاسم الأول", category: "personal", required: true },
  { key: "n2", left: 555, top: 186, right: 665, bottom: 227, label: "اسم الأب", category: "personal", required: true },
  { key: "n3", left: 365, top: 186, right: 455, bottom: 227, label: "اسم الجد", category: "personal", required: true },
  { key: "n4", left: 195, top: 186, right: 290, bottom: 227, label: "اسم والد الجد", category: "personal" },
  { key: "n5", left: 15, top: 186, right: 108, bottom: 227, label: "اللقب / العشيرة", category: "personal" },
  { key: "m1", left: 752, top: 233, right: 860, bottom: 277, label: "اسم الأم", category: "personal" },
  { key: "m2", left: 555, top: 233, right: 665, bottom: 277, label: "اسم والد الأم", category: "personal" },
  { key: "m3", left: 365, top: 233, right: 475, bottom: 277, label: "جد الأم / لقبها", category: "personal" },
  { key: "d1", left: 197, top: 257, right: 258, bottom: 277, label: "سنة التولد (YYYY)", category: "personal", type: "number", required: true },
  { key: "d2", left: 264, top: 257, right: 281, bottom: 277, label: "شهر التولد (MM)", category: "personal", type: "number", required: true },
  { key: "d3", left: 288, top: 257, right: 346, bottom: 277, label: "يوم التولد (DD)", category: "personal", type: "number", required: true },
  { key: "pob", left: 15, top: 233, right: 108, bottom: 277, label: "محل الولادة", category: "personal" },
  { key: "tel", left: 560, top: 284, right: 750, bottom: 315, label: "رقم الهاتف", category: "personal", type: "tel" },
  { key: "mail", left: 15, top: 284, right: 345, bottom: 315, label: "البريد الإلكتروني", category: "personal", type: "email" },

  // وثيقة السكن
  { key: "s_bn", left: 582, top: 438, right: 758, bottom: 472, label: "المحافظة (السكن)", category: "residence" },
  { key: "s_cv", left: 404, top: 438, right: 575, bottom: 472, label: "القضاء (السكن)", category: "residence" },
  { key: "s_un", left: 192, top: 438, right: 398, bottom: 472, label: "الناحية (السكن)", category: "residence" },
  { key: "s_ot", left: 15, top: 438, right: 188, bottom: 472, label: "أخرى (السكن)", category: "residence" },
  { key: "s_co", left: 755, top: 478, right: 848, bottom: 546, label: "رقم بطاقة السكن / الوثيقة", category: "residence" },
  { key: "s_dt", left: 582, top: 478, right: 662, bottom: 510, label: "تاريخ الإصدار", category: "residence" },
  { key: "s_r1", left: 582, top: 514, right: 662, bottom: 547, label: "جهة الإصدار", category: "residence" },
  { key: "s_p1", left: 582, top: 551, right: 662, bottom: 585, label: "الرقم التمويني", category: "residence" },
  { key: "s_r2", left: 404, top: 478, right: 482, bottom: 510, label: "مركز التموين", category: "residence" },
  { key: "s_p2", left: 404, top: 514, right: 482, bottom: 547, label: "اسم الوكيل", category: "residence" },
  { key: "s_is", left: 404, top: 551, right: 482, bottom: 585, label: "رقم الوكيل", category: "residence" },
  { key: "s_fm", left: 195, top: 508, right: 398, bottom: 546, label: "عدد أفراد الأسرة", category: "residence" },
  { key: "s_on", left: 15, top: 508, right: 188, bottom: 546, label: "ملاحظات السكن", category: "residence" },

  // وثيقة التعريف الرسمية
  { key: "f_cv", left: 487, top: 640, right: 640, bottom: 672, label: "جهة الإصدار (الهوية)", category: "identity" },
  { key: "f_r", left: 487, top: 675, right: 640, bottom: 699, label: "رقم الهوية / الوطنية", category: "identity", required: true },
  { key: "f_p", left: 487, top: 702, right: 640, bottom: 725, label: "رقم الصحيفة", category: "identity" },
  { key: "f_is", left: 487, top: 727, right: 640, bottom: 750, label: "رقم السجل", category: "identity" },
  { key: "f_un", left: 195, top: 685, right: 480, bottom: 748, label: "دائرة الأحوال المدنية", category: "identity" },
  { key: "f_ot", left: 15, top: 668, right: 188, bottom: 698, label: "تاريخ الإصدار", category: "identity" },
  { key: "f_on", left: 15, top: 725, right: 188, bottom: 750, label: "ملاحظات الهوية", category: "identity" },

  // الحالة والبيانات العامة
  { key: "stat", left: 470, top: 755, right: 768, bottom: 795, label: "الحالة الاجتماعية / الصحية", category: "personal" },
  { key: "nat", left: 15, top: 757, right: 105, bottom: 795, label: "الجنسية", category: "personal" },
  { key: "bc", left: 770, top: 800, right: 865, bottom: 835, label: "رقم عقد الولادة / القيد", category: "personal" },
  { key: "bp", left: 580, top: 800, right: 650, bottom: 835, label: "جهة عقد الولادة", category: "personal" },
  { key: "ml", left: 392, top: 800, right: 455, bottom: 835, label: "لغة الأم", category: "personal" },
  { key: "bt", left: 195, top: 800, right: 292, bottom: 835, label: "فصيلة الدم", category: "personal" },
  { key: "rl", left: 15, top: 800, right: 105, bottom: 835, label: "الديانة", category: "personal" },

  // البيانات الدراسية
  { key: "sl", left: 775, top: 942, right: 855, bottom: 1018, label: "المدرسة السابقة والرمز", category: "academic" },
  { key: "cls", left: 712, top: 1065, right: 850, bottom: 1105, label: "الصف الدراسي الحالي", category: "academic", required: true },
  { key: "sec", left: 482, top: 1065, right: 595, bottom: 1105, label: "الشعبة", category: "academic" },
  { key: "ex", left: 15, top: 1065, right: 245, bottom: 1105, label: "نوع القبول / رقم الامتحان", category: "academic" },

  // العنوان الحالي بالتفصيل
  { key: "a1", left: 718, top: 1186, right: 940, bottom: 1212, label: "المحافظة", category: "address" },
  { key: "a2", left: 585, top: 1186, right: 715, bottom: 1212, label: "القضاء", category: "address" },
  { key: "a3", left: 515, top: 1186, right: 580, bottom: 1212, label: "الناحية", category: "address" },
  { key: "a4", left: 410, top: 1186, right: 510, bottom: 1212, label: "الحي / القرية", category: "address" },
  { key: "a5", left: 340, top: 1186, right: 405, bottom: 1212, label: "المحلة", category: "address" },
  { key: "a6", left: 195, top: 1186, right: 335, bottom: 1212, label: "الزقاق", category: "address" },
  { key: "a7", left: 108, top: 1186, right: 190, bottom: 1212, label: "الدار", category: "address" },
  { key: "a8", left: 15, top: 1186, right: 105, bottom: 1212, label: "أقرب نقطة دالة", category: "address" },

  // التواقيع
  { key: "sg1", left: 470, top: 1215, right: 752, bottom: 1258, label: "اسم وتوقيع ولي الأمر", category: "address" },
  { key: "sg2", left: 110, top: 1215, right: 325, bottom: 1258, label: "اسم وتوقيع مدير المدرسة والختم", category: "address" }
];

export interface CheckboxDefinition {
  key: string;
  group: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  label?: string;
}

export const CHECKBOXES: CheckboxDefinition[] = [
  { key: "f_on", group: "", left: 72, top: 556, right: 102, bottom: 584, label: "وثيقة موحدة" },
  { key: "g_m", group: "sx", left: 299, top: 761, right: 327, bottom: 789, label: "الجنس: ذكر" },
  { key: "g_f", group: "sx", left: 199, top: 761, right: 228, bottom: 789, label: "الجنس: أنثى" },
  { key: "sn0", group: "", left: 725, top: 902, right: 755, bottom: 932, label: "صف 1" },
  { key: "sn1", group: "", left: 616, top: 902, right: 646, bottom: 932, label: "صف 2" },
  { key: "sn2", group: "", left: 503, top: 902, right: 533, bottom: 932, label: "صف 3" },
  { key: "sn3", group: "", left: 391, top: 902, right: 421, bottom: 932, label: "صف 4" },
  { key: "sn4", group: "", left: 281, top: 902, right: 311, bottom: 932, label: "صف 5" },
  { key: "sn5", group: "", left: 168, top: 902, right: 198, bottom: 932, label: "صف 6" },
  { key: "sn6", group: "", left: 58, top: 902, right: 88, bottom: 932, label: "صف 7+" },
  { key: "lv0", group: "lv", left: 566, top: 990, right: 596, bottom: 1020, label: "مستوى 1" },
  { key: "lv1", group: "lv", left: 498, top: 990, right: 528, bottom: 1020, label: "مستوى 2" },
  { key: "lv2", group: "lv", left: 420, top: 990, right: 450, bottom: 1020, label: "مستوى 3" },
  { key: "lv3", group: "lv", left: 335, top: 990, right: 365, bottom: 1020, label: "مستوى 4" },
  { key: "gy", group: "gr", left: 114, top: 990, right: 144, bottom: 1020, label: "نعم" },
  { key: "gn", group: "gr", left: 39, top: 990, right: 69, bottom: 1020, label: "لا" }
];

export const HEADER_CHECKBOXES: CheckboxDefinition[] = [
  { key: "s_t1", group: "st", left: 580, top: 350, right: 760, bottom: 395, label: "بطاقة سكن" },
  { key: "s_t2", group: "st", left: 402, top: 350, right: 575, bottom: 395, label: "تأييد سكن" },
  { key: "s_t3", group: "st", left: 190, top: 350, right: 398, bottom: 395, label: "بطاقة تموينية" },
  { key: "s_t4", group: "st", left: 15, top: 350, right: 188, bottom: 395, label: "أخرى (سكن)" },
  { key: "f_t1", group: "ft", left: 485, top: 590, right: 760, bottom: 632, label: "بطاقة وطنية موحدة" },
  { key: "f_t2", group: "ft", left: 190, top: 590, right: 482, bottom: 632, label: "هوية أحوال مدنية" },
  { key: "f_t3", group: "ft", left: 15, top: 590, right: 188, bottom: 632, label: "أخرى (تعريف)" }
];

export interface StudentRecord {
  id: string; // Unique UUID
  studentName: string; // Computed or n1+n2+n3+n5
  nationalId: string; // f_r
  grade: string; // cls
  birthDate: string; // d1-d2-d3
  phone: string; // tel
  photoURL: string;
  fields: Record<string, string | boolean>;
  createdAt: number;
  updatedAt: number;
}
