export type Lang = 
  | 'fr' | 'en' | 'ar' | 'es' | 'ru' | 'zh' | 'hi' | 'pt' | 'de' | 'ja'
  | 'ko' | 'it' | 'tr' | 'pl' | 'nl' | 'sv' | 'da' | 'fi' | 'no' | 'cs'
  | 'ro' | 'hu' | 'el' | 'he' | 'fa' | 'ur' | 'bn' | 'vi' | 'th' | 'id'
  | 'ms' | 'uk' | 'bg' | 'hr' | 'sk' | 'sl' | 'lt' | 'lv' | 'et' | 'sw'

export const languages: { code: Lang; label: string; flag: string; rtl?: boolean; nativeName: string }[] = [
  { code: 'fr', label: 'French',     flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', label: 'English',    flag: '🇬🇧', nativeName: 'English' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦', nativeName: 'العربية',   rtl: true },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸', nativeName: 'Español' },
  { code: 'ru', label: 'Russian',    flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'zh', label: 'Chinese',    flag: '🇨🇳', nativeName: '中文' },
  { code: 'hi', label: 'Hindi',      flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'pt', label: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'de', label: 'German',     flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'ja', label: 'Japanese',   flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', label: 'Korean',     flag: '🇰🇷', nativeName: '한국어' },
  { code: 'it', label: 'Italian',    flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'tr', label: 'Turkish',    flag: '🇹🇷', nativeName: 'Türkçe' },
  { code: 'pl', label: 'Polish',     flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'nl', label: 'Dutch',      flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'sv', label: 'Swedish',    flag: '🇸🇪', nativeName: 'Svenska' },
  { code: 'da', label: 'Danish',     flag: '🇩🇰', nativeName: 'Dansk' },
  { code: 'fi', label: 'Finnish',    flag: '🇫🇮', nativeName: 'Suomi' },
  { code: 'no', label: 'Norwegian',  flag: '🇳🇴', nativeName: 'Norsk' },
  { code: 'cs', label: 'Czech',      flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'ro', label: 'Romanian',   flag: '🇷🇴', nativeName: 'Română' },
  { code: 'hu', label: 'Hungarian',  flag: '🇭🇺', nativeName: 'Magyar' },
  { code: 'el', label: 'Greek',      flag: '🇬🇷', nativeName: 'Ελληνικά' },
  { code: 'he', label: 'Hebrew',     flag: '🇮🇱', nativeName: 'עברית',    rtl: true },
  { code: 'fa', label: 'Persian',    flag: '🇮🇷', nativeName: 'فارسی',    rtl: true },
  { code: 'ur', label: 'Urdu',       flag: '🇵🇰', nativeName: 'اردو',     rtl: true },
  { code: 'bn', label: 'Bengali',    flag: '🇧🇩', nativeName: 'বাংলা' },
  { code: 'vi', label: 'Vietnamese', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'th', label: 'Thai',       flag: '🇹🇭', nativeName: 'ภาษาไทย' },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Malay',      flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
  { code: 'uk', label: 'Ukrainian',  flag: '🇺🇦', nativeName: 'Українська' },
  { code: 'bg', label: 'Bulgarian',  flag: '🇧🇬', nativeName: 'Български' },
  { code: 'hr', label: 'Croatian',   flag: '🇭🇷', nativeName: 'Hrvatski' },
  { code: 'sk', label: 'Slovak',     flag: '🇸🇰', nativeName: 'Slovenčina' },
  { code: 'sl', label: 'Slovenian',  flag: '🇸🇮', nativeName: 'Slovenščina' },
  { code: 'lt', label: 'Lithuanian', flag: '🇱🇹', nativeName: 'Lietuvių' },
  { code: 'lv', label: 'Latvian',    flag: '🇱🇻', nativeName: 'Latviešu' },
  { code: 'et', label: 'Estonian',   flag: '🇪🇪', nativeName: 'Eesti' },
  { code: 'sw', label: 'Swahili',    flag: '🇰🇪', nativeName: 'Kiswahili' },
]

export const t: Record<string, Record<string, string>> = {
  fr: { messages:'Messages', search:'Rechercher...', online:'En ligne', offline:'Hors ligne', typing:'écrit...', send:'Envoyer', chats:'Chats', contacts:'Contacts', alerts:'Alertes', settings:'Réglages', newGroup:'Nouveau groupe', startConv:'Commencez la conversation', noMessages:'Aucun message', deleted:'Message supprimé', aiActive:'IA active', messagePlaceholder:'Message à', logout:'Déconnexion', language:'Langue', translate:'Traduire', audio:'Audio', dashboard:'Tableau de bord', users:'Utilisateurs', totalMessages:'Total messages', activeNow:'Actifs maintenant' },
  en: { messages:'Messages', search:'Search...', online:'Online', offline:'Offline', typing:'is typing...', send:'Send', chats:'Chats', contacts:'Contacts', alerts:'Alerts', settings:'Settings', newGroup:'New group', startConv:'Start the conversation', noMessages:'No messages', deleted:'Message deleted', aiActive:'AI active', messagePlaceholder:'Message to', logout:'Logout', language:'Language', translate:'Translate', audio:'Audio', dashboard:'Dashboard', users:'Users', totalMessages:'Total messages', activeNow:'Active now' },
  ar: { messages:'الرسائل', search:'بحث...', online:'متصل', offline:'غير متصل', typing:'يكتب...', send:'إرسال', chats:'محادثات', contacts:'جهات الاتصال', alerts:'تنبيهات', settings:'إعدادات', newGroup:'مجموعة جديدة', startConv:'ابدأ المحادثة', noMessages:'لا رسائل', deleted:'تم الحذف', aiActive:'الذكاء الاصطناعي نشط', messagePlaceholder:'رسالة إلى', logout:'خروج', language:'اللغة', translate:'ترجمة', audio:'صوت', dashboard:'لوحة التحكم', users:'المستخدمون', totalMessages:'إجمالي الرسائل', activeNow:'نشط الآن' },
  ru: { messages:'Сообщения', search:'Поиск...', online:'Онлайн', offline:'Офлайн', typing:'печатает...', send:'Отправить', chats:'Чаты', contacts:'Контакты', alerts:'Уведомления', settings:'Настройки', newGroup:'Новая группа', startConv:'Начните разговор', noMessages:'Нет сообщений', deleted:'Удалено', aiActive:'ИИ активен', messagePlaceholder:'Сообщение для', logout:'Выйти', language:'Язык', translate:'Перевести', audio:'Аудио', dashboard:'Панель', users:'Пользователи', totalMessages:'Всего сообщений', activeNow:'Активны сейчас' },
  es: { messages:'Mensajes', search:'Buscar...', online:'En línea', offline:'Desconectado', typing:'está escribiendo...', send:'Enviar', chats:'Chats', contacts:'Contactos', alerts:'Alertas', settings:'Ajustes', newGroup:'Nuevo grupo', startConv:'Inicia la conversación', noMessages:'Sin mensajes', deleted:'Eliminado', aiActive:'IA activa', messagePlaceholder:'Mensaje a', logout:'Salir', language:'Idioma', translate:'Traducir', audio:'Audio', dashboard:'Panel', users:'Usuarios', totalMessages:'Total mensajes', activeNow:'Activos ahora' },
  zh: { messages:'消息', search:'搜索...', online:'在线', offline:'离线', typing:'正在输入...', send:'发送', chats:'聊天', contacts:'联系人', alerts:'提醒', settings:'设置', newGroup:'新建群组', startConv:'开始对话', noMessages:'没有消息', deleted:'已删除', aiActive:'AI活跃', messagePlaceholder:'发消息给', logout:'退出', language:'语言', translate:'翻译', audio:'音频', dashboard:'仪表板', users:'用户', totalMessages:'总消息', activeNow:'当前活跃' },
  hi: { messages:'संदेश', search:'खोजें...', online:'ऑनलाइन', offline:'ऑफलाइन', typing:'टाइप कर रहे हैं...', send:'भेजें', chats:'चैट', contacts:'संपर्क', alerts:'अलर्ट', settings:'सेटिंग', newGroup:'नया समूह', startConv:'बातचीत शुरू करें', noMessages:'कोई संदेश नहीं', deleted:'हटाया गया', aiActive:'AI सक्रिय', messagePlaceholder:'संदेश', logout:'लॉगआउट', language:'भाषा', translate:'अनुवाद', audio:'ऑडियो', dashboard:'डैशबोर्ड', users:'उपयोगकर्ता', totalMessages:'कुल संदेश', activeNow:'अभी सक्रिय' },
  de: { messages:'Nachrichten', search:'Suchen...', online:'Online', offline:'Offline', typing:'schreibt...', send:'Senden', chats:'Chats', contacts:'Kontakte', alerts:'Benachrichtigungen', settings:'Einstellungen', newGroup:'Neue Gruppe', startConv:'Gespräch beginnen', noMessages:'Keine Nachrichten', deleted:'Gelöscht', aiActive:'KI aktiv', messagePlaceholder:'Nachricht an', logout:'Abmelden', language:'Sprache', translate:'Übersetzen', audio:'Audio', dashboard:'Dashboard', users:'Benutzer', totalMessages:'Nachrichten gesamt', activeNow:'Jetzt aktiv' },
  ja: { messages:'メッセージ', search:'検索...', online:'オンライン', offline:'オフライン', typing:'入力中...', send:'送信', chats:'チャット', contacts:'連絡先', alerts:'通知', settings:'設定', newGroup:'グループ作成', startConv:'会話を始める', noMessages:'メッセージなし', deleted:'削除済み', aiActive:'AI起動中', messagePlaceholder:'メッセージ', logout:'ログアウト', language:'言語', translate:'翻訳', audio:'音声', dashboard:'ダッシュボード', users:'ユーザー', totalMessages:'総メッセージ', activeNow:'現在アクティブ' },
  pt: { messages:'Mensagens', search:'Pesquisar...', online:'Online', offline:'Offline', typing:'está digitando...', send:'Enviar', chats:'Chats', contacts:'Contatos', alerts:'Alertas', settings:'Configurações', newGroup:'Novo grupo', startConv:'Inicie a conversa', noMessages:'Sem mensagens', deleted:'Excluído', aiActive:'IA ativa', messagePlaceholder:'Mensagem para', logout:'Sair', language:'Idioma', translate:'Traduzir', audio:'Áudio', dashboard:'Painel', users:'Usuários', totalMessages:'Total mensagens', activeNow:'Ativos agora' },
}

// Fallback to English for languages not fully translated
export const getT = (lang: string) => t[lang] || t['en']
