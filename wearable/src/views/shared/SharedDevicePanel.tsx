import { useSharedDevice } from "../../controllers/useSharedDevice"
import { KIDS_ACTIVITIES, KIDS_MOODS } from "../../models/wearable"
import { SHARED_DEVICE_ID } from "../../models/sharedDevice"

export default function SharedDevicePanel() {
  const { state, status, busy, update } = useSharedDevice()
  return (
    <section style={{ margin: "16px 20px", padding: 16, background: "#fff", borderRadius: 20, color: "#1A1A2E" }}>
      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Reloj enlazado · {SHARED_DEVICE_ID}</h3>
      <p role="status" style={{ fontSize: 12 }}>{status}{state?.updatedAt ? ` · ${new Date(state.updatedAt).toLocaleTimeString("es")}` : ""}</p>
      {state && <>
        <p>Estado: <strong>{state.payload.mood ?? "Sin registro"}</strong></p>
        {state.payload.heartRate !== undefined && <p>Pulso: {state.payload.heartRate} bpm</p>}
        {state.payload.sos && <div role="alert" style={{ background: "#FFE4E6", padding: 12, borderRadius: 12 }}>
          <strong>🆘 El reloj solicita ayuda</strong>
          <button disabled={busy} onClick={() => void update({ sos: false })} style={{ display: "block", marginTop: 8 }}>Confirmar recepción</button>
        </div>}
        <label style={{ display: "block", margin: "12px 0" }}>Compartir emoción: <select
          disabled={busy} value={state.payload.mood ?? ""} onChange={e => void update({ mood: e.target.value || null })}>
          <option value="">Sin registro</option>
          {state.payload.mood && !KIDS_MOODS.some(m => m.label === state.payload.mood) && <option>{state.payload.mood}</option>}
          {KIDS_MOODS.map(m => <option key={m.label} value={m.label}>{m.emoji} {m.label}</option>)}
        </select></label>
        {KIDS_ACTIVITIES.map(activity => <label key={activity.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0" }}>
          <input type="checkbox" disabled={busy} checked={state.payload.activities[activity.id] ?? false}
            onChange={e => void update({ activities: { [activity.id]: e.target.checked } })} />
          <span>{activity.icon} {activity.label} · {activity.time}</span>
        </label>)}
      </>}
    </section>
  )
}
