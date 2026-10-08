// Aquí presento el plan semanal y las acciones para editar actividades.
import { cssVar, cssVars } from "../styleVars";
import "./WeeklyPlanScreen.styles.css";
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
      data-mova-style="weekly-plan-screen-s0" style={cssVars({ "--mova-weekly-plan-screen-s0-background": cssVar((t.bg), true) })}
    >
      {/* Header */}
      <div
        data-mova-style="weekly-plan-screen-s1" style={cssVars({ "--mova-weekly-plan-screen-s1-background": cssVar((`linear-gradient(180deg, #C8EEDD 0%, ${t.bg} 100%)`), true) })}
      >
        <h2
          data-mova-style="weekly-plan-screen-s2" style={cssVars({ "--mova-weekly-plan-screen-s2-color": cssVar((TEXT), true) })}
        >
          Planificación Semanal
        </h2>
        <p data-mova-style="weekly-plan-screen-s3" style={cssVars({ "--mova-weekly-plan-screen-s3-color": cssVar((t.muted), true) })}>
          Organiza tus actividades de cada día
        </p>
      </div>

      {/* Day selector */}
      <div data-mova-style="weekly-plan-screen-s4">
        <div data-mova-style="weekly-plan-screen-s5">
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
                data-mova-style="weekly-plan-screen-s6" style={cssVars({ "--mova-weekly-plan-screen-s6-background": cssVar((isActive ? d.color : "#fff"), true), "--mova-weekly-plan-screen-s6-border": cssVar((`1.5px solid ${
                    isActive ? d.color : "rgba(0,0,0,0.07)"
                  }`), true), "--mova-weekly-plan-screen-s6-box-shadow": cssVar((isActive
                    ? `0 4px 14px ${d.color}44`
                    : "0 2px 6px rgba(0,0,0,0.05)"), true) })}
              >
                <span
                  data-mova-style="weekly-plan-screen-s7" style={cssVars({ "--mova-weekly-plan-screen-s7-color": cssVar((isActive ? "#fff" : TEXT_MED), true) })}
                >
                  {d.label}
                </span>
                {count > 0 && (
                  <div
                    data-mova-style="weekly-plan-screen-s8" style={cssVars({ "--mova-weekly-plan-screen-s8-background": cssVar((isActive
                        ? "rgba(255,255,255,0.35)"
                        : `${d.color}30`), true), "--mova-weekly-plan-screen-s8-color": cssVar((isActive ? "#fff" : d.color), true) })}
                  >
                    {count}
                  </div>
                )}
                {count === 0 && (
                  <div
                    data-mova-style="weekly-plan-screen-s9" style={cssVars({ "--mova-weekly-plan-screen-s9-background": cssVar((isActive
                        ? "rgba(255,255,255,0.5)"
                        : "transparent"), true) })}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Day content */}
      <div data-mova-style="weekly-plan-screen-s10">
        <div
          data-mova-style="weekly-plan-screen-s11"
        >
          <div>
            <span
              data-mova-style="weekly-plan-screen-s12" style={cssVars({ "--mova-weekly-plan-screen-s12-color": cssVar((TEXT), true) })}
            >
              {dayInfo.full}
            </span>
            <span data-mova-style="weekly-plan-screen-s13" style={cssVars({ "--mova-weekly-plan-screen-s13-color": cssVar((TEXT_MED), true) })}>
              {dayActivities.length}{" "}
              {dayActivities.length === 1 ? "actividad" : "actividades"}
            </span>
          </div>
          <button
            onClick={() => setShowPicker((p) => !p)}
            data-mova-style="weekly-plan-screen-s14" style={cssVars({ "--mova-weekly-plan-screen-s14-background": cssVar((showPicker ? dayInfo.color : `${dayInfo.color}20`), true), "--mova-weekly-plan-screen-s14-border": cssVar((`1.5px solid ${dayInfo.color}`), true), "--mova-weekly-plan-screen-s14-color": cssVar((showPicker ? "#fff" : dayInfo.color), true) })}
          >
            {showPicker ? "✕ Cerrar" : "+ Agregar"}
          </button>
        </div>

        {/* Activity list */}
        {dayActivities.length === 0 && !showPicker && (
          <div
            data-mova-style="weekly-plan-screen-s15" style={cssVars({ "--mova-weekly-plan-screen-s15-border": cssVar((`2px dashed ${dayInfo.color}40`), true) })}
          >
            <div data-mova-style="weekly-plan-screen-s16">📅</div>
            <p data-mova-style="weekly-plan-screen-s17" style={cssVars({ "--mova-weekly-plan-screen-s17-color": cssVar((TEXT_MED), true) })}>
              Sin actividades para este día.
              <br />
              Toca <strong data-mova-style="weekly-plan-screen-s18" style={cssVars({ "--mova-weekly-plan-screen-s18-color": cssVar((dayInfo.color), true) })}>+ Agregar</strong>{" "}
              para planificar.
            </p>
          </div>
        )}

        {dayActivities.map((act) => (
          <div
            key={act.id}
            data-mova-style="weekly-plan-screen-s19" style={cssVars({ "--mova-weekly-plan-screen-s19-border-left": cssVar((`4px solid ${act.color}`), true) })}
          >
            <div data-mova-style="weekly-plan-screen-s20">
              <div
                data-mova-style="weekly-plan-screen-s21" style={cssVars({ "--mova-weekly-plan-screen-s21-color": cssVar((TEXT), true) })}
              >
                {act.label}
              </div>
              <div data-mova-style="weekly-plan-screen-s22" style={cssVars({ "--mova-weekly-plan-screen-s22-color": cssVar((TEXT_MED), true) })}>
                🕐 {act.time}
              </div>
            </div>
            <button
              onClick={() => removeActivity(act.id)}
              data-mova-style="weekly-plan-screen-s23"
            >
              ×
            </button>
          </div>
        ))}

        {/* Picker panel */}
        {showPicker && (
          <div
            data-mova-style="weekly-plan-screen-s24"
          >
            {/* Custom input */}
            <div data-mova-style="weekly-plan-screen-s25">
              <input
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe una actividad…"
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                data-mova-style="weekly-plan-screen-s26" style={cssVars({ "--mova-weekly-plan-screen-s26-border": cssVar((`1.5px solid ${dayInfo.color}40`), true), "--mova-weekly-plan-screen-s26-color": cssVar((TEXT), true) })}
              />
              <input
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                type="time"
                data-mova-style="weekly-plan-screen-s27" style={cssVars({ "--mova-weekly-plan-screen-s27-border": cssVar((`1.5px solid ${dayInfo.color}40`), true), "--mova-weekly-plan-screen-s27-color": cssVar((TEXT), true) })}
              />
              <button
                onClick={addCustom}
                data-mova-style="weekly-plan-screen-s28" style={cssVars({ "--mova-weekly-plan-screen-s28-background": cssVar((dayInfo.color), true) })}
              >
                OK
              </button>
            </div>

            <p
              data-mova-style="weekly-plan-screen-s29" style={cssVars({ "--mova-weekly-plan-screen-s29-color": cssVar((TEXT_MED), true) })}
            >
              Actividades sugeridas
            </p>
            <div data-mova-style="weekly-plan-screen-s30">
              {ACTIVITY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => addActivity(preset.label, preset.color)}
                  data-mova-style="weekly-plan-screen-s31" style={cssVars({ "--mova-weekly-plan-screen-s31-background": cssVar((`${preset.color}18`), true), "--mova-weekly-plan-screen-s31-border": cssVar((`1.5px solid ${preset.color}40`), true), "--mova-weekly-plan-screen-s31-color": cssVar((TEXT), true) })}
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
        data-mova-style="weekly-plan-screen-s32" style={cssVars({ "--mova-weekly-plan-screen-s32-background": cssVar((t.bg), true) })}
      >
        <button
          onClick={() => go("home")}
          data-mova-style="weekly-plan-screen-s33" style={cssVars({ "--mova-weekly-plan-screen-s33-background": cssVar((`linear-gradient(135deg, ${t.accent}, #A8E8D4)`), true), "--mova-weekly-plan-screen-s33-box-shadow": cssVar((`0 8px 24px ${t.accent}44`), true) })}
        >
          Guardar y continuar →
        </button>
      </div>
    </div>
  )
}
