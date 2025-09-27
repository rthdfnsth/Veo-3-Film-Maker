import React, { useState } from 'react';
import type { Character } from '../types';

interface CharacterManagerProps {
    characters: Character[];
    onAdd: (character: Omit<Character, 'id'>) => Character;
    onUpdate: (character: Character) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const EditableCharacterCard: React.FC<{
    character: Character;
    onUpdate: (character: Character) => void;
    onDelete: (id: string) => void;
}> = ({ character, onUpdate, onDelete }) => {
    const [name, setName] = useState(character.name);
    const [age, setAge] = useState(character.age);
    const [description, setDescription] = useState(character.description);

    const hasChanged = name !== character.name || age !== character.age || description !== character.description;

    const handleSave = () => {
        if (name.trim()) {
            onUpdate({ id: character.id, name, age, description });
        }
    };

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Character Name" value={name} onChange={e => setName(e.target.value)} className="bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" required />
                <input type="text" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} className="bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" />
            </div>
            <textarea placeholder="Description (appearance, personality, clothing)" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" />
            <div className="flex justify-end space-x-2">
                <button onClick={() => onDelete(character.id)} className="text-sm bg-red-800 hover:bg-red-700 px-3 py-1 rounded-md transition-colors">Delete</button>
                <button onClick={handleSave} disabled={!hasChanged || !name.trim()} className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded-md transition-colors">Save</button>
            </div>
        </div>
    );
};


const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, onAdd, onUpdate, onDelete, onClose }) => {
    const [newName, setNewName] = useState('');
    const [newAge, setNewAge] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            onAdd({ name: newName, age: newAge, description: newDescription });
            setNewName('');
            setNewAge('');
            setNewDescription('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-indigo-400">Manage Characters</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {characters.map(char => (
                        <EditableCharacterCard key={char.id} character={char} onUpdate={onUpdate} onDelete={onDelete} />
                    ))}
                </div>

                <div className="p-6 bg-gray-900/50 border-t border-gray-700 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-300">Add New Character</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Character Name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" required />
                        <input type="text" placeholder="Age" value={newAge} onChange={e => setNewAge(e.target.value)} className="bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" />
                    </div>
                    <textarea placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={3} className="w-full bg-gray-700 border border-gray-600 p-2 rounded-md focus:ring-1 focus:ring-indigo-500 text-white" />
                    <button onClick={handleAdd} disabled={!newName.trim()} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 rounded-md transition-colors">Add Character</button>
                </div>
            </div>
        </div>
    );
};

export default CharacterManager;