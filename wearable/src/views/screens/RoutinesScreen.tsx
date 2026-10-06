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
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        paddingBottom: 80,
        background: t.bg,
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            zIndex: 200,
            background: "#1A1A2E",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ padding: "52px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 24,
              fontWeight: 900,
              margin: 0,
              color: TEXT,
            }}
          >
            Mis Rutinas
          </h2>
          <button
            onClick={() => go("profile")}
            style={{
              background: `linear-gradient(135deg, ${t.accent}, #FFD09A)`,
              border: "none",
              borderRadius: 12,
              padding: "8px 14px",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 14px ${t.accent}44`,
            }}
          >
            + Planificar
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 12, color: TEXT_MED }}>
              Progreso de hoy
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>
              {doneTasks}/{totalTasks} completadas
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              background: "rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg, ${t.accent}, #FFD09A)`,
                width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`,
                transition: "width 0.3s",
              }}
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
            <div key={slot.key} style={{ marginBottom: 12 }}>
              {/* Slot header */}
              <button
                onClick={() => {
                  setOpenSlot(isOpen ? null : slot.key)
                  setAddingTo(null)
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "#fff",
                  borderRadius: isOpen ? "18px 18px 0 0" : 18,
                  border: `1.5px solid ${
                    isOpen ? slot.color : "rgba(0,0,0,0.07)"
                  }`,
                  borderBottom: isOpen
                    ? `1.5px solid ${slot.color}30`
                    : undefined,
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: isOpen
                    ? `0 4px 16px ${slot.color}22`
                    : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${slot.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {slot.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: TEXT,
                    }}
                  >
                    {slot.label}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_MED }}>
                    {slot.from} – {slot.to} · {slotDone}/{tasks.length} hechas
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: task.done ? task.color : `${task.color}50`,
                      }}
                    />
                  ))}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s",
                    }}
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
                  style={{
                    background: "#fff",
                    borderRadius: "0 0 18px 18px",
                    border: `1.5px solid ${slot.color}`,
                    borderTop: "none",
                    padding: "4px 0 14px",
                  }}
                >
                  {tasks.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        color: TEXT_MED,
                        fontSize: 13,
                        padding: "16px 0 8px",
                      }}
                    >
                      Sin tareas. Añade la primera ↓
                    </p>
                  )}
                  {tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        borderBottom:
                          idx < tasks.length - 1
                            ? "1px solid rgba(0,0,0,0.05)"
                            : "none",
                      }}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleDone(slot.key, task.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 7,
                          flexShrink: 0,
                          background: task.done ? task.color : "transparent",
                          border: `2px solid ${
                            task.done ? task.color : "rgba(0,0,0,0.18)"
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
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

                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: 14,
                            color: task.done ? TEXT_MED : TEXT,
                            fontWeight: 600,
                            textDecoration: task.done ? "line-through" : "none",
                          }}
                        >
                          {task.label}
                        </span>
                      </div>

                      {/* Add to plan */}
                      <button
                        onClick={() => addToWeekPlan(task)}
                        title="Añadir a planificación semanal"
                        style={{
                          background: `${slot.color}18`,
                          border: `1px solid ${slot.color}40`,
                          borderRadius: 8,
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: 11,
                          color: slot.color,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        📅
                      </button>

                      {/* Remove */}
                      <button
                        onClick={() => removeTask(slot.key, task.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#F5795A",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: "0 2px",
                          flexShrink: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add task row */}
                  <div style={{ padding: "10px 16px 0" }}>
                    {isAdding ? (
                      <div>
                        <div
                          style={{ display: "flex", gap: 8, marginBottom: 10 }}
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
                            style={{
                              flex: 1,
                              background: "#F5F5F8",
                              border: `1.5px solid ${slot.color}50`,
                              borderRadius: 10,
                              padding: "9px 12px",
                              fontSize: 13,
                              color: TEXT,
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() =>
                              customTask.trim() &&
                              addTask(slot.key, customTask.trim(), slot.color)
                            }
                            style={{
                              background: slot.color,
                              border: "none",
                              borderRadius: 10,
                              padding: "9px 14px",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              setAddingTo(null)
                              setCustomTask("")
                            }}
                            style={{
                              background: "rgba(0,0,0,0.06)",
                              border: "none",
                              borderRadius: 10,
                              padding: "9px 12px",
                              color: TEXT_MED,
                              fontSize: 13,
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: TEXT_MED,
                            margin: "0 0 8px",
                            fontWeight: 600,
                          }}
                        >
                          Sugerencias rápidas:
                        </p>
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                        >
                          {GENERIC_TASKS.map((gt) => (
                            <button
                              key={gt.label}
                              onClick={() =>
                                addTask(slot.key, gt.label, gt.color)
                              }
                              style={{
                                padding: "5px 10px",
                                borderRadius: 16,
                                background: `${gt.color}18`,
                                border: `1px solid ${gt.color}40`,
                                color: TEXT,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {gt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTo(slot.key)}
                        style={{
                          width: "100%",
                          padding: "9px",
                          borderRadius: 10,
                          cursor: "pointer",
                          background: `${slot.color}12`,
                          border: `1.5px dashed ${slot.color}50`,
                          color: slot.color,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
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
