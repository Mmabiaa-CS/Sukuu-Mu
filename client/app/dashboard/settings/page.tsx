'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { Moon, Sun, Download, Bell, MonitorSmartphone, Sparkles, UserRound, LockKeyhole, Mail, Phone, MapPin } from 'lucide-react';

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } catch (error) {
      console.error('Could not save preferences:', error);
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
    } catch (error) {
      console.error('Failed to update profile:', error);
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
      console.error('Failed to change password:', error);
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
    } catch (error) {
      console.error('PWA install failed:', error);
      setInstallStatus('Install failed');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .set-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 1200px;
          margin: 0 auto;
          animation: set-in 0.4s ease both;
        }
        @keyframes set-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .set-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:30px; padding-bottom:24px; border-bottom:1px solid #e8e8e6; }
        .set-eyebrow { font-size:10px; font-weight:500; letter-spacing:.18em; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
        .set-title { font-family:'Playfair Display',serif; font-size:36px; font-weight:700; line-height:1.1; margin-bottom:6px; }
        .set-sub { font-size:13px; font-weight:300; color:#8f8f8f; }

        .set-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:14px; }
        .set-card { background:#fff; border:1px solid #e8e8e6; border-radius:12px; padding:22px 24px; box-shadow: 0 1px 2px rgba(0,0,0,.02); }
        .set-card.wide { grid-column: span 2; }
        .set-card-title { font-size:10px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; color:#aaa; margin-bottom:16px; }
        .set-row { display:flex; align-items:center; justify-content:space-between; gap:10px; margin:12px 0; }
        .set-label { font-size:13px; color:#222; }
        .set-help { font-size:11px; color:#999; margin-top:2px; }

        .set-profile-head { display:flex; align-items:center; gap:16px; margin-bottom:14px; }
        .set-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(145deg,#0a0a0a,#3a3a3a); color:#fff; font-size:24px; font-weight:700; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(0,0,0,.22); animation:set-pulse 2.5s ease-in-out infinite; }
        @keyframes set-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        .set-profile-name { font-size:20px; font-weight:700; color:#111; }
        .set-profile-role { font-size:12px; color:#777; text-transform:capitalize; }
        .set-card-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .set-field { display:flex; flex-direction:column; gap:6px; }
        .set-field label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#888; }
        .set-input { height:42px; border:1px solid #e2e2e2; border-radius:10px; padding:0 12px; font-size:13px; background:#fff; }
        .set-input:focus { outline:none; border-color:#0a0a0a; box-shadow:0 0 0 3px rgba(10,10,10,.08); }

        .set-theme-group { display:flex; gap:8px; }
        .set-btn { border:1px solid #ddd; background:#fff; color:#222; border-radius:8px; padding:8px 12px; font-size:12px; display:flex; align-items:center; gap:6px; cursor:pointer; }
        .set-btn.active { background:#0a0a0a; color:#fff; border-color:#0a0a0a; }
        .set-btn.primary { background:#0a0a0a; color:#fff; border-color:#0a0a0a; }
        .set-btn:disabled { opacity:.45; cursor:not-allowed; }
        .set-status { font-size:11px; color:#777; }

        .set-toggle { width:44px; height:24px; border-radius:999px; border:none; cursor:pointer; display:inline-flex; align-items:center; padding:2px; transition:.2s; }
        .set-toggle.off { background:#d4d4d4; }
        .set-toggle.on { background:#0a0a0a; }
        .set-toggle-dot { width:20px; height:20px; background:#fff; border-radius:999px; transition:.2s; }
        .set-toggle.on .set-toggle-dot { transform: translateX(20px); }

        .set-actions { margin-top:18px; display:flex; align-items:center; gap:10px; }
        .set-save { padding:10px 16px; border:none; border-radius:8px; background:#0a0a0a; color:#fff; font-size:12px; cursor:pointer; }
        .set-error { margin-top:8px; font-size:12px; color:#b52b2b; }
        .set-saved { font-size:12px; color:#2d7a4f; }

        @media (max-width: 700px) {
          .set-root { padding:24px 18px; }
          .set-header { flex-direction:column; align-items:flex-start; gap:12px; }
          .set-card.wide { grid-column:auto; }
          .set-card-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="set-root">
        <div className="set-header">
          <div>
            <div className="set-eyebrow">Personalization</div>
            <h1 className="set-title">Settings</h1>
            <p className="set-sub">Manage your profile, account security, app behavior, and installation.</p>
          </div>
        </div>

        <div className="set-grid">
          <section className="set-card wide">
            <h2 className="set-card-title">Profile Details</h2>
            <div className="set-profile-head">
              <div className="set-avatar" aria-label="Profile avatar">{initials || 'U'}</div>
              <div>
                <div className="set-profile-name">{user?.firstName} {user?.lastName}</div>
                <div className="set-profile-role">{user?.role ?? 'User'} account</div>
              </div>
            </div>
            <form onSubmit={handleProfileSave}>
              <div className="set-card-grid">
                <div className="set-field">
                  <label><UserRound size={12} style={{ display: 'inline', marginRight: 4 }} />First Name</label>
                  <input className="set-input" value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="set-field">
                  <label><UserRound size={12} style={{ display: 'inline', marginRight: 4 }} />Last Name</label>
                  <input className="set-input" value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div className="set-field">
                  <label><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email</label>
                  <input className="set-input" value={user?.email ?? ''} disabled />
                </div>
                <div className="set-field">
                  <label><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</label>
                  <input className="set-input" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="set-field" style={{ gridColumn: 'span 2' }}>
                  <label><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Address</label>
                  <input className="set-input" value={profileForm.address} onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
              <div className="set-actions">
                <button type="submit" className="set-save">Save Profile</button>
                {profileMessage && <span className="set-saved">{profileMessage}</span>}
              </div>
            </form>
          </section>

          <section className="set-card">
            <h2 className="set-card-title">Security</h2>
            <form onSubmit={handlePasswordSave}>
              <div className="set-field">
                <label><LockKeyhole size={12} style={{ display: 'inline', marginRight: 4 }} />Current Password</label>
                <input className="set-input" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
              </div>
              <div className="set-field" style={{ marginTop: '10px' }}>
                <label>New Password</label>
                <input className="set-input" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} required />
              </div>
              <div className="set-field" style={{ marginTop: '10px' }}>
                <label>Confirm Password</label>
                <input className="set-input" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>
              {passwordError && <p className="set-error">{passwordError}</p>}
              <div className="set-actions">
                <button type="submit" className="set-save">Change Password</button>
                {passwordMessage && <span className="set-saved">{passwordMessage}</span>}
              </div>
            </form>
          </section>

          <section className="set-card">
            <h2 className="set-card-title">Appearance</h2>
            <div className="set-row">
              <div>
                <div className="set-label">Theme mode</div>
                <div className="set-help">Choose your preferred interface theme.</div>
              </div>
              <div className="set-theme-group">
                <button className={`set-btn ${activeTheme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} type="button">
                  <Sun size={14} /> Light
                </button>
                <button className={`set-btn ${activeTheme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} type="button">
                  <Moon size={14} /> Dark
                </button>
              </div>
            </div>
          </section>

          <section className="set-card">
            <h2 className="set-card-title">Install App (PWA)</h2>
            <div className="set-row">
              <div>
                <div className="set-label">Install Sukuu Mu</div>
                <div className="set-help">Launch from home screen like a native app.</div>
              </div>
              <button type="button" className="set-btn primary" onClick={handleInstall} disabled={!canInstall} aria-disabled={!canInstall}>
                <Download size={14} /> {canInstall ? 'Install' : 'Unavailable'}
              </button>
            </div>
            <p className="set-status">Status: {installStatus}</p>
          </section>

          <section className="set-card wide">
            <h2 className="set-card-title">App Preferences</h2>
            <div className="set-row">
              <div>
                <div className="set-label"><Bell size={14} style={{ display: 'inline', marginRight: 6 }} />Email notifications</div>
                <div className="set-help">Receive account and school updates via email.</div>
              </div>
              <button type="button" className={`set-toggle ${preferences.emailNotifications ? 'on' : 'off'}`} onClick={() => setPreferences((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))}>
                <span className="set-toggle-dot" />
              </button>
            </div>

            <div className="set-row">
              <div>
                <div className="set-label"><Sparkles size={14} style={{ display: 'inline', marginRight: 6 }} />Reduced motion</div>
                <div className="set-help">Lower visual motion for comfort and focus.</div>
              </div>
              <button type="button" className={`set-toggle ${preferences.reducedMotion ? 'on' : 'off'}`} onClick={() => setPreferences((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))}>
                <span className="set-toggle-dot" />
              </button>
            </div>

            <div className="set-row">
              <div>
                <div className="set-label"><MonitorSmartphone size={14} style={{ display: 'inline', marginRight: 6 }} />Compact tables</div>
                <div className="set-help">Use denser rows to fit more data on screen.</div>
              </div>
              <button type="button" className={`set-toggle ${preferences.compactTables ? 'on' : 'off'}`} onClick={() => setPreferences((prev) => ({ ...prev, compactTables: !prev.compactTables }))}>
                <span className="set-toggle-dot" />
              </button>
            </div>

            <div className="set-actions">
              <button type="button" className="set-save" onClick={savePreferences}>Save Preferences</button>
              {saveMessage && <span className="set-saved">{saveMessage}</span>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
