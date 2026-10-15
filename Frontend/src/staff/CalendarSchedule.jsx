import Calendar from "react-calendar";
import { useState, useEffect } from "react";

import 'react-calendar/dist/Calendar.css';
//import './CalendarStyles.css';

export const CalendarSchedule = ({ user }) => {
  const [value, onChange] = useState(new Date());
  const [calendarSchedule, setCalendarSchedule] = useState(new Array()); //pull the schedule and store it here
  const [upcomingEvents, setUpcomingEvents] = useState();
  const [editNoteDialogVisibility, setEditNoteDialogVisibility] = useState(false);
  const [editCurrentNoteDetails, setEditCurrentNoteDetails] = useState([]);
  const [tileClassName, setTileClassName] = useState(null);
  const [noteSubmitted, setnoteSubmitted] = useState();

  const [formData, setFormData] = useState({
    date: '',
    note: '',
  });

  async function getSchedule() {
    //e.preventDefault();
    /// Retrieve the stored JWT token
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
      const scheduleDataJSON = {}

      for (let i = 0; i < scheduleData.schedule.length; i++) {
        let key = scheduleData.schedule[i].date
        scheduleDataJSON[key] = scheduleData.schedule[i].note
      }
      console.log(scheduleDataJSON)
      setCalendarSchedule(scheduleDataJSON)
      //use state won't update until rerender, it's intended
      //add events to string diplay
      let upcomingEvents = []
      for (let day in scheduleDataJSON) {
        console.log(day, Date.now() / 1000 - 86400, scheduleDataJSON[day])
        if (day >= Date.now() / 1000 - 86400) {
          const readableDate = new Date(day * 1000).toLocaleDateString("en-UK")
          console.log("upcomingevents", `${readableDate}: ${scheduleDataJSON[day]}`)
          upcomingEvents.push(`${readableDate}: ${scheduleDataJSON[day]}`);
        }
      }
      //send the array down
      setUpcomingEvents(upcomingEvents)
    }
  }
  useEffect(() => {
    getSchedule()

  }, [])

  //on pressing a day button
  function editDayNote(day) {
    const date = new Date(day).getTime()
    setEditNoteDialogVisibility(true);

    //update the dialogs with note details if any
    setEditCurrentNoteDetails({ date: date, readableDate: new Date(day).toLocaleDateString("en-UK") })
    console.log("Edit currentnote date:", editCurrentNoteDetails)
  }
  //handle changed fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  //handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's default page reload
    if (formData.note == "") {
      setnoteSubmitted("Note cannot be blank")
      return false;
    }
    formData.date = editCurrentNoteDetails.date / 1000
    try {
      // Retrieve the stored JWT token
      console.log(formData)
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/scheduling/addNote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": token ? token : ""
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setnoteSubmitted("Note submission failed")
        throw new Error(`Request failed with status ${response.status}`);
      }
      const result = await response.json();
      setFormData({ date: formData.date, note: "" })
      setnoteSubmitted("Note submitted successfully!")
    }
    catch (error) {
      setnoteSubmitted("Note submission failed")
    }
  };

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
          {/*Upcoming Events*/}
          <h4>Upcoming Events</h4>
          <p>{Array.isArray(upcomingEvents) ? upcomingEvents.map((line, index) => (<li key={index}>{line}</li>))
            : "There are no upcoming events."
          }</p>
          {/*add calendar element here*/}
          <h3>Click a date to add/edit a note</h3>
          <div>
            <Calendar tileClassName={tileClassName} onChange={onChange} value={value}
              onClickDay={(value, event) => editDayNote(value)} />
          </div>
          <div hidden={!editNoteDialogVisibility}>
            <br></br>
            <br></br>
            <button onClick={(event) => setEditNoteDialogVisibility(false)}>X</button>
            <br></br>
            <br></br>
            <form onSubmit={handleSubmit}>
              Date: {editCurrentNoteDetails.readableDate}<input name="date" value={editCurrentNoteDetails.date} hidden={true}></input> <br></br><br></br>Note:<br></br>
              <textarea name="note" value={formData.note} rows="4" cols="40" onChange={handleChange}></textarea>
              <button type="Submit">Add Note</button>
              <div>{noteSubmitted}</div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
