export enum SceneStatus {
  PENDING_PROMPT = 'PENDING_PROMPT',
  PROMPT_GENERATED = 'PROMPT_GENERATED',
  PROMPT_EDITED = 'PROMPT_EDITED',
  VIDEO_GENERATING = 'VIDEO_GENERATING',
  VIDEO_GENERATED = 'VIDEO_GENERATED',
  APPROVED = 'APPROVED',
}

export interface Scene {
  id: string;
  scriptContent: string;
  prompt: string;
  status: SceneStatus;
  videoUrl?: string;
  transition: string; // e.g., 'none', 'fade', 'dissolve'
  musicSuggestion: string;
  soundSuggestion: string;
  characterIds: string[];
}

export interface Character {
  id: string;
  name: string;
  age: string;
  description: string;
}