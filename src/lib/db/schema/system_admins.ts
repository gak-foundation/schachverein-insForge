export const systemAdmins = "system_admins" as const;

export interface SystemAdmin {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewSystemAdmin {
  id?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}
