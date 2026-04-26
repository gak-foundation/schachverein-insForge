"use server";

import { submitContactForm as originalSubmitContactForm, type SubmitContactFormResult } from "@/features/marketing/contact-actions";

export type { SubmitContactFormResult };

export async function submitContactForm(formData: FormData) {
  return originalSubmitContactForm(formData);
}
