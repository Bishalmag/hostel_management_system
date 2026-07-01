import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Navigation links config for Hostel Management ──────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

// ─── Logo mark (hexagon SVG) with Hostel branding ─────────────────────────────
function LogoMark() {
  return (
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
  );
}

// ─── Hamburger icon (mobile) ─────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <rect
        y={open ? "7" : "0"} x="0" width="22" height="2" rx="1"
        fill="#c8daf0"
        style={{
          transformOrigin: "11px 8px",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease, y 0.25s ease",
        }}
      />
      <rect
        y="7" x="0" width="22" height="2" rx="1"
        fill="#c8daf0"
        style={{ opacity: open ? 0 : 1, transition: "opacity 0.15s ease" }}
      />
      <rect
        y={open ? "7" : "14"} x="0" width="22" height="2" rx="1"
        fill="#c8daf0"
        style={{
          transformOrigin: "11px 8px",
          transform: open ? "rotate(-45deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease, y 0.25s ease",
        }}
      />
    </svg>
  );
}

// ─── Main Navbar component ───────────────────────────────────────────────────
export default function Navbar({ onShowAuth }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    if (!isLandingPage) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);

  useEffect(() => {
    if (!isLandingPage) return;
    const ids = NAV_LINKS.map(l => l.href.replace("#", ""));
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveLink(`#${id}`); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [isLandingPage]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    if (isLandingPage) {
      setActiveLink(href);
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/${href}`);
    }
  };

  const handleBrandClick = () => {
    setMenuOpen(false);
    if (isLandingPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveLink("#home");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          inset: '0 0 auto 0',
          zIndex: 50,
          display: 'flex',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          transition: 'all 0.3s ease',
          background: (scrolled || !isLandingPage) 
            ? 'rgba(5, 13, 26, 0.95)' 
            : 'transparent',
          backdropFilter: (scrolled || !isLandingPage) ? 'blur(8px)' : 'none',
          borderBottom: (scrolled || !isLandingPage) ? '1px solid #1a3050' : 'none',
        }}
      >
        {/* ── Brand ── */}
        <a
          href={isLandingPage ? "#home" : "/"}
          aria-label="Hostel Management System home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.preventDefault();
            handleBrandClick();
          }}
        >
          <LogoMark />
          <div>
            <div style={{
              color: '#eaf2ff',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.05em',
              lineHeight: 1.2,
            }}>
              SMART HOSTEL OPERATION
            </div>
            <div style={{
              color: '#6b8aaa',
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              book your second home
            </div>
          </div>
        </a>

        {/* ── Desktop links ── */}
        <ul
          role="list"
          style={{
            display: 'flex',
            gap: '4px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
          className="nav-desktop-links"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = activeLink === href;
            return (
              <li key={href}>
                <a
                  href={isLandingPage ? href : "/"}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(href);
                  }}
                  style={{
                    display: 'block',
                    padding: '6px 22px',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 600,
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s ease',
                    color: (isActive && isLandingPage) ? '#f5a623' : '#6b8aaa',
                    borderBottom: (isActive && isLandingPage) ? '2px solid #f5a623' : '2px solid transparent',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive || !isLandingPage) {
                      e.currentTarget.style.color = '#c8daf0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive || !isLandingPage) {
                      e.currentTarget.style.color = '#6b8aaa';
                    }
                  }}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── CTA + Auth buttons ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}>
          {/* Login Button */}
          <button
            onClick={() => navigate("/loginPortal")}
            style={{
              background: '#f5a623',
              color: '#0a1628',
              border: '1px solid #0a1628',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '8px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e09515';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5a623';
            }}
          >
            Log In
          </button>

          {/* Sign Up Button */}
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: 'transparent',
              color: '#eaf2ff',
              border: '1px solid rgba(26, 48, 80, 0.3)',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '8px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign Up
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none',
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            className="md:block"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            zIndex: 40,
            background: 'rgba(10, 22, 40, 0.98)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #1a3050',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={isLandingPage ? href : "/"}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(href);
                setMenuOpen(false);
              }}
              style={{
                display: 'block',
                padding: '14px 48px',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                transition: 'color 0.15s ease',
                color: (activeLink === href && isLandingPage) ? '#f5a623' : '#c8daf0',
                textDecoration: 'none',
                borderLeft: (activeLink === href && isLandingPage) ? '3px solid #f5a623' : '3px solid transparent',
              }}
            >
              {label}
            </a>
          ))}
          {/* Mobile Auth Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
            padding: '0 16px',
          }}>
            <button
              onClick={() => {
                navigate("/loginPortal");
                setMenuOpen(false);
              }}
              style={{
                background: '#f5a623',
                color: '#0a1628',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e09515';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5a623';
              }}
            >
              Log In
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setMenuOpen(false);
              }}
              style={{
                background: 'transparent',
                color: '#eaf2ff',
                border: '1px solid rgba(26, 48, 80, 0.3)',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: '10px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(18, 36, 72, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Responsive style overrides */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .md\\\\:block { display: block !important; }
        }
        @media (min-width: 769px) {
          .md\\\\:block { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}