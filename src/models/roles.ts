export const UserRole = {
    Guest: "guest",
    User: "user",
    Owner: "owner",
    Admin: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const roleLabel: Record<UserRole, string> = {
    [UserRole.Guest]: "Khách",
    [UserRole.User]: "Người dùng",
    [UserRole.Owner]: "Chủ thiết bị",
    [UserRole.Admin]: "Admin (Hãng)",
};

export const roleColor: Record<UserRole, string> = {
    [UserRole.Guest]: "#6b7280",
    [UserRole.User]: "#60a5fa",
    [UserRole.Owner]: "#a78bfa",
    [UserRole.Admin]: "#22c55e",
};

/** Ma tran quyen theo vai tro */
export const PERMISSIONS = {
    search: [UserRole.Guest, UserRole.User, UserRole.Owner, UserRole.Admin],
    activate: [UserRole.Admin],
    transfer: [UserRole.Owner, UserRole.Admin],
    addRepair: [UserRole.Admin],
    completeRepair: [UserRole.Admin],
} as const;

export function hasPermission(
    role: UserRole,
    action: keyof typeof PERMISSIONS
): boolean {
    return (PERMISSIONS[action] as readonly UserRole[]).includes(role);
}
