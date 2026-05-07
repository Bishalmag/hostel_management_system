import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Navigation links config for Hostel Management ──────────────────────────
const NAV_LINKS = [
  { label: "Home",         href: "#home" },
  { label: "Features",     href: "#features" },
  { label: "Reviews", href: "#reviews" },
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

  // Detect scroll to apply backdrop blur / border
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
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
  }, []);

  const handleNavClick = (href) => {
    setActiveLink(href);
    setMenuOpen(false);
  };
  const navigate = useNavigate();

  return (
    <>
      <nav
  role="navigation"
  aria-label="Main navigation"
  className={`fixed inset-x-0 z-50 flex h-16 items-center justify-between px-6 transition-all duration-300 ${
    scrolled
      ? "bg-grey/95 backdrop-blur border-b"
      : "bg-transparent"
  }`}
>
        {/* ── Brand ── */}
        <a
          href="#home"
          aria-label="Hostel Management System home"
          className="flex items-center gap-4.5 text-decoration-none"
          onClick={() => handleNavClick("#home")}
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
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavClick(href)}
                  className={`block px-5.5 py-1.5 font-mono font-semibold text-xs tracking-wider uppercase transition-colors duration-200
                    ${isActive
                      ? 'text-amber-500 border-b-2 border-amber-800'
                      : 'text-textDim hover:text-text'
                    }`}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.classList.remove('text-textDim');
                    if (!isActive) e.currentTarget.classList.add('text-text');
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.classList.remove('text-text');
                    if (!isActive) e.currentTarget.classList.add('text-textDim');
                  }}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── CTA + Auth buttons ── */}
        <div className="flex items-center gap-5">
          <button
  onClick={() => navigate("/login")}
  className="bg-amber-500 text-amber-900 border border-amber-900 font-mono font-bold text-xs tracking-wide uppercase px-8 py-8 rounded hover:bg-amber-500/15 transition-all duration-200"
>
  Log In
</button>

<button
  onClick={() => navigate("/signup")}
  className="bg-amber-500 text-amber-900 border border-amber-800 font-mono font-bold text-xs tracking-wide uppercase px-8 py-8 rounded hover:bg-amber-500/15 transition-all duration-200"
>
  Register
</button>

          {/* Mobile hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className="hidden md:block p-1"
          >
            {/* <HamburgerIcon open={menuOpen} /> */}
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
              href={href}
              onClick={() => handleNavClick(href)}
              className={`block px-12 py-3.5 font-mono font-semibold text-xs tracking-tighter uppercase transition-colors duration-150
                ${activeLink === href
                  ? 'text-amber-500 border-l-3 border-amber-500'
                  : 'text-text'
                }`}
            >
              {label}
            </a>
          ))}
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