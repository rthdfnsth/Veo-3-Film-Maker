import React, { useState, useCallback } from 'react';
import ScriptInput from './components/ScriptInput';
import SceneProcessor from './components/SceneProcessor';
import FinalFilmView from './components/FinalFilmView';
import type { Scene, Character } from './types';
import { SceneStatus } from './types';
import { 
  generatePromptForScene, 
  generateVideoFromPrompt,
  generateCreativeSuggestions,
} from './services/geminiService';
import Spinner from './components/Spinner';

enum AppState {
  INPUT,
  PROCESSING,
  FINISHED,
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [globalStyle, setGlobalStyle] = useState<string>('');
  const [symbolism, setSymbolism] = useState<string>('');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectSetup = useCallback(async (
    newCharacters: Character[],
    sceneCount: number,
    style: string,
    sym: string
  ) => {
    setIsLoading(true);
    setError(null);
    setGlobalStyle(style);
    setSymbolism(sym);
    setCharacters(newCharacters);
    
    try {
      const initialScenes: Scene[] = Array.from({ length: sceneCount }, (_, index) => ({
        id: `${Date.now()}-${index}`, 
        scriptContent: '', 
        prompt: '', 
        status: SceneStatus.PENDING_PROMPT,
        transition: 'none',
        musicSuggestion: 'Add script and generate prompt.',
        soundSuggestion: 'Add script and generate prompt.',
        characterIds: [],
      }));
      setScenes(initialScenes);
      setCurrentSceneIndex(0);
      setAppState(AppState.PROCESSING);
    } catch (err) {
      setError("Failed to create scene slots.");
      console.error(err);
      setAppState(AppState.INPUT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddCharacter = (newCharData: Omit<Character, 'id'>): Character => {
    const newCharacter: Character = {
      id: `char-${Date.now()}-${Math.random()}`,
      ...newCharData
    };
    setCharacters(prev => [...prev, newCharacter]);
    return newCharacter;
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setCharacters(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
  };

  const handleDeleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    // Also remove this character from all scenes
    setScenes(prevScenes => prevScenes.map(scene => ({
      ...scene,
      characterIds: scene.characterIds.filter(charId => charId !== id)
    })));
  };
  
  const handleSceneCharacterToggle = (sceneIndex: number, characterId: string) => {
    setScenes(prevScenes => prevScenes.map((scene, index) => {
      if (index === sceneIndex) {
        const newCharacterIds = scene.characterIds.includes(characterId)
          ? scene.characterIds.filter(id => id !== characterId)
          : [...scene.characterIds, characterId];
        return { ...scene, characterIds: newCharacterIds };
      }
      return scene;
    }));
  };

  const handleScriptUpdate = (index: number, content: string) => {
    setScenes(prev => prev.map((s, i) => i === index ? {...s, scriptContent: content} : s));
  };
  
  const handleGenerateScenePrompt = async (index: number) => {
    const scene = scenes[index];
    if (!scene.scriptContent) return;

    setScenes(prev => prev.map((s, i) => i === index ? { ...s, prompt: "Generating...", status: SceneStatus.PENDING_PROMPT } : s));

    try {
        const sceneCharacters = characters.filter(c => scene.characterIds.includes(c.id));
        const prompt = await generatePromptForScene(scene.scriptContent, globalStyle, sceneCharacters, symbolism);
        const suggestions = await generateCreativeSuggestions(scene.scriptContent);
        setScenes(prev => prev.map((s, i) => 
            i === index ? { 
                ...s, 
                prompt, 
                status: SceneStatus.PROMPT_GENERATED,
                musicSuggestion: suggestions.music,
                soundSuggestion: suggestions.sound,
            } : s
        ));
    } catch(err) {
        console.error(`Error generating prompt for scene ${index + 1}:`, err);
        setScenes(prev => prev.map((s, i) =>
            i === index ? { 
                ...s, 
                prompt: "Error: Could not generate prompt.", 
                status: SceneStatus.PROMPT_GENERATED,
            } : s
        ));
    }
  };

  const handleAddScene = (currentIndex: number) => {
    const newScene: Scene = {
      id: `${Date.now()}-${Math.random()}`,
      scriptContent: '',
      prompt: '',
      status: SceneStatus.PENDING_PROMPT,
      transition: 'none',
      musicSuggestion: 'Add script and generate prompt.',
      soundSuggestion: 'Add script and generate prompt.',
      characterIds: [],
    };
    const newScenes = [...scenes];
    newScenes.splice(currentIndex + 1, 0, newScene);
    setScenes(newScenes);
    setCurrentSceneIndex(currentIndex + 1); // Jump to the new scene
  };

  const handleDeleteScene = (indexToDelete: number) => {
    if (scenes.length <= 1) {
      setError("You cannot delete the last scene.");
      return;
    }
    setScenes(prev => prev.filter((_, i) => i !== indexToDelete));
    if (currentSceneIndex >= indexToDelete && currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handlePromptUpdate = (index: number, newPrompt: string) => {
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, prompt: newPrompt, status: SceneStatus.PROMPT_EDITED } : s));
  };

  const handleTransitionUpdate = (index: number, transition: string) => {
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, transition } : s));
  };
  
  const handleVideoGenerate = async (index: number, prompt: string) => {
    setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: SceneStatus.VIDEO_GENERATING } : s));
    try {
      const scene = scenes[index];
      const transitionTextMap: Record<string, string> = {
          'fade': ', ending with a fade to black',
          'dissolve': ', the scene dissolves away',
          'glitch': ', the image glitches out at the end',
          'flicker': ', the scene ends with a neon flicker effect',
      };
      const transitionPrompt = transitionTextMap[scene.transition] || '';
      const finalPrompt = prompt + transitionPrompt;
      
      const videoUrl = await generateVideoFromPrompt(finalPrompt);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: SceneStatus.VIDEO_GENERATED, videoUrl } : s));
    } catch (err) {
      console.error(err);
      setError(`Failed to generate video for scene ${index + 1}. Please try again.`);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: SceneStatus.PROMPT_GENERATED } : s));
    }
  };

  const handleApproveScene = (index: number) => {
    const newScenes = scenes.map((s, i) => i === index ? { ...s, status: SceneStatus.APPROVED } : s);
    setScenes(newScenes);
    const allApproved = newScenes.every(s => s.status === SceneStatus.APPROVED);
    if (allApproved) {
      setAppState(AppState.FINISHED);
    }
  };

  const handleRestart = () => {
    setScenes([]);
    setCharacters([]);
    setGlobalStyle('');
    setSymbolism('');
    setCurrentSceneIndex(0);
    setAppState(AppState.INPUT);
    setError(null);
  }

  const handleNextScene = () => setCurrentSceneIndex(prev => Math.min(prev + 1, scenes.length - 1));
  const handlePrevScene = () => setCurrentSceneIndex(prev => Math.max(prev - 1, 0));
  const handleSceneSelect = (index: number) => setCurrentSceneIndex(index);

  const renderContent = () => {
    switch (appState) {
      case AppState.PROCESSING:
        return scenes.length > 0 ? (
          <SceneProcessor 
            scenes={scenes}
            currentSceneIndex={currentSceneIndex}
            allCharacters={characters}
            onPromptUpdate={handlePromptUpdate}
            onVideoGenerate={handleVideoGenerate}
            onApprove={handleApproveScene}
            onPrevScene={handlePrevScene}
            onNextScene={handleNextScene}
            onSceneSelect={handleSceneSelect}
            onTransitionUpdate={handleTransitionUpdate}
            onScriptUpdate={handleScriptUpdate}
            onGeneratePrompt={handleGenerateScenePrompt}
            onAddScene={handleAddScene}
            onDeleteScene={handleDeleteScene}
            onSceneCharacterToggle={handleSceneCharacterToggle}
            onAddCharacter={handleAddCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        ) : <div className="text-center"><Spinner className="w-12 h-12 mx-auto"/> <p>Loading scenes...</p></div>;
      case AppState.FINISHED:
        return <FinalFilmView scenes={scenes} onRestart={handleRestart} />;
      case AppState.INPUT:
      default:
        return <ScriptInput onProcess={handleProjectSetup} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full">
        {error && (
          <div className="max-w-4xl mx-auto bg-red-800 border border-red-600 text-red-100 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default App;