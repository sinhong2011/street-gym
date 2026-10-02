export type MoveKey = "push" | "squat" | "pull" | "leg" | "bridge" | "hs";

export type QuizItem = {
  key: MoveKey;
  test: string;
  options: { label: string; step: number }[];
};

/** One test per movement; each answer is the Convict Conditioning step to start training at. */
export const QUIZ: QuizItem[] = [
  {
    key: "push",
    test: "連續做標準俯臥撐：雙手與肩同寬、身體一直線、胸口下到離地一拳。做到動作變形就停。",
    options: [
      { label: "連牆壁俯臥撐都吃力", step: 1 },
      { label: "標準 0 下，跪姿不到 5 下", step: 2 },
      { label: "標準 0 下，跪姿 5–15 下", step: 3 },
      { label: "標準 1–9 下", step: 4 },
      { label: "標準 10–29 下", step: 5 },
      { label: "標準 30 下以上", step: 6 },
      { label: "窄距俯臥撐 20 下以上", step: 7 },
    ],
  },
  {
    key: "squat",
    test: "雙腳與肩同寬，蹲到大腿後側貼住小腿、腳跟不離地，再站起。",
    options: [
      { label: "從椅子站起都要用手撐", step: 1 },
      { label: "要扶著東西才能蹲到底", step: 3 },
      { label: "半蹲可以，全蹲會失去平衡", step: 4 },
      { label: "全蹲 10–39 下", step: 5 },
      { label: "全蹲 40 下以上", step: 6 },
      { label: "扶著東西能做單腿深蹲", step: 9 },
    ],
  },
  {
    key: "pull",
    test: "正握單槓，從手臂完全伸直開始，把下巴拉過槓，不擺盪、不踢腿。",
    options: [
      { label: "懸垂不到 15 秒", step: 1 },
      { label: "能做水平引體，引體 0 下", step: 2 },
      { label: "水平引體 15 下以上，引體 0 下", step: 3 },
      { label: "引體 1–2 下", step: 4 },
      { label: "引體 3–9 下", step: 5 },
      { label: "引體 10 下以上", step: 6 },
      { label: "引體 15 下以上，窄握也可以", step: 7 },
    ],
  },
  {
    key: "leg",
    test: "仰臥，雙腿伸直併攏，舉到與地面垂直再慢慢放下，下背保持貼地。",
    options: [
      { label: "平臥抬膝都很吃力", step: 1 },
      { label: "平臥直舉腿不到 10 下", step: 3 },
      { label: "平臥直舉腿 10–19 下", step: 5 },
      { label: "平臥直舉腿 20 下以上，能懸垂 30 秒", step: 6 },
      { label: "懸垂屈膝 15 下以上", step: 7 },
      { label: "懸垂直腿舉到水平 10 下", step: 9 },
    ],
  },
  {
    key: "bridge",
    test: "仰臥屈膝，手掌放在耳旁，試著把身體推成拱形。有下背痛史請從第一個選項開始。",
    options: [
      { label: "躺著把臀部抬起都吃力", step: 1 },
      { label: "短橋輕鬆，能做直橋", step: 3 },
      { label: "能用頭頂撐起拱橋", step: 5 },
      { label: "能推起標準橋 1–14 下", step: 6 },
      { label: "標準橋 15 下以上", step: 7 },
    ],
  },
  {
    key: "hs",
    test: "面向牆，雙手撐地踢腿上牆倒立。沒把握請在軟墊上、有人在旁時嘗試。",
    options: [
      { label: "還不能做頭倒立", step: 1 },
      { label: "靠牆頭倒立 30 秒以上", step: 2 },
      { label: "烏鴉式 30 秒以上", step: 3 },
      { label: "靠牆倒立 60 秒以上", step: 4 },
      { label: "靠牆倒立撐 1–9 下", step: 5 },
      { label: "靠牆倒立撐 10 下以上", step: 6 },
    ],
  },
];
