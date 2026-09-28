export type SignupData = {
  adultName: string
  userName: string
  age: string
  phone: string
  email: string
  diagnosis: string
}

export type NotificationSettings = {
  vibration: boolean
  sound: boolean
  lights: boolean
  intensity: number
}

export type UserProfile = {
  id: string
  name: string
  adultName: string
  age: string
  email: string
  phone: string
  photo: string
  notifications: NotificationSettings
  device: {
    id: string
    name: string
    battery: number
    steps: number
    lat: number
    lng: number
  }
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "carlos",
  name: "Carlos Rodríguez",
  adultName: "",
  age: "10",
  email: "carlos@mova.app",
  phone: "12345678",
  photo: "",
  notifications: { vibration: true, sound: true, lights: true, intensity: 6 },
  device: {
    id: "MOVA-2841",
    name: "MOVA Band Pro",
    battery: 84,
    steps: 8420,
    lat: -33.4489,
    lng: -70.6693,
  },
}
