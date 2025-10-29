function toDisplayDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function toIsoDate(display: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!m) return null;
  const dd = Number(m[1]),
    mm = Number(m[2]),
    yyyy = Number(m[3]);
  if (!Number.isFinite(dd) || !Number.isFinite(mm) || !Number.isFinite(yyyy))
    return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
    2,
    "0"
  )}`;
}

function hoursToHHmm(h: number | undefined) {
  if (!Number.isFinite(h)) return "";
  const total = Math.max(0, Math.min(24, Number(h)));
  const hours = Math.floor(total);
  const minutes = Math.round((total - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function hoursAndMinutesInLabels(h: number | undefined) {
  if (!Number.isFinite(h)) return "";

  const clamped = Math.max(0, Math.min(24, Number(h)));

  let totalMinutes = Math.round(clamped * 60);
  const MAX_MINUTES = 24 * 60;
  if (totalMinutes > MAX_MINUTES) totalMinutes = MAX_MINUTES;

  let hours = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;

  if (hours === 24) minutes = 0;

  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  const hLabel = hours === 1 ? "hora" : "horas";
  const mLabel = minutes === 1 ? "minuto" : "minutos";

  return `${hStr} ${hLabel} e ${mStr} ${mLabel}`;
}


function hhmmToHours(s: string) {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 24) return null;
  if (h === 24 && min !== 0) return null;
  return h + min / 60;
}

const LIMIT_MS = 24 * 60 * 60 * 1000;

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function splitHHMMSS(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;
  return { hh, mm, ss };
}
function msToHoursDecimal(ms: number) {
  const h = ms / 3600000;
  return Math.max(0, Math.min(24, Number(h.toFixed(2))));
}
function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatCreatedAt(v: any) {
  if (!v) return "—";
  if (typeof v === "object" && v?.seconds != null) {
    return new Date(v.seconds * 1000).toLocaleDateString("pt-BR");
  }
  if (typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
  }
  return "—";
}


export {
  toDisplayDate,
  toIsoDate,
  hoursToHHmm,
  hhmmToHours,
  LIMIT_MS,
  pad,
  splitHHMMSS,
  msToHoursDecimal,
  todayIso,
  formatCreatedAt,
  hoursAndMinutesInLabels
};
