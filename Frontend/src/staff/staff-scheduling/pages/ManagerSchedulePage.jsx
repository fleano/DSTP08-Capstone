import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, getWeekStart, toDateKey } from "../scheduleData.js";
import {
  createScheduleShift,
  deleteScheduleShift,
  fetchScheduleShifts,
  fetchStaffAccounts,
  updateScheduleShift,
} from "../scheduleApi.js";
import "./ManagerSchedulePage.css";

const ROLES = ["Server", "Host", "Cleaner", "Cook", "Cashier"];
const EMPTY_SHIFT = {
  date: "",
  startTime: "09:00",
  endTime: "17:00",
  staffId: "",
  role: "Server",
};

const formatWeekday = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const ManagerSchedulePage = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [form, setForm] = useState(EMPTY_SHIFT);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );
  const weekEnd = weekDays[6];
  const weekShifts = shifts.filter(
    (shift) =>
      shift.date >= toDateKey(weekStart) && shift.date <= toDateKey(weekEnd),
  );
  const coveredCount = weekShifts.filter(
    (shift) => shift.staffId != null,
  ).length;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchScheduleShifts(
        toDateKey(weekStart),
        toDateKey(addDays(weekStart, 6)),
      ),
      fetchStaffAccounts(),
    ])
      .then(([loadedShifts, loadedStaff]) => {
        if (cancelled) return;
        setShifts(loadedShifts);
        setStaff(loadedStaff);
      })
      .catch((loadError) => {
        if (!cancelled) setPageError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  async function refreshShifts() {
    const loadedShifts = await fetchScheduleShifts(
      toDateKey(weekStart),
      toDateKey(weekEnd),
    );
    setShifts(loadedShifts);
  }

  function goToWeek(nextWeek) {
    setLoading(true);
    setPageError("");
    setWeekStart(nextWeek);
  }

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
      staffId: shift.staffId == null ? "" : String(shift.staffId),
      role: shift.role,
    });
    setError("");
    setFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.date || form.endTime <= form.startTime) {
      setError("Choose a date and an end time later than the start time.");
      return;
    }

    setSaving(true);
    setError("");
    setPageError("");
    const shift = {
      ...form,
      staffId: form.staffId ? Number(form.staffId) : null,
    };

    try {
      if (editingId) {
        await updateScheduleShift(editingId, shift);
      } else {
        await createScheduleShift(shift);
      }
      await refreshShifts();
      setFormOpen(false);
      setEditingId(null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift(id) {
    setPageError("");
    try {
      await deleteScheduleShift(id);
      setShifts((current) => current.filter((shift) => shift.id !== id));
    } catch (deleteError) {
      setPageError(deleteError.message);
    }
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

      {pageError && (
        <p className="schedule-page-error" role="alert">
          {pageError}
        </p>
      )}

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
                value={form.staffId}
                onChange={(event) =>
                  setForm({ ...form, staffId: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {[member.firstName, member.lastName]
                      .filter(Boolean)
                      .join(" ") || member.username}
                  </option>
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
              <button
                className="schedule-primary-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Create shift"}
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
            onClick={() => goToWeek(addDays(weekStart, -7))}
          >
            ‹
          </button>
          <button
            className="this-week-button"
            onClick={() => goToWeek(getWeekStart(new Date()))}
          >
            This week
          </button>
          <button
            aria-label="Next week"
            onClick={() => goToWeek(addDays(weekStart, 7))}
          >
            ›
          </button>
        </div>
      </section>

      <section className="week-grid" aria-label="Weekly staff shifts">
        {loading ? (
          <p className="schedule-loading" role="status">
            Loading shifts...
          </p>
        ) : (
          weekDays.map((date) => {
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
                      className={`shift-card${shift.staffId != null ? " is-covered" : " is-open"}`}
                      key={shift.id}
                    >
                      <div className="shift-card-topline">
                        <span>
                          {shift.startTime}–{shift.endTime}
                        </span>
                        <span className="shift-status">
                          {shift.staffId != null ? "Covered" : "Open"}
                        </span>
                      </div>
                      <strong>{shift.role}</strong>
                      <span className="shift-assignee">
                        {shift.staff || "Needs staff"}
                      </span>
                      <div className="shift-card-actions">
                        <button onClick={() => openEditForm(shift)}>
                          Edit
                        </button>
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
          })
        )}
      </section>
    </main>
  );
};

export default ManagerSchedulePage;
