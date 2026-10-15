export function BarChart({
  title,
  data,
  labelKey,
  valueKey,
  formatValue = (value) => value,
}) {
  const maxValue =
    Math.max(0, ...data.map((row) => Math.abs(Number(row[valueKey]) || 0))) ||
    1;

  return (
    <section className="analytics-chart" aria-label={title}>
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p className="analytics-empty">No data in this date range.</p>
      ) : (
        <div className="analytics-bars">
          {data.map((row) => {
            const value = Number(row[valueKey]) || 0;
            return (
              <div className="analytics-bar-row" key={row[labelKey]}>
                <span className="analytics-bar-label" title={row[labelKey]}>
                  {row[labelKey]}
                </span>
                <span className="analytics-bar-track">
                  <span
                    className={`analytics-bar-fill${value < 0 ? " is-negative" : ""}`}
                    style={{
                      width: `${Math.max(value !== 0 ? 2 : 0, (Math.abs(value) / maxValue) * 100)}%`,
                    }}
                  />
                </span>
                <strong className="analytics-bar-value">
                  {formatValue(value)}
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function TrendChart({
  title,
  data,
  valueKey,
  formatValue = (value) => value,
}) {
  const width = 720;
  const height = 210;
  const inset = 18;
  const maxValue =
    Math.max(0, ...data.map((row) => Number(row[valueKey]) || 0)) || 1;
  const points = data.map((row, index) => {
    const x =
      data.length === 1
        ? width / 2
        : inset + (index / (data.length - 1)) * (width - inset * 2);
    const y =
      height -
      inset -
      ((Number(row[valueKey]) || 0) / maxValue) * (height - inset * 2);
    return { x, y, row };
  });

  return (
    <section className="analytics-chart analytics-trend" aria-label={title}>
      <h3>{title}</h3>
      {data.length === 0 ? (
        <p className="analytics-empty">No data in this date range.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1={inset}
                x2={width - inset}
                y1={height - inset - fraction * (height - inset * 2)}
                y2={height - inset - fraction * (height - inset * 2)}
                className="analytics-gridline"
              />
            ))}
            {points.length > 1 && (
              <polyline
                points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
                className="analytics-trend-line"
              />
            )}
            {points.map(({ x, y, row }) => (
              <circle
                key={row.date}
                cx={x}
                cy={y}
                r="4"
                className="analytics-trend-dot"
              >
                <title>{`${row.date}: ${formatValue(Number(row[valueKey]) || 0)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="analytics-trend-labels">
            <span>{data[0].date}</span>
            <span>{data[data.length - 1].date}</span>
          </div>
        </>
      )}
    </section>
  );
}
