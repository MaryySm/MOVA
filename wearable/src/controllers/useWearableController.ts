import { useEffect, useRef, useState } from "react"
import type { WPage } from "../models/wearable"
import { KIDS_ACTIVITIES } from "../models/wearable"
import { useSharedDevice } from "./useSharedDevice"
export function useWearableController(onSOS: () => void, sosAck: boolean) {
  const [page, setPage] = useState<WPage>("home")

  const { state, status, busy, update, promptFollowUp, answerFollowUp } = useSharedDevice()
  const acts = KIDS_ACTIVITIES.map(a => ({ ...a, done: state?.payload.activities[a.id] ?? false }))
  const mood = state?.payload.mood ?? null
  const sosActive = state?.payload.sos ?? false
  const previousSOS = useRef(false)
  const lastPromptAttempt = useRef(0)
  const [acknowledged, setAcknowledged] = useState(false)

  const [holding, setHolding] = useState(false)

  const [holdPct, setHoldPct] = useState(0)

  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [tick, setTick] = useState(0)
  const [serverOffset, setServerOffset] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setTick((p) => p + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (previousSOS.current && !sosActive && state) {
      setAcknowledged(true)
      setPage("home")
    }
    if (sosActive) setAcknowledged(false)
    previousSOS.current = sosActive
  }, [sosActive, state])

  useEffect(() => {
    if (sosAck && sosActive) void update({ sos: false })
  }, [sosAck, sosActive, update])

  useEffect(() => {
    if (state?.serverNow) setServerOffset(Date.parse(state.serverNow) - Date.now())
  }, [state?.serverNow])
  const followUp = state?.followUp ?? null
  useEffect(() => {
    if (followUp?.dueAt && !followUp.askedAt && !sosActive && !busy &&
        Date.now() + serverOffset >= Date.parse(followUp.dueAt) && Date.now() - lastPromptAttempt.current > 5000) {
      lastPromptAttempt.current = Date.now()
      void promptFollowUp(followUp.id)
    }
  }, [tick, followUp, sosActive, busy, serverOffset, promptFollowUp])
  const confirmEmotion = async (stillFeeling: boolean) => {
    if (followUp && await answerFollowUp(followUp.id, stillFeeling)) setPage("home")
  }

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

  const toggleAct = (id: string) => {
    const activity = acts.find(a => a.id === id)
    if (activity && state) void update({ activities: { [id]: !activity.done } })
  }

  const chooseMood = async (label: string) => {
    if (state && await update({ mood: label })) setPage("home")
  }

  const startHold = () => {
    if (sosActive || busy || !state || holding) return
    setHolding(true)
    let pct = 0
    holdRef.current = setInterval(() => {
      pct += 4
      setHoldPct(pct)
      if (pct >= 100) {
        clearInterval(holdRef.current!)
        setHolding(false)
        setHoldPct(0)
        void update({ sos: true }).then(saved => {
          if (saved) { setPage("sos"); onSOS() }
        })
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
    followUp: followUp?.askedAt ? followUp : null,
    confirmEmotion,
    status,
    busy,
    ready: state !== null,
    acknowledged,
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
