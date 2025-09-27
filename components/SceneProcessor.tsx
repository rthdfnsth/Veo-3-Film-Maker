import React, { useState, useEffect } from 'react';
import type { Scene, Character } from '../types';
import { SceneStatus } from '../types';
import Spinner from './Spinner';
import Timeline from './Timeline';
import CharacterManager from './CharacterManager';

interface SceneProcessorProps {
  scenes: Scene[];
  currentSceneIndex: number;
  allCharacters: Character[];
  onPromptUpdate: (index: number, newPrompt: string) => void;
  onVideoGenerate: (index: number, prompt: string) => void;
  onApprove: (index: number) => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onSceneSelect: (index: number) => void;
  onTransitionUpdate: (index: number, transition: string) => void;
  onScriptUpdate: (index: number, content: string) => void;
  onGeneratePrompt: (index: number) => void;
  onAddScene: (index: number) => void;
  onDeleteScene: (index: number) => void;
  onSceneCharacterToggle: (index: number, characterId:string) => void;
  onAddCharacter: (character: Omit<Character, 'id'>) => Character;
  onUpdateCharacter: (character: Character) => void;
  onDeleteCharacter: (id: string) => void;
}

const loadingMessages = [
  "Warming up the virtual cameras...",
  "Consulting with the digital director...",
  "Rendering cinematic atoms...",
  "This can take a few minutes, good things come to those who wait.",
  "AI is composing the perfect shot...",
  "Adjusting the lighting in cyberspace...",
];

const transitionOptions = [
    { value: 'none', label: 'None (Hard Cut)' },
    { value: 'fade', label: 'Fade to Black' },
    { value: 'dissolve', label: 'Dissolve' },
    { value: 'glitch', label: 'Glitch Out' },
    { value: 'flicker', label: 'Neon Flicker' },
];

const SceneProcessor: React.FC<SceneProcessorProps> = ({ 
    scenes, currentSceneIndex, allCharacters, onPromptUpdate, onVideoGenerate, onApprove,
    onPrevScene, onNextScene, onSceneSelect, onTransitionUpdate, onScriptUpdate,
    onGeneratePrompt, onAddScene, onDeleteScene, onSceneCharacterToggle,
    onAddCharacter, onUpdateCharacter, onDeleteCharacter
}) => {
  const currentScene = scenes[currentSceneIndex];
  const [editablePrompt, setEditablePrompt] = useState(currentScene?.prompt || '');
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  useEffect(() => {
    setEditablePrompt(currentScene?.prompt || '');
  }, [currentScene]);
  
  useEffect(() => {
    if (currentScene?.status === SceneStatus.VIDEO_GENERATING) {
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentScene?.status]);

  if (!currentScene) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-indigo-400">No Scenes Found</h2>
        <p className="text-gray-400 mt-2">Something went wrong. Please try restarting the project.</p>
      </div>
    );
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditablePrompt(e.target.value);
    onPromptUpdate(currentSceneIndex, e.target.value);
  }

  const handleGenerateClick = () => {
    onVideoGenerate(currentSceneIndex, editablePrompt);
  }

  const isGenerating = currentScene.status === SceneStatus.VIDEO_GENERATING;
  const isPromptGenerating = currentScene.prompt === "Generating...";
  const isGenerated = currentScene.status === SceneStatus.VIDEO_GENERATED;
  const isApproved = currentScene.status === SceneStatus.APPROVED;

  const totalScenes = scenes.length;
  const approvedScenes = scenes.filter(s => s.status === SceneStatus.APPROVED).length;

  return (
    <>
    <div className="max-w-6xl mx-auto p-6 bg-gray-800 rounded-lg shadow-2xl">
      <Timeline scenes={scenes} currentSceneIndex={currentSceneIndex} onSceneSelect={onSceneSelect} />
      
      <div className="flex justify-between items-center mb-4">
          <button onClick={onPrevScene} disabled={currentSceneIndex === 0} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">&larr; Prev</button>
          <div className="flex items-center gap-4">
             <div className="text-center">
                <div className="flex justify-between items-baseline gap-4 mb-2 text-sm text-gray-400">
                  <span>Progress</span>
                  <span>Scene {currentSceneIndex + 1} of {totalScenes}</span>
                </div>
                <div className="w-64 bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(approvedScenes / totalScenes) * 100}%` }}
                  ></div>
                </div>
              </div>
               <div className="flex gap-2">
                 <button onClick={() => onAddScene(currentSceneIndex)} title="Add Scene After This" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md transition duration-300 text-sm">Add +</button>
                 <button onClick={() => onDeleteScene(currentSceneIndex)} title="Delete Current Scene" className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded-md transition duration-300 text-sm">Del &times;</button>
               </div>
          </div>
          <button onClick={onNextScene} disabled={currentSceneIndex === scenes.length - 1} className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300">Next &rarr;</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column: Script & Prompt */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Scene {currentSceneIndex + 1} Script</h3>
            <textarea
              value={currentScene.scriptContent}
              onChange={(e) => onScriptUpdate(currentSceneIndex, e.target.value)}
              placeholder="INT. COFFEE SHOP - DAY..."
              rows={8}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 font-mono text-sm"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-indigo-400">Video Prompt</h3>
              <button
                onClick={() => onGeneratePrompt(currentSceneIndex)}
                disabled={!currentScene.scriptContent || isPromptGenerating || isGenerating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-1 px-3 rounded-md transition duration-300 text-sm"
              >
                {isPromptGenerating ? <Spinner className="w-4 h-4" /> : 'Generate'}
              </button>
            </div>
            <textarea
              value={editablePrompt}
              onChange={handlePromptChange}
              disabled={isGenerating || isPromptGenerating}
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-gray-800"
            />
          </div>
          <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Creative Direction</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Characters in Scene</h4>
                     <div className="max-h-24 overflow-y-auto space-y-2 pr-2">
                        {allCharacters.length > 0 ? allCharacters.map(char => (
                            <div key={char.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`char-select-${char.id}-${currentScene.id}`}
                                checked={currentScene.characterIds.includes(char.id)}
                                onChange={() => onSceneCharacterToggle(currentSceneIndex, char.id)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`char-select-${char.id}-${currentScene.id}`} className="ml-2 block text-sm text-gray-300">
                                {char.name}
                            </label>
                            </div>
                        )) : <p className="text-sm text-gray-500">No characters.</p>}
                    </div>
                    <button onClick={() => setIsCharacterModalOpen(true)} className="mt-2 w-full text-xs bg-gray-700 hover:bg-gray-600 p-1 rounded-md">Manage Characters</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Transition to Next Scene</label>
                    <select
                        value={currentScene.transition}
                        onChange={(e) => onTransitionUpdate(currentSceneIndex, e.target.value)}
                        disabled={isGenerating || isApproved}
                        className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-60"
                    >
                        {transitionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
              </div>

              <div>
                  <h4 className="text-sm font-medium text-gray-400">AI Music Suggestion</h4>
                  <p className="text-sm text-gray-300 mt-1 p-2 bg-gray-800 rounded-md min-h-[2.5rem]">{currentScene.musicSuggestion}</p>
              </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400">AI Sound Suggestion</h4>
                  <p className="text-sm text-gray-300 mt-1 p-2 bg-gray-800 rounded-md min-h-[2.5rem]">{currentScene.soundSuggestion}</p>
              </div>
          </div>
        </div>
        
        {/* Right Column: Video & Actions */}
        <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-md border border-gray-700 min-h-[300px]">
          {isGenerating && (
            <div className="text-center space-y-4">
              <Spinner className="w-12 h-12 mx-auto"/>
              <p className="text-lg font-semibold">Generating Video...</p>
              <p className="text-sm text-gray-400">{loadingMessage}</p>
            </div>
          )}
          {currentScene.videoUrl && (isGenerated || isApproved) && (
             <video key={currentScene.videoUrl} controls autoPlay loop muted className="w-full h-full object-contain rounded-md">
                <source src={currentScene.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
          )}
          {!isGenerating && !isGenerated && !isApproved &&(
             <div className="text-center text-gray-500">
                <p>Video preview will appear here.</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={handleGenerateClick}
          disabled={isGenerating || isApproved || !editablePrompt || isPromptGenerating}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          {isGenerated ? 'Regenerate Video' : 'Generate Video'}
        </button>
        <button
          onClick={() => onApprove(currentSceneIndex)}
          disabled={!isGenerated && !isApproved}
          className={`${isApproved ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md transition duration-300`}
        >
          {isApproved ? '✔️ Approved' : 'Approve Scene'}
        </button>
      </div>
    </div>
    {isCharacterModalOpen && (
      <CharacterManager
        characters={allCharacters}
        onAdd={onAddCharacter}
        onUpdate={onUpdateCharacter}
        onDelete={onDeleteCharacter}
        onClose={() => setIsCharacterModalOpen(false)}
      />
    )}
    </>
  );
};

export default SceneProcessor;