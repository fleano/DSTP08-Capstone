import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDays,
  getInitialShifts,
  getWeekStart,
  saveShifts,
  toDateKey,
} from "../scheduleData.js";
import "./ManagerSchedulePage.css";

const ROLES = ["Server", "Host", "Cleaner", "Cook", "Cashier"];
const STAFF = [
  "Maya Chen",
  "Luis Ortega",
  "Avery Johnson",
  "Sofia Patel",
  "Noah Williams",
  "Emma Thompson",
];

const EMPTY_SHIFT = {
  date: "",
  startTime: "09:00",
  endTime: "17:00",
  staff: "",
  role: "Server",
};

const formatWeekday = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const ManagerSchedulePage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState(getInitialShifts);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [form, setForm] = useState(EMPTY_SHIFT);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );
  const weekEnd = weekDays[6];
  const weekShifts = shifts.filter(
    (shift) =>
      shift.date >= toDateKey(weekStart) && shift.date <= toDateKey(weekEnd),
  );
  const coveredCount = weekShifts.filter((shift) => shift.staff).length;

  useEffect(() => {
    saveShifts(shifts);
  }, [shifts]);

  function openCreateForm(date = toDateKey(weekStart)) {
    setEditingId(null);
    setForm({ ...EMPTY_SHIFT, date });
    setError("");
    setFormOpen(true);
  }

  function openEditForm(shift) {
    setEditingId(shift.id);
    setForm({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      staff: shift.staff,
      role: shift.role,
    });
    setError("");
    setFormOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.date || form.endTime <= form.startTime) {
      setError("Choose a date and an end time later than the start time.");
      return;
    }

    if (editingId) {
      setShifts((current) =>
        current.map((shift) =>
          shift.id === editingId ? { ...shift, ...form } : shift,
        ),
      );
    } else {
      setShifts((current) => [
        ...current,
        { ...form, id: `shift-${Date.now()}` },
      ]);
    }
    setFormOpen(false);
    setEditingId(null);
  }

  function deleteShift(id) {
    setShifts((current) => current.filter((shift) => shift.id !== id));
  }

  function formatWeekRange() {
    const options = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-US", options)} - ${weekEnd.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
  }

  return (
    <main className="schedule-page">
      <header className="schedule-header">
        <div>
          <p className="schedule-eyebrow">STAFFING / WEEKLY PLAN</p>
          <h1>Shift schedule</h1>
          <p className="schedule-intro">
            Build the week, assign the team, and spot uncovered shifts.
          </p>
        </div>
        <div className="schedule-header-actions">
          <button
            className="schedule-secondary-button"
            onClick={() => navigate("/staff")}
          >
            Home
          </button>
          <button
            className="schedule-primary-button"
            onClick={() => openCreateForm()}
          >
            <span aria-hidden="true">+</span> Add shift
          </button>
        </div>
      </header>

      <section
        className="schedule-summary"
        aria-label="Weekly coverage summary"
      >
        <div>
          <span className="summary-label">Shifts this week</span>
          <strong>{weekShifts.length}</strong>
        </div>
        <div>
          <span className="summary-label">Covered</span>
          <strong>{coveredCount}</strong>
        </div>
        <div
          className={
            weekShifts.length > coveredCount ? "summary-alert" : "summary-ok"
          }
        >
          <span className="summary-label">Need coverage</span>
          <strong>{weekShifts.length - coveredCount}</strong>
        </div>
      </section>

      {formOpen && (
        <section
          className="shift-form-panel"
          aria-labelledby="shift-form-title"
        >
          <div className="shift-form-heading">
            <h2 id="shift-form-title">
              {editingId ? "Edit shift" : "New shift"}
            </h2>
            <button
              className="schedule-close-button"
              type="button"
              aria-label="Close shift form"
              onClick={() => setFormOpen(false)}
            >
              ×
            </button>
          </div>
          <form className="shift-form" onSubmit={handleSubmit}>
            <label>
              Date
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
              />
            </label>
            <label>
              Start
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm({ ...form, startTime: event.target.value })
                }
              />
            </label>
            <label>
              End
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm({ ...form, endTime: event.target.value })
                }
              />
            </label>
            <label>
              Role
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value })
                }
              >
                {ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label>
              Assign staff
              <select
                value={form.staff}
                onChange={(event) =>
                  setForm({ ...form, staff: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {STAFF.map((member) => (
                  <option key={member}>{member}</option>
                ))}
              </select>
            </label>
            {error && (
              <p className="schedule-form-error" role="alert">
                {error}
              </p>
            )}
            <div className="shift-form-actions">
              <button
                className="schedule-secondary-button"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button className="schedule-primary-button" type="submit">
                {editingId ? "Save changes" : "Create shift"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="week-toolbar" aria-label="Week navigation">
        <div>
          <h2>{formatWeekRange()}</h2>
          <span>Monday to Sunday</span>
        </div>
        <div className="week-controls">
          <button
            aria-label="Previous week"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ‹
          </button>
          <button
            className="this-week-button"
            onClick={() => setWeekStart(getWeekStart(new Date()))}
          >
            This week
          </button>
          <button
            aria-label="Next week"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            ›
          </button>
        </div>
      </section>

      <section className="week-grid" aria-label="Weekly staff shifts">
        {weekDays.map((date) => {
          const dateKey = toDateKey(date);
          const dayShifts = weekShifts
            .filter((shift) => shift.date === dateKey)
            .sort((first, second) =>
              first.startTime.localeCompare(second.startTime),
            );
          const isToday = dateKey === toDateKey(new Date());

          return (
            <section
              className={`week-day${isToday ? " is-today" : ""}`}
              key={dateKey}
            >
              <header className="week-day-header">
                <span>{formatWeekday(date)}</span>
                <strong>{date.getDate()}</strong>
              </header>
              <div className="day-shifts">
                {dayShifts.map((shift) => (
                  <article
                    className={`shift-card${shift.staff ? " is-covered" : " is-open"}`}
                    key={shift.id}
                  >
                    <div className="shift-card-topline">
                      <span>
                        {shift.startTime}–{shift.endTime}
                      </span>
                      <span className="shift-status">
                        {shift.staff ? "Covered" : "Open"}
                      </span>
                    </div>
                    <strong>{shift.role}</strong>
                    <span className="shift-assignee">
                      {shift.staff || "Needs staff"}
                    </span>
                    <div className="shift-card-actions">
                      <button onClick={() => openEditForm(shift)}>Edit</button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        aria-label={`Delete ${shift.role} shift`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
                {dayShifts.length === 0 && (
                  <p className="empty-day">No shifts</p>
                )}
              </div>
              <button
                className="add-day-shift"
                onClick={() => openCreateForm(dateKey)}
              >
                <span aria-hidden="true">+</span> Add shift
              </button>
            </section>
          );
        })}
      </section>
    </main>
  );
};

export default ManagerSchedulePage;
