import type { Screen } from "../models/navigation"
export const THEME: Record<Screen, {
  bg: string
  card: string
  accent: string
  accentText: string
  soft: string
  nav: string
  header: string
  muted: string
  border: string
}> = {
  splash: {
    bg: "#EDE7FF",
    card: "#F5F1FF",
    accent: "#9B72F5",
    accentText: "#fff",
    soft: "#EDE7FF",
    nav: "#9B72F5",
    header: "#C4ADFF",
    muted: "#8B7AAF",
    border: "rgba(155,114,245,0.15)",
  },
  login: {
    bg: "#E7F0FF",
    card: "#F1F6FF",
    accent: "#6B9FFF",
    accentText: "#fff",
    soft: "#DCE8FF",
    nav: "#6B9FFF",
    header: "#AECBFF",
    muted: "#6B84AF",
    border: "rgba(107,159,255,0.15)",
  },
  signup: {
    bg: "#FFF3E8",
    card: "#FFFAF5",
    accent: "#F29B64",
    accentText: "#fff",
    soft: "#FFE4D2",
    nav: "#F29B64",
    header: "#FFCBAA",
    muted: "#A86B48",
    border: "rgba(242,155,100,0.18)",
  },
  profile: {
    bg: "#E8F8F2",
    card: "#F1FBF6",
    accent: "#5ECFA8",
    accentText: "#fff",
    soft: "#D6F4EA",
    nav: "#5ECFA8",
    header: "#A8E8D4",
    muted: "#5B9B82",
    border: "rgba(94,207,168,0.15)",
  },
  home: {
    bg: "#FFF0F5",
    card: "#FFF5F8",
    accent: "#F590B8",
    accentText: "#fff",
    soft: "#FFE0EC",
    nav: "#F590B8",
    header: "#FFC2D9",
    muted: "#B06080",
    border: "rgba(245,144,184,0.18)",
  },
  routines: {
    bg: "#FFF4E6",
    card: "#FFFAF2",
    accent: "#F5A84B",
    accentText: "#fff",
    soft: "#FFE8C2",
    nav: "#F5A84B",
    header: "#FFD09A",
    muted: "#9E6B2E",
    border: "rgba(245,168,75,0.18)",
  },
  calendar: {
    bg: "#F5F0FF",
    card: "#FAF7FF",
    accent: "#A882F5",
    accentText: "#fff",
    soft: "#E8DBFF",
    nav: "#A882F5",
    header: "#CDB8FF",
    muted: "#7A5BAF",
    border: "rgba(168,130,245,0.18)",
  },
  emotions: {
    bg: "#FFF5F0",
    card: "#FFF9F5",
    accent: "#F5795A",
    accentText: "#fff",
    soft: "#FFE2D8",
    nav: "#F5795A",
    header: "#FFC4B0",
    muted: "#9E4A30",
    border: "rgba(245,121,90,0.18)",
  },
  device: {
    bg: "#F0F5FF",
    card: "#F5F8FF",
    accent: "#7098F5",
    accentText: "#fff",
    soft: "#D8E4FF",
    nav: "#7098F5",
    header: "#AABCFF",
    muted: "#4A60A8",
    border: "rgba(112,152,245,0.18)",
  },
  settings: {
    bg: "#F8F0FF",
    card: "#FCF5FF",
    accent: "#C47DF5",
    accentText: "#fff",
    soft: "#EDD8FF",
    nav: "#C47DF5",
    header: "#DFBAFF",
    muted: "#8A50AA",
    border: "rgba(196,125,245,0.18)",
  },
}

export const BORDER_GLOBAL = "rgba(0,0,0,0.07)"

export const TEXT = "#1A1A2E"

export const TEXT_MED = "#4A4A6A"
