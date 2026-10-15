import Calendar from "react-calendar";
import { useState } from "react";

export const CalendarSchedule = ({ user }) => {
  const [value, onChange] = useState(new Date());
  return (
    <div>
      <h2 style={{ color: "#f7d070", marginBottom: "1.5rem" }}>
        Staff Calendar & Shift Schedule
      </h2>
      <div className="contact-container">
        <p>
          📅 View your upcoming shifts.{" "}
          {user.role === "manager" &&
            "(Manager mode: You can assign or edit shifts here)"}
        </p>
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#3d2222",
            borderRadius: "6px",
          }}
        >
          <h4>This Week's Shifts</h4>
          <p>Monday - Friday: 10:00 AM - 4:00 PM (Server Shift)</p>
          {/*add calendar element here*/}
          <div>
            <Calendar onChange={onChange} value={value} />
          </div>
        </div>
      </div>
    </div>
  );
};
