import React from "react"
import type { Screen } from "../../models/navigation"
import { THEME, TEXT } from "../theme"
export function IconHome({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V12Z"
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconRoutines({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" fill={color} />
      <rect x="3" y="10.75" width="12" height="2.5" rx="1.25" fill={color} />
      <rect x="3" y="16.5" width="15" height="2.5" rx="1.25" fill={color} />
    </svg>
  )
}

export function IconCalendar({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill={`${color}20`}
      />
      <path d="M3 10H21" stroke={color} strokeWidth="2" />
      <path
        d="M8 3V7M16 3V7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconEmotions({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="2"
        fill={`${color}20`}
      />
      <path
        d="M8.5 14.5C9.5 16 14.5 16 15.5 14.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="1.2" fill={color} />
      <circle cx="15" cy="10" r="1.2" fill={color} />
    </svg>
  )
}

export function IconSettings({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke={color}
        strokeWidth="2"
        fill={`${color}20`}
      />
      <path
        d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const NAV_ITEMS: {
  key: Screen
  label: string
  icon: (c: string) => React.ReactNode
}[] = [
  { key: "home", label: "Inicio", icon: (c) => <IconHome color={c} /> },
  {
    key: "routines",
    label: "Rutinas",
    icon: (c) => <IconRoutines color={c} />,
  },
  { key: "calendar", label: "Agenda", icon: (c) => <IconCalendar color={c} /> },
  {
    key: "emotions",
    label: "Emociones",
    icon: (c) => <IconEmotions color={c} />,
  },
  {
    key: "settings",
    label: "Ajustes",
    icon: (c) => <IconSettings color={c} />,
  },
]

export function BottomNav({
  screen,
  go,
}: {
  screen: Screen
  go: (s: Screen) => void
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(255,255,255,0.92)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        padding: "10px 0 20px",
        backdropFilter: "blur(20px)",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = screen === item.key
        const color = active ? THEME[item.key].nav : "#BDB8D4"
        return (
          <button
            key={item.key}
            onClick={() => go(item.key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              position: "relative",
            }}
          >
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  background: color,
                }}
              />
            )}
            {item.icon(color)}
            <span
              style={{
                fontSize: 10,
                color,
                fontFamily: "Outfit, sans-serif",
                fontWeight: active ? 700 : 400,
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function TopBar({
  title,
  onBack,
  accent,
  action,
}: {
  title: string
  onBack?: () => void
  accent: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px 10px",
        gap: 12,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: `${accent}20`,
            border: "none",
            borderRadius: 12,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      <h2
        style={{
          flex: 1,
          margin: 0,
          fontSize: 20,
          fontFamily: "Outfit, sans-serif",
          fontWeight: 800,
          color: TEXT,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  )
}
