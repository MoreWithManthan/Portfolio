import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clampPet,
  clampPicker,
  readPreferences,
  switchCharacter,
} from '../src/lib/neko-state.ts';

test('corrupt and stale preferences recover without disabling companions', () => {
  assert.deepEqual(readPreferences('{broken'), {
    active: 'manthan',
    paused: false,
  });
  assert.deepEqual(readPreferences('{"active":"ram","all":"yes","paused":1}'), {
    active: 'manthan',
    paused: false,
  });
});
test('a saved selection is restored and selecting a character focuses that companion', () => {
  const saved = readPreferences(
    '{"active":"manthan","all":true,"paused":true}',
  );
  assert.equal('all' in saved, false);
  assert.deepEqual(switchCharacter(saved, 'jiya'), {
    active: 'jiya',
    paused: true,
  });
  assert.deepEqual(switchCharacter(saved, 'unknown'), saved);
});
test('dragged pets stay visible after a phone rotation or viewport shrink', () => {
  assert.deepEqual(clampPet({ x: 1000, y: 900 }, { width: 320, height: 568 }), {
    x: 264,
    y: 490,
  });
  assert.deepEqual(clampPet({ x: -30, y: -5 }, { width: 320, height: 568 }), {
    x: 8,
    y: 8,
  });
});
test('the picker fits next to a pet at the bottom-right of a phone', () => {
  assert.deepEqual(
    clampPicker(
      { x: 310, y: 550 },
      { width: 320, height: 568 },
      { width: 288, height: 410 },
    ),
    { x: 24, y: 150 },
  );
});
