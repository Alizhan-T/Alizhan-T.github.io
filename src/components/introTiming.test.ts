import test from "node:test";
import assert from "node:assert/strict";
import {
  INTRO_END_TIME,
  INTRO_FADE_DURATION_MS,
  INTRO_PLAYBACK_RATE,
  INTRO_START_TIME,
  hasReachedIntroEnd,
} from "./introTiming";

test("intro cut constants match exact user specification", () => {
  assert.equal(INTRO_START_TIME, 0);
  assert.equal(INTRO_END_TIME, 4.5);
  assert.equal(INTRO_PLAYBACK_RATE, 1.0);
  assert.equal(INTRO_FADE_DURATION_MS, 500);
});

test("hasReachedIntroEnd triggers cleanly at INTRO_END_TIME = 4.5s", () => {
  assert.equal(hasReachedIntroEnd(0, 10.03), false);
  assert.equal(hasReachedIntroEnd(2.4, 10.03), false);
  assert.equal(hasReachedIntroEnd(4.49, 10.03), false);
  assert.equal(hasReachedIntroEnd(4.5, 10.03), true);
  assert.equal(hasReachedIntroEnd(5.2, 10.03), true);

  // Also ends cleanly if a shorter clip reaches its own end before INTRO_END_TIME
  assert.equal(hasReachedIntroEnd(3.0, 3.02), true);
  assert.equal(hasReachedIntroEnd(NaN, 10.03), false);
});
