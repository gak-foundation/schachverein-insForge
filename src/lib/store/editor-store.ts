import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type BlockType = 
  | "text" 
  | "image" 
  | "button" 
  | "hero" 
  | "columns" 
  | "divider" 
  | "contactForm" 
  | "tournamentCard";

export interface Block {
  id: string;
  type: BlockType;
  data: any;
  order: number;
}

interface EditorState {
  pageId: string | null;
  blocks: Block[];
  activeBlockId: string | null;
  isDirty: boolean;
  
  // Actions
  setPageId: (id: string) => void;
  setBlocks: (blocks: Block[]) => void;
  addBlock: (type: BlockType, index?: number) => void;
  updateBlock: (id: string, data: any) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  setActiveBlock: (id: string | null) => void;
  reorderBlocks: (oldIndex: number, newIndex: number) => void;
  setDirty: (dirty: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  devtools((set) => ({
    pageId: null,
    blocks: [],
    activeBlockId: null,
    isDirty: false,

    setPageId: (id) => set({ pageId: id }),
    
    setBlocks: (blocks) => set({ blocks: blocks.sort((a, b) => a.order - b.order), isDirty: false }),

    addBlock: (type, index) => set((state) => {
      const newBlock: Block = {
        id: uuidv4(),
        type,
        data: getDefaultData(type),
        order: state.blocks.length * 10,
      };
      
      let newBlocks = [...state.blocks];
      if (typeof index === "number") {
        newBlocks.splice(index, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      
      // Re-normalize orders
      newBlocks = newBlocks.map((b, i) => ({ ...b, order: i * 10 }));
      
      return { 
        blocks: newBlocks, 
        activeBlockId: newBlock.id,
        isDirty: true 
      };
    }),

    updateBlock: (id, data) => set((state) => ({
      blocks: state.blocks.map((b) => b.id === id ? { ...b, data: { ...b.data, ...data } } : b),
      isDirty: true,
    })),

    removeBlock: (id) => set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      activeBlockId: state.activeBlockId === id ? null : state.activeBlockId,
      isDirty: true,
    })),

    moveBlock: (id, direction) => set((state) => {
      const index = state.blocks.findIndex((b) => b.id === id);
      if (index === -1) return state;
      
      const newBlocks = [...state.blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return state;
      
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      
      return {
        blocks: newBlocks.map((b, i) => ({ ...b, order: i * 10 })),
        isDirty: true,
      };
    }),

    reorderBlocks: (oldIndex, newIndex) => set((state) => {
      const newBlocks = [...state.blocks];
      const [movedBlock] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      
      return {
        blocks: newBlocks.map((b, i) => ({ ...b, order: i * 10 })),
        isDirty: true,
      };
    }),

    setActiveBlock: (id) => set({ activeBlockId: id }),
    
    setDirty: (dirty) => set({ isDirty: dirty }),
  }))
);

function getDefaultData(type: BlockType): any {
  switch (type) {
    case "text":
      return { content: "", alignment: "left", maxWidth: "normal" };
    case "image":
      return { mediaAssetId: "", caption: "", ratio: "original", alignment: "center" };
    case "button":
      return { label: "Klick mich", href: "#", variant: "primary", alignment: "left" };
    case "hero":
      return { title: "Willkommen", variant: "full", overlayOpacity: 50 };
    case "divider":
      return { variant: "line", spacing: "md" };
    case "contactForm":
      return { recipientRole: "vorstand", submitButtonLabel: "Absenden" };
    case "tournamentCard":
      return { tournamentId: "", variant: "standard", showRegistration: true };
    case "columns":
      return { columns: [{ width: "1/2", blocks: [] }, { width: "1/2", blocks: [] }], gap: "md" };
    default:
      return {};
  }
}
