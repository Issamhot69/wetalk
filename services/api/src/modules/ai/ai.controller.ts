import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TranslationService } from './translation.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

const COMPLETIONS: Record<string, string[]> = {
  'kiss':      ['💋 bisous', 'bisous 💋💋', '💋 je pense à toi'],
  'love':      ['❤️ je t\'aime', 'je t\'aime tellement ❤️', '💕 mon amour'],
  'hug':       ['🤗 gros câlin', '🫂 je t\'embrasse', 'câlin virtuel 🤗'],
  'sad':       ['😢 ça va ?', 'je suis là 💙', '🫂 courage'],
  'happy':     ['😊 super !', '🎉 génial !', '🌟 excellent !'],
  'merci':     ['🙏 de rien !', 'avec plaisir 😊', '💖 bien sûr !'],
  'bonjour':   ['👋 bonjour !', 'bonjour, ça va ? 😊', '🌟 bonne journée !'],
  'bonsoir':   ['🌙 bonsoir !', 'bonne soirée 🌙', '✨ à bientôt !'],
  'bravo':     ['👏 félicitations !', '🏆 super travail !', '🎉 bien joué !'],
  'super':     ['🔥 génial !', '⚡ fantastique !', '🚀 excellent !'],
  'lol':       ['😂😂 trop drôle', '🤣 je suis mort', '😂 hilarant !'],
  'manque':    ['💕 tu me manques', '🥺 viens vite', '💭 je pense à toi'],
  'fatigue':   ['😴 repose-toi', '💤 bonne nuit !', '🛌 dors bien'],
  'cool':      ['😎 trop cool !', '🤙 parfait !', '🔥 styLe !'],
}

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private translationService: TranslationService) {}

  @Post('translate')
  async translate(@Body() body: { text: string; targetLang: string }) {
    const translated = await this.translationService.translate(body.text, body.targetLang)
    return { original: body.text, translated, targetLang: body.targetLang }
  }

  @Post('complete')
  async complete(@Body() body: { text: string }) {
    const lower = body.text.toLowerCase()
    for (const [trigger, suggestions] of Object.entries(COMPLETIONS)) {
      if (lower.includes(trigger)) {
        return { suggestions, trigger }
      }
    }
    // Génère des suggestions basiques
    const suggestions = [
      body.text + ' 😊',
      body.text + ' ❤️',
      body.text + ' 🙏',
    ]
    return { suggestions }
  }
}
