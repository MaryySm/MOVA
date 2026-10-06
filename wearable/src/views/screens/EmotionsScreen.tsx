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
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        paddingBottom: 80,
        background: t.bg,
      }}
    >
      <div style={{ padding: "52px 20px 16px" }}>
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 24,
            fontWeight: 900,
            margin: "0 0 4px",
            color: TEXT,
          }}
        >
          Estado emocional
        </h2>
        <p style={{ color: t.muted, fontSize: 14, margin: "0 0 22px" }}>
          ¿Cómo te encuentras hoy?
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              style={{
                padding: "16px 8px",
                borderRadius: 16,
                background: mood === m.id ? `${m.color}22` : "#fff",
                border: `2px solid ${
                  mood === m.id ? m.color : "rgba(0,0,0,0.06)"
                }`,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                boxShadow:
                  mood === m.id
                    ? `0 4px 18px ${m.color}35`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: 28 }}>{m.emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  color: mood === m.id ? m.color : TEXT_MED,
                  fontWeight: 700,
                }}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <label
          style={{
            fontSize: 11,
            color: t.muted,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          ¿Cómo te describes?
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            margin: "10px 0 22px",
          }}
        >
          {EMOTION_TAGS.map((tag, i) => {
            const active = tags.includes(tag)
            const c = TAG_COLORS[i]
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  background: active ? `${c}20` : "rgba(0,0,0,0.05)",
                  border: `1.5px solid ${active ? c : "transparent"}`,
                  color: active ? c : TEXT_MED,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <label
          style={{
            fontSize: 11,
            color: t.muted,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Nota libre
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe cómo te sientes hoy…"
          rows={3}
          style={{
            display: "block",
            width: "100%",
            marginTop: 8,
            marginBottom: 22,
            background: "#fff",
            border: `1.5px solid ${t.border}`,
            borderRadius: 14,
            padding: "13px 16px",
            color: TEXT,
            fontSize: 14,
            outline: "none",
            resize: "none",
          }}
        />

        {/* Mini bar chart */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              fontWeight: 800,
              color: TEXT,
              marginBottom: 12,
            }}
          >
            Esta semana
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              height: 72,
            }}
          >
            {weekData.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    borderRadius: 5,
                    height: `${(v / 92) * 56}px`,
                    background: barColors[i],
                    opacity: i === 6 ? 1 : 0.6,
                  }}
                />
                <span style={{ fontSize: 10, color: TEXT_MED }}>{DAYS[i]}</span>
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
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 16,
            border: "none",
            background: `linear-gradient(135deg, ${t.accent}, #FFD0B8)`,
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: `0 8px 24px ${t.accent}44`,
          }}
        >
          Guardar registro
        </button>
      </div>
    </div>
  )
}
