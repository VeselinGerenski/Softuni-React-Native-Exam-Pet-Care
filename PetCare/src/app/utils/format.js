export function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years <= 0) {
    const m = Math.max(0, months);
    return `${m} month${m === 1 ? "" : "s"}`;
  }
  return `${years} year${years === 1 ? "" : "s"}`;
}

export function getSpeciesEmoji(species) {
  const emojis = {
    Dog: "🐕",
    Cat: "🐈",
    Bird: "🐦",
    Rabbit: "🐰",
    Other: "🐾",
  };
  return emojis[species] || "🐾";
}

export function formatDate(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function toInputDateTime(dateLike) {
  // YYYY-MM-DDTHH:mm (helpful for display / editing)
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function fromInputDateTime(value) {
  // Accepts YYYY-MM-DDTHH:mm or ISO
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}
