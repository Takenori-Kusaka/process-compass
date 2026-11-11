// F-001 設備点検スケジューラ: 点検期限の計算と論理削除(QC-01・QC-03)
import { can } from './auth/permission.js';

export function nextDue(lastInspectedAt, intervalDays) {
  const due = new Date(lastInspectedAt);
  due.setUTCDate(due.getUTCDate() + intervalDays);
  return due;
}

export function isOverdue(record, now) {
  return now.getTime() > nextDue(record.lastInspectedAt, record.intervalDays).getTime();
}

export function removeRecord(user, record, now) {
  if (!can(user, 'delete')) throw new Error('forbidden');
  return { ...record, deletedAt: now.toISOString(), deletedBy: user.id };
}
