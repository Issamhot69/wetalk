import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class TranslationService {
  private client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const msg = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Translate this text to ${targetLang}. Return ONLY the translation, nothing else.\n\nText: ${text}`,
        }],
      });
      return (msg.content[0] as any).text?.trim() || text;
    } catch {
      return text;
    }
  }
}
