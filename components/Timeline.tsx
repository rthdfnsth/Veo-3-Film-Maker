import React from 'react';
import type { Scene } from '../types';
import { SceneStatus } from '../types';

interface TimelineProps {
    scenes: Scene[];
    currentSceneIndex: number;
    onSceneSelect: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ scenes, currentSceneIndex, onSceneSelect }) => {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Scene Timeline</h3>
            <div className="flex space-x-2 p-2 bg-gray-900 rounded-lg overflow-x-auto">
                {scenes.map((scene, index) => {
                    const isActive = index === currentSceneIndex;
                    const isApproved = scene.status === SceneStatus.APPROVED;
                    const isGenerated = scene.status === SceneStatus.VIDEO_GENERATED || scene.status === SceneStatus.APPROVED;

                    let statusClass = 'bg-gray-700';
                    if (isApproved) statusClass = 'bg-green-900 border-green-500';
                    else if (isGenerated) statusClass = 'bg-blue-900 border-blue-500';

                    return (
                        <button
                            key={scene.id}
                            onClick={() => onSceneSelect(index)}
                            className={`flex-shrink-0 w-28 h-20 rounded-md transition-all duration-200 border-2 ${isActive ? 'border-indigo-500 scale-105' : 'border-transparent hover:border-gray-500'} ${statusClass} flex flex-col items-center justify-center text-white overflow-hidden relative group`}
                            aria-label={`Go to scene ${index + 1}`}
                        >
                            {scene.videoUrl && (
                                <video
                                    src={scene.videoUrl}
                                    muted
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                ></video>
                            )}
                            <div className="relative z-10 bg-black bg-opacity-60 group-hover:bg-opacity-75 p-1 rounded transition-all">
                               <span className="font-bold">Scene {index + 1}</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default Timeline;
