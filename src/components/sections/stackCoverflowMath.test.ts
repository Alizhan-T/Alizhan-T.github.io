import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ACTIVE_STACK_INDEX,
  DESKTOP_ORBIT_CONFIG,
  TECH_STACK_CARDS,
  computeCardTilt,
  computeOrbitPose,
  getFrontCardIndex,
  shortestAngleDelta,
  targetPhaseForIndex,
} from "./stackCoverflowMath";

test("tech stack catalog has exactly 6 cards in requested order with Flutter default", () => {
  assert.equal(TECH_STACK_CARDS.length, 6);
  assert.deepEqual(
    TECH_STACK_CARDS.map((c) => c.name),
    ["Python", "Swift", "Node.js", "Flutter", "Solidity", "Docker"],
  );
  assert.equal(TECH_STACK_CARDS[DEFAULT_ACTIVE_STACK_INDEX].name, "Flutter");
  assert.equal(TECH_STACK_CARDS[DEFAULT_ACTIVE_STACK_INDEX].role, "MOBILE");
});

test("targetPhaseForIndex places Flutter dead-front with staggered visible flanks and opaque cards", () => {
  const count = TECH_STACK_CARDS.length;
  const flutterPhase = targetPhaseForIndex(DEFAULT_ACTIVE_STACK_INDEX, count);
  assert.equal(getFrontCardIndex(flutterPhase, count), DEFAULT_ACTIVE_STACK_INDEX);

  const front = computeOrbitPose(3, count, flutterPhase, DESKTOP_ORBIT_CONFIG);
  assert.equal(front.isFront, true);
  assert.equal(front.x, 0);
  assert.equal(front.rotateY, 0);
  assert.equal(front.scale, 1.08);
  assert.equal(front.brightness, 1);
  assert.equal(front.opacity, 1);
  assert.equal(front.zIndex, 100);

  // Front-right (+60deg) vs Back-right (+120deg): outer flank sits further out so cards don't overlap directly
  const frontRight = computeOrbitPose(4, count, flutterPhase, DESKTOP_ORBIT_CONFIG);
  const backRight = computeOrbitPose(5, count, flutterPhase, DESKTOP_ORBIT_CONFIG);
  assert.ok(frontRight.x > 0);
  assert.ok(backRight.x > frontRight.x + 80);
  assert.ok(frontRight.z > backRight.z);
  assert.equal(frontRight.opacity, 1);
  assert.equal(backRight.opacity, 1);
  assert.ok(frontRight.rotateY < 0); // Right side angles inward left

  // Front-left (-60deg) mirrors front-right cleanly
  const frontLeft = computeOrbitPose(2, count, flutterPhase, DESKTOP_ORBIT_CONFIG);
  assert.ok(frontLeft.x < 0);
  assert.ok(Math.abs(frontLeft.x + frontRight.x) < 0.05);
  assert.ok(frontLeft.rotateY > 0); // Left side angles inward right
});

test("continuous phase revolution cycles cleanly through all 6 cards and shortestAngleDelta takes minimal arc", () => {
  const count = TECH_STACK_CARDS.length;
  const step = (Math.PI * 2) / count;
  const startPhase = targetPhaseForIndex(3, count);

  // Stepping negative phase brings next card (index 4: Solidity) to dead front
  assert.equal(getFrontCardIndex(startPhase - step, count), 4);
  assert.equal(getFrontCardIndex(startPhase - step * 2, count), 5);
  assert.equal(getFrontCardIndex(startPhase - step * 3, count), 0);

  // Shortest delta across the -PI/+PI wrap seam stays within [-PI, PI]
  const delta = shortestAngleDelta(Math.PI - 0.2, -Math.PI + 0.2);
  assert.ok(Math.abs(delta - 0.4) < 1e-6);
});

test("computeCardTilt maps center to zero and clamps extreme edges cleanly", () => {
  const rect = { left: 100, top: 200, width: 180, height: 300 };

  const center = computeCardTilt(190, 350, rect, 10);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);
  assert.equal(center.glareX, 50);
  assert.equal(center.glareY, 50);

  const topRightOutside = computeCardTilt(999, -500, rect, 10);
  assert.equal(topRightOutside.rotateX, 10);
  assert.equal(topRightOutside.rotateY, 10);
  assert.equal(topRightOutside.glareX, 100);
  assert.equal(topRightOutside.glareY, 0);
});
