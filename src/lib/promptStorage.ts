import { MetadataFields, TimelineSequence } from '@/components/YamlGenerator';

export interface SavedPrompt {
  id: string;
  name: string;
  metadata: MetadataFields;
  sequences: TimelineSequence[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'veo3-saved-prompts';

export const promptStorage = {
  getAll: (): SavedPrompt[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved prompts:', error);
      return [];
    }
  },

  save: (metadata: MetadataFields, sequences: TimelineSequence[], name?: string): SavedPrompt => {
    const prompts = promptStorage.getAll();
    const promptName = name || metadata.prompt_name || `Prompt ${prompts.length + 1}`;
    
    const savedPrompt: SavedPrompt = {
      id: Date.now().toString(),
      name: promptName,
      metadata,
      sequences,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPrompts = [savedPrompt, ...prompts];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrompts));
    return savedPrompt;
  },

  delete: (id: string): void => {
    const prompts = promptStorage.getAll();
    const filteredPrompts = prompts.filter(prompt => prompt.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPrompts));
  },

  update: (id: string, metadata: MetadataFields, sequences: TimelineSequence[]): SavedPrompt | null => {
    const prompts = promptStorage.getAll();
    const promptIndex = prompts.findIndex(prompt => prompt.id === id);
    
    if (promptIndex === -1) return null;

    prompts[promptIndex] = {
      ...prompts[promptIndex],
      metadata,
      sequences,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    return prompts[promptIndex];
  }
};