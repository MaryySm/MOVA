// Aquí presento el calendario y enlazo sus acciones con la planificación.
import { cssVar, cssVars } from "../styleVars";
import "./CalendarScreen.styles.css";
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
      data-mova-style="calendar-screen-s0" style={cssVars({ "--mova-calendar-screen-s0-background": cssVar((t.bg), true) })}
    >
      <div data-mova-style="calendar-screen-s1">
        <div
          data-mova-style="calendar-screen-s2"
        >
          <h2
            data-mova-style="calendar-screen-s3" style={cssVars({ "--mova-calendar-screen-s3-color": cssVar((TEXT), true) })}
          >
            Agosto 2026
          </h2>
          <div data-mova-style="calendar-screen-s4">
            {["‹", "›"].map((a) => (
              <button
                key={a}
                data-mova-style="calendar-screen-s5" style={cssVars({ "--mova-calendar-screen-s5-color": cssVar((TEXT_MED), true) })}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div
          data-mova-style="calendar-screen-s6"
        >
          <div
            data-mova-style="calendar-screen-s7"
          >
            {DAYS.map((d) => (
              <div
                key={d}
                data-mova-style="calendar-screen-s8" style={cssVars({ "--mova-calendar-screen-s8-color": cssVar((TEXT_MED), true) })}
              >
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div
              key={wi}
              data-mova-style="calendar-screen-s9"
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
                    data-mova-style="calendar-screen-s10" style={cssVars({ "--mova-calendar-screen-s10-background": cssVar((isSel ? t.accent : "transparent"), true) })}
                  >
                    <span
                      data-mova-style="calendar-screen-s11" style={cssVars({ "--mova-calendar-screen-s11-color": cssVar((isSel ? "#fff" : isToday ? t.accent : TEXT), true), "--mova-calendar-screen-s11-font-weight": cssVar(isSel || isToday ? 800 : 400, false) })}
                    >
                      {day}
                    </span>
                    {event && (
                      <div
                        data-mova-style="calendar-screen-s12" style={cssVars({ "--mova-calendar-screen-s12-background": cssVar((isSel
                            ? "rgba(255,255,255,0.8)"
                            : event.color), true) })}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <h3
          data-mova-style="calendar-screen-s13" style={cssVars({ "--mova-calendar-screen-s13-color": cssVar((TEXT), true) })}
        >
          Lunes {selectedDay} de agosto
        </h3>

        {scheduled.map((ev) => (
          <div
            key={ev.time}
            data-mova-style="calendar-screen-s14"
          >
            <div data-mova-style="calendar-screen-s15">
              <span data-mova-style="calendar-screen-s16" style={cssVars({ "--mova-calendar-screen-s16-color": cssVar((TEXT_MED), true) })}>{ev.time}</span>
            </div>
            <div
              data-mova-style="calendar-screen-s17" style={cssVars({ "--mova-calendar-screen-s17-background": cssVar((ev.color), true) })}
            />
            <div
              data-mova-style="calendar-screen-s18" style={cssVars({ "--mova-calendar-screen-s18-background": cssVar((`${ev.color}18`), true), "--mova-calendar-screen-s18-border": cssVar((`1px solid ${ev.color}30`), true) })}
            >
              <div
                data-mova-style="calendar-screen-s19" style={cssVars({ "--mova-calendar-screen-s19-color": cssVar((TEXT), true) })}
              >
                {ev.name}
              </div>
              <div data-mova-style="calendar-screen-s20" style={cssVars({ "--mova-calendar-screen-s20-color": cssVar((TEXT_MED), true) })}>
                {ev.duration}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => go("profile")}
          data-mova-style="calendar-screen-s21" style={cssVars({ "--mova-calendar-screen-s21-border": cssVar((`2px dashed ${t.accent}50`), true), "--mova-calendar-screen-s21-color": cssVar((t.muted), true) })}
        >
          + Agregar actividad en planificación →
        </button>
      </div>
    </div>
  )
}
