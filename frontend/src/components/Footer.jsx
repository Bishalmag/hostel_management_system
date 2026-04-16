import { useState, useEffect } from "react";

// ─── Footer column data for Hostel Management ────────────────────────────────
const FOOTER_LINKS = {
  Platform: [
    { label: "Room Booking",    href: "#booking" },
    { label: "Property Management", href: "#properties" },
    { label: "Payment System",  href: "#payments" },
  ],
  Services: [
    { label: "Accommodation",   href: "#rooms" },
    { label: "Meals & Dining",  href: "#facilities" },
    { label: "Laundry Service", href: "#facilities" },
    { label: "Housekeeping",    href: "#facilities" },
    { label: "Maintenance",     href: "#maintenance" },
  ],
  Company: [
    { label: "About Us",        href: "#about" },
    { label: "Contact Info",    href: "#contact" },
    { label: "Careers",         href: "#careers" },
    { label: "Blog",            href: "#blog" },
  ],
};

// ─── Logo mark ───────────────────────────────────────────────────────────────
function FooterLogo() {
  return (
    <div className="flex items-center gap-3 mb-5">
      <svg width="36" height="40" viewBox="0 0 36 40" fill="none" aria-hidden="true">
        <path
          d="M18 1L34 10V30L18 39L2 30V10L18 1Z"
          fill="#f5a623"
        />
        <text
          x="18" y="24"
          textAnchor="middle"
          fontFamily="'Space Mono', monospace"
          fontWeight="700"
          fontSize="12"
          fill="#050d1a"
        >HM</text>
      </svg>
      <div>
        <div className="text-white font-mono font-bold text-base tracking-wide leading-tight">
          HOSTEL HUB
        </div>
        <div className="text-textDim font-mono text-xs tracking-wider uppercase">
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
      <h3 className="text-amber-500 font-mono text-xs font-bold tracking-wider uppercase mb-4">
        {heading}
      </h3>
      <ul className="list-none space-y-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className={`font-display text-sm text-textDim hover:text-text transition-colors duration-200 tracking-tight
                ${label.toLowerCase().includes('careers') || label.toLowerCase().includes('blog')
                  ? 'hover:text-amber-500'
                  : ''}
              `}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Status indicator ─────────────────────────────────────────────────────────
function StatusBadge({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse duration-2000`} />
      <span className={`font-mono text-xs text-textDim tracking-tighter uppercase`}>{label}</span>
    </div>
  );
}

// ─── Main Footer component for Hostel Management ────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      role="contentinfo"
      className="bg-bgMid border-t border-border relative overflow-hidden"
    >
      {/* Decorative top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-teal-500" />

      {/* ── Main footer body ── */}
      <div className="px-10 py-16 grid grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        {/* Brand column */}
        <div>
          <FooterLogo />
          <p className="font-display text-sm text-textDim leading-relaxed max-w-[300px] mb-7">
            A comprehensive hostel management platform designed to streamline
            guest bookings, staff coordination, and facility management. Modern
            technology meets hospitality excellence for seamless operations.
          </p>

          {/* Status badges */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge color="bg-teal-500" label="24/7 Support" />
            <StatusBadge color="bg-amber-500" label="99.9% Uptime" />
            <StatusBadge color="bg-teal-500" label="Secure & Compliant" />
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <FooterColumn key={heading} heading={heading} links={links} />
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border px-10 py-5 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
        <p className="font-mono text-xs text-textFaint tracking-tighter">
          &copy; {year} HOSTEL HUB &mdash; Modern Hostel Management Solutions
        </p>

        <div className="flex flex-wrap gap-6 text-center sm:justify-center">
          {["Privacy Policy", "Terms of Service", "Contact Us"].map(item => (
            <a
              key={item}
              href="#contact"
              className={`font-mono text-xs text-textFaint tracking-tighter uppercase hover:text-amber-500 transition-colors duration-200`}
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Decorative background hex pattern */}
      <div
        aria-hidden="true"
        className="absolute bottom-[-10px] right-[-10px] opacity-5 text-[220px] font-display font-bold text-amber-500 leading-none pointer-events-none select-none"
      >
        HM
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div:nth-child(2) {
            grid-template-columns: 1fr 1fr !important;
            padding: 48px 32px 32px !important;
          }
          footer > div:nth-child(3),
          footer > div:nth-child(4) {
            padding: 0 32px !important;
            margin: 0 32px !important;
          }
        }
        @media (max-width: 600px) {
          footer > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}