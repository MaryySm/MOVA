import type { ReactNode } from "react"
import { W, H, WR } from "../../models/wearable"

// The same original watch case surrounds pairing and connected screens.
export default function WearableCase({
  children,
  background = "#FAF5FF",
  footer,
}: {
  children: ReactNode
  background?: string
  footer?: ReactNode
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 38,
          height: 30,
          background: "linear-gradient(180deg, #A78BFA, #C4B5FD)",
          borderRadius: "14px 14px 0 0",
          boxShadow: "0 -3px 8px rgba(167,139,250,0.25)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -13,
            top: "45%",
            width: 9,
            height: 36,
            borderRadius: 4,
            background: "#DDD6FE",
            boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
          }}
        />
        <div
          style={{
            width: W,
            height: H,
            borderRadius: WR,
            background,
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 0 0 8px rgba(255,255,255,0.65), 0 0 0 9.5px rgba(0,0,0,0.07), 0 24px 56px rgba(0,0,0,0.2)",
            transition: "background 0.35s",
          }}
        >
          {children}
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          width: 38,
          height: 30,
          background: "linear-gradient(180deg, #C4B5FD, #A78BFA)",
          borderRadius: "0 0 14px 14px",
          boxShadow: "0 5px 10px rgba(167,139,250,0.3)",
        }}
      />
      {footer}
    </div>
  )
}
