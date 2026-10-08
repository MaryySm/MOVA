// Aquí dibujo presentación, acceso y registro, usando sus controladores.
import { cssVar, cssVars } from "../styleVars";
import "./EntryScreens.styles.css";
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
      data-mova-style="entry-screens-s0" style={cssVars({ "--mova-entry-screens-s0-opacity": cssVar(opacity, false) })}
    >
      <div
        data-mova-style="entry-screens-s1" style={cssVars({ "--mova-entry-screens-s1-background": cssVar((`radial-gradient(circle, ${t.accent}28 0%, transparent 70%)`), true) })}
      >
        <div
          data-mova-style="entry-screens-s2" style={cssVars({ "--mova-entry-screens-s2-background": cssVar((`linear-gradient(135deg, ${t.accent}, #F590B8)`), true), "--mova-entry-screens-s2-box-shadow": cssVar((`0 12px 40px ${t.accent}66`), true) })}
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
        data-mova-style="entry-screens-s3" style={cssVars({ "--mova-entry-screens-s3-letter-spacing": cssVar((-2), true), "--mova-entry-screens-s3-color": cssVar((TEXT), true) })}
      >
        MOVA
      </h1>
      <p
        data-mova-style="entry-screens-s4" style={cssVars({ "--mova-entry-screens-s4-color": cssVar((t.muted), true) })}
      >
        Move. Feel. Evolve.
      </p>

      <div
        data-mova-style="entry-screens-s5"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            data-mova-style="entry-screens-s6" style={cssVars({ "--mova-entry-screens-s6-width": cssVar((i === 1 ? 22 : 6), true), "--mova-entry-screens-s6-background": cssVar((i === 1 ? t.accent : `${t.accent}30`), true) })}
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
      data-mova-style="entry-screens-s7" style={cssVars({ "--mova-entry-screens-s7-background": cssVar((t.bg), true) })}
    >
      <div
        data-mova-style="entry-screens-s8" style={cssVars({ "--mova-entry-screens-s8-background": cssVar((`linear-gradient(160deg, #AECBFF 0%, #D0E5FF 50%, ${t.bg} 100%)`), true) })}
      >
        {/* Decorative blobs */}
        <div
          data-mova-style="entry-screens-s9" style={cssVars({ "--mova-entry-screens-s9-top": cssVar((-50), true), "--mova-entry-screens-s9-right": cssVar((-30), true), "--mova-entry-screens-s9-background": cssVar((`${t.accent}22`), true) })}
        />
        <div
          data-mova-style="entry-screens-s10" style={cssVars({ "--mova-entry-screens-s10-bottom": cssVar((-40), true), "--mova-entry-screens-s10-left": cssVar((-30), true) })}
        />
        <div
          data-mova-style="entry-screens-s11" style={cssVars({ "--mova-entry-screens-s11-background": cssVar((`linear-gradient(135deg, ${t.accent}, #A8D0FF)`), true), "--mova-entry-screens-s11-box-shadow": cssVar((`0 8px 28px ${t.accent}55`), true) })}
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
          data-mova-style="entry-screens-s12" style={cssVars({ "--mova-entry-screens-s12-color": cssVar((TEXT), true) })}
        >
          MOVA
        </h1>
      </div>

      <div data-mova-style="entry-screens-s13">
        <h2
          data-mova-style="entry-screens-s14" style={cssVars({ "--mova-entry-screens-s14-color": cssVar((TEXT), true) })}
        >
          Bienvenido
        </h2>
        <p data-mova-style="entry-screens-s15" style={cssVars({ "--mova-entry-screens-s15-color": cssVar((t.muted), true) })}>
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
          <div key={f.label} data-mova-style="entry-screens-s16">
            <label
              data-mova-style="entry-screens-s17" style={cssVars({ "--mova-entry-screens-s17-color": cssVar((t.muted), true) })}
            >
              {f.label}
            </label>
            <input
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              type={f.type}
              placeholder={f.ph}
              data-mova-style="entry-screens-s18" style={cssVars({ "--mova-entry-screens-s18-background": cssVar((t.card), true), "--mova-entry-screens-s18-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-entry-screens-s18-color": cssVar((TEXT), true), "--mova-entry-screens-s18-box-shadow": cssVar((`0 2px 8px ${t.accent}10`), true) })}
            />
          </div>
        ))}

        <div data-mova-style="entry-screens-s19">
          <span
            data-mova-style="entry-screens-s20" style={cssVars({ "--mova-entry-screens-s20-color": cssVar((t.accent), true) })}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        <button
          onClick={() => go("profile")}
          data-mova-style="entry-screens-s21" style={cssVars({ "--mova-entry-screens-s21-background": cssVar((`linear-gradient(135deg, ${t.accent}, #A8CAFF)`), true), "--mova-entry-screens-s21-box-shadow": cssVar((`0 8px 24px ${t.accent}44`), true) })}
        >
          Iniciar Sesión
        </button>

        <div
          data-mova-style="entry-screens-s22"
        >
          <div data-mova-style="entry-screens-s23" style={cssVars({ "--mova-entry-screens-s23-background": cssVar((BORDER_GLOBAL), true) })} />
          <span data-mova-style="entry-screens-s24" style={cssVars({ "--mova-entry-screens-s24-color": cssVar((t.muted), true) })}>o continúa con</span>
          <div data-mova-style="entry-screens-s25" style={cssVars({ "--mova-entry-screens-s25-background": cssVar((BORDER_GLOBAL), true) })} />
        </div>

        <div data-mova-style="entry-screens-s26">
          {["🌐 Google", "🍎 Apple"].map((p) => (
            <button
              key={p}
              data-mova-style="entry-screens-s27" style={cssVars({ "--mova-entry-screens-s27-background": cssVar((t.card), true), "--mova-entry-screens-s27-border": cssVar((`1.5px solid ${t.border}`), true), "--mova-entry-screens-s27-color": cssVar((TEXT_MED), true) })}
            >
              {p}
            </button>
          ))}
        </div>

        <p
          data-mova-style="entry-screens-s28" style={cssVars({ "--mova-entry-screens-s28-color": cssVar((t.muted), true) })}
        >
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => go("signup")}
            data-mova-style="entry-screens-s29" style={cssVars({ "--mova-entry-screens-s29-color": cssVar((t.accent), true) })}
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
      data-mova-style="entry-screens-s30" style={cssVars({ "--mova-entry-screens-s30-background": cssVar((t.bg), true) })}
    >
      <div data-mova-style="entry-screens-s31">
        <button
          type="button"
          onClick={() => go("login")}
          aria-label="Volver al inicio de sesión"
          data-mova-style="entry-screens-s32"
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

        <div data-mova-style="entry-screens-s33">
          <div
            data-mova-style="entry-screens-s34" style={cssVars({ "--mova-entry-screens-s34-background": cssVar((`linear-gradient(135deg, ${t.accent}, #F6BE86)`), true) })}
          >
            M
          </div>
          <div>
            <div
              data-mova-style="entry-screens-s35" style={cssVars({ "--mova-entry-screens-s35-color": cssVar((t.muted), true) })}
            >
              Crea tu cuenta
            </div>
            <h2
              data-mova-style="entry-screens-s36" style={cssVars({ "--mova-entry-screens-s36-color": cssVar((TEXT), true) })}
            >
              Conozcámonos
            </h2>
          </div>
        </div>
        <p
          data-mova-style="entry-screens-s37" style={cssVars({ "--mova-entry-screens-s37-color": cssVar((t.muted), true) })}
        >
          Completa los datos para personalizar la experiencia MOVA.
        </p>

        <form onSubmit={submit} noValidate>
          {textFields.slice(0, 3).map((field) => (
            <div key={field.key} data-mova-style="entry-screens-s38">
              <label
                data-mova-style="entry-screens-s39" style={cssVars({ "--mova-entry-screens-s39-color": cssVar((t.muted), true) })}
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
                data-mova-style="entry-screens-s40" style={cssVars({ "--mova-entry-screens-s40-border": cssVar((`1.5px solid ${
                    submitted && !form[field.key] ? "#F5795A" : t.border
                  }`), true), "--mova-entry-screens-s40-color": cssVar((TEXT), true) })}
              />
            </div>
          ))}

          <div data-mova-style="entry-screens-s41">
            <label
              data-mova-style="entry-screens-s42" style={cssVars({ "--mova-entry-screens-s42-color": cssVar((t.muted), true) })}
            >
              Número de teléfono a sincronizar *
            </label>
            <div
              data-mova-style="entry-screens-s43" style={cssVars({ "--mova-entry-screens-s43-border": cssVar((`1.5px solid ${
                  submitted && form.phone.length !== 8 ? "#F5795A" : t.border
                }`), true) })}
            >
              <span
                data-mova-style="entry-screens-s44" style={cssVars({ "--mova-entry-screens-s44-background": cssVar((t.soft), true), "--mova-entry-screens-s44-color": cssVar((t.muted), true) })}
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
                data-mova-style="entry-screens-s45" style={cssVars({ "--mova-entry-screens-s45-color": cssVar((TEXT), true) })}
              />
            </div>
          </div>

          {textFields.slice(3).map((field) => (
            <div key={field.key} data-mova-style="entry-screens-s46">
              <label
                data-mova-style="entry-screens-s47" style={cssVars({ "--mova-entry-screens-s47-color": cssVar((t.muted), true) })}
              >
                {field.label}
                {field.optional ? " · Opcional" : " *"}
              </label>
              <input
                value={form[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                placeholder={field.placeholder}
                data-mova-style="entry-screens-s48" style={cssVars({ "--mova-entry-screens-s48-border": cssVar((`1.5px solid ${
                    submitted && !field.optional && !form[field.key]
                      ? "#F5795A"
                      : t.border
                  }`), true), "--mova-entry-screens-s48-color": cssVar((TEXT), true) })}
              />
            </div>
          ))}

          {submitted && !isValid && (
            <p data-mova-style="entry-screens-s49">
              Completa todos los campos obligatorios. El teléfono debe tener 8
              dígitos.
            </p>
          )}
          <button
            type="submit"
            data-mova-style="entry-screens-s50" style={cssVars({ "--mova-entry-screens-s50-background": cssVar((`linear-gradient(135deg, ${t.accent}, #F6BE86)`), true), "--mova-entry-screens-s50-box-shadow": cssVar((`0 8px 22px ${t.accent}44`), true) })}
          >
            Crear cuenta y continuar
          </button>
        </form>
      </div>
    </div>
  )
}
