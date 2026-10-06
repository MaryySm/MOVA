export type DevicePayload = {
  mood: string | null
  activities: Record<string, boolean>
  sos: boolean
  heartRate?: number
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
}
export const SHARED_DEVICE_ID = import.meta.env.VITE_MOVA_DEVICE_ID || "MOVA-2841"
