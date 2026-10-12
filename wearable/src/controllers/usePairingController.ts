import { useState } from "react"
import { api } from "./useSharedDevice"
export function usePairingController() {
  const [token] = useState(() => localStorage.getItem("mova_device_token"))
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const pair = async () => {
    setBusy(true)
    setError("")
    try {
      const response = await fetch(`${api}/api/pairings/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      localStorage.setItem("mova_device_token", data.token)
      localStorage.setItem("mova_device_id", data.device.id)
      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo vincular")
    } finally {
      setBusy(false)
    }
  }
  const unlink = () => {
    localStorage.removeItem("mova_device_token")
    localStorage.removeItem("mova_device_id")
    window.location.reload()
  }
  return { token, code, setCode, error, busy, pair, unlink }
}
