import assert from "node:assert/strict";
import { buildStatusLegend, getStatusTokens, normalizeStatus } from "../src/statusMapping.js";
import { renderBar } from "../src/barRenderer.js";

assert.equal(normalizeStatus("완료"), "completed");
assert.equal(normalizeStatus("진행 중"), "in_progress");
assert.equal(normalizeStatus("unknown"), "pending");

const completed = getStatusTokens("completed");
assert.ok(["#FFFFFF", "#111827"].includes(completed.bar.text));
assert.equal(completed.bar.opacity, 0.92);

const pending = getStatusTokens("pending");
assert.equal(pending.bar.opacity, 0.62);

const legend = buildStatusLegend();
assert.equal(legend.length, 4);
assert.deepEqual(
  legend.map((item) => item.status),
  ["completed", "in_progress", "pending", "delayed"],
);

const delayOnCompleted = renderBar({
  id: "A",
  label: "Task A",
  status: "완료",
  showDelay: true,
  delayDays: 2,
});
assert.ok(delayOnCompleted.delayBar, "완료 + showDelay=true should render delay bar");

const delayOnPending = renderBar({
  id: "B",
  label: "Task B",
  status: "대기",
  showDelay: true,
  delayDays: 3,
});
assert.equal(delayOnPending.delayBar, null, "대기 상태는 보조 막대 비표시");

console.log("status mapping tests passed");
