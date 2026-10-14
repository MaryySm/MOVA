import { QRCodeSVG } from "qrcode.react"
import { usePairingController } from "../../controllers/usePairingController"
import { TEXT_MED } from "../theme"
import WearableCase from "./WearableCase"
import { WearableDevice } from "./WearableDevice"

export function WearableOnly() {
  const { token, request, error, busy, expired, generate, unlink } =
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
          <div
            style={{
              height: "100%",
              padding: "18px 18px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 6,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: "#4A3F6B",
              }}
            >
              Vincula tu reloj
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                lineHeight: 1.4,
                color: "#716987",
              }}
            >
              Escanea desde tu teléfono
            </p>
            {request && !expired && (
              <>
                <div
                  style={{ background: "white", padding: 6, borderRadius: 12 }}
                >
                  <QRCodeSVG
                    value={request.qr}
                    size={94}
                    level="M"
                    fgColor="#4A3F6B"
                    title="QR de vinculación MOVA"
                  />
                </div>
                <span style={{ fontSize: 9, color: "#716987" }}>
                  O ingresa este código
                </span>
                <strong
                  aria-label="Código de vinculación"
                  style={{
                    fontSize: 23,
                    letterSpacing: 4,
                    color: "#8B6BC7",
                    lineHeight: 1.1,
                  }}
                >
                  {request.code}
                </strong>
                <span style={{ fontSize: 9, color: "#716987" }}>
                  Válido por 10 minutos
                </span>
              </>
            )}
            {expired && (
              <p style={{ fontSize: 11, color: "#716987", margin: 8 }}>
                El código venció
              </p>
            )}
            {error && (
              <p
                role="alert"
                style={{ fontSize: 9, color: "#D95648", margin: 0 }}
              >
                {error}
              </p>
            )}
            {(!request || expired) && (
              <button
                onClick={() => void generate()}
                disabled={busy}
                style={{
                  border: 0,
                  borderRadius: 12,
                  padding: "9px 12px",
                  background: "linear-gradient(135deg,#A78BFA,#C4B5FD)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {busy ? "Generando…" : "Generar código"}
              </button>
            )}
          </div>
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
          escanea el QR o ingresa los seis dígitos que muestra el reloj.
        </p>
      )}
    </main>
  )
}
