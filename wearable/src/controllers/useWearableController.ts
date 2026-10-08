import { useEffect, useRef, useState } from "react"
import type { KAct, WPage } from "../models/wearable"
import { KIDS_ACTIVITIES } from "../models/wearable"
// Aquí manejo el estado y las interacciones del simulador de reloj independiente.
export function useWearableController(onSOS: () => void, sosAck: boolean) {
  const [page, setPage] = useState<WPage>("home")

  const [acts, setActs] = useState<KAct[]>(KIDS_ACTIVITIES)

  const [mood, setMood] = useState<string | null>(null)

  const [sosActive, setSosActive] = useState(false)

  const [holding, setHolding] = useState(false)

  const [holdPct, setHoldPct] = useState(0)

  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [, setTick] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setTick((p) => p + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (sosAck)
      setTimeout(() => {
        setSosActive(false)
        setPage("home")
      }, 2000)
  }, [sosAck])

  const now = new Date()

  const hh = now.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const dd = now.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const pendingCount = acts.filter((a) => !a.done).length

  const completedCount = acts.length - pendingCount

  const activityPct = Math.round((completedCount / acts.length) * 100)

  const progressGreen = `hsl(${105 + activityPct * 0.35} 58% ${
    activityPct < 45 ? 48 : 40
  }%)`

  const toggleAct = (id: string) =>
    setActs((p) => p.map((a) => (a.id === id ? { ...a, done: !a.done } : a)))

  const chooseMood = (label: string) => {
    setMood(label)
    setTimeout(() => setPage("home"), 600)
  }

  const startHold = () => {
    if (sosActive) return
    setHolding(true)
    let pct = 0
    holdRef.current = setInterval(() => {
      pct += 4
      setHoldPct(pct)
      if (pct >= 100) {
        clearInterval(holdRef.current!)
        setHolding(false)
        setHoldPct(0)
        setSosActive(true)
        setPage("sos")
        onSOS()
      }
    }, 100)
  }

  const cancelHold = () => {
    if (holdRef.current) clearInterval(holdRef.current)
    setHolding(false)
    setHoldPct(0)
  }

  useEffect(
    () => () => {
      if (holdRef.current) clearInterval(holdRef.current)
    },
    [],
  )

  return {
    page,
    setPage,
    acts,
    mood,
    sosActive,
    holding,
    holdPct,
    hh,
    dd,
    pendingCount,
    activityPct,
    progressGreen,
    toggleAct,
    chooseMood,
    startHold,
    cancelHold,
  }
}
