"use server";

import { 
  getMemberById as originalGetMemberById, 
  getDWZHistory as originalGetDWZHistory, 
  getMemberStatusHistory as originalGetMemberStatusHistory, 
  deleteMember as originalDeleteMember, 
  updateUserRole as originalUpdateUserRole,
  getMembers as originalGetMembers,
  getContributionRatesForMemberSelect as originalGetContributionRatesForMemberSelect
} from "@/features/members/actions";

export async function getMemberById(id: string) {
  return originalGetMemberById(id);
}

export async function getDWZHistory(memberId: string) {
  return originalGetDWZHistory(memberId);
}

export async function getMemberStatusHistory(memberId: string) {
  return originalGetMemberStatusHistory(memberId);
}

export async function deleteMember(id: string) {
  return originalDeleteMember(id);
}

export async function updateUserRole(formData: FormData) {
  return originalUpdateUserRole(formData);
}

export async function getMembersAction(...args: any[]) {
  return (originalGetMembers as any)(...args);
}

export async function getContributionRatesForMemberSelect() {
  return originalGetContributionRatesForMemberSelect();
}
