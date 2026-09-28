import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import type { Screen } from "../models/navigation"
import type { SignupData } from "../models/profile"
import { registerProfile } from "./profileController"

type SignupField = keyof SignupData
export function useSplashController(go: (screen: Screen) => void) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setOpacity(1), 100)
    const t2 = setTimeout(() => go("login"), 2600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [go])

  return { opacity }
}
export function useLoginController() {
  const [email, setEmail] = useState("")

  const [pass, setPass] = useState("")

  return { email, setEmail, pass, setPass }
}
export function useSignupController(go: (screen: Screen) => void) {
  const [form, setForm] = useState<SignupData>({
    adultName: "",
    userName: "",
    age: "",
    phone: "",
    email: "",
    diagnosis: "",
  })

  const [submitted, setSubmitted] = useState(false)

  const requiredFields: SignupField[] = [
    "adultName",
    "userName",
    "age",
    "phone",
    "email",
  ]

  const isValid =
    requiredFields.every((field) => form[field].trim()) &&
    form.phone.length === 8

  const update = (field: keyof SignupData, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    registerProfile(form)
    go("profile")
  }

  return {
    form,
    submitted,
    isValid,
    update,
    submit,
  }
}
