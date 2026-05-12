"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar, { ORANGE, BORDER, setSidebarUsername, setSidebarAvatar, getSidebarUsername, getSidebarAvatar } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#1e2a3b";
const SURFACE2 = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";
const INPUT_BG = "#162032";

type Tab = "Account" | "Notifications" | "Security" | "Team";
const TABS: Tab[] = ["Account", "Notifications", "Security", "Team"];

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;
}

function Input({ value, onChange, placeholder, type = "text", readOnly }: { value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; readOnly?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{ width: "100%", background: readOnly ? "#0d1520" : INPUT_BG, border: `1px solid ${BORDER}`, color: readOnly ? MUTED : TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
    />
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 99, cursor: "pointer", position: "relative", background: on ? ORANGE : "#334155", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
    </div>
  );
}

function OrangeBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#4a2a1a" : ORANGE, color: disabled ? "#7a4a3a" : "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function GreyBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
      {children}
    </button>
  );
}

/* ── Tab Content Components ── */

function AccountTab() {
  const [name, setName] = useState("Sasi Kumar");
  const [email, setEmail] = useState("sasi@blackbrookcase.com");
  const [company, setCompany] = useState("Blackbrookcase");
  const [industry, setIndustry] = useState("Consumer Electronics");
  const [website, setWebsite] = useState("https://blackbrookcase.com");
  const [theme, setTheme] = useState("dark");
  const [avatar, setAvatarState] = useState("");
  const [animLogo, setAnimLogo] = useState(true);
  const [hue, setHue] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(getSidebarUsername());
    setAvatarState(getSidebarAvatar());
  }, []);

  useEffect(() => {
    if (!animLogo) return;
    const t = setInterval(() => setHue(h => (h + 1) % 360), 30);
    return () => clearInterval(t);
  }, [animLogo]);

  const INDUSTRIES = ["Consumer Electronics", "Fashion & Apparel", "Health & Beauty", "Food & Beverage", "Software & SaaS", "Finance", "Education", "Other"];

  const handleSave = () => {
    setSidebarUsername(name);
    setSidebarAvatar(avatar);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setAvatarState(url);
      setSidebarAvatar(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Account Settings</h2>

      {/* Profile photo */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {avatar ? (
            <img src={avatar} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BORDER}` }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: animLogo ? `hsl(${hue}, 70%, 50%)` : "#334155", border: `2px solid ${BORDER}`, transition: "background 0.1s" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => fileRef.current?.click()}
              style={{ background: ORANGE, color: "#fff", border: "none", padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >Upload Photo</button>
            {avatar && <button
              onClick={() => { setAvatarState(""); setSidebarAvatar(""); }}
              style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "7px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer" }}
            >Remove</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle on={animLogo} onToggle={() => setAnimLogo(v => !v)} />
            <span style={{ fontSize: 12, color: MUTED }}>Animated colour avatar (when no photo)</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div><Label>Display Name</Label><Input value={name} onChange={setName} /></div>
        <div><Label>Work Email</Label><Input value={email} onChange={setEmail} type="email" /></div>
        <div><Label>Company</Label><Input value={company} onChange={setCompany} /></div>
        <div>
          <Label>Industry</Label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ width: "100%", background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div><Label>Website</Label><Input value={website} onChange={setWebsite} /></div>
        <div>
          <Label>How did you hear about us</Label>
          <Input value="Reddit" readOnly />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <OrangeBtn onClick={handleSave}>Save Changes</OrangeBtn>
      </div>

      {/* Appearance */}
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, marginTop: 8 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "#fff" }}>Appearance</h3>
        <div style={{ marginBottom: 20 }}>
          <Label>Theme</Label>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "System" }].map(t => (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  flex: 1, border: `2px solid ${theme === t.id ? ORANGE : BORDER}`,
                  background: theme === t.id ? "rgba(232,93,47,0.08)" : SURFACE2,
                  borderRadius: 10, padding: "16px 12px", cursor: "pointer",
                  textAlign: "center", transition: "all 0.15s",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, margin: "0 auto 8px", background: t.id === "light" ? "#e2e8f0" : t.id === "dark" ? "#0a0f1a" : "linear-gradient(135deg, #e2e8f0 50%, #0a0f1a 50%)", border: `1px solid ${BORDER}` }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: theme === t.id ? ORANGE : MUTED2 }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const NOTIF_EVENTS = [
  { label: "New Brand Mention",        inApp: true,  email: true  },
  { label: "New Competitor Mention",   inApp: true,  email: false },
  { label: "Reply to Platform Post",   inApp: true,  email: false },
  { label: "Task Live",                inApp: true,  email: false },
  { label: "Task Failed or Removed",   inApp: true,  email: true  },
  { label: "No New Opportunities",     inApp: true,  email: false },
  { label: "Credit Balance Low",       inApp: true,  email: true  },
  { label: "Billing Events",           inApp: true,  email: true  },
];

function NotificationsTab() {
  const [settings, setSettings] = useState(NOTIF_EVENTS);
  const toggle = (idx: number, key: "inApp" | "email") =>
    setSettings(s => s.map((item, i) => i === idx ? { ...item, [key]: !item[key] } : item));

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Notification Preferences</h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED }}>Choose how you receive updates.</p>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", background: SURFACE2, padding: "10px 16px", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Event</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>In-App</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>Email</div>
        </div>
        {settings.map((ev, i) => (
          <div key={ev.label} style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", padding: "13px 16px", gap: 8, alignItems: "center", borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, color: TEXT }}>{ev.label}</div>
            <div style={{ display: "flex", justifyContent: "center" }}><Toggle on={ev.inApp} onToggle={() => toggle(i, "inApp")} /></div>
            <div style={{ display: "flex", justifyContent: "center" }}><Toggle on={ev.email} onToggle={() => toggle(i, "email")} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [twoFA, setTwoFA] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const sessions = [
    { device: "MacBook Pro", browser: "Chrome", location: "San Francisco, US", time: "Active now", active: true },
    { device: "iPhone 15",   browser: "Safari", location: "San Francisco, US", time: "2 hours ago", active: false },
  ];

  return (
    <div>
      <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Security</h2>

      {/* Change Password */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Change Password</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div><Label>Current Password</Label><Input value={curPw} onChange={setCurPw} type="password" placeholder="••••••••" /></div>
          <div><Label>New Password</Label><Input value={newPw} onChange={setNewPw} type="password" placeholder="••••••••" /></div>
          <div><Label>Confirm New Password</Label><Input value={confirmPw} onChange={setConfirmPw} type="password" placeholder="••••••••" /></div>
        </div>
        <OrangeBtn disabled={!curPw || !newPw || !confirmPw}>Save Password</OrangeBtn>
      </div>

      {/* 2FA */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Two-Factor Authentication</div>
          <div style={{ fontSize: 12, color: MUTED }}>Use an authenticator app for extra security</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: twoFA ? "#4ade80" : MUTED }}>{twoFA ? "Enabled" : "Disabled"}</span>
          <Toggle on={twoFA} onToggle={() => setTwoFA(!twoFA)} />
        </div>
      </div>

      {/* Login Alerts */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Login Alerts</div>
          <div style={{ fontSize: 12, color: MUTED }}>Email me when a new device signs in</div>
        </div>
        <Toggle on={loginAlerts} onToggle={() => setLoginAlerts(!loginAlerts)} />
      </div>

      {/* Active Sessions */}
      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Active Sessions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 3 }}>{s.device} · {s.browser}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{s.location} · {s.active ? <span style={{ color: "#4ade80" }}>{s.time}</span> : s.time}</div>
              </div>
              {!s.active && <GreyBtn>Revoke</GreyBtn>}
              {s.active && <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>Current</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MEMBERS = [
  { name: "Sasi Kumar", email: "sasi@blackbrookcase.com", role: "Owner",  joined: "Apr 1" },
  { name: "Ravi S",     email: "ravi@blackbrookcase.com", role: "Member", joined: "Apr 5" },
];

function TeamTab() {
  const [members, setMembers] = useState(MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const remove = (email: string) => setMembers(m => m.filter(x => x.email !== email));

  return (
    <div>
      <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Team</h2>
      <div style={{ display: "inline-block", background: "rgba(232,93,47,0.15)", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
        Pro Plan — Up to 5 team members
      </div>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 80px 70px", background: SURFACE2, padding: "10px 16px", gap: 8 }}>
          {["Name", "Email", "Role", "Joined", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
          ))}
        </div>
        {members.map((m, i) => (
          <div key={m.email} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 80px 70px", padding: "13px 16px", gap: 8, alignItems: "center", borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{m.name}</div>
            <div style={{ fontSize: 12, color: MUTED2 }}>{m.email}</div>
            <div style={{ fontSize: 12, color: m.role === "Owner" ? "#fbbf24" : MUTED2, fontWeight: 600 }}>{m.role}</div>
            <div style={{ fontSize: 12, color: MUTED }}>Apr {i === 0 ? "1" : "5"}</div>
            <div>{m.role !== "Owner" && <GreyBtn onClick={() => remove(m.email)}>Remove</GreyBtn>}</div>
          </div>
        ))}
      </div>

      <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Invite Team Member</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            style={{ flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}
          />
          <button
            onClick={() => setInviteEmail("")}
            style={{ background: ORANGE, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Account");

  const content: Record<Tab, React.ReactNode> = {
    Account:       <AccountTab />,
    Notifications: <NotificationsTab />,
    Security:      <SecurityTab />,
    Team:          <TeamTab />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Settings" />

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px", display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* Left tabs */}
          <div style={{ width: 200, flexShrink: 0, position: "sticky", top: 36 }}>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "12px 16px", background: activeTab === tab ? SURFACE2 : "transparent",
                    borderBottom: i < TABS.length - 1 ? `1px solid ${BORDER}` : "none",
                    border: "none",
                    borderLeft: `3px solid ${activeTab === tab ? ORANGE : "transparent"}`,
                    color: activeTab === tab ? "#fff" : MUTED2,
                    fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Right content */}
          <div style={{ flex: 1, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 32px" }}>
            {content[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
