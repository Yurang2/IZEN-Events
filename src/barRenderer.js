import { getStatusTokens, normalizeStatus } from "./statusMapping.js";

/**
 * 상태 기반 바 렌더링 메타데이터 생성기.
 */
export function renderBar({ id, status, showDelay = false, delayDays = 0, label }) {
  const normalized = normalizeStatus(status);
  const tokens = getStatusTokens(normalized);

  const shouldRenderDelayBar =
    showDelay &&
    delayDays > 0 &&
    (normalized === "completed" || normalized === "in_progress");

  return {
    id,
    label,
    status: normalized,
    bar: {
      style: {
        background: tokens.bar.background,
        color: tokens.bar.text,
        opacity: tokens.bar.opacity,
      },
      badge: {
        style: {
          background: tokens.badge.background,
          color: tokens.badge.text,
          borderColor: tokens.badge.border,
        },
      },
    },
    delayBar: shouldRenderDelayBar
      ? {
          delayDays,
          style: {
            background: tokens.delayBar.background,
            opacity: tokens.delayBar.opacity,
          },
        }
      : null,
  };
}
