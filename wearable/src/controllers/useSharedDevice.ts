import { useCallback, useEffect, useRef, useState } from "react"
import { SHARED_DEVICE_ID, type DevicePayload, type DeviceState } from "../models/sharedDevice"

export const api = (import.meta.env.VITE_MOVA_API_URL || `http://${window.location.hostname}:3000`).replace(/\/$/, "")
const endpoint = `${api}/api/devices/${encodeURIComponent(SHARED_DEVICE_ID)}/state`
export function useSharedDevice() {
  const [state, setState] = useState<DeviceState | null>(null)
  const [status, setStatus] = useState("Conectando…")
  const [busy, setBusy] = useState(false)
  const alive = useRef(false)
  const writing = useRef(false)
  const version = useRef(0)

  useEffect(() => {
    alive.current = true
    const abort = new AbortController()
    let reading = false
    const refresh = async () => {
      if (reading || writing.current) return
      reading = true
      const requestVersion = version.current
      try {
        const response = await fetch(endpoint, { signal: AbortSignal.any([abort.signal, AbortSignal.timeout(8000)]), cache: "no-store" })
        if (!response.ok) throw new Error("API no disponible")
        const next: DeviceState = await response.json()
        if (alive.current && requestVersion === version.current) {
          setState(next)
          setStatus("Conectado")
        }
      } catch {
        if (alive.current && requestVersion === version.current) setStatus("Sin conexión · reintentando")
      } finally { reading = false }
    }
    void refresh()
    const timer = setInterval(() => void refresh(), 2000)
    return () => { alive.current = false; abort.abort(); clearInterval(timer) }
  }, [])

  const send = useCallback(async (url: string, method: string, body: unknown) => {
    if (writing.current) return false
    writing.current = true
    version.current++
    setBusy(true)
    setStatus("Guardando…")
    try {
      const response = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error("No se pudo guardar")
      const next: DeviceState = await response.json()
      if (alive.current) { setState(next); setStatus("Conectado") }
      return true
    } catch {
      if (alive.current) setStatus("No se guardó · vuelve a intentarlo")
      return false
    } finally {
      writing.current = false
      if (alive.current) setBusy(false)
    }
  }, [])
  const update = useCallback((patch: Partial<DevicePayload>) => send(endpoint, "PATCH", patch), [send])
  const promptFollowUp = useCallback((id: string) => send(`${api}/api/devices/${encodeURIComponent(SHARED_DEVICE_ID)}/emotions/${id}/prompt`, "POST", {}), [send])
  const answerFollowUp = useCallback((id: string, stillFeeling: boolean) => send(`${api}/api/devices/${encodeURIComponent(SHARED_DEVICE_ID)}/emotions/${id}/answer`, "POST", { stillFeeling }), [send])
  return { state, status, busy, update, promptFollowUp, answerFollowUp }
}
