import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Footer column data for Hostel Management ────────────────────────────────
const FOOTER_LINKS = {
  Platform: [
    { label: "Room Booking", href: "#booking" },
    { label: "Payment System", href: "#payments" },
  ],
  Services: [
    { label: "Accommodation", href: "#rooms" },
    { label: "Housekeeping", href: "#facilities" },
    { label: "Maintenance", href: "#maintenance" },
  ],
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Support", href: "#support" },
  ],
};

// ─── Logo mark ───────────────────────────────────────────────────────────────
function FooterLogo() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" aria-hidden="true">
        <path
          d="M16 1L30 9V27L16 35L2 27V9L16 1Z"
          fill="#f5a623"
          stroke="#f5a623"
          strokeWidth="1"
        />
        <text
          x="16" y="22"
          textAnchor="middle"
          fontFamily="'Space Mono', monospace"
          fontWeight="700"
          fontSize="11"
          fill="#050d1a"
        >HMS</text>
      </svg>
      <div>
        <div style={{
          color: '#eaf2ff',
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.05em',
          lineHeight: 1.2,
        }}>
          SMART HOSTEL
        </div>
        <div style={{
          color: '#6b8aaa',
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Management System
        </div>
      </div>
    </div>
  );
}

// ─── Single nav column ────────────────────────────────────────────────────────
function FooterColumn({ heading, links }) {
  return (
    <div>
      <h3 style={{
        color: '#f5a623',
        fontFamily: "'Space Mono', monospace",
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        {heading}
      </h3>
      <ul style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}>
        {links.map(({ label, href }) => (
          <li key={label} style={{ marginBottom: '8px' }}>
            <a
              href={href}
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: '14px',
                color: '#6b8aaa',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#eaf2ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6b8aaa';
              }}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main Footer component ────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer
      role="contentinfo"
      style={{
        background: '#0a1628',
        borderTop: '1px solid #1a3050',
      }}
    >
      {/* ── Main footer body ── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
        }}>
          {/* Brand column */}
          <div>
            <FooterLogo />
            <p style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: '14px',
              color: '#6b8aaa',
              lineHeight: 1.8,
              marginTop: '16px',
              maxWidth: '280px',
            }}>
              Manage your hostel operations with our all-in-one management solution.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <FooterColumn key={heading} heading={heading} links={links} />
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: '1px solid #1a3050',
          marginTop: '32px',
          paddingTop: '24px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: '#3a5070',
            margin: 0,
          }}>
            &copy; {year} SHOSTEL MANAGEMENT SYSTEM
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <a
              href="#privacy"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: '#3a5070',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3a5070';
              }}
            >
              Privacy Policy
            </a>
            <span style={{
              width: '1px',
              height: '12px',
              background: '#1a3050',
            }} />
            <a
              href="#terms"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: '#3a5070',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3a5070';
              }}
            >
              Terms
            </a>
            <span style={{
              width: '1px',
              height: '12px',
              background: '#1a3050',
            }} />
            <a
              href="#support"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: '#3a5070',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f5a623';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3a5070';
              }}
            >
              Support
            </a>
            <span style={{
              width: '1px',
              height: '12px',
              background: '#1a3050',
            }} />
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: '#3a5070',
            }}>
              v1.0.0
            </span>
            <span style={{
              width: '1px',
              height: '12px',
              background: '#1a3050',
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#1ddba8',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                color: '#3a5070',
              }}>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </footer>
  );
}