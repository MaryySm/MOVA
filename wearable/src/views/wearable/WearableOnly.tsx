import { TEXT_MED } from "../theme"
import { WearableDevice } from "./WearableDevice"
export function WearableOnly() {
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
        gap: 12,
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#34D399",
            animation: "pulseDot 1.5s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: TEXT_MED,
            letterSpacing: 1,
          }}
        >
          MOVA KIDS
        </span>
      </div>
      <div
        style={{
          width: 38,
          height: 30,
          background: "linear-gradient(180deg, #A78BFA, #C4B5FD)",
          borderRadius: "14px 14px 0 0",
          boxShadow: "0 -3px 8px rgba(167,139,250,0.25)",
        }}
      />
      <WearableDevice onSOS={() => {}} sosAck={false} />
      <div
        style={{
          width: 38,
          height: 30,
          background: "linear-gradient(180deg, #C4B5FD, #A78BFA)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "0 5px 10px rgba(167,139,250,0.3)",
        }}
      />
    </main>
  )
}
