/**
 * aiChatEngine.ts
 * DriveMind Conversational Companion Engine
 * Warm, human, friendly tone like a real co-pilot companion sitting next to you.
 * No formal/robotic system headers like "**Driving Status**" or "**Continuous Drive Duration**".
 */

import { RouteInfo, WeatherInfo, DrivingScenario } from '../types/infotainment';

const ABUSIVE_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|bastard|dick|cunt|slut|whore|motherfucker|piss)\b/i,
  /\b(idiot|stupid|dumb|fool|shut up|hate you|ugly|loser)\b/i,
  /\b(kill|suicide|die|bomb|attack|murder|stab|terror|weapon|harm|abuse)\b/i,
  /\b(nigger|faggot|retard|spic|chink)\b/i,
];

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatContext {
  currentRoute: RouteInfo | null;
  weather: WeatherInfo;
  activeScenario: DrivingScenario;
  driveDurationHours: number;
  simulatedSpeedKmH: number;
  userName?: string;
  history: ChatTurn[];
}

export interface AIChatResponse {
  text: string;
  isModerated: boolean;
  extractedName?: string;
  action?: {
    label: string;
    actionType: 'REROUTE' | 'SOS' | 'WEATHER_RAIN' | 'TRAFFIC_SCENARIO' | 'REST_STOPS';
  };
}

export class AIChatEngine {
  /**
   * Safety moderation check
   */
  public static isAbusiveOrUnfriendly(input: string): boolean {
    const text = input.trim();
    return ABUSIVE_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Extract name if user introduces themselves
   */
  public static extractName(input: string): string | null {
    const text = input.trim();
    const patterns = [
      /\bmy name is ([a-zA-Z]+)\b/i,
      /\bmy name's ([a-zA-Z]+)\b/i,
      /\bi am ([a-zA-Z]+)\b/i,
      /\bi'm ([a-zA-Z]+)\b/i,
      /\bcall me ([a-zA-Z]+)\b/i,
      /\bthis is ([a-zA-Z]+)\b/i,
    ];

    for (const pat of patterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        const ignoreList = ['driving', 'here', 'fine', 'good', 'ready', 'happy', 'tired', 'going', 'navigating', 'user'];
        if (!ignoreList.includes(name.toLowerCase())) {
          return name;
        }
      }
    }
    return null;
  }

  /**
   * Generate natural, warm, companion-like response
   */
  public static generateResponse(userInput: string, context: AIChatContext): AIChatResponse {
    const query = userInput.trim();
    const qLower = query.toLowerCase();

    // 1. Friendly Safety Filter
    if (this.isAbusiveOrUnfriendly(query)) {
      const namePart = context.userName ? ` ${context.userName}` : '';
      return {
        text: `I'm sorry${namePart}, but I can't really respond to that kind of language. Let's keep things friendly and positive! How can I help you out today?`,
        isModerated: true,
      };
    }

    // 2. Name Introduction
    const newlyExtractedName = this.extractName(query);
    const activeUserName = newlyExtractedName || context.userName;
    const namePart = activeUserName ? ` ${activeUserName}` : '';

    if (newlyExtractedName) {
      return {
        text: `Hey ${newlyExtractedName}! Great to meet you. I'm your DriveMind companion—here to keep you company and help out with anything on your drive. How are you feeling today?`,
        isModerated: false,
        extractedName: newlyExtractedName,
      };
    }

    // 3. Fatigue / Tiredness / Rest Stop ("i feel tired", "im tired", "need coffee")
    if (qLower.includes('tired') || qLower.includes('sleep') || qLower.includes('exhausted') || qLower.includes('fatigue') || qLower.includes('rest') || qLower.includes('coffee') || qLower.includes('dhaba') || qLower.includes('break')) {
      let text = `Oh, let's check if there are any shops, hotels, or restaurants nearby! You've been driving for about ${context.driveDurationHours.toFixed(1)} hours. Do you have any preferences, like a hot coffee, tea, or a highway dhaba?`;
      
      return {
        text,
        isModerated: false,
        action: { label: '☕ Locate Nearby Highway Rest Stops', actionType: 'REST_STOPS' },
      };
    }

    // 4. Weather ("how's the weather", "is it raining")
    if (qLower.includes('weather') || qLower.includes('rain') || qLower.includes('temp') || qLower.includes('forecast') || qLower.includes('cloud') || qLower.includes('hot') || qLower.includes('cold')) {
      const w = context.weather;
      let text = `The weather around ${w.locationName} is currently ${w.condition.toLowerCase()} at ${w.tempC}°C. `;

      if (w.condition.includes('Rain') || w.condition.includes('Thunder')) {
        text += `Since it's wet out there, make sure to slow down a bit and keep your headlights on so you stay safe!`;
      } else {
        text += `The roads are clear and dry right now, perfect for a smooth drive!`;
      }

      return {
        text,
        isModerated: false,
        action: w.condition !== 'Heavy Rain' ? { label: '🌧️ Test Heavy Rain Mode', actionType: 'WEATHER_RAIN' } : undefined,
      };
    }

    // 5. Traffic / Route / Shortcuts / Delays
    if (qLower.includes('traffic') || qLower.includes('route') || qLower.includes('shortcut') || qLower.includes('delay') || qLower.includes('reroute') || qLower.includes('eta') || qLower.includes('distance')) {
      const r = context.currentRoute;
      if (!r) {
        return {
          text: `You don't have an active route set up yet${namePart}. Type in your start and destination above, and I'll calculate the best road path for us!`,
          isModerated: false,
        };
      }

      if (r.savingsMinutes) {
        return {
          text: `I noticed a faster bypass route that can save us about ${r.savingsMinutes} minutes! Would you like me to switch us to that shortcut?`,
          isModerated: false,
          action: { label: `⚡ Switch to Bypass Route (-${r.savingsMinutes}m)`, actionType: 'REROUTE' },
        };
      }

      return {
        text: `Traffic is looking pretty good on our ${r.title} route! We have about ${r.distanceKm} km to go (${r.durationMinutes} mins). I'll keep watching the road ahead for any bottlenecks.`,
        isModerated: false,
        action: { label: '🚦 Test Heavy Traffic Reroute', actionType: 'TRAFFIC_SCENARIO' },
      };
    }

    // 6. Emergency / SOS / Hospital / Police
    if (qLower.includes('emergency') || qLower.includes('hospital') || qLower.includes('police') || qLower.includes('accident') || qLower.includes('ambulance') || qLower.includes('sos') || qLower.includes('help')) {
      return {
        text: `Oh no, are you alright${namePart}? If you need immediate medical help, police dispatch, or breakdown assistance, tap the emergency button below right away and I'll broadcast your location to nearby hospitals!`,
        isModerated: false,
        action: { label: '🚨 ACTIVATE EMERGENCY SOS', actionType: 'SOS' },
      };
    }

    // 7. Small talk & Feelings ("how are you", "im fine", "good morning", "thanks")
    if (qLower.match(/\b(how are you|how r u|how are u|how do you do|how's it going)\b/)) {
      return {
        text: `I'm doing awesome, thanks for asking${namePart}! Ready for whatever the road throws at us. How are you feeling today?`,
        isModerated: false,
      };
    }

    if (qLower.match(/\b(i am fine|i'm fine|i am good|i'm good|doing well|all good|great|awesome|doing great)\b/)) {
      return {
        text: `Glad to hear that${namePart}! 😊 Just let me know if you need music, route updates, or if you want to pull over for a snack.`,
        isModerated: false,
      };
    }

    if (qLower.match(/\b(good morning|good afternoon|good evening|good night)\b/)) {
      const greeting = qLower.includes('morning') ? 'Good morning'
        : qLower.includes('afternoon') ? 'Good afternoon'
        : qLower.includes('evening') ? 'Good evening'
        : 'Good night';

      return {
        text: `${greeting}${namePart}! Hope you have a pleasant and safe drive. What can I help you with?`,
        isModerated: false,
      };
    }

    if (qLower.match(/\b(thank you|thanks|thx|thank u)\b/)) {
      return {
        text: `Anytime${namePart}! I'm always right here with you. Drive safe! 🚗`,
        isModerated: false,
      };
    }

    // 8. Greetings & Identity ("hi", "hello", "who are you")
    if (qLower.match(/\b(hi|hello|hey|greetings|who are you|what can you do)\b/)) {
      return {
        text: `Hey${namePart}! I'm your DriveMind companion. I sit right here with you to monitor traffic, weather, and keep you company. Ask me anything or tell me how you're feeling!`,
        isModerated: false,
      };
    }

    // 9. General Questions / Jokes / Natural Open-ended Chat
    return {
      text: this.generateNaturalCompanionAnswer(query, activeUserName, context),
      isModerated: false,
    };
  }

  /**
   * Generates warm, companion-like answers for any general question or topic.
   */
  private static generateNaturalCompanionAnswer(query: string, userName: string | undefined, context: AIChatContext): string {
    const qLower = query.toLowerCase();
    const namePrefix = userName ? `${userName}, ` : '';

    // Math
    if (qLower.match(/^(\d+|\s|\+|\-|\*|\/|\(|\)|\^|percent|calculate|math)+$/) || qLower.includes('calculate') || qLower.includes('math')) {
      try {
        const sanitized = query.replace(/[^0-9+\-*/().]/g, '');
        if (sanitized.length > 0) {
          const evalResult = eval(sanitized);
          return `${namePrefix}the answer to \`${query}\` is **${evalResult}**!`;
        }
      } catch (e) {
        // fallback
      }
    }

    // Jokes
    if (qLower.includes('joke') || qLower.includes('funny') || qLower.includes('laugh')) {
      const jokes = [
        `Here's one for the road, ${userName || 'my friend'}: Why don't cars ever get tired? Because they have plenty of wheels to rest on! 🚗😄`,
        `What kind of car does a Jedi drive? A Toy-Yoda! 🌌🚗`,
        `Why did the computer take a car to work? Because it wanted to improve its drive! 💻`,
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Space & Curiosity
    if (qLower.includes('space') || qLower.includes('moon') || qLower.includes('sun') || qLower.includes('planet') || qLower.includes('earth')) {
      return `${namePrefix}did you know the Moon is about 384,400 km away? If we drove a car straight there at 100 km/h without stopping, it would take us almost 5 months! 🌕🚗`;
    }

    // Catch-all natural companion reply — never repeats the user's message
    const fallbacks = [
      `${namePrefix}got it! I'm here whenever you need me. Want me to check on traffic, weather, or find something nearby?`,
      `${namePrefix}sounds good! Just let me know if there's anything you need — a rest stop, route update, or just some company on the drive.`,
      `${namePrefix}sure thing! I'm keeping an eye on the road ahead for you. Anything specific you want me to check?`,
      `${namePrefix}understood! I'm right here with you. Want any updates on the route or weather right now?`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
