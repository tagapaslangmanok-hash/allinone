"use client";

import {
  Activity,
  AudioLines,
  Bot,
  Boxes,
  FileKey,
  Gift,
  Home,
  ListChecks,
  LockKeyhole,
  MessageSquarePlus,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Wand2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

const nav = [
  { label: "Security", icon: ShieldCheck, active: true },
  { label: "Music", icon: AudioLines },
  { label: "Lua Tools", icon: FileKey },
  { label: "Tickets", icon: Ticket },
  { label: "Verify", icon: LockKeyhole },
  { label: "Welcome", icon: Home },
  { label: "Embeds", icon: Wand2 },
  { label: "Logs", icon: ListChecks },
  { label: "Analytics", icon: Activity }
];

const statCards = [
  { label: "Protected Servers", value: "128", detail: "+14 this week", icon: ShieldCheck },
  { label: "Active Queues", value: "37", detail: "Lavalink ready", icon: AudioLines },
  { label: "Lua Actions", value: "2.4k", detail: "100% audited", icon: FileKey },
  { label: "Open Tickets", value: "19", detail: "median 4m response", icon: Ticket }
];

const logRows = [
  ["Anti-nuke", "Blocked role escalation", "2m ago"],
  ["Music", "Queued Spotify metadata match", "6m ago"],
  ["Lua", "Encrypted user-owned file", "12m ago"],
  ["Tickets", "Created billing support room", "18m ago"]
];

const communityTools: Array<[string, LucideIcon]> = [
  ["Welcome editor", Home],
  ["Embed builder", Boxes],
  ["Giveaways", Gift],
  ["Suggestions", MessageSquarePlus]
];

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof ShieldCheck; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-cyan shadow-cyan">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-normal text-white">{title}</h2>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export function DashboardShell() {
  return (
    <main className="min-h-screen p-3 text-slate-100 sm:p-5 lg:p-6">
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="glass neon-border sticky top-4 h-fit rounded-xl p-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet/20 text-violet shadow-neon">
              <Bot size={26} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-cyan">Premium 2026</p>
              <h1 className="text-xl font-bold tracking-normal">MANOK Bot</h1>
            </div>
          </div>

          <button className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:border-cyan/50 hover:bg-cyan/10">
            <span>
              <span className="block text-sm font-semibold">Manila Prime</span>
              <span className="block text-xs text-slate-400">Server selector</span>
            </span>
            <PanelLeft size={18} />
          </button>

          <nav className="mt-4 space-y-1">
            {nav.map((item) => (
              <button
                key={item.label}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                  item.active ? "bg-violet/20 text-white shadow-neon" : "text-slate-400 hover:bg-white/7 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <header className="glass float-in rounded-xl p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan">Live command center</p>
                <h2 className="mt-2 text-3xl font-bold tracking-normal text-white sm:text-4xl">MANOK Bot 2026</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Security automation, music operations, Lua file controls, tickets, verification, logging, and analytics in one premium Discord control plane.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">Bot online</span>
                <span className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan">Lavalink ready</span>
                <span className="rounded-lg border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-violet-100">MongoDB synced</span>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <article key={card.label} className="glass float-in rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <card.icon className="text-cyan" size={22} />
                  <Sparkles className="text-violet" size={16} />
                </div>
                <p className="mt-5 text-sm text-slate-400">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">{card.value}</p>
                <p className="mt-2 text-sm text-cyan">{card.detail}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="glass rounded-xl p-5">
              <SectionTitle icon={ShieldCheck} title="Security Center" subtitle="Anti-nuke thresholds, whitelist, punishment, and escalation monitoring" />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Mass ban/kick", "Role/channel spam", "Webhook & bot add"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{item}</p>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: "76%" }} />
                    </div>
                    <p className="mt-3 text-xs text-slate-400">Threshold 5 actions / 30s</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-violet/30 bg-violet/10 p-4 text-sm text-violet-100">
                Whitelist, configurable punishments, permission escalation detection, staff logs, and dashboard controls are modeled in guild config.
              </div>
            </article>

            <article className="glass rounded-xl p-5">
              <SectionTitle icon={AudioLines} title="Music Panel" subtitle="YouTube playback, Spotify metadata matching, queue controls" />
              <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-slate-400">Now playing</p>
                <p className="mt-1 text-xl font-semibold text-white">Midnight Neon Drive</p>
                <div className="mt-4 flex items-center gap-2">
                  <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15">Pause</button>
                  <button className="rounded-lg bg-cyan px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan/90">Skip</button>
                  <button className="rounded-lg bg-rose-500/90 px-3 py-2 text-sm font-semibold hover:bg-rose-500">Stop</button>
                </div>
              </div>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <article className="glass rounded-xl p-5">
              <SectionTitle icon={FileKey} title="Lua Tools" subtitle="AES-256-GCM, PBKDF2, ownership, staff audit" />
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p className="rounded-lg bg-white/5 p-3">Decrypt is restricted to MANOK envelopes and owner-only mode can be enforced per guild.</p>
                <p className="rounded-lg bg-white/5 p-3">File size limits and extension allow-list reduce abuse surface.</p>
              </div>
            </article>

            <article className="glass rounded-xl p-5">
              <SectionTitle icon={Ticket} title="Ticket Builder" subtitle="Support rooms, staff roles, transcript-ready flow" />
              <div className="mt-5 grid gap-3">
                <button className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan">New panel</button>
                <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Staff routing</button>
              </div>
            </article>

            <article className="glass rounded-xl p-5">
              <SectionTitle icon={LockKeyhole} title="Verification Setup" subtitle="Role gate, channel binding, button workflow" />
              <div className="mt-5 flex items-center justify-between rounded-lg bg-white/5 p-3">
                <span className="text-sm">Verified role</span>
                <span className="text-sm text-cyan">@Member</span>
              </div>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="glass rounded-xl p-5">
              <SectionTitle icon={Users} title="Community Suite" subtitle="Welcome, suggestions, giveaways, invites, backups" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {communityTools.map(([label, Icon]) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <Icon className="text-violet" size={18} />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="glass rounded-xl p-5">
              <SectionTitle icon={ListChecks} title="Live Logs" subtitle="Discord events, Lua actions, moderation decisions, dashboard changes" />
              <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
                {logRows.map(([area, detail, time]) => (
                  <div key={`${area}-${time}`} className="grid grid-cols-[110px_1fr_80px] gap-3 border-b border-white/10 bg-white/5 px-3 py-3 text-sm last:border-b-0">
                    <span className="text-cyan">{area}</span>
                    <span className="text-slate-200">{detail}</span>
                    <span className="text-right text-slate-500">{time}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
