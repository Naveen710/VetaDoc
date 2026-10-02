import { test } from 'node:test';
import assert from 'node:assert';
import { buildSchedule, remindersDue, milkSafeDate } from './vaccineSchedules.js';

const today = new Date('2026-10-02T00:00:00Z');

test('adult dog: annual boosters follow the last dose', () => {
  const s = buildSchedule({ species: 'dog', age: 4, vaccinations: [{ name: 'Rabies', date: '2025-09-15' }] }, today);
  const rabies = s.find(i => i.id === 'rabies-annual');
  assert.equal(rabies.dueDate, '2026-09-15');
  assert.equal(rabies.status, 'overdue');
});

test('puppy: primary series is spaced from date of birth', () => {
  const s = buildSchedule({ species: 'dog', dob: '2026-08-20', vaccinations: [] }, today);
  assert.equal(s.find(i => i.id === 'dhppil-2').dueDate, '2026-10-22');
  assert.equal(s.find(i => i.id === 'rabies-1').dueDate, '2026-11-12');
  // booster never before 1 year of age
  assert.ok(s.find(i => i.id === 'rabies-annual').dueDate >= '2027-08-20');
});

test('matching is by word, not substring ("pet" is not ET)', () => {
  const s = buildSchedule({ species: 'goat', age: 2, vaccinations: [{ name: 'Petrol check', date: '2026-05-01' }] }, today);
  assert.equal(s.find(i => i.id === 'et').lastGiven, null);
});

test('brucella only for female calves', () => {
  const m = buildSchedule({ species: 'cattle', dob: '2026-06-01', gender: 'Male' }, today);
  const f = buildSchedule({ species: 'cattle', dob: '2026-06-01', gender: 'Female' }, today);
  assert.ok(!m.some(i => i.id === 'brucella'));
  assert.ok(f.some(i => i.id === 'brucella'));
});

test('reminders include overdue and due-within-window items', () => {
  const r = remindersDue({ species: 'cat', age: 3, vaccinations: [{ name: 'FVRCP', date: '2025-10-05' }] }, today, 7);
  assert.ok(r.some(i => i.id === 'fvrcp-annual'));
});

test('milk withdrawal date', () => {
  assert.equal(milkSafeDate('2026-10-01', 4), '2026-10-05');
});
