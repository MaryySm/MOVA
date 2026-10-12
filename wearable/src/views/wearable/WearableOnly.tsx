import { usePairingController } from "../../controllers/usePairingController"
import { TEXT_MED } from "../theme"
import WearableCase from "./WearableCase"
import { WearableDevice } from "./WearableDevice"

export function WearableOnly() {
  const { token, code, setCode, error, busy, pair, unlink } =
    usePairingController()
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background:
          "linear-gradient(135deg, #E8E0FF 0%, #FFE8F0 40%, #E0F5FF 80%, #E8FFE8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "36px 24px",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: token ? "#34D399" : "#A78BFA",
            animation: "pulseDot 1.5s ease-in-out infinite",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 800,
            color: TEXT_MED,
            letterSpacing: 1,
          }}
        >
          MOVA KIDS
        </h1>
      </div>
      {token ? (
        <WearableDevice onSOS={() => {}} sosAck={false} />
      ) : (
        <WearableCase>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void pair()
            }}
            style={{
              height: "100%",
              padding: "26px 19px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div aria-hidden="true" style={{ fontSize: 25, marginBottom: 4 }}>
              ⌚
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 800,
                color: "#4A3F6B",
              }}
            >
              Vincula tu reloj
            </h2>
            <p
              style={{
                margin: "6px 0 10px",
                fontSize: 10,
                lineHeight: 1.45,
                color: "#716987",
              }}
            >
              Ingresa el código generado
              <br />
              en tu teléfono MOVA.
            </p>
            <label
              htmlFor="pairing-code"
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.5,
                color: "#716987",
                marginBottom: 5,
              }}
            >
              CÓDIGO DE VINCULACIÓN
            </label>
            <input
              id="pairing-code"
              aria-label="Código de vinculación"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="A1B2C3D4E5F"
              disabled={busy}
              style={{
                width: "100%",
                minWidth: 0,
                padding: "9px 6px",
                border: "1.5px solid #DDD6FE",
                borderRadius: 12,
                background: "#FFFFFF",
                color: "#4A3F6B",
                fontSize: 11,
                textAlign: "center",
                letterSpacing: 1,
                outlineColor: "#A78BFA",
              }}
            />
            {error && (
              <p
                role="alert"
                style={{
                  margin: "5px 0 0",
                  fontSize: 9,
                  lineHeight: 1.3,
                  color: "#D95648",
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              style={{
                marginTop: 9,
                padding: "9px 10px",
                border: 0,
                borderRadius: 12,
                background: "linear-gradient(135deg, #A78BFA, #C4B5FD)",
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: 800,
                boxShadow: "0 4px 10px rgba(167,139,250,.22)",
                opacity: busy || !code.trim() ? 0.5 : 1,
                cursor: busy || !code.trim() ? "default" : "pointer",
              }}
            >
              {busy ? "Vinculando…" : "Vincular"}
            </button>
          </form>
        </WearableCase>
      )}
      {token ? (
        <button
          onClick={unlink}
          style={{
            padding: "9px 18px",
            border: "1px solid rgba(167,139,250,.4)",
            borderRadius: 14,
            background: "rgba(255,255,255,.65)",
            color: "#8B6BC7",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Vincular otro reloj
        </button>
      ) : (
        <p
          style={{
            margin: 0,
            maxWidth: 290,
            textAlign: "center",
            fontSize: 12,
            lineHeight: 1.6,
            color: TEXT_MED,
          }}
        >
          En el teléfono, abre <strong>Ajustes → Dispositivo MOVA</strong>,
          registra tu reloj y genera un código de vinculación.
        </p>
      )}
    </main>
  )
}
