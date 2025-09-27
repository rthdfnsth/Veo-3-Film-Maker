import React, { useState } from 'react';
import type { Character } from '../types';

interface ProjectSetupProps {
  onProcess: (characters: Character[], sceneCount: number, globalStyle: string, symbolism: string) => void;
  isLoading: boolean;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({ onProcess, isLoading }) => {
  const [sceneCount, setSceneCount] = useState(10);
  const [globalStyle, setGlobalStyle] = useState('');
  const [symbolism, setSymbolism] = useState('');
  const [characters, setCharacters] = useState<Character[]>([
    { id: `char-${Date.now()}`, name: '', age: '', description: '' }
  ]);
  const [error, setError] = useState('');

  const handleAddCharacter = () => {
    setCharacters([...characters, { id: `char-${Date.now()}-${Math.random()}`, name: '', age: '', description: '' }]);
  };

  const handleRemoveCharacter = (id: string) => {
    if (characters.length > 1) {
      setCharacters(characters.filter(c => c.id !== id));
    }
  };
  
  const handleCharacterChange = (id: string, field: keyof Omit<Character, 'id'>, value: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, [field]: value } : c));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sceneCount <= 0) {
      setError('Number of scenes must be a positive number.');
      return;
    }
    if (globalStyle.trim().length < 5) {
      setError('Please provide a brief description of the global visual style.');
      return;
    }
    if (characters.some(c => c.name.trim() === '')) {
      setError('All characters must have a name.');
      return;
    }
    setError('');
    onProcess(characters.filter(c => c.name.trim() !== ''), sceneCount, globalStyle, symbolism);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold mb-2 text-center text-indigo-400">VEO Film Maker</h2>
      <p className="text-center text-gray-400 mb-6">Define your project's creative direction and cast.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="p-4 border border-gray-700 rounded-lg space-y-4 bg-gray-900/30">
          <h3 className="text-lg font-semibold text-gray-300">Creative Direction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="globalStyle" className="block text-sm font-medium text-gray-300 mb-2">
                Global Visual Style
              </label>
              <input
                type="text"
                id="globalStyle"
                value={globalStyle}
                onChange={(e) => setGlobalStyle(e.target.value)}
                placeholder="e.g., Cyberpunk city, watercolor fantasy"
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="symbolism" className="block text-sm font-medium text-gray-300 mb-2">
                Visual Motifs & Symbolism <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                id="symbolism"
                value={symbolism}
                onChange={(e) => setSymbolism(e.target.value)}
                placeholder="e.g., Recurring image of a broken clock"
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4 border border-gray-700 rounded-lg space-y-4 bg-gray-900/30">
          <h3 className="text-lg font-semibold text-gray-300">Characters</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {characters.map((char, index) => (
              <div key={char.id} className="p-3 bg-gray-800/50 rounded-md border border-gray-700 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Character Name" value={char.name} onChange={e => handleCharacterChange(char.id, 'name', e.target.value)} className="bg-gray-900 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500" required />
                  <input type="text" placeholder="Age" value={char.age} onChange={e => handleCharacterChange(char.id, 'age', e.target.value)} className="bg-gray-900 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500" />
                  <textarea placeholder="Description (appearance, personality, clothing)" value={char.description} onChange={e => handleCharacterChange(char.id, 'description', e.target.value)} rows={3} className="sm:col-span-2 bg-gray-900 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500" />
                </div>
                 {characters.length > 1 && (
                  <button type="button" onClick={() => handleRemoveCharacter(char.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 font-bold text-xl">&times;</button>
                 )}
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddCharacter} className="w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-semibold transition-colors">+ Add Character</button>
        </div>

        <div>
          <label htmlFor="sceneCount" className="block text-sm font-medium text-gray-300 mb-2">
            Initial Number of Scenes
          </label>
          <input
            type="number"
            id="sceneCount"
            value={sceneCount}
            onChange={(e) => setSceneCount(Number(e.target.value))}
            min="1"
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-md transition duration-300 text-lg"
        >
          {isLoading ? 'Setting up...' : 'Create Project'}
        </button>
      </form>
    </div>
  );
};

export default ProjectSetup;