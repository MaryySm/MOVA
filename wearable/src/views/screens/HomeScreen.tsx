// Aquí presento el resumen del usuario y sus actividades del día.
import { cssVar, cssVars } from "../styleVars";
import "./HomeScreen.styles.css";
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
      data-mova-style="home-screen-s0" style={cssVars({ "--mova-home-screen-s0-background": cssVar((t.bg), true) })}
    >
      {/* Notification panel */}
      {notifOpen && (
        <div
          data-mova-style="home-screen-s1"
        >
          <div
            data-mova-style="home-screen-s2"
          >
            <span
              data-mova-style="home-screen-s3" style={cssVars({ "--mova-home-screen-s3-color": cssVar((TEXT), true) })}
            >
              Notificaciones
            </span>
            <button
              onClick={() => setNotifOpen(false)}
              data-mova-style="home-screen-s4" style={cssVars({ "--mova-home-screen-s4-color": cssVar((TEXT_MED), true) })}
            >
              ✕
            </button>
          </div>
          {notifs.map((n, i) => (
            <div
              key={i}
              data-mova-style="home-screen-s5" style={cssVars({ "--mova-home-screen-s5-border-bottom": cssVar((i < notifs.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none"), true) })}
            >
              <div
                data-mova-style="home-screen-s6" style={cssVars({ "--mova-home-screen-s6-background": cssVar((n.color), true) })}
              />
              <span data-mova-style="home-screen-s7" style={cssVars({ "--mova-home-screen-s7-color": cssVar((TEXT), true) })}>
                {n.text}
              </span>
              <span data-mova-style="home-screen-s8" style={cssVars({ "--mova-home-screen-s8-color": cssVar((TEXT_MED), true) })}>{n.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div
        data-mova-style="home-screen-s9" style={cssVars({ "--mova-home-screen-s9-background": cssVar((`linear-gradient(180deg, #FFD9E8 0%, ${t.bg} 100%)`), true) })}
      >
        <div
          data-mova-style="home-screen-s10"
        >
          <div>
            <p data-mova-style="home-screen-s11" style={cssVars({ "--mova-home-screen-s11-color": cssVar((t.muted), true) })}>
              Lunes, 10 de agosto 2026
            </p>
            <h2
              data-mova-style="home-screen-s12" style={cssVars({ "--mova-home-screen-s12-color": cssVar((TEXT), true) })}
            >
              ¡Hola, {syncedSummary.name.split(" ")[0]}! 👋
            </h2>
            {syncedSummary.adultName && (
              <p data-mova-style="home-screen-s13" style={cssVars({ "--mova-home-screen-s13-color": cssVar((t.muted), true) })}>
                Acompañado por {syncedSummary.adultName}
              </p>
            )}
          </div>
          <div data-mova-style="home-screen-s14">
            {/* Notif bell */}
            <button
              onClick={() => setNotifOpen((p) => !p)}
              data-mova-style="home-screen-s15"
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
                data-mova-style="home-screen-s16"
              />
            </button>
            <div
              data-mova-style="home-screen-s17" style={cssVars({ "--mova-home-screen-s17-background": cssVar((`linear-gradient(135deg, ${t.accent}, #A882F5)`), true) })}
            >
              {syncedSummary.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Mood widget */}
      <div data-mova-style="home-screen-s18">
        <div
          data-mova-style="home-screen-s19"
        >
          <div
            data-mova-style="home-screen-s20"
          >
            <span
              data-mova-style="home-screen-s21" style={cssVars({ "--mova-home-screen-s21-color": cssVar((TEXT), true) })}
            >
              ¿Cómo estás hoy?
            </span>
            <button
              onClick={() => go("emotions")}
              data-mova-style="home-screen-s22" style={cssVars({ "--mova-home-screen-s22-color": cssVar((t.accent), true) })}
            >
              Ver más →
            </button>
          </div>
          <div data-mova-style="home-screen-s23">
            {MOODS_HOME.map((m) => {
              const active = mood === m.label
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(m.label)}
                  data-mova-style="home-screen-s24" style={cssVars({ "--mova-home-screen-s24-background": cssVar((active ? `${m.color}22` : "transparent"), true), "--mova-home-screen-s24-border": cssVar((`1.5px solid ${active ? m.color : "transparent"}`), true) })}
                >
                  <span data-mova-style="home-screen-s25">{m.emoji}</span>
                  <span
                    data-mova-style="home-screen-s26" style={cssVars({ "--mova-home-screen-s26-color": cssVar((active ? m.color : TEXT_MED), true) })}
                  >
                    {m.label}
                  </span>
                </button>
              )
            })}
          </div>
          {mood && (
            <div
              data-mova-style="home-screen-s27" style={cssVars({ "--mova-home-screen-s27-background": cssVar((`${MOODS_HOME.find((m) => m.label === mood)?.color}18`), true) })}
            >
              <span
                data-mova-style="home-screen-s28" style={cssVars({ "--mova-home-screen-s28-color": cssVar((MOODS_HOME.find((m) => m.label === mood)?.color), true) })}
              >
                Estado guardado: {mood} · toca "Ver más" para añadir nota
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mini GPS card */}
      <div data-mova-style="home-screen-s29">
        <button
          onClick={() => go("device")}
          data-mova-style="home-screen-s30"
        >
          <div data-mova-style="home-screen-s31">
            {/* Mini map bg */}
            <div
              data-mova-style="home-screen-s32"
            >
              <svg width="100%" height="100%" data-mova-style="home-screen-s33">
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
                data-mova-style="home-screen-s34"
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
                  data-mova-style="home-screen-s35"
                />
              </svg>
            </div>
            <div
              data-mova-style="home-screen-s36"
            >
              <div>
                <div
                  data-mova-style="home-screen-s37" style={cssVars({ "--mova-home-screen-s37-color": cssVar((TEXT), true) })}
                >
                  📍 {syncedSummary.name} · {syncedSummary.battery}%
                </div>
                <div data-mova-style="home-screen-s38" style={cssVars({ "--mova-home-screen-s38-color": cssVar((TEXT_MED), true) })}>
                  {syncedSummary.deviceName} · actualizado hace 1 min
                </div>
              </div>
              <span data-mova-style="home-screen-s39">
                Ver mapa →
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Today's routine */}
      <div data-mova-style="home-screen-s40">
        <div
          data-mova-style="home-screen-s41"
        >
          <span
            data-mova-style="home-screen-s42" style={cssVars({ "--mova-home-screen-s42-color": cssVar((TEXT), true) })}
          >
            Rutina del día
          </span>
          <span data-mova-style="home-screen-s43" style={cssVars({ "--mova-home-screen-s43-color": cssVar((t.accent), true) })}>
            {pct}% completo
          </span>
        </div>

        {/* Progress bar */}
        <div
          data-mova-style="home-screen-s44"
        >
          <div
            data-mova-style="home-screen-s45" style={cssVars({ "--mova-home-screen-s45-background": cssVar((`linear-gradient(90deg, ${t.accent}, #A882F5)`), true), "--mova-home-screen-s45-width": cssVar((`${pct}%`), true) })}
          />
        </div>

        {grouped.map((group) => (
          <div key={group.slot} data-mova-style="home-screen-s46">
            <p
              data-mova-style="home-screen-s47" style={cssVars({ "--mova-home-screen-s47-color": cssVar((TEXT_MED), true) })}
            >
              {group.label}
            </p>
            {group.items.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                data-mova-style="home-screen-s48" style={cssVars({ "--mova-home-screen-s48-border": cssVar((`1px solid ${
                    task.done ? task.color + "40" : "rgba(0,0,0,0.04)"
                  }`), true), "--mova-home-screen-s48-opacity": cssVar(task.done ? 0.75 : 1, false) })}
              >
                {/* Checkbox */}
                <div
                  data-mova-style="home-screen-s49" style={cssVars({ "--mova-home-screen-s49-background": cssVar((task.done ? task.color : "transparent"), true), "--mova-home-screen-s49-border": cssVar((`2px solid ${
                      task.done ? task.color : "rgba(0,0,0,0.18)"
                    }`), true) })}
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
                  data-mova-style="home-screen-s50" style={cssVars({ "--mova-home-screen-s50-color": cssVar((TEXT), true), "--mova-home-screen-s50-text-decoration": cssVar((task.done ? "line-through" : "none"), true) })}
                >
                  {task.label}
                </span>
                <span data-mova-style="home-screen-s51" style={cssVars({ "--mova-home-screen-s51-color": cssVar((TEXT_MED), true) })}>
                  {task.time}
                </span>
                {/* Notification dot */}
                {!task.done && (
                  <div
                    data-mova-style="home-screen-s52" style={cssVars({ "--mova-home-screen-s52-background": cssVar((task.color), true) })}
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
