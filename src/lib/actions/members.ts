"use server";

import { 
  getMemberById as originalGetMemberById, 
  getDWZHistory as originalGetDWZHistory, 
  getMemberStatusHistory as originalGetMemberStatusHistory, 
  deleteMember as originalDeleteMember, 
  updateUserRole as originalUpdateUserRole,
  getMembers as originalGetMembers,
  getContributionRatesForMemberSelect as originalGetContributionRatesForMemberSelect,
  requestMemberDeletion as originalRequestMemberDeletion,
  anonymizeMember as originalAnonymizeMember,
  getMemberAuditLogs as originalGetMemberAuditLogs,
  syncFideRating as originalSyncFideRating,
  syncChesscomRating as originalSyncChesscomRating,
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

export async function requestMemberDeletion(memberId: string) {
  return originalRequestMemberDeletion(memberId);
}

export async function anonymizeMember(memberId: string) {
  return originalAnonymizeMember(memberId);
}

export async function getMemberAuditLogs(memberId: string) {
  return originalGetMemberAuditLogs(memberId);
}

export async function syncFideRating(memberId: string) {
  return originalSyncFideRating(memberId);
}

export async function syncChesscomRating(memberId: string) {
  return originalSyncChesscomRating(memberId);
}