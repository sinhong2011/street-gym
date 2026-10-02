import { useEffect, useRef, useState } from "react";
import { BIG_SIX, CARDIO_PLAN, FUEL_RULES, MENTORS, SUPPLEMENTS, PHASES, PRINCIPLES, READING, SESSION, SKILLS, WEEK } from "./content";
import { ChronoStrip, LazyPlayer, MuscleLink, useReveal } from "./components/kit";
import { Leverage } from "./components/Leverage";
import { MuscleMap } from "./components/MuscleMap";
import { HiitTimer, Zones } from "./components/Cardio";
import { Fuel } from "./components/Fuel";
import { Planner } from "./components/Planner";
import { InjuryMap, Prehab, WarmupFlow } from "./components/Warmup";
import { EXERCISES } from "./pose/exercises";
import { LIBRARY, PROGRESSIONS } from "./pose/progressions";
import { DEMO, FPS, HERO } from "./remotion/compositions";
import { ExerciseScene, type ExerciseSceneProps } from "./remotion/ExerciseScene";

// three.js + R3F live in their own chunk; the page paints before the 3D scene is downloaded.
const loadHero = () => import("./remotion/HeroScene").then((m) => ({ default: m.HeroScene }));

const NAV = [
  ["science", "原理"],
  ["six", "六藝"],
  ["muscles", "肌肉"],
  ["roadmap", "路線"],
  ["plan", "課表"],
  ["warmup", "熱身"],
  ["skills", "神技"],
  ["cardio", "心肺"],
  ["fuel", "飲食"],
  ["mentors", "導師"],
] as const;

const SectionHead: React.FC<{ no: string; zh: string; en: string; children?: React.ReactNode }> = ({ no, zh, en, children }) => (
  <header className="shead" data-reveal>
    <div className="shead-meta">
      <span className="shead-no">{no}</span>
      <span className="shead-en">{en}</span>
    </div>
    <h2 className="shead-title">{zh}</h2>
    {children && <p className="shead-lede">{children}</p>}
  </header>
);

const Demo: React.FC<{ exerciseId: string; figNo: number; className?: string }> = ({ exerciseId, figNo, className }) => {
  const ex = LIBRARY[exerciseId];
  return (
    <LazyPlayer<ExerciseSceneProps>
      className={className}
      component={ExerciseScene}
      inputProps={{ exerciseId, figNo, hud: true }}
      width={DEMO.width}
      height={DEMO.height}
      fps={FPS}
      durationInFrames={Math.round(ex.seconds * FPS * 4)}
      label={`${ex.zh}（${ex.en}）動作演示動畫`}
    />
  );
};

// ------------------------------------------------------------------

const Hero = () => (
  <section className="hero" id="top">
    <div className="hero-copy">
      <p className="kicker">
        <span>VOL.01</span> 徒手健身 · 街頭健身進階全書
      </p>
      <h1 className="hero-title">
        <span className="ln"><span>與重力</span></span>
        <span className="ln"><span>談判<em>。</em></span></span>
      </h1>
      <p className="hero-en">Your body is the barbell. Gravity sets the price.</p>
      <p className="hero-lede">
        從第一個牆壁俯臥撐，到單臂引體、前水平與俄挺。以《囚徒健身》的漸進框架為骨架，用運動科學校準訓練量，再一步步拆解街頭單槓上的每一個神技。
      </p>
      <div className="hero-cta">
        <a className="btn btn-ink" href="#roadmap">從零開始 <span aria-hidden>→</span></a>
        <a className="btn btn-line" href="#skills">看神技演示</a>
      </div>
    </div>

    <figure className="hero-stage">
      <LazyPlayer
        className="hero-player"
        lazy={loadHero}
        inputProps={{}}
        width={HERO.width}
        height={HERO.height}
        fps={FPS}
        durationInFrames={HERO.durationInFrames}
        label="三維動畫：運動員在單槓上完成雙力臂、前水平與後水平"
      />
      <figcaption>
        <span>FIG.00</span> 雙力臂 → 前水平 → 後水平 · Remotion × three.js 即時渲染
      </figcaption>
    </figure>

    <div className="hero-strip">
      <ChronoStrip exerciseId="muscleup" frames={9} from={0} to={0.5} />
      <p className="strip-cap">
        致敬 Eadweard Muybridge 的連續攝影：<b>一個雙力臂，九個瞬間。</b>
      </p>
    </div>
  </section>
);

const Marquee = () => {
  const words = ["PUSH", "推", "PULL", "拉", "SQUAT", "蹲", "LEG RAISE", "舉", "BRIDGE", "橋", "HANDSTAND", "倒"];
  const row = (
    <div className="mq-row" aria-hidden>
      {words.map((w, i) => (
        <span key={i} className={i % 2 ? "mq-zh" : ""}>{w}</span>
      ))}
    </div>
  );
  return (
    <div className="mq" role="presentation">
      <div className="mq-track">{row}{row}</div>
    </div>
  );
};

const Science = () => (
  <section className="sec" id="science">
    <SectionHead no="01" zh="不是更累，是更聰明。" en="The Science">
      徒手健身最大的誤解是「做到力竭就會變強」。真正推動進步的是可量化的漸進：槓桿、訓練量、頻率，以及給肌腱足夠時間。
    </SectionHead>

    <ol className="principles">
      {PRINCIPLES.map((p) => (
        <li key={p.no} data-reveal>
          <span className="pr-no">{p.no}</span>
          <div>
            <h3>{p.title}</h3>
            <p className="pr-en">{p.en}</p>
          </div>
          <p className="pr-body">{p.body}</p>
        </li>
      ))}
    </ol>

    <div data-reveal>
      <Leverage />
    </div>
  </section>
);

const BigSix = () => {
  const [sel, setSel] = useState(0);
  const [step, setStep] = useState(4);
  const m = BIG_SIX[sel];
  const steps = PROGRESSIONS[m.key];
  const cur = steps[step];
  const pick = (i: number) => {
    setSel(i);
    setStep(4);
  };
  return (
    <section className="sec sec-six" id="six">
      <SectionHead no="02" zh="囚徒健身 · 六藝十式" en="Convict Conditioning — The Big Six">
        Paul “Coach” Wade 在《囚徒健身》中把一切徒手力量歸結為六個動作，每個動作十個台階。達到升級標準才往上一步：慢，但幾乎不會受傷。
      </SectionHead>

      <div className="glyphs" role="tablist" aria-label="六藝">
        {BIG_SIX.map((b, i) => (
          <button
            key={b.key}
            role="tab"
            aria-selected={i === sel}
            aria-controls="six-panel"
            className={i === sel ? "on" : ""}
            onClick={() => pick(i)}
          >
            <span className="g-char">{b.glyph}</span>
            <span className="g-en">{b.en}</span>
          </button>
        ))}
      </div>

      <div className="six-panel" id="six-panel" role="tabpanel">
        <div className="six-stage">
          <Demo className="six-player frame" exerciseId={cur.ex.id} figNo={step + 1} />
          <div className="six-how">
            <span className="six-how-no">STEP {String(step + 1).padStart(2, "0")}</span>
            <p>
              <b>{cur.zh}</b>
              <span className="six-how-en">{cur.en}</span>
              {cur.how}
            </p>
            <MuscleLink exId={cur.ex.id} />
          </div>
        </div>
        <div className="ladder">
          <div className="ladder-head">
            <h3>{m.zh}</h3>
            <p>{m.muscles}</p>
          </div>
          <ol aria-label={`${m.zh}十式`}>
            {steps.map((s, i) => (
              <li key={s.ex.id} className={i === step ? "on" : ""} style={{ "--w": `${(i + 1) * 10}%` } as React.CSSProperties}>
                <button onClick={() => setStep(i)} aria-pressed={i === step}>
                  <span className="st-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="st-name">{s.zh}</span>
                  {i === step && <span className="st-tag">演示中</span>}
                </button>
                <span className="st-bar" aria-hidden />
              </li>
            ))}
          </ol>
          <p className="fine">點任何一式看動作。每一式都有三個門檻：初級、中級、升級標準。只有完成升級標準的組數與次數，才進入下一式。</p>
        </div>
      </div>
    </section>
  );
};

const Plan = () => (
  <section className="sec sec-plan" id="plan">
    <SectionHead no="05" zh="測出起點，排出課表。" en="Assessment → Program">
      六個簡單的測試，找出你在六藝中各自該從第幾式開始；再依每週能練的天數、時間和目標，產生一份可以直接照做的課表。結果會保存在這台裝置上。
    </SectionHead>
    <div data-reveal>
      <Planner />
    </div>
  </section>
);

const Warmup = () => (
  <section className="sec" id="warmup">
    <SectionHead no="06" zh="能一直練，才會一直進步。" en="Warm-up & Injury Prevention">
      徒手訓練最常見的傷不在肌肉，而在手腕、手肘和肩膀這些適應比較慢的結締組織。7 分鐘熱身、聽懂疼痛的訊號，加上每週兩三次的防傷小課表，就能避開大部分的傷。
    </SectionHead>

    <div data-reveal>
      <h3 className="sub-title">7 分鐘熱身</h3>
      <WarmupFlow />
    </div>

    <div className="inj-wrap" data-reveal>
      <h3 className="sub-title">受傷熱區</h3>
      <InjuryMap />
    </div>

    <div data-reveal>
      <Prehab />
    </div>
  </section>
);

const Muscles = () => (
  <section className="sec" id="muscles">
    <SectionHead no="03" zh="每個動作，練到哪裡。" en="Muscle Map">
      徒手訓練是「動作」而不是「肌肉」的訓練：一個引體向上同時動用背闊、二頭、前臂與核心。看懂這張表，就知道課表有沒有漏掉什麼。
    </SectionHead>
    <div data-reveal>
      <MuscleMap />
    </div>
  </section>
);

const Cardio = () => (
  <section className="sec sec-cardio" id="cardio">
    <SectionHead no="08" zh="心肺是看不見的地基。" en="Conditioning & HIIT">
      更好的有氧能力讓你組間恢復更快、一堂課練更多組。多數時間做輕鬆的 Zone 2，少量而精準地加入 HIIT。
    </SectionHead>

    <div className="cardio-top" data-reveal>
      <Zones />
      <dl className="cardio-plan">
        {CARDIO_PLAN.map((c) => (
          <div key={c.k}>
            <dt>{c.k}</dt>
            <dd className="cp-dose"><b>{c.freq}</b> · {c.dose}</dd>
            <dd className="cp-what">{c.what}</dd>
            <dd className="cp-why">{c.why}</dd>
          </div>
        ))}
      </dl>
    </div>

    <div data-reveal>
      <h3 className="sub-title">HIIT 計時器</h3>
      <HiitTimer />
      <p className="fine hiit-safety">先做 5 分鐘熱身。膝蓋或腳踝不適時，把跳躍換成低衝擊版本：深蹲跳 → 快速深蹲、波比跳 → 不跳的波比。</p>
    </div>
  </section>
);

const Nutrition = () => (
  <section className="sec" id="fuel">
    <SectionHead no="09" zh="力量是吃出來的。" en="Nutrition">
      徒手健身比的是「相對力量」：同樣的力量，體重越輕越容易。飲食的目標不是極端，而是足夠的蛋白質、穩定的熱量，以及長期做得到。
    </SectionHead>

    <div data-reveal>
      <Fuel />
    </div>

    <div className="rules" data-reveal>
      <div>
        <h3 className="sub-title">四條基本線</h3>
        <dl className="rule-list">
          {FUEL_RULES.map((r) => (
            <div key={r.k}>
              <dt>{r.k}</dt>
              <dd className="rl-v">{r.v}</dd>
              <dd className="rl-d">{r.d}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h3 className="sub-title">補充品：只有少數值得</h3>
        <dl className="rule-list">
          {SUPPLEMENTS.map((r) => (
            <div key={r.k}>
              <dt>{r.k}</dt>
              <dd className="rl-v">{r.v}</dd>
              <dd className="rl-d">{r.d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

const STORE = "street-gym:goals";
const Roadmap = () => {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORE) ?? "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(done));
    } catch {
      /* private mode: progress just won't persist */
    }
  }, [done]);

  const total = SESSION.reduce((a, s) => a + s.min, 0);
  const count = Object.values(done).filter(Boolean).length;
  const all = PHASES.reduce((a, p) => a + p.goals.length, 0);

  return (
    <section className="sec sec-road" id="roadmap">
      <SectionHead no="04" zh="從零開始的五個階段" en="Zero to Mastery">
        以月和年為刻度，而不是以天。勾選達成的里程碑，進度會保存在這台裝置上。
      </SectionHead>

      <p className="road-progress" data-reveal>
        已解鎖 <b>{count}</b> / {all}
      </p>

      <ol className="phases">
        {PHASES.map((ph, i) => (
          <li key={ph.name} data-reveal style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
            <span className="ph-node" aria-hidden />
            <p className="ph-span">{ph.span}</p>
            <h3 className="ph-name">{ph.name}</h3>
            <p className="ph-en">{ph.en}</p>
            <p className="ph-focus">{ph.focus}</p>
            <ul>
              {ph.goals.map((g) => {
                const id = `${i}:${g}`;
                return (
                  <li key={g}>
                    <label>
                      <input type="checkbox" checked={!!done[id]} onChange={(e) => setDone((d) => ({ ...d, [id]: e.target.checked }))} />
                      <span>{g}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="plan" data-reveal>
        <div>
          <h3 className="plan-title">一週結構</h3>
          <ol className="week">
            {WEEK.map((w) => (
              <li key={w.d} className={`wk-${w.k}`}>
                <span className="wk-d">{w.d}</span>
                <span className="wk-t">{w.t}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="plan-title">一堂課 · {total} 分鐘</h3>
          <div className="session">
            {SESSION.map((s) => (
              <div key={s.part} style={{ flexGrow: s.min }}>
                <span className="ss-min">{s.min}′</span>
                <span className="ss-part">{s.part}</span>
                <span className="ss-note">{s.note}</span>
              </div>
            ))}
          </div>
          <p className="fine">全身 A：俯臥撐系列 + 引體系列 + 深蹲系列 + 舉腿。全身 B：倒立撐系列 + 划船 / 引體 + 橋 + 單腿動作。</p>
        </div>
      </div>
    </section>
  );
};

const Skills = () => {
  const [sel, setSel] = useState(2);
  const s = SKILLS[sel];
  const ex = EXERCISES[s.id];
  return (
    <section className="sec sec-skills" id="skills">
      <SectionHead no="07" zh="街頭神技" en="Street Workout Skills">
        單槓上的每一個神技，都是前面基礎動作的延伸。難度以五級標示，先滿足前置條件，再談技巧。
      </SectionHead>

      <div className="skills">
        <ul className="sk-list">
          {SKILLS.map((k, i) => {
            const e = EXERCISES[k.id];
            const open = i === sel;
            return (
              <li key={k.id} className={open ? "open" : ""}>
                <button onClick={() => setSel(i)} aria-expanded={open}>
                  <span className="sk-tier" aria-label={`難度 ${k.tier} / 5`}>
                    {Array.from({ length: 5 }, (_, n) => (
                      <i key={n} className={n < k.tier ? "f" : ""} />
                    ))}
                  </span>
                  <span className="sk-zh">{e.zh}</span>
                  <span className="sk-en">{e.en}</span>
                  <span className="sk-time">{k.time}</span>
                </button>
                <div className="sk-body">
                  <div>
                    <dl>
                      <dt>前置條件</dt>
                      <dd>{k.requires.join(" · ")}</dd>
                      <dt>技術要點</dt>
                      <dd>
                        <ol>{k.cues.map((c) => <li key={c}>{c}</li>)}</ol>
                      </dd>
                      <dt>常見錯誤</dt>
                      <dd>{k.mistake}</dd>
                    </dl>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="sk-stage">
          <Demo className="frame" exerciseId={ex.id} figNo={7 + sel} />
          <ChronoStrip key={ex.id} className="chrono-sm" exerciseId={ex.id} frames={6} from={0} to={0.5} />
          <MuscleLink exId={ex.id} />
        </div>
      </div>
    </section>
  );
};

const Mentors = () => (
  <section className="sec" id="mentors">
    <SectionHead no="10" zh="跟著誰學" en="Mentors on YouTube">
      免費、公開、而且多年持續更新。挑一位節奏適合你的老師，比收藏一百支影片更重要。
    </SectionHead>
    <ul className="mentors">
      {MENTORS.map((m) => (
        <li key={m.name} data-reveal>
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(m.q)}`} target="_blank" rel="noreferrer">
            <span className="mt-ch">{m.channel}</span>
            <span className="mt-name">{m.name}</span>
            <span className="mt-known">{m.known}</span>
            <span className="mt-lv">{m.level}</span>
            <span className="mt-go" aria-hidden>↗</span>
          </a>
        </li>
      ))}
    </ul>

    <div className="reading" data-reveal>
      <h3>延伸閱讀</h3>
      <ul>
        {READING.map((r) => (
          <li key={r.title}>
            <b>{r.title}</b>
            <span>{r.by}</span>
            <em>{r.note}</em>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const Outro = () => (
  <section className="outro">
    <p className="kicker"><span>FIN.</span> 第一步</p>
    <h2 className="outro-title" data-reveal>
      今天，<br />從牆壁開始<em>。</em>
    </h2>
    <ChronoStrip exerciseId="pushup" frames={7} from={0} to={0.45} className="chrono-outro" />
    <a className="btn btn-signal" href="#plan">做起點測驗 <span aria-hidden>→</span></a>
  </section>
);

/** The section currently under the reading line (a third of the way down the viewport). */
const useActiveSection = () => {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = NAV.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
};

const Nav = () => {
  const active = useActiveSection();
  const bar = useRef<HTMLUListElement>(null);

  // Keep the active chip visible in the phone bar.
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (el && bar.current) bar.current.scrollTo({ left: el.offsetLeft - bar.current.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const links = (cls: string, ref?: React.Ref<HTMLUListElement>) => (
    <ul className={cls} ref={ref}>
      {NAV.map(([id, zh], i) => (
        <li key={id} data-id={id}>
          <a href={`#${id}`} className={active === id ? "on" : ""} aria-current={active === id ? "location" : undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {zh}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <nav className="nav" aria-label="章節">
        <a href="#top" className="brand">
          <b>STREET/GYM</b>
          <span>街頭重力學</span>
        </a>
        {links("nav-links")}
      </nav>
      <nav className="mnav" aria-label="章節（行動版）">
        {links("mnav-links", bar)}
      </nav>
    </>
  );
};

export const App = () => {
  useReveal();
  return (
    <>
      <a className="skip" href="#science">跳到內容</a>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Science />
        <BigSix />
        <Muscles />
        <Roadmap />
        <Plan />
        <Warmup />
        <Skills />
        <Cardio />
        <Nutrition />
        <Mentors />
        <Outro />
      </main>
      <footer className="foot">
        <p>STREET/GYM — 徒手健身進階指南。內容僅供教育參考，不構成醫療建議；有傷病史請先諮詢專業人員。</p>
        <p>動畫以 Remotion 與 three.js 即時生成，可在 Remotion Studio 中渲染為影片。</p>
        <p>3D 解剖模型：<a href="https://www.z-anatomy.com/" target="_blank" rel="noreferrer">Z-Anatomy</a>（CC BY-SA 4.0，作者 Gauthier Kervyn），部分衍生自 BodyParts3D（© The Database Center for Life Science，CC BY-SA 2.1 JP）；經減面處理的衍生模型同樣以 CC BY-SA 4.0 釋出。</p>
      </footer>
    </>
  );
};
