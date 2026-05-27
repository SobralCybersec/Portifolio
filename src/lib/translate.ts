export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

/** Strip newline/carriage-return chars to prevent log injection (CWE-117). */
function sanitizeLog(value: unknown): string {
  return String(value).replace(/[
]/g, ' ');
}

const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'];

export async function translateText(
  text: string,
  targetLocale: string,
  sourceLocale: string = 'en'
): Promise<string> {
  if (sourceLocale === targetLocale) {
    return text;
  }

  if (!text || text.trim().length === 0) {
    return text;
  }

  // Check if Groq API key is available
  if (process.env.GROQ_API_KEY) {
    return translateWithGroq(text, targetLocale, sourceLocale);
  }

  // Default to MyMemory API
  return translateWithMyMemory(text, targetLocale, sourceLocale);
}

async function translateWithMyMemory(
  text: string,
  targetLocale: string,
  sourceLocale: string
): Promise<string> {
  try {
    const sourceLang = mapLocaleToLanguageCode(sourceLocale);
    const targetLang = mapLocaleToLanguageCode(targetLocale);
    
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('MyMemory API error:', sanitizeLog(response.status), sanitizeLog(response.statusText));
      return text;
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    console.error('MyMemory translation failed:', sanitizeLog(data.responseStatus));
    return text;
  } catch (error) {
    console.error('MyMemory translation error:', sanitizeLog(error));
    return text;
  }
}

async function translateWithGroq(
  text: string,
  targetLocale: string,
  sourceLocale: string,
  retryCount: number = 0
): Promise<string> {
  const maxRetries = 3;
  const baseDelay = 2000;
  
  try {
    const targetLangName = getLanguageName(targetLocale);
    const apiKey = process.env.GROQ_API_KEY;
    
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Your task is to translate text accurately while preserving formatting, meaning, and tone. Return ONLY the translated text without any explanations, alternatives, or additional commentary.'
            },
            {
              role: 'user',
              content: `Translate the following text from ${getLanguageName(sourceLocale)} to ${targetLangName}. Return only the translation:\n\n${text}`
            }
          ],
          temperature: 0.1,
          max_tokens: 8192,
          reasoning_effort: 'medium'
        })
      }
    );

    if (response.status === 429) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 1000;
        console.warn(`Groq rate limit hit. Retrying in ${Math.round(delay/1000)}s (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return translateWithGroq(text, targetLocale, sourceLocale, retryCount + 1);
      }
      console.error('Groq rate limit exceeded, falling back to MyMemory');
      return translateWithMyMemory(text, targetLocale, sourceLocale);
    }

    if (!response.ok) {
      console.error('Groq API error:', sanitizeLog(response.status));
      return translateWithMyMemory(text, targetLocale, sourceLocale);
    }

    const data = await response.json();
    let translation = data.choices?.[0]?.message?.content;
    
    if (translation) {
      translation = translation.trim();
      
      // Remove any markdown formatting that might have been added
      translation = translation.replace(/^```.*\n|\n```$/g, '');
      
      // Extract most accurate translation if alternatives are provided
      const alternativeMatch = translation.match(/(?:Alternatively|Or|More accurate(?:ly)?|Better translation)[,:.]?\s*(.+?)(?:\.|$)/i);
      if (alternativeMatch && alternativeMatch[1]) {
        translation = alternativeMatch[1].trim();
      }
      
      // Remove any remaining explanatory text or prefixes
      translation = translation.replace(/^(?:Translation|Here is the translation|The translation is)[:\s]*/i, '');
      translation = translation.split(/\n/)[0].trim();
      
      return translation;
    }
    
    return translateWithMyMemory(text, targetLocale, sourceLocale);
  } catch (error) {
    console.error('Groq translation error:', sanitizeLog(error));
    return translateWithMyMemory(text, targetLocale, sourceLocale);
  }
}




function mapLocaleToLanguageCode(locale: string): string {
  const mapping: Record<string, string> = {
    en: 'en',
    es: 'es',
    pt: 'pt',
    fr: 'fr',
    de: 'de',
    ja: 'ja',
    zh: 'zh',
  };
  return mapping[locale] || 'en';
}

function getLanguageName(locale: string): string {
  const names: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    pt: 'Portuguese',
    fr: 'French',
    de: 'German',
    ja: 'Japanese',
    zh: 'Chinese',
  };
  return names[locale] || 'English';
}

export function getSupportedLocales(): string[] {
  return SUPPORTED_LOCALES;
}
