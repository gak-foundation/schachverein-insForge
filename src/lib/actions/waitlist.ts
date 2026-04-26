"use server";

import { 
  submitWaitlistApplication as originalSubmitWaitlistApplication, 
  updateWaitlistApplicationStatus as originalUpdateWaitlistApplicationStatus 
} from "@/features/marketing/waitlist-actions";

export async function submitWaitlistApplication(formData: FormData) {
  return originalSubmitWaitlistApplication(formData);
}

export async function updateWaitlistApplicationStatus(id: string, status: any) {
  return originalUpdateWaitlistApplicationStatus(id, status);
}
