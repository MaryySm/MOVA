import { cssVar, cssVars } from "./styleVars";
import { usePhoneAppController } from "../controllers/usePhoneAppController"
import "./PhoneApp.styles.css";
import { BottomNav } from "./shared/Navigation"
import { THEME } from "./theme"
import { LoginScreen, SignupScreen, SplashScreen } from "./screens/EntryScreens"
import { HomeScreen } from "./screens/HomeScreen"
import { RoutinesScreen } from "./screens/RoutinesScreen"
import { CalendarScreen } from "./screens/CalendarScreen"
import { EmotionsScreen } from "./screens/EmotionsScreen"
import { DeviceScreen } from "./screens/DeviceScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { WeeklyPlanScreen } from "./screens/WeeklyPlanScreen"

// Aquí compongo la experiencia móvil y conecto cada pantalla con la navegación.
export default function PhoneApp() {
  const { screen, go, showNav } = usePhoneAppController()

  return (
    <div
      data-mova-style="phone-app-s0"
    >
      <div
        data-mova-style="phone-app-s1"
      >
        <span
          data-mova-style="phone-app-s2"
        >
          📱 TELÉFONO PRINCIPAL
        </span>

        <div
          data-mova-style="phone-app-s3" style={cssVars({ "--mova-phone-app-s3-background": cssVar((THEME[screen].bg), true) })}
        >
          <div
            data-mova-style="phone-app-s4" style={cssVars({ "--mova-phone-app-s4-background": cssVar((THEME[screen].bg), true) })}
          />

          {screen === "splash" && <SplashScreen go={go} />}
          {screen === "login" && <LoginScreen go={go} />}
          {screen === "signup" && <SignupScreen go={go} />}
          {screen === "profile" && <WeeklyPlanScreen go={go} />}
          {screen === "home" && <HomeScreen go={go} />}
          {screen === "routines" && <RoutinesScreen go={go} />}
          {screen === "calendar" && <CalendarScreen go={go} />}
          {screen === "emotions" && <EmotionsScreen />}
          {screen === "device" && <DeviceScreen go={go} />}
          {screen === "settings" && <SettingsScreen />}
          {showNav && <BottomNav screen={screen} go={go} />}
        </div>
      </div>
    </div>
  )
}
