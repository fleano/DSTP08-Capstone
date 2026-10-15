import Calendar from "react-calendar";
import { useState, useEffect } from "react";

export const CalendarSchedule = ({ user }) => {
  const [value, onChange] = useState(new Date());
  const [calendarSchedule, setCalendarSchedule] = useState(new Array()); //pull the schedule and store it here

  async function getSchedule() {
    //e.preventDefault();
    // Retrieve the stored JWT token
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scheduling/getSchedule`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? token : ""
      }
    });
    if (response.ok) {
      const scheduleData = await response.json();
      setCalendarSchedule(scheduleData)
      console.log(scheduleData)
      console.log(calendarSchedule) //use state won't update until rerender, it's intended
    }
  }
  useEffect(() => {
    getSchedule()
  }, [])

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
