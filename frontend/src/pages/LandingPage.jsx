import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../theme";
import axios from "axios";

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
  const num = typeof value === 'number' ? value : parseInt(value.replace(/\D/g, ""), 10);
  const suffix = typeof value === 'string' ? value.replace(/\d/g, "") : "";

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
// HERO SECTION - Updated with direct navigation
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection() {
  const navigate = useNavigate();

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

      <div style={{
        position: "relative", zIndex: 2, width: "100%",
        display: "grid", gridTemplateColumns: "1.15fr 0.85fr",
        gap: 80, alignItems: "center", maxWidth: 1280,
        paddingBottom: 80,
      }}>
        {/* Left: Copy */}
        <div>
          {/* Badge */}
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
            🏠 SMART Hostel Management System
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: fonts.display, fontWeight: 800,
            fontSize: "clamp(44px, 5.5vw, 74px)",
            lineHeight: 1.04, letterSpacing: "-0.02em",
            color: colors.white, marginBottom: 6,
            animation: "fadeUp 0.5s ease 0.2s both",
          }}>
            Manage Your
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
            Hostel Operations
          </h1>

          <p style={{
            fontFamily: fonts.mono, fontSize: 10,
            color: colors.textDim, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 28,
            animation: "fadeUp 0.5s ease 0.32s both",
          }}>Complete Hostel Management • Bookings • Payments • Complaints</p>

          <p style={{
            fontSize: 17, color: colors.text, lineHeight: 1.85,
            maxWidth: 510, marginBottom: 44,
            animation: "fadeUp 0.5s ease 0.36s both",
          }}>
            Streamline your hostel operations with our all-in-one management system. 
            From student bookings and room allocation to payments, complaints, 
            and feedback — everything you need in one place.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48,
            animation: "fadeUp 0.5s ease 0.42s both",
          }}>
            <button
              onClick={() => navigate("/signup")}
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
            >Get Started</button>

           
          </div>

          {/* Trust strips */}
          <div style={{
            display: "flex", gap: 28, flexWrap: "wrap",
            animation: "fadeUp 0.5s ease 0.48s both",
          }}>
            {[
              { val: "24/7", sub: "support" },
              { val: "Secure", sub: "payments" },
              { val: "Real-time", sub: "tracking" },
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

        {/* Right: Dashboard Preview */}
        <div style={{ position: "relative", height: 460 }}>
          <div style={{
            position: "absolute", top: 28, right: -8, left: 28,
            height: 360, border: `1px solid ${colors.border}`,
            background: colors.bgLight,
          }} />
          <div style={{
            position: "absolute", top: 0, right: 28, left: 0,
            height: 360, overflow: "hidden",
            border: `1px solid ${colors.amber}55`,
            background: colors.bg,
          }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, marginLeft: 12 }}>dashboard.hostel.edu</span>
              </div>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {["🏨", "👨‍🎓", "💰", "📊"].map((icon, i) => (
                  <div key={i} style={{
                    background: colors.bgLight,
                    border: `1px solid ${colors.border}`,
                    padding: "12px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 20 }}>{icon}</div>
                    <div style={{ fontSize: 10, color: colors.textDim, marginTop: 4 }}>
                      {["Hostels", "Students", "Revenue", "Occupancy"][i]}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                background: colors.bgLight,
                border: `1px solid ${colors.border}`,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.text }}>Recent Activity</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.textDim }}>3 new bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES SECTION - Using your actual features
// ═══════════════════════════════════════════════════════════════════════════════
function FeaturesSection() {
  const features = [
    {
      icon: "🏨",
      title: "Hostel Management",
      description: "Manage multiple hostels, blocks, floors, and rooms with real-time availability tracking and occupancy monitoring.",
      accent: colors.amber,
    },
    {
      icon: "📅",
      title: "Booking System",
      description: "Easy online booking with automated room allocation, approval workflow, and instant confirmations for students.",
      accent: colors.teal,
    },
    {
      icon: "💰",
      title: "Payment Integration",
      description: "Secure online payments with eSewa integration. Track payment history, generate receipts, and manage pending dues.",
      accent: colors.amber,
    },
    {
      icon: "⚠️",
      title: "Complaint Management",
      description: "Students can register complaints online. Admins can track, assign, and resolve issues with real-time status updates.",
      accent: colors.teal,
    },
    {
      icon: "💬",
      title: "Feedback System",
      description: "Collect and analyze student feedback with ratings and comments to continuously improve hostel services.",
      accent: colors.amber,
    },
    {
      icon: "📢",
      title: "Announcements",
      description: "Send important announcements and notifications to all students instantly through the integrated notification system.",
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
          <SectionTag text="Features" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800, color: colors.white, lineHeight: 1.1, marginBottom: 16,
          }}>
            Everything You Need to<br />
            <span style={{ color: colors.amber }}>Manage Your Hostel</span>
          </h2>
          <p style={{
            fontSize: 16, color: colors.textDim,
            maxWidth: 500, margin: "0 auto", lineHeight: 1.8,
          }}>
            A comprehensive platform designed to streamline hostel operations from
            student onboarding to daily management.
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
// STATS STRIP - UPDATED WITH REAL DATA
// ═══════════════════════════════════════════════════════════════════════════════
function StatsStrip({ stats }) {
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
        <div style={{
          padding: "34px 24px",
          borderRight: `1px solid ${colors.border}`,
        }}>
          <Counter value={stats.hostels} label="Hostels" color={colors.amber} />
        </div>
        <div style={{
          padding: "34px 24px",
          borderRight: `1px solid ${colors.border}`,
        }}>
          <Counter value={stats.rooms} label="Rooms" color={colors.teal} />
        </div>
        <div style={{
          padding: "34px 24px",
          borderRight: `1px solid ${colors.border}`,
        }}>
          <Counter value={stats.students} label="Students" color={colors.amber} />
        </div>
        <div style={{
          padding: "34px 24px",
          borderRight: `1px solid ${colors.border}`,
        }}>
          <Counter value={stats.occupancy_percentage} label="Occupancy" color={colors.teal} />
        </div>
        <div style={{
          padding: "34px 24px",
        }}>
          <Counter value="24/7" label="Support" color={colors.amber} />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOW IT WORKS - Using your system flow
// ═══════════════════════════════════════════════════════════════════════════════
function HowItWorksSection() {
  const steps = [
    { 
      num: "01", 
      title: "Student Registration", 
      desc: "Students create accounts and complete their profile with personal and academic details.",
      icon: "📝"
    },
    { 
      num: "02", 
      title: "Browse & Book", 
      desc: "Search available rooms, view details, and submit booking requests with preferred dates.",
      icon: "🔍"
    },
    { 
      num: "03", 
      title: "Admin Approval", 
      desc: "Admins review booking requests, approve or reject, and update room occupancy in real-time.",
      icon: "✅"
    },
    { 
      num: "04", 
      title: "Payment & Move-in", 
      desc: "Complete secure payment, receive digital receipts, and get ready to move into your new room.",
      icon: "🏠"
    },
  ];

  return (
    <section id="how-it-works" style={{
      padding: "100px 80px",
      background: colors.bgMid,
      borderTop: `1px solid ${colors.border}`,
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionTag text="How It Works" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(30px, 3.5vw, 48px)",
            fontWeight: 800, color: colors.white, marginBottom: 16,
          }}>
            Simple 4-Step <span style={{ color: colors.amber }}>Process</span>
          </h2>
          <p style={{ fontSize: 15, color: colors.textDim, maxWidth: 460, margin: "0 auto", lineHeight: 1.8 }}>
            From registration to move-in — we've made the entire process seamless.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px", background: colors.border,
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: colors.bg, padding: "32px 26px", position: "relative",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 40, marginBottom: 16,
              }}>{s.icon}</div>
              <div style={{
                fontFamily: fonts.mono, fontWeight: 700,
                fontSize: 34, color: colors.border, marginBottom: 10, lineHeight: 1,
              }}>{s.num}</div>
              <h3 style={{
                fontFamily: fonts.display, fontSize: 16, fontWeight: 700,
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
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS - Using your system feedback
// ═══════════════════════════════════════════════════════════════════════════════
function TestimonialsSection() {
  const reviews = [
    {
      name: "Admin User",
      role: "Hostel Administrator",
      text: "Managing multiple hostels has never been easier. The booking system and complaint management features have saved us countless hours.",
      rating: 5,
    },
    {
      name: "Student User",
      role: "Resident Student",
      text: "The online booking and payment process is smooth. I love being able to track my complaints and get updates in real-time.",
      rating: 5,
    },
    {
      name: "Hostel Manager",
      role: "Operations Manager",
      text: "The dashboard gives me a complete overview of occupancy, revenue, and pending tasks. It's a game-changer for hostel management.",
      rating: 4,
    },
  ];

  return (
    <section id="testimonials" style={{
      padding: "100px 80px",
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionTag text="Testimonials" />
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(30px, 3.5vw, 48px)",
            fontWeight: 800, color: colors.white, marginBottom: 16,
          }}>
            What Our <span style={{ color: colors.amber }}>Users Say</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textDim, marginTop: 2 }}>{review.role}</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CTA SECTION - Updated with direct navigation
// ═══════════════════════════════════════════════════════════════════════════════
function CTASection() {
  const navigate = useNavigate();

  return (
    <section style={{
      padding: "100px 80px",
      background: colors.bgMid,
      borderTop: `1px solid ${colors.border}`,
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        textAlign: "center",
      }}>
        <div style={{
          border: `1px solid ${colors.amber}55`,
          background: colors.amberGlow,
          padding: "60px 48px",
        }}>
          <h2 style={{
            fontFamily: fonts.display,
            fontSize: "clamp(32px, 3.5vw, 48px)",
            fontWeight: 800, color: colors.white, marginBottom: 16,
          }}>
            Ready to <span style={{ color: colors.amber }}>Get Started?</span>
          </h2>
          <p style={{
            fontSize: 17, color: colors.textDim,
            maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.8,
          }}>
            Join hundreds of students and administrators using SMART-HOMS to 
            streamline their hostel management operations.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/signup")}
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
            >Get Started Now</button>
            <button
              onClick={() => navigate("/loginPortal")}
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
            >Log In</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT - UPDATED WITH API FETCH
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage({ onNavigate, showAuthModal, setShowAuthModal, authMode, setAuthMode }) {
  const [stats, setStats] = useState({
    hostels: 0,
    rooms: 0,
    students: 0,
    occupancy_percentage: 0,
    total_capacity: 0,
    total_occupied: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/hostel/rooms/dashboard_stats/');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
        // Keep showing the static stats as fallback
        setStats({
          hostels: 1,
          rooms: 3,
          students: 1,
          occupancy_percentage: 50,
          total_capacity: 6,
          total_occupied: 3
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <HeroSection />
      <StatsStrip stats={stats} />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 1024px) {
          section { padding-left: 40px !important; padding-right: 40px !important; }
        }
        @media (max-width: 768px) {
          section { padding-left: 24px !important; padding-right: 24px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-right { display: none !important; }
        }
      `}</style>
    </>
  );
}