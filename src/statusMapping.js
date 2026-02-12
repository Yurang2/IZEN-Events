const STATUS_ALIASES = {
  completed: ["완료", "done", "complete", "completed", "종료"],
  in_progress: ["진행중", "진행 중", "in progress", "doing", "wip"],
  pending: ["대기", "보류", "pending", "todo", "예정"],
  delayed: ["지연", "delay", "delayed", "밀림"],
};

const STATUS_COLORS = {
  completed: "#0F766E",
  in_progress: "#2563EB",
  pending: "#6B7280",
  delayed: "#B91C1C",
};

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

export function normalizeStatus(status) {
  const key = normalizeKey(status);
  for (const [normalized, aliases] of Object.entries(STATUS_ALIASES)) {
    if (aliases.some((alias) => normalizeKey(alias) === key)) {
      return normalized;
    }
  }
  return "pending";
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function relativeLuminance({ r, g, b }) {
  const toLinear = (n) => {
    const v = n / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };

  const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1];
  return (lighter + 0.05) / (darker + 0.05);
}

function getAccessibleTextColor(backgroundHex) {
  const white = "#FFFFFF";
  const black = "#111827";
  return contrastRatio(backgroundHex, white) >= 4.5 ? white : black;
}

export function getStatusTokens(status) {
  const normalized = normalizeStatus(status);
  const color = STATUS_COLORS[normalized];
  const text = getAccessibleTextColor(color);

  return {
    status: normalized,
    bar: {
      background: color,
      opacity: normalized === "pending" ? 0.62 : 0.92,
      text,
    },
    badge: {
      background: color,
      text,
      border: "rgba(17, 24, 39, 0.2)",
    },
    delayBar: {
      background: normalized === "completed" ? "#F59E0B" : "#DC2626",
      opacity: 0.4,
    },
  };
}

export function buildStatusLegend() {
  return [
    { status: "completed", label: "완료", meaning: "계획 범위 내 완료" },
    { status: "in_progress", label: "진행중", meaning: "현재 수행 중" },
    { status: "pending", label: "대기", meaning: "시작 전 / 대기" },
    { status: "delayed", label: "지연", meaning: "계획 대비 지연" },
  ].map((entry) => ({ ...entry, tokens: getStatusTokens(entry.status) }));
}
