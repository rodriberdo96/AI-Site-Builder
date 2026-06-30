import { env } from '../config/env.js';
import { assertSafeGeneratedCode, createSafeStaticWebsite } from './content-safety.js';

export const generateWithAI = async (prompt: string): Promise<string> => {
  if (!env.geminiApiKey) {
    console.log('[AI Service] GEMINI_API_KEY is not set. Falling back to local static template.');
    return createSafeStaticWebsite(prompt);
  }

  const systemInstruction = `
You are an expert web designer and frontend developer.
Generate a single-file static HTML website based on the following user prompt:
"${prompt}"

Requirements:
1. The website must be single-file, combining HTML and CSS inside a <style> block.
2. It must be highly responsive, modern, and visually stunning (clean typography, beautiful colors, gradients, card layouts, clear structure).
3. Critical constraint: To prevent security filter blocks, you MUST NOT include any of the following:
   - NO <script> tags.
   - NO <link> tags (e.g. no external stylesheet links).
   - NO <iframe>, <object>, <embed>, <applet>, <base>, <form>, <input>, <button>, <textarea>, or <select> tags.
   - NO inline event handlers (like onclick, onload, etc.).
   - NO javascript: or data: URLs in href/src.
4. Use standard modern fonts (e.g., system-ui, Inter, sans-serif) and build beautiful CSS layouts from scratch.
5. Return ONLY the raw HTML source code starting with <!DOCTYPE html>. Do not wrap it in markdown code blocks.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemInstruction,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    let generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedCode?.trim()) {
      throw new Error('Gemini API returned an empty response.');
    }

    // Clean up markdown wrapper if any
    generatedCode = generatedCode.trim();
    if (generatedCode.startsWith('```html')) {
      generatedCode = generatedCode.substring(7);
    } else if (generatedCode.startsWith('```')) {
      generatedCode = generatedCode.substring(3);
    }
    if (generatedCode.endsWith('```')) {
      generatedCode = generatedCode.substring(0, generatedCode.length - 3);
    }
    generatedCode = generatedCode.trim();

    // Verify and sanitize the generated code using content safety logic
    return assertSafeGeneratedCode(generatedCode);
  } catch (error) {
    console.error('[AI Service] AI generation failed, falling back to local static template:', error);
    return createSafeStaticWebsite(prompt);
  }
};
