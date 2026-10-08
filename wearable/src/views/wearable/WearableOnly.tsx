import { cssVar, cssVars } from "../styleVars";
import { TEXT_MED } from "../theme"
import "./WearableOnly.styles.css";
import { WearableDevice } from "./WearableDevice"

// Aquí presento el simulador MOVA Kids separado visualmente de la app móvil.
export function WearableOnly() {
  return (
    <main
      data-mova-style="wearable-only-s0"
    >
      <div data-mova-style="wearable-only-s1">
        <div
          data-mova-style="wearable-only-s2"
        />
        <span
          data-mova-style="wearable-only-s3" style={cssVars({ "--mova-wearable-only-s3-color": cssVar((TEXT_MED), true) })}
        >
          MOVA KIDS
        </span>
      </div>
      <div
        data-mova-style="wearable-only-s4"
      />
      <WearableDevice onSOS={() => {}} sosAck={false} />
      <div
        data-mova-style="wearable-only-s5"
      />
    </main>
  )
}
