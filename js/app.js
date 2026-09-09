/**
 * SOUL CONNECTOR — MAIN APPLICATION CONTROLLER
 * Orchestrates scenes, state transitions, pitch modal, and demo presets.
 */

import ProfileManager from './profile.js';
import ConversationEngine from './conversation.js';
import MemoryGallery from './memories.js';
import VRManager from './vr.js';

class SoulConnectorApp {
  constructor() {
    this.currentScene = 'scene-landing';
    this.profileManager = new ProfileManager();
    this.conversationEngine = null;
    this.memoryGallery = null;
    this.vrManager = null;

    this.init();
  }

  async init() {
    // 1. Load legacy profile data (Tony)
    const profile = await this.profileManager.loadProfile();

    // 2. Initialize subsystems
    this.conversationEngine = new ConversationEngine(profile);
    this.memoryGallery = new MemoryGallery('memory-grid-container', 'memory-modal');
    this.vrManager = new VRManager(this.conversationEngine);

    // Render initial memories
    this.memoryGallery.render(profile.memories);

    // Setup Scene 2 form & voice recorder
    this.setupProfileForm();

    // Setup global UI listeners & pitch modal
    this.setupNavigation();
    this.setupPitchModal();

    console.log("Soul Connector initialized with profile:", profile.name);
  }

  /**
   * Scene Routing: switches active view between scenes 1, 2, 3, 4
   */
  showScene(sceneId) {
    const views = document.querySelectorAll('.scene-view');
    views.forEach(view => {
      view.classList.remove('active');
    });

    const target = document.getElementById(sceneId);
    if (target) {
      target.classList.add('active');
      this.currentScene = sceneId;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Special actions on entering VR scene
      if (sceneId === 'scene-vr') {
        const sceneEl = document.querySelector('a-scene');
        if (sceneEl && sceneEl.resize) {
          setTimeout(() => sceneEl.resize(), 100);
        }
        // Speak warm greeting after a brief moment
        setTimeout(() => {
          if (this.conversationEngine) {
            this.conversationEngine.speak("Hey... you're finally here. It's so good to see you. Take your time, look around, and let's catch up.");
          }
        }, 1200);
      }
    }
  }

  setupNavigation() {
    // Brand click returns to Landing
    const brand = document.querySelector('.brand-wrapper');
    if (brand) {
      brand.addEventListener('click', () => this.showScene('scene-landing'));
    }

    // Landing Page buttons
    const btnCreateSoul = document.getElementById('btn-landing-create');
    const btnEnterSoul = document.getElementById('btn-landing-enter');

    if (btnCreateSoul) {
      btnCreateSoul.addEventListener('click', () => {
        this.profileManager.populateForm();
        this.showScene('scene-profile');
      });
    }

    if (btnEnterSoul) {
      btnEnterSoul.addEventListener('click', () => {
        this.showScene('scene-memories');
      });
    }

    // Direct VR Enter button from Memory Gallery
    const btnEnterVR = document.getElementById('btn-enter-vr-room');
    if (btnEnterVR) {
      btnEnterVR.addEventListener('click', () => {
        this.showScene('scene-vr');
      });
    }

    // Back to memories from VR
    const btnExitVR = document.getElementById('vr-back-btn');
    if (btnExitVR) {
      btnExitVR.addEventListener('click', () => {
        if (this.vrManager) this.vrManager.resetFinale();
        this.showScene('scene-memories');
      });
    }

    // Finale "Re-enter VR Room" button
    const btnReenterVR = document.getElementById('btn-reenter-vr');
    if (btnReenterVR) {
      btnReenterVR.addEventListener('click', () => {
        if (this.vrManager) this.vrManager.resetFinale();
      });
    }

    // Finale "View Pitch Deck" button
    const btnFinalePitch = document.getElementById('btn-finale-pitch');
    if (btnFinalePitch) {
      btnFinalePitch.addEventListener('click', () => {
        this.openPitchModal();
      });
    }
  }

  setupProfileForm() {
    // Load Preset Button
    const btnLoadPreset = document.getElementById('btn-load-preset');
    if (btnLoadPreset) {
      btnLoadPreset.addEventListener('click', () => {
        const defaultProfile = this.profileManager.resetToDefault();
        this.profileManager.populateForm(defaultProfile);
        this.conversationEngine.updateProfile(defaultProfile);
        this.memoryGallery.render(defaultProfile.memories);
        this.showToast('⚡ Loaded Tony (Father, 52) preset!');
      });
    }

    // Form submission
    const profileForm = document.getElementById('soul-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedProfile = this.profileManager.readForm();
        this.conversationEngine.updateProfile(updatedProfile);
        this.memoryGallery.render(updatedProfile.memories);
        this.showToast('✓ Soul Profile saved successfully!');
        this.showScene('scene-memories');
      });
    }

    // Voice recorder widget setup
    const voiceWidget = document.getElementById('voice-recorder-widget');
    const recordBtn = document.getElementById('btn-record-voice');
    const playBtn = document.getElementById('btn-play-voice');
    const statusLabel = document.getElementById('voice-record-status');
    this.profileManager.setupVoiceRecorder(voiceWidget, recordBtn, playBtn, statusLabel);
  }

  setupPitchModal() {
    const pitchModal = document.getElementById('modal-pitch-deck');
    const openBtns = document.querySelectorAll('.btn-open-pitch');
    const closeBtn = document.getElementById('pitch-close-btn');

    openBtns.forEach(btn => {
      btn.addEventListener('click', () => this.openPitchModal());
    });

    if (closeBtn && pitchModal) {
      closeBtn.addEventListener('click', () => {
        pitchModal.classList.remove('active');
      });
      pitchModal.addEventListener('click', (e) => {
        if (e.target === pitchModal) pitchModal.classList.remove('active');
      });
    }
  }

  openPitchModal() {
    const pitchModal = document.getElementById('modal-pitch-deck');
    if (pitchModal) pitchModal.classList.add('active');
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// Instantiate on window DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new SoulConnectorApp();
});
