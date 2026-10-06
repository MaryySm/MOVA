export const WEEK_DAYS = [
  { key: "lun", label: "Lun", full: "Lunes", color: "#9B72F5" },
  { key: "mar", label: "Mar", full: "Martes", color: "#6B9FFF" },
  { key: "mie", label: "Mié", full: "Miércoles", color: "#5ECFA8" },
  { key: "jue", label: "Jue", full: "Jueves", color: "#F590B8" },
  { key: "vie", label: "Vie", full: "Viernes", color: "#F5A84B" },
  { key: "sab", label: "Sáb", full: "Sábado", color: "#5BB8F5" },
  { key: "dom", label: "Dom", full: "Domingo", color: "#F5795A" },
]

export const ACTIVITY_PRESETS = [
  { label: "🏫 Ir al colegio", color: "#6B9FFF" },
  { label: "🏊 Ir a natación", color: "#5BB8F5" },
  { label: "⚽ Taller de fútbol", color: "#5ECFA8" },
  { label: "📚 Tareas", color: "#A882F5" },
  { label: "🎨 Taller de arte", color: "#F590B8" },
  { label: "🎵 Clases de música", color: "#F5A84B" },
  { label: "🏋️ Entrenamiento", color: "#9B72F5" },
  { label: "🧘 Yoga / Meditación", color: "#5ECFA8" },
  { label: "🚴 Ciclismo", color: "#F5795A" },
  { label: "📖 Lectura", color: "#6B9FFF" },
  { label: "🛒 Compras", color: "#F5A84B" },
  { label: "👨‍👩‍👧 Familia", color: "#F590B8" },
]

export type WeekActivity = {
  id: string
  label: string
  color: string
  time: string
}

export type WeekPlan = Record<string, WeekActivity[]>

export const TODAY_PLAN = [
  {
    id: "h1",
    label: "⏰ Levantarme",
    time: "06:30",
    color: "#F5A84B",
    done: false,
    slot: "mañana",
  },
  {
    id: "h2",
    label: "🚿 Bañarme",
    time: "06:45",
    color: "#5BB8F5",
    done: true,
    slot: "mañana",
  },
  {
    id: "h3",
    label: "🦷 Lavarme los dientes",
    time: "07:00",
    color: "#5ECFA8",
    done: true,
    slot: "mañana",
  },
  {
    id: "h4",
    label: "🍳 Tomar desayuno",
    time: "07:15",
    color: "#F5A84B",
    done: false,
    slot: "mañana",
  },
  {
    id: "h5",
    label: "🏫 Ir al colegio",
    time: "08:00",
    color: "#6B9FFF",
    done: false,
    slot: "mañana",
  },
  {
    id: "h6",
    label: "🍽 Almorzar",
    time: "13:00",
    color: "#F5A84B",
    done: false,
    slot: "tarde",
  },
  {
    id: "h7",
    label: "⚽ Taller de fútbol",
    time: "16:00",
    color: "#5ECFA8",
    done: false,
    slot: "tarde",
  },
  {
    id: "h8",
    label: "🌙 Preparar para dormir",
    time: "21:00",
    color: "#9B72F5",
    done: false,
    slot: "noche",
  },
]

export const MOODS_HOME = [
  { emoji: "😄", label: "Genial", color: "#5ECFA8" },
  { emoji: "🙂", label: "Bien", color: "#6B9FFF" },
  { emoji: "😐", label: "Regular", color: "#A882F5" },
  { emoji: "😴", label: "Cansado", color: "#F5A84B" },
  { emoji: "😔", label: "Bajo", color: "#F5795A" },
]

export const SLOT_CONFIG = [
  {
    key: "mañana",
    label: "Mañana",
    emoji: "🌅",
    color: "#F5A84B",
    from: "06:00",
    to: "12:00",
  },
  {
    key: "tarde",
    label: "Tarde",
    emoji: "☀️",
    color: "#5BB8F5",
    from: "12:00",
    to: "18:00",
  },
  {
    key: "noche",
    label: "Noche",
    emoji: "🌙",
    color: "#9B72F5",
    from: "18:00",
    to: "22:00",
  },
]

export const GENERIC_TASKS = [
  { label: "⏰ Levantarme", color: "#F5A84B" },
  { label: "🚿 Bañarme", color: "#5BB8F5" },
  { label: "👕 Vestirme", color: "#9B72F5" },
  { label: "🦷 Lavarme los dientes", color: "#5ECFA8" },
  { label: "🛏 Hacer la cama", color: "#F590B8" },
  { label: "🍳 Tomar desayuno", color: "#F5A84B" },
  { label: "📚 Leer", color: "#6B9FFF" },
  { label: "🧘 Meditar", color: "#5ECFA8" },
  { label: "🏃 Hacer ejercicio", color: "#F590B8" },
  { label: "🍽 Almorzar", color: "#F5A84B" },
  { label: "💤 Siesta", color: "#9B72F5" },
  { label: "🌙 Preparar para dormir", color: "#9B72F5" },
]

export type SlotTask = {
  id: string
  label: string
  color: string
  done: boolean
}

export type RoutineSlots = {
  mañana: SlotTask[]
  tarde: SlotTask[]
  noche: SlotTask[]
}

export const INITIAL_ROUTINE: RoutineSlots = {
  mañana: [
    { id: "t1", label: "⏰ Levantarme", color: "#F5A84B", done: false },
    { id: "t2", label: "🚿 Bañarme", color: "#5BB8F5", done: false },
    { id: "t3", label: "👕 Vestirme", color: "#9B72F5", done: false },
    {
      id: "t4",
      label: "🦷 Lavarme los dientes",
      color: "#5ECFA8",
      done: false,
    },
    { id: "t5", label: "🛏 Hacer la cama", color: "#F590B8", done: false },
    { id: "t6", label: "🍳 Tomar desayuno", color: "#F5A84B", done: false },
  ],
  tarde: [{ id: "t7", label: "🍽 Almorzar", color: "#F5A84B", done: false }],
  noche: [
    {
      id: "t8",
      label: "🌙 Preparar para dormir",
      color: "#9B72F5",
      done: false,
    },
  ],
}

export const DAYS = ["L", "M", "X", "J", "V", "S", "D"]

export const CALENDAR_EVENTS = [
  { day: 4, color: "#F590B8" },
  { day: 6, color: "#F5A84B" },
  { day: 8, color: "#A882F5" },
  { day: 10, color: "#5BB8F5" },
  { day: 12, color: "#F590B8" },
  { day: 15, color: "#4ECBA0" },
  { day: 17, color: "#F5A84B" },
  { day: 20, color: "#A882F5" },
  { day: 22, color: "#F590B8" },
]

export const MOODS = [
  { id: "excelente", label: "Excelente", emoji: "😄", color: "#5ECFA8" },
  { id: "bien", label: "Bien", emoji: "🙂", color: "#5BB8F5" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#A882F5" },
  { id: "cansado", label: "Cansado", emoji: "😴", color: "#F5A84B" },
  { id: "estresado", label: "Estresado", emoji: "😤", color: "#F590B8" },
  { id: "bajo", label: "Bajo", emoji: "😔", color: "#F5795A" },
]

export const EMOTION_TAGS = [
  "Motivado",
  "Energizado",
  "Tranquilo",
  "Ansioso",
  "Concentrado",
  "Dolorido",
  "Relajado",
  "Orgulloso",
]

export const TAG_COLORS = [
  "#5ECFA8",
  "#F590B8",
  "#5BB8F5",
  "#F5795A",
  "#A882F5",
  "#F5A84B",
  "#4ECBA0",
  "#9B72F5",
]
