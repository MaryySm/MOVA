import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { TopBar } from "../shared/Navigation"
import { useDeviceController } from "../../controllers/useDeviceController"
export function DeviceScreen({ go }: { go: (s: Screen) => void }) {
  const { profiles, setSelectedId, selected, mapSrc } = useDeviceController()

  const t = THEME.device

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
      <div
        style={{
          height: 102,
          background: `linear-gradient(160deg, #AABCFF 0%, ${t.bg} 100%)`,
          flexShrink: 0,
        }}
      >
        <TopBar
          title="GPS en tiempo real"
          onBack={() => go("home")}
          accent={t.accent}
        />
      </div>

      {profiles.length > 1 && (
        <div style={{ padding: "0 16px 10px", flexShrink: 0 }}>
          <label
            style={{
              display: "block",
              color: t.muted,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            Dispositivo visible
          </label>
          <select
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            style={{
              width: "100%",
              border: `1.5px solid ${t.border}`,
              borderRadius: 12,
              padding: "10px 12px",
              background: "#fff",
              color: TEXT,
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
            }}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} · {profile.device.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div
        style={{
          flex: 1,
          position: "relative",
          margin: "0 16px",
          borderRadius: 22,
          overflow: "hidden",
          background: "#EDF2FF",
          border: `1.5px solid ${t.border}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          minHeight: 0,
        }}
      >
        <iframe
          key={selected.id}
          title={`Ubicación de ${selected.name} en Google Maps`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ width: "100%", height: "100%", border: 0 }}
        />

        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            background: "rgba(255,255,255,0.94)",
            borderRadius: 14,
            padding: "9px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#5ECFA8",
                animation: "pulseDot 1.5s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  fontWeight: 800,
                  color: TEXT,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selected.name} · {selected.device.battery}%
              </div>
              <div style={{ fontSize: 9, color: TEXT_MED }}>
                {selected.device.name} · {selected.device.id}
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              color: "#5ECFA8",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            En vivo
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            background: "rgba(255,255,255,0.94)",
            borderRadius: 12,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontSize: 10, color: TEXT_MED }}>
            Google Maps · ubicación actual
          </span>
          <span style={{ fontSize: 10, color: t.accent, fontWeight: 800 }}>
            Actualizado ahora
          </span>
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: "12px 16px 20px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderTop: "3px solid #5ECFA8",
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 19,
              fontWeight: 900,
              color: "#36A77F",
            }}
          >
            {selected.device.battery}%
          </div>
          <div style={{ fontSize: 10, color: TEXT_MED, marginTop: 2 }}>
            Batería de {selected.name}
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderTop: "3px solid #9B72F5",
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 19,
              fontWeight: 900,
              color: "#9B72F5",
            }}
          >
            {selected.device.steps.toLocaleString("es-CL")}
          </div>
          <div style={{ fontSize: 10, color: TEXT_MED, marginTop: 2 }}>
            Pasos sincronizados
          </div>
        </div>
      </div>
    </div>
  )
}
