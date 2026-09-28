import { usePhoneAppController } from "../controllers/usePhoneAppController"
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

export default function PhoneApp() {
  const { screen, go, showNav } = usePhoneAppController()

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #E8E0FF 0%, #FFE8F0 40%, #E0F5FF 80%, #E8FFE8 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "24px 40px 100px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            fontWeight: 800,
            color: "#4A4A6A",
            letterSpacing: 1,
          }}
        >
          📱 TELÉFONO PRINCIPAL
        </span>

        <div
          style={{
            width: 390,
            height: 844,
            borderRadius: 52,
            background: THEME[screen].bg,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow:
              "0 0 0 10px rgba(255,255,255,0.5), 0 0 0 11px rgba(0,0,0,0.06), 0 40px 80px rgba(0,0,0,0.18)",
            transition: "background 0.4s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 110,
              height: 28,
              background: THEME[screen].bg,
              borderBottomLeftRadius: 14,
              borderBottomRightRadius: 14,
              zIndex: 100,
              boxShadow: "0 4px 0 rgba(0,0,0,0.05)",
              transition: "background 0.4s",
            }}
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
