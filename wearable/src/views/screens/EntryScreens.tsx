import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED, BORDER_GLOBAL } from "../theme"
import {
  useSplashController,
  useLoginController,
  useSignupController,
} from "../../controllers/useEntryControllers"
import type { SignupData } from "../../models/profile"
export function SplashScreen({ go }: { go: (s: Screen) => void }) {
  const { opacity } = useSplashController(go)

  const t = THEME.splash

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at 55% 35%, #D4BFFF 0%, #EDE7FF 55%, #FFF0F9 100%)`,
        transition: "opacity 0.6s",
        opacity,
      }}
    >
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accent}28 0%, transparent 70%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.accent}, #F590B8)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 40px ${t.accent}66`,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M12 36L24 12L36 36"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 28H31"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <h1
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 56,
          fontWeight: 900,
          margin: 0,
          letterSpacing: -2,
          color: TEXT,
        }}
      >
        MOVA
      </h1>
      <p
        style={{
          color: t.muted,
          fontSize: 14,
          marginTop: 8,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Move. Feel. Evolve.
      </p>

      <div
        style={{ position: "absolute", bottom: 60, display: "flex", gap: 6 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === 1 ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === 1 ? t.accent : `${t.accent}30`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function LoginScreen({ go }: { go: (s: Screen) => void }) {
  const { email, setEmail, pass, setPass } = useLoginController()

  const t = THEME.login

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        background: t.bg,
      }}
    >
      <div
        style={{
          height: 260,
          background: `linear-gradient(160deg, #AECBFF 0%, #D0E5FF 50%, ${t.bg} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `${t.accent}22`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -30,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "#F590B822",
          }}
        />
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${t.accent}, #A8D0FF)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
            boxShadow: `0 8px 28px ${t.accent}55`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M12 36L24 12L36 36"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 28H31"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 38,
            fontWeight: 900,
            margin: 0,
            color: TEXT,
          }}
        >
          MOVA
        </h1>
      </div>

      <div style={{ padding: "28px 24px 40px" }}>
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            margin: "0 0 4px",
            color: TEXT,
          }}
        >
          Bienvenido
        </h2>
        <p style={{ color: t.muted, fontSize: 14, margin: "0 0 28px" }}>
          Inicia sesión para continuar
        </p>

        {[
          {
            label: "Correo",
            val: email,
            set: setEmail,
            type: "email",
            ph: "tu@correo.com",
          },
          {
            label: "Contraseña",
            val: pass,
            set: setPass,
            type: "password",
            ph: "••••••••",
          },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 18 }}>
            <label
              style={{
                fontSize: 11,
                color: t.muted,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {f.label}
            </label>
            <input
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
              placeholder={f.ph}
              style={{
                display: "block",
                width: "100%",
                marginTop: 8,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                borderRadius: 14,
                padding: "13px 16px",
                color: TEXT,
                fontSize: 15,
                outline: "none",
                boxShadow: `0 2px 8px ${t.accent}10`,
              }}
            />
          </div>
        ))}

        <div style={{ textAlign: "right", marginBottom: 24 }}>
          <span
            style={{
              color: t.accent,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        <button
          onClick={() => go("profile")}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${t.accent}, #A8CAFF)`,
            border: "none",
            color: "#fff",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: `0 8px 24px ${t.accent}44`,
          }}
        >
          Iniciar Sesión
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "22px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: BORDER_GLOBAL }} />
          <span style={{ color: t.muted, fontSize: 12 }}>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: BORDER_GLOBAL }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {["🌐 Google", "🍎 Apple"].map((p) => (
            <button
              key={p}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 14,
                background: t.card,
                border: `1.5px solid ${t.border}`,
                color: TEXT_MED,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            color: t.muted,
            fontSize: 13,
            marginTop: 28,
          }}
        >
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => go("signup")}
            style={{
              color: t.accent,
              cursor: "pointer",
              fontWeight: 700,
              border: "none",
              background: "none",
              padding: 0,
              fontSize: 13,
            }}
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  )
}

export function SignupScreen({ go }: { go: (s: Screen) => void }) {
  const { form, submitted, isValid, update, submit } = useSignupController(go)

  const t = THEME.signup

  const textFields: {
    key: keyof SignupData
    label: string
    placeholder: string
    optional?: boolean
    type?: string
  }[] = [
    {
      key: "adultName",
      label: "Nombre y apellido del adulto",
      placeholder: "Ej. María González",
    },
    { key: "userName", label: "Nombre del usuario", placeholder: "Ej. Carlos" },
    {
      key: "age",
      label: "Edad del usuario",
      placeholder: "Ej. 10",
      type: "numeric",
    },
    { key: "email", label: "Correo", placeholder: "tu@correo.com" },
    {
      key: "diagnosis",
      label: "Diagnóstico o condición",
      placeholder: "Escribe aquí si deseas agregarlo",
      optional: true,
    },
  ]

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        background: t.bg,
      }}
    >
      <div style={{ padding: "48px 22px 34px" }}>
        <button
          type="button"
          onClick={() => go("login")}
          aria-label="Volver al inicio de sesión"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "none",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke={t.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 15,
              background: `linear-gradient(135deg, ${t.accent}, #F6BE86)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            M
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                color: t.muted,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Crea tu cuenta
            </div>
            <h2
              style={{ fontSize: 25, fontWeight: 900, margin: 0, color: TEXT }}
            >
              Conozcámonos
            </h2>
          </div>
        </div>
        <p
          style={{
            color: t.muted,
            fontSize: 13,
            lineHeight: 1.45,
            margin: "10px 0 18px",
          }}
        >
          Completa los datos para personalizar la experiencia MOVA.
        </p>

        <form onSubmit={submit} noValidate>
          {textFields.slice(0, 3).map((field) => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  color: t.muted,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                {field.label} *
              </label>
              <input
                value={form[field.key]}
                onChange={(event) =>
                  update(
                    field.key,
                    field.type === "numeric"
                      ? event.target.value.replace(/\D/g, "").slice(0, 2)
                      : event.target.value,
                  )
                }
                inputMode={field.type === "numeric" ? "numeric" : undefined}
                placeholder={field.placeholder}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 6,
                  background: "#fff",
                  border: `1.5px solid ${
                    submitted && !form[field.key] ? "#F5795A" : t.border
                  }`,
                  borderRadius: 13,
                  padding: "11px 14px",
                  color: TEXT,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 10,
                color: t.muted,
                letterSpacing: 0.7,
                textTransform: "uppercase",
                fontWeight: 800,
              }}
            >
              Número de teléfono a sincronizar *
            </label>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                background: "#fff",
                border: `1.5px solid ${
                  submitted && form.phone.length !== 8 ? "#F5795A" : t.border
                }`,
                borderRadius: 13,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "11px 10px 11px 14px",
                  background: t.soft,
                  color: t.muted,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                +569
              </span>
              <input
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(/\D/g, "").slice(0, 8),
                  )
                }
                inputMode="numeric"
                placeholder="12345678"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "none",
                  padding: "11px 12px",
                  color: TEXT,
                  fontSize: 14,
                  outline: "none",
                  background: "#fff",
                }}
              />
            </div>
          </div>

          {textFields.slice(3).map((field) => (
            <div key={field.key} style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 10,
                  color: t.muted,
                  letterSpacing: 0.7,
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                {field.label}
                {field.optional ? " · Opcional" : " *"}
              </label>
              <input
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                placeholder={field.placeholder}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 6,
                  background: "#fff",
                  border: `1.5px solid ${
                    submitted && !field.optional && !form[field.key]
                      ? "#F5795A"
                      : t.border
                  }`,
                  borderRadius: 13,
                  padding: "11px 14px",
                  color: TEXT,
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>
          ))}

          {submitted && !isValid && (
            <p style={{ color: "#D95648", fontSize: 11, margin: "0 0 11px" }}>
              Completa todos los campos obligatorios. El teléfono debe tener 8
              dígitos.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 15,
              border: "none",
              background: `linear-gradient(135deg, ${t.accent}, #F6BE86)`,
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 8px 22px ${t.accent}44`,
            }}
          >
            Crear cuenta y continuar
          </button>
        </form>
      </div>
    </div>
  )
}
