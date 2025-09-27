
import React, { useState, useRef, useEffect } from 'react';
import type { Scene } from '../types';

interface FinalFilmViewProps {
  scenes: Scene[];
  onRestart: () => void;
}

const FinalFilmView: React.FC<FinalFilmViewProps> = ({ scenes, onRestart }) => {
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoEnd = () => {
      if (currentPlayingIndex < scenes.length - 1) {
        setCurrentPlayingIndex(prevIndex => prevIndex + 1);
      }
    };
    
    videoElement.addEventListener('ended', handleVideoEnd);
    
    return () => {
      videoElement.removeEventListener('ended', handleVideoEnd);
    };
  }, [currentPlayingIndex, scenes.length]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(error => console.log("Autoplay was prevented:", error));
    }
  }, [currentPlayingIndex]);

  const currentSceneUrl = scenes[currentPlayingIndex]?.videoUrl;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-800 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-indigo-400">Your Film is Ready!</h2>
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden mb-6 border-4 border-gray-700">
        {currentSceneUrl ? (
             <video ref={videoRef} key={currentSceneUrl} controls autoPlay className="w-full h-full object-contain">
                <source src={currentSceneUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        ) : <p className="text-center text-gray-400 p-8">Loading film...</p>}
      </div>
      <div className="text-center mb-6">
        <p className="text-lg">Playing Scene {currentPlayingIndex + 1} of {scenes.length}</p>
        <p className="text-gray-400 text-sm">{scenes[currentPlayingIndex]?.prompt}</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-center">Download Scenes</h3>
        <p className="text-center text-sm text-gray-500 mb-4">Note: Due to browser limitations, videos must be downloaded individually. You can use a video editor to stitch them together.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {scenes.map((scene, index) => (
                <a
                    key={scene.id}
                    href={scene.videoUrl}
                    download={`scene_${index + 1}.mp4`}
                    className="bg-gray-700 hover:bg-gray-600 text-center p-3 rounded-md transition duration-200"
                >
                    <span className="font-semibold">Scene {index + 1}</span>
                    <span className="block text-xs text-gray-400">Download MP4</span>
                </a>
            ))}
        </div>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={onRestart}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition duration-300"
        >
          Create Another Film
        </button>
      </div>
    </div>
  );
};

export default FinalFilmView;
