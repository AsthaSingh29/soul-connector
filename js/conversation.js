/**
 * SOUL CONNECTOR — CONVERSATION & KEYWORD AI ENGINE
 * Handles keyword matching against Tony's memory database,
 * fallback responses, speech synthesis (TTS), and speech recognition (STT).
 */

class ConversationEngine {
  constructor(profileData) {
    this.profile = profileData;
    this.isSpeaking = false;
    this.synth = window.speechSynthesis || null;
    this.recognition = null;
    this.initSpeechRecognition();
  }

  updateProfile(profileData) {
    this.profile = profileData;
  }

  /**
   * Match question against personal memory database using keywords & intent
   */
  processQuery(userInput) {
    if (!userInput || typeof userInput !== 'string') {
      return {
        text: "I'm right here with you. What would you like to ask or talk about?",
        source: "default"
      };
    }

    const cleanInput = userInput.toLowerCase().trim();

    // 1. Direct match with configured messages
    if (this.profile && this.profile.messages && Array.isArray(this.profile.messages)) {
      for (const item of this.profile.messages) {
        if (item.keywords && Array.isArray(item.keywords)) {
          const match = item.keywords.some(keyword => cleanInput.includes(keyword.toLowerCase()));
          if (match) {
            return {
              text: item.answer,
              question: item.question,
              source: "keyword_memory"
            };
          }
        }
      }
    }

    // 2. Secondary check against specific memories in the profile
    if (this.profile && this.profile.memories) {
      for (const mem of this.profile.memories) {
        if (mem.tags && mem.tags.some(t => cleanInput.includes(t.toLowerCase()))) {
          return {
            text: `${mem.description}`,
            question: mem.title,
            source: "memory_bank"
          };
        }
      }
    }

    // 3. Questions about identity, relationship, daughter
    if (cleanInput.includes("who are you") || cleanInput.includes("your name")) {
      return {
        text: `I'm ${this.profile.name || "Tony"}, your ${this.profile.relationship || "father"}. I left these memories so you could always hear my thoughts.`,
        source: "profile_meta"
      };
    }

    if (cleanInput.includes("daughter") || cleanInput.includes("advice") || cleanInput.includes("letter")) {
      return {
        text: this.profile.daughterMessage || "Always believe in yourself. No matter where life takes you, I'll always be proud of you.",
        source: "profile_daughter_msg"
      };
    }

    // 4. Safe prototype fallback with transparent boundary
    return {
      text: "I don't have a specific memory recorded for that. But remember: take your time, trust your instincts, and keep the good memories close.",
      source: "fallback_boundary"
    };
  }

  /**
   * Natural fatherly voice synthesis using Web Speech API
   */
  speak(text, onStart, onEnd) {
    if (!this.synth) {
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 2500);
      return;
    }

    // Cancel any ongoing utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Pick an appropriate natural English male/deep voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("George") || v.name.includes("Google UK English Male") || v.name.includes("Natural")) && v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.pitch = 0.92; // Slightly warmer, deeper fatherly pitch
    utterance.rate = 0.92;  // Deliberate, calm cadence
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Web Speech Recognition for voice queries
   */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  startListening(onResult, onEnd, onError) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition not supported in this browser. Please type your question.");
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    this.recognition.onerror = (err) => {
      console.warn("Recognition error:", err);
      if (onError) onError("Microphone error or permission denied.");
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }
  }
}

// Export as ES module and global fallback
window.ConversationEngine = ConversationEngine;
export default ConversationEngine;
