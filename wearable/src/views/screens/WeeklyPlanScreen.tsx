import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useWeeklyPlanController } from "../../controllers/usePlanningControllers"
import { WEEK_DAYS, ACTIVITY_PRESETS } from "../../models/planning"
export function WeeklyPlanScreen({ go }: { go: (s: Screen) => void }) {
  const {
    activeDay,
    setActiveDay,
    plan,
    showPicker,
    setShowPicker,
    customText,
    setCustomText,
    customTime,
    setCustomTime,
    dayInfo,
    dayActivities,
    addActivity,
    removeActivity,
    addCustom,
  } = useWeeklyPlanController()

  const t = THEME.profile

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bg,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "52px 20px 16px",
          background: `linear-gradient(180deg, #C8EEDD 0%, ${t.bg} 100%)`,
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 24,
            fontWeight: 900,
            margin: "0 0 2px",
            color: TEXT,
          }}
        >
          Planificación Semanal
        </h2>
        <p style={{ color: t.muted, fontSize: 13, margin: 0 }}>
          Organiza tus actividades de cada día
        </p>
      </div>

      {/* Day selector */}
      <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {WEEK_DAYS.map((d) => {
            const isActive = d.key === activeDay
            const count = (plan[d.key] || []).length
            return (
              <button
                key={d.key}
                onClick={() => {
                  setActiveDay(d.key)
                  setShowPicker(false)
                }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "8px 2px",
                  borderRadius: 14,
                  background: isActive ? d.color : "#fff",
                  border: `1.5px solid ${
                    isActive ? d.color : "rgba(0,0,0,0.07)"
                  }`,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: isActive
                    ? `0 4px 14px ${d.color}44`
                    : "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isActive ? "#fff" : TEXT_MED,
                  }}
                >
                  {d.label}
                </span>
                {count > 0 && (
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: isActive
                        ? "rgba(255,255,255,0.35)"
                        : `${d.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: isActive ? "#fff" : d.color,
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </div>
                )}
                {count === 0 && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: isActive
                        ? "rgba(255,255,255,0.5)"
                        : "transparent",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 18,
                fontWeight: 800,
                color: TEXT,
              }}
            >
              {dayInfo.full}
            </span>
            <span style={{ fontSize: 13, color: TEXT_MED, marginLeft: 8 }}>
              {dayActivities.length}{" "}
              {dayActivities.length === 1 ? "actividad" : "actividades"}
            </span>
          </div>
          <button
            onClick={() => setShowPicker((p) => !p)}
            style={{
              background: showPicker ? dayInfo.color : `${dayInfo.color}20`,
              border: `1.5px solid ${dayInfo.color}`,
              borderRadius: 12,
              padding: "7px 14px",
              cursor: "pointer",
              color: showPicker ? "#fff" : dayInfo.color,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {showPicker ? "✕ Cerrar" : "+ Agregar"}
          </button>
        </div>

        {/* Activity list */}
        {dayActivities.length === 0 && !showPicker && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: 20,
              border: `2px dashed ${dayInfo.color}40`,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <p style={{ color: TEXT_MED, fontSize: 14, margin: 0 }}>
              Sin actividades para este día.
              <br />
              Toca <strong style={{ color: dayInfo.color }}>+ Agregar</strong>{" "}
              para planificar.
            </p>
          </div>
        )}

        {dayActivities.map((act) => (
          <div
            key={act.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              background: "#fff",
              borderRadius: 14,
              marginBottom: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${act.color}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: TEXT,
                }}
              >
                {act.label}
              </div>
              <div style={{ fontSize: 11, color: TEXT_MED, marginTop: 2 }}>
                🕐 {act.time}
              </div>
            </div>
            <button
              onClick={() => removeActivity(act.id)}
              style={{
                background: "rgba(245,121,90,0.12)",
                border: "none",
                borderRadius: 8,
                width: 28,
                height: 28,
                cursor: "pointer",
                color: "#F5795A",
                fontSize: 14,
              }}
            >
              ×
            </button>
          </div>
        ))}

        {/* Picker panel */}
        {showPicker && (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              marginTop: 8,
            }}
          >
            {/* Custom input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe una actividad…"
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                style={{
                  flex: 1,
                  background: "#F5F5F8",
                  border: `1.5px solid ${dayInfo.color}40`,
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: TEXT,
                  outline: "none",
                }}
              />
              <input
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                type="time"
                style={{
                  background: "#F5F5F8",
                  border: `1.5px solid ${dayInfo.color}40`,
                  borderRadius: 12,
                  padding: "10px 10px",
                  fontSize: 13,
                  color: TEXT,
                  outline: "none",
                  width: 90,
                }}
              />
              <button
                onClick={addCustom}
                style={{
                  background: dayInfo.color,
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 14px",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>

            <p
              style={{
                fontSize: 11,
                color: TEXT_MED,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontWeight: 700,
                margin: "0 0 10px",
              }}
            >
              Actividades sugeridas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ACTIVITY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => addActivity(preset.label, preset.color)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: 20,
                    background: `${preset.color}18`,
                    border: `1.5px solid ${preset.color}40`,
                    color: TEXT,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: "12px 20px 24px",
          flexShrink: 0,
          borderTop: "1px solid rgba(0,0,0,0.06)",
          background: t.bg,
        }}
      >
        <button
          onClick={() => go("home")}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 16,
            border: "none",
            background: `linear-gradient(135deg, ${t.accent}, #A8E8D4)`,
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: `0 8px 24px ${t.accent}44`,
          }}
        >
          Guardar y continuar →
        </button>
      </div>
    </div>
  )
}
