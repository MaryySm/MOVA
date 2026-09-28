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
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        paddingBottom: 80,
        background: t.bg,
      }}
    >
      <div style={{ padding: "52px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 24,
              fontWeight: 900,
              margin: 0,
              color: TEXT,
            }}
          >
            Configuración
          </h2>
          <button
            type="button"
            onClick={addProfile}
            style={{
              border: "none",
              borderRadius: 11,
              padding: "8px 11px",
              background: t.accent,
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            + Perfil
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 7,
            overflowX: "auto",
            paddingBottom: 10,
            marginBottom: 8,
          }}
        >
          {profiles.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseProfile(item.id)}
              style={{
                flexShrink: 0,
                borderRadius: 20,
                padding: "7px 11px",
                cursor: "pointer",
                border: `1.5px solid ${
                  item.id === profile.id ? t.accent : t.border
                }`,
                background: item.id === profile.id ? t.soft : "#fff",
                color: item.id === profile.id ? t.accent : TEXT_MED,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* User card */}
        <button
          type="button"
          onClick={openEditor}
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 22,
            padding: "18px",
            marginBottom: editing ? 10 : 22,
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            border: "none",
            borderLeft: `4px solid ${t.accent}`,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`Foto de ${profile.name}`}
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                flexShrink: 0,
                background: `linear-gradient(135deg, ${t.accent}, #F590B8)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: 20,
              }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: TEXT,
              }}
            >
              {profile.name}
            </div>
            <div style={{ fontSize: 12, color: TEXT_MED, marginTop: 2 }}>
              {profile.age} años · {profile.email}
            </div>
            {profile.adultName && (
              <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>
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
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 16,
              marginBottom: 22,
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: `1.5px solid ${t.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {draft.photo ? (
                <img
                  src={draft.photo}
                  alt="Vista previa"
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    background: t.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: t.accent,
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  {draft.name.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: TEXT,
                    marginBottom: 7,
                  }}
                >
                  Fotografía de perfil
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => galleryRef.current?.click()}
                    style={{
                      border: "none",
                      borderRadius: 9,
                      padding: "7px 9px",
                      background: t.soft,
                      color: t.accent,
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Galería
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    style={{
                      border: "none",
                      borderRadius: 9,
                      padding: "7px 9px",
                      background: t.soft,
                      color: t.accent,
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
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
                style={{ display: "none" }}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={selectPhoto}
                style={{ display: "none" }}
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
                style={{
                  display: "block",
                  fontSize: 10,
                  color: t.muted,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
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
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: 5,
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 11,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: TEXT,
                    outline: "none",
                    background: t.card,
                  }}
                />
              </label>
            ))}

            <label
              style={{
                display: "block",
                fontSize: 10,
                color: t.muted,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Número de teléfono
              <div
                style={{
                  display: "flex",
                  marginTop: 5,
                  border: `1.5px solid ${t.border}`,
                  borderRadius: 11,
                  overflow: "hidden",
                  background: t.card,
                }}
              >
                <span
                  style={{
                    padding: "10px",
                    background: t.soft,
                    color: t.muted,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
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
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: "none",
                    padding: "10px 12px",
                    fontSize: 13,
                    color: TEXT,
                    outline: "none",
                    background: "transparent",
                  }}
                />
              </div>
            </label>

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  flex: 1,
                  border: `1.5px solid ${t.border}`,
                  borderRadius: 11,
                  padding: 10,
                  background: "#fff",
                  color: TEXT_MED,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
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
                style={{
                  flex: 1.4,
                  border: "none",
                  borderRadius: 11,
                  padding: 10,
                  background: t.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                  opacity:
                    !draft.name.trim() ||
                    !draft.age.trim() ||
                    !draft.email.trim() ||
                    draft.phone.length !== 8
                      ? 0.5
                      : 1,
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        )}

        {saved && (
          <div
            style={{
              margin: "-12px 0 18px",
              padding: "9px 12px",
              borderRadius: 11,
              background: "#DDF8EC",
              color: "#278264",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Datos guardados correctamente.
          </div>
        )}

        {SETTINGS_GROUPS.map((group) => (
          <div key={group.group} style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 16,
                  borderRadius: 2,
                  background: group.color,
                }}
              />
              <p
                style={{
                  fontSize: 11,
                  color: TEXT_MED,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {group.group}
              </p>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
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
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 16px",
                    gap: 14,
                    cursor: "pointer",
                    borderBottom:
                      idx < group.items.length - 1
                        ? "1px solid rgba(0,0,0,0.05)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${group.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: TEXT, fontWeight: 600 }}>
                      {item.label}
                    </div>
                    {item.sub && (
                      <div
                        style={{ fontSize: 12, color: TEXT_MED, marginTop: 1 }}
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
                style={{
                  marginTop: 9,
                  background: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
                  border: `1.5px solid ${group.color}25`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: TEXT,
                    marginBottom: 3,
                  }}
                >
                  Alertas en MOVA Kids
                </div>
                <div
                  style={{ fontSize: 10, color: TEXT_MED, marginBottom: 12 }}
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
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "none",
                          borderBottom: "1px solid rgba(0,0,0,0.05)",
                          background: "transparent",
                          padding: "9px 0",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{ color: TEXT, fontSize: 13, fontWeight: 700 }}
                        >
                          {label}
                        </span>
                        <div
                          style={{
                            width: 40,
                            height: 23,
                            padding: 3,
                            borderRadius: 12,
                            background: enabled ? "#5ECFA8" : "#DAD7E2",
                            transition: "background 0.2s",
                          }}
                        >
                          <div
                            style={{
                              width: 17,
                              height: 17,
                              borderRadius: "50%",
                              background: "#fff",
                              transform: enabled
                                ? "translateX(17px)"
                                : "translateX(0)",
                              transition: "transform 0.2s",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                            }}
                          />
                        </div>
                      </button>
                    )
                  },
                )}
                <div
                  style={{
                    paddingTop: 12,
                    opacity: profile.notifications.vibration ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 7,
                    }}
                  >
                    <label
                      htmlFor="vibration-intensity"
                      style={{ fontSize: 12, color: TEXT, fontWeight: 700 }}
                    >
                      Intensidad de vibración
                    </label>
                    <span
                      style={{
                        fontSize: 12,
                        color: group.color,
                        fontWeight: 900,
                      }}
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
                    style={{
                      width: "100%",
                      accentColor: group.color,
                      cursor: profile.notifications.vibration
                        ? "pointer"
                        : "not-allowed",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 9,
                      color: TEXT_MED,
                    }}
                  >
                    <span>Suave</span>
                    <span>Intensa</span>
                  </div>
                </div>
              </div>
            )}

            {group.group === "Conexiones" && deviceOpen && (
              <div
                style={{
                  marginTop: 9,
                  background: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
                  border: `1.5px solid ${group.color}25`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: `${group.color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 19,
                    }}
                  >
                    ⌚
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: TEXT, fontWeight: 800 }}>
                      {profile.device.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#36A77F",
                        fontWeight: 700,
                      }}
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
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "7px 0",
                      borderTop: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <span style={{ fontSize: 10, color: TEXT_MED }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: TEXT,
                        fontWeight: 700,
                        textAlign: "right",
                      }}
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
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            marginTop: 4,
            background: "rgba(245,121,90,0.1)",
            border: "1.5px solid rgba(245,121,90,0.3)",
            color: "#F5795A",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#BDB8D4",
            marginTop: 20,
          }}
        >
          MOVA v2.4.1 · Build 2026.08
        </p>
      </div>
    </div>
  )
}
