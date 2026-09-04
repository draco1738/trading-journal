"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type Direction = "Long" | "Short";
type ModuleKey = "context" | "trigger" | "invalidation" | "events" | "scaling";

type SierraAccountScope = {
  available: boolean;
  accountId?: string;
  matchingActivityLogs?: number;
  ignoredActivityLogs?: number;
};

type Draft = {
  instrument: string;
  session: string;
  setup: string;
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
  session: "Auto",
  setup: "Opening pullback",
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
  modules: { context: true, trigger: true, invalidation: true, events: false, scaling: true },
};

const moduleMeta: Array<{ key: ModuleKey; label: string; helper: string }> = [
  { key: "context", label: "Market context", helper: "Structure, bias, and session conditions" },
  { key: "trigger", label: "Execution trigger", helper: "What must happen before entry" },
  { key: "invalidation", label: "Invalidation", helper: "What proves the idea wrong" },
  { key: "events", label: "News & events", helper: "Scheduled risk and blackout windows" },
  { key: "scaling", label: "Scale plan", helper: "Partial exits and runner management" },
];

const contracts = [
  { symbol: "NQZ6", label: "NQ", size: "Mini" },
  { symbol: "ESZ6", label: "ES", size: "Mini" },
  { symbol: "CLV6", label: "CL", size: "Mini" },
  { symbol: "GCZ6", label: "GC", size: "Mini" },
  { symbol: "MNQZ6", label: "MNQ", size: "Micro" },
  { symbol: "MESZ6", label: "MES", size: "Micro" },
  { symbol: "MCLV6", label: "MCL", size: "Micro" },
  { symbol: "MGCZ6", label: "MGC", size: "Micro" },
];

const setups = [
  "Opening pullback",
  "Opening drive",
  "Failed auction",
  "VWAP reclaim",
  "Range break",
  "Trend continuation",
  "Reversal",
  "Other",
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
  const [activeModule, setActiveModule] = useState<ModuleKey>("context");
  const [saved, setSaved] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cloudState, setCloudState] = useState<"idle" | "saving" | "saved" | "local" | "error">("idle");
  const [sierraScope, setSierraScope] = useState<SierraAccountScope | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("futures-plan-draft");
      if (stored) {
        try { setDraft(JSON.parse(stored) as Draft); } catch { /* Keep the starter draft. */ }
      }
    }, 0);

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserEmail(session?.user.email ?? null),
    );

    return () => {
      window.clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/sierra/account-scope", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json() as SierraAccountScope;
        setSierraScope(data);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSierraScope({ available: false });
      });

    return () => controller.abort();
  }, []);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value, lockedAt: undefined }));
    setSaved(false);
  };

  const numericEntry = Number(draft.entry.replaceAll(",", ""));
  const numericStop = Number(draft.stop.replaceAll(",", ""));
  const numericTarget = Number(draft.target.replaceAll(",", ""));
  const contractCount = Number(draft.contracts) || 0;
  const riskPoints = Math.abs(numericEntry - numericStop) || 0;
  const rewardPoints = Math.abs(numericTarget - numericEntry) || 0;
  const rr = riskPoints ? rewardPoints / riskPoints : 0;
  const contractRoot = contracts.find(({ symbol }) => symbol === draft.instrument)?.label ?? "NQ";
  const pointValues: Record<string, number> = { NQ: 20, MNQ: 2, ES: 50, MES: 5, CL: 1000, MCL: 100, GC: 100, MGC: 10 };
  const pointValue = pointValues[contractRoot] ?? 1;
  const cashRisk = riskPoints * pointValue * contractCount;

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

  const lockPlan = async () => {
    const next = { ...draft, lockedAt: new Date().toISOString() };
    setDraft(next);
    window.localStorage.setItem("futures-plan-draft", JSON.stringify(next));
    setSaved(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setCloudState("local");
      return;
    }

    setCloudState("saving");
    const { data: plan, error: planError } = await supabase
      .from("trade_plans")
      .insert({
        owner_id: authData.user.id,
        title: `${next.instrument} ${next.direction} plan`,
        status: "locked",
        direction: next.direction.toLowerCase(),
        session_name: next.session,
        planned_entry: numericEntry,
        hard_stop: numericStop,
        primary_target: numericTarget,
        planned_quantity: contractCount,
        max_risk_amount: cashRisk,
        thesis: next.thesis,
        planned_for: next.lockedAt,
        locked_at: next.lockedAt,
        current_version: 1,
      })
      .select("id")
      .single();

    if (planError || !plan) {
      setCloudState("error");
      return;
    }

    const snapshotText = JSON.stringify(next);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(snapshotText));
    const snapshotHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const { error: versionError } = await supabase.from("trade_plan_versions").insert({
      owner_id: authData.user.id,
      plan_id: plan.id,
      version_number: 1,
      snapshot: JSON.parse(snapshotText) as Json,
      snapshot_hash: snapshotHash,
    });

    setCloudState(versionError ? "error" : "saved");
  };

  const selectedModule = moduleMeta.find(({ key }) => key === activeModule) ?? moduleMeta[0];
  const lucidAccountLabel = sierraScope?.accountId?.split("-").at(-1) ?? "Detecting…";

  const startNewPlan = () => {
    setDraft({ ...starterDraft, lockedAt: undefined });
    setSaved(false);
    setCloudState("idle");
    window.requestAnimationFrame(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="app-shell">
      <aside className="tool-rail">
        <a className="brand-mark" href="#overview" aria-label="Northstar overview"><span /></a>
        <nav className="rail-nav" aria-label="Primary navigation">
          <a href="#overview" aria-label="Overview" title="Overview"><Icon name="grid" /></a>
          <a className="active" href="#plan" aria-label="Futures plan" title="Futures plan"><Icon name="plan" /></a>
          <a href="#journal" aria-label="Journal" title="Journal"><Icon name="journal" /></a>
          <a href="#reviews" aria-label="Reviews" title="Reviews"><Icon name="review" /></a>
        </nav>
        <div className="rail-spacer" />
        <div className="rail-sync" title={sierraScope?.available ? `${lucidAccountLabel} · current Lucid account` : "Sierra account unavailable"}><span className={`pulse ${sierraScope?.available ? "active" : ""}`} /></div>
        <a className="rail-control" href="#settings" aria-label="Settings" title="Settings"><Icon name="settings" /></a>
        <Link className="rail-avatar" href={userEmail ? "#settings" : "/login"} aria-label={userEmail ? `Signed in as ${userEmail}` : "Sign in"}>ZW</Link>
      </aside>

      <div className="desk-shell">
        <header className="command-bar">
          <div className="desk-title"><strong>Northstar</strong><span>/</span><span>Futures desk</span></div>
          <div className="market-clock"><span className="live-dot" /> Sierra local <kbd>ET</kbd></div>
          <div className="command-actions">
            <div className={`account-chip ${sierraScope?.available ? "active" : ""}`} title={sierraScope?.accountId}><span>Lucid</span><strong>{lucidAccountLabel}</strong></div>
            <button className="quiet-button" disabled title="Sierra import connector is not connected yet">Import pending</button>
            <button className="primary-button" onClick={startNewPlan}>New plan</button>
          </div>
        </header>

        <main className="console">
          <section className="intelligence-tape" id="overview" aria-label="Trading intelligence">
            <article className="intelligence-item leak" id="reviews">
              <div className="intelligence-label"><span className="signal-mark" />Leak to fix <b>30D</b></div>
              <strong>Waiting for scoped execution evidence</strong>
              <p>Only {lucidAccountLabel} will contribute to weakness analysis.</p>
            </article>
            <article className="intelligence-item edge">
              <div className="intelligence-label"><span className="signal-mark" />Repeatable edge <b>30D</b></div>
              <strong>Waiting for scoped execution evidence</strong>
              <p>Setups, timing, and discipline patterns will appear here.</p>
            </article>
            <div className="metric-matrix" aria-label="Performance summary">
              <div><span>Actual P&amp;L</span><strong>—</strong><small>30D</small></div>
              <div><span>Win rate</span><strong>—</strong><small>Scoped</small></div>
              <div><span>Expectancy</span><strong>—</strong><small>Per trade</small></div>
              <div><span>Adherence</span><strong>—</strong><small>Plans</small></div>
            </div>
          </section>

          <section className="workbench">
            <article className="plan-panel" id="plan">
              <div className="plan-head">
                <div><h1>Futures plan</h1><p>Define the trade. Lock it before execution.</p></div>
                <div className={`status-pill ${draft.lockedAt ? "locked" : ""}`}><span />{draft.lockedAt ? "Locked" : "Draft"}</div>
              </div>

              <div className="plan-controls">
                <Field label="Contract">
                  <select value={draft.instrument} onChange={(event) => update("instrument", event.target.value)} disabled={Boolean(draft.lockedAt)}>
                    <optgroup label="Minis">{contracts.filter(({ size }) => size === "Mini").map(({ symbol, label }) => <option key={symbol} value={symbol}>{label} · {symbol}</option>)}</optgroup>
                    <optgroup label="Micros">{contracts.filter(({ size }) => size === "Micro").map(({ symbol, label }) => <option key={symbol} value={symbol}>{label} · {symbol}</option>)}</optgroup>
                  </select>
                </Field>
                <Field label="Setup"><select value={draft.setup} onChange={(event) => update("setup", event.target.value)} disabled={Boolean(draft.lockedAt)}>{setups.map((setup) => <option key={setup}>{setup}</option>)}</select></Field>
                <Field label="Direction"><div className="segmented"><button className={draft.direction === "Long" ? "selected" : ""} aria-pressed={draft.direction === "Long"} onClick={() => update("direction", "Long")} disabled={Boolean(draft.lockedAt)}>Long</button><button className={draft.direction === "Short" ? "selected short" : ""} aria-pressed={draft.direction === "Short"} onClick={() => update("direction", "Short")} disabled={Boolean(draft.lockedAt)}>Short</button></div></Field>
              </div>

              <Field label="Trade thesis"><textarea rows={2} value={draft.thesis} onChange={(event) => update("thesis", event.target.value)} disabled={Boolean(draft.lockedAt)} /></Field>

              <div className="level-row">
                <Field label="Entry"><input value={draft.entry} onChange={(event) => update("entry", event.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
                <Field label="Hard stop"><input value={draft.stop} onChange={(event) => update("stop", event.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
                <Field label="Target"><input value={draft.target} onChange={(event) => update("target", event.target.value)} inputMode="decimal" disabled={Boolean(draft.lockedAt)} /></Field>
                <Field label="Qty"><input value={draft.contracts} onChange={(event) => update("contracts", event.target.value)} inputMode="numeric" disabled={Boolean(draft.lockedAt)} /></Field>
              </div>

              <div className="plan-readout">
                <span>Stop distance <strong>{riskPoints.toFixed(0)} pts</strong></span>
                <span>Planned R:R <strong>{rr.toFixed(2)}R</strong></span>
                <span>Complete <strong>{completion}%</strong></span>
                <span>Actual P&amp;L <strong className="pending-value">Pending import</strong></span>
              </div>

              <div className="module-head"><h2>Plan modules</h2><span>{Object.values(draft.modules).filter(Boolean).length} active</span></div>
              <div className="module-grid" role="tablist" aria-label="Plan modules">
                {moduleMeta.map(({ key, label }) => (
                  <div className={`module-tab ${activeModule === key ? "selected" : ""} ${draft.modules[key] ? "enabled" : ""}`} key={key}>
                    <button className="module-name" role="tab" aria-selected={activeModule === key} onClick={() => setActiveModule(key)}>{label}</button>
                    <button className={`switch ${draft.modules[key] ? "on" : ""}`} aria-label={`${draft.modules[key] ? "Disable" : "Enable"} ${label}`} aria-pressed={draft.modules[key]} onClick={() => { update("modules", { ...draft.modules, [key]: !draft.modules[key] }); setActiveModule(key); }} disabled={Boolean(draft.lockedAt)}><i /></button>
                  </div>
                ))}
              </div>
              <div className="module-editor" key={selectedModule.key} aria-live="polite">
                <label htmlFor={`module-${selectedModule.key}`}>{selectedModule.label}</label>
                {draft.modules[selectedModule.key] ? <input id={`module-${selectedModule.key}`} value={String(draft[selectedModule.key])} onChange={(event) => update(selectedModule.key, event.target.value)} disabled={Boolean(draft.lockedAt)} placeholder={selectedModule.key === "events" ? "CPI 08:30 · no entry 08:25–08:35" : selectedModule.helper} /> : <button onClick={() => update("modules", { ...draft.modules, [selectedModule.key]: true })}>Enable {selectedModule.label.toLowerCase()}</button>}
              </div>

              <div className="plan-actions">
                <div className="save-state"><Icon name="shield" /><span><strong>{draft.lockedAt ? cloudState === "saved" ? "Locked to Northstar" : cloudState === "saving" ? "Locking…" : cloudState === "error" ? "Cloud failed · local safe" : cloudState === "local" ? "Locked locally" : "Plan locked" : saved ? "Draft saved" : "Unsaved changes"}</strong><small>{draft.lockedAt ? new Date(draft.lockedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Local until locked"}</small></span></div>
                {!draft.lockedAt ? <><button className="quiet-button" onClick={saveDraft}>Save draft</button><button className="primary-button" onClick={lockPlan}>Lock plan</button></> : <button className="quiet-button" onClick={() => update("lockedAt", undefined)}>Create revision</button>}
              </div>
            </article>

            <aside className="evidence-rail">
              <section className="scope-panel">
                <div className="panel-title"><h2>Data scope</h2><span className={`status-text ${sierraScope?.available ? "online" : ""}`}>{sierraScope?.available ? "Online" : "Pending"}</span></div>
                <div className="scope-account"><span>Current Lucid account</span><strong>{lucidAccountLabel}</strong></div>
                <dl className="scope-stats"><div><dt>Accepted logs</dt><dd>{sierraScope?.matchingActivityLogs ?? 0}</dd></div><div><dt>Other accounts</dt><dd>{sierraScope?.ignoredActivityLogs ?? 0} blocked</dd></div></dl>
              </section>

              <section className="pnl-panel">
                <div><span>Today&apos;s actual P&amp;L</span><small>{lucidAccountLabel} only</small></div><strong>—</strong>
              </section>

              <section className="entry-gate">
                <div className="panel-title"><h2>Entry gate</h2><strong>3 / 4</strong></div>
                <div className="check-list">{["Plan locked before entry", "Stop fixed", "Trigger confirmed", "Never add to a loser"].map((item, index) => <label className="check-row" key={item}><input type="checkbox" defaultChecked={index < 3}/><span><i><Icon name="check" /></i>{item}</span></label>)}</div>
              </section>

              <section className="recent" id="journal">
                <div className="panel-title"><h2>Recent trades</h2><button className="text-button" disabled title="No imported trades yet">No trades <Icon name="chevron" /></button></div>
                <div className="journal-empty"><strong>No scoped trades yet</strong><p>{sierraScope?.available ? `${sierraScope.matchingActivityLogs ?? 0} account-matched logs are ready for the Sierra connector.` : "Connect the active Sierra account to begin."}</p></div>
              </section>

              <section className="sync-row"><div className="sync-icon"><Icon name="shield" /></div><div><strong>Sierra import pending</strong><p>Planning remains available.</p></div></section>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
