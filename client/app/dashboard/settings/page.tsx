'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import {
  Moon, Sun, Download, Bell, MonitorSmartphone, Sparkles,
  UserRound, LockKeyhole, Mail, Phone, MapPin, ShieldCheck,
  Palette, Sliders, ChevronRight,
} from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const SETTINGS_KEY = 'school_app_preferences';

type AppPreferences = {
  emailNotifications: boolean;
  reducedMotion: boolean;
  compactTables: boolean;
};

const defaultPreferences: AppPreferences = {
  emailNotifications: true,
  reducedMotion: false,
  compactTables: false,
};

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState<string>('Not installed');
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as AppPreferences;
      setPreferences({
        emailNotifications: !!parsed.emailNotifications,
        reducedMotion: !!parsed.reducedMotion,
        compactTables: !!parsed.compactTables,
      });
    } catch (error) {
      console.error('Failed to parse saved preferences:', error);
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallStatus('Ready to install');
    };
    const onInstalled = () => {
      setInstallPrompt(null);
      setInstallStatus('Installed');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canInstall = useMemo(() => !!installPrompt, [installPrompt]);
  const activeTheme = mounted ? theme : 'light';
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const savePreferences = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
      setSaveMessage('Preferences saved');
    } catch {
      setSaveMessage('Failed to save preferences');
    } finally {
      setTimeout(() => setSaveMessage(null), 1800);
    }
  };

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile(profileForm);
      setProfileMessage('Profile details updated');
    } catch {
      setProfileMessage('Could not update profile details');
    } finally {
      setTimeout(() => setProfileMessage(null), 1800);
    }
  };

  const handlePasswordSave = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not change password');
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallStatus(choice.outcome === 'accepted' ? 'Install accepted' : 'Install cancelled');
      setInstallPrompt(null);
    } catch {
      setInstallStatus('Install failed');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── ROOT ── */
        .sp-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: sp-in 0.4s ease both;
        }
        @keyframes sp-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        /* ── HEADER ── */
        .sp-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 36px; padding-bottom: 28px; border-bottom: 1px solid #e8e8e6;
        }
        .sp-eyebrow { font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #aaa; margin-bottom: 8px; }
        .sp-title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #0a0a0a; line-height: 1.1; margin-bottom: 6px; }
        .sp-sub { font-size: 13px; font-weight: 300; color: #aaa; }

        /* ── STAT-STYLE SUMMARY CARDS (top row) ── */
        .sp-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
          animation: sp-in 0.4s 0.05s ease both;
        }
        .sp-stat {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 10px;
          padding: 22px 24px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .sp-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:#0a0a0a; transform:scaleX(0); transform-origin:left;
          transition:transform 0.3s ease;
        }
        .sp-stat:hover { border-color:#c8c8c6; transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,.07); }
        .sp-stat:hover::before { transform:scaleX(1); }
        .sp-stat-icon { width:32px; height:32px; border-radius:7px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .sp-stat-label { font-size:10px; font-weight:500; letter-spacing:0.14em; text-transform:uppercase; color:#bbb; margin-bottom:6px; }
        .sp-stat-value { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#0a0a0a; line-height:1; margin-bottom:4px; }
        .sp-stat-sub { font-size:11px; font-weight:300; color:#bbb; }

        /* ── MAIN GRID ── */
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 14px;
        }

        /* ── SHARED CARD ── */
        .sp-card {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 10px;
          overflow: hidden;
          animation: sp-in 0.4s 0.1s ease both;
        }
        .sp-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 24px; border-bottom: 1px solid #f0f0ee;
        }
        .sp-card-title { font-size:10px; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:#bbb; }

        /* column spans */
        .sp-col-8  { grid-column: span 8; }
        .sp-col-4  { grid-column: span 4; }
        .sp-col-6  { grid-column: span 6; }
        .sp-col-12 { grid-column: span 12; }

        /* ── PROFILE CARD ── */
        .sp-profile-head {
          display: flex; align-items: center; gap: 16px;
          padding: 22px 24px 18px;
          border-bottom: 1px solid #f0f0ee;
        }
        .sp-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(145deg,#0a0a0a,#3a3a3a); color: #fff;
          font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 6px 18px rgba(0,0,0,.20);
          animation: sp-pulse 2.5s ease-in-out infinite;
        }
        @keyframes sp-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        .sp-profile-name { font-size: 16px; font-weight: 700; color: #111; line-height:1.2; }
        .sp-profile-role { font-size: 11px; color: #999; text-transform: capitalize; margin-top: 2px; }

        .sp-form-body { padding: 20px 24px; }
        .sp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* ── FIELDS ── */
        .sp-field { display: flex; flex-direction: column; gap: 6px; }
        .sp-field label {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; font-weight: 500;
        }
        .sp-input {
          height: 42px; border: 1px solid #e4e4e2; border-radius: 8px;
          padding: 0 13px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: #fff; color: #0a0a0a;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sp-input:focus { outline: none; border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(10,10,10,0.06); }
        .sp-input:disabled { background: #fafafa; color: #bbb; cursor: not-allowed; }

        /* ── CARD FOOTER ACTIONS ── */
        .sp-card-footer {
          display: flex; align-items: center; gap: 10px;
          padding: 16px 24px; border-top: 1px solid #f0f0ee; background: #fafafa;
        }
        .sp-btn-primary {
          padding: 9px 18px; background: #0a0a0a; border: none; border-radius: 7px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #fff;
          cursor: pointer; transition: background 0.15s, transform 0.15s;
        }
        .sp-btn-primary:hover { background: #222; transform: translateY(-1px); }
        .sp-saved { font-size: 12px; color: #2d7a4f; }
        .sp-error { font-size: 12px; color: #b52b2b; }

        /* ── ROW ITEMS (toggles, theme, install) ── */
        .sp-rows { padding: 4px 0; }
        .sp-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 15px 24px; border-bottom: 1px solid #f8f8f7;
          transition: background 0.12s;
        }
        .sp-row:last-child { border-bottom: none; }
        .sp-row:hover { background: #fafafa; }
        .sp-row-label { font-size: 13px; font-weight: 500; color: #0a0a0a; display:flex; align-items:center; gap:8px; }
        .sp-row-help { font-size: 11px; font-weight: 300; color: #aaa; margin-top: 2px; }
        .sp-row-icon { width:28px; height:28px; border-radius:6px; background:#f4f4f3; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* ── TOGGLE ── */
        .sp-toggle {
          width: 44px; height: 24px; border-radius: 999px; border: none;
          cursor: pointer; display: inline-flex; align-items: center; padding: 2px;
          transition: background 0.2s; flex-shrink: 0;
        }
        .sp-toggle.off { background: #e0e0e0; }
        .sp-toggle.on  { background: #0a0a0a; }
        .sp-toggle-dot { width: 20px; height: 20px; background: #fff; border-radius: 999px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
        .sp-toggle.on .sp-toggle-dot { transform: translateX(20px); }

        /* ── THEME PILLS ── */
        .sp-theme-group { display: flex; gap: 6px; }
        .sp-theme-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 20px; font-size: 12px; font-family: 'DM Sans', sans-serif;
          border: 1px solid #e4e4e2; background: #fff; color: #888; cursor: pointer;
          transition: all 0.15s;
        }
        .sp-theme-btn:hover { border-color: #c0c0be; color: #444; }
        .sp-theme-btn.active { background: #0a0a0a; border-color: #0a0a0a; color: #fff; font-weight: 500; }

        /* ── INSTALL BTN ── */
        .sp-install-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: #0a0a0a; border: none; border-radius: 7px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #fff;
          cursor: pointer; transition: background 0.15s, transform 0.15s;
        }
        .sp-install-btn:hover:not(:disabled) { background: #222; transform: translateY(-1px); }
        .sp-install-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── STATUS PILL ── */
        .sp-status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 400;
        }
        .sp-status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .sp-status-pill.installed  { background: #f0faf4; color: #2d7a4f; }
        .sp-status-pill.installed .sp-status-dot { background: #2d7a4f; }
        .sp-status-pill.ready      { background: #fef9ec; color: #a06b00; }
        .sp-status-pill.ready .sp-status-dot { background: #d4900a; }
        .sp-status-pill.unavailable{ background: #f4f4f3; color: #aaa; }
        .sp-status-pill.unavailable .sp-status-dot { background: #ccc; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .sp-col-8, .sp-col-4, .sp-col-6 { grid-column: span 12; }
        }
        @media (max-width: 700px) {
          .sp-root { padding: 24px 18px; }
          .sp-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .sp-form-grid { grid-template-columns: 1fr; }
          .sp-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="sp-root">

        {/* ── HEADER ── */}
        <div className="sp-header">
          <div>
            <div className="sp-eyebrow">Personalization</div>
            <h1 className="sp-title">Settings</h1>
            <p className="sp-sub">Manage your profile, account security, app behaviour, and installation.</p>
          </div>
        </div>

        {/* ── SUMMARY STAT CARDS ── */}
        <div className="sp-stats">
          <div className="sp-stat">
            <div className="sp-stat-icon"><UserRound size={15} color="#0a0a0a" /></div>
            <div className="sp-stat-label">Account</div>
            <div className="sp-stat-value" style={{ fontSize: 18, paddingTop: 2 }}>{user?.firstName} {user?.lastName}</div>
            <div className="sp-stat-sub" style={{ textTransform: 'capitalize' }}>{user?.role ?? 'User'} role</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-icon"><Mail size={15} color="#0a0a0a" /></div>
            <div className="sp-stat-label">Email</div>
            <div className="sp-stat-value" style={{ fontSize: 13, paddingTop: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>{user?.email ?? '—'}</div>
            <div className="sp-stat-sub">Primary address</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-icon"><Palette size={15} color="#0a0a0a" /></div>
            <div className="sp-stat-label">Theme</div>
            <div className="sp-stat-value" style={{ fontSize: 18, paddingTop: 2, textTransform: 'capitalize' }}>{mounted ? theme : 'Light'}</div>
            <div className="sp-stat-sub">Interface mode</div>
          </div>
          <div className="sp-stat">
            <div className="sp-stat-icon"><Download size={15} color="#0a0a0a" /></div>
            <div className="sp-stat-label">PWA Status</div>
            <div className="sp-stat-value" style={{ fontSize: 15, paddingTop: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{installStatus}</div>
            <div className="sp-stat-sub">{canInstall ? 'Tap to install' : 'Home screen app'}</div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="sp-grid">

          {/* PROFILE CARD — wide */}
          <section className="sp-card sp-col-8">
            <div className="sp-card-header">
              <span className="sp-card-title">Profile Details</span>
            </div>
            <div className="sp-profile-head">
              <div className="sp-avatar" aria-label="Profile avatar">{initials || 'U'}</div>
              <div>
                <div className="sp-profile-name">{user?.firstName} {user?.lastName}</div>
                <div className="sp-profile-role">{user?.role ?? 'User'} account</div>
              </div>
            </div>
            <form onSubmit={handleProfileSave}>
              <div className="sp-form-body">
                <div className="sp-form-grid">
                  <div className="sp-field">
                    <label><UserRound size={11} />First Name</label>
                    <input className="sp-input" value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="sp-field">
                    <label><UserRound size={11} />Last Name</label>
                    <input className="sp-input" value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  <div className="sp-field">
                    <label><Mail size={11} />Email</label>
                    <input className="sp-input" value={user?.email ?? ''} disabled />
                  </div>
                  <div className="sp-field">
                    <label><Phone size={11} />Phone</label>
                    <input className="sp-input" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="sp-field" style={{ gridColumn: 'span 2' }}>
                    <label><MapPin size={11} />Address</label>
                    <input className="sp-input" value={profileForm.address} onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="sp-card-footer">
                <button type="submit" className="sp-btn-primary">Save Profile</button>
                {profileMessage && <span className="sp-saved">{profileMessage}</span>}
              </div>
            </form>
          </section>

          {/* SECURITY CARD — narrow */}
          <section className="sp-card sp-col-4">
            <div className="sp-card-header">
              <span className="sp-card-title">Security</span>
              <ShieldCheck size={14} color="#bbb" />
            </div>
            <form onSubmit={handlePasswordSave}>
              <div className="sp-form-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="sp-field">
                    <label><LockKeyhole size={11} />Current Password</label>
                    <input className="sp-input" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
                  </div>
                  <div className="sp-field">
                    <label><LockKeyhole size={11} />New Password</label>
                    <input className="sp-input" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required />
                  </div>
                  <div className="sp-field">
                    <label><LockKeyhole size={11} />Confirm Password</label>
                    <input className="sp-input" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
                  </div>
                  {passwordError && <p className="sp-error">{passwordError}</p>}
                </div>
              </div>
              <div className="sp-card-footer">
                <button type="submit" className="sp-btn-primary">Change Password</button>
                {passwordMessage && <span className="sp-saved">{passwordMessage}</span>}
              </div>
            </form>
          </section>

          {/* APPEARANCE CARD */}
          <section className="sp-card sp-col-6">
            <div className="sp-card-header">
              <span className="sp-card-title">Appearance</span>
              <Palette size={14} color="#bbb" />
            </div>
            <div className="sp-rows">
              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><Sun size={13} color="#0a0a0a" /></div>
                  <div>
                    <div className="sp-row-label">Theme mode</div>
                    <div className="sp-row-help">Choose your preferred interface theme.</div>
                  </div>
                </div>
                <div className="sp-theme-group">
                  <button className={`sp-theme-btn ${activeTheme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} type="button">
                    <Sun size={13} /> Light
                  </button>
                  <button className={`sp-theme-btn ${activeTheme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} type="button">
                    <Moon size={13} /> Dark
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* INSTALL CARD */}
          <section className="sp-card sp-col-6">
            <div className="sp-card-header">
              <span className="sp-card-title">Install App (PWA)</span>
              <Download size={14} color="#bbb" />
            </div>
            <div className="sp-rows">
              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><Download size={13} color="#0a0a0a" /></div>
                  <div>
                    <div className="sp-row-label">Install Sukuu Mu</div>
                    <div className="sp-row-help">Launch from home screen like a native app.</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="sp-install-btn"
                  onClick={handleInstall}
                  disabled={!canInstall}
                  aria-disabled={!canInstall}
                >
                  <Download size={13} />
                  {canInstall ? 'Install' : 'Unavailable'}
                </button>
              </div>
              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><ChevronRight size={13} color="#aaa" /></div>
                  <div>
                    <div className="sp-row-label" style={{ color: '#888', fontWeight: 400 }}>Installation status</div>
                  </div>
                </div>
                <span className={`sp-status-pill ${installStatus === 'Installed' ? 'installed' : canInstall ? 'ready' : 'unavailable'}`}>
                  <span className="sp-status-dot" />
                  {installStatus}
                </span>
              </div>
            </div>
          </section>

          {/* APP PREFERENCES CARD — full width */}
          <section className="sp-card sp-col-12">
            <div className="sp-card-header">
              <span className="sp-card-title">App Preferences</span>
              <Sliders size={14} color="#bbb" />
            </div>
            <div className="sp-rows">
              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><Bell size={13} color="#0a0a0a" /></div>
                  <div>
                    <div className="sp-row-label">Email notifications</div>
                    <div className="sp-row-help">Receive account and school updates via email.</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`sp-toggle ${preferences.emailNotifications ? 'on' : 'off'}`}
                  onClick={() => setPreferences((p) => ({ ...p, emailNotifications: !p.emailNotifications }))}
                >
                  <span className="sp-toggle-dot" />
                </button>
              </div>

              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><Sparkles size={13} color="#0a0a0a" /></div>
                  <div>
                    <div className="sp-row-label">Reduced motion</div>
                    <div className="sp-row-help">Lower visual motion for comfort and focus.</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`sp-toggle ${preferences.reducedMotion ? 'on' : 'off'}`}
                  onClick={() => setPreferences((p) => ({ ...p, reducedMotion: !p.reducedMotion }))}
                >
                  <span className="sp-toggle-dot" />
                </button>
              </div>

              <div className="sp-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sp-row-icon"><MonitorSmartphone size={13} color="#0a0a0a" /></div>
                  <div>
                    <div className="sp-row-label">Compact tables</div>
                    <div className="sp-row-help">Use denser rows to fit more data on screen.</div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`sp-toggle ${preferences.compactTables ? 'on' : 'off'}`}
                  onClick={() => setPreferences((p) => ({ ...p, compactTables: !p.compactTables }))}
                >
                  <span className="sp-toggle-dot" />
                </button>
              </div>
            </div>
            <div className="sp-card-footer">
              <button type="button" className="sp-btn-primary" onClick={savePreferences}>Save Preferences</button>
              {saveMessage && <span className="sp-saved">{saveMessage}</span>}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}