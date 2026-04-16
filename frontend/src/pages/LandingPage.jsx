import { useState, useEffect, useRef } from "react";
import { colors, fonts } from "../theme";

// ─── Section label helper ─────────────────────────────────────────────────────
function SectionTag({ text }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      fontFamily: fonts.mono, fontSize: 10,
      letterSpacing: "0.22em", textTransform: "uppercase",
      color: colors.amber, marginBottom: 16,
    }}>
      <span style={{ width: 18, height: 1, background: colors.amber, display: "inline-block" }} />
      {text}
      <span style={{ width: 18, height: 1, background: colors.amber, display: "inline-block" }} />
    </div>
  );
}

// ─── Scroll-reveal counter ────────────────────────────────────────────────────
function Counter({ value, label, color }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();
  const num = parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/\d/g, "");

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0;
      const step = Math.max(1, Math.ceil(num / 60));
      const t = setInterval(() => {
        cur = Math.min(cur + step, num);
        setDisplay(cur);
        if (cur >= num) clearInterval(t);
      }, 18);
      obs.disconnect();
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [num]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: fonts.mono, fontWeight: 700,
        fontSize: "clamp(30px, 3.5vw, 44px)",
        color: color ?? colors.amber, lineHeight: 1, marginBottom: 6,
      }}>{display}{suffix}</div>
      <div style={{
        fontFamily: fonts.display, fontSize: 11, fontWeight: 600,
        color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.14em",
      }}>{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection({ onNavigate, onShowAuth }) {
  return (
    <section id="home" style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center",
      padding: "80px 80px 0", position: "relative", overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(${colors.border}55 1px, transparent 1px),
          linear-gradient(90deg, ${colors.border}55 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        animation: "gridFade 1.4s ease forwards", zIndex: 0,
      }} />

      {/* Teal radial glow right side */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "20%", right: "5%",
        width: 480, height: 480, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.teal}0f 0%, transparent 65%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{
        position: "relative", zIndex: 2, width: "100%",
        display: "grid", gridTemplateColumns: "1.15fr 0.85fr",
        gap: 80, alignItems: "center", maxWidth: 1280,
        paddingBottom: 80,
      }}>
        {/* ── Left: copy ── */}
        <div>
          {/* Admission badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            border: `1px solid ${colors.teal}55`,
            background: colors.tealGlow,
            padding: "6px 14px", borderRadius: 99,
            fontFamily: fonts.mono, fontSize: 10,
            color: colors.teal, letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 28,
            animation: "fadeUp 0.4s ease 0.1s both",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: colors.teal, animation: "pulse 2s ease-in-out infinite",
            }} />
            Admissions Open — Semester 2025
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: fonts.display, fontWeight: 800,
            fontSize: "clamp(44px, 5.5vw, 74px)",
            lineHeight: 1.04, letterSpacing: "-0.02em",
            color: colors.white, marginBottom: 6,
            animation: "fadeUp 0.5s ease 0.2s both",
          }}>
            Your Home
          </h1>
          <h1 style={{
            fontFamily: fonts.display, fontWeight: 800,
            fontSize: "clamp(44px, 5.5vw, 74px)",
            lineHeight: 1.04, letterSpacing: "-0.02em", marginBottom: 6,
            background: `linear-gradient(90deg, ${colors.amber} 0%, ${colors.teal} 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "fadeUp 0.5s ease 0.28s both, shimmer 5s linear 1s infinite",
          }}>
            Through Graduation
          </h1>

          <p style={{
            fontFamily: fonts.mono, fontSize: 10,
            color: colors.textDim, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 28,
            animation: "fadeUp 0.5s ease 0.32s both",
          }}>Smart Hostel Operations & Management System</p>

          <p style={{
            fontSize: 17, color: colors.text, lineHeight: 1.85,
            maxWidth: 510, marginBottom: 44,
            animation: "fadeUp 0.5s ease 0.36s both",
          }}>
            A secure, well-managed student residential hostel steps from campus.
            Semester-length leases, structured meal plans, a warden on every
            floor, and a study-first environment built for students who are here
            to graduate — not just pass through.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48,
            animation: "fadeUp 0.5s ease 0.42s both",
          }}>
            <button
              onClick={() => onShowAuth("signup")}
              style={{
                background: colors.amber, color: colors.bg,
                border: "none", cursor: "pointer",
                fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 12, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "14px 36px",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = colors.amberDim; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = colors.amber; e.currentTarget.style.transform = "translateY(0)"; }}
            >Apply for a Room</button>

            <button
              onClick={() => onShowAuth("login")}
              style={{
                background: "transparent",
                border: `1px solid ${colors.border}`,
                color: colors.text, cursor: "pointer",
                fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 12, letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "14px 36px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.amber; e.currentTarget.style.color = colors.amber; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text; }}
            >Student Portal</button>
          </div>

          {/* Trust strips */}
          <div style={{
            display: "flex", gap: 28, flexWrap: "wrap",
            animation: "fadeUp 0.5s ease 0.48s both",
          }}>
            {[
              { val: "5 min", sub: "walk to campus" },
              { val: "Semester+", sub: "minimum stay" },
              { val: "24 / 7", sub: "warden on duty" },
            ].map(b => (
              <div key={b.val} style={{
                borderLeft: `2px solid ${colors.amber}`,
                paddingLeft: 12,
              }}>
                <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 14, color: colors.amber }}>{b.val}</div>
                <div style={{ fontFamily: fonts.display, fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: visual ── */}
        <div style={{ position: "relative", height: 460 }}>
          {/* Shadow card */}
          <div style={{
            position: "absolute", top: 28, right: -8, left: 28,
            height: 360, border: `1px solid ${colors.border}`,
            background: colors.bgLight,
          }} />
          {/* Main image */}
          <div style={{
            position: "absolute", top: 0, right: 28, left: 0,
            height: 360, overflow: "hidden",
            border: `1px solid ${colors.amber}55`,
          }}>
            <img
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=380&fit=crop"
              alt="Furnished student room with study desk"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(180deg, transparent 40%, ${colors.bg}cc)`,
            }} />
            <div style={{
              position: "absolute", bottom: 18, left: 18, right: 18,
              display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            }}>
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.amber, letterSpacing: "0.18em", marginBottom: 4 }}>SINGLE OCCUPANCY</div>
                <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white }}>Study Room — Block A</div>
              </div>
              <div style={{
                background: colors.teal, color: colors.bg,
                fontFamily: fonts.mono, fontWeight: 700, fontSize: 9,
                padding: "5px 12px", letterSpacing: "0.12em",
                clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)",
              }}>AVAILABLE</div>
            </div>
          </div>

          {/* Floating availability card */}
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            background: colors.bgMid, border: `1px solid ${colors.border}`,
            padding: "18px 22px", width: 196,
            animation: "fadeUp 0.6s ease 0.6s both",
          }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.teal, letterSpacing: "0.15em", marginBottom: 8, textTransform: "uppercase" }}>Next Intake</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 15, color: colors.white, marginBottom: 3 }}>August 2025</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, marginBottom: 10 }}>Semester 1 · Limited seats</div>
            <div style={{ height: 1, background: colors.border, marginBottom: 10 }} />
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.amber }}>12 beds remaining</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS STRIP
// ═══════════════════════════════════════════════════════════════════════════════
function StatsStrip() {
  return (
    <section style={{
      borderTop: `1px solid ${colors.border}`,
      borderBottom: `1px solid ${colors.border}`,
      background: colors.bgMid,
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        maxWidth: 1280, margin: "0 auto",
      }}>
        {[
          { value: "240+", label: "Students housed",  color: colors.amber },
          { value: "6",    label: "Years operating",  color: colors.teal  },
          { value: "98%",  label: "Renewal rate",     color: colors.amber },
          { value: "3",    label: "Hostel blocks",    color: colors.teal  },
          { value: "4.8",  label: "Resident rating",  color: colors.amber },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "34px 24px",
            borderRight: i < 4 ? `1px solid ${colors.border}` : "none",
          }}>
            <Counter value={s.value} label={s.label} color={s.color} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function FeaturesSection() {
  const features = [
    {
      icon: "📚",
      title: "24-Hour Study Halls",
      description: "Quiet, climate-controlled study rooms on every floor with individual desks, power at every seat, 200 Mbps Wi-Fi, and no time restrictions — even during exam week.",
      accent: colors.amber,
    },
    {
      icon: "🍱",
      title: "Semester Mess Plans",
      description: "Three meals a day cooked fresh in the hostel kitchen. Buy a semester-long mess plan or pay per meal. Vegetarian options always available; dietary notes accepted.",
      accent: colors.teal,
    },
    {
      icon: "🛏️",
      title: "Furnished Private Rooms",
      description: "Every room has a study desk, ergonomic chair, single bed with mattress, wardrobe, and wall shelving. Nothing to carry in except your clothes and books.",
      accent: colors.amber,
    },
    {
      icon: "🔒",
      title: "Secure Residence",
      description: "Biometric door entry to all blocks, CCTV in corridors and common areas, visitor logbook, and a resident warden sleeping on-site every night.",
      accent: colors.teal,
    },
    {
      icon: "🧺",
      title: "Laundry & Housekeeping",
      description: "Coin-operated washers and dryers on every floor. Weekly room sweep and fortnightly linen change included in your residency agreement at no extra charge.",
      accent: colors.amber,
    },
    {
      icon: "📣",
      title: "Warden & Complaint System",
      description: "Raise maintenance or conduct complaints directly from the student portal. Every ticket is assigned to a warden and tracked to resolution within 48 hours.",
      accent: colors.teal,
    },
  ];

  return (
    <section id="features" style={{
      padding: "100px 80px",
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <SectionTag text="Facilities" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800, color: colors.white, lineHeight: 1.1, marginBottom: 16,
          }}>
            Built for Students,<br />
            <span style={{ color: colors.amber }}>Not Tourists</span>
          </h2>
          <p style={{
            fontSize: 16, color: colors.textDim,
            maxWidth: 500, margin: "0 auto", lineHeight: 1.8,
          }}>
            Every facility here is chosen because a student who lives here for
            months — not a weekend traveller — actually needs it.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px", background: colors.border,
        }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.07} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, accent, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? accent + "07" : colors.bg,
        padding: "36px 32px",
        transition: "background 0.25s",
        animation: `fadeUp 0.5s ease ${delay}s both`,
        position: "relative", cursor: "default",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: accent, opacity: hovered ? 1 : 0, transition: "opacity 0.25s",
      }} />
      <div style={{
        width: 48, height: 48,
        border: `1px solid ${hovered ? accent : colors.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 20,
        background: hovered ? accent + "12" : "transparent",
        transition: "all 0.25s",
      }}>{icon}</div>
      <h3 style={{
        fontFamily: fonts.display, fontSize: 17, fontWeight: 700,
        color: colors.white, marginBottom: 10, lineHeight: 1.3,
      }}>{title}</h3>
      <p style={{ fontSize: 14, color: colors.textDim, lineHeight: 1.8, margin: 0 }}>{description}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOM TYPES
// ═══════════════════════════════════════════════════════════════════════════════
function RoomsSection({ onShowAuth }) {
  const rooms = [
    {
      type: "Single Occupancy",
      block: "Block A / B",
      size: "120 sq ft",
      price: "NPR 6,500 / month",
      features: ["Private room with lock", "Study desk + ergonomic chair", "Full wardrobe", "Natural window light"],
      available: true,
      accent: colors.amber,
      img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=280&fit=crop",
    },
    {
      type: "Double Sharing",
      block: "Block B / C",
      size: "160 sq ft",
      price: "NPR 4,200 / month",
      features: ["Shared with 1 roommate", "2 individual study desks", "Separate wardrobes", "Balcony access"],
      available: true,
      accent: colors.teal,
      img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=280&fit=crop",
    },
    {
      type: "Triple Sharing",
      block: "Block C",
      size: "200 sq ft",
      price: "NPR 3,000 / month",
      features: ["Shared with 2 roommates", "3 study desks", "Individual lockable drawers", "Shared balcony"],
      available: false,
      accent: colors.violet,
      img: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=500&h=280&fit=crop",
    },
  ];

  return (
    <section id="rooms" style={{
      padding: "100px 80px",
      background: colors.bgMid,
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <SectionTag text="Room Types" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800, color: colors.white, lineHeight: 1.1, marginBottom: 16,
          }}>
            Choose Your <span style={{ color: colors.amber }}>Space</span>
          </h2>
          <p style={{ fontSize: 16, color: colors.textDim, maxWidth: 480, lineHeight: 1.8 }}>
            Rooms are allocated by the{" "}
            <span style={{ color: colors.amber, fontWeight: 600 }}>Gale-Shapley matching algorithm</span>{" "}
            based on your submitted preferences — not first-come first-served.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {rooms.map((room, i) => (
            <RoomCard key={i} room={room} onShowAuth={onShowAuth} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomCard({ room, onShowAuth, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? room.accent + "88" : colors.border}`,
        background: colors.bg, overflow: "hidden",
        transition: "border-color 0.25s",
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      {/* Image */}
      <div style={{ height: 176, overflow: "hidden", position: "relative" }}>
        <img src={room.img} alt={room.type} style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.5s ease",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, transparent 50%, ${colors.bg}cc)`,
        }} />
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: room.available ? colors.teal : colors.muted,
          color: room.available ? colors.bg : colors.text,
          fontFamily: fonts.mono, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "4px 10px",
          clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
        }}>{room.available ? "Available" : "Full"}</div>
      </div>

      <div style={{ padding: "22px" }}>
        <span style={{
          fontFamily: fonts.mono, fontSize: 9,
          color: room.accent, border: `1px solid ${room.accent}`,
          padding: "2px 8px", letterSpacing: "0.12em",
          textTransform: "uppercase", display: "inline-block", marginBottom: 8,
        }}>{room.block}</span>
        <h3 style={{
          fontFamily: fonts.display, fontSize: 18, fontWeight: 700,
          color: colors.white, marginBottom: 4,
        }}>{room.type}</h3>
        <p style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textDim, marginBottom: 16 }}>{room.size}</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 7 }}>
          {room.features.map(f => (
            <li key={f} style={{ fontFamily: fonts.display, fontSize: 13, color: colors.textDim, display: "flex", gap: 8 }}>
              <span style={{ color: room.accent, flexShrink: 0 }}>✓</span> {f}
            </li>
          ))}
        </ul>

        <div style={{
          borderTop: `1px solid ${colors.border}`, paddingTop: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 15, color: room.accent }}>{room.price}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textDim, letterSpacing: "0.1em" }}>per resident</div>
          </div>
          <button
            disabled={!room.available}
            onClick={() => onShowAuth("SignupPage")}
            style={{
              background: room.available ? room.accent : colors.border,
              color: room.available ? colors.bg : colors.textDim,
              border: "none", cursor: room.available ? "pointer" : "not-allowed",
              fontFamily: fonts.mono, fontWeight: 700, fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "8px 18px",
              clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => { if (room.available) e.currentTarget.style.opacity = "0.82"; }}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >{room.available ? "Apply Now" : "Join Waitlist"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIFE AT HOSTEL
// ═══════════════════════════════════════════════════════════════════════════════
function LifeSection() {
  const items = [
    {
      icon: "🕖",
      title: "Structured Daily Schedule",
      desc: "Mess timings (7–9 AM, 12–2 PM, 7–9 PM), quiet hours from 10 PM to 6 AM, and visitor check-in hours keep the environment calm and productive.",
    },
    {
      icon: "🧑‍💼",
      title: "Block Warden System",
      desc: "Every block has a dedicated warden resident. Complaints filed via the portal are assigned, tracked, and must be resolved within 48 hours.",
    },
    {
      icon: "💸",
      title: "Transparent Billing",
      desc: "Semester-based fee schedule covers room rent, mess charges, and utility levy. Download receipts and track payment history from your student dashboard.",
    },
    {
      icon: "📋",
      title: "Residency Agreement",
      desc: "A clear digital lease covers your rights, responsibilities, curfew policies, and renewal terms. No hidden charges. Signed once per academic year.",
    },
  ];

  return (
    <section id="life" style={{
      padding: "100px 80px",
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          {/* Left */}
          <div>
            <SectionTag text="Life at SMART-HOMS" />
            <h2 style={{
              fontFamily: fonts.display,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              fontWeight: 800, color: colors.white, lineHeight: 1.1, marginBottom: 20,
            }}>
              Designed Around<br />
              <span style={{ color: colors.teal }}>Academic Life</span>
            </h2>
            <p style={{ fontSize: 15, color: colors.textDim, lineHeight: 1.85, marginBottom: 36 }}>
              We are not a hotel or a short-stay guesthouse. Every rule, every facility
              decision, and every policy here exists because a student who lives here for
              2–4 years actually needs it. You are here to graduate — we make that easier.
            </p>

            <div style={{ border: `1px solid ${colors.border}`, overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=300&fit=crop"
                alt="Students studying in hostel common area"
                style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
              />
              <div style={{
                padding: "14px 18px",
                background: colors.bgMid,
                borderTop: `1px solid ${colors.border}`,
                fontFamily: fonts.mono, fontSize: 10,
                color: colors.textDim, letterSpacing: "0.12em", textTransform: "uppercase",
              }}>Common Study Area — Block A, Floor 3</div>
            </div>
          </div>

          {/* Right: rows */}
          <div>
            {items.map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 20, alignItems: "flex-start",
                padding: "26px 0",
                borderBottom: i < items.length - 1 ? `1px solid ${colors.border}` : "none",
                animation: `fadeUp 0.5s ease ${i * 0.1}s both`,
              }}>
                <div style={{
                  width: 44, height: 44, minWidth: 44,
                  border: `1px solid ${colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                }}>{item.icon}</div>
                <div>
                  <h3 style={{
                    fontFamily: fonts.display, fontSize: 16, fontWeight: 700,
                    color: colors.white, marginBottom: 8,
                  }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: colors.textDim, lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESIDENT TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const reviews = [
    {
      name: "Priya Sharma",
      dept: "BSc CSIT — Year 3",
      college: "Tribhuvan University",
      rating: 5,
      text: "Lived here for two years. The 3rd-floor study hall has been my home during every exam season. The warden sorts issues out quickly — I've never felt unsafe.",
    },
    {
      name: "Aakash Thapa",
      dept: "BBA Finance — Year 2",
      college: "Pokhara University",
      text: "The mess food is genuinely decent. Dal bhat every night and I'm not complaining. Room allocation was fair — I filled in my preferences and actually got Block B like I wanted.",
      rating: 5,
    },
    {
      name: "Sunita Rai",
      dept: "BE Civil — Year 4",
      college: "IOE Pulchowk",
      text: "As a girl living away from home for the first time, the security policies here gave my parents confidence. Clean, structured, and actually close to campus.",
      rating: 4,
    },
    {
      name: "Bibek Gurung",
      dept: "BCA — Year 1",
      college: "Islington College",
      text: "Applied online, submitted preferences, got matched to a single room. The student portal makes tracking semester fees and filing complaints straightforward.",
      rating: 5,
    },
  ];

  return (
    <section id="reviews" style={{
      padding: "100px 80px",
      background: colors.bgMid,
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionTag text="Resident Reviews" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(30px, 3.5vw, 48px)",
            fontWeight: 800, color: colors.white, marginBottom: 16,
          }}>
            From Students Who <span style={{ color: colors.amber }}>Live Here</span>
          </h2>
          <p style={{ fontSize: 15, color: colors.textDim, maxWidth: 460, margin: "0 auto", lineHeight: 1.8 }}>
            Feedback from current residents studying for their degrees —
            not one-night visitors.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {reviews.map((r, i) => (
            <ReviewCard key={i} review={r} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? colors.amber + "66" : colors.border}`,
        background: hovered ? colors.amberGlow : colors.bg,
        padding: "28px", transition: "all 0.25s",
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < review.rating ? colors.amber : colors.border, fontSize: 13 }}>★</span>
        ))}
      </div>
      <p style={{
        fontSize: 15, color: colors.text, lineHeight: 1.8,
        marginBottom: 22, fontStyle: "italic",
      }}>"{review.text}"</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: colors.bgLight, border: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: fonts.mono, fontWeight: 700, fontSize: 14, color: colors.amber,
        }}>{review.name.charAt(0)}</div>
        <div>
          <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 14, color: colors.white }}>{review.name}</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, marginTop: 2 }}>
            {review.dept} · {review.college}
          </div>
        </div>
        <div style={{
          marginLeft: "auto",
          fontFamily: fonts.mono, fontSize: 9,
          color: colors.teal, border: `1px solid ${colors.teal}`,
          padding: "2px 8px", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>Current Resident</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW TO APPLY
// ═══════════════════════════════════════════════════════════════════════════════
function ApplySection({ onShowAuth }) {
  const steps = [
    { num: "01", title: "Register on Portal", desc: "Create your student account with your college enrolment ID and personal details." },
    { num: "02", title: "Submit Preferences", desc: "Rank room types, select dietary preference, note your block choice and preferred roommate if any." },
    { num: "03", title: "Algorithm Matching", desc: "Gale-Shapley processes all applications simultaneously and produces a stable, fair room assignment." },
    { num: "04", title: "Confirm & Move In", desc: "Accept your assigned room online, sign the digital residency agreement, and pay semester deposit." },
  ];

  return (
    <section id="apply" style={{
      padding: "100px 80px",
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionTag text="How to Apply" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(30px, 3.5vw, 48px)",
            fontWeight: 800, color: colors.white, marginBottom: 16,
          }}>
            Four Steps to <span style={{ color: colors.amber }}>Move In</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px", background: colors.border, marginBottom: 48,
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: colors.bg, padding: "32px 26px", position: "relative",
            }}>
              <div style={{
                fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 34, color: colors.border, marginBottom: 10, lineHeight: 1,
              }}>{s.num}</div>
              <h3 style={{
                fontFamily: fonts.display, fontSize: 15, fontWeight: 700,
                color: colors.white, marginBottom: 10,
              }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: colors.textDim, lineHeight: 1.75, margin: 0 }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute", right: -9, top: "50%",
                  transform: "translateY(-50%)",
                  width: 0, height: 0,
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderLeft: `8px solid ${colors.amber}`,
                  zIndex: 2,
                }} />
              )}
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{
          background: colors.bgMid, border: `1px solid ${colors.border}`,
          padding: "40px 48px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 32, flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontFamily: fonts.mono, fontSize: 9, color: colors.amber,
              letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8,
            }}>Next Intake: August 2025</div>
            <h3 style={{
              fontFamily: fonts.display, fontSize: 22, fontWeight: 700,
              color: colors.white, marginBottom: 8,
            }}>Ready to secure your room?</h3>
            <p style={{ fontSize: 14, color: colors.textDim, margin: 0, lineHeight: 1.7 }}>
              Applications close 30 days before semester start.
              Early applicants receive priority during block selection.
            </p>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => onShowAuth("signup")}
              style={{
                background: colors.amber, color: colors.bg, border: "none",
                cursor: "pointer", fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "14px 32px",
                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.amberDim}
              onMouseLeave={e => e.currentTarget.style.background = colors.amber}
            >Start Application</button>
            <button
              onClick={() => onShowAuth("LoginPage")}
              style={{
                background: "transparent",
                border: `1px solid ${colors.teal}`,
                color: colors.teal, cursor: "pointer",
                fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "14px 32px", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.tealGlow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >Sign In to Portal</button>
          </div>
        </div>
      </div>
    </section>
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage({ onNavigate, showAuthModal, setShowAuthModal, authMode, setAuthMode }) {
  const handleShowAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <HeroSection onNavigate={onNavigate} onShowAuth={handleShowAuth} />
      <StatsStrip />
      <FeaturesSection />
      <RoomsSection onShowAuth={handleShowAuth} />
      <LifeSection />
      <TestimonialsSection />
      <ApplySection onShowAuth={handleShowAuth} />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onToggleMode={() => setAuthMode(m => m === "login" ? "signup" : "login")}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          section { padding-left: 40px !important; padding-right: 40px !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
        }
      `}</style>
    </>
  );
}