import { useState } from "react"
import { WEEK_DAYS, TODAY_PLAN, INITIAL_ROUTINE } from "../models/planning"
import type {
  WeekActivity,
  WeekPlan,
  RoutineSlots,
  SlotTask,
} from "../models/planning"
import { getHomeSummary } from "./profileController"
// Aquí administro actividades, rutinas y cambios de planificación.
export function useWeeklyPlanController() {
  const [activeDay, setActiveDay] = useState("lun")

  const [plan, setPlan] = useState<WeekPlan>({
    lun: [
      { id: "1", label: "🏫 Ir al colegio", color: "#6B9FFF", time: "08:00" },
    ],
    mar: [
      { id: "2", label: "🏊 Ir a natación", color: "#5BB8F5", time: "17:00" },
    ],
    mie: [
      { id: "3", label: "🏫 Ir al colegio", color: "#6B9FFF", time: "08:00" },
      {
        id: "4",
        label: "⚽ Taller de fútbol",
        color: "#5ECFA8",
        time: "16:00",
      },
    ],
    jue: [],
    vie: [
      { id: "5", label: "🏫 Ir al colegio", color: "#6B9FFF", time: "08:00" },
    ],
    sab: [
      {
        id: "6",
        label: "⚽ Taller de fútbol",
        color: "#5ECFA8",
        time: "10:00",
      },
    ],
    dom: [],
  })

  const [showPicker, setShowPicker] = useState(false)

  const [customText, setCustomText] = useState("")

  const [customTime, setCustomTime] = useState("08:00")

  const dayInfo = WEEK_DAYS.find((d) => d.key === activeDay)!

  const dayActivities = plan[activeDay] || []

  const addActivity = (label: string, color: string) => {
    const newAct: WeekActivity = {
      id: Date.now().toString(),
      label,
      color,
      time: customTime,
    }
    setPlan((p) => ({ ...p, [activeDay]: [...(p[activeDay] || []), newAct] }))
    setShowPicker(false)
    setCustomText("")
  }

  const removeActivity = (id: string) => {
    setPlan((p) => ({
      ...p,
      [activeDay]: (p[activeDay] || []).filter((a) => a.id !== id),
    }))
  }

  const addCustom = () => {
    if (!customText.trim()) return
    addActivity(customText.trim(), dayInfo.color)
  }

  return {
    activeDay,
    setActiveDay,
    plan,
    setPlan,
    showPicker,
    setShowPicker,
    customText,
    setCustomText,
    customTime,
    setCustomTime,
    dayInfo,
    dayActivities,
    addActivity,
    removeActivity,
    addCustom,
  }
}
export function useHomeController() {
  const [tasks, setTasks] = useState(TODAY_PLAN)

  const [mood, setMood] = useState<string | null>(null)

  const [notifOpen, setNotifOpen] = useState(false)

  const syncedSummary = getHomeSummary()

  const toggleTask = (id: string) =>
    setTasks((p) =>
      p.map((tk) => (tk.id === id ? { ...tk, done: !tk.done } : tk)),
    )

  const done = tasks.filter((t) => t.done).length

  const total = tasks.length

  const pct = Math.round((done / total) * 100)

  const notifs = [
    { text: "⚽ Taller de fútbol en 45 min", color: "#5ECFA8", time: "15:15" },
    { text: "💧 Recuerda hidratarte", color: "#6B9FFF", time: "12:00" },
    { text: "🌙 Hora de dormir a las 21:30", color: "#9B72F5", time: "21:00" },
  ]

  const slotLabels: Record<string, string> = {
    mañana: "🌅 Mañana",
    tarde: "☀️ Tarde",
    noche: "🌙 Noche",
  }

  const grouped = ["mañana", "tarde", "noche"]
    .map((s) => ({
      slot: s,
      label: slotLabels[s],
      items: tasks.filter((t) => t.slot === s),
    }))
    .filter((g) => g.items.length > 0)

  return {
    tasks,
    mood,
    setMood,
    notifOpen,
    setNotifOpen,
    syncedSummary,
    toggleTask,
    done,
    total,
    pct,
    notifs,
    slotLabels,
    grouped,
  }
}
export function useRoutineController() {
  const [routine, setRoutine] = useState<RoutineSlots>(
    JSON.parse(JSON.stringify(INITIAL_ROUTINE)),
  )

  const [openSlot, setOpenSlot] = useState<string | null>("mañana")

  const [addingTo, setAddingTo] = useState<string | null>(null)

  const [customTask, setCustomTask] = useState("")

  const [toast, setToast] = useState("")

  const toggleDone = (slot: string, id: string) => {
    setRoutine((r) => ({
      ...r,
      [slot]: r[(slot as keyof RoutineSlots)].map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    }))
  }

  const removeTask = (slot: string, id: string) => {
    setRoutine((r) => ({
      ...r,
      [slot]: r[(slot as keyof RoutineSlots)].filter((task) => task.id !== id),
    }))
  }

  const addTask = (slot: string, label: string, color: string) => {
    const newTask: SlotTask = {
      id: Date.now().toString(),
      label,
      color,
      done: false,
    }
    setRoutine((r) => ({
      ...r,
      [slot]: [...r[(slot as keyof RoutineSlots)], newTask],
    }))
    setCustomTask("")
    setAddingTo(null)
  }

  const addToWeekPlan = (task: SlotTask) => {
    setToast(`"${task.label}" añadida a planificación semanal ✓`)
    setTimeout(() => setToast(""), 2200)
  }

  const totalTasks = Object.values(routine).flat().length

  const doneTasks = Object.values(routine)
    .flat()
    .filter((t) => t.done).length

  return {
    routine,
    openSlot,
    setOpenSlot,
    addingTo,
    setAddingTo,
    customTask,
    setCustomTask,
    toast,
    toggleDone,
    removeTask,
    addTask,
    addToWeekPlan,
    totalTasks,
    doneTasks,
  }
}
export function useCalendarController() {
  const [selectedDay, setSelectedDay] = useState(10)

  const weeks = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19, 20, 21],
    [22, 23, 24, 25, 26, 27, 28],
    [29, 30, 31, null, null, null, null],
  ]

  const scheduled = [
    {
      time: "06:30",
      name: "Carrera HIIT",
      duration: "35 min",
      color: "#F590B8",
    },
    { time: "12:00", name: "Lunch walk", duration: "20 min", color: "#F5A84B" },
    {
      time: "19:00",
      name: "Yoga nocturno",
      duration: "25 min",
      color: "#A882F5",
    },
  ]

  return { selectedDay, setSelectedDay, weeks, scheduled }
}
export function useEmotionsController() {
  const [mood, setMood] = useState<string | null>(null)

  const [tags, setTags] = useState<string[]>([])

  const [note, setNote] = useState("")

  const toggleTag = (tag: string) =>
    setTags((p) => (p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag]))

  const weekData = [68, 82, 55, 90, 73, 88, 92]

  const barColors = [
    "#F590B8",
    "#F5A84B",
    "#A882F5",
    "#5ECFA8",
    "#5BB8F5",
    "#F5795A",
    "#5ECFA8",
  ]

  return {
    mood,
    setMood,
    tags,
    setTags,
    note,
    setNote,
    toggleTag,
    weekData,
    barColors,
  }
}
