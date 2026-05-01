'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0a;
        }

        /* ── LEFT PANEL ── */
        .panel-left {
          position: relative;
          width: 58%;
          overflow: hidden;
        }

        .panel-left-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=85&auto=format&fit=crop');
          background-size: cover;
          background-position: center 30%;
          filter: grayscale(20%) contrast(1.05);
          transform: scale(1.03);
          animation: subtle-zoom 20s ease-in-out infinite alternate;
        }

        @keyframes subtle-zoom {
          from { transform: scale(1.03); }
          to   { transform: scale(1.08); }
        }

        .panel-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.35) 55%,
            rgba(0,0,0,0.60) 100%
          );
        }

        .panel-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
        }

        .brand-mark {
          display: flex;
          align-items: center;
        }

        .brand-logo {
          width: 180px;
          height: auto;
          flex-shrink: 0;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.04em;
        }

        .hero-text {
          max-width: 440px;
        }

        .hero-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 20px;
        }

        .hero-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(38px, 4vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          color: #ffffff;
          margin-bottom: 24px;
        }

        .hero-heading em {
          font-style: italic;
          color: rgba(255,255,255,0.75);
        }

        .hero-sub {
          font-size: 15px;
          font-weight: 300;
          line-height: 1.7;
          color: rgba(255,255,255,0.6);
          max-width: 340px;
        }

        .panel-left-footer {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #ffffff;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }

        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.18);
        }

        /* ── RIGHT PANEL ── */
        .panel-right {
          width: 42%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 52px;
          position: relative;
        }

        .panel-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #e0e0e0 30%, #e0e0e0 70%, transparent);
        }

        .form-container {
          width: 100%;
          max-width: 360px;
          animation: fade-up 0.6s ease both;
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-header {
          margin-bottom: 44px;
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 12px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #0a0a0a;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .form-subtitle {
          font-size: 14px;
          font-weight: 300;
          color: #888;
          line-height: 1.5;
        }

        .field-group {
          margin-bottom: 24px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 10px;
          transition: color 0.2s;
        }

        .field-label.focused {
          color: #0a0a0a;
        }

        .field-wrapper {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #0a0a0a;
          background: #f8f8f8;
          border: 1.5px solid transparent;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }

        .field-input::placeholder {
          color: #bbb;
        }

        .field-input:hover {
          background: #f4f4f4;
        }

        .field-input:focus {
          background: #ffffff;
          border-color: #0a0a0a;
          box-shadow: 0 0 0 3px rgba(10,10,10,0.06);
        }

        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .field-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          height: 2px;
          background: #0a0a0a;
          width: 0;
          transform: translateX(-50%);
          transition: width 0.3s ease;
          border-radius: 0 0 6px 6px;
        }

        .field-input:focus ~ .field-underline {
          width: 100%;
        }

        .error-alert {
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          font-size: 13px;
          color: #dc2626;
          margin-bottom: 20px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #ffffff;
          background: #0a0a0a;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          margin-top: 8px;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #1a1a1a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: none;
        }

        .submit-btn:disabled {
          background: #d4d4d4;
          cursor: not-allowed;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .demo-section {
          margin-top: 44px;
          padding-top: 32px;
          border-top: 1px solid #ebebeb;
        }

        .demo-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #bbb;
          margin-bottom: 14px;
        }

        .demo-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: #f8f8f8;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
        }

        .demo-card:hover {
          background: #f0f0f0;
          border-color: #e0e0e0;
        }

        .demo-role {
          font-size: 12px;
          font-weight: 500;
          color: #333;
          letter-spacing: 0.02em;
        }

        .demo-cred {
          font-size: 11px;
          color: #aaa;
          font-family: 'Courier New', monospace;
        }

        .demo-arrow {
          font-size: 12px;
          color: #ccc;
          transition: transform 0.15s, color 0.15s;
        }

        .demo-card:hover .demo-arrow {
          transform: translateX(3px);
          color: #888;
        }

        .form-footer {
          margin-top: 24px;
          text-align: center;
        }

        .form-footer-text {
          font-size: 12px;
          color: #bbb;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .panel-left { display: none; }
          .panel-right {
            width: 100%;
            background-image: url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=85&auto=format&fit=crop');
            background-size: cover;
            background-position: center;
          }
          .panel-right::before { display: none; }
          .panel-right::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(255,255,255,0.93);
          }
          .form-container { position: relative; z-index: 1; }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT: Hero panel ── */}
        <div className="panel-left">
          <div className="panel-left-bg" />
          <div className="panel-left-overlay" />
          <div className="panel-left-content">

            <div className="brand-mark">
              <Image
                src="/logo.png"
                alt="Sukuu Mu Logo"
                width={180}
                height={86}
                className="brand-logo"
              />
            </div>

            <div className="hero-text">
              <p className="hero-eyebrow">School Management Platform</p>
              <h2 className="hero-heading">
                Everything your school needs,<br />
                <em>in one place.</em>
              </h2>
              <p className="hero-sub">
                Manage students, staff, timetables, and finances — with clarity and control.
              </p>
            </div><br /><br />

          </div>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div className="panel-right">
          <div className="form-container">

            <div className="form-header">
              <p className="form-eyebrow">Welcome back</p>
              <h1 className="form-title">Sign in</h1>
              <p className="form-subtitle">Enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-alert">{error}</div>
              )}

              <div className="field-group">
                <label
                  htmlFor="email"
                  className={`field-label ${focusedField === 'email' ? 'focused' : ''}`}
                >
                  Email Address
                </label>
                <div className="field-wrapper">
                  <input
                    id="email"
                    type="email"
                    className="field-input"
                    placeholder="admin@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    required
                  />
                  <div className="field-underline" />
                </div>
              </div>

              <div className="field-group">
                <label
                  htmlFor="password"
                  className={`field-label ${focusedField === 'password' ? 'focused' : ''}`}
                >
                  Password
                </label>
                <div className="field-wrapper">
                  <input
                    id="password"
                    type="password"
                    className="field-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isSubmitting}
                    required
                  />
                  <div className="field-underline" />
                </div>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting && <span className="spinner" />}
                {isSubmitting ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="demo-section">
              <p className="demo-label">Demo Credentials</p>
              <div className="demo-grid">
                {[
                  { role: 'Admin', cred: 'admin@school.com / admin123', e: 'admin@school.com', p: 'admin123' },
                  { role: 'Manager', cred: 'manager@school.com / manager123', e: 'manager@school.com', p: 'manager123' },
                  { role: 'Teacher', cred: 'teacher@school.com / teacher123', e: 'teacher@school.com', p: 'teacher123' },
                ].map((d) => (
                  <div
                    key={d.role}
                    className="demo-card"
                    onClick={() => { setEmail(d.e); setPassword(d.p); }}
                  >
                    <span className="demo-role">{d.role}</span>
                    <span className="demo-cred">{d.cred}</span>
                    <span className="demo-arrow"></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-footer">
              <p className="form-footer-text">© {new Date().getFullYear()} Sukuu Mu · All rights reserved</p>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}