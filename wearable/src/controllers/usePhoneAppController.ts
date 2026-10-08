import { useState } from "react"
import type { Screen } from "../models/navigation"
import { SCREENS_WITH_NAV } from "../models/navigation"
// Aquí conservo la pantalla actual y determino cuándo mostrar la navegación inferior.
export function usePhoneAppController() {
  const [screen, setScreen] = useState<Screen>("splash")
  const go = (next: Screen) => setScreen(next)
  const showNav = SCREENS_WITH_NAV.includes(screen)
  return { screen, go, showNav }
}
