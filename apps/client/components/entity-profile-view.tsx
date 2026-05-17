'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export type ProfileField = {
  label: string;
  value: React.ReactNode;
};

type EntityProfileViewProps = {
  theme: 'student' | 'teacher';
  eyebrow: string;
  title: string;
  subtitle?: string;
  initials: string;
  statusLabel?: string;
  statusActive?: boolean;
  backHref: string;
  backLabel?: string;
  fields: ProfileField[];
  sections?: React.ReactNode;
};

export function EntityProfileView({
  theme,
  eyebrow,
  title,
  subtitle,
  initials,
  statusLabel,
  statusActive = true,
  backHref,
  backLabel = 'Back',
  fields,
  sections,
}: EntityProfileViewProps) {
  const prefix = theme === 'student' ? 'ep-sp' : 'ep-tp';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700&family=DM+Sans:wght@300;400;500&display=swap');

        .${prefix}-root {
          font-family: 'DM Sans', sans-serif;
          color: #0a0a0a;
          background: #f9f9f8;
          min-height: 100vh;
          padding: 44px 48px;
          max-width: 960px;
          margin: 0 auto;
          animation: ep-in 0.4s ease both;
        }
        @keyframes ep-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .${prefix}-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #666;
          text-decoration: none;
          margin-bottom: 28px;
          transition: color 0.15s;
        }
        .${prefix}-back:hover { color: #0a0a0a; }

        .${prefix}-header {
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e8e8e6;
        }
        .${prefix}-eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 8px;
        }
        .${prefix}-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .${prefix}-sub { font-size: 13px; font-weight: 300; color: #aaa; }

        .${prefix}-card {
          background: #fff;
          border: 1px solid #e8e8e6;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .${prefix}-card-head {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 24px 28px;
          border-bottom: 1px solid #f0f0ee;
          background: linear-gradient(180deg, #fafaf9 0%, #fff 100%);
        }
        .${prefix}-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #0a0a0a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .${prefix}-head-text { flex: 1; min-width: 0; }
        .${prefix}-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .${prefix}-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .${prefix}-status.active { background: #e8f5ee; color: #1a6b42; }
        .${prefix}-status.inactive { background: #f5f5f4; color: #888; }
        .${prefix}-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .${prefix}-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        @media (max-width: 640px) {
          .${prefix}-grid { grid-template-columns: 1fr; }
          .${prefix}-root { padding: 28px 20px; }
        }
        .${prefix}-field {
          padding: 18px 28px;
          border-bottom: 1px solid #f4f4f2;
          border-right: 1px solid #f4f4f2;
        }
        .${prefix}-field:nth-child(2n) { border-right: none; }
        .${prefix}-field-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 6px;
        }
        .${prefix}-field-value {
          font-size: 15px;
          font-weight: 400;
          color: #0a0a0a;
          word-break: break-word;
        }
      `}</style>

      <div className={`${prefix}-root`}>
        <Link href={backHref} className={`${prefix}-back`}>
          <ArrowLeft size={16} />
          {backLabel}
        </Link>

        <div className={`${prefix}-header`}>
          <div className={`${prefix}-eyebrow`}>{eyebrow}</div>
          <h1 className={`${prefix}-title`}>{title}</h1>
          {subtitle && <p className={`${prefix}-sub`}>{subtitle}</p>}
        </div>

        <div className={`${prefix}-card`}>
          <div className={`${prefix}-card-head`}>
            <div className={`${prefix}-avatar`}>{initials}</div>
            <div className={`${prefix}-head-text`}>
              <div className={`${prefix}-card-title`}>{title}</div>
              {subtitle && <p className={`${prefix}-sub`}>{subtitle}</p>}
            </div>
            {statusLabel && (
              <span className={`${prefix}-status ${statusActive ? 'active' : 'inactive'}`}>
                <span className={`${prefix}-status-dot`} />
                {statusLabel}
              </span>
            )}
          </div>

          <div className={`${prefix}-grid`}>
            {fields.map((field) => (
              <div key={field.label} className={`${prefix}-field`}>
                <div className={`${prefix}-field-label`}>{field.label}</div>
                <div className={`${prefix}-field-value`}>{field.value ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {sections}
      </div>
    </>
  );
}
