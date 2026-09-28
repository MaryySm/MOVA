export const W = 210

export const H = 250

export const WR = 52

export const WA = "#A78BFA"

export const WG = "#34D399"

export const WY = "#FBBF24"

export const WP = "#FB7185"

export const WB = "#60A5FA"

export const KIDS_ACTIVITIES = [
  {
    id: "a1",
    icon: "⏰",
    label: "Levantarme",
    time: "06:30",
    color: "#FBBF24",
    done: false,
  },
  {
    id: "a2",
    icon: "🚿",
    label: "Bañarme",
    time: "06:45",
    color: "#60A5FA",
    done: false,
  },
  {
    id: "a3",
    icon: "🦷",
    label: "Dientes",
    time: "07:00",
    color: "#34D399",
    done: false,
  },
  {
    id: "a4",
    icon: "🍳",
    label: "Desayuno",
    time: "07:15",
    color: "#FB7185",
    done: false,
  },
  {
    id: "a5",
    icon: "🏫",
    label: "Al colegio",
    time: "08:00",
    color: "#A78BFA",
    done: false,
  },
  {
    id: "a6",
    icon: "⚽",
    label: "Fútbol",
    time: "16:00",
    color: "#34D399",
    done: false,
  },
  {
    id: "a7",
    icon: "🌙",
    label: "Dormir",
    time: "21:00",
    color: "#A78BFA",
    done: false,
  },
]

export const KIDS_MOODS = [
  { emoji: "😄", label: "¡Genial!", color: "#34D399" },
  { emoji: "🙂", label: "Bien", color: "#60A5FA" },
  { emoji: "😐", label: "Normal", color: "#A78BFA" },
  { emoji: "😴", label: "Cansado", color: "#FBBF24" },
  { emoji: "😢", label: "Triste", color: "#FB7185" },
  { emoji: "😡", label: "Enojado", color: "#F97316" },
]

export type WPage = "home" | "activities" | "emotions" | "sos"

export type KAct = typeof KIDS_ACTIVITIES[0]
