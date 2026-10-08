// Aquí muestro la rutina diaria y dejo cambiar el estado de cada tarea.
import { cssVar, cssVars } from "../styleVars";
import "./RoutinesScreen.styles.css";
import type { Screen } from "../../models/navigation"
import { THEME, TEXT, TEXT_MED } from "../theme"
import { useRoutineController } from "../../controllers/usePlanningControllers"
import {
  SLOT_CONFIG,
  GENERIC_TASKS,
  type RoutineSlots,
} from "../../models/planning"
export function RoutinesScreen({ go }: { go: (s: Screen) => void }) {
  const {
    routine,
    openSlot,
    setOpenSlot,
    addingTo,
    setAddingTo,
    customTask,
    setCustomTask,
    toast,
    toggleDone,
    removeTask,
    addTask,
    addToWeekPlan,
    totalTasks,
    doneTasks,
  } = useRoutineController()

  const t = THEME.routines

  return (
    <div
      data-mova-style="routines-screen-s0" style={cssVars({ "--mova-routines-screen-s0-background": cssVar((t.bg), true) })}
    >
      {/* Toast */}
      {toast && (
        <div
          data-mova-style="routines-screen-s1"
        >
          {toast}
        </div>
      )}

      <div data-mova-style="routines-screen-s2">
        <div
          data-mova-style="routines-screen-s3"
        >
          <h2
            data-mova-style="routines-screen-s4" style={cssVars({ "--mova-routines-screen-s4-color": cssVar((TEXT), true) })}
          >
            Mis Rutinas
          </h2>
          <button
            onClick={() => go("profile")}
            data-mova-style="routines-screen-s5" style={cssVars({ "--mova-routines-screen-s5-background": cssVar((`linear-gradient(135deg, ${t.accent}, #FFD09A)`), true), "--mova-routines-screen-s5-box-shadow": cssVar((`0 4px 14px ${t.accent}44`), true) })}
          >
            + Planificar
          </button>
        </div>

        {/* Progress bar */}
        <div data-mova-style="routines-screen-s6">
          <div
            data-mova-style="routines-screen-s7"
          >
            <span data-mova-style="routines-screen-s8" style={cssVars({ "--mova-routines-screen-s8-color": cssVar((TEXT_MED), true) })}>
              Progreso de hoy
            </span>
            <span data-mova-style="routines-screen-s9" style={cssVars({ "--mova-routines-screen-s9-color": cssVar((t.accent), true) })}>
              {doneTasks}/{totalTasks} completadas
            </span>
          </div>
          <div
            data-mova-style="routines-screen-s10"
          >
            <div
              data-mova-style="routines-screen-s11" style={cssVars({ "--mova-routines-screen-s11-background": cssVar((`linear-gradient(90deg, ${t.accent}, #FFD09A)`), true), "--mova-routines-screen-s11-width": cssVar((`${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`), true) })}
            />
          </div>
        </div>

        {/* Slots */}
        {SLOT_CONFIG.map((slot) => {
          const tasks = routine[(slot.key as keyof RoutineSlots)]
          const isOpen = openSlot === slot.key
          const isAdding = addingTo === slot.key
          const slotDone = tasks.filter((t) => t.done).length

          return (
            <div key={slot.key} data-mova-style="routines-screen-s12">
              {/* Slot header */}
              <button
                onClick={() => {
                  setOpenSlot(isOpen ? null : slot.key)
                  setAddingTo(null)
                }}
                data-mova-style="routines-screen-s13" style={cssVars({ "--mova-routines-screen-s13-border-radius": cssVar((isOpen ? "18px 18px 0 0" : 18), true), "--mova-routines-screen-s13-border": cssVar((`1.5px solid ${
                    isOpen ? slot.color : "rgba(0,0,0,0.07)"
                  }`), true), "--mova-routines-screen-s13-border-bottom": cssVar((isOpen
                    ? `1.5px solid ${slot.color}30`
                    : undefined), true), "--mova-routines-screen-s13-box-shadow": cssVar((isOpen
                    ? `0 4px 16px ${slot.color}22`
                    : "0 2px 8px rgba(0,0,0,0.05)"), true) })}
              >
                <div
                  data-mova-style="routines-screen-s14" style={cssVars({ "--mova-routines-screen-s14-background": cssVar((`${slot.color}20`), true) })}
                >
                  {slot.emoji}
                </div>
                <div data-mova-style="routines-screen-s15">
                  <div
                    data-mova-style="routines-screen-s16" style={cssVars({ "--mova-routines-screen-s16-color": cssVar((TEXT), true) })}
                  >
                    {slot.label}
                  </div>
                  <div data-mova-style="routines-screen-s17" style={cssVars({ "--mova-routines-screen-s17-color": cssVar((TEXT_MED), true) })}>
                    {slot.from} – {slot.to} · {slotDone}/{tasks.length} hechas
                  </div>
                </div>
                <div data-mova-style="routines-screen-s18">
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      data-mova-style="routines-screen-s19" style={cssVars({ "--mova-routines-screen-s19-background": cssVar((task.done ? task.color : `${task.color}50`), true) })}
                    />
                  ))}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    data-mova-style="routines-screen-s20" style={cssVars({ "--mova-routines-screen-s20-transform": cssVar((isOpen ? "rotate(90deg)" : "none"), true) })}
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke={slot.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Slot body */}
              {isOpen && (
                <div
                  data-mova-style="routines-screen-s21" style={cssVars({ "--mova-routines-screen-s21-border": cssVar((`1.5px solid ${slot.color}`), true) })}
                >
                  {tasks.length === 0 && (
                    <p
                      data-mova-style="routines-screen-s22" style={cssVars({ "--mova-routines-screen-s22-color": cssVar((TEXT_MED), true) })}
                    >
                      Sin tareas. Añade la primera ↓
                    </p>
                  )}
                  {tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      data-mova-style="routines-screen-s23" style={cssVars({ "--mova-routines-screen-s23-border-bottom": cssVar((idx < tasks.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none"), true) })}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleDone(slot.key, task.id)}
                        data-mova-style="routines-screen-s24" style={cssVars({ "--mova-routines-screen-s24-background": cssVar((task.done ? task.color : "transparent"), true), "--mova-routines-screen-s24-border": cssVar((`2px solid ${
                            task.done ? task.color : "rgba(0,0,0,0.18)"
                          }`), true) })}
                      >
                        {task.done && (
                          <svg width="12" height="12" viewBox="0 0 12 12">
                            <path
                              d="M2 6L5 9L10 3"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      <div data-mova-style="routines-screen-s25">
                        <span
                          data-mova-style="routines-screen-s26" style={cssVars({ "--mova-routines-screen-s26-color": cssVar((task.done ? TEXT_MED : TEXT), true), "--mova-routines-screen-s26-text-decoration": cssVar((task.done ? "line-through" : "none"), true) })}
                        >
                          {task.label}
                        </span>
                      </div>

                      {/* Add to plan */}
                      <button
                        onClick={() => addToWeekPlan(task)}
                        title="Añadir a planificación semanal"
                        data-mova-style="routines-screen-s27" style={cssVars({ "--mova-routines-screen-s27-background": cssVar((`${slot.color}18`), true), "--mova-routines-screen-s27-border": cssVar((`1px solid ${slot.color}40`), true), "--mova-routines-screen-s27-color": cssVar((slot.color), true) })}
                      >
                        📅
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeTask(slot.key, task.id)}
                        data-mova-style="routines-screen-s28"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add task row */}
                  <div data-mova-style="routines-screen-s29">
                    {isAdding ? (
                      <div>
                        <div
                          data-mova-style="routines-screen-s30"
                        >
                          <input
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="Nombre de la tarea…"
                            autoFocus
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              customTask.trim() &&
                              addTask(slot.key, customTask.trim(), slot.color)
                            }
                            data-mova-style="routines-screen-s31" style={cssVars({ "--mova-routines-screen-s31-border": cssVar((`1.5px solid ${slot.color}50`), true), "--mova-routines-screen-s31-color": cssVar((TEXT), true) })}
                          />
                          <button
                            onClick={() =>
                              customTask.trim() &&
                              addTask(slot.key, customTask.trim(), slot.color)
                            }
                            data-mova-style="routines-screen-s32" style={cssVars({ "--mova-routines-screen-s32-background": cssVar((slot.color), true) })}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              setAddingTo(null)
                              setCustomTask("")
                            }}
                            data-mova-style="routines-screen-s33" style={cssVars({ "--mova-routines-screen-s33-color": cssVar((TEXT_MED), true) })}
                          >
                            ✕
                          </button>
                        </div>
                        <p
                          data-mova-style="routines-screen-s34" style={cssVars({ "--mova-routines-screen-s34-color": cssVar((TEXT_MED), true) })}
                        >
                          Sugerencias rápidas:
                        </p>
                        <div
                          data-mova-style="routines-screen-s35"
                        >
                          {GENERIC_TASKS.map((gt) => (
                            <button
                              key={gt.label}
                              onClick={() =>
                                addTask(slot.key, gt.label, gt.color)
                              }
                              data-mova-style="routines-screen-s36" style={cssVars({ "--mova-routines-screen-s36-background": cssVar((`${gt.color}18`), true), "--mova-routines-screen-s36-border": cssVar((`1px solid ${gt.color}40`), true), "--mova-routines-screen-s36-color": cssVar((TEXT), true) })}
                            >
                              {gt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTo(slot.key)}
                        data-mova-style="routines-screen-s37" style={cssVars({ "--mova-routines-screen-s37-background": cssVar((`${slot.color}12`), true), "--mova-routines-screen-s37-border": cssVar((`1.5px dashed ${slot.color}50`), true), "--mova-routines-screen-s37-color": cssVar((slot.color), true) })}
                      >
                        + Añadir tarea a {slot.label}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
