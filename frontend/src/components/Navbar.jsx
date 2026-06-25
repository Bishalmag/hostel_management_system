import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Navigation links config for Hostel Management ──────────────────────────
const NAV_LINKS = [
  { label: "Home",         href: "#home" },
  { label: "Features",     href: "#features" },
  { label: "Reviews",      href: "#reviews" },
  { label: "Contact",      href: "#contact" },
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

// ─── Main Navbar component for Hostel Management System ───────────────────────
export default function Navbar({ onShowAuth }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the landing page
  const isLandingPage = location.pathname === "/";

  // Detect scroll to apply backdrop blur / border (only on landing page)
  useEffect(() => {
    if (!isLandingPage) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLandingPage]);

  // Track active section via IntersectionObserver (only on landing page)
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
    
    // If on landing page, scroll to section
    if (isLandingPage) {
      setActiveLink(href);
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, navigate to landing page with hash
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
        className={`fixed inset-x-0 z-50 flex h-16 items-center justify-between px-6 transition-all duration-300 ${
          scrolled || !isLandingPage
            ? "bg-grey/95 backdrop-blur border-b"
            : "bg-transparent"
        }`}
      >
        {/* ── Brand ── */}
        <a
          href={isLandingPage ? "#home" : "/"}
          aria-label="Hostel Management System home"
          className="flex items-center gap-4.5 text-decoration-none cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            handleBrandClick();
          }}
        >
          <LogoMark />
          <div>
            <div className="text-white font-mono font-bold text-sm tracking-wide leading-tight">
              SMART HOSTEL OPERATION
            </div>
            <div className="text-textDim font-mono text-xs tracking-wider uppercase">
              book your second home
            </div>
          </div>
        </a>

        {/* ── Desktop links ── */}
        <ul
          role="list"
          className="flex gap-1 list-none m-0 p-0 nav-desktop-links"
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
                  className={`block px-5.5 py-1.5 font-mono font-semibold text-xs tracking-wider uppercase transition-colors duration-200
                    ${isActive && isLandingPage
                      ? 'text-amber-500 border-b-2 border-amber-800'
                      : 'text-textDim hover:text-text'
                    }`}
                  onMouseEnter={e => {
                    if (!isActive || !isLandingPage) {
                      e.currentTarget.classList.remove('text-textDim');
                      e.currentTarget.classList.add('text-text');
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive || !isLandingPage) {
                      e.currentTarget.classList.remove('text-text');
                      e.currentTarget.classList.add('text-textDim');
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
        <div className="flex items-center gap-6">
          {/* Login Button */}
          <button
            onClick={() => navigate("/loginPortal")}
            className="bg-amber-500 text-amber-900 border border-amber-900 font-mono font-bold text-xs tracking-wide uppercase px-6 py-2 rounded hover:bg-amber-500/80 transition-all duration-200"
          >
            Log In
          </button>

          {/* Sign Up Button */}
          <button
            onClick={() => navigate("/signup")}
            className="bg-transparent text-white border border-white/30 font-mono font-bold text-xs tracking-wide uppercase px-6 py-2 rounded hover:bg-white/10 transition-all duration-200"
          >
            Sign Up
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="hidden md:block p-1"
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
          className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-border p-4 animation-fadeIn duration-200"
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
              className={`block px-12 py-3.5 font-mono font-semibold text-xs tracking-tighter uppercase transition-colors duration-150
                ${activeLink === href && isLandingPage
                  ? 'text-amber-500 border-l-3 border-amber-500'
                  : 'text-text'
                }`}
            >
              {label}
            </a>
          ))}
          {/* Mobile Auth Buttons */}
          <div className="flex flex-col gap-3 mt-4 px-4">
            <button
              onClick={() => {
                navigate("/loginPortal");
                setMenuOpen(false);
              }}
              className="bg-amber-500 text-amber-900 font-mono font-bold text-xs tracking-wide uppercase px-6 py-3 rounded w-full"
            >
              Log In
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setMenuOpen(false);
              }}
              className="bg-transparent border border-white/30 text-white font-mono font-bold text-xs tracking-wide uppercase px-6 py-3 rounded w-full"
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
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}