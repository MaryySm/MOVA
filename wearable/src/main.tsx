import React from "react"
import ReactDOM from "react-dom/client"
import App, { WearableOnly } from "./App"
import "./index.css"

const Root = import.meta.env.VITE_VIEW === "wearable" ? WearableOnly : App

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
