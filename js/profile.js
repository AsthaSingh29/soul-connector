/**
 * SOUL CONNECTOR — PROFILE MANAGEMENT & CREATOR (SCENE 2)
 * Handles profile persistence, Tony's demo preset, and voice recording widget.
 */

const STORAGE_KEY = 'soul_connector_profile_data';

class ProfileManager {
  constructor() {
    this.currentProfile = null;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordedAudioBlob = null;
    this.recordTimer = null;
    this.secondsRecorded = 0;
  }

  /**
   * Load profile from LocalStorage, falling back to bundled JSON
   */
  async loadProfile() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        this.currentProfile = JSON.parse(cached);
        return this.currentProfile;
      } catch (e) {
        console.warn("Failed to parse cached profile:", e);
      }
    }

    // Fetch from data/soul-profile.json
    try {
      const response = await fetch('data/soul-profile.json');
      if (response.ok) {
        this.currentProfile = await response.json();
        this.saveToStorage(this.currentProfile);
        return this.currentProfile;
      }
    } catch (err) {
      console.warn("Could not fetch soul-profile.json directly, using embedded fallback:", err);
    }

    // Guaranteed embedded Tony preset fallback
    this.currentProfile = this.getDefaultTonyPreset();
    this.saveToStorage(this.currentProfile);
    return this.currentProfile;
  }

  saveToStorage(profile) {
    this.currentProfile = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  getProfile() {
    return this.currentProfile || this.getDefaultTonyPreset();
  }

  /**
   * Reset data to Tony's original preset
   */
  resetToDefault() {
    this.currentProfile = this.getDefaultTonyPreset();
    this.saveToStorage(this.currentProfile);
    return this.currentProfile;
  }

  getDefaultTonyPreset() {
    return {
      "name": "Tony",
      "age": 52,
      "relationship": "Father",
      "personality": ["Caring", "Humorous", "Encouraging", "Gentle"],
      "tagline": "Always keep moving forward, and never forget where you came from.",
      "memories": [
        {
          "id": "mem-1",
          "title": "Family Trip to Darjeeling",
          "category": "travel",
          "date": "Summer 2018",
          "description": "Our unforgettable family trip to Darjeeling. You were so excited to see the sunrise over Kanchenjunga that you barely slept the night before. We shared steaming plates of momos on Mall Road while wrapped in woolen shawls.",
          "image": "assets/images/family-trip.svg",
          "tags": ["travel", "mountains", "darjeeling", "momos"]
        },
        {
          "id": "mem-2",
          "title": "Teaching You to Ride a Bicycle",
          "category": "milestone",
          "date": "Autumn 2010",
          "description": "The golden afternoon in our neighborhood park when we took off your training wheels. You were terrified, but I held onto the seat until suddenly I let go—and you looked back grinning, realizing you were flying on your own.",
          "image": "assets/images/bicycle.svg",
          "tags": ["bicycle", "park", "childhood", "milestone"]
        },
        {
          "id": "mem-3",
          "title": "Sunday Momo Tradition",
          "category": "lifestyle",
          "date": "Lifelong tradition",
          "description": "Whenever Sunday rolled around or the rain poured outside, we'd gather in the kitchen making steaming hot chicken and veg momos with extra spicy red chili chutney.",
          "image": "assets/images/momos.svg",
          "tags": ["food", "momos", "cooking", "comfort"]
        },
        {
          "id": "mem-4",
          "title": "Favorite Song: 'Stand By Me'",
          "category": "music",
          "date": "Every road trip",
          "description": "'When the night has come, and the land is dark...' This song played on cassette and then Bluetooth every single time we drove out to the hills.",
          "image": "assets/images/music.svg",
          "tags": ["song", "music", "roadtrip"]
        }
      ],
      "messages": [
        {
          "keywords": ["trip", "darjeeling", "vacation", "holiday", "travel", "mountain"],
          "question": "What was our favorite trip?",
          "answer": "Our Darjeeling trip. You were so excited to see the snow peaks that you barely slept the night before. And remember those steaming plates of momos at Mall Road? Nothing tasted better."
        },
        {
          "keywords": ["proud", "accomplish", "proud of", "achievement"],
          "question": "What are you proud of?",
          "answer": "I have always been proud of the person you've become. Not just the big wins, but the kindness, honesty, and courage you show every single day."
        },
        {
          "keywords": ["tell", "always tell", "advice", "wisdom", "remember", "life lesson", "believe"],
          "question": "What did you always tell me?",
          "answer": "I always told you: 'Always believe in yourself. No matter where life takes you or how stormy the sea gets, keep your head high. You have everything you need inside you.'"
        },
        {
          "keywords": ["food", "eat", "momo", "cook", "hungry", "dish", "favorite food"],
          "question": "What was your favorite food?",
          "answer": "Steaming hot Darjeeling momos with that fiery homemade red chili chutney! Especially when we all made them together on rainy Sunday afternoons."
        },
        {
          "keywords": ["bike", "bicycle", "park", "ride", "fall", "riding"],
          "question": "Do you remember the day I learned to ride a bike?",
          "answer": "How could I forget? You were clinging to the handlebars terrified. When I quietly let go of the saddle and you kept pedaling all across the green, your smile lit up the entire park."
        },
        {
          "keywords": ["music", "song", "listen", "sing"],
          "question": "What was your favorite song?",
          "answer": "'Stand By Me'. Every single time we were in the car hitting the highway, we would blast it and sing along off-key together."
        },
        {
          "keywords": ["miss", "sad", "crying", "alone", "lonely", "grief", "hard"],
          "question": "I really miss you.",
          "answer": "I know, sweetheart. Grief is just love with nowhere to go. Whenever you miss me, look at the night sky or remember the laughter we shared. I'm right here in your memories."
        },
        {
          "keywords": ["hello", "hi", "hey", "how are you", "there"],
          "question": "Hey Tony...",
          "answer": "Hey... you're finally here. It's so good to see you. Take your time, look around, and let's catch up."
        }
      ],
      "daughterMessage": "Always believe in yourself. No matter where life takes you, I'll always be proud of you.",
      "farewell": {
        "line1": "I may not be able to walk beside you anymore...",
        "pauseMs": 1800,
        "line2": "...but I wanted to leave you something you could always return to."
      }
    };
  }

  /**
   * Bind Form inputs to Profile Data in Scene 2
   */
  populateForm(profile) {
    const p = profile || this.getProfile();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('input-name', p.name);
    setVal('input-age', p.age);
    setVal('input-relationship', p.relationship);
    setVal('input-personality', Array.isArray(p.personality) ? p.personality.join(', ') : p.personality);
    
    // Find memories
    const tripMem = p.memories?.find(m => m.tags?.includes('darjeeling')) || p.memories?.[0];
    const foodMem = p.memories?.find(m => m.tags?.includes('food')) || p.memories?.[2];
    const songMem = p.memories?.find(m => m.tags?.includes('music')) || p.memories?.[3];

    setVal('input-fav-place', tripMem ? 'Darjeeling' : 'Darjeeling');
    setVal('input-fav-food', foodMem ? 'Momos' : 'Momos');
    setVal('input-fav-song', songMem ? 'Stand By Me' : 'Stand By Me');
    setVal('input-fav-memory', tripMem ? tripMem.description : "Our family trip to Darjeeling...");
    setVal('input-daughter-message', p.daughterMessage);
  }

  /**
   * Collect form inputs and update state
   */
  readForm() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const p = this.getProfile();
    p.name = getVal('input-name') || 'Tony';
    p.age = parseInt(getVal('input-age'), 10) || 52;
    p.relationship = getVal('input-relationship') || 'Father';
    
    const personalityStr = getVal('input-personality');
    p.personality = personalityStr ? personalityStr.split(',').map(s => s.trim()) : ['Caring', 'Humorous'];

    p.daughterMessage = getVal('input-daughter-message') || p.daughterMessage;

    const favTripDesc = getVal('input-fav-memory');
    if (favTripDesc && p.memories?.[0]) {
      p.memories[0].description = favTripDesc;
    }

    this.saveToStorage(p);
    return p;
  }

  /**
   * Voice recorder simulation / real mic recorder
   */
  setupVoiceRecorder(widgetElement, recordBtn, playBtn, statusLabel) {
    if (!widgetElement || !recordBtn) return;

    recordBtn.addEventListener('click', async () => {
      if (!this.isRecording) {
        // Start recording
        this.isRecording = true;
        widgetElement.classList.add('recording');
        recordBtn.innerHTML = '<span>⏹️ Stop Recording</span>';
        recordBtn.classList.remove('btn-secondary');
        recordBtn.classList.add('btn-primary');
        if (statusLabel) statusLabel.textContent = 'Recording in progress... (00:01)';

        this.secondsRecorded = 1;
        this.recordTimer = setInterval(() => {
          this.secondsRecorded++;
          const sec = this.secondsRecorded < 10 ? `0${this.secondsRecorded}` : this.secondsRecorded;
          if (statusLabel) statusLabel.textContent = `Recording in progress... (00:${sec})`;
        }, 1000);

        // Try getting audio stream
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = e => this.audioChunks.push(e.data);
            this.mediaRecorder.onstop = () => {
              this.recordedAudioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
              if (playBtn) playBtn.style.display = 'inline-flex';
            };
            this.mediaRecorder.start();
          } catch (e) {
            console.log("Mic access not granted, using simulated audio sample:", e);
          }
        }
      } else {
        // Stop recording
        this.isRecording = false;
        widgetElement.classList.remove('recording');
        recordBtn.innerHTML = '<span>🎙️ Re-record Voice</span>';
        recordBtn.classList.remove('btn-primary');
        recordBtn.classList.add('btn-secondary');
        clearInterval(this.recordTimer);
        if (statusLabel) statusLabel.innerHTML = '<span style="color:#10b981;">✓ Voice sample recorded (Tony - 00:04)</span>';

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        } else {
          if (playBtn) playBtn.style.display = 'inline-flex';
        }
      }
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.recordedAudioBlob) {
          const audioUrl = URL.createObjectURL(this.recordedAudioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
        } else {
          // Play simulated Tony voice via TTS
          if (window.app && window.app.conversationEngine) {
            window.app.conversationEngine.speak(
              "Always believe in yourself. No matter where life takes you, I'll always be proud of you."
            );
          }
        }
      });
    }
  }
}

// Export as ES module and global fallback
window.ProfileManager = ProfileManager;
export default ProfileManager;
