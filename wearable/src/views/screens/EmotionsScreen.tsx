// Aquí presento el registro de emociones usando las opciones del modelo.
import { cssVar, cssVars } from "../styleVars";
import "./EmotionsScreen.styles.css";
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useEmotionsController } from "../../controllers/usePlanningControllers"
import { MOODS, EMOTION_TAGS, TAG_COLORS, DAYS } from "../../models/planning"
export function EmotionsScreen() {
  const {
    mood,
    setMood,
    tags,
    setTags,
    note,
    setNote,
    toggleTag,
    weekData,
    barColors,
  } = useEmotionsController()

  const t = THEME.emotions

  return (
    <div
      data-mova-style="emotions-screen-s0" style={cssVars({ "--mova-emotions-screen-s0-background": cssVar((t.bg), true) })}
    >
      <div data-mova-style="emotions-screen-s1">
        <h2
          data-mova-style="emotions-screen-s2" style={cssVars({ "--mova-emotions-screen-s2-color": cssVar((TEXT), true) })}
        >
          Estado emocional
        </h2>
        <p data-mova-style="emotions-screen-s3" style={cssVars({ "--mova-emotions-screen-s3-color": cssVar((t.muted), true) })}>
          ¿Cómo te encuentras hoy?
        </p>

        <div
          data-mova-style="emotions-screen-s4"
        >
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              data-mova-style="emotions-screen-s5" style={cssVars({ "--mova-emotions-screen-s5-background": cssVar((mood === m.id ? `${m.color}22` : "#fff"), true), "--mova-emotions-screen-s5-border": cssVar((`2px solid ${
                  mood === m.id ? m.color : "rgba(0,0,0,0.06)"
                }`), true), "--mova-emotions-screen-s5-box-shadow": cssVar((mood === m.id
                    ? `0 4px 18px ${m.color}35`
                    : "0 2px 8px rgba(0,0,0,0.04)"), true) })}
            >
              <span data-mova-style="emotions-screen-s6">{m.emoji}</span>
              <span
                data-mova-style="emotions-screen-s7" style={cssVars({ "--mova-emotions-screen-s7-color": cssVar((mood === m.id ? m.color : TEXT_MED), true) })}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <label
          data-mova-style="emotions-screen-s8" style={cssVars({ "--mova-emotions-screen-s8-color": cssVar((t.muted), true) })}
        >
          ¿Cómo te describes?
        </label>
        <div
          data-mova-style="emotions-screen-s9"
        >
          {EMOTION_TAGS.map((tag, i) => {
            const active = tags.includes(tag)
            const c = TAG_COLORS[i]
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                data-mova-style="emotions-screen-s10" style={cssVars({ "--mova-emotions-screen-s10-background": cssVar((active ? `${c}20` : "rgba(0,0,0,0.05)"), true), "--mova-emotions-screen-s10-border": cssVar((`1.5px solid ${active ? c : "transparent"}`), true), "--mova-emotions-screen-s10-color": cssVar((active ? c : TEXT_MED), true) })}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <label
          data-mova-style="emotions-screen-s11" style={cssVars({ "--mova-emotions-screen-s11-color": cssVar((t.muted), true) })}
        >
          Nota libre
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe cómo te sientes hoy…"
          rows={3}
          data-mova-style="emotions-screen-s12" style={cssVars({ "--mova-emotions-screen-s12-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-emotions-screen-s12-color": cssVar((TEXT), true) })}
        />

        {/* Mini bar chart */}
        <div
          data-mova-style="emotions-screen-s13"
        >
          <div
            data-mova-style="emotions-screen-s14" style={cssVars({ "--mova-emotions-screen-s14-color": cssVar((TEXT), true) })}
          >
            Esta semana
          </div>
          <div
            data-mova-style="emotions-screen-s15"
          >
            {weekData.map((v, i) => (
              <div
                key={i}
                data-mova-style="emotions-screen-s16"
              >
                <div
                  data-mova-style="emotions-screen-s17" style={cssVars({ "--mova-emotions-screen-s17-height": cssVar((`${(v / 92) * 56}px`), true), "--mova-emotions-screen-s17-background": cssVar((barColors[i]), true), "--mova-emotions-screen-s17-opacity": cssVar(i === 6 ? 1 : 0.6, false) })}
                />
                <span data-mova-style="emotions-screen-s18" style={cssVars({ "--mova-emotions-screen-s18-color": cssVar((TEXT_MED), true) })}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setMood(null)
            setTags([])
            setNote("")
          }}
          data-mova-style="emotions-screen-s19" style={cssVars({ "--mova-emotions-screen-s19-background": cssVar((`linear-gradient(135deg, ${t.accent}, #FFD0B8)`), true), "--mova-emotions-screen-s19-box-shadow": cssVar((`0 8px 24px ${t.accent}44`), true) })}
        >
          Guardar registro
        </button>
      </div>
    </div>
  )
}
