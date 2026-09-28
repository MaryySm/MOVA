import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useHomeController } from "../../controllers/usePlanningControllers"
import { MOODS_HOME } from "../../models/planning"
export function HomeScreen({ go }: { go: (s: Screen) => void }) {
  const {
    mood,
    setMood,
    notifOpen,
    setNotifOpen,
    syncedSummary,
    toggleTask,
    pct,
    notifs,
    grouped,
  } = useHomeController()

  const t = THEME.home

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        paddingBottom: 80,
        background: t.bg,
      }}
    >
      {/* Notification panel */}
      {notifOpen && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 150,
            background: "#fff",
            borderRadius: "0 0 24px 24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            padding: "56px 20px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: TEXT,
              }}
            >
              Notificaciones
            </span>
            <button
              onClick={() => setNotifOpen(false)}
              style={{
                background: "rgba(0,0,0,0.06)",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                color: TEXT_MED,
                fontSize: 13,
              }}
            >
              ✕
            </button>
          </div>
          {notifs.map((n, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom:
                  i < notifs.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: n.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 13, color: TEXT }}>
                {n.text}
              </span>
              <span style={{ fontSize: 11, color: TEXT_MED }}>{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "46px 20px 16px",
          background: `linear-gradient(180deg, #FFD9E8 0%, ${t.bg} 100%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ color: t.muted, fontSize: 12, margin: "0 0 2px" }}>
              Lunes, 10 de agosto 2026
            </p>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 21,
                fontWeight: 900,
                margin: 0,
                color: TEXT,
              }}
            >
              ¡Hola, {syncedSummary.name.split(" ")[0]}! 👋
            </h2>
            {syncedSummary.adultName && (
              <p style={{ color: t.muted, fontSize: 11, margin: "3px 0 0" }}>
                Acompañado por {syncedSummary.adultName}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Notif bell */}
            <button
              onClick={() => setNotifOpen((p) => !p)}
              style={{
                position: "relative",
                background: "#fff",
                border: "none",
                borderRadius: 12,
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                  stroke={t.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#F5795A",
                  border: "2px solid #fff",
                }}
              />
            </button>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${t.accent}, #A882F5)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 900,
                color: "#fff",
                fontSize: 15,
              }}
            >
              {syncedSummary.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Mood widget */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "14px 16px",
            boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                fontWeight: 800,
                color: TEXT,
              }}
            >
              ¿Cómo estás hoy?
            </span>
            <button
              onClick={() => go("emotions")}
              style={{
                background: "none",
                border: "none",
                fontSize: 11,
                color: t.accent,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Ver más →
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {MOODS_HOME.map((m) => {
              const active = mood === m.label
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    background: active ? `${m.color}22` : "transparent",
                    border: `1.5px solid ${active ? m.color : "transparent"}`,
                    borderRadius: 12,
                    padding: "8px 6px",
                    cursor: "pointer",
                    flex: 1,
                    margin: "0 2px",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span
                    style={{
                      fontSize: 9,
                      color: active ? m.color : TEXT_MED,
                      fontWeight: 700,
                    }}
                  >
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
          {mood && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 10,
                background: `${MOODS_HOME.find((m) => m.label === mood)?.color}18`,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: MOODS_HOME.find((m) => m.label === mood)?.color,
                  fontWeight: 700,
                }}
              >
                Estado guardado: {mood} · toca "Ver más" para añadir nota
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mini GPS card */}
      <div style={{ padding: "0 20px", marginBottom: 16 }}>
        <button
          onClick={() => go("device")}
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <div style={{ position: "relative", height: 100 }}>
            {/* Mini map bg */}
            <div
              style={{ position: "absolute", inset: 0, background: "#EDF5FF" }}
            >
              <svg width="100%" height="100%" style={{ opacity: 0.35 }}>
                <defs>
                  <pattern
                    id="gH"
                    width="22"
                    height="22"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 22 0 L 0 0 0 22"
                      fill="none"
                      stroke="#7098F5"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gH)" />
              </svg>
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0 }}
              >
                <path
                  d="M 40 85 Q 100 65 160 70 Q 210 74 250 52 Q 290 34 330 40"
                  fill="none"
                  stroke="#7098F5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                <circle cx="40" cy="85" r="5" fill="#7098F5" />
                <circle
                  cx="280"
                  cy="46"
                  r="9"
                  fill="#7098F550"
                  stroke="#7098F5"
                  strokeWidth="2"
                  style={{
                    transformOrigin: "280px 46px",
                    animation: "pulseRing 2s ease-in-out infinite",
                  }}
                />
              </svg>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 12,
                right: 12,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 10,
                padding: "6px 12px",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: TEXT,
                  }}
                >
                  📍 {syncedSummary.name} · {syncedSummary.battery}%
                </div>
                <div style={{ fontSize: 11, color: TEXT_MED }}>
                  {syncedSummary.deviceName} · actualizado hace 1 min
                </div>
              </div>
              <span style={{ fontSize: 11, color: "#7098F5", fontWeight: 700 }}>
                Ver mapa →
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Today's routine */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 15,
              fontWeight: 800,
              color: TEXT,
            }}
          >
            Rutina del día
          </span>
          <span style={{ fontSize: 12, color: t.accent, fontWeight: 700 }}>
            {pct}% completo
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "rgba(0,0,0,0.08)",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              background: `linear-gradient(90deg, ${t.accent}, #A882F5)`,
              width: `${pct}%`,
              transition: "width 0.4s",
            }}
          />
        </div>

        {grouped.map((group) => (
          <div key={group.slot} style={{ marginBottom: 14 }}>
            <p
              style={{
                fontSize: 11,
                color: TEXT_MED,
                fontWeight: 700,
                letterSpacing: 0.8,
                margin: "0 0 8px",
              }}
            >
              {group.label}
            </p>
            {group.items.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  background: "#fff",
                  borderRadius: 14,
                  marginBottom: 7,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: `1px solid ${
                    task.done ? task.color + "40" : "rgba(0,0,0,0.04)"
                  }`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s",
                  opacity: task.done ? 0.75 : 1,
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    flexShrink: 0,
                    background: task.done ? task.color : "transparent",
                    border: `2px solid ${
                      task.done ? task.color : "rgba(0,0,0,0.18)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {task.done && (
                    <svg width="12" height="12" viewBox="0 0 12 12">
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
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT,
                    textDecoration: task.done ? "line-through" : "none",
                  }}
                >
                  {task.label}
                </span>
                <span style={{ fontSize: 11, color: TEXT_MED }}>
                  {task.time}
                </span>
                {/* Notification dot */}
                {!task.done && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: task.color,
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
