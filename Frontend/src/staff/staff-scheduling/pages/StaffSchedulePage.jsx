import { useState } from "react";
import {
  addDays,
  getInitialShifts,
  getWeekStart,
  toDateKey,
} from "../scheduleData.js";
import "./StaffSchedulePage.css";

const StaffSchedulePage = ({ user, onBack }) => {
  const [shifts] = useState(getInitialShifts);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const weekEnd = addDays(weekStart, 6);
  const displayName = user?.name || user?.username || "Staff member";
  const assignedShifts = shifts
    .filter(
      (shift) =>
        shift.staff?.toLocaleLowerCase() === displayName.toLocaleLowerCase() &&
        shift.date >= toDateKey(weekStart) &&
        shift.date <= toDateKey(weekEnd),
    )
    .sort(
      (first, second) =>
        first.date.localeCompare(second.date) ||
        first.startTime.localeCompare(second.startTime),
    );

  return (
    <main className="staff-schedule-page">
      <header className="staff-schedule-header">
        <button className="staff-back-button" onClick={onBack}>
          ← Staff dashboard
        </button>
        <p className="staff-schedule-eyebrow">TEAM / MY SHIFTS</p>
        <h1>My schedule</h1>
        <p>{displayName}</p>
      </header>

      <section className="staff-week-toolbar">
        <div>
          <h2>
            {weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {" - "}
            {weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <span>
            {assignedShifts.length} assigned{" "}
            {assignedShifts.length === 1 ? "shift" : "shifts"}
          </span>
        </div>
        <div className="staff-week-controls">
          <button
            aria-label="Previous week"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            ‹
          </button>
          <button onClick={() => setWeekStart(getWeekStart(new Date()))}>
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

      {assignedShifts.length ? (
        <section className="staff-shift-list" aria-label="Your shifts">
          {assignedShifts.map((shift) => (
            <article className="staff-shift-row" key={shift.id}>
              <div className="staff-shift-date">
                <strong>
                  {new Date(`${shift.date}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { weekday: "short" },
                  )}
                </strong>
                <span>
                  {new Date(`${shift.date}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" },
                  )}
                </span>
              </div>
              <div className="staff-shift-details">
                <strong>{shift.role}</strong>
                <span>
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
              <span className="staff-shift-confirmed">Assigned</span>
            </article>
          ))}
        </section>
      ) : (
        <section className="staff-schedule-empty">
          <h2>No shifts assigned this week</h2>
          <p>
            Your manager has not assigned any shifts to {displayName} for this
            week.
          </p>
        </section>
      )}
    </main>
  );
};

export default StaffSchedulePage;
