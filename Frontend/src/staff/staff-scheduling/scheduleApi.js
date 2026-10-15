const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function scheduleRequest(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: token || "",
      ...options.headers,
    },
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Schedule request failed.");
  }
  return data;
}

export async function fetchScheduleShifts(startDate, endDate) {
  const query = new URLSearchParams({ startDate, endDate });
  const data = await scheduleRequest(`/scheduling/shifts?${query}`);
  return data.shifts || [];
}

export async function fetchStaffAccounts() {
  const data = await scheduleRequest("/auth/admin/users");
  return (data.users || []).filter((account) => Number(account.roleID) === 2);
}

export async function createScheduleShift(shift) {
  return scheduleRequest("/scheduling/shifts", {
    method: "POST",
    body: JSON.stringify(shift),
  });
}

export async function updateScheduleShift(id, shift) {
  return scheduleRequest(`/scheduling/shifts/${id}`, {
    method: "PUT",
    body: JSON.stringify(shift),
  });
}

export async function deleteScheduleShift(id) {
  return scheduleRequest(`/scheduling/shifts/${id}`, { method: "DELETE" });
}

export async function fetchMySchedule(startDate, endDate) {
  const query = new URLSearchParams({ startDate, endDate });
  const data = await scheduleRequest(`/scheduling/my-shifts?${query}`);
  return data.shifts || [];
}
