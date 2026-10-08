// Aquí dibujo la configuración de perfil, dispositivo y notificaciones.
import { cssVar, cssVars } from "../styleVars";
import "./SettingsScreen.styles.css";
import { useRef } from "react"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useSettingsController } from "../../controllers/useSettingsController"
import type { NotificationSettings } from "../../models/profile"
export const SETTINGS_GROUPS = [
  {
    group: "Cuenta",
    color: "#9B72F5",
    items: [
      { icon: "👤", label: "Perfil de usuario", sub: "Carlos Rodríguez" },
      { icon: "🔔", label: "Notificaciones", sub: "Activadas" },
      { icon: "🔒", label: "Privacidad y seguridad", sub: "" },
    ],
  },
  {
    group: "Aplicación",
    color: "#F590B8",
    items: [{ icon: "🌍", label: "Idioma", sub: "Español" }],
  },
  {
    group: "Conexiones",
    color: "#5BB8F5",
    items: [
      { icon: "⌚", label: "Dispositivo MOVA", sub: "MOVA Band Pro" },
      { icon: "🤝", label: "Redes sociales", sub: "Instagram conectado" },
    ],
  },
  {
    group: "Soporte",
    color: "#5ECFA8",
    items: [
      { icon: "💬", label: "Centro de ayuda", sub: "" },
      { icon: "⭐", label: "Valorar MOVA", sub: "" },
      { icon: "📋", label: "Términos y privacidad", sub: "" },
    ],
  },
]
export function SettingsScreen() {
  const {
    profiles,
    profile,
    draft,
    setDraft,
    editing,
    setEditing,
    saved,
    notificationsOpen,
    setNotificationsOpen,
    deviceOpen,
    setDeviceOpen,
    chooseProfile,
    openEditor,
    selectPhoto,
    saveProfile,
    addProfile,
    updateNotifications,
  } = useSettingsController()

  const t = THEME.settings

  const galleryRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  return (
    <div
      data-mova-style="settings-screen-s0" style={cssVars({ "--mova-settings-screen-s0-background": cssVar((t.bg), true) })}
    >
      <div data-mova-style="settings-screen-s1">
        <div
          data-mova-style="settings-screen-s2"
        >
          <h2
            data-mova-style="settings-screen-s3" style={cssVars({ "--mova-settings-screen-s3-color": cssVar((TEXT), true) })}
          >
            Configuración
          </h2>
          <button
            type="button"
            onClick={addProfile}
            data-mova-style="settings-screen-s4" style={cssVars({ "--mova-settings-screen-s4-background": cssVar((t.accent), true) })}
          >
            + Perfil
          </button>
        </div>

        <div
          data-mova-style="settings-screen-s5"
        >
          {profiles.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseProfile(item.id)}
              data-mova-style="settings-screen-s6" style={cssVars({ "--mova-settings-screen-s6-border": cssVar((`1.5px solid ${
                  item.id === profile.id ? t.accent : t.border
                }`), true), "--mova-settings-screen-s6-background": cssVar((item.id === profile.id ? t.soft : "#fff"), true), "--mova-settings-screen-s6-color": cssVar((item.id === profile.id ? t.accent : TEXT_MED), true) })}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* User card */}
        <button
          type="button"
          onClick={openEditor}
          data-mova-style="settings-screen-s7" style={cssVars({ "--mova-settings-screen-s7-margin-bottom": cssVar((editing ? 10 : 22), true), "--mova-settings-screen-s7-border-left": cssVar((`4px solid ${t.accent}`), true) })}
        >
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`Foto de ${profile.name}`}
              data-mova-style="settings-screen-s8"
            />
          ) : (
            <div
              data-mova-style="settings-screen-s9" style={cssVars({ "--mova-settings-screen-s9-background": cssVar((`linear-gradient(135deg, ${t.accent}, #F590B8)`), true) })}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div data-mova-style="settings-screen-s10">
            <div
              data-mova-style="settings-screen-s11" style={cssVars({ "--mova-settings-screen-s11-color": cssVar((TEXT), true) })}
            >
              {profile.name}
            </div>
            <div data-mova-style="settings-screen-s12" style={cssVars({ "--mova-settings-screen-s12-color": cssVar((TEXT_MED), true) })}>
              {profile.age} años · {profile.email}
            </div>
            {profile.adultName && (
              <div data-mova-style="settings-screen-s13" style={cssVars({ "--mova-settings-screen-s13-color": cssVar((t.muted), true) })}>
                Adulto responsable: {profile.adultName}
              </div>
            )}
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.5 6.5L17.5 10.5M4 20L8.5 19L18.5 9C19.33 8.17 19.33 6.83 18.5 6L18 5.5C17.17 4.67 15.83 4.67 15 5.5L5 15.5L4 20Z"
              stroke={t.accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {editing && (
          <div
            data-mova-style="settings-screen-s14" style={cssVars({ "--mova-settings-screen-s14-border": cssVar((`1.5px solid ${t.border}`), true) })}
          >
            <div
              data-mova-style="settings-screen-s15"
            >
              {draft.photo ? (
                <img
                  src={draft.photo}
                  alt="Vista previa"
                  data-mova-style="settings-screen-s16"
                />
              ) : (
                <div
                  data-mova-style="settings-screen-s17" style={cssVars({ "--mova-settings-screen-s17-background": cssVar((t.soft), true), "--mova-settings-screen-s17-color": cssVar((t.accent), true) })}
                >
                  {draft.name.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div data-mova-style="settings-screen-s18">
                <div
                  data-mova-style="settings-screen-s19" style={cssVars({ "--mova-settings-screen-s19-color": cssVar((TEXT), true) })}
                >
                  Fotografía de perfil
                </div>
                <div data-mova-style="settings-screen-s20">
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    data-mova-style="settings-screen-s21" style={cssVars({ "--mova-settings-screen-s21-background": cssVar((t.soft), true), "--mova-settings-screen-s21-color": cssVar((t.accent), true) })}
                  >
                    Galería
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    data-mova-style="settings-screen-s22" style={cssVars({ "--mova-settings-screen-s22-background": cssVar((t.soft), true), "--mova-settings-screen-s22-color": cssVar((t.accent), true) })}
                  >
                    Cámara
                  </button>
                </div>
              </div>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                onChange={selectPhoto}
                data-mova-style="settings-screen-s23"
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={selectPhoto}
                data-mova-style="settings-screen-s24"
              />
            </div>

            {[
              {
                key: "adultName",
                label: "Nombre del adulto",
                value: draft.adultName ?? "",
                inputMode: undefined,
              },
              {
                key: "name",
                label: "Nombre de usuario",
                value: draft.name,
                inputMode: undefined,
              },
              {
                key: "age",
                label: "Edad",
                value: draft.age,
                inputMode: "numeric" as const,
              },
              {
                key: "email",
                label: "Correo",
                value: draft.email,
                inputMode: "email" as const,
              },
            ].map((field) => (
              <label
                key={field.key}
                data-mova-style="settings-screen-s25" style={cssVars({ "--mova-settings-screen-s25-color": cssVar((t.muted), true) })}
              >
                {field.label}
                <input
                  value={field.value}
                  inputMode={field.inputMode}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [field.key]:
                        field.key === "age"
                          ? event.target.value.replace(/\D/g, "").slice(0, 2)
                          : event.target.value,
                    }))
                  }
                  data-mova-style="settings-screen-s26" style={cssVars({ "--mova-settings-screen-s26-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-settings-screen-s26-color": cssVar((TEXT), true), "--mova-settings-screen-s26-background": cssVar((t.card), true) })}
                />
              </label>
            ))}

            <label
              data-mova-style="settings-screen-s27" style={cssVars({ "--mova-settings-screen-s27-color": cssVar((t.muted), true) })}
            >
              Número de teléfono
              <div
                data-mova-style="settings-screen-s28" style={cssVars({ "--mova-settings-screen-s28-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-settings-screen-s28-background": cssVar((t.card), true) })}
              >
                <span
                  data-mova-style="settings-screen-s29" style={cssVars({ "--mova-settings-screen-s29-background": cssVar((t.soft), true), "--mova-settings-screen-s29-color": cssVar((t.muted), true) })}
                >
                  +569
                </span>
                <input
                  value={draft.phone}
                  inputMode="numeric"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      phone: event.target.value.replace(/\D/g, "").slice(0, 8),
                    }))
                  }
                  placeholder="12345678"
                  data-mova-style="settings-screen-s30" style={cssVars({ "--mova-settings-screen-s30-color": cssVar((TEXT), true) })}
                />
              </div>
            </label>

            <div data-mova-style="settings-screen-s31">
              <button
                type="button"
                onClick={() => setEditing(false)}
                data-mova-style="settings-screen-s32" style={cssVars({ "--mova-settings-screen-s32-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-settings-screen-s32-color": cssVar((TEXT_MED), true) })}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={
                  !draft.name.trim() ||
                  !draft.age.trim() ||
                  !draft.email.trim() ||
                  draft.phone.length !== 8
                }
                data-mova-style="settings-screen-s33" style={cssVars({ "--mova-settings-screen-s33-background": cssVar((t.accent), true), "--mova-settings-screen-s33-opacity": cssVar(!draft.name.trim() ||
                    !draft.age.trim() ||
                    !draft.email.trim() ||
                    draft.phone.length !== 8
                      ? 0.5
                      : 1, false) })}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div
            data-mova-style="settings-screen-s34"
          >
            Datos guardados correctamente.
          </div>
        )}

        {SETTINGS_GROUPS.map((group) => (
          <div key={group.group} data-mova-style="settings-screen-s35">
            <div
              data-mova-style="settings-screen-s36"
            >
              <div
                data-mova-style="settings-screen-s37" style={cssVars({ "--mova-settings-screen-s37-background": cssVar((group.color), true) })}
              />
              <p
                data-mova-style="settings-screen-s38" style={cssVars({ "--mova-settings-screen-s38-color": cssVar((TEXT_MED), true) })}
              >
                {group.group}
              </p>
            </div>
            <div
              data-mova-style="settings-screen-s39"
            >
              {group.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Perfil de usuario") openEditor()
                    if (item.label === "Notificaciones")
                      setNotificationsOpen((current) => !current)
                    if (item.label === "Dispositivo MOVA")
                      setDeviceOpen((current) => !current)
                  }}
                  data-mova-style="settings-screen-s40" style={cssVars({ "--mova-settings-screen-s40-border-bottom": cssVar((idx < group.items.length - 1
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none"), true) })}
                >
                  <div
                    data-mova-style="settings-screen-s41" style={cssVars({ "--mova-settings-screen-s41-background": cssVar((`${group.color}18`), true) })}
                  >
                    {item.icon}
                  </div>
                  <div data-mova-style="settings-screen-s42">
                    <div data-mova-style="settings-screen-s43" style={cssVars({ "--mova-settings-screen-s43-color": cssVar((TEXT), true) })}>
                      {item.label}
                    </div>
                    {item.sub && (
                      <div
                        data-mova-style="settings-screen-s44" style={cssVars({ "--mova-settings-screen-s44-color": cssVar((TEXT_MED), true) })}
                      >
                        {item.label === "Perfil de usuario"
                          ? profile.name
                          : item.label === "Notificaciones"
                            ? `Para ${profile.name}`
                            : item.label === "Dispositivo MOVA"
                              ? `${profile.name} · ${profile.device.battery}%`
                              : item.sub}
                      </div>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#BDB8D4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>

            {group.group === "Cuenta" && notificationsOpen && (
              <div
                data-mova-style="settings-screen-s45" style={cssVars({ "--mova-settings-screen-s45-border": cssVar((`1.5px solid ${group.color}25`), true) })}
              >
                <div
                  data-mova-style="settings-screen-s46" style={cssVars({ "--mova-settings-screen-s46-color": cssVar((TEXT), true) })}
                >
                  Alertas en MOVA Kids
                </div>
                <div
                  data-mova-style="settings-screen-s47" style={cssVars({ "--mova-settings-screen-s47-color": cssVar((TEXT_MED), true) })}
                >
                  Configuración para {profile.name}
                </div>
                {([
                  ["vibration", "Vibración"],
                  ["sound", "Sonido"],
                  ["lights", "Luces"],
                ] as [keyof Pick<NotificationSettings, "vibration" | "sound" | "lights">, string][]).map(
                  ([key, label]) => {
                    const enabled = profile.notifications[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateNotifications({ [key]: !enabled })}
                        data-mova-style="settings-screen-s48"
                      >
                        <span
                          data-mova-style="settings-screen-s49" style={cssVars({ "--mova-settings-screen-s49-color": cssVar((TEXT), true) })}
                        >
                          {label}
                        </span>
                        <div
                          data-mova-style="settings-screen-s50" style={cssVars({ "--mova-settings-screen-s50-background": cssVar((enabled ? "#5ECFA8" : "#DAD7E2"), true) })}
                        >
                          <div
                            data-mova-style="settings-screen-s51" style={cssVars({ "--mova-settings-screen-s51-transform": cssVar((enabled
                                ? "translateX(17px)"
                                : "translateX(0)"), true) })}
                          />
                        </div>
                      </button>
                    )
                  },
                )}
                <div
                  data-mova-style="settings-screen-s52" style={cssVars({ "--mova-settings-screen-s52-opacity": cssVar(profile.notifications.vibration ? 1 : 0.45, false) })}
                >
                  <div
                    data-mova-style="settings-screen-s53"
                  >
                    <label
                      htmlFor="vibration-intensity"
                      data-mova-style="settings-screen-s54" style={cssVars({ "--mova-settings-screen-s54-color": cssVar((TEXT), true) })}
                    >
                      Intensidad de vibración
                    </label>
                    <span
                      data-mova-style="settings-screen-s55" style={cssVars({ "--mova-settings-screen-s55-color": cssVar((group.color), true) })}
                    >
                      {profile.notifications.intensity}/10
                    </span>
                  </div>
                  <input
                    id="vibration-intensity"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    disabled={!profile.notifications.vibration}
                    value={profile.notifications.intensity}
                    onChange={(event) =>
                      updateNotifications({
                        intensity: Number(event.target.value),
                      })
                    }
                    data-mova-style="settings-screen-s56" style={cssVars({ "--mova-settings-screen-s56-accent-color": cssVar((group.color), true), "--mova-settings-screen-s56-cursor": cssVar((profile.notifications.vibration
                        ? "pointer"
                        : "not-allowed"), true) })}
                  />
                  <div
                    data-mova-style="settings-screen-s57" style={cssVars({ "--mova-settings-screen-s57-color": cssVar((TEXT_MED), true) })}
                  >
                    <span>Suave</span>
                    <span>Intensa</span>
                  </div>
                </div>
              </div>
            )}

            {group.group === "Conexiones" && deviceOpen && (
              <div
                data-mova-style="settings-screen-s58" style={cssVars({ "--mova-settings-screen-s58-border": cssVar((`1.5px solid ${group.color}25`), true) })}
              >
                <div
                  data-mova-style="settings-screen-s59"
                >
                  <div
                    data-mova-style="settings-screen-s60" style={cssVars({ "--mova-settings-screen-s60-background": cssVar((`${group.color}20`), true) })}
                  >
                    ⌚
                  </div>
                  <div>
                    <div data-mova-style="settings-screen-s61" style={cssVars({ "--mova-settings-screen-s61-color": cssVar((TEXT), true) })}>
                      {profile.device.name}
                    </div>
                    <div
                      data-mova-style="settings-screen-s62"
                    >
                      Conectado · Batería {profile.device.battery}%
                    </div>
                  </div>
                </div>
                {[
                  ["Usuario sincronizado", profile.name],
                  ["Teléfono", `+569 ${profile.phone}`],
                  ["Número de dispositivo", profile.device.id],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    data-mova-style="settings-screen-s63"
                  >
                    <span data-mova-style="settings-screen-s64" style={cssVars({ "--mova-settings-screen-s64-color": cssVar((TEXT_MED), true) })}>
                      {label}
                    </span>
                    <span
                      data-mova-style="settings-screen-s65" style={cssVars({ "--mova-settings-screen-s65-color": cssVar((TEXT), true) })}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          data-mova-style="settings-screen-s66"
        >
          Cerrar sesión
        </button>

        <p
          data-mova-style="settings-screen-s67"
        >
          MOVA v2.4.1 · Build 2026.08
        </p>
      </div>
    </div>
  )
}
