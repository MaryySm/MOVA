import type { CSSProperties } from "react"

// Aquí convierto valores dinámicos de las vistas en variables que consume el CSS.
export function cssVars(values: Record<string, string | number | undefined>): CSSProperties {
  return values as CSSProperties
}

// Mantengo la unidad que React aplicaba a los valores numéricos de estilo.
export function cssVar(value: unknown, appendPixels: boolean): string | number | undefined {
  if (value === null || value === undefined || typeof value === "boolean") return undefined
  if (typeof value === "number" && appendPixels && value !== 0) return `${value}px`
  return value as string | number
}
