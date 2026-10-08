import React from "react"
import ReactDOM from "react-dom/client"
import App, { WearableOnly } from "./App"
import "./index.css"

// Aquí elijo qué demostración abrir según la variable VITE_VIEW.
const Root = import.meta.env.VITE_VIEW === "wearable" ? WearableOnly : App

// Aquí monto la vista seleccionada dentro del elemento raíz del navegador.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
