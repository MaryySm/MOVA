import { cssVar, cssVars } from "../styleVars";
import { useWearableController } from "../../controllers/useWearableController"
import "./WearableDevice.styles.css";
import { W, H, WR, WA, KIDS_MOODS, type WPage } from "../../models/wearable"

// Aquí dibujo el reloj simulado y conecto sus acciones con el controlador.
export function WearableDevice({
  onSOS,
  sosAck,
}: {
  onSOS: () => void
  sosAck: boolean
}) {
  const {
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
      data-mova-style="wearable-device-s0" style={cssVars({ "--mova-wearable-device-s0-background": cssVar((`${WA}22`), true) })}
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
      data-mova-style="wearable-device-s1"
    >
      {/* ── Watch body ── */}
      <div
        data-mova-style="wearable-device-s2" style={cssVars({ "--mova-wearable-device-s2-width": cssVar((W), true), "--mova-wearable-device-s2-height": cssVar((H), true), "--mova-wearable-device-s2-border-radius": cssVar((WR), true), "--mova-wearable-device-s2-background": cssVar((sosActive ? "#FF3B30" : "#FAF5FF"), true) })}
      >
        {/* Side crown */}
        <div
          data-mova-style="wearable-device-s3" style={cssVars({ "--mova-wearable-device-s3-right": cssVar((-5), true) })}
        />

        {/* Battery status */}
        {!sosActive && (
          <div
            data-mova-style="wearable-device-s4"
          >
            <div
              data-mova-style="wearable-device-s5"
            >
              <div
                data-mova-style="wearable-device-s6"
              />
            </div>
            <div
              data-mova-style="wearable-device-s7"
            />
            <span data-mova-style="wearable-device-s8">
              84%
            </span>
          </div>
        )}

        {/* ══ HOME ══ */}
        {page === "home" && !sosActive && (
          <div
            data-mova-style="wearable-device-s9"
          >
            {/* Time */}
            <div
              data-mova-style="wearable-device-s10" style={cssVars({ "--mova-wearable-device-s10-letter-spacing": cssVar((-2), true) })}
            >
              {hh}
            </div>
            <div
              data-mova-style="wearable-device-s11"
            >
              {dd}
            </div>

            {/* Two main nav buttons */}
            <div
              data-mova-style="wearable-device-s12"
            >
              {/* Activities */}
              <button
                onClick={() => setPage("activities")}
                data-mova-style="wearable-device-s13"
              >
                <span data-mova-style="wearable-device-s14">📋</span>
                <span
                  data-mova-style="wearable-device-s15"
                >
                  Actividades
                </span>
                {pendingCount > 0 && (
                  <div
                    data-mova-style="wearable-device-s16"
                  >
                    {pendingCount}
                  </div>
                )}
              </button>

              {/* Emotions */}
              <button
                onClick={() => setPage("emotions")}
                data-mova-style="wearable-device-s17"
              >
                <span data-mova-style="wearable-device-s18">
                  {mood
                    ? (KIDS_MOODS.find((m) => m.label === mood)?.emoji ?? "😊")
                    : "😊"}
                </span>
                <span
                  data-mova-style="wearable-device-s19"
                >
                  {mood ?? "Estado"}
                </span>
              </button>
            </div>

            {/* Daily activity progress */}
            <div data-mova-style="wearable-device-s20">
              <div
                data-mova-style="wearable-device-s21"
              >
                <span
                  data-mova-style="wearable-device-s22"
                >
                  Progreso de actividades
                </span>
                <span
                  data-mova-style="wearable-device-s23" style={cssVars({ "--mova-wearable-device-s23-color": cssVar((progressGreen), true) })}
                >
                  {activityPct}%
                </span>
              </div>
              <div
                data-mova-style="wearable-device-s24"
              >
                <div
                  data-mova-style="wearable-device-s25" style={cssVars({ "--mova-wearable-device-s25-width": cssVar((`${activityPct}%`), true), "--mova-wearable-device-s25-min-width": cssVar((activityPct ? 5 : 0), true), "--mova-wearable-device-s25-background": cssVar((`linear-gradient(90deg, #86EFAC, ${progressGreen})`), true) })}
                />
              </div>
            </div>

            {/* SOS hold-button */}
            <div data-mova-style="wearable-device-s26">
              {/* Progress ring */}
              <svg
                width="56"
                height="56"
                data-mova-style="wearable-device-s27"
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
                data-mova-style="wearable-device-s28" style={cssVars({ "--mova-wearable-device-s28-background": cssVar((holding
                    ? "#FF3B30"
                    : "linear-gradient(135deg, #FF6B9D, #FF3B30)"), true), "--mova-wearable-device-s28-font-size": cssVar((holding ? 16 : 22), true) })}
              >
                {holding ? `${Math.ceil((100 - holdPct) / 40)}` : "🆘"}
              </button>
            </div>
            <p
              data-mova-style="wearable-device-s29"
            >
              Mantén pulsado para SOS
            </p>
          </div>
        )}

        {/* ══ ACTIVITIES ══ */}
        {page === "activities" && !sosActive && (
          <div
            data-mova-style="wearable-device-s30"
          >
            <div
              data-mova-style="wearable-device-s31"
            >
              <BackBtn to="home" />
              <span
                data-mova-style="wearable-device-s32"
              >
                📋 Mis actividades
              </span>
            </div>
            <div data-mova-style="wearable-device-s33">
              {acts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleAct(a.id)}
                  data-mova-style="wearable-device-s34" style={cssVars({ "--mova-wearable-device-s34-background": cssVar((a.done ? "rgba(0,0,0,0.04)" : "#fff"), true), "--mova-wearable-device-s34-box-shadow": cssVar((a.done ? "none" : "0 2px 8px rgba(0,0,0,0.07)"), true), "--mova-wearable-device-s34-opacity": cssVar(a.done ? 0.5 : 1, false), "--mova-wearable-device-s34-border-left": cssVar((`4px solid ${a.done ? "#ddd" : a.color}`), true) })}
                >
                  <span data-mova-style="wearable-device-s35">{a.icon}</span>
                  <div data-mova-style="wearable-device-s36">
                    <div
                      data-mova-style="wearable-device-s37" style={cssVars({ "--mova-wearable-device-s37-text-decoration": cssVar((a.done ? "line-through" : "none"), true) })}
                    >
                      {a.label}
                    </div>
                    <div data-mova-style="wearable-device-s38">
                      {a.time}
                    </div>
                  </div>
                  <div
                    data-mova-style="wearable-device-s39" style={cssVars({ "--mova-wearable-device-s39-background": cssVar((a.done ? a.color : "transparent"), true), "--mova-wearable-device-s39-border": cssVar((`2px solid ${
                        a.done ? a.color : "rgba(0,0,0,0.15)"
                      }`), true) })}
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
            data-mova-style="wearable-device-s40"
          >
            <div
              data-mova-style="wearable-device-s41"
            >
              <BackBtn to="home" />
              <span
                data-mova-style="wearable-device-s42"
              >
                😊 ¿Cómo estás?
              </span>
            </div>
            <div
              data-mova-style="wearable-device-s43"
            >
              {KIDS_MOODS.map((m) => {
                const active = mood === m.label
                return (
                  <button
                    key={m.label}
                    onClick={() => chooseMood(m.label)}
                    data-mova-style="wearable-device-s44" style={cssVars({ "--mova-wearable-device-s44-border": cssVar((`2.5px solid ${active ? m.color : "transparent"}`), true), "--mova-wearable-device-s44-background": cssVar((active ? `${m.color}28` : "#fff"), true), "--mova-wearable-device-s44-box-shadow": cssVar((active
                        ? `0 4px 14px ${m.color}40`
                        : "0 2px 8px rgba(0,0,0,0.06)"), true), "--mova-wearable-device-s44-transform": cssVar((active ? "scale(1.08)" : "scale(1)"), true) })}
                  >
                    <span data-mova-style="wearable-device-s45">{m.emoji}</span>
                    <span
                      data-mova-style="wearable-device-s46" style={cssVars({ "--mova-wearable-device-s46-color": cssVar((active ? m.color : "#6B6B8F"), true) })}
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
            data-mova-style="wearable-device-s47"
          >
            <div data-mova-style="wearable-device-s48">🆘</div>
            <div
              data-mova-style="wearable-device-s49"
            >
              ¡SOS enviado!
            </div>
            <div
              data-mova-style="wearable-device-s50"
            >
              Aviso al teléfono
              <br />
              de mamá / papá
            </div>
            {/* Pulse rings */}
            <div
              data-mova-style="wearable-device-s51"
            >
              <div
                data-mova-style="wearable-device-s52"
              />
              <div
                data-mova-style="wearable-device-s53"
              />
              <div
                data-mova-style="wearable-device-s54"
              >
                📡
              </div>
            </div>
            {sosAck && (
              <div
                data-mova-style="wearable-device-s55"
              >
                <span data-mova-style="wearable-device-s56">
                  ✓ ¡Recibido!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom strap */}
      <div
        data-mova-style="wearable-device-s57"
      />
    </div>
  )
}
