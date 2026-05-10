import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const VOICE_FILE = path.join(process.cwd(), 'data', 'voice-model.json');

export interface VoiceExample {
  original: string;
  edited: string;
}

export function loadVoiceModel(): { examples: VoiceExample[] } {
  try {
    if (!existsSync(VOICE_FILE)) {
      return { examples: [] };
    }
    const data = readFileSync(VOICE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load voice model:', error);
    return { examples: [] };
  }
}

export function saveEdit(original: string, edited: string) {
  try {
    const model = loadVoiceModel();
    model.examples.push({ original, edited });
    
    // Keep only the last 20 examples to stay within prompt limits
    if (model.examples.length > 20) {
      model.examples = model.examples.slice(-20);
    }
    
    writeFileSync(VOICE_FILE, JSON.stringify(model, null, 2));
    console.log('Voice model updated with new example.');
  } catch (error) {
    console.error('Failed to save to voice model:', error);
  }
}
