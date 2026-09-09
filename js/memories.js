/**
 * SOUL CONNECTOR — MEMORY GALLERY CONTROLLER (SCENE 3)
 * Handles rendering legacy cards and memory inspection modal.
 */

class MemoryGallery {
  constructor(containerId, modalId) {
    this.container = document.getElementById(containerId);
    this.modal = document.getElementById(modalId);
    this.currentMemories = [];
    this.setupModalClose();
  }

  render(memories) {
    if (!this.container) return;
    this.currentMemories = memories || [];
    this.container.innerHTML = '';

    const categoryIcons = {
      travel: '📍',
      milestone: '🚲',
      lifestyle: '🥟',
      music: '🎵',
      voice: '🎙️',
      letter: '💌'
    };

    this.currentMemories.forEach((mem) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.id = mem.id;

      const icon = categoryIcons[mem.category] || '📷';

      card.innerHTML = `
        <div class="memory-card-media">
          <img src="${mem.image}" alt="${mem.title}" loading="lazy" />
          <div class="memory-card-badge">
            <span class="badge badge-cyan">${icon} ${mem.category || 'Memory'}</span>
          </div>
        </div>
        <div class="memory-card-body">
          <h4 class="memory-card-title">${mem.title}</h4>
          <p class="memory-card-desc">${mem.description}</p>
          <div class="memory-card-footer">
            <span>📅 ${mem.date || 'Preserved'}</span>
            <span class="memory-view-link">View Memory ↗</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this.openModal(mem));
      this.container.appendChild(card);
    });

    // Append special Letter & Voice Memo cards if not already in list
    this.appendSpecialCards();
  }

  appendSpecialCards() {
    // 1. Voice Memo Card
    const voiceCard = document.createElement('div');
    voiceCard.className = 'memory-card';
    voiceCard.innerHTML = `
      <div class="memory-card-media" style="background: linear-gradient(135deg, #0f2027, #203a43);">
        <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3.5rem;">🎙️</div>
        <div class="memory-card-badge">
          <span class="badge badge-cyan">🎙️ Audio Legacy</span>
        </div>
      </div>
      <div class="memory-card-body">
        <h4 class="memory-card-title">Tony's Spoken Voice Memo</h4>
        <p class="memory-card-desc">"Always believe in yourself. No matter where life takes you, I'll always be proud of you."</p>
        <div class="memory-card-footer">
          <span>🔊 00:08 Audio Sample</span>
          <span class="memory-view-link">Listen ↗</span>
        </div>
      </div>
    `;
    voiceCard.addEventListener('click', () => {
      this.openModal({
        title: "Tony's Spoken Voice Memo",
        category: "voice",
        date: "Preserved Legacy Audio",
        image: "assets/images/avatar-hologram.svg",
        description: "A personal recorded message from Tony for his daughter: 'Always believe in yourself. No matter where life takes you, I'll always be proud of you.'",
        isVoice: true
      });
    });
    this.container.appendChild(voiceCard);

    // 2. Personal Letter Card
    const letterCard = document.createElement('div');
    letterCard.className = 'memory-card';
    letterCard.innerHTML = `
      <div class="memory-card-media" style="background: linear-gradient(135deg, #2b1055, #7597de);">
        <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3.5rem;">💌</div>
        <div class="memory-card-badge">
          <span class="badge badge-gold">💌 Personal Letter</span>
        </div>
      </div>
      <div class="memory-card-body">
        <h4 class="memory-card-title">Letter for My Daughter</h4>
        <p class="memory-card-desc">Words of strength and love to read whenever the world feels overwhelming.</p>
        <div class="memory-card-footer">
          <span>✍️ In Tony's Words</span>
          <span class="memory-view-link">Read ↗</span>
        </div>
      </div>
    `;
    letterCard.addEventListener('click', () => {
      this.openModal({
        title: "Letter for My Daughter",
        category: "letter",
        date: "Legacy Vault",
        image: "assets/images/family.svg",
        description: "My dearest daughter, whenever you doubt yourself, think back to our mornings on the Darjeeling ridge. The sun always breaks through the mist. Keep your chin up, laugh generously, and know that my pride in you is boundless.",
        isLetter: true
      });
    });
    this.container.appendChild(letterCard);
  }

  openModal(mem) {
    if (!this.modal) return;
    const titleEl = this.modal.querySelector('.modal-mem-title');
    const descEl = this.modal.querySelector('.modal-mem-desc');
    const dateEl = this.modal.querySelector('.modal-mem-date');
    const imgEl = this.modal.querySelector('.modal-mem-img');
    const audioBtn = this.modal.querySelector('.modal-play-audio');

    if (titleEl) titleEl.textContent = mem.title;
    if (descEl) descEl.textContent = mem.description;
    if (dateEl) dateEl.textContent = `📅 ${mem.date || 'Preserved Memory'}`;
    if (imgEl) imgEl.src = mem.image;

    if (audioBtn) {
      audioBtn.style.display = 'inline-flex';
      audioBtn.onclick = () => {
        if (window.app && window.app.conversationEngine) {
          window.app.conversationEngine.speak(mem.description);
        }
      };
    }

    this.modal.classList.add('active');
  }

  setupModalClose() {
    if (!this.modal) return;
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.modal.classList.remove('active'));
    }
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.modal.classList.remove('active');
      }
    });
  }
}

// Export as ES module and global fallback
window.MemoryGallery = MemoryGallery;
export default MemoryGallery;
