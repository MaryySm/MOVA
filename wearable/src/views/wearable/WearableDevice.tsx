import { useWearableController } from "../../controllers/useWearableController"
import { W, H, WR, WA, KIDS_MOODS, type WPage } from "../../models/wearable"
export function WearableDevice({
  onSOS,
  sosAck,
}: {
  onSOS: () => void
  sosAck: boolean
}) {
  const {
    followUp,
    confirmEmotion,
    status,
    busy,
    ready,
    acknowledged,
    page,
    setPage,
    acts,
    mood,
    sosActive,
    holding,
    holdPct,
    hh,
    dd,
    pendingCount,
    activityPct,
    progressGreen,
    toggleAct,
    chooseMood,
    startHold,
    cancelHold,
  } = useWearableController(onSOS, sosAck)

  /* ── helpers ── */
  const BackBtn = ({ to }: { to: WPage }) => (
    <button
      onClick={() => setPage(to)}
      style={{
        background: `${WA}22`,
        border: "none",
        borderRadius: 10,
        width: 30,
        height: 30,
        cursor: "pointer",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18L9 12L15 6"
          stroke={WA}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      {/* ── Watch body ── */}
      <div
        style={{
          width: W,
          height: H,
          borderRadius: WR,
          background: sosActive ? "#FF3B30" : "#FAF5FF",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          boxShadow:
            "0 0 0 8px rgba(255,255,255,0.65), 0 0 0 9.5px rgba(0,0,0,0.07), 0 24px 56px rgba(0,0,0,0.2)",
          transition: "background 0.35s",
        }}
      >
        {followUp && !sosActive && <div role="dialog" aria-label="Seguimiento de emoción" style={{
          position: "absolute", inset: 0, zIndex: 40, background: "#FAF5FF", padding: "30px 18px 14px",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, textAlign: "center",
        }}>
          <div style={{fontSize: 25}}>💬</div>
          <strong style={{fontSize: 15}}>¿Aún te sientes «{followUp.mood}»?</strong>
          <span style={{fontSize: 10, color: "#6B6B8F"}}>Te preguntamos una sola vez.</span>
          <button disabled={busy} onClick={() => void confirmEmotion(true)} style={{padding: 9, borderRadius: 12, border: 0, background: "#BBFBD0", fontWeight: 800}}>Sí, sigo igual</button>
          <button disabled={busy} onClick={() => void confirmEmotion(false)} style={{padding: 9, borderRadius: 12, border: 0, background: "#BFDBFE", fontWeight: 800}}>No, cambió</button>
        </div>}
        {/* Side crown */}
        <div
          style={{
            position: "absolute",
            right: -5,
            top: "45%",
            width: 7,
            height: 36,
            borderRadius: 4,
            background: "#DDD6FE",
            boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
          }}
        />

        {/* Battery status */}
        {!sosActive && (
          <div
            style={{
              position: "absolute",
              top: 9,
              right: 15,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <div
              style={{
                width: 19,
                height: 9,
                border: "1.5px solid #716987",
                borderRadius: 3,
                padding: 1,
              }}
            >
              <div
                style={{
                  width: "84%",
                  height: "100%",
                  borderRadius: 1,
                  background: "#34D399",
                }}
              />
            </div>
            <div
              style={{
                width: 2,
                height: 4,
                borderRadius: "0 2px 2px 0",
                background: "#716987",
              }}
            />
            <span style={{ fontSize: 7.5, fontWeight: 800, color: "#716987" }}>
              84%
            </span>
          </div>
        )}

        {/* ══ HOME ══ */}
        {page === "home" && !sosActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "28px 16px 9px",
            }}
          >
            {/* Time */}
            <div
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 41,
                fontWeight: 900,
                color: "#1A1A2E",
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {hh}
            </div>
            <div
              style={{
                fontSize: 8,
                color: "#6B6B8F",
                marginTop: 2,
                marginBottom: 8,
                textTransform: "capitalize",
                textAlign: "center",
              }}
            >
              {dd}
            </div>

            {/* Two main nav buttons */}
            <div
              style={{
                display: "flex",
                gap: 9,
                width: "100%",
                marginBottom: 8,
              }}
            >
              {/* Activities */}
              <button
                onClick={() => setPage("activities")}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 5px",
                  background: `linear-gradient(135deg, #BBFBD0, #6EE7B7)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 4px 14px rgba(52,211,153,0.35)",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 21 }}>📋</span>
                <span
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#065F46",
                  }}
                >
                  Actividades
                </span>
                {pendingCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#F59E0B",
                      border: "2px solid #fff",
                      fontSize: 9,
                      fontWeight: 900,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pendingCount}
                  </div>
                )}
              </button>

              {/* Emotions */}
              <button
                onClick={() => setPage("emotions")}
                style={{
                  flex: 1,
                  borderRadius: 18,
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 5px",
                  background: `linear-gradient(135deg, #BFDBFE, #93C5FD)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 4px 14px rgba(96,165,250,0.35)",
                }}
              >
                <span style={{ fontSize: 21 }}>
                  {mood
                    ? (KIDS_MOODS.find((m) => m.label === mood)?.emoji ?? "😊")
                    : "😊"}
                </span>
                <span
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#1E3A5F",
                  }}
                >
                  {mood ?? "Estado"}
                </span>
              </button>
            </div>

            {/* Daily activity progress */}
            <div style={{ width: "100%", marginBottom: 7 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              >
                <span
                  style={{ fontSize: 7.5, color: "#6B6B8F", fontWeight: 700 }}
                >
                  Progreso de actividades
                </span>
                <span
                  style={{ fontSize: 8, color: progressGreen, fontWeight: 900 }}
                >
                  {activityPct}%
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: 4,
                  background: "rgba(0,0,0,0.09)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${activityPct}%`,
                    minWidth: activityPct ? 5 : 0,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, #86EFAC, ${progressGreen})`,
                    transition: "width 0.35s ease",
                  }}
                />
              </div>
            </div>

            {/* SOS hold-button */}
            <div style={{ position: "relative", width: 56, height: 56 }}>
              {/* Progress ring */}
              <svg
                width="56"
                height="56"
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "rotate(-90deg)",
                }}
              >
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="rgba(255,59,48,0.15)"
                  strokeWidth="4"
                />
                {holding && (
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke="#FF3B30"
                    strokeWidth="4"
                    strokeDasharray={`${(holdPct / 100) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <button
                onMouseDown={startHold}
                onMouseUp={cancelHold}
                onMouseLeave={cancelHold}
                onTouchStart={(e) => {
                  e.preventDefault()
                  startHold()
                }}
                onTouchEnd={cancelHold}
                style={{
                  position: "absolute",
                  inset: 5,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  background: holding
                    ? "#FF3B30"
                    : "linear-gradient(135deg, #FF6B9D, #FF3B30)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: holding ? 16 : 22,
                  boxShadow: "0 4px 16px rgba(255,59,48,0.45)",
                  transition: "background 0.15s",
                  color: "#fff",
                  fontFamily: "Outfit,sans-serif",
                  fontWeight: 900,
                }}
              >
                {holding ? `${Math.ceil((100 - holdPct) / 40)}` : "🆘"}
              </button>
            </div>
            <p
              style={{
                fontSize: 8,
                color: "#9B8FB5",
                marginTop: 3,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Mantén pulsado para SOS
            </p>
          </div>
        )}

        {/* ══ ACTIVITIES ══ */}
        {page === "activities" && !sosActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "28px 14px 7px",
                flexShrink: 0,
              }}
            >
              <BackBtn to="home" />
              <span
                style={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#1A1A2E",
                }}
              >
                📋 Mis actividades
              </span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
              {acts.map((a) => (
                <button
                  key={a.id}
                  aria-pressed={a.done}
                  disabled={busy || !ready}
                  onClick={() => toggleAct(a.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "9px 10px",
                    borderRadius: 16,
                    marginBottom: 7,
                    border: "none",
                    cursor: "pointer",
                    background: a.done ? "rgba(0,0,0,0.04)" : "#fff",
                    boxShadow: a.done ? "none" : "0 2px 8px rgba(0,0,0,0.07)",
                    opacity: a.done ? 0.5 : 1,
                    textAlign: "left",
                    borderLeft: `4px solid ${a.done ? "#ddd" : a.color}`,
                    transition: "all 0.18s",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "Outfit,sans-serif",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#1A1A2E",
                        textDecoration: a.done ? "line-through" : "none",
                      }}
                    >
                      {a.label}
                    </div>
                    <div style={{ fontSize: 9, color: "#6B6B8F" }}>
                      {a.time}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      flexShrink: 0,
                      background: a.done ? a.color : "transparent",
                      border: `2px solid ${
                        a.done ? a.color : "rgba(0,0,0,0.15)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {a.done && (
                      <svg width="10" height="10" viewBox="0 0 12 12">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ EMOTIONS ══ */}
        {page === "emotions" && !sosActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "28px 14px 7px",
                flexShrink: 0,
              }}
            >
              <BackBtn to="home" />
              <span
                style={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#1A1A2E",
                }}
              >
                😊 ¿Cómo estás?
              </span>
            </div>
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                padding: "4px 14px 14px",
                alignContent: "start",
              }}
            >
              {KIDS_MOODS.map((m) => {
                const active = mood === m.label
                return (
                  <button
                    key={m.label}
                    aria-pressed={active}
                    disabled={busy || !ready}
                    onClick={() => chooseMood(m.label)}
                    style={{
                      borderRadius: 18,
                      border: `2.5px solid ${active ? m.color : "transparent"}`,
                      background: active ? `${m.color}28` : "#fff",
                      padding: "10px 4px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      boxShadow: active
                        ? `0 4px 14px ${m.color}40`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "all 0.18s",
                      transform: active ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    <span style={{ fontSize: 26 }}>{m.emoji}</span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: active ? m.color : "#6B6B8F",
                      }}
                    >
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ SOS ACTIVE ══ */}
        {sosActive && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 10 }}>🆘</div>
            <div
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 20,
                fontWeight: 900,
                color: "#fff",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              ¡SOS registrado!
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.88)",
                textAlign: "center",
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              Disponible en el teléfono
              <br />
              de mamá / papá
            </div>
            {/* Pulse rings */}
            <div
              style={{
                position: "relative",
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.5)",
                  animation: "pulseRingLg 1.4s ease-out infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.4)",
                  animation: "pulseRing 1.4s ease-out infinite 0.3s",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                📡
              </div>
            </div>
            {sosAck && (
              <div
                style={{
                  marginTop: 18,
                  background: "rgba(255,255,255,0.22)",
                  borderRadius: 14,
                  padding: "9px 16px",
                }}
              >
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 800 }}>
                  ✓ ¡Recibido!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <p role="status" style={{ maxWidth: 240, textAlign: "center", fontSize: 12, color: "#4A4A6A", marginTop: 16 }}>
        {status}{acknowledged ? " · SOS confirmado por el teléfono" : ""}
      </p>
      {/* Bottom strap */}
      <div
        style={{
          width: 38,
          height: 30,
          background: "linear-gradient(180deg, #C4B5FD, #A78BFA)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "0 5px 10px rgba(167,139,250,0.3)",
        }}
      />
    </div>
  )
}
