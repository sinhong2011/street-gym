import { useState } from "react";
import { ACTIVITY, FOODS, GOALS } from "../content";

type Sex = "m" | "f";

const Num: React.FC<{ label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }> = ({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}) => (
  <label className="fuel-num">
    <span>{label}</span>
    <input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onBlur={() => onChange(Math.min(max, Math.max(min, value || min)))}
    />
    <em>{unit}</em>
  </label>
);

export const Fuel: React.FC = () => {
  const [sex, setSex] = useState<Sex>("m");
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(68);
  const [act, setAct] = useState(1);
  const [goalKey, setGoalKey] = useState<(typeof GOALS)[number]["key"]>("keep");

  const goal = GOALS.find((g) => g.key === goalKey)!;
  const w = Math.min(200, Math.max(30, weight || 30));
  // Mifflin–St Jeor resting energy, × activity factor.
  const bmr = 10 * w + 6.25 * (height || 150) - 5 * (age || 18) + (sex === "m" ? 5 : -161);
  const tdee = bmr * ACTIVITY[act].k;
  const kcal = Math.round((tdee + goal.kcal) / 10) * 10;
  const protein = Math.round(goal.protein * w);
  const fat = Math.round(0.8 * w);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const parts = [
    { k: "protein", zh: "蛋白質", g: protein, kcal: protein * 4 },
    { k: "carbs", zh: "碳水", g: carbs, kcal: carbs * 4 },
    { k: "fat", zh: "脂肪", g: fat, kcal: fat * 9 },
  ];
  const sum = parts.reduce((a, p) => a + p.kcal, 0) || 1;
  const perMeal = Math.round(protein / 4);

  return (
    <div className="fuel">
      <form className="fuel-form" onSubmit={(e) => e.preventDefault()} aria-label="熱量與營養素計算">
        <div className="fuel-seg" role="radiogroup" aria-label="生理性別">
          {(["m", "f"] as const).map((s) => (
            <button type="button" key={s} role="radio" aria-checked={sex === s} className={sex === s ? "on" : ""} onClick={() => setSex(s)}>
              {s === "m" ? "男" : "女"}
            </button>
          ))}
        </div>
        <div className="fuel-nums">
          <Num label="年齡" unit="歲" value={age} min={14} max={90} onChange={setAge} />
          <Num label="身高" unit="cm" value={height} min={120} max={220} onChange={setHeight} />
          <Num label="體重" unit="kg" value={weight} min={30} max={200} onChange={setWeight} />
        </div>
        <label className="fuel-select">
          <span>訓練頻率</span>
          <select value={act} onChange={(e) => setAct(Number(e.target.value))}>
            {ACTIVITY.map((a, i) => (
              <option key={a.k} value={i}>{a.zh}</option>
            ))}
          </select>
        </label>
        <div className="fuel-seg fuel-goal" role="radiogroup" aria-label="目標">
          {GOALS.map((g) => (
            <button type="button" key={g.key} role="radio" aria-checked={goalKey === g.key} className={goalKey === g.key ? "on" : ""} onClick={() => setGoalKey(g.key)}>
              {g.zh}
            </button>
          ))}
        </div>
      </form>

      <div className="fuel-out" aria-live="polite">
        <p className="eyebrow">每日目標 · {goal.rate}</p>
        <p className="fuel-kcal">
          <span>{kcal.toLocaleString()}</span>
          <em>kcal</em>
        </p>
        <p className="fuel-tdee">維持熱量約 {Math.round(tdee).toLocaleString()} kcal（基礎代謝 {Math.round(bmr).toLocaleString()}）</p>
        <div className="fuel-bar">
          {parts.map((p) => (
            <i key={p.k} className={`fb-${p.k}`} style={{ flexGrow: p.kcal / sum }} />
          ))}
        </div>
        <ul className="fuel-macros">
          {parts.map((p) => (
            <li key={p.k} className={`fm-${p.k}`}>
              <span className="fm-zh">{p.zh}</span>
              <span className="fm-g">{p.g}<small>g</small></span>
              <span className="fm-pct">{Math.round((p.kcal / sum) * 100)}%</span>
            </li>
          ))}
        </ul>
        <p className="fuel-meal">
          分 4 餐，每餐約 <b>{perMeal} g</b> 蛋白質，例如：
        </p>
        <ul className="fuel-foods">
          {FOODS.map((f) => (
            <li key={f.zh} style={{ "--fill": Math.min(1, f.p / perMeal) } as React.CSSProperties}>
              <span>{f.zh}</span>
              <span className="ff-amt">{f.amt}</span>
              <b>{f.p} g</b>
            </li>
          ))}
        </ul>
        <p className="fine">估算值，供起步參考：照計畫吃 2–3 週，依體重趨勢每次調整 100–200 kcal。食物蛋白質含量為熟重約值。有疾病或特殊飲食需求請諮詢營養師。</p>
      </div>
    </div>
  );
};
