import { useState } from "react"
import { readProfiles, getActiveProfileId } from "./profileController"
export function useDeviceController() {
  const profiles = readProfiles()

  const [selectedId, setSelectedId] = useState(() =>
    getActiveProfileId(profiles),
  )

  const selected =
    profiles.find((profile) => profile.id === selectedId) ?? profiles[0]

  const mapSrc = `https://www.google.com/maps?q=${selected.device.lat},${selected.device.lng}&z=16&output=embed`

  return { profiles, selectedId, setSelectedId, selected, mapSrc }
}
