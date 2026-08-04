export function formatAirdate(airdate: string) {
  const date = new Date(`${airdate}T00:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
