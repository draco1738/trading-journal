"use client";

import { useEffect, useMemo, useState } from "react";

type Direction = "Long" | "Short";
type ModuleKey = "context" | "execution" | "invalidation" | "events" | "scaling";

type Draft = {
  instrument: string;
  session: string;
  direction: Direction;
  entry: string;
  stop: string;
  target: string;
  contracts: string;
  thesis: string;
  context: string;
  trigger: string;
  invalidation: string;
  events: string;
  scaling: string;
  modules: Record<ModuleKey, boolean>;
  lockedAt?: string;
};

const starterDraft: Draft = {
  instrument: "NQZ6",
  session: "New York AM",
  direction: "Long",
  entry: "24,820.00",
  stop: "24,775.00",
  target: "24,940.00",
  contracts: "2",
  thesis:
    "Overnight inventory is short while price holds above yesterday's value area. Look for acceptance above the opening range and continuation into the prior high.",
  context: "Above weekly VWAP · responsive buyers at ONL · breadth improving",
  trigger: "5-minute close above 24,820, then hold the first pullback",
  invalidation: "Acceptance below 24,775 or a failed reclaim after the opening drive",
  events: "",
  scaling: "Take one contract at +60 points; trail the runner beneath the last 5-minute higher low",
  modules: { context: true, execution: true, invalidation: true, events: false, scaling: true },
};

const moduleMeta: Array<{ key: ModuleKey; label: string; helper: string }> = [
  { key: "context", label: "Market context", helper: "Structure, bias, and session conditions" },
  { key: "execution", label: "Execution trigger", helper: "What must happen before entry" },
  { key: "invalidation", label: "Invalidation", helper: "What proves the idea wrong" },
  { key: "events", label: "News & events", helper: "Scheduled risk and blackout windows" },
  { key: "scaling", label: "Scale plan", helper: "Partial exits and runner management" },
];

const recentPlans = [
  { date: "Sep 02", instrument: "ESZ6", direction: "Short", setup: "Failed auction", result: "+1.8R", status: "Followed" },
  { date: "Sep 01", instrument: "NQZ6", direction: "Long", setup: "Opening drive", result: "+0.7R", status: "Followed" },
  { date: "Aug 31", instrument: "CLV6", direction: "Long", setup: "Range reclaim", result: "−1.0R", status: "Deviated" },
];

function Icon({ name }: { name: "grid" | "plan" | "journal" | "review" | "settings" | "shield" | "chevron" | "check" }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    plan: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    journal: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/></>,
    review: <><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-3v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15.7a1.7 1.7 0 0 0-1.56-1.04H5v-3h.44A1.7 1.7 0 0 0 7 10.62a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.66 7a1.7 1.7 0 0 0 1.04-1.56V5h3v.44A1.7 1.7 0 0 0 15.74 7a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04H21v3h-.04A1.7 1.7 0 0 0 19.4 15z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
    chevron: <path d="M9 18l6-6-6-6"/>,
    check: <path d="M5 12l4 4L19 6"/>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Field({ label, children, helper }: { label: string; children: React.ReactNode; helper?: string }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{helper ? <span className="field-helper">{helper}</span> : null}</label>;
}

export default function Home() {
  const [draft, setDraft] = useState<Draft>(starterDraft);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("futures-plan-draft");
    if (stored) {
      try { setDraft(JSON.parse(stored) as Draft); } catch { /* Keep the starter draft. */ }
    }
    setReady(true);
  }, []);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value, lockedAt: undefined }));
    setSaved(false);
  };

  const numericEntry = Number(draft.entry.replaceAll(",", ""));
  const numericStop = Number(draft.stop.replaceAll(",", ""));
  const numericTarget = Number(draft.target.replaceAll(",", ""));
  const contracts = Number(draft.contracts) || 0;
  const riskPoints = Math.abs(numericEntry - numericStop) || 0;
  const rewardPoints = Math.abs(numericTarget - numericEntry) || 0;
  const rr = riskPoints ? rewardPoints / riskPoints : 0;
  const pointValue = draft.instrument.startsWith("NQ") ? 20 : draft.instrument.startsWith("ES") ? 50 : 10;
  const cashRisk = riskPoints * pointValue * contracts;

  const completion = useMemo(() => {
    const required = [draft.instrument, draft.entry, draft.stop, draft.target, draft.thesis];
    const enabled = moduleMeta.filter(({ key }) => draft.modules[key]);
    const moduleDone = enabled.filter(({ key }) => Boolean(draft[key]?.trim())).length;
    return Math.round(((required.filter(Boolean).length + moduleDone) / (required.length + enabled.length)) * 100);
  }, [draft]);

  const saveDraft = () => {
    window.localStorage.setItem("futures-plan-draft", JSON.stringify(draft));
    setSaved(true);
  };

  const lockPlan = () => {
    const next = { ...draft, lockedAt: new Date().toISOString() };
    setDraft(next);
    window.localStorage.setItem("futures-plan-draft", JSON.stringify(next));
    setSaved(true);
  };

  if (!ready) return null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><span /></div><div><strong>Northstar</strong><small>Trading journal</small></div></div>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#overview"><Icon name="grid" />Overview</a>
          <a className="active" href="#plan"><Icon name="plan" />Futures plans<span className="nav-count">1</span></a>
          <a href="#journal"><Icon name="journal" />Trade journal</a>
          <a href="#reviews"><Icon name="review" />Reviews</a>
        </nav>
        <div className="sidebar-spacer" />
        <div className="connection-card"><div className="connection-head"><span className="pulse" />Sierra connector</div><strong>Waiting for POC</strong><small>Manual plans work now. Execution import connects later.</small></div>
        <nav className="nav secondary"><a href="#settings"><Icon name="settings" />Settings</a></nav>
        <div className="profile"><div className="avatar">ZW</div><div><strong>Zane</strong><small>Owner workspace</small></div><Icon name="chevron" /></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">Thursday · September 3</span><h1>Good morning, Zane.</h1><p>Plan the trade. Trade the plan. Review the evidence.</p></div>
          <div className="top-actions"><button className="ghost-button">Import activity</button><button className="primary-button" onClick={() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" })}>+ New futures plan</button></div>
        </header>

        <section className="stats" id="overview" aria-label="Performance summary">
          <article><span>Net P&amp;L · 30D</span><strong>$8,420.00</strong><small className="positive">↗ 14.2% vs prior period</small></article>
          <article><span>Plan adherence</span><strong>86%</strong><div className="meter"><i style={{ width: "86%" }} /></div></article>
          <article><span>Expectancy</span><strong>+0.64R</strong><small>42 completed futures trades</small></article>
          <article><span>Profit factor</span><strong>1.92</strong><small>Average win 1.43R</small></article>
        </section>

        <section className="workspace-grid">
          <article className="panel plan-panel" id="plan">
            <div className="panel-head">
              <div><span className="kicker">MANUAL FUTURES PLAN</span><h2>Today&apos;s trade hypothesis</h2><p>Fill only what matters. Optional modules stay out of your way.</p></div>
              <div className={`status-pill ${draft.lockedAt ? "locked" : ""}`}><span />{draft.lockedAt ? "Plan locked" : "Draft"}</div>
            </div>

            <div className="form-grid three">
              <Field label="Contract"><select value={draft.instrument} onChange={(e) => update("instrument", e.target.value)} disabled={Boolean(draft.lockedAt)}><option>NQZ6</option><option>ESZ6</option><option>CLV6</option><option>GCZ6</option></select></Field>
              <Field label="Session"><select value={draft.session} onChange={(e) => update("session", e.target.value)} disabled={Boolean(draft.lockedAt)}><option>New York AM</option><option>New York PM</option><option>London</option><option>Asia</option></select></Field>
              <Field label="Direction"><div className="segmented"><button className={draft.direction === "Long" ? "selected" : ""} onClick={() => update("direction", "Long")} disabled={Boolean(draft.lockedAt)}>Long</button><button className={draft.direction === "Short" ? "selected short" : ""} onClick={() => update("direction", "Short")} disabled={Boolean(draft.lockedAt)}>Short</button></div></Field>
            </div>

            <Field label="Core thesis" helper="Write the reason before the outcome is known."><textarea rows={3} value={draft.thesis} onChange={(e) => update("thesis", e.target.value)} disabled={Boolean(draft.lockedAt)} /></Field>

            <div className="level-row">
              <Field label="Planned entry"><input value={draft.entry} onChange={(e) => update("entry", e.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
              <Field label="Hard stop"><input value={draft.stop} onChange={(e) => update("stop", e.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
              <Field label="Primary target"><input value={draft.target} onChange={(e) => update("target", e.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
              <Field label="Contracts"><input value={draft.contracts} onChange={(e) => update("contracts", e.target.value)} inputMode="numeric" disabled={Boolean(draft.lockedAt)} /></Field>
            </div>

            <div className="risk-strip">
              <div><span>Risk</span><strong>{riskPoints.toFixed(0)} pts</strong></div>
              <div><span>Estimated cash risk</span><strong>${cashRisk.toLocaleString()}</strong></div>
              <div><span>Reward / risk</span><strong>{rr.toFixed(2)}R</strong></div>
              <div><span>Plan completeness</span><strong>{completion}%</strong></div>
            </div>

            <div className="module-title"><div><h3>Plan modules</h3><p>Toggle modules on only when they improve the decision.</p></div><span>{Object.values(draft.modules).filter(Boolean).length} active</span></div>
            <div className="module-list">
              {moduleMeta.map(({ key, label, helper }) => (
                <div className={`module ${draft.modules[key] ? "open" : ""}`} key={key}>
                  <button className="module-toggle" onClick={() => update("modules", { ...draft.modules, [key]: !draft.modules[key] })} disabled={Boolean(draft.lockedAt)}>
                    <span className={`switch ${draft.modules[key] ? "on" : ""}`}><i /></span><span><strong>{label}</strong><small>{helper}</small></span><Icon name="chevron" />
                  </button>
                  {draft.modules[key] ? <div className="module-body"><textarea rows={2} value={String(draft[key])} onChange={(e) => update(key, e.target.value)} disabled={Boolean(draft.lockedAt)} placeholder={key === "events" ? "Example: CPI at 08:30 ET — no new entry from 08:25–08:35" : "Add the detail that will matter during execution…"} /></div> : null}
                </div>
              ))}
            </div>

            <div className="plan-actions">
              <div className="save-state"><Icon name="shield" /><span><strong>{draft.lockedAt ? "Immutable snapshot saved" : saved ? "Draft saved locally" : "Changes not yet saved"}</strong><small>{draft.lockedAt ? new Date(draft.lockedAt).toLocaleString() : "This prototype stores the draft on this device."}</small></span></div>
              {!draft.lockedAt ? <><button className="ghost-button" onClick={saveDraft}>Save draft</button><button className="primary-button" onClick={lockPlan}>Lock plan</button></> : <button className="ghost-button" onClick={() => update("lockedAt", undefined)}>Create revision</button>}
            </div>
          </article>

          <aside className="right-rail">
            <article className="panel focus-card">
              <div className="panel-head compact"><div><span className="kicker">TODAY&apos;S FOCUS</span><h2>Process over outcome</h2></div><div className="focus-score">3/4</div></div>
              {["Plan exists before entry", "Risk is fixed before entry", "Wait for stated trigger", "No adding to a loser"].map((item, index) => <label className="check-row" key={item}><input type="checkbox" defaultChecked={index < 3}/><span><i><Icon name="check" /></i>{item}</span></label>)}
            </article>
            <article className="panel insight-card"><span className="kicker">COACHING SIGNAL</span><h3>Your best NQ window</h3><div className="insight-number">+0.91R</div><p>Average expectancy from 09:45–11:00 ET when a written plan was locked before entry.</p><a href="#reviews">View supporting trades <Icon name="chevron" /></a></article>
            <article className="panel sync-card"><div className="sync-icon"><Icon name="shield" /></div><div><strong>Execution sync is separate</strong><p>Sierra fills will attach to this plan after the connector passes its proof of concept.</p></div></article>
          </aside>
        </section>

        <section className="panel history" id="journal">
          <div className="panel-head compact"><div><span className="kicker">RECENT FUTURES TRADES</span><h2>Plan-to-result history</h2></div><button className="text-button">Open journal <Icon name="chevron" /></button></div>
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Contract</th><th>Direction</th><th>Setup</th><th>Result</th><th>Discipline</th></tr></thead><tbody>{recentPlans.map((row) => <tr key={`${row.date}-${row.instrument}`}><td>{row.date}</td><td><strong>{row.instrument}</strong></td><td><span className={`direction ${row.direction.toLowerCase()}`}>{row.direction}</span></td><td>{row.setup}</td><td className={row.result.startsWith("+") ? "positive" : "negative"}><strong>{row.result}</strong></td><td><span className={`discipline ${row.status.toLowerCase()}`}>{row.status}</span></td></tr>)}</tbody></table></div>
        </section>
      </main>
    </div>
  );
}
