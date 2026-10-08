// Aquí presento los datos y la ubicación simulada del dispositivo asociado.
import { cssVar, cssVars } from "../styleVars";
import "./DeviceScreen.styles.css";
import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { TopBar } from "../shared/Navigation"
import { useDeviceController } from "../../controllers/useDeviceController"
export function DeviceScreen({ go }: { go: (s: Screen) => void }) {
  const { profiles, setSelectedId, selected, mapSrc } = useDeviceController()

  const t = THEME.device

  return (
    <div
      data-mova-style="device-screen-s0" style={cssVars({ "--mova-device-screen-s0-background": cssVar((t.bg), true) })}
    >
      <div
        data-mova-style="device-screen-s1" style={cssVars({ "--mova-device-screen-s1-background": cssVar((`linear-gradient(160deg, #AABCFF 0%, ${t.bg} 100%)`), true) })}
      >
        <TopBar
          title="GPS en tiempo real"
          onBack={() => go("home")}
          accent={t.accent}
        />
      </div>

      {profiles.length > 1 && (
        <div data-mova-style="device-screen-s2">
          <label
            data-mova-style="device-screen-s3" style={cssVars({ "--mova-device-screen-s3-color": cssVar((t.muted), true) })}
          >
            Dispositivo visible
          </label>
          <select
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            data-mova-style="device-screen-s4" style={cssVars({ "--mova-device-screen-s4-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-device-screen-s4-color": cssVar((TEXT), true) })}
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
        data-mova-style="device-screen-s5" style={cssVars({ "--mova-device-screen-s5-border": cssVar((`1.5px solid ${t.border}`), true) })}
      >
        <iframe
          key={selected.id}
          title={`Ubicación de ${selected.name} en Google Maps`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          data-mova-style="device-screen-s6"
        />

        <div
          data-mova-style="device-screen-s7"
        >
          <div
            data-mova-style="device-screen-s8"
          >
            <div
              data-mova-style="device-screen-s9"
            />
            <div data-mova-style="device-screen-s10">
              <div
                data-mova-style="device-screen-s11" style={cssVars({ "--mova-device-screen-s11-color": cssVar((TEXT), true) })}
              >
                {selected.name} · {selected.device.battery}%
              </div>
              <div data-mova-style="device-screen-s12" style={cssVars({ "--mova-device-screen-s12-color": cssVar((TEXT_MED), true) })}>
                {selected.device.name} · {selected.device.id}
              </div>
            </div>
          </div>
          <span
            data-mova-style="device-screen-s13"
          >
            En vivo
          </span>
        </div>

        <div
          data-mova-style="device-screen-s14"
        >
          <span data-mova-style="device-screen-s15" style={cssVars({ "--mova-device-screen-s15-color": cssVar((TEXT_MED), true) })}>
            Google Maps · ubicación actual
          </span>
          <span data-mova-style="device-screen-s16" style={cssVars({ "--mova-device-screen-s16-color": cssVar((t.accent), true) })}>
            Actualizado ahora
          </span>
        </div>
      </div>

      <div
        data-mova-style="device-screen-s17"
      >
        <div
          data-mova-style="device-screen-s18"
        >
          <div
            data-mova-style="device-screen-s19"
          >
            {selected.device.battery}%
          </div>
          <div data-mova-style="device-screen-s20" style={cssVars({ "--mova-device-screen-s20-color": cssVar((TEXT_MED), true) })}>
            Batería de {selected.name}
          </div>
        </div>
        <div
          data-mova-style="device-screen-s21"
        >
          <div
            data-mova-style="device-screen-s22"
          >
            {selected.device.steps.toLocaleString("es-CL")}
          </div>
          <div data-mova-style="device-screen-s23" style={cssVars({ "--mova-device-screen-s23-color": cssVar((TEXT_MED), true) })}>
            Pasos sincronizados
          </div>
        </div>
      </div>
    </div>
  )
}
