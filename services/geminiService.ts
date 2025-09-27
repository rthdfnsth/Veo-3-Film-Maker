import { GoogleGenAI, Type } from "@google/genai";
import type { Character } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateCreativeSuggestions(scriptChunk: string): Promise<{ music: string; sound:string }> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following film script excerpt and suggest background music and ambient sounds to enhance its emotional impact and realism.
      
      Provide your suggestions as a JSON object with two keys: "music" and "sound".
      - "music": A concise description of the suggested musical score or style.
      - "sound": A list of key ambient sound effects.
      
      Script Excerpt:
      ---
      ${scriptChunk}
      ---
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            music: {
              type: Type.STRING,
              description: "A description of the suggested background music style."
            },
            sound: {
              type: Type.STRING,
              description: "A list of key ambient sound effects."
            }
          }
        }
      }
    });
    const result = JSON.parse(response.text);
    return {
      music: result.music || 'No music suggestion.',
      sound: result.sound || 'No sound suggestion.'
    };
  } catch (error) {
    console.error("Error generating creative suggestions:", error);
    return {
      music: "Error generating music suggestion.",
      sound: "Error generating sound suggestion."
    };
  }
}

export async function generatePromptForScene(
  scriptChunk: string, 
  globalStyle: string, 
  characters: Character[],
  symbolism: string
): Promise<string> {
  const characterBible = characters.length > 0 
    ? characters.map(c => `- ${c.name} (Age: ${c.age}): ${c.description}`).join('\n')
    : "No specific characters defined for this scene.";

  const symbolismInstruction = symbolism.trim() 
    ? `5. **Recurring Symbolism (Incorporate subtly if relevant):** ${symbolism}`
    : '';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a prompt generator for a cinematic AI video model (Veo). Create a single, detailed, and evocative sentence for the script excerpt below.
      
**Instructions & Context:**
1.  **Global Visual Style (MUST ADHERE):** ${globalStyle}
2.  **Character Bible (MUST ADHERE for consistency):**
${characterBible}
3.  **Cinematic Language:** Analyze the emotional beat of the scene. Use cinematic terms. Describe camera shots (e.g., "extreme close-up," "wide establishing shot," "over-the-shoulder shot"), camera movement (e.g., "slow dolly in," "handheld tracking shot"), lighting (e.g., "dramatic chiaroscuro lighting," "soft morning light"), and mood.
4.  **Single Beat:** The entire prompt must focus on a single, clear action or emotional moment from the script excerpt.
${symbolismInstruction}
6.  **Output:** A single, descriptive sentence that is dense with visual information. Do not describe sounds.

**Script Excerpt:**
---
${scriptChunk}
---
`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating prompt:", error);
    return "Error: Could not generate prompt. Please try again.";
  }
}

export async function generateVideoFromPrompt(prompt: string): Promise<string> {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: `${prompt}, cinematic, high definition, film grain`,
      config: {
        numberOfVideos: 1,
      }
    });

    // Poll for completion
    while (!operation.done) {
      await sleep(10000); // Wait 10 seconds between polls
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation succeeded but no download link was found.");
    }
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video file: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error)
 {
    console.error("Error generating video:", error);
    throw new Error("Failed to generate video. Please check the console for details.");
  }
}