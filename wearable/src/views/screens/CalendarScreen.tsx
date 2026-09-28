import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useCalendarController } from "../../controllers/usePlanningControllers"
import { DAYS, CALENDAR_EVENTS } from "../../models/planning"
export function CalendarScreen({ go }: { go: (s: Screen) => void }) {
  const { selectedDay, setSelectedDay, weeks, scheduled } =
    useCalendarController()

  const t = THEME.calendar

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
      <div style={{ padding: "52px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 22,
              fontWeight: 900,
              margin: 0,
              color: TEXT,
            }}
          >
            Agosto 2026
          </h2>
          <div style={{ display: "flex", gap: 8 }}>
            {["‹", "›"].map((a) => (
              <button
                key={a}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  color: TEXT_MED,
                  cursor: "pointer",
                  fontSize: 16,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              marginBottom: 8,
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: TEXT_MED,
                  fontWeight: 700,
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}
            >
              {week.map((day, di) => {
                if (!day) return <div key={di} />
                const event = CALENDAR_EVENTS.find((e) => e.day === day)
                const isSel = day === selectedDay
                const isToday = day === 10
                return (
                  <button
                    key={di}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "6px 2px",
                      background: isSel ? t.accent : "transparent",
                      borderRadius: 10,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        color: isSel ? "#fff" : isToday ? t.accent : TEXT,
                        fontWeight: isSel || isToday ? 800 : 400,
                      }}
                    >
                      {day}
                    </span>
                    {event && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: isSel
                            ? "rgba(255,255,255,0.8)"
                            : event.color,
                          marginTop: 2,
                        }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <h3
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 15,
            fontWeight: 800,
            margin: "0 0 14px",
            color: TEXT,
          }}
        >
          Lunes {selectedDay} de agosto
        </h3>

        {scheduled.map((ev) => (
          <div
            key={ev.time}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div style={{ width: 44, textAlign: "right", paddingTop: 4 }}>
              <span style={{ fontSize: 11, color: TEXT_MED }}>{ev.time}</span>
            </div>
            <div
              style={{
                width: 3,
                background: ev.color,
                borderRadius: 2,
                alignSelf: "stretch",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                background: `${ev.color}18`,
                borderRadius: 14,
                padding: "12px 14px",
                border: `1px solid ${ev.color}30`,
              }}
            >
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: TEXT,
                }}
              >
                {ev.name}
              </div>
              <div style={{ fontSize: 12, color: TEXT_MED, marginTop: 2 }}>
                {ev.duration}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => go("profile")}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "13px",
            borderRadius: 14,
            background: "transparent",
            border: `2px dashed ${t.accent}50`,
            color: t.muted,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Agregar actividad en planificación →
        </button>
      </div>
    </div>
  )
}
