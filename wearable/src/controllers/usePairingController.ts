import { useCallback, useEffect, useState } from "react"
import { api } from "./useSharedDevice"

type PairingRequest = {
  code: string
  secret: string
  qr: string
  expiresAt: string
}
export function usePairingController() {
  const [token] = useState(() => localStorage.getItem("mova_device_token"))
  const [request, setRequest] = useState<PairingRequest | null>(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("mova_pairing_request") || "null",
      )
      return value && Date.parse(value.expiresAt) > Date.now() ? value : null
    } catch {
      return null
    }
  })
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [expired, setExpired] = useState(false)
  const generate = useCallback(async () => {
    setBusy(true)
    setError("")
    try {
      const response = await fetch(`${api}/api/pairings/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      localStorage.setItem("mova_pairing_request", JSON.stringify(data))
      setRequest(data)
      setExpired(false)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo generar el código",
      )
    } finally {
      setBusy(false)
    }
  }, [])
  useEffect(() => {
    if (!token && !request) void generate()
  }, [token, request, generate])
  useEffect(() => {
    if (token || !request || expired) return
    let active = true,
      polling = false
    const poll = async () => {
      if (polling || !active) return
      polling = true
      try {
        const response = await fetch(`${api}/api/pairings/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secret: request.secret }),
        })
        const data = await response.json()
        if (!active) return
        if (response.status === 410) {
          setExpired(true)
          return
        }
        if (!response.ok) throw new Error(data.error)
        setError("")
        if (data.status === "paired") {
          localStorage.setItem("mova_device_token", data.token)
          localStorage.setItem("mova_device_id", data.device.id)
          localStorage.removeItem("mova_pairing_request")
          window.location.reload()
        }
      } catch {
        if (active) setError("Sin conexión. Reintentando…")
      } finally {
        polling = false
      }
    }
    void poll()
    const timer = setInterval(() => void poll(), 3000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [token, request, expired])
  const unlink = () => {
    localStorage.removeItem("mova_device_token")
    localStorage.removeItem("mova_device_id")
    localStorage.removeItem("mova_pairing_request")
    window.location.reload()
  }
  return { token, request, error, busy, expired, generate, unlink }
}
