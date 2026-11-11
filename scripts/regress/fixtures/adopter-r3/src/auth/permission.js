// F-001 QC-02: 点検の記録を削除できるのは管理者だけ
export function can(user, action) {
  if (!user || !Array.isArray(user.roles)) return false;
  if (action === 'delete') return user.roles.includes('admin');
  return user.roles.includes('inspector') || user.roles.includes('admin');
}
