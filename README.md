# 🧠 SOUL CONNECTOR — WebXR Digital Legacy Prototype

> **Preserve the moments. Continue the connection.**  
> *Built for the YISL Workshop (HTML5 + CSS3 + JavaScript + WebXR / A-Frame).*

---

## 🌟 Overview

**Soul Connector** is a browser-based WebXR prototype where a person can create a digital legacy profile containing memories, voice/message data, and personal wisdom during their lifetime. A loved one can later enter an intimate, immersive virtual reality memory chamber to interact with a stylized holographic digital avatar representing that person.

### The Core Principle
> **Digital legacy ≠ replacing a person.**  
> **It preserves what they chose to leave behind.**

---

## 📐 Design Thinking Framework

Soul Connector was designed from the ground up following the 5-stage Design Thinking methodology:

```text
EMPATHIZE  ───►  Grief leaves unshared stories, unanswered questions, and lost voices.
    │
DEFINE     ───►  "How might we preserve meaningful personal connections without claiming
    │             to replace the human being?"
IDEATE     ───►  Consent-based interactive digital legacy vault combined with a spatial
    │             VR memory room.
PROTOTYPE  ───►  Soul Connector WebXR chamber with Tony's holographic avatar and controlled
    │             conversational memory engine.
TEST       ───►  Loved one enters the room, asks questions ("What was our favorite trip?"),
                  and receives authentic emotional closure.
```

---

## 📁 Project Structure

```text
soul-connector/
├── index.html                  # Single-Page Application containing Scenes 1–5 & WebXR room
├── README.md                   # Complete documentation, presentation script & run guide
├── assets/
│   ├── images/
│   │   ├── family-trip.svg     # Darjeeling sunrise memory artwork
│   │   ├── bicycle.svg         # First bicycle milestone memory artwork
│   │   ├── momos.svg           # Sunday momo tradition memory artwork
│   │   ├── music.svg           # 'Stand By Me' road trip record artwork
│   │   ├── family.svg          # McKenzie family portrait frame artwork
│   │   └── avatar-hologram.svg # Holographic avatar bust & scanning HUD
│   └── models/
│       ├── tony-stark.glb      # Full 3D Tony Stark character model (converted from tony-stark.zip)
│       └── avatar.glb          # Active WebXR avatar model with embedded textures
├── css/
│   ├── style.css               # Design system, glassmorphism, pitch deck drawer
│   ├── landing.css             # Scene 1: Landing hero & holographic portal
│   ├── profile.css             # Scene 2 & 3: Profile form, voice widget & memory cards
│   └── vr.css                  # Scene 4 & 5: VR HUD, dialogue panel & emotional finale
├── js/
│   ├── app.js                  # Master application router & state controller
│   ├── profile.js              # Scene 2: Profile management, localStorage & voice recorder
│   ├── memories.js             # Scene 3: Dynamic memory gallery & modal viewer
│   ├── conversation.js         # Keyword memory detection AI & Web Speech API synthesis
│   └── vr.js                   # Scene 4 & 5: A-Frame WebXR manager, audio & finale
└── data/
    └── soul-profile.json       # Preloaded legacy profile dataset for Tony
```

---

## 🚀 How to Run the Prototype

Because Soul Connector uses modern WebXR and ES6 JavaScript Modules, it should be served through a local web server (to avoid browser file-protocol CORS restrictions on `fetch()` and modules).

### Option 1: Python HTTP Server (Recommended)
Open a terminal in the project directory and run:

```bash
# Python 3
python -m http.server 8000
```
Then visit: **`http://localhost:8000`**

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` in VS Code and click **"Open with Live Server"**.

---

## 🎬 The 5 Prototype Scenes

1. **Scene 1 — Landing Page**:
   - Hero title, ethereal holographic portal ring, mission statement.
   - Buttons: `[ Create a Soul Profile ]`, `[ Enter a Soul Profile ]`.
   - Ethical notice clarifying consent-based boundaries.

2. **Scene 2 — Create Soul Profile (Tony's Legacy)**:
   - Form pre-populated with Tony's data (52, Father, Darjeeling, Momos, Stand By Me).
   - `[ ⚡ Load Demo Preset (Tony) ]` button for instant demo autofill.
   - Interactive voice recorder widget with animated waveform bars and audio playback test.
   - Saves to `localStorage` in real time.

3. **Scene 3 — Memory Gallery**:
   - Visual cards showing Darjeeling trip, first bicycle, momo traditions, song, and personal letter.
   - Interactive modal viewer to inspect details and hear memories spoken.
   - `[ Enter VR Memory Room ⭐ ]` launch banner.

4. **Scene 4 — The VR Experience (WebXR A-Frame)**:
   - Cozy, dimly lit memory chamber with warm candlelight and acoustic dark wood walls.
   - Wall-mounted photo frames showing Tony's cherished memories.
   - Centerpiece: Stylized glowing holographic avatar of Tony with floating halo, breathing animation, and audio-reactive glow.
   - Dialogue HUD with preset question chips:
     - *"What was our favorite trip?"*
     - *"What did you always tell me?"*
     - *"What are you proud of?"*
     - *"What was your favorite food?"*
     - *"Do you remember the day I learned to ride a bike?"*
     - *"I really miss you."*
   - Freeform text input + microphone speech recognition.
   - Procedural Web Audio ambient pad music toggle (no external audio files needed).

5. **Scene 5 — The Emotional Finale (The Wow Moment ⭐)**:
   - Click `[ 💌 Say Goodbye ]` in the VR top HUD.
   - Cinematic slow fade into deep twilight.
   - Tony speaks his poignant farewell lines:
     > *"“I may not be able to walk beside you anymore...”"*  
     > *[pause]*  
     > *"“...but I wanted to leave you something you could always return to.”"*
   - Holographic avatar softly dissolves into glowing stardust.
   - Emotional punchline card reveals the core Design Thinking takeaway.

---

## 🏆 The 2-Minute Presentation Script (For Judges)

| Time | Slide / Action | What to Say |
|---|---|---|
| **0:00 – 0:20** | **Landing Page** (Problem) | *"When someone we love passes away, we don't only lose their physical presence. We lose the ability to ask them questions, hear their stories, and revisit the little moments that made them who they were."* |
| **0:20 – 0:40** | **Create Profile** (Solution) | *"Soul Connector is a consent-based digital legacy platform where people can intentionally preserve their memories, voice, stories, and messages during their lifetime."* |
| **0:40 – 1:20** | **VR Room Live Demo** (A-Frame) | Click **Enter VR Room**. Show the memory frames on the wall. Click chip: **"What was our favorite trip?"**. Tony speaks his Darjeeling memory. Type: **"What did you always tell me?"**. Tony responds. |
| **1:20 – 1:40** | **Ethical Boundary** | *"For today's prototype, the conversational layer uses a controlled memory dataset. Our goal isn't to recreate someone who has passed away or pretend they are alive. It's to preserve the connection they intentionally chose to leave behind."* |
| **1:40 – 2:00** | **Emotional Finale** | Click **"Say Goodbye"**. Let Tony's farewell quote play as the avatar dissolves. Point to the final screen: **"Digital legacy ≠ replacing a person. It preserves what they chose to leave behind."** |

---

## 💡 Technical Architecture Note (Pitch Defense)

> *“For today's prototype, the conversational layer uses a controlled memory dataset and keyword intent matching with Web Speech synthesis. The production roadmap integrates LLM retrieval-augmented generation (RAG) over encrypted personal memory vectors, while preserving strict authenticity and consent boundaries.”*
