import { useState } from "react"
import type { ChangeEvent } from "react"
import type { UserProfile, NotificationSettings } from "../models/profile"
import { DEFAULT_USER_PROFILE } from "../models/profile"
import {
  readProfiles,
  getActiveProfileId,
  setActiveProfileId,
  saveProfiles,
} from "./profileController"
export function useSettingsController() {
  const [profiles, setProfiles] = useState<UserProfile[]>(readProfiles)

  const [activeId, setActiveId] = useState(() => getActiveProfileId(profiles))

  const profile = profiles.find((item) => item.id === activeId) ?? profiles[0]

  const [draft, setDraft] = useState<UserProfile>(profile)

  const [editing, setEditing] = useState(false)

  const [saved, setSaved] = useState(false)

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [deviceOpen, setDeviceOpen] = useState(false)

  const persistProfiles = (next: UserProfile[]) => {
    setProfiles(next)
    saveProfiles(next)
  }

  const chooseProfile = (id: string) => {
    setActiveId(id)
    setActiveProfileId(id)
    setEditing(false)
    setNotificationsOpen(false)
    setDeviceOpen(false)
  }

  const openEditor = () => {
    setDraft(profile)
    setSaved(false)
    setEditing(true)
  }

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () =>
      setDraft((current) => ({
        ...current,
        photo: String(reader.result ?? ""),
      }))
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const saveProfile = () => {
    if (
      !draft.name.trim() ||
      !draft.age.trim() ||
      !draft.email.trim() ||
      draft.phone.length !== 8
    )
      return
    const next = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    }
    persistProfiles(
      profiles.map((item) => (item.id === profile.id ? next : item)),
    )
    setSaved(true)
    setEditing(false)
  }

  const addProfile = () => {
    const number = profiles.length + 1
    const id = `perfil-${Date.now()}`
    const newProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id,
      name: `Nuevo perfil ${number}`,
      age: "",
      email: "",
      phone: "",
      photo: "",
      notifications: { ...DEFAULT_USER_PROFILE.notifications },
      device: {
        ...DEFAULT_USER_PROFILE.device,
        id: `MOVA-${Math.floor(1000 + Math.random() * 9000)}`,
        battery: 72,
        steps: 0,
        lat: DEFAULT_USER_PROFILE.device.lat + number * 0.006,
        lng: DEFAULT_USER_PROFILE.device.lng + number * 0.004,
      },
    }
    persistProfiles([...profiles, newProfile])
    setActiveId(id)
    setActiveProfileId(id)
    setDraft(newProfile)
    setEditing(true)
    setSaved(false)
  }

  const updateNotifications = (changes: Partial<NotificationSettings>) => {
    persistProfiles(
      profiles.map((item) =>
        item.id === profile.id
          ? {
              ...item,
              notifications: { ...item.notifications, ...changes },
            }
          : item,
      ),
    )
  }

  return {
    profiles,
    activeId,
    profile,
    draft,
    setDraft,
    editing,
    setEditing,
    saved,
    notificationsOpen,
    setNotificationsOpen,
    deviceOpen,
    setDeviceOpen,
    chooseProfile,
    openEditor,
    selectPhoto,
    saveProfile,
    addProfile,
    updateNotifications,
  }
}
