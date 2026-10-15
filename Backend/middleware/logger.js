const {
  getQuery,
  runQuery,
} = require("../1-auth/controllers/register.controller");

/**
 * Logs incoming HTTP requests and their response times.
 *
 * Measures the time taken to process each request and
 * logs the HTTP method, URL, status code, and duration.
 *
 * @param {import('express').Request} req Incoming HTTP request.
 * @param {import('express').Response} res Outgoing HTTP response.
 * @param {import('express').NextFunction} next Passes control to the next middleware.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const reset = "\x1b[0m";
    let color = "\x1b[39m"; // Default terminal color
    let label = "INFO";

    if (res.statusCode >= 500) {
      color = "\x1b[31m"; // Red
      label = "ERROR";
    } else if (res.statusCode >= 400) {
      color = "\x1b[33m"; // Yellow
      label = "WARN";
    } else if (res.statusCode >= 300) {
      color = "\x1b[36m"; // Cyan
      label = "REDIRECT";
    } else if (res.statusCode >= 200) {
      color = "\x1b[32m"; // Green
      label = "SUCCESS";
    }

    console.log(
      `${color}[${label}]${reset} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );

    const token = req.get("Authorization");
    const requestAt = Math.floor(Date.now() / 1000);
    const route = req.path.slice(0, 200);
    const accountLookup = token
      ? getQuery("SELECT accountID FROM Session WHERE token = ?", [token])
      : Promise.resolve(null);

    accountLookup
      .then((session) =>
        runQuery(
          `INSERT INTO SystemRequestMetric
                 (requestAt, method, route, statusCode, durationMs, accountID)
                 VALUES (?, ?, ?, ?, ?, ?)`,
          [
            requestAt,
            req.method,
            route,
            res.statusCode,
            duration,
            session?.accountID ?? null,
          ],
        ),
      )
      .catch((error) => {
        console.error("Could not record request metric:", error.message);
      });
  });

  next();
}

module.exports = { requestLogger };
