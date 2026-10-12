export type DevicePayload = {
  mood: string | null
  activities: Record<string, boolean>
  sos: boolean
  heartRate?: number
  battery?: number
  steps?: number
}
export type EmotionEntry = {
  id: string
  mood: string
  recordedAt: string
  dueAt: string | null
  askedAt: string | null
  answeredAt: string | null
  stillFeeling: boolean | null
  supersededAt: string | null
}
export type EmotionReport = {
  entries: EmotionEntry[]
  summary: Record<"day" | "week" | "month", { total: number; startsAt: string; endsAt: string; emotions: { mood: string; count: number; percentage: number }[] }>
  timezone: string
  nextCursor: string | null
}
export type DeviceState = {
  deviceId: string
  payload: DevicePayload
  updatedAt: string | null
  followUp: EmotionEntry | null
  serverNow: string
  tasks?: { id: string; title: string; icon: string; scheduled_time: string; done: boolean }[]
}
export const SHARED_DEVICE_ID = localStorage.getItem("mova_device_id") || import.meta.env.VITE_MOVA_DEVICE_ID || "MOVA-2841"
