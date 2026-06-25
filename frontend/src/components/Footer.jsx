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
    <div className="flex items-center gap-3">
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
        <div className="text-white font-mono font-bold text-sm tracking-wide leading-tight">
          SMART HOSTEL
        </div>
        <div className="text-textDim font-mono text-[10px] tracking-wider uppercase">
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
      <h3 className="text-amber-500 font-mono text-[11px] font-bold tracking-wider uppercase mb-3">
        {heading}
      </h3>
      <ul className="list-none space-y-2">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="font-display text-sm text-textDim hover:text-white transition-colors duration-200"
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
      className="bg-bgMid border-t border-border"
    >
      {/* ── Main footer body ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-1">
            <FooterLogo />
            <p className="font-display text-sm text-textDim leading-relaxed mt-4 max-w-[280px]">
               Your hostel operations with our all-in-one management solution.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <FooterColumn key={heading} heading={heading} links={links} />
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-textFaint">
            &copy; {year} SHOSTEL MANAGEMENT SYSTEM
          </p>

          
        </div>
      </div>
    </footer>
  );
}