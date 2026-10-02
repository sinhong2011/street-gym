export const PRINCIPLES = [
  {
    no: "01",
    title: "槓桿就是你的槓鈴片",
    en: "Leverage over load",
    body: "徒手訓練不靠加重，而是改變身體角度、支點距離、單側負荷與動作幅度。牆壁俯臥撐到單臂俯臥撐，同一個動作，負荷可以相差數倍。",
  },
  {
    no: "02",
    title: "漸進超負荷，小步而持續",
    en: "Progressive overload",
    body: "每次只改變一個變量：多一次、多一組、慢一秒、換更難一級。達到「升級標準」才前進，未達標就留在原地把次數做滿。",
  },
  {
    no: "03",
    title: "每週 10–20 組，接近力竭",
    en: "Volume & proximity",
    body: "肌肥大的有效訓練量約為每肌群每週 10–20 組，每組保留 1–3 次（RIR 1–3）。力量目標用 3–8 次的困難變式，肌耐力再往上加次數。",
  },
  {
    no: "04",
    title: "每個肌群每週練 2–3 次",
    en: "Frequency",
    body: "把同樣的總量分散到 2–3 天，比一天練完更有效。全身訓練一週三次（一三五）是初學者最穩的結構。",
  },
  {
    no: "05",
    title: "肌腱比肌肉慢",
    en: "Connective tissue lags",
    body: "肌肉幾週就有適應，肌腱與韌帶需要數月。前水平、俄挺等直臂技術（SAS）從短時間、低量開始，手肘與手腕的疼痛是減量訊號，不是勳章。",
  },
  {
    no: "06",
    title: "技巧先練，力量後練",
    en: "Skill before fatigue",
    body: "倒立、雙力臂轉換這類神經技巧放在熱身後、疲勞前。力量動作用超級組配對（推＋拉），組間休息 2–3 分鐘。睡眠 7–9 小時，蛋白質每公斤體重 1.6–2.2 g。",
  },
];

/** Approximate share of bodyweight on the hands for push-up variants (force-plate estimates, rounded). */
export const LEVERAGE = [
  { key: "wall", zh: "牆壁", angle: 72, load: 20 },
  { key: "incline", zh: "上斜", angle: 45, load: 41 },
  { key: "knee", zh: "跪姿", angle: 36, load: 49, knees: true },
  { key: "full", zh: "標準", angle: 18, load: 64 },
  { key: "decline", zh: "下斜", angle: -12, load: 74 },
];

export type Movement = {
  key: string;
  glyph: string;
  zh: string;
  en: string;
  demo: string;
  muscles: string;
};

// 《囚徒健身》(Convict Conditioning, Paul "Coach" Wade): six movements × ten progressive steps.
export const BIG_SIX: Movement[] = [
  {
    key: "push",
    glyph: "推",
    zh: "俯臥撐",
    en: "Push-up",
    demo: "pushup",
    muscles: "胸大肌 · 三角肌前束 · 肱三頭",
  },
  {
    key: "squat",
    glyph: "蹲",
    zh: "深蹲",
    en: "Squat",
    demo: "squat",
    muscles: "股四頭 · 臀大肌 · 腿後側",
  },
  {
    key: "pull",
    glyph: "拉",
    zh: "引體向上",
    en: "Pull-up",
    demo: "pullup",
    muscles: "背闊肌 · 菱形肌 · 肱二頭",
  },
  {
    key: "leg",
    glyph: "舉",
    zh: "舉腿",
    en: "Leg Raise",
    demo: "legraise",
    muscles: "腹直肌 · 髂腰肌 · 握力",
  },
  {
    key: "bridge",
    glyph: "橋",
    zh: "橋",
    en: "Bridge",
    demo: "bridge",
    muscles: "豎脊肌 · 臀部 · 胸椎活動度",
  },
  {
    key: "hs",
    glyph: "倒",
    zh: "倒立撐",
    en: "Handstand Push-up",
    demo: "hspu",
    muscles: "三角肌 · 斜方肌 · 肱三頭",
  },
];

export const PHASES = [
  {
    span: "第 0–4 週",
    name: "地基",
    en: "Foundation",
    focus: "學會動作模式，讓關節習慣負荷。每週 3 次全身，每次 45 分鐘內。",
    goals: ["上斜俯臥撐 3×12", "澳式划船 3×10", "徒手深蹲 3×20", "主動懸垂 30 秒", "平板支撐 45 秒"],
  },
  {
    span: "第 1–3 月",
    name: "標準動作",
    en: "Standards",
    focus: "解鎖六藝第五步：標準俯臥撐、標準引體、標準深蹲。開始靠牆倒立。",
    goals: ["標準俯臥撐 ×20", "標準引體 ×5", "雙槓臂屈伸 ×8", "懸垂屈膝 ×12", "靠牆倒立 30 秒"],
  },
  {
    span: "第 3–9 月",
    name: "力量建構",
    en: "Strength",
    focus: "用困難變式把次數壓在 5–8 次。加入直臂訓練與第一次雙力臂嘗試。",
    goals: ["引體向上 ×12", "臂屈伸 ×15", "L 型支撐 15 秒", "輔助手槍蹲 ×8", "團身前水平 10 秒"],
  },
  {
    span: "第 9–18 月",
    name: "技能解鎖",
    en: "Skills",
    focus: "技巧放在每次訓練開頭。單側動作進入計劃：偏重、單臂半程。",
    goals: ["雙力臂 ×3", "自由倒立 30 秒", "後水平", "進階團身前水平", "人體旗幟（屈膝）"],
  },
  {
    span: "18 個月 +",
    name: "神技",
    en: "Mastery",
    focus: "以年為單位的長期項目。週期化：技能塊、力量塊、減量週輪替。",
    goals: ["全前水平", "單臂引體", "俄挺（跨腿）", "90° 俯臥撐", "槓上動態連擊"],
  },
];

export const SESSION = [
  { part: "熱身與活動度", min: 10, note: "手腕、肩胛、髖關節" },
  { part: "技巧練習", min: 15, note: "倒立 / 槓桿 · 不力竭" },
  { part: "力量超級組", min: 35, note: "推＋拉 · 腿＋核心" },
  { part: "收操", min: 5, note: "伸展 · 呼吸" },
];

export const WEEK = [
  { d: "一", t: "全身 A", k: "train" },
  { d: "二", t: "休息 / 散步", k: "rest" },
  { d: "三", t: "全身 B", k: "train" },
  { d: "四", t: "活動度", k: "mobility" },
  { d: "五", t: "全身 A", k: "train" },
  { d: "六", t: "技巧 · 輕量", k: "skill" },
  { d: "日", t: "休息", k: "rest" },
] as const;

export type Skill = {
  id: string;
  tier: number;
  requires: string[];
  time: string;
  cues: string[];
  mistake: string;
};

export const SKILLS: Skill[] = [
  {
    id: "lsit",
    tier: 1,
    requires: ["雙槓撐體 30 秒", "平臥直舉腿 ×15"],
    time: "1–3 個月",
    cues: ["肩膀下壓，遠離耳朵", "膝蓋鎖死，腳尖繃直", "先練單腿伸直 L"],
    mistake: "聳肩、膝蓋微彎卻以為做到了",
  },
  {
    id: "handstand",
    tier: 2,
    requires: ["靠牆倒立 60 秒", "肩屈曲 180°"],
    time: "6–12 個月",
    cues: ["推地，肩膀頂到耳朵", "用手指和掌根修正平衡", "肋骨內收，身體一直線"],
    mistake: "塌腰成香蕉型、只靠肩膀硬撐",
  },
  {
    id: "muscleup",
    tier: 2,
    requires: ["引體 ×10–12", "雙槓臂屈伸 ×15", "胸碰槓引體 ×5"],
    time: "3–9 個月",
    cues: ["拉到腰部，不是下巴", "假握（false grip）縮短轉換", "身體靠近槓，弧線向前"],
    mistake: "單手先上的雞翅膀，肩肘壓力不對稱",
  },
  {
    id: "backlever",
    tier: 3,
    requires: ["德式懸垂 30 秒", "皮翻（skin the cat）×5"],
    time: "3–9 個月",
    cues: ["胸口朝下，臀部收緊", "肘關節完全鎖直", "從團身一點點伸髖"],
    mistake: "肱二頭肌腱過度負荷：訓練量從極低開始",
  },
  {
    id: "frontlever",
    tier: 4,
    requires: ["引體 ×15", "懸垂直舉腿 ×10", "團身前水平 20 秒"],
    time: "1–2 年",
    cues: ["直臂往下壓槓，而不是拉", "骨盆後傾，臀部收緊", "團身 → 進階團身 → 單腿 → 全"],
    mistake: "屈肘偷力、髖部下垂",
  },
  {
    id: "flag",
    tier: 4,
    requires: ["倒立撐 ×3", "引體 ×12", "側棒式 60 秒"],
    time: "6–18 個月",
    cues: ["下手鎖直推，上手拉", "先練垂直旗幟（倒立在桿上）", "腹斜肌與背闊同時收緊"],
    mistake: "下手肘關節彎曲，力量線斷掉",
  },
  {
    id: "planche",
    tier: 5,
    requires: ["俄挺前傾 30 秒", "團身俄挺 20 秒", "臂屈伸 ×20"],
    time: "2–5 年",
    cues: ["肩胛前引並下壓", "肩膀越過手掌的前傾就是難度", "手指朝外或朝後，保護手腕"],
    mistake: "急於伸腿，前傾不足導致塌肩",
  },
];

export const MENTORS = [
  { name: "Chris Heria", channel: "THENX", known: "街頭健身最大品牌之一，花式技巧與系統化計劃", level: "全程", q: "THENX Chris Heria" },
  { name: "Hampton Liu", channel: "Hybrid Calisthenics", known: "從零開始的友善教學，進度示範真實、心態正向", level: "入門", q: "Hybrid Calisthenics" },
  { name: "Daniel Vadnal", channel: "FitnessFAQs", known: "以運動科學拆解倒立、槓桿與手腕肩部健康", level: "進階", q: "FitnessFAQs" },
  { name: "Sven & Alex", channel: "Calisthenicmovement", known: "清晰的動作教程與循序漸進的訓練計劃", level: "入門 → 中階", q: "Calisthenicmovement" },
  { name: "Antranik Kizirian", channel: "Antranik", known: "活動度與 r/bodyweightfitness 推薦課表的實戰講解", level: "入門", q: "Antranik bodyweight" },
  { name: "Hannibal for King", channel: "傳奇", known: "紐約街頭單槓的先驅，早期病毒影片帶動整個運動", level: "靈感", q: "Hannibal for King street workout" },
];

export const READING = [
  { title: "《囚徒健身》", by: "Paul \"Coach\" Wade", note: "六藝十式的漸進框架" },
  { title: "Overcoming Gravity", by: "Steven Low", note: "徒手體操式力量訓練的教科書" },
  { title: "Recommended Routine", by: "r/bodyweightfitness", note: "社群維護的免費入門課表" },
];

// ---------------- 肌肉地圖 ----------------

export type Seg = "torsoUpper" | "torsoLower" | "upperArm" | "foreArm" | "thigh" | "shin" | "shoulder" | "hip";
export type Muscle = { key: string; zh: string; en: string; seg: Seg; side: "front" | "back" | "both"; does: string; cue: string };

export const MUSCLES: Muscle[] = [
  { key: "chest", zh: "胸大肌", en: "Pectorals", seg: "torsoUpper", side: "front", does: "把手臂往身體前方合攏、推離身體。", cue: "俯臥撐時想像把地板向兩手中間「擠」，胸肌參與更多。" },
  { key: "delts", zh: "三角肌", en: "Deltoids", seg: "shoulder", side: "both", does: "包住肩關節，負責把手臂舉向前、側、後。", cue: "倒立與俄挺的核心肌群；推舉時肩膀主動頂向耳朵。" },
  { key: "triceps", zh: "肱三頭肌", en: "Triceps", seg: "upperArm", side: "back", does: "伸直手肘；長頭也協助手臂向後下壓。", cue: "窄距俯臥撐、臂屈伸、倒立撐的鎖肘階段。" },
  { key: "biceps", zh: "肱二頭肌", en: "Biceps", seg: "upperArm", side: "front", does: "彎曲手肘、旋轉前臂。直臂技術中承受大量張力。", cue: "後水平、俄挺的直臂張力要循序漸進，肌腱需要時間。" },
  { key: "forearm", zh: "前臂與握力", en: "Forearms & Grip", seg: "foreArm", side: "both", does: "握緊、穩定手腕。所有懸垂動作的第一道關卡。", cue: "主動懸垂、假握練習；手腕熱身每次都要做。" },
  { key: "lats", zh: "背闊肌", en: "Latissimus Dorsi", seg: "torsoUpper", side: "back", does: "把手臂從頭上往下拉向身體，是人體最大的拉肌。", cue: "引體時想像「把手肘塞進後口袋」，不是用手拉。" },
  { key: "upperback", zh: "斜方肌與菱形肌", en: "Traps & Rhomboids", seg: "shoulder", side: "back", does: "控制肩胛骨的上提、下沉、後收與前引。", cue: "每個拉的動作從肩胛下沉後收開始；肩胛控制決定肩膀壽命。" },
  { key: "core", zh: "腹部與核心", en: "Abs & Obliques", seg: "torsoLower", side: "front", does: "穩定軀幹、控制骨盆，把手腳的力量串成一條線。", cue: "骨盆後傾（肚臍拉向脊椎），平板、L 撐、前水平都靠它。" },
  { key: "erectors", zh: "豎脊肌", en: "Spinal Erectors", seg: "torsoLower", side: "back", does: "沿脊椎兩側，伸展並保護脊椎。", cue: "橋系列是它的主場；久坐族群最需要的一式。" },
  { key: "glutes", zh: "臀大肌", en: "Glutes", seg: "hip", side: "back", does: "伸髖、穩定骨盆，是跑跳與深蹲的引擎。", cue: "深蹲站起時「把地板推開」並夾臀；橋與後水平也要夾臀。" },
  { key: "quads", zh: "股四頭肌", en: "Quadriceps", seg: "thigh", side: "front", does: "伸直膝蓋。也在 L 撐中鎖住膝關節。", cue: "單腿深蹲是徒手腿部力量的終點。" },
  { key: "hams", zh: "腿後肌群", en: "Hamstrings", seg: "thigh", side: "back", does: "屈膝與伸髖，同時是柔軟度的瓶頸。", cue: "直腿舉腿與 L 撐需要它的柔軟度；可搭配北歐挺身強化。" },
  { key: "calves", zh: "小腿", en: "Calves", seg: "shin", side: "back", does: "踮腳、推蹬、落地緩衝。", cue: "跳躍類 HIIT 的避震器；單腿提踵很容易在家練。" },
];

/** primary ● / secondary ○ per movement (Big Six + skills). */
export const MOVE_MUSCLES: { id: string; zh: string; p: string[]; s: string[] }[] = [
  { id: "pushup", zh: "推", p: ["chest", "triceps", "delts"], s: ["core"] },
  { id: "squat", zh: "蹲", p: ["quads", "glutes"], s: ["hams", "calves", "core"] },
  { id: "pullup", zh: "拉", p: ["lats", "biceps"], s: ["upperback", "forearm", "core"] },
  { id: "legraise", zh: "舉", p: ["core"], s: ["forearm", "lats", "quads"] },
  { id: "bridge", zh: "橋", p: ["erectors", "glutes"], s: ["hams", "delts", "triceps"] },
  { id: "hspu", zh: "倒", p: ["delts", "triceps"], s: ["upperback", "core"] },
  { id: "lsit", zh: "L撐", p: ["core", "quads"], s: ["triceps", "upperback"] },
  { id: "handstand", zh: "倒立", p: ["delts"], s: ["upperback", "forearm", "core"] },
  { id: "muscleup", zh: "雙力臂", p: ["lats", "chest", "triceps"], s: ["biceps", "forearm", "core"] },
  { id: "backlever", zh: "後水平", p: ["lats", "chest", "biceps"], s: ["core", "erectors", "glutes"] },
  { id: "frontlever", zh: "前水平", p: ["lats", "core"], s: ["upperback", "triceps", "glutes"] },
  { id: "flag", zh: "旗幟", p: ["core", "lats", "delts"], s: ["forearm", "glutes"] },
  { id: "planche", zh: "俄挺", p: ["delts", "chest"], s: ["core", "biceps", "triceps"] },
];

// ---------------- 心肺 ----------------

export const ZONES = [
  { z: "Z1", zh: "恢復", lo: 0.5, hi: 0.6, talk: "輕鬆散步" },
  { z: "Z2", zh: "有氧基礎", lo: 0.6, hi: 0.7, talk: "能說完整句子" },
  { z: "Z3", zh: "節奏", lo: 0.7, hi: 0.8, talk: "只能說短句" },
  { z: "Z4", zh: "閾值", lo: 0.8, hi: 0.9, talk: "只能說幾個字" },
  { z: "Z5", zh: "HIIT", lo: 0.9, hi: 1, talk: "說不出話" },
];

export const CARDIO_PLAN = [
  { k: "Zone 2", freq: "每週 2–3 次", dose: "30–45 分鐘", what: "快走、慢跑、單車、跳繩慢速", why: "建立有氧底子，組間恢復更快，也最不影響力量訓練。" },
  { k: "HIIT", freq: "每週 1–2 次", dose: "10–20 分鐘", what: "波比跳、登山者、深蹲跳、高抬腿", why: "時間效率高、提升最大攝氧量；疲勞大，不要排在技巧日或腿日前一天。" },
];

export type HiitPreset = { key: string; zh: string; work: number; rest: number; rounds: number; note: string };
export const HIIT_PRESETS: HiitPreset[] = [
  { key: "starter", zh: "入門 30/30", work: 30, rest: 30, rounds: 8, note: "8 分鐘 · 先求動作完整" },
  { key: "tabata", zh: "Tabata 20/10", work: 20, rest: 10, rounds: 8, note: "4 分鐘 · 全力衝刺" },
  { key: "4020", zh: "40/20 × 12", work: 40, rest: 20, rounds: 12, note: "12 分鐘 · 三輪四動作" },
];
export const HIIT_MOVES = ["burpee", "climber", "jumpsquat", "highknees"];

// ---------------- 飲食 ----------------

export const GOALS = [
  { key: "cut", zh: "減脂", kcal: -400, protein: 2.2, rate: "每週約減 0.5–1% 體重" },
  { key: "keep", zh: "維持 / 重組", kcal: 0, protein: 1.8, rate: "體重持平，力量持續進步" },
  { key: "bulk", zh: "精實增肌", kcal: 250, protein: 1.8, rate: "每週約增 0.25–0.5% 體重" },
] as const;

export const ACTIVITY = [
  { k: 1.375, zh: "每週訓練 1–3 次" },
  { k: 1.55, zh: "每週訓練 3–5 次" },
  { k: 1.725, zh: "每週訓練 6–7 次" },
];

/** Approximate protein per typical serving (cooked weights). */
export const FOODS = [
  { zh: "雞胸肉", amt: "150 g", p: 46 },
  { zh: "鮭魚", amt: "120 g", p: 25 },
  { zh: "乳清蛋白", amt: "1 匙", p: 24 },
  { zh: "希臘優格", amt: "200 g", p: 19 },
  { zh: "板豆腐", amt: "200 g", p: 16 },
  { zh: "雞蛋", amt: "2 顆", p: 13 },
  { zh: "毛豆", amt: "100 g", p: 11 },
  { zh: "牛奶", amt: "300 ml", p: 10 },
];

export const FUEL_RULES = [
  { k: "蛋白質", v: "1.6–2.2 g / kg", d: "分 3–5 餐，每餐約 0.3–0.4 g/kg（多數人 25–40 g）。減脂期取高值保住肌肉。" },
  { k: "碳水", v: "3–5 g / kg", d: "訓練日的主要燃料。訓練前 1–3 小時吃一餐含碳水的正餐。" },
  { k: "脂肪", v: "≥ 0.6 g / kg", d: "不低於總熱量 20%，維持荷爾蒙與脂溶性維生素吸收。" },
  { k: "水分", v: "30–35 ml / kg", d: "另外補足訓練流失；尿液淡黃是最簡單的指標。" },
];

export const SUPPLEMENTS = [
  { k: "肌酸（一水）", v: "每天 3–5 g", d: "證據最充分的補充品，對力量與爆發力有幫助，不需要循環。" },
  { k: "咖啡因", v: "3–6 mg / kg", d: "訓練前 30–60 分鐘；下午後避免以免影響睡眠。" },
  { k: "維生素 D", v: "依抽血結果", d: "少曬太陽的族群常見不足，先檢測再補。" },
  { k: "乳清蛋白", v: "方便，非必要", d: "只是食物的便利替代，飲食已足量就不需要。" },
];

// ---------------- 熱身與防傷 ----------------

export const WARMUP_FLOW: { zh: string; dose: string; sec: number; ex?: string; how: string }[] = [
  { zh: "手臂繞環", dose: "前後各 30 秒", sec: 60, ex: "armcircle", how: "由小圈到大圈，肩膀放鬆不聳肩。" },
  { zh: "手腕四方向", dose: "60 秒", sec: 60, how: "跪姿雙手撐地，指尖朝前、朝外、朝後、手背貼地，各輕輕前後搖擺 15 秒。" },
  { zh: "腿擺盪", dose: "每腿 10 下", sec: 45, ex: "legswing", how: "扶牆單腿站立，另一腿前後擺盪，幅度逐漸加大。" },
  { zh: "髖鉸鏈", dose: "10 下", sec: 40, ex: "hinge", how: "膝蓋微彎，臀部向後推到腿後側有拉伸感，再夾臀站直。" },
  { zh: "弓步伸展", dose: "每側 5 下", sec: 60, ex: "lunge", how: "後膝下沉、雙手上舉，伸展後腳的髖屈肌。" },
  { zh: "深蹲停留", dose: "45 秒", sec: 45, ex: "squathold", how: "蹲到底，手肘撐開膝蓋，重心左右緩慢搖擺。" },
  { zh: "平板 ↔ 下犬式", dose: "8 下", sec: 50, ex: "downdog", how: "從平板把臀部推高成倒 V，肩膀與小腿後側同時伸展。" },
  { zh: "當日第一個動作", dose: "簡單版 2 組", sec: 60, how: "例如今天練標準俯臥撐，就先做 2 組上斜俯臥撐。" },
];

export type Hotspot = {
  key: string;
  zh: string;
  view: "front" | "back";
  x: number;
  y: number;
  cause: string;
  prevent: string;
  warn: string;
};

/** Coordinates are on the anatomy canvas (right half; drawn on both sides). */
export const HOTSPOTS: Hotspot[] = [
  { key: "wrist", zh: "手腕", view: "front", x: 177, y: 274, cause: "俯臥撐、倒立、俄挺讓手腕長時間在極度伸展下負重。", prevent: "每次熱身做手腕四方向；倒立與俄挺的量慢慢加；疼痛時改用拳頭或伏地挺身握把。", warn: "掌根外側刺痛、腫脹，或旋轉手腕時卡住。" },
  { key: "elbow", zh: "手肘", view: "back", x: 162, y: 198, cause: "引體與雙力臂的高訓練量；後水平、俄挺等直臂技術拉扯二頭肌腱。", prevent: "輪替握法；加入反向腕彎舉；直臂訓練從每週極低量開始，以月為單位增加。", warn: "肘內側或外側骨點壓痛、提重物時痛。" },
  { key: "shoulder", zh: "肩膀", view: "front", x: 152, y: 104, cause: "臂屈伸下得太深、倒立撐、雙力臂轉換，以及推多拉少的不平衡。", prevent: "拉的組數不少於推；每週做彈力帶外旋與肩胛俯臥撐；每個拉的動作從肩胛下沉開始。", warn: "手舉過頭時夾痛、夜間側睡痛、無力感。" },
  { key: "lowback", zh: "下背", view: "back", x: 100, y: 214, cause: "橋式進度太快；舉腿時骨盆前傾、腰離地；深蹲底部塌腰。", prevent: "從短橋開始；舉腿全程保持骨盆後傾（下背貼地）；用髖鉸鏈學會分辨髖與腰的動作。", warn: "痛感放射到臀部或腿、麻木或無力——請先就醫。" },
  { key: "knee", zh: "膝蓋", view: "front", x: 132, y: 344, cause: "跳躍落地時膝蓋內扣；還沒有足夠力量就練單腿深蹲。", prevent: "膝蓋對準第二、三根腳趾；落地屈膝屈髖吸收；先把深蹲系列練到第六式再碰單腿。", warn: "髕骨下方刺痛、上下樓梯痛、膝蓋卡住或腫。" },
];

export const PAIN_LIGHT = [
  { k: "green", zh: "綠燈", r: "0–2 / 10", d: "肌肉痠、可以忽略的不適。照常訓練。" },
  { k: "yellow", zh: "黃燈", r: "3–5 / 10", d: "關節有感但隔天會消退。減少組數、縮小幅度，或退回上一式。" },
  { k: "red", zh: "紅燈", r: "6+ / 10", d: "尖銳痛、關節痛、越練越痛或隔天更糟。停止該動作，持續一週請找物理治療師。" },
];

export const PREHAB = [
  { zh: "手腕負重搖擺", dose: "2 × 10 / 方向", target: "手腕" },
  { zh: "反向腕彎舉（輕）", dose: "2 × 15", target: "手肘" },
  { zh: "彈力帶肩外旋", dose: "2 × 15", target: "肩膀" },
  { zh: "肩胛俯臥撐", dose: "2 × 10", target: "肩膀" },
  { zh: "主動懸垂（肩胛下沉）", dose: "3 × 20 秒", target: "肩膀" },
  { zh: "北歐挺身離心", dose: "2 × 5", target: "膝蓋 · 腿後" },
  { zh: "單腿提踵", dose: "2 × 15", target: "腳踝 · 小腿" },
];
