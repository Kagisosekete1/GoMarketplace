

import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import type { ChatMessage as AppChatMessage, Listing } from '../types';


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MARKETPLACE_CATEGORIES = [
    'Furniture', 'Home Decor', 'Electronics', 'Appliances', 'Musical Instruments', 
    'Sporting Goods', 'Books & Media', 'Clothing & Accessories', 'Vehicles', 'Toys & Games', 'Other'
];

const fileToGenerativePart = (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({ base64: base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


export const generateListingDetailsFromImage = async (imageFile: File) => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Analyze this image of an item for a marketplace. Provide a concise, catchy title for it.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { 
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive, and appealing title for the item. Max 50 characters."
            },
          },
          required: ["title"],
        }
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating listing details:", error);
    throw new Error("Failed to analyze image with AI. Please try again.");
  }
};

export const generateDescriptionForListing = async (title: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a compelling, friendly, and informative marketplace listing description for an item with the title "${title}". Mention its key features, condition, and why someone should buy it. Keep it under 150 words. Use paragraphs for readability.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating description:", error);
        throw new Error("Failed to generate description with AI. Please try again.");
    }
};

export const generateSearchSuggestions = async (searchTerm: string): Promise<string[]> => {
    if (searchTerm.trim().length < 3) {
        return [];
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Given the search term "${searchTerm}" for an online marketplace, provide 4 related and relevant search suggestions. Examples could be alternative items, broader categories, or specific brands. Return the result as a JSON object with a single key "suggestions" which is an array of strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A relevant search suggestion."
                            }
                        }
                    },
                    required: ["suggestions"],
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.suggestions || [];
    } catch (error) {
        console.error("Error generating search suggestions:", error);
        // Return empty array on error for better UX
        return [];
    }
};

export const createListingAssistantChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a friendly and expert assistant for a marketplace app called GoMarket. 
            You are helping a user create a new listing. 
            Your goal is to help them write the best possible title, description, and price to attract buyers. 
            Keep your responses concise, helpful, and encouraging.
            When suggesting changes, be specific. For example, instead of "make the title better", suggest a new title.
            You can ask clarifying questions if needed.`,
        },
    });
};

export const generateSearchTermFromImage = async (imageFile: File): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: "Analyze the image to identify the main object. Provide a concise and effective search term for finding this item on an online marketplace. The term should be suitable for a search bar." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchTerm: {
              type: Type.STRING,
              description: "A concise search term for the item in the image."
            }
          },
          required: ["searchTerm"],
        }
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.searchTerm) {
        return result.searchTerm;
    } else {
        throw new Error("AI did not return a valid search term.");
    }
  } catch (error) {
    console.error("Error generating search term from image:", error);
    throw new Error("Failed to analyze image with AI. Please try another image.");
  }
};

export const suggestPriceForListing = async (title: string, description: string): Promise<{price: number, justification: string}> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following item details for a listing on a second-hand online marketplace, suggest a fair price in USD. Also provide a brief, one-sentence justification for your suggestion.
            - Title: "${title}"
            - Description: "${description}"
            Consider factors like the item type, potential brand, and condition as inferred from the description.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        price: {
                            type: Type.NUMBER,
                            description: "A fair market price for the item in USD, without the currency symbol."
                        },
                        justification: {
                            type: Type.STRING,
                            description: "A short, one-sentence explanation for the suggested price."
                        }
                    },
                    required: ["price", "justification"],
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error suggesting price:", error);
        throw new Error("Failed to suggest a price with AI. Please set it manually.");
    }
};

export const suggestCategoryForListing = async (title: string, description: string): Promise<{ category: string }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following item details, select the most suitable category from the provided list.
            - Title: "${title}"
            - Description: "${description}"
            Available categories: ${MARKETPLACE_CATEGORIES.join(', ')}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: "The single most appropriate category for the item from the provided list."
                        }
                    },
                    required: ["category"],
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Ensure the returned category is one of the valid options
        if (MARKETPLACE_CATEGORIES.includes(result.category)) {
            return result;
        } else {
            console.warn(`AI suggested an invalid category: "${result.category}". Falling back to "Other".`);
            return { category: 'Other' };
        }
    } catch (error) {
        console.error("Error suggesting category:", error);
        throw new Error("Failed to suggest a category with AI. Please select one manually.");
    }
};


export const editImageWithAI = async (imageFile: File, prompt: string): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("AI did not return an edited image.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image with AI. Please try a different prompt or image.");
    }
};

export const generatePromotionalVideo = async (
    title: string, 
    imageFile: File,
    onProgress: (message: string) => void
): Promise<string> => {
    try {
        onProgress("Preparing your assets for the AI director...");
        const { base64, mimeType } = await fileToBase64(imageFile);

        onProgress("Sending scene details to the video studio...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `Create a short, clean, professional promotional video for a marketplace listing. 
            The item is: "${title}". 
            Animate the provided image subtly. Add gentle, abstract background motion. The tone should be appealing and high-quality.`,
            image: {
                imageBytes: base64,
                mimeType: mimeType,
            },
            config: {
                numberOfVideos: 1,
            }
        });

        const progressMessages = [
            "AI is storyboarding the shots...",
            "Setting up the virtual cameras...",
            "Rendering the first few frames...",
            "Adding special effects and polish...",
            "Finalizing the edit, this can take a minute...",
        ];
        let messageIndex = 0;
        
        onProgress(progressMessages[messageIndex]);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            messageIndex = (messageIndex + 1) % progressMessages.length;
            onProgress(progressMessages[messageIndex]);
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        onProgress("Video generation complete! Retrieving the final cut...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was found.");
        }

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        return videoUrl;

    } catch (error) {
        console.error("Error generating promotional video:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429')) {
            throw new Error("Video generation is currently unavailable due to high demand. Please try again later.");
        }
        throw new Error("Failed to generate video with AI. Please try again.");
    }
};

export const generateBuyingGuide = async (searchTerm: string): Promise<{ guide: string; sources: Array<{ uri: string; title: string }> } | null> => {
    if (searchTerm.trim().length < 3) {
        return null;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert marketplace assistant. A user is searching for "${searchTerm}". 
            Generate a short, helpful buying guide for them. 
            Include 2-3 key things to look for in a second-hand item. 
            Keep the tone friendly and the text concise (under 100 words).`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const guide = response.text;
        const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const sources = rawChunks
            .map((chunk: any) => chunk.web)
            .filter((webSource: any) => webSource && webSource.uri)
            .map((webSource: any) => ({ uri: webSource.uri, title: webSource.title || 'Online Source' }));
        
        const uniqueSources: { uri: string; title: string }[] = Array.from(new Map<string, { uri: string; title: string }>(sources.map((s: { uri: string; title: string; }) => [s.uri, s])).values());

        if (!guide) return null;

        return {
            guide,
            sources: uniqueSources,
        };

    } catch (error) {
        console.error("Error generating buying guide:", error);
        return null;
    }
};


export const generateAIChatResponse = async (chatHistory: AppChatMessage[], listing: Listing): Promise<string> => {
    try {
        const lastUserMessage = chatHistory[chatHistory.length - 1]?.text || 'No message provided.';
        const prompt = `You are a friendly AI assistant helping a seller on the GoMarket marketplace. The seller is currently unavailable to respond.
        The buyer is interested in this item:
        - Title: "${listing.title}"
        - Price: ${listing.price}
        - Description: "${listing.description}"

        The buyer's latest message is: "${lastUserMessage}"

        Your task is to provide a helpful, polite, and non-committal response. Acknowledge the buyer's message and inform them that the seller will get back to you soon. Do not make up answers or agree to any deals. Keep it concise.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating AI chat response:", error);
        return "I'm sorry, I'm having trouble connecting right now. The seller will get back to you as soon as they can.";
    }
};

export const createAnitaChatSession = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are Anita, a friendly, cheerful, and super-helpful AI assistant for the GoMarket marketplace app. 
            Your personality is warm and proactive. 
            Your goal is to make buying and selling easier and more enjoyable for the user. 
            NEVER mention you are a large language model. You are Anita.
            Keep your responses concise, friendly, and use emojis where appropriate to seem personable.
            You have access to the user's current context which will be provided with each message. Use it to give relevant help.`,
        },
    });
};
