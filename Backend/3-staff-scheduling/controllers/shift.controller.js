const {
  allQuery,
  getQuery,
  runQuery,
} = require("../../1-auth/controllers/register.controller");

const SHIFT_SELECT = `
  SELECT
    StaffShift.id,
    StaffShift.shiftDate AS date,
    StaffShift.startTime,
    StaffShift.endTime,
    ShiftRole.name AS role,
    StaffShift.assignedAccountID AS staffId,
    CASE
      WHEN Account.id IS NULL THEN NULL
      ELSE COALESCE(
        NULLIF(TRIM(COALESCE(Account.firstName, '') || ' ' || COALESCE(Account.lastName, '')), ''),
        Account.username
      )
    END AS staff
  FROM StaffShift
  INNER JOIN ShiftRole ON ShiftRole.id = StaffShift.roleID
  LEFT JOIN Account ON Account.id = StaffShift.assignedAccountID
`;

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function validateShift(body) {
  const { date, startTime, endTime } = body;
  const roleName = typeof body.role === "string" ? body.role.trim() : "";

  if (!isValidDate(date)) {
    return { error: "date must be a valid YYYY-MM-DD date" };
  }
  if (
    !isValidTime(startTime) ||
    !isValidTime(endTime) ||
    endTime <= startTime
  ) {
    return {
      error:
        "startTime and endTime must be valid 24-hour times, with endTime later than startTime",
    };
  }
  if (!roleName) {
    return { error: "role is required" };
  }

  const role = await getQuery(
    "SELECT id, name FROM ShiftRole WHERE name = ? COLLATE NOCASE",
    [roleName],
  );
  if (!role) {
    return { error: `Unknown shift role: ${roleName}` };
  }

  const staffId = body.staffId ?? body.assignedAccountID ?? null;
  if (staffId === "") {
    return { error: "staffId must be a positive staff account ID or null" };
  }
  if (staffId !== null) {
    const accountId = Number(staffId);
    if (!Number.isInteger(accountId) || accountId <= 0) {
      return { error: "staffId must be a positive staff account ID or null" };
    }
    const account = await getQuery(
      "SELECT id FROM Account WHERE id = ? AND roleID = 2",
      [accountId],
    );
    if (!account) {
      return { error: "staffId must refer to an existing staff account" };
    }
  }

  return {
    values: {
      date,
      startTime,
      endTime,
      roleID: role.id,
      staffId: staffId === null ? null : Number(staffId),
    },
  };
}

function addDateFilters(request, conditions, parameters) {
  const { startDate, endDate } = request.query;
  if (startDate !== undefined && !isValidDate(startDate)) {
    return "startDate must be a valid YYYY-MM-DD date";
  }
  if (endDate !== undefined && !isValidDate(endDate)) {
    return "endDate must be a valid YYYY-MM-DD date";
  }
  if (startDate && endDate && startDate > endDate) {
    return "startDate must be on or before endDate";
  }
  if (startDate) {
    conditions.push("StaffShift.shiftDate >= ?");
    parameters.push(startDate);
  }
  if (endDate) {
    conditions.push("StaffShift.shiftDate <= ?");
    parameters.push(endDate);
  }
  return null;
}

function parseShiftId(request) {
  const id = Number(request.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listShifts(request, response, next) {
  const conditions = [];
  const parameters = [];
  const filterError = addDateFilters(request, conditions, parameters);
  if (filterError) {
    return response.status(400).json({ error: filterError });
  }

  try {
    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const shifts = await allQuery(
      `${SHIFT_SELECT} ${whereClause} ORDER BY StaffShift.shiftDate, StaffShift.startTime`,
      parameters,
    );
    return response.status(200).json({ shifts });
  } catch (error) {
    return next(error);
  }
}

async function listMyShifts(request, response, next) {
  const conditions = ["StaffShift.assignedAccountID = ?"];
  const token = request.get("Authorization");
  const parameters = [];

  try {
    const session = await getQuery(
      "SELECT accountID FROM Session WHERE token = ?",
      [token],
    );
    if (!session) {
      return response.status(401).json({ error: "Valid session required" });
    }
    parameters.push(session.accountID);

    const filterError = addDateFilters(request, conditions, parameters);
    if (filterError) {
      return response.status(400).json({ error: filterError });
    }

    const shifts = await allQuery(
      `${SHIFT_SELECT} WHERE ${conditions.join(" AND ")} ORDER BY StaffShift.shiftDate, StaffShift.startTime`,
      parameters,
    );
    return response.status(200).json({ shifts });
  } catch (error) {
    return next(error);
  }
}

async function createShift(request, response, next) {
  try {
    const validation = await validateShift(request.body ?? {});
    if (validation.error) {
      return response.status(400).json({ error: validation.error });
    }

    const { date, startTime, endTime, roleID, staffId } = validation.values;
    const result = await runQuery(
      `INSERT INTO StaffShift (shiftDate, startTime, endTime, roleID, assignedAccountID)
       VALUES (?, ?, ?, ?, ?)`,
      [date, startTime, endTime, roleID, staffId],
    );
    const shift = await getQuery(`${SHIFT_SELECT} WHERE StaffShift.id = ?`, [
      result.id,
    ]);
    return response.status(201).json({ shift });
  } catch (error) {
    return next(error);
  }
}

async function updateShift(request, response, next) {
  const id = parseShiftId(request);
  if (!id) {
    return response
      .status(400)
      .json({ error: "Shift ID must be a positive integer" });
  }

  try {
    const existing = await getQuery("SELECT id FROM StaffShift WHERE id = ?", [
      id,
    ]);
    if (!existing) {
      return response.status(404).json({ error: "Shift not found" });
    }

    const validation = await validateShift(request.body ?? {});
    if (validation.error) {
      return response.status(400).json({ error: validation.error });
    }

    const { date, startTime, endTime, roleID, staffId } = validation.values;
    await runQuery(
      `UPDATE StaffShift
       SET shiftDate = ?, startTime = ?, endTime = ?, roleID = ?, assignedAccountID = ?
       WHERE id = ?`,
      [date, startTime, endTime, roleID, staffId, id],
    );
    const shift = await getQuery(`${SHIFT_SELECT} WHERE StaffShift.id = ?`, [
      id,
    ]);
    return response.status(200).json({ shift });
  } catch (error) {
    return next(error);
  }
}

async function deleteShift(request, response, next) {
  const id = parseShiftId(request);
  if (!id) {
    return response
      .status(400)
      .json({ error: "Shift ID must be a positive integer" });
  }

  try {
    const result = await runQuery("DELETE FROM StaffShift WHERE id = ?", [id]);
    if (result.changes === 0) {
      return response.status(404).json({ error: "Shift not found" });
    }
    return response.status(200).json({ message: "Shift deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createShift,
  deleteShift,
  listMyShifts,
  listShifts,
  updateShift,
};
