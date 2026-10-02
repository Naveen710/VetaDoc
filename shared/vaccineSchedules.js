// ═══════════════════════════════════════════════════
// VetaDoc — Species vaccination & deworming schedules
// Shared by the web app and Cloud Functions (reminders).
//
// Schedules reflect common Indian veterinary practice. They are a
// planning aid, not a prescription: the treating vet can always
// override a date, and the record is what counts.
// ═══════════════════════════════════════════════════

const DAY = 24 * 60 * 60 * 1000;

/**
 * Each item:
 *  - kind: 'primary' (dose N of a puppy/kitten/calf series, offset from birth)
 *          'repeat'  (every `everyDays` after the last record, first at `firstAtDays`)
 *          'seasonal'(once a year before monsoon, by `month`/`day`)
 *  - match: words that identify this vaccine in a free-text record
 *  - sex: optional 'Female' restriction
 */
export const SCHEDULES = {
  dog: [
    { id: 'dhppil-1', name: 'DHPPiL (dose 1)', kind: 'primary', atDays: 42, match: ['dhpp', 'dhppi', 'dhppil', 'distemper', 'parvo'], dose: 1 },
    { id: 'dhppil-2', name: 'DHPPiL (dose 2)', kind: 'primary', atDays: 63, match: ['dhpp', 'dhppi', 'dhppil', 'distemper', 'parvo'], dose: 2 },
    { id: 'dhppil-3', name: 'DHPPiL (dose 3)', kind: 'primary', atDays: 84, match: ['dhpp', 'dhppi', 'dhppil', 'distemper', 'parvo'], dose: 3 },
    { id: 'rabies-1', name: 'Anti-rabies (primary)', kind: 'primary', atDays: 84, match: ['rabies', 'arv'], dose: 1 },
    { id: 'dhppil-annual', name: 'DHPPiL booster', kind: 'repeat', firstAtDays: 365, everyDays: 365, match: ['dhpp', 'dhppi', 'dhppil', 'distemper', 'parvo'] },
    { id: 'rabies-annual', name: 'Anti-rabies booster', kind: 'repeat', firstAtDays: 365, everyDays: 365, match: ['rabies', 'arv'] },
    { id: 'kc-annual', name: 'Kennel cough (optional)', kind: 'repeat', firstAtDays: 112, everyDays: 365, match: ['bordetella', 'kennel'] },
    { id: 'deworm', name: 'Deworming', kind: 'repeat', firstAtDays: 14, everyDays: 90, match: ['deworm', 'praziquantel', 'fenbendazole', 'pyrantel'], type: 'deworming' },
  ],
  cat: [
    { id: 'fvrcp-1', name: 'FVRCP (dose 1)', kind: 'primary', atDays: 56, match: ['fvrcp', 'tricat', 'feline'], dose: 1 },
    { id: 'fvrcp-2', name: 'FVRCP (dose 2)', kind: 'primary', atDays: 84, match: ['fvrcp', 'tricat', 'feline'], dose: 2 },
    { id: 'fvrcp-3', name: 'FVRCP (dose 3)', kind: 'primary', atDays: 112, match: ['fvrcp', 'tricat', 'feline'], dose: 3 },
    { id: 'rabies-1', name: 'Anti-rabies (primary)', kind: 'primary', atDays: 84, match: ['rabies', 'arv'], dose: 1 },
    { id: 'fvrcp-annual', name: 'FVRCP booster', kind: 'repeat', firstAtDays: 365, everyDays: 365, match: ['fvrcp', 'tricat', 'feline'] },
    { id: 'rabies-annual', name: 'Anti-rabies booster', kind: 'repeat', firstAtDays: 365, everyDays: 365, match: ['rabies', 'arv'] },
    { id: 'deworm', name: 'Deworming', kind: 'repeat', firstAtDays: 21, everyDays: 90, match: ['deworm', 'praziquantel', 'pyrantel'], type: 'deworming' },
  ],
  cattle: [
    { id: 'fmd', name: 'FMD (foot-and-mouth)', kind: 'repeat', firstAtDays: 120, everyDays: 182, match: ['fmd', 'foot'] },
    { id: 'hs', name: 'HS (haemorrhagic septicaemia)', kind: 'seasonal', month: 5, day: 15, firstAtDays: 180, match: ['hs', 'haemorrhagic', 'hemorrhagic'] },
    { id: 'bq', name: 'BQ (black quarter)', kind: 'seasonal', month: 5, day: 15, firstAtDays: 180, match: ['bq', 'black quarter'] },
    { id: 'lsd', name: 'Lumpy skin disease', kind: 'repeat', firstAtDays: 120, everyDays: 365, match: ['lsd', 'lumpy', 'goat pox'] },
    { id: 'brucella', name: 'Brucellosis (S19, female calves)', kind: 'primary', atDays: 150, match: ['brucell', 's19'], dose: 1, sex: 'Female' },
    { id: 'deworm', name: 'Deworming', kind: 'repeat', firstAtDays: 30, everyDays: 120, match: ['deworm', 'albendazole', 'fenbendazole', 'ivermectin'], type: 'deworming' },
  ],
  goat: [
    { id: 'ppr', name: 'PPR', kind: 'repeat', firstAtDays: 90, everyDays: 1095, match: ['ppr'] },
    { id: 'et', name: 'Enterotoxaemia (ET)', kind: 'seasonal', month: 5, day: 1, firstAtDays: 120, match: ['et', 'enterotox'] },
    { id: 'fmd', name: 'FMD (foot-and-mouth)', kind: 'repeat', firstAtDays: 120, everyDays: 182, match: ['fmd', 'foot'] },
    { id: 'goatpox', name: 'Goat pox', kind: 'repeat', firstAtDays: 90, everyDays: 365, match: ['pox'] },
    { id: 'deworm', name: 'Deworming', kind: 'repeat', firstAtDays: 30, everyDays: 90, match: ['deworm', 'albendazole', 'fenbendazole'], type: 'deworming' },
  ],
  poultry: [
    { id: 'marek', name: "Marek's disease", kind: 'primary', atDays: 1, match: ['marek'], dose: 1 },
    { id: 'nd-f1', name: 'Ranikhet (F1/Lasota)', kind: 'primary', atDays: 7, match: ['ranikhet', 'lasota', 'f1', 'nd'], dose: 1 },
    { id: 'ibd-1', name: 'Gumboro (IBD)', kind: 'primary', atDays: 14, match: ['gumboro', 'ibd'], dose: 1 },
    { id: 'ibd-2', name: 'Gumboro booster', kind: 'primary', atDays: 28, match: ['gumboro', 'ibd'], dose: 2 },
    { id: 'nd-r2b', name: 'Ranikhet (R2B)', kind: 'primary', atDays: 56, match: ['r2b'], dose: 1 },
  ],
};
SCHEDULES.buffalo = SCHEDULES.cattle;
SCHEDULES.sheep = SCHEDULES.goat;

export const SUPPORTED_SPECIES = Object.keys(SCHEDULES);

const toDate = v => (v instanceof Date ? v : new Date(v));
const iso = d => d.toISOString().slice(0, 10);

/** Best-effort date of birth: explicit dob, else today minus age in years. */
export function petBirthDate(pet, today = new Date()) {
  if (pet.dob) return toDate(pet.dob);
  const years = Number(pet.age) || 0;
  return new Date(today.getTime() - years * 365.25 * DAY);
}

function recordsFor(pet) {
  const recs = [];
  (pet.vaccinations || []).forEach(v => recs.push({ name: v.name, date: v.date }));
  (pet.records || []).forEach(r => {
    if (r.type === 'vaccine' || r.type === 'deworming') recs.push({ name: r.title || r.name || '', date: r.date });
  });
  return recs.filter(r => r.date).sort((a, b) => toDate(a.date) - toDate(b.date));
}

const matches = (item, rec) => {
  const n = (rec.name || '').toLowerCase();
  const words = n.split(/[^a-z0-9]+/).filter(Boolean);
  return item.match.some(m => (m.includes(' ') ? n.includes(m) : words.some(w => w.startsWith(m))));
};

function statusFor(due, today) {
  const days = Math.round((due - today) / DAY);
  if (days < 0) return { status: 'overdue', days };
  if (days <= 30) return { status: 'due', days };
  return { status: 'upcoming', days };
}

function label(days, status) {
  if (status === 'done') return 'Done';
  if (days < 0) return `Overdue by ${-days} day${days === -1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  if (days <= 60) return `Due in ${days} day${days === 1 ? '' : 's'}`;
  return `Due in ${Math.round(days / 30)} months`;
}

/**
 * Build the schedule for one animal.
 * Returns [{ id, name, type, dueDate, status: done|due|overdue|upcoming, days, dueLabel, lastGiven }]
 * sorted with the most urgent first.
 */
export function buildSchedule(pet, today = new Date()) {
  const plan = SCHEDULES[pet.species];
  if (!plan) return [];
  const dob = petBirthDate(pet, today);
  const ageDays = (today - dob) / DAY;
  const recs = recordsFor(pet);
  const out = [];

  for (const item of plan) {
    if (item.sex && pet.gender && item.sex !== pet.gender) continue;
    const given = recs.filter(r => matches(item, r));
    const last = given.at(-1);

    if (item.kind === 'primary') {
      const dueDate = new Date(dob.getTime() + item.atDays * DAY);
      // Adults past the primary window: hide the series unless it is clearly missing.
      if (ageDays > 365 && item.dose > 1) continue;
      if (ageDays > 365 && given.length) continue;
      if (given.length >= item.dose) {
        out.push({ ...meta(item), dueDate: iso(dueDate), status: 'done', days: 0, dueLabel: 'Done', lastGiven: given[item.dose - 1]?.date });
        continue;
      }
      if (ageDays > 365) continue; // adult without record: covered by the booster line
      const s = statusFor(dueDate, today);
      out.push({ ...meta(item), dueDate: iso(dueDate), ...s, dueLabel: label(s.days, s.status) });
      continue;
    }

    let dueDate;
    if (item.kind === 'seasonal') {
      const thisYear = new Date(Date.UTC(today.getUTCFullYear(), item.month - 1, item.day));
      const recent = last && today - toDate(last.date) < 300 * DAY;
      const firstOk = ageDays >= item.firstAtDays;
      dueDate = recent || thisYear < today ? new Date(Date.UTC(today.getUTCFullYear() + 1, item.month - 1, item.day)) : thisYear;
      if (!firstOk) dueDate = new Date(Math.max(dueDate, dob.getTime() + item.firstAtDays * DAY));
      if (!recent && thisYear < today && firstOk && !last) dueDate = today; // never vaccinated: now
    } else {
      dueDate = last
        ? new Date(toDate(last.date).getTime() + item.everyDays * DAY)
        : new Date(Math.max(dob.getTime() + item.firstAtDays * DAY, ageDays > item.firstAtDays ? today.getTime() : 0));
      // Young animals: a booster never comes before the age it starts at.
      if (ageDays < item.firstAtDays) dueDate = new Date(Math.max(dueDate, dob.getTime() + item.firstAtDays * DAY));
    }
    const s = statusFor(dueDate, today);
    out.push({ ...meta(item), dueDate: iso(dueDate), ...s, dueLabel: label(s.days, s.status), lastGiven: last?.date || null });
  }

  const rank = { overdue: 0, due: 1, upcoming: 2, done: 3 };
  return out.sort((a, b) => rank[a.status] - rank[b.status] || a.dueDate.localeCompare(b.dueDate));
}

function meta(item) {
  return { id: item.id, name: item.name, type: item.type || 'vaccine' };
}

/** Items that should trigger a reminder today (due within `withinDays`, or overdue). */
export function remindersDue(pet, today = new Date(), withinDays = 7) {
  return buildSchedule(pet, today).filter(i => i.status !== 'done' && i.days <= withinDays);
}

/**
 * Milk-withdrawal tracker for dairy animals.
 * Withdrawal days must come from the product label / prescribing vet.
 */
export function milkSafeDate(lastDoseDate, withdrawalDays) {
  const d = new Date(toDate(lastDoseDate).getTime() + withdrawalDays * DAY);
  return iso(d);
}
