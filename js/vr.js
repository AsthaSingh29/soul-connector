/**
 * SOUL CONNECTOR — VR EXPERIENCE & FINALE CONTROLLER (SCENE 4 & 5)
 * WebXR A-Frame room orchestration, procedural ambient audio,
 * dialogue HUD, holographic avatar animations, and emotional finale.
 */

class VRManager {
  constructor(conversationEngine) {
    this.engine = conversationEngine;
    this.audioCtx = null;
    this.ambientGain = null;
    this.isAudioPlaying = false;
    this.isFinaleRunning = false;
    
    this.initDOMReferences();
    this.setupDialogueHUD();
    this.setupAmbientAudio();
  }

  initDOMReferences() {
    this.dialogueText = document.getElementById('vr-dialogue-text');
    this.thinkingIndicator = document.getElementById('vr-dialogue-thinking');
    this.inputField = document.getElementById('vr-query-input');
    this.sendBtn = document.getElementById('vr-send-btn');
    this.micBtn = document.getElementById('vr-mic-btn');
    this.chipsContainer = document.getElementById('vr-question-chips');
    this.audioToggleBtn = document.getElementById('vr-audio-toggle');
    this.goodbyeBtn = document.getElementById('vr-goodbye-btn');
    
    // Finale elements
    this.finaleOverlay = document.getElementById('finale-overlay');
    this.farewellLine1 = document.getElementById('farewell-line-1');
    this.farewellLine2 = document.getElementById('farewell-line-2');
    this.finaleCard = document.getElementById('finale-punchline-card');
    this.avatarDissolve = document.getElementById('finale-avatar-img');
  }

  /**
   * Procedural Soothing Ambient Pad Music (Web Audio API)
   * Plays a warm, meditative celestial chord progression (Dmin9 -> Fmaj7)
   */
  setupAmbientAudio() {
    if (!this.audioToggleBtn) return;

    this.audioToggleBtn.addEventListener('click', () => {
      this.toggleAmbientMusic();
    });
  }

  toggleAmbientMusic() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.isAudioPlaying) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  startAmbientMusic() {
    if (!this.audioCtx) return;

    // Master gain
    this.ambientGain = this.audioCtx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 3);
    this.ambientGain.connect(this.audioCtx.destination);

    // Warm ambient chords frequencies (D minor warm pad: D3, F3, A3, C4, E4)
    const freqs = [146.83, 174.61, 220.00, 261.63, 329.63];
    this.oscillators = [];

    freqs.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // Lowpass filter for warm, dreamy texture
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480 + idx * 40, this.audioCtx.currentTime);

      // Subtle slow LFO vibrato
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(2.5, this.audioCtx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.18 / freqs.length, this.audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.oscillators.push(osc, lfo);
    });

    this.isAudioPlaying = true;
    this.audioToggleBtn.classList.add('playing');
    this.audioToggleBtn.innerHTML = '<span>🔊 Ambient Audio: On</span>';
  }

  stopAmbientMusic() {
    if (this.ambientGain && this.audioCtx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.5);
      setTimeout(() => {
        if (this.oscillators) {
          this.oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
          });
          this.oscillators = [];
        }
      }, 1600);
    }
    this.isAudioPlaying = false;
    this.audioToggleBtn.classList.remove('playing');
    this.audioToggleBtn.innerHTML = '<span>🔇 Ambient Audio: Off</span>';
  }

  /**
   * Dialogue HUD and User Query Handling
   */
  setupDialogueHUD() {
    // 1. Question chips click handlers
    if (this.chipsContainer) {
      this.chipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip-btn');
        if (chip && chip.dataset.query) {
          this.askQuestion(chip.dataset.query);
        }
      });
    }

    // 2. Text input submission
    if (this.sendBtn && this.inputField) {
      const handleSend = () => {
        const q = this.inputField.value.trim();
        if (q) {
          this.askQuestion(q);
          this.inputField.value = '';
        }
      };

      this.sendBtn.addEventListener('click', handleSend);
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // 3. Microphone speech recognition button
    if (this.micBtn) {
      let isListening = false;
      this.micBtn.addEventListener('click', () => {
        if (!isListening) {
          isListening = true;
          this.micBtn.classList.add('listening');
          this.micBtn.title = 'Listening... Speak your question';
          
          this.engine.startListening(
            (transcript) => {
              if (this.inputField) this.inputField.value = transcript;
              this.askQuestion(transcript);
            },
            () => {
              isListening = false;
              this.micBtn.classList.remove('listening');
              this.micBtn.title = 'Ask with microphone';
            },
            (errMsg) => {
              isListening = false;
              this.micBtn.classList.remove('listening');
              if (window.app) window.app.showToast(errMsg);
            }
          );
        } else {
          isListening = false;
          this.micBtn.classList.remove('listening');
          this.engine.stopListening();
        }
      });
    }

    // 4. Goodbye button triggers Scene 5 Finale
    if (this.goodbyeBtn) {
      this.goodbyeBtn.addEventListener('click', () => {
        this.triggerEmotionalFinale();
      });
    }
  }

  /**
   * Process a question, simulate thinking delay, update HUD & speak
   */
  askQuestion(questionText) {
    if (!this.dialogueText) return;

    // Show thinking indicator
    if (this.thinkingIndicator) this.thinkingIndicator.classList.add('active');
    this.dialogueText.style.opacity = '0.5';

    // Simulate AI memory retrieval time
    setTimeout(() => {
      if (this.thinkingIndicator) this.thinkingIndicator.classList.remove('active');
      this.dialogueText.style.opacity = '1';

      const response = this.engine.processQuery(questionText);
      this.dialogueText.textContent = response.text;

      // Animate 3D avatar glow
      this.pulseAvatarHologram(true);

      // Voice synthesis
      this.engine.speak(
        response.text,
        () => this.pulseAvatarHologram(true),
        () => this.pulseAvatarHologram(false)
      );
    }, 600);
  }

  /**
   * Pulsing effect on the A-Frame holographic avatar when talking
   */
  pulseAvatarHologram(isSpeaking) {
    const avatarEl = document.getElementById('vr-hologram-avatar');
    const auraLight = document.getElementById('vr-avatar-aura-light');
    if (!avatarEl) return;

    if (isSpeaking) {
      avatarEl.setAttribute('animation__talk', {
        property: 'scale',
        dir: 'alternate',
        dur: 350,
        easing: 'easeInOutSine',
        loop: true,
        to: '1.04 1.04 1.04'
      });
      if (auraLight) {
        auraLight.setAttribute('light', 'intensity', 1.6);
        auraLight.setAttribute('light', 'color', '#00f2fe');
      }
    } else {
      avatarEl.removeAttribute('animation__talk');
      avatarEl.setAttribute('scale', '1 1 1');
      if (auraLight) {
        auraLight.setAttribute('light', 'intensity', 0.9);
        auraLight.setAttribute('light', 'color', '#4facfe');
      }
    }
  }

  /**
   * SCENE 5 — THE EMOTIONAL FINALE ⭐
   * Slow cinematic fade, Tony's farewell words, avatar dissolve, punchline card
   */
  triggerEmotionalFinale() {
    if (this.isFinaleRunning) return;
    this.isFinaleRunning = true;

    // Stop ongoing speech
    this.engine.stopSpeaking();

    // Fade ambient audio gently
    if (this.ambientGain && this.audioCtx) {
      this.ambientGain.gain.exponentialRampToValueAtTime(0.04, this.audioCtx.currentTime + 3);
    }

    // Step 1: Open Fullscreen Finale Overlay
    if (this.finaleOverlay) {
      this.finaleOverlay.classList.add('active');
    }

    // Step 2: Part 1 of Tony's farewell line
    setTimeout(() => {
      if (this.farewellLine1) {
        this.farewellLine1.textContent = "“I may not be able to walk beside you anymore...”";
        this.farewellLine1.classList.add('show');
      }

      this.engine.speak("I may not be able to walk beside you anymore...", null, () => {
        // Step 3: Dramatic pause, then Part 2
        setTimeout(() => {
          if (this.farewellLine2) {
            this.farewellLine2.textContent = "“...but I wanted to leave you something you could always return to.”";
            this.farewellLine2.classList.add('show');
          }

          this.engine.speak("...but I wanted to leave you something you could always return to.", null, () => {
            // Step 4: Avatar dissolves into stardust
            setTimeout(() => {
              if (this.avatarDissolve) {
                this.avatarDissolve.classList.add('dissolved');
              }

              // Step 5: Reveal Soul Connector Punchline Card
              setTimeout(() => {
                if (this.finaleCard) {
                  this.finaleCard.classList.add('show');
                }
              }, 1200);
            }, 800);
          });
        }, 1400);
      });
    }, 1200);
  }

  resetFinale() {
    this.isFinaleRunning = false;
    if (this.finaleOverlay) this.finaleOverlay.classList.remove('active');
    if (this.farewellLine1) this.farewellLine1.classList.remove('show');
    if (this.farewellLine2) this.farewellLine2.classList.remove('show');
    if (this.finaleCard) this.finaleCard.classList.remove('show');
    if (this.avatarDissolve) this.avatarDissolve.classList.remove('dissolved');
  }
}

// Export as ES module and global fallback
window.VRManager = VRManager;
export default VRManager;
