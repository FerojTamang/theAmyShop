export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
