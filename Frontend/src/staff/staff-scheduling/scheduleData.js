const STORAGE_KEY = "restaurant_schedule_shifts";

export function getWeekStart(date) {
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  const dayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dayOffset);
  return start;
}

export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getInitialShifts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const monday = getWeekStart(new Date());
  return [
    {
      id: "demo-1",
      date: toDateKey(monday),
      startTime: "09:00",
      endTime: "15:00",
      staff: "Maya Chen",
      role: "Host",
    },
    {
      id: "demo-2",
      date: toDateKey(monday),
      startTime: "11:00",
      endTime: "18:00",
      staff: "Luis Ortega",
      role: "Server",
    },
    {
      id: "demo-3",
      date: toDateKey(addDays(monday, 1)),
      startTime: "10:00",
      endTime: "16:00",
      staff: "",
      role: "Cleaner",
    },
    {
      id: "demo-4",
      date: toDateKey(addDays(monday, 2)),
      startTime: "12:00",
      endTime: "20:00",
      staff: "Sofia Patel",
      role: "Cook",
    },
    {
      id: "demo-5",
      date: toDateKey(addDays(monday, 4)),
      startTime: "15:00",
      endTime: "22:00",
      staff: "Avery Johnson",
      role: "Server",
    },
    {
      id: "demo-6",
      date: toDateKey(addDays(monday, 5)),
      startTime: "08:00",
      endTime: "14:00",
      staff: "",
      role: "Cashier",
    },
  ];
}

export function saveShifts(shifts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
}
