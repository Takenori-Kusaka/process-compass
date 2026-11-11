// F-001/AC-1 QC-01 F-001/AC-2 QC-02 F-001/AC-3 QC-03
import { test } from 'node:test';
import assert from 'node:assert';
import { nextDue, isOverdue, removeRecord } from '../src/inspection.js';

test('AC-1: 期限は最後の点検日に間隔の日数を足した日', () => {
  assert.strictEqual(nextDue('2026-10-01T00:00:00Z', 30).toISOString(), '2026-10-31T00:00:00.000Z');
  assert.strictEqual(isOverdue({ lastInspectedAt: '2026-10-01T00:00:00Z', intervalDays: 30 }, new Date('2026-10-31T00:00:00Z')), false);
});

test('AC-2: 管理者でない利用者は削除できない', () => {
  assert.throws(() => removeRecord({ id: 'u1', roles: ['inspector'] }, { id: 'r1' }, new Date('2026-10-01T00:00:00Z')));
});

test('AC-3: 削除は論理削除で、削除日時と削除した者を残す', () => {
  const r = removeRecord({ id: 'u2', roles: ['admin'] }, { id: 'r1' }, new Date('2026-10-01T00:00:00Z'));
  assert.strictEqual(r.deletedAt, '2026-10-01T00:00:00.000Z');
  assert.strictEqual(r.deletedBy, 'u2');
});
