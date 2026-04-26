"use server";

import { getPageById as originalGetPageById, savePageBlocks as originalSavePageBlocks } from "@/features/cms/actions";

export async function getPageById(id: string) {
  return originalGetPageById(id);
}

export async function savePageBlocks(pageId: string, blocks: any[]) {
  return originalSavePageBlocks(pageId, blocks);
}
