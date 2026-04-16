import { useState } from "react";
import { colors, fonts } from "../theme";

// ─── Image Gallery ──────────────────────────────────────────────────────────
function ImageGallery({ images, hostelName }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Main Gallery */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gridTemplateRows: "200px 200px",
          gap: "8px",
          marginBottom: 32,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* Large image (left) */}
        <div
          onClick={() => setShowLightbox(true)}
          style={{
            gridRow: "1 / 3",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            background: `linear-gradient(135deg, ${colors.amber}20, ${colors.teal}20)`,
          }}
        >
          <img
            src={images[0]}
            alt={hostelName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: colors.bg + "dd",
              color: colors.white,
              padding: "8px 14px",
              borderRadius: "6px",
              fontSize: 12,
              fontFamily: fonts.mono,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            View All {images.length} Photos
          </div>
        </div>

        {/* Smaller images (right grid) */}
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            onClick={() => {
              setCurrentImageIndex(idx);
              setShowLightbox(true);
            }}
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              background: `linear-gradient(135deg, ${colors.amber}20, ${colors.teal}20)`,
            }}
          >
            <img
              src={images[idx % images.length]}
              alt={`${hostelName} ${idx}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          onClick={() => setShowLightbox(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "90%",
              maxWidth: "900px",
              height: "80vh",
            }}
          >
            <img
              src={images[currentImageIndex]}
              alt="Full view"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />

            <button
              onClick={prevImage}
              style={{
                position: "absolute",
                left: -60,
                top: "50%",
                transform: "translateY(-50%)",
                background: colors.white,
                border: "none",
                color: colors.bg,
                width: 50,
                height: 50,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 24,
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.amber)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.white)}
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              style={{
                position: "absolute",
                right: -60,
                top: "50%",
                transform: "translateY(-50%)",
                background: colors.white,
                border: "none",
                color: colors.bg,
                width: 50,
                height: 50,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 24,
                fontWeight: "bold",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.amber)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.white)}
            >
              ›
            </button>

            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                background: colors.bg + "dd",
                color: colors.white,
                padding: "12px 20px",
                borderRadius: "6px",
                fontSize: 14,
                fontFamily: fonts.mono,
                fontWeight: 700,
              }}
            >
              {currentImageIndex + 1} / {images.length}
            </div>

            <button
              onClick={() => setShowLightbox(false)}
              style={{
                position: "absolute",
                top: -50,
                right: 0,
                background: colors.white,
                border: "none",
                color: colors.bg,
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Booking Widget ─────────────────────────────────────────────────────────
function BookingWidget({ hostel }) {
  const [selectedRoom, setSelectedRoom] = useState(hostel.rooms[0].id);
  const [checkIn, setCheckIn] = useState("2024-04-15");
  const [checkOut, setCheckOut] = useState("2024-04-18");
  const [guests, setGuests] = useState(1);

  const room = hostel.rooms.find((r) => r.id === selectedRoom);
  const nights = 3;
  const totalPrice = (room?.price || 0) * nights;

  return (
    <div
      style={{
        position: "sticky",
        top: "80px",
        background: colors.bgMid,
        border: `2px solid ${colors.amber}`,
        borderRadius: "12px",
        padding: "24px",
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          fontFamily: fonts.display,
          fontSize: 18,
          fontWeight: 700,
          color: colors.white,
          marginBottom: 20,
        }}
      >
        📅 Reserve Your Stay
      </h3>

      {/* Room Selector */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            color: colors.amber,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 8,
          }}
        >
          Select Room Type
        </label>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          style={{
            width: "100%",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "10px 12px",
            borderRadius: "6px",
            fontFamily: fonts.display,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {hostel.rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.type} - ${r.price}/night
            </option>
          ))}
        </select>
      </div>

      {/* Check-in */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            color: colors.amber,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Check-in
        </label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          style={{
            width: "100%",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "10px 12px",
            borderRadius: "6px",
            fontFamily: fonts.mono,
            fontSize: 12,
          }}
        />
      </div>

      {/* Check-out */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            color: colors.amber,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Check-out
        </label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          style={{
            width: "100%",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "10px 12px",
            borderRadius: "6px",
            fontFamily: fonts.mono,
            fontSize: 12,
          }}
        />
      </div>

      {/* Guests */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            fontWeight: 700,
            color: colors.amber,
            textTransform: "uppercase",
            display: "block",
            marginBottom: 6,
          }}
        >
          Number of Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          style={{
            width: "100%",
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            padding: "10px 12px",
            borderRadius: "6px",
            fontFamily: fonts.display,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Price Breakdown */}
      <div
        style={{
          background: colors.bg,
          borderRadius: "8px",
          padding: "14px",
          marginBottom: 20,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 13,
            color: colors.textDim,
          }}
        >
          <span>${room?.price}/night × {nights} nights</span>
          <span>${room?.price ? room.price * nights : 0}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 13,
            color: colors.textDim,
          }}
        >
          <span>Service fee</span>
          <span>${Math.round(totalPrice * 0.1)}</span>
        </div>
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 16,
            fontWeight: 700,
            color: colors.amber,
          }}
        >
          <span>Total</span>
          <span>${totalPrice + Math.round(totalPrice * 0.1)}</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <button
        style={{
          width: "100%",
          background: colors.amber,
          color: colors.bg,
          border: "none",
          padding: "14px",
          borderRadius: "8px",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 13,
          textTransform: "uppercase",
          cursor: "pointer",
          marginBottom: 10,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = colors.amberDim)}
        onMouseLeave={(e) => (e.currentTarget.style.background = colors.amber)}
      >
        Book Now
      </button>

      <button
        style={{
          width: "100%",
          background: "transparent",
          color: colors.amber,
          border: `2px solid ${colors.amber}`,
          padding: "12px",
          borderRadius: "8px",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 13,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.amber + "20";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        Add to Wishlist ♡
      </button>

      {/* Free Cancellation */}
      <div
        style={{
          marginTop: 14,
          padding: "10px",
          background: colors.teal + "20",
          color: colors.teal,
          borderRadius: "6px",
          fontSize: 11,
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        ✓ Free cancellation
      </div>
    </div>
  );
}

// ─── Rooms Section ──────────────────────────────────────────────────────────
function RoomsSection({ rooms }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          fontWeight: 800,
          color: colors.white,
          marginBottom: 20,
        }}
      >
        🛏️ Room Types
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {rooms.map((room, idx) => (
          <div
            key={room.id}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              overflow: "hidden",
              background: colors.bgMid,
              transition: "all 0.3s ease",
              animation: `fadeUp 0.5s ease ${idx * 0.1}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.amber;
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.amber}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Room Image */}
            <div
              style={{
                height: 200,
                overflow: "hidden",
                background: `linear-gradient(135deg, ${colors.amber}20, ${colors.teal}20)`,
              }}
            >
              <img
                src={room.image}
                alt={room.type}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>

            {/* Room Details */}
            <div style={{ padding: "16px" }}>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.white,
                  marginBottom: 8,
                }}
              >
                {room.type}
              </h3>

              {/* Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  marginBottom: 12,
                  fontSize: 13,
                  color: colors.textDim,
                }}
              >
                <div>👥 {room.beds} {room.beds === 1 ? "Bed" : "Beds"}</div>
                <div>📐 {room.size} m²</div>
                <div>👤 {room.maxGuests} guests</div>
                <div>🛏️ {room.bedType}</div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: colors.amber,
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Room Amenities
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {room.amenities.map((amenity, aidx) => (
                    <span
                      key={aidx}
                      style={{
                        background: colors.amber + "20",
                        color: colors.amber,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: 11,
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              {room.available && (
                <div
                  style={{
                    fontSize: 11,
                    color: colors.teal,
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  ✓ {room.available} rooms available
                </div>
              )}

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: colors.textDim }}>From</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: colors.amber,
                      fontFamily: fonts.mono,
                    }}
                  >
                    ${room.price}
                  </div>
                </div>
                <button
                  style={{
                    background: colors.amber,
                    color: colors.bg,
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontFamily: fonts.mono,
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = colors.amberDim)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = colors.amber)
                  }
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Meals Section ──────────────────────────────────────────────────────────
function MealsSection({ meals }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          fontWeight: 800,
          color: colors.white,
          marginBottom: 20,
        }}
      >
        🍽️ Meals & Dining
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        {meals.map((meal, idx) => (
          <div
            key={idx}
            style={{
              background: colors.bgMid,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              overflow: "hidden",
              transition: "all 0.3s ease",
              animation: `fadeUp 0.5s ease ${idx * 0.1}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.teal;
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.teal}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Meal Image */}
            <div
              style={{
                height: 200,
                overflow: "hidden",
                background: `linear-gradient(135deg, ${colors.teal}20, ${colors.amber}20)`,
              }}
            >
              <img
                src={meal.image}
                alt={meal.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
              />
            </div>

            {/* Meal Details */}
            <div style={{ padding: "16px" }}>
              <h3
                style={{
                  fontFamily: fonts.display,
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.white,
                  marginBottom: 8,
                }}
              >
                {meal.name}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: colors.textDim,
                  marginBottom: 12,
                  lineHeight: 1.5,
                }}
              >
                {meal.description}
              </p>

              {/* Details */}
              <div
                style={{
                  background: colors.bg,
                  borderRadius: "6px",
                  padding: "10px",
                  marginBottom: 12,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ color: colors.textDim }}>⏰ Time</span>
                  <span style={{ color: colors.white, fontWeight: 600 }}>
                    {meal.time}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: colors.textDim }}>👥 Servings</span>
                  <span style={{ color: colors.white, fontWeight: 600 }}>
                    {meal.servings}/day
                  </span>
                </div>
              </div>

              {/* Price & Inclusion */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: meal.included ? colors.teal : colors.amber,
                    fontFamily: fonts.mono,
                  }}
                >
                  {meal.included ? "FREE" : `$${meal.price}`}
                </div>
                {meal.included && (
                  <span
                    style={{
                      background: colors.teal + "20",
                      color: colors.teal,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Included
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Facilities Section ─────────────────────────────────────────────────────
function FacilitiesSection({ facilities }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          fontWeight: 800,
          color: colors.white,
          marginBottom: 20,
        }}
      >
        🏢 Facilities & Amenities
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "12px",
        }}
      >
        {facilities.map((facility, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 14px",
              background: colors.bgMid,
              border: `1px solid ${colors.border}`,
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.amber;
              e.currentTarget.style.background = colors.amber + "10";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.background = colors.bgMid;
            }}
          >
            <span style={{ fontSize: 18 }}>{facility.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.white,
                }}
              >
                {facility.name}
              </div>
              {facility.details && (
                <div
                  style={{
                    fontSize: 11,
                    color: colors.textDim,
                  }}
                >
                  {facility.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── About Section ──────────────────────────────────────────────────────────
function AboutSection({ hostel }) {
  return (
    <section
      style={{
        marginBottom: 40,
        background: colors.bgMid,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          fontWeight: 800,
          color: colors.white,
          marginBottom: 20,
        }}
      >
        ℹ️ About this Hostel
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
        }}
      >
        {/* Left: Description */}
        <div>
          <p
            style={{
              fontSize: 14,
              color: colors.textDim,
              lineHeight: 1.8,
              marginBottom: 20,
            }}
          >
            {hostel.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {[
              { label: "Check-in", value: hostel.checkIn },
              { label: "Check-out", value: hostel.checkOut },
              { label: "Age Restriction", value: hostel.ageRestriction },
              { label: "Languages", value: "English, Nepali, Hindi" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  background: colors.bg,
                  borderRadius: "6px",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: colors.amber,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: colors.white,
                    fontWeight: 600,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Host Info */}
        <div
          style={{
            background: colors.bg,
            borderRadius: "10px",
            padding: "16px",
            border: `1px solid ${colors.border}`,
            textAlign: "center",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            alt="Host"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              marginBottom: 12,
            }}
          />
          <h3
            style={{
              fontFamily: fonts.display,
              fontSize: 16,
              fontWeight: 700,
              color: colors.white,
              marginBottom: 4,
            }}
          >
            {hostel.hostName}
          </h3>
          <p
            style={{
              fontSize: 12,
              color: colors.textDim,
              marginBottom: 14,
            }}
          >
            ⭐ Superhost
          </p>

          <button
            style={{
              width: "100%",
              background: colors.amber,
              color: colors.bg,
              border: "none",
              padding: "10px",
              borderRadius: "6px",
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = colors.amberDim)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = colors.amber)
            }
          >
            Contact Host
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Main Single Hostel Page ────────────────────────────────────────────────
export default function SingleHostelPage({ onNavigate }) {
  const hostel = {
    id: 1,
    name: "Peace Garden Hostel",
    location: "0.8 km from city center, Kathmandu",
    rating: 8.6,
    reviews: 342,
    vibe: "Lively & Fun",
    description:
      "Peace Garden Hostel is a vibrant and welcoming establishment located in the heart of Kathmandu, just a short walk from the iconic Durbar Square and Thamel tourist district. Our beautifully renovated hostel offers a perfect blend of modern comfort and traditional Nepali hospitality. With spacious dorms featuring high-quality bedding, private rooms for couples or small groups, and a lively rooftop bar overlooking the Kathmandu skyline, we provide the ideal base for your Nepal adventure.",
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    ageRestriction: "No restriction",
    hostName: "Rajesh Kumar",
    images: [
      "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=1200&h=800&fit=crop",
    ],
    rooms: [
      {
        id: "8-dorm",
        type: "8-Bed Dorm",
        beds: 8,
        size: 32,
        maxGuests: 8,
        bedType: "Bunk Beds",
        image:
          "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=400&h=300&fit=crop",
        amenities: ["Shared Bath", "Locker", "Reading Lamp", "WiFi"],
        available: 5,
        price: 12,
      },
      {
        id: "4-dorm",
        type: "4-Bed Dorm",
        beds: 4,
        size: 18,
        maxGuests: 4,
        bedType: "Bunk Beds",
        image:
          "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=400&h=300&fit=crop",
        amenities: ["Shared Bath", "Locker", "Window", "WiFi"],
        available: 3,
        price: 16,
      },
      {
        id: "female-dorm",
        type: "Female-Only 6-Bed Dorm",
        beds: 6,
        size: 24,
        maxGuests: 6,
        bedType: "Bunk Beds",
        image:
          "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=400&h=300&fit=crop",
        amenities: ["Shared Bath", "Locker", "WiFi", "Safe"],
        available: 4,
        price: 14,
      },
      {
        id: "private-double",
        type: "Private Double Room",
        beds: 2,
        size: 16,
        maxGuests: 2,
        bedType: "Double Bed",
        image:
          "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=400&h=300&fit=crop",
        amenities: ["Private Bath", "AC", "WiFi", "TV"],
        available: 2,
        price: 35,
      },
      {
        id: "private-triple",
        type: "Private Triple Room",
        beds: 3,
        size: 24,
        maxGuests: 3,
        bedType: "1 Double + 1 Single",
        image:
          "https://images.unsplash.com/photo-1631217216831-e6b30ce3c5c5?w=400&h=300&fit=crop",
        amenities: ["Private Bath", "AC", "WiFi", "TV"],
        available: 1,
        price: 45,
      },
    ],
    meals: [
      {
        name: "Breakfast Buffet",
        description:
          "Traditional Nepali breakfast with local bread, eggs, fresh fruits, and hot beverages",
        image:
          "https://images.unsplash.com/photo-1533621821343-b8bccb6e1b71?w=400&h=300&fit=crop",
        time: "7:00 AM - 10:00 AM",
        servings: 1,
        price: 0,
        included: true,
      },
      {
        name: "Lunch Combo",
        description:
          "Traditional Dal Bhat with seasonal vegetables, fresh salad, and pickles",
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
        time: "12:00 PM - 2:00 PM",
        servings: 1,
        price: 4,
        included: false,
      },
      {
        name: "Dinner Special",
        description: "Momos, noodles, curry with rice, and vegetable stir-fry",
        image:
          "https://images.unsplash.com/photo-1555939594-58d7cb561e1f?w=400&h=300&fit=crop",
        time: "6:00 PM - 9:00 PM",
        servings: 1,
        price: 5,
        included: false,
      },
    ],
    facilities: [
      { icon: "📶", name: "Free WiFi", details: "24/7 high-speed" },
      { icon: "🍳", name: "Kitchen", details: "Self-catering available" },
      { icon: "🔐", name: "Lockers", details: "Secure in-room" },
      { icon: "🍺", name: "Bar", details: "Rooftop cocktails" },
      { icon: "🧹", name: "Housekeeping", details: "Daily cleaning" },
      { icon: "🎮", name: "Games", details: "Pool & board games" },
      { icon: "❄️", name: "AC/Heating", details: "Climate controlled" },
      { icon: "🛁", name: "Laundry", details: "Iron & wash service" },
      { icon: "📚", name: "Library", details: "Travel guides & books" },
      { icon: "🎫", name: "Tours", details: "Organized excursions" },
      { icon: "🧥", name: "Storage", details: "Luggage hold" },
      { icon: "💼", name: "Workspace", details: "Co-working area" },
    ],
  };

  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        paddingTop: "64px",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          padding: "32px 40px",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={() => onNavigate("landing")}
          style={{
            background: "transparent",
            color: colors.amber,
            border: "none",
            fontFamily: fonts.mono,
            fontSize: 12,
            cursor: "pointer",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          ← Back to Home
        </button>

        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: 40,
            fontWeight: 800,
            color: colors.white,
            marginBottom: 8,
          }}
        >
          {hostel.name}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 14, color: colors.textDim }}>
            📍 {hostel.location}
          </span>
          <div
            style={{
              background: colors.amber,
              color: colors.bg,
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: fonts.mono,
            }}
          >
            {hostel.rating} ⭐ · {hostel.reviews} reviews
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "24px",
          padding: "32px 40px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Left Column */}
        <main>
          <ImageGallery images={hostel.images} hostelName={hostel.name} />
          <RoomsSection rooms={hostel.rooms} />
          <MealsSection meals={hostel.meals} />
          <FacilitiesSection facilities={hostel.facilities} />
          <AboutSection hostel={hostel} />
        </main>

        {/* Right Sidebar - Booking Widget */}
        <aside>
          <BookingWidget hostel={hostel} />
        </aside>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 28px !important;
          }
          div[style*="padding: 32px 40px"] {
            padding: 16px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}