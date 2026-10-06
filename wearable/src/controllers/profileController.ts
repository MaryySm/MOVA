import {
  DEFAULT_USER_PROFILE,
  type SignupData,
  type UserProfile,
} from "../models/profile"

const PROFILES_KEY = "mova-user-profiles"
const LEGACY_PROFILE_KEY = "mova-user-profile"
const ACTIVE_PROFILE_KEY = "mova-active-profile"

function normalizeProfile(profile: Partial<UserProfile>): UserProfile {
  return {
    ...DEFAULT_USER_PROFILE,
    ...profile,
    adultName: profile.adultName ?? "",
    notifications: {
      ...DEFAULT_USER_PROFILE.notifications,
      ...profile.notifications,
    },
    device: {
      ...DEFAULT_USER_PROFILE.device,
      ...profile.device,
    },
  }
}

export function readProfiles(): UserProfile[] {
  try {
    const saved = localStorage.getItem(PROFILES_KEY)
    if (saved) {
      const profiles = JSON.parse(saved) as Partial<UserProfile>[]
      if (profiles.length > 0) return profiles.map(normalizeProfile)
    }

    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY)
    if (legacy) return [normalizeProfile(JSON.parse(legacy))]
  } catch {
    return [DEFAULT_USER_PROFILE]
  }

  return [DEFAULT_USER_PROFILE]
}

function readStoredProfiles(): UserProfile[] {
  try {
    const saved = localStorage.getItem(PROFILES_KEY)
    if (saved) {
      return (JSON.parse(saved) as Partial<UserProfile>[]).map(normalizeProfile)
    }

    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY)
    return legacy ? [normalizeProfile(JSON.parse(legacy))] : []
  } catch {
    return []
  }
}

export function getActiveProfileId(
  profiles: UserProfile[] = readProfiles(),
): string {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) ?? profiles[0].id
}

export function getActiveProfile(
  profiles: UserProfile[] = readProfiles(),
): UserProfile {
  const activeId = getActiveProfileId(profiles)
  return profiles.find((profile) => profile.id === activeId) ?? profiles[0]
}

export function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id)
}

export function registerProfile(data: SignupData): UserProfile {
  const id = `mova-${Date.now()}`
  const profile: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    id,
    adultName: data.adultName.trim(),
    name: data.userName.trim(),
    age: data.age.trim(),
    phone: data.phone,
    email: data.email.trim(),
  }

  saveProfiles([...readStoredProfiles(), profile])
  setActiveProfileId(id)
  return profile
}

export function getHomeSummary() {
  const profile = getActiveProfile()
  return {
    name: profile.name,
    adultName: profile.adultName,
    battery: profile.device.battery,
    deviceName: profile.device.name,
  }
}
