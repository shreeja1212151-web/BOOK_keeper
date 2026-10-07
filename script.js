/**
 * Cozy Library Book Keeper
 * Vanilla JavaScript Single-Page Application
 * Features: LocalStorage persistence, Web Audio procedural ambient sounds,
 * custom canvas color wheel, book pull-out physics, and JSON backup/restore.
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. CONSTANTS & DEFAULT SAMPLE DATA
  // ==========================================================================
  // ==========================================================================
  // 1. CONSTANTS & DEFAULT SAMPLE DATA
  // ==========================================================================
  const STORAGE_KEY_V2 = 'cozy_keeper_data_v2';
  const STORAGE_KEY = 'cozy_libraries_store_v1';
  const DIMMER_STORAGE_KEY = 'cozy_room_dimmer_v1';
  const AUDIO_STORAGE_KEY = 'cozy_audio_settings_v1';

  // Pre-configured cozy sample library ("The Midnight Study")
  const SAMPLE_LIBRARY = {
    id: 'sample-midnight-study',
    name: 'The Midnight Study',
    shelfWood: 'cafe-noir',
    nameColor: '#ebd9b4',
    books: [
      {
        id: 'book-sample-1',
        name: 'The Secret History',
        author: 'Donna Tartt',
        genre: 'Dark Academia / Fiction',
        spineColor: '#2b3a4e',
        sticker: 'heart',
        description: 'Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from humdrum existence.',
        width: 44,
        heightFactor: 0.94,
        readingStatus: 'finished',
        readingProgress: 'Completed',
        dateAdded: Date.now() - 5000000
      },
      {
        id: 'book-sample-2',
        name: 'The Picture of Dorian Gray',
        author: 'Oscar Wilde',
        genre: 'Gothic Classic',
        spineColor: '#5a3528',
        sticker: 'heart',
        description: 'A corrupt young gentleman retains his youthful beauty while a portrait hidden in his attic ages and records every moral transgression.',
        width: 38,
        heightFactor: 0.88,
        readingStatus: 'reading',
        readingProgress: 'p. 112',
        dateAdded: Date.now() - 4000000
      },
      {
        id: 'book-sample-3',
        name: 'Frankenstein',
        author: 'Mary Shelley',
        genre: 'Gothic / Science Fiction',
        spineColor: '#2d4133',
        sticker: 'neutral',
        description: 'A young scientist creates a sentient creature in an unorthodox scientific experiment, only to abandon it to the cruel judgment of humankind.',
        width: 36,
        heightFactor: 0.85,
        readingStatus: 'to-read',
        readingProgress: '',
        dateAdded: Date.now() - 3000000
      },
      {
        id: 'book-sample-4',
        name: 'The Shadow of the Wind',
        author: 'Carlos Ruiz Zafón',
        genre: 'Mystery / Gothic Fiction',
        spineColor: '#73532c',
        sticker: 'heart',
        description: 'Barcelona, 1945: A boy is led to the secret Cemetery of Forgotten Books, permitted to choose one mysterious volume that reshapes his destiny.',
        width: 48,
        heightFactor: 0.95,
        readingStatus: 'reading',
        readingProgress: 'Chapter 14',
        dateAdded: Date.now() - 2000000
      },
      {
        id: 'book-sample-5',
        name: 'Dead Poets Society',
        author: 'N.H. Kleinbaum',
        genre: 'Fiction / Drama',
        spineColor: '#61304b',
        sticker: 'cross',
        description: '"Carpe diem. Seize the day, boys. Make your lives extraordinary." An unorthodox English teacher inspires students through poetry.',
        width: 40,
        heightFactor: 0.91,
        readingStatus: 'finished',
        readingProgress: 'Completed',
        dateAdded: Date.now() - 1000000
      },
      {
        id: 'book-sample-6',
        name: 'Meditations',
        author: 'Marcus Aurelius',
        genre: 'Stoic Philosophy',
        spineColor: '#3d3b39',
        sticker: 'neutral',
        description: 'Personal writings of the Roman Emperor Marcus Aurelius, recording private notes to himself on stoic virtue, mortality, and tranquility.',
        width: 34,
        heightFactor: 0.82,
        readingStatus: 'reading',
        readingProgress: 'Book IV',
        dateAdded: Date.now() - 500000
      }
    ]
  };

  // Pre-configured cozy sample Commonplace quotes
  const SAMPLE_QUOTES = [
    {
      id: 'quote-sample-1',
      text: 'Beauty is rarely soft or consoling. Quite the contrary. Genuine beauty is always quite alarming.',
      bookId: 'book-sample-1',
      bookTitle: 'The Secret History',
      author: 'Donna Tartt',
      page: 'p. 38',
      notes: 'Read on an autumn afternoon by the window.'
    },
    {
      id: 'quote-sample-2',
      text: 'Behind every exquisite thing that existed, there was something tragic.',
      bookId: 'book-sample-2',
      bookTitle: 'The Picture of Dorian Gray',
      author: 'Oscar Wilde',
      page: 'p. 112',
      notes: 'Lord Henry speaking to Dorian in the library.'
    },
    {
      id: 'quote-sample-3',
      text: 'Beware; for I am fearless, and therefore powerful.',
      bookId: 'book-sample-3',
      bookTitle: 'Frankenstein',
      author: 'Mary Shelley',
      page: 'p. 167',
      notes: 'The creature confronting Victor.'
    }
  ];

  // Helper to normalize books with safe defaults
  function normalizeBook(book) {
    if (!book) return book;
    if (!book.dateAdded) book.dateAdded = Date.now() - 1000;
    if (!book.readingStatus) book.readingStatus = 'not-set';
    if (!book.readingProgress) book.readingProgress = '';
    return book;
  }

  // ==========================================================================
  // 2. APPLICATION STATE
  // ==========================================================================
  const State = {
    libraries: [],
    quotes: [],
    currentLibraryId: null,
    activeBookId: null,
    editingLibraryId: null,
    editingBookId: null,
    editingQuoteId: null,
    pendingImportData: null,
    confirmActionCallback: null,
    pulledOutElement: null,
    topRowIndex: 0,
    isSelectionMode: false,
    selectedBookIds: new Set(),
    isShelfAnimating: false,
    searchFilters: {
      query: '',
      library: 'all',
      genre: 'all',
      sticker: 'all',
      status: 'all',
      sort: 'title'
    },
    eveningQuoteIndex: 0
  };

  // ==========================================================================
  // 2B. TAVERN LADY ENGINE (Warm Host & Verified Literary Facts)
  // ==========================================================================
  const TavernLady = {
    facts: [
      "The Gutenberg Bible, printed around 1455 in Mainz, Germany, was among the very first major works in the West created with movable metal type.",
      "The sweet, vanilla-tinged scent of old books is called 'bibliosmia', caused by the slow breakdown of cellulose and lignin in aging paper.",
      "The Japanese language has the word 'tsundoku' (積ん読) — the gentle art of acquiring books and letting them pile up comfortably unread.",
      "The world's earliest surviving complete novel is 'The Tale of Genji', written in 11th-century Japan by court noblewoman Murasaki Shikibu.",
      "Agatha Christie remains the most translated individual author in literary history, with her mysteries translated into over a hundred languages.",
      "The Diamond Sutra, printed in Dunhuang, China in 868 AD, is the world's earliest known dated complete printed book.",
      "In medieval and Renaissance universities like Oxford's Bodleian, precious folios were physically chained to desks to prevent theft while allowing reading.",
      "One of the longest sentences in world literature appears in Marcel Proust's 'In Search of Lost Time', unrolling across more than 800 words.",
      "Mary Shelley was just eighteen years old when she conceived and began drafting 'Frankenstein' during the gloomy 'Year Without a Summer' of 1816.",
      "The legendary Library of Alexandria required every ship entering the harbor to surrender any books aboard so scribes could copy them for the royal shelves.",
      "The British Library houses over 170 million cataloged items, adding miles of new shelving every year to shelter the world's knowledge.",
      "William Shakespeare introduced more than 1,700 words into the English language, including 'lonely', 'radiance', 'eyeball', and 'majestic'.",
      "The Library of Congress holds more than 40 million cataloged books and millions of manuscripts, making it the largest library by catalog in the world.",
      "In ancient Rome, the first public library was established around 39 BC by Asinius Pollio in the Atrium Libertatis on the Aventine Hill."
    ],

    speeches: {
      'no-libraries': [
        "Come in from the cold, dear traveller, and rest your boots by the hearth. These quiet halls await your very first shelf.",
        "A peaceful evening to you, wanderer. The room is quiet and the tea is hot, waiting for you to name your first library.",
        "Step through the archway, friend. The carpenter has planed the wood, but no stories rest upon the planks just yet."
      ],
      'empty-shelf': [
        "The cedar smells sweet on this quiet shelf, traveller, but not a single volume rests here yet. Shall we place the first tale?",
        "An empty shelf is a room waiting for a soul. Pull up a chair and let us inscribe your first story upon this wood.",
        "The candles are lit and the shelf is dusted clean, yet no spine catches the glow. Add a book to keep the room company."
      ],
      'no-search-results': [
        "I have searched behind the counter and through every alcove, but found no parchment answering that description.",
        "No volume in our ledger bears those exact marks, friend. Perhaps try searching another title, or clearing the filters?",
        "The archive is vast, yet this particular query slips like smoke through our fingers. Check the spelling or reset your filters."
      ],
      'no-quotes': [
        "Your Commonplace journal lies open upon the oak table, its parchment pages waiting for ink and memorable lines.",
        "No gathered passages rest in your journal yet, traveller. Whenever a sentence strikes your heart, inscribe it here.",
        "The inkpot is uncorked and the quill is sharpened. Collect your favorite lines from your reading to revisit in quiet hours."
      ],
      'empty-wishlist': [
        "The wishing nook is peaceful today. No future dreams or coveted volumes have been penned upon it yet.",
        "Here you may keep the tales you yearn to read before they find a permanent home on your bookshelves.",
        "The wishlist shelf stands bare and expectant. Add the books you hope to acquire, and move them to your shelves once found."
      ],
      'storage-error': [
        "The lantern flickers momentarily. Your browser seems reluctant to grant permanent memory, but we have arranged an undisturbed table for you.",
        "A gentle note from the cellar: private browsing has restricted local storage, but your books will rest safely during this quiet visit."
      ]
    },

    getFact(seed = 0) {
      const idx = Math.abs(seed) % this.facts.length;
      return this.facts[idx];
    },

    getSpeech(category, seed = 0) {
      const list = this.speeches[category] || this.speeches['empty-shelf'];
      const idx = Math.abs(seed) % list.length;
      return list[idx];
    },

    renderCard(category, customSpeech = null, seed = Date.now()) {
      const speech = customSpeech || this.getSpeech(category, seed);
      const fact = this.getFact(seed);
      return `
        <div class="tavern-lady-card">
          <div class="tavern-lady-header">
            <span class="tavern-lady-icon">🕯️</span>
            <span class="tavern-lady-speaker">Mistress Corinne, Keeper of the Hearth</span>
          </div>
          <p class="tavern-lady-speech">"${escapeHtml(speech)}"</p>
          <div class="tavern-lady-fact">
            <strong>Did you know?</strong> ${escapeHtml(fact)}
          </div>
        </div>
      `;
    },

    showModal(title, message, icon = '🕯️') {
      const modal = document.getElementById('modal-tavern-message');
      if (!modal) return;
      const iconEl = document.getElementById('tavern-dialog-icon');
      if (iconEl) iconEl.textContent = icon;
      const titleEl = document.getElementById('tavern-dialog-title');
      if (titleEl) titleEl.textContent = title;
      const contentEl = document.getElementById('tavern-dialog-content');
      if (contentEl) {
        contentEl.innerHTML = `
          <p class="tavern-lady-speech">"${escapeHtml(message)}"</p>
          <div class="tavern-lady-fact">
            <strong>Did you know?</strong> ${escapeHtml(this.getFact(Date.now()))}
          </div>
        `;
      }
      modal.showModal();
    }
  };

  // ==========================================================================
  // 3. STORAGE & REPOSITORY ENGINE (Auto-Save, Unified Store, try/catch)
  // ==========================================================================
  const Storage = {
    loadAll() {
      try {
        const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
        if (rawV2) {
          const parsed = JSON.parse(rawV2);
          if (parsed && typeof parsed === 'object') {
            const libs = Array.isArray(parsed.libraries) ? parsed.libraries : null;
            if (libs) {
              libs.forEach(l => {
                if (l.isWishlist) l.name = 'THE WISHLIST';
                if (Array.isArray(l.books)) l.books.forEach(normalizeBook);
              });
            }
            return {
              libraries: libs,
              quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
              dimmer: typeof parsed.dimmer === 'number' ? parsed.dimmer : 0.85,
              audio: parsed.audio || { sound: 'off', volume: 0.25 }
            };
          }
        }

        // Fall back to legacy keys
        let legacyLibs = null;
        try {
          const rawLibs = localStorage.getItem(STORAGE_KEY);
          if (rawLibs) {
            const parsed = JSON.parse(rawLibs);
            if (Array.isArray(parsed)) {
              legacyLibs = parsed;
              legacyLibs.forEach(l => {
                if (l.isWishlist) l.name = 'THE WISHLIST';
                if (Array.isArray(l.books)) l.books.forEach(normalizeBook);
              });
            }
          }
        } catch (e) {
          console.warn('Legacy library load warning:', e);
        }

        let legacyDimmer = 0.85;
        try {
          const rawDim = localStorage.getItem(DIMMER_STORAGE_KEY);
          if (rawDim) legacyDimmer = parseFloat(rawDim) || 0.85;
        } catch {}

        let legacyAudio = { sound: 'off', volume: 0.25 };
        try {
          const rawAud = localStorage.getItem(AUDIO_STORAGE_KEY);
          if (rawAud) legacyAudio = JSON.parse(rawAud);
        } catch {}

        return {
          libraries: legacyLibs,
          quotes: null,
          dimmer: legacyDimmer,
          audio: legacyAudio
        };
      } catch (err) {
        console.error('Storage reading failed:', err);
        return {
          libraries: null,
          quotes: null,
          dimmer: 0.85,
          audio: { sound: 'off', volume: 0.25 }
        };
      }
    },

    saveAll() {
      try {
        const dimmerVal = parseFloat(document.documentElement.style.getPropertyValue('--room-dimmer')) || 0.85;
        const payload = {
          version: 2,
          libraries: State.libraries,
          quotes: State.quotes,
          dimmer: dimmerVal,
          audio: {
            sound: AudioEngine.currentSound,
            volume: AudioEngine.volume
          }
        };
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(payload));
        // Keep legacy key populated for backward safety
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State.libraries));
        localStorage.setItem(DIMMER_STORAGE_KEY, dimmerVal.toString());
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(payload.audio));
      } catch (err) {
        console.warn('Auto-save write failed:', err);
      }
    },

    loadLibraries() {
      const all = this.loadAll();
      return all.libraries;
    },

    saveLibraries(libs) {
      State.libraries = libs;
      this.saveAll();
    },

    loadDimmer() {
      const all = this.loadAll();
      return all.dimmer;
    },

    saveDimmer(val) {
      try {
        localStorage.setItem(DIMMER_STORAGE_KEY, val.toString());
      } catch {}
      this.saveAll();
    },

    loadAudioSettings() {
      const all = this.loadAll();
      return all.audio;
    },

    saveAudioSettings(settings) {
      try {
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
      } catch {}
      this.saveAll();
    }
  };

  // Generate deterministic spine width & height variance based on ID string
  function getSpineVariance(seedStr) {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const abs = Math.abs(hash);
    // Width between 32px and 48px
    const width = 32 + (abs % 17);
    // Height factor between 0.83 and 0.96 of the shelf compartment
    const heightFactor = 0.83 + ((abs >> 4) % 14) * 0.01;
    return { width, heightFactor };
  }

  // Calculate readable 2 to 3 words for the spine
  function getSpineDisplayTitle(fullTitle) {
    if (!fullTitle) return '';
    const words = fullTitle.trim().split(/\s+/);
    if (words.length <= 2) {
      return words.join(' ');
    }
    // Check length of first 3 words
    const threeWords = words.slice(0, 3).join(' ');
    if (threeWords.length <= 15) {
      return threeWords;
    }
    // Otherwise 2 words
    return words.slice(0, 2).join(' ');
  }

  // Calculate light or dark text ink color for high contrast
  function getContrastTextColor(hexColor) {
    let c = hexColor.replace('#', '');
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const r = parseInt(c.substring(0, 2), 16) || 0;
    const g = parseInt(c.substring(2, 4), 16) || 0;
    const b = parseInt(c.substring(4, 6), 16) || 0;
    // Relative perceived luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.56 ? '#1b140f' : '#f5ebe0';
  }

  // ==========================================================================
  // 4. PROCEDURAL WEB AUDIO SYNTHESIZER (100% Free & Offline)
  // ==========================================================================
  const AudioEngine = {
    ctx: null,
    currentSound: 'off',
    volume: 0.25,
    masterGain: null,
    sourceNode: null,
    crackleInterval: null,
    isInitialized: false,

    init() {
      if (this.isInitialized) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported in this browser.');
        return;
      }
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    },

    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.ctx && this.masterGain && this.currentSound !== 'off') {
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
      }
    },

    play(soundType) {
      this.init();
      if (!this.ctx) return;

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.currentSound === soundType && this.sourceNode) {
        return;
      }

      this.stop();
      this.currentSound = soundType;

      if (soundType === 'off') {
        return;
      }

      if (soundType === 'rain') {
        this.startRain();
      } else if (soundType === 'fireplace') {
        this.startFireplace();
      }

      // Smooth fade in
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);
      }
    },

    startRain() {
      // Procedural pink noise filtered for soft ambient rain
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Low-pass filter for cozy muffled raindrop frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();

      this.sourceNode = noise;
    },

    startFireplace() {
      // 1. Warm low rumble base
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();
      this.sourceNode = noise;

      // 2. Random intermittent wooden crackle pops
      this.crackleInterval = setInterval(() => {
        if (!this.ctx || this.currentSound !== 'fireplace') return;
        if (Math.random() > 0.45) {
          this.triggerPop();
        }
      }, 350);
    },

    triggerPop() {
      if (!this.ctx || !this.masterGain) return;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();

      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(120 + Math.random() * 450, this.ctx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.03);

      popGain.gain.setValueAtTime(this.volume * (0.2 + Math.random() * 0.4), this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);

      popOsc.start();
      popOsc.stop(this.ctx.currentTime + 0.045);
    },

    stop() {
      if (this.crackleInterval) {
        clearInterval(this.crackleInterval);
        this.crackleInterval = null;
      }
      if (this.sourceNode) {
        try {
          this.sourceNode.stop();
          this.sourceNode.disconnect();
        } catch {}
        this.sourceNode = null;
      }
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      }
      this.currentSound = 'off';
    }
  };

  // ==========================================================================
  // 5. COLOR WHEEL CONTROLLER (Interactive Canvas HSV/HSL Wheel)
  // ==========================================================================
  class ColorWheel {
    constructor(canvasId, reticleId, lightnessSliderId, hexInputId, chipId, nativePickerId, initialHex = '#ebd9b4') {
      this.canvas = document.getElementById(canvasId);
      this.reticle = document.getElementById(reticleId);
      this.lightnessSlider = document.getElementById(lightnessSliderId);
      this.hexInput = document.getElementById(hexInputId);
      this.chip = document.getElementById(chipId);
      this.nativePicker = document.getElementById(nativePickerId);
      this.ctx = this.canvas.getContext('2d');
      this.radius = this.canvas.width / 2;
      this.hue = 40;
      this.saturation = 60;
      this.lightness = 75;
      this.isDragging = false;

      this.drawWheel();
      this.setColor(initialHex);
      this.bindEvents();
    }

    drawWheel() {
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const r = this.radius;
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - r;
          const dy = y - r;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const idx = (y * width + x) * 4;

          if (dist <= r) {
            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            const sat = dist / r;
            const [red, green, blue] = this.hslToRgb(angle, sat * 100, 50);

            data[idx] = red;
            data[idx + 1] = green;
            data[idx + 2] = blue;
            data[idx + 3] = 255;
          } else {
            data[idx + 3] = 0; // Transparent outside circle
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    bindEvents() {
      const handlePointer = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const x = clientX - rect.left - rect.width / 2;
        const y = clientY - rect.top - rect.height / 2;

        const dist = Math.min(this.radius, Math.sqrt(x * x + y * y));
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        this.hue = angle;
        this.saturation = (dist / this.radius) * 100;
        this.updateReticlePosition(x, y, dist);
        this.applyColorChange();
      };

      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        handlePointer(e);
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isDragging) handlePointer(e);
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      this.canvas.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        handlePointer(e);
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (this.isDragging) {
          handlePointer(e);
          e.preventDefault();
        }
      }, { passive: false });

      window.addEventListener('touchend', () => {
        this.isDragging = false;
      });

      // Lightness slider listener
      if (this.lightnessSlider) {
        this.lightnessSlider.addEventListener('input', () => {
          this.lightness = parseFloat(this.lightnessSlider.value);
          this.applyColorChange();
        });
      }

      // Hex code input listener
      if (this.hexInput) {
        this.hexInput.addEventListener('change', () => {
          let hex = this.hexInput.value.trim();
          if (!hex.startsWith('#')) hex = '#' + hex;
          if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            this.setColor(hex);
          }
        });
      }

      // Fallback native input listener
      if (this.nativePicker) {
        this.nativePicker.addEventListener('input', () => {
          this.setColor(this.nativePicker.value);
        });
      }
    }

    updateReticlePosition(x, y, dist) {
      const scale = dist > this.radius ? this.radius / dist : 1;
      const posX = this.radius + x * scale;
      const posY = this.radius + y * scale;
      this.reticle.style.left = `${posX}px`;
      this.reticle.style.top = `${posY}px`;
    }

    applyColorChange() {
      const hex = this.getHex();
      if (this.chip) this.chip.style.backgroundColor = hex;
      if (this.hexInput) this.hexInput.value = hex.toUpperCase();
      if (this.nativePicker) this.nativePicker.value = hex;
    }

    setColor(hex) {
      if (!hex) return;
      const rgb = this.hexToRgb(hex);
      if (!rgb) return;
      const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

      this.hue = hsl.h;
      this.saturation = hsl.s;
      this.lightness = hsl.l;

      if (this.lightnessSlider) {
        this.lightnessSlider.value = Math.round(hsl.l);
      }

      // Position reticle
      const angleRad = hsl.h * (Math.PI / 180);
      const dist = (hsl.s / 100) * this.radius;
      const x = Math.cos(angleRad) * dist;
      const y = Math.sin(angleRad) * dist;
      this.updateReticlePosition(x, y, dist);
      this.applyColorChange();
    }

    getHex() {
      const [r, g, b] = this.hslToRgb(this.hue, this.saturation, this.lightness);
      return this.rgbToHex(r, g, b);
    }

    hslToRgb(h, s, l) {
      s /= 100;
      l /= 100;
      const k = (n) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    }

    rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: h * 360, s: s * 100, l: l * 100 };
    }

    hexToRgb(hex) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      const num = parseInt(c, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
  }

  // ==========================================================================
  // 6. UI TOAST & CONFIRMATION HELPERS
  // ==========================================================================
  const Toast = {
    elem: document.getElementById('cozy-toast'),
    timer: null,

    show(msg, duration = 3000) {
      if (!this.elem) return;
      this.elem.textContent = msg;
      this.elem.classList.add('visible');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.elem.classList.remove('visible');
      }, duration);
    }
  };

  function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    State.confirmActionCallback = onConfirm;
    modal.showModal();
  }

  // ==========================================================================
  // 7. INITIALIZE DUST PARTICLES (Cozy Ambient Extras)
  // ==========================================================================
  function initDustMotes() {
    const container = document.getElementById('dust-specks');
    if (!container) return;
    container.innerHTML = '';
    const count = 22;

    for (let i = 0; i < count; i++) {
      const mote = document.createElement('span');
      mote.className = 'dust-speck';

      const size = 1.5 + Math.random() * 3.5;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * 15;
      const driftX = (Math.random() - 0.5) * 120;
      const driftY = -(80 + Math.random() * 160);

      mote.style.width = `${size}px`;
      mote.style.height = `${size}px`;
      mote.style.left = `${left}%`;
      mote.style.top = `${top}%`;
      mote.style.setProperty('--drift-x', `${driftX}px`);
      mote.style.setProperty('--drift-y', `${driftY}px`);
      mote.style.animationDuration = `${duration}s`;
      mote.style.animationDelay = `${delay}s`;

      container.appendChild(mote);
    }
  }

  // ==========================================================================
  // 8. RENDERERS: TODAY'S MENU & BOOKSHELVES
  // ==========================================================================
  // Helper: update doodle wallpaper color based on current wood or menu
  function updateDoodleWallpaperColor(shelfWoodOrMenu) {
    let color = '#d3a365'; // default amber
    if (shelfWoodOrMenu === 'strawberry-coral') {
      color = '#e58f86';
    } else if (shelfWoodOrMenu === 'dark-olive') {
      color = '#97b07f';
    } else if (shelfWoodOrMenu === 'cafe-noir' || shelfWoodOrMenu === 'menu') {
      color = '#d3a365';
    }
    document.documentElement.style.setProperty('--doodle-color', color);
  }

  // ==========================================================================
  // 8. RENDERERS: TODAY'S MENU & BOOKSHELVES
  // ==========================================================================
  // ==========================================================================
  // 8. RENDERERS: TODAY'S MENU, BOOKSHELVES, SEARCH, & QUOTES
  // ==========================================================================
  function switchView(viewName) {
    document.body.dataset.view = viewName;
    const viewMenu = document.getElementById('view-menu');
    const viewLib = document.getElementById('view-library');
    const viewSearch = document.getElementById('view-search');
    const viewQuotes = document.getElementById('view-quotes');

    if (viewMenu) viewMenu.hidden = true;
    if (viewLib) viewLib.hidden = true;
    if (viewSearch) viewSearch.hidden = true;
    if (viewQuotes) viewQuotes.hidden = true;

    dismissPulledOutBook();
    toggleSelectionMode(false);

    if (viewName === 'menu') {
      if (viewMenu) viewMenu.hidden = false;
      updateDoodleWallpaperColor('menu');
      renderTodayMenu();
    } else if (viewName === 'library') {
      if (viewLib) viewLib.hidden = false;
      renderCurrentLibrary();
    } else if (viewName === 'search') {
      if (viewSearch) viewSearch.hidden = false;
      updateDoodleWallpaperColor('menu');
      renderSearchDesk();
    } else if (viewName === 'quotes') {
      if (viewQuotes) viewQuotes.hidden = false;
      updateDoodleWallpaperColor('menu');
      renderQuotesJournal();
    }
  }

  // Handle Wishlist Shelf opening or creation
  function openOrCreateWishlist() {
    const existing = State.libraries.find(l => l.isWishlist);
    if (existing) {
      openLibrary(existing.id);
      Toast.show('Opened your Wishlist shelf 🎀');
    } else {
      const newWish = {
        id: 'lib-wishlist-' + Date.now(),
        name: 'THE WISHLIST',
        shelfWood: 'cafe-noir',
        nameColor: '#e8a99b',
        isWishlist: true,
        books: []
      };
      State.libraries.push(newWish);
      Storage.saveAll();
      Toast.show('Created "THE WISHLIST" 🎀!');
      openLibrary(newWish.id);
    }
  }

  // Render Screen 1: Today's Menu Board
  function renderTodayMenu() {
    const container = document.getElementById('menu-libraries-container');
    const emptyState = document.getElementById('menu-empty-state');
    const emptyTavern = document.getElementById('menu-empty-tavern-box');
    const wishlistLabel = document.getElementById('btn-menu-wishlist-text');

    const hasWishlist = State.libraries.some(l => l.isWishlist);
    if (wishlistLabel) {
      wishlistLabel.textContent = hasWishlist ? 'Open THE WISHLIST 🎀' : 'THE WISHLIST';
    }

    container.innerHTML = '';

    if (!State.libraries || State.libraries.length === 0) {
      emptyState.hidden = false;
      if (emptyTavern) {
        emptyTavern.innerHTML = TavernLady.renderCard('no-libraries');
      }
      return;
    }

    emptyState.hidden = true;

    State.libraries.forEach(lib => {
      const card = document.createElement('div');
      card.className = 'menu-lib-card';

      const swatchClass = `wood-${lib.shelfWood || 'cafe-noir'}`;
      const bookCount = lib.books ? lib.books.length : 0;
      const bookLabel = bookCount === 1 ? '1 story resting' : `${bookCount} stories resting`;
      const wishlistTag = lib.isWishlist ? '<span class="badge-wishlist">🎀 Wishlist</span>' : '';

      card.innerHTML = `
        <div class="menu-lib-main" title="Open ${escapeHtml(lib.name)}">
          <div class="menu-lib-swatch ${swatchClass}"></div>
          <div class="menu-lib-title-group">
            <span class="menu-lib-name" style="color: ${escapeHtml(lib.nameColor || '#ebd9b4')}">
              ${escapeHtml(lib.name)} ${wishlistTag}
            </span>
            <span class="menu-lib-count">${bookLabel}</span>
          </div>
        </div>
        <div class="menu-lib-actions">
          <button type="button" class="btn-lib-delete" title="Delete Library" aria-label="Delete ${escapeHtml(lib.name)}">
            🗑️
          </button>
        </div>
      `;

      card.querySelector('.menu-lib-main').addEventListener('click', () => {
        openLibrary(lib.id);
      });

      card.querySelector('.btn-lib-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmModal(
          'Delete Library?',
          `Are you sure you want to delete "${lib.name}" and all ${bookCount} stories inside?`,
          () => {
            deleteLibrary(lib.id);
          }
        );
      });

      container.appendChild(card);
    });
  }

  // Determine book count per shelf row based on viewport width
  function getBooksPerRow() {
    return window.innerWidth <= 768 ? 4 : 7;
  }

  // Partition books into shelf rows, ensuring minimum 2 rows
  function getShelfRows(books) {
    const perRow = getBooksPerRow();
    const rows = [];
    const list = books || [];
    for (let i = 0; i < list.length; i += perRow) {
      rows.push(list.slice(i, i + perRow));
    }
    while (rows.length < 2) {
      rows.push([]);
    }
    return rows;
  }

  // Update shelf navigation rail (arrows and indicator)
  function updateShelfNavRail(totalRows) {
    const rail = document.getElementById('shelf-nav-rail');
    const indicator = document.getElementById('shelf-page-indicator');
    const btnUp = document.getElementById('btn-shelf-up');
    const btnDown = document.getElementById('btn-shelf-down');

    if (!rail) return;

    if (totalRows <= 2) {
      rail.hidden = true;
      return;
    }

    rail.hidden = false;
    const currentTop = State.topRowIndex + 1;
    const currentBottom = State.topRowIndex + 2;
    indicator.textContent = `Shelves ${currentTop}–${currentBottom} of ${totalRows}`;

    btnUp.disabled = State.topRowIndex <= 0;
    btnDown.disabled = State.topRowIndex >= totalRows - 2;
  }

  // Smooth shelf step scrolling (windowing)
  function scrollShelf(direction) {
    if (State.isShelfAnimating) return;
    const lib = State.libraries.find(l => l.id === State.currentLibraryId);
    if (!lib) return;

    const rows = getShelfRows(lib.books);
    const totalRows = rows.length;
    if (totalRows <= 2) return;

    const nextIndex = State.topRowIndex + direction;
    if (nextIndex < 0 || nextIndex > totalRows - 2) return;

    dismissPulledOutBook();
    State.isShelfAnimating = true;

    const trackUpper = document.getElementById('track-upper');
    const trackLower = document.getElementById('track-lower');

    if (direction > 0) {
      trackUpper.classList.add('track-slide-out-up');
      trackLower.classList.add('track-slide-out-up');

      setTimeout(() => {
        State.topRowIndex = nextIndex;
        populateTrackWithRow(trackUpper, rows[State.topRowIndex]);
        populateTrackWithRow(trackLower, rows[State.topRowIndex + 1]);

        trackUpper.classList.remove('track-slide-out-up');
        trackLower.classList.remove('track-slide-out-up');
        trackUpper.classList.add('track-prep-down');
        trackLower.classList.add('track-prep-down');

        void trackUpper.offsetWidth;

        trackUpper.classList.remove('track-prep-down');
        trackLower.classList.remove('track-prep-down');

        updateShelfNavRail(totalRows);
        State.isShelfAnimating = false;
      }, 200);

    } else {
      trackUpper.classList.add('track-slide-out-down');
      trackLower.classList.add('track-slide-out-down');

      setTimeout(() => {
        State.topRowIndex = nextIndex;
        populateTrackWithRow(trackUpper, rows[State.topRowIndex]);
        populateTrackWithRow(trackLower, rows[State.topRowIndex + 1]);

        trackUpper.classList.remove('track-slide-out-down');
        trackLower.classList.remove('track-slide-out-down');
        trackUpper.classList.add('track-prep-up');
        trackLower.classList.add('track-prep-up');

        void trackUpper.offsetWidth;

        trackUpper.classList.remove('track-prep-up');
        trackLower.classList.remove('track-prep-up');

        updateShelfNavRail(totalRows);
        State.isShelfAnimating = false;
      }, 200);
    }
  }

  function populateTrackWithRow(trackElement, rowBooks) {
    trackElement.innerHTML = '';
    if (rowBooks && rowBooks.length > 0) {
      rowBooks.forEach(book => {
        trackElement.appendChild(createBookSpineElement(book));
      });
    }
  }

  // Render Screen 2: Inside a Library (Bookshelves)
  function renderCurrentLibrary() {
    const lib = State.libraries.find(l => l.id === State.currentLibraryId);
    if (!lib) {
      if (document.body.dataset.view === 'library') {
        switchView('menu');
      }
      return;
    }

    // Apply shelf wood theme & doodle wallpaper color
    document.body.dataset.woodTheme = lib.shelfWood || 'cafe-noir';
    updateDoodleWallpaperColor(lib.shelfWood || 'cafe-noir');

    // Update central name band
    const titleEl = document.getElementById('library-display-title');
    const countBadge = document.getElementById('library-book-count-badge');
    
    titleEl.textContent = (lib.isWishlist ? '🎀 ' : '') + lib.name;
    titleEl.style.color = lib.nameColor || '#ebd9b4';

    const books = lib.books || [];
    countBadge.textContent = books.length === 1 ? '1 story resting' : `${books.length} stories resting`;

    const emptyBox = document.getElementById('shelf-empty-state');
    if (books.length === 0) {
      if (emptyBox) {
        emptyBox.hidden = false;
        emptyBox.innerHTML = TavernLady.renderCard(lib.isWishlist ? 'empty-wishlist' : 'empty-shelf');
      }
    } else {
      if (emptyBox) emptyBox.hidden = true;
    }

    const rows = getShelfRows(books);
    const totalRows = rows.length;

    // Clamp topRowIndex
    State.topRowIndex = Math.max(0, Math.min(State.topRowIndex, totalRows - 2));

    const trackUpper = document.getElementById('track-upper');
    const trackLower = document.getElementById('track-lower');

    populateTrackWithRow(trackUpper, rows[State.topRowIndex]);
    populateTrackWithRow(trackLower, rows[State.topRowIndex + 1]);

    updateShelfNavRail(totalRows);
    renderDrawerLibraryList();
  }

  // Create individual Book Spine DOM element
  function createBookSpineElement(book) {
    const slot = document.createElement('div');
    slot.className = 'book-slot-wrapper';
    slot.dataset.bookId = book.id;

    if (State.selectedBookIds.has(book.id)) {
      slot.classList.add('selected');
    }

    const variance = getSpineVariance(book.id);
    const width = book.width || variance.width;
    const heightFactor = book.heightFactor || variance.heightFactor;

    const spineTitle = getSpineDisplayTitle(book.name);
    const spineColor = book.spineColor || '#5a3528';
    const textColor = getContrastTextColor(spineColor);
    const fontSize = spineTitle.length > 14 ? 12 : 14;

    let stickerSvgHtml = '';
    if (book.sticker && book.sticker !== 'none') {
      stickerSvgHtml = `<svg viewBox="0 0 32 32" class="slot-svg"><use href="#sticker-${book.sticker}"></use></svg>`;
    }

    slot.innerHTML = `
      <div class="book-spine" style="
        width: ${width}px;
        height: ${Math.round(heightFactor * 190)}px;
        background-color: ${spineColor};
        color: ${textColor};
      " title="${escapeHtml(book.name)} by ${escapeHtml(book.author || 'Unknown')}">
        <div class="spine-text-container">
          <span class="spine-title" style="font-size: ${fontSize}px;">
            ${escapeHtml(spineTitle)}
          </span>
        </div>
      </div>
      <div class="book-sticker-slot" title="Book remark">
        ${stickerSvgHtml}
      </div>
    `;

    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      handleBookClick(slot, book);
    });

    return slot;
  }

  // Book click handling (handles Selection Mode & Normal Pop-up Mode)
  function handleBookClick(slotElement, book) {
    if (State.isSelectionMode) {
      if (State.selectedBookIds.has(book.id)) {
        State.selectedBookIds.delete(book.id);
        slotElement.classList.remove('selected');
      } else {
        State.selectedBookIds.add(book.id);
        slotElement.classList.add('selected');
      }
      updateSelectionBanner();
      return;
    }

    if (State.pulledOutElement && State.pulledOutElement !== slotElement) {
      State.pulledOutElement.classList.remove('pulled-out');
    }

    slotElement.classList.add('pulled-out');
    State.pulledOutElement = slotElement;
    State.activeBookId = book.id;

    document.getElementById('quick-book-name').textContent = book.name;
    document.getElementById('quick-book-author').textContent = book.author ? `By ${book.author}` : 'Author not noted';

    // Show or hide Wishlist shortcut button in Quick Book modal
    const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
    const isWish = currentLib && currentLib.isWishlist;
    const quickWishBtn = document.getElementById('btn-quick-wishlist-gotit');
    if (quickWishBtn) quickWishBtn.hidden = !isWish;

    const modal = document.getElementById('modal-quick-book');
    modal.showModal();
  }

  function dismissPulledOutBook() {
    if (State.pulledOutElement) {
      State.pulledOutElement.classList.remove('pulled-out');
      State.pulledOutElement = null;
    }
  }

  // Toggle batch selection mode for Move Stories
  function toggleSelectionMode(enable) {
    State.isSelectionMode = enable;
    const banner = document.getElementById('selection-mode-banner');
    if (!enable) {
      State.selectedBookIds.clear();
      if (banner) banner.hidden = true;
    } else {
      State.selectedBookIds.clear();
      if (banner) banner.hidden = false;
      updateSelectionBanner();
    }
    dismissPulledOutBook();
    if (document.body.dataset.view === 'library' && State.currentLibraryId) {
      renderCurrentLibrary();
    }
  }

  function updateSelectionBanner() {
    const count = State.selectedBookIds.size;
    const counterEl = document.getElementById('selection-counter');
    const moveBtn = document.getElementById('btn-submit-selection');

    counterEl.textContent = count === 1 ? '1 story selected' : `${count} stories selected`;
    moveBtn.disabled = count === 0;
  }

  // Open Destination Library Picker modal (supports moving from Wishlist to standard library)
  function openMoveDestinationPicker(forWishlist = false) {
    const list = document.getElementById('move-dest-list');
    const tip = document.getElementById('move-single-lib-tip');
    const subtitle = document.getElementById('move-picker-subtitle');
    list.innerHTML = '';

    // If moving from Wishlist, only show regular libraries (not the wishlist itself)
    const otherLibs = State.libraries.filter(l => {
      if (forWishlist) return !l.isWishlist;
      return l.id !== State.currentLibraryId;
    });

    const count = State.selectedBookIds.size;
    if (forWishlist) {
      subtitle.textContent = 'Select a regular bookshelf to move this story to:';
    } else {
      subtitle.textContent = `Select which reading room to move ${count === 1 ? 'this story' : `these ${count} stories`} to:`;
    }

    if (otherLibs.length === 0) {
      list.hidden = true;
      tip.hidden = false;
      const tipText = tip.querySelector('.empty-hint');
      if (tipText) {
        tipText.textContent = forWishlist ?
          "You don't have any standard libraries yet. Create a regular reading room first!" :
          "You only have one library right now. Create another reading room first to move stories!";
      }
    } else {
      list.hidden = false;
      tip.hidden = true;

      otherLibs.forEach(targetLib => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'move-dest-item';

        const dotColor = targetLib.shelfWood === 'strawberry-coral' ? '#e58f86'
                       : targetLib.shelfWood === 'dark-olive' ? '#97b07f'
                       : '#d3a365';

        const bookCount = targetLib.books ? targetLib.books.length : 0;
        const countLabel = bookCount === 1 ? '1 story' : `${bookCount} stories`;

        item.innerHTML = `
          <div class="move-dest-main">
            <span class="move-dest-dot" style="background-color: ${dotColor};"></span>
            <span class="move-dest-name">${escapeHtml(targetLib.name)}</span>
          </div>
          <span class="move-dest-count">${countLabel}</span>
        `;

        item.addEventListener('click', () => {
          executeMoveStories(targetLib.id);
        });

        list.appendChild(item);
      });
    }

    document.getElementById('modal-move-picker').showModal();
  }

  // Transfer stories atomically
  function executeMoveStories(targetLibId) {
    const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
    const targetLib = State.libraries.find(l => l.id === targetLibId);
    if (!currentLib || !targetLib) return;

    const booksToMove = currentLib.books.filter(b => State.selectedBookIds.has(b.id));
    if (booksToMove.length === 0) return;

    currentLib.books = currentLib.books.filter(b => !State.selectedBookIds.has(b.id));
    targetLib.books.push(...booksToMove);

    Storage.saveAll();

    const movedCount = booksToMove.length;
    const msg = currentLib.isWishlist ?
      `Got it! Moved to "${targetLib.name}" ✨` :
      `${movedCount} ${movedCount === 1 ? 'story' : 'stories'} moved to "${targetLib.name}".`;
    Toast.show(msg);

    document.getElementById('modal-move-picker').close();
    toggleSelectionMode(false);
    renderCurrentLibrary();
  }

  // ==========================================================================
  // 9. LIBRARY CRUD ACTIONS
  // ==========================================================================
  function openLibrary(libId) {
    State.currentLibraryId = libId;
    switchView('library');
  }

  function deleteLibrary(libId) {
    State.libraries = State.libraries.filter(l => l.id !== libId);
    Storage.saveLibraries(State.libraries);
    Toast.show('Library deleted.');

    if (State.currentLibraryId === libId) {
      State.currentLibraryId = null;
      switchView('menu');
    } else {
      renderTodayMenu();
      renderDrawerLibraryList();
    }
  }

  function openCreateLibraryModal() {
    State.editingLibraryId = null;
    document.getElementById('library-form-title').textContent = 'Create New Library';
    document.getElementById('input-lib-name').value = '';
    document.querySelector('input[name="shelf-wood"][value="cafe-noir"]').checked = true;
    libColorWheel.setColor('#ebd9b4');
    document.getElementById('btn-submit-lib-form').textContent = 'Create Library';
    document.getElementById('modal-library-form').showModal();
  }

  function openEditLibraryModal() {
    const lib = State.libraries.find(l => l.id === State.currentLibraryId);
    if (!lib) return;

    State.editingLibraryId = lib.id;
    document.getElementById('library-form-title').textContent = 'Edit Library';
    document.getElementById('input-lib-name').value = lib.name;

    const woodRadio = document.querySelector(`input[name="shelf-wood"][value="${lib.shelfWood || 'cafe-noir'}"]`);
    if (woodRadio) woodRadio.checked = true;

    libColorWheel.setColor(lib.nameColor || '#ebd9b4');
    document.getElementById('btn-submit-lib-form').textContent = 'Save Changes';

    closeSideDrawer();
    document.getElementById('modal-library-form').showModal();
  }

  // ==========================================================================
  // 10. BOOK CRUD ACTIONS
  // ==========================================================================
  function openAddBookModal() {
    State.editingBookId = null;
    document.getElementById('book-form-title').textContent = 'Add Stories +';
    document.getElementById('input-book-name').value = '';
    document.getElementById('input-book-author').value = '';
    document.getElementById('input-book-genre').value = '';
    document.getElementById('input-book-desc').value = '';
    document.querySelector('input[name="book-sticker"][value="none"]').checked = true;

    // Reset reading status and progress
    const statusRadio = document.querySelector('input[name="book-status"][value="not-set"]');
    if (statusRadio) statusRadio.checked = true;
    const progressInput = document.getElementById('input-book-progress');
    if (progressInput) progressInput.value = '';

    // Random cozy preset spine color
    const presets = ['#5a3528', '#2d4133', '#2b3a4e', '#73532c', '#61304b', '#3d3b39'];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    bookColorWheel.setColor(randomPreset);

    document.getElementById('btn-submit-book-form').textContent = 'Place on Shelf';
    document.getElementById('modal-book-form').showModal();
  }

  function openEditBookModal(book) {
    State.editingBookId = book.id;
    document.getElementById('book-form-title').textContent = 'Edit Story';
    document.getElementById('input-book-name').value = book.name || '';
    document.getElementById('input-book-author').value = book.author || '';
    document.getElementById('input-book-genre').value = book.genre || '';
    document.getElementById('input-book-desc').value = book.description || '';

    const stickerVal = book.sticker || 'none';
    const radio = document.querySelector(`input[name="book-sticker"][value="${stickerVal}"]`);
    if (radio) radio.checked = true;

    const statusVal = book.readingStatus || 'not-set';
    const statusRadio = document.querySelector(`input[name="book-status"][value="${statusVal}"]`);
    if (statusRadio) statusRadio.checked = true;

    const progressInput = document.getElementById('input-book-progress');
    if (progressInput) progressInput.value = book.readingProgress || '';

    bookColorWheel.setColor(book.spineColor || '#5a3528');
    document.getElementById('btn-submit-book-form').textContent = 'Update Story';

    document.getElementById('modal-details').close();
    document.getElementById('modal-book-form').showModal();
  }

  function openBookDetailsModal(book) {
    document.getElementById('details-book-name').textContent = book.name;
    document.getElementById('details-author').textContent = book.author || 'Not specified';
    document.getElementById('details-genre').textContent = book.genre || 'Not specified';
    document.getElementById('details-description').textContent = book.description || 'No notes written yet for this story.';

    // Sticker badge beside details
    const stickerContainer = document.getElementById('details-sticker-container');
    if (book.sticker && book.sticker !== 'none') {
      stickerContainer.innerHTML = `<svg viewBox="0 0 32 32"><use href="#sticker-${book.sticker}"></use></svg>`;
      stickerContainer.hidden = false;
    } else {
      stickerContainer.innerHTML = '';
      stickerContainer.hidden = true;
    }

    // Reading Status Badge
    const statusPill = document.getElementById('details-status-pill');
    if (statusPill) {
      const statusMap = {
        'not-set': { label: 'Not set', cls: 'status-pill-none' },
        'to-read': { label: '⏳ To Read', cls: 'status-pill-to-read' },
        'reading': { label: '📖 Reading', cls: 'status-pill-reading' },
        'finished': { label: '✨ Finished', cls: 'status-pill-finished' }
      };
      const info = statusMap[book.readingStatus] || statusMap['not-set'];
      let label = info.label;
      if (book.readingProgress && book.readingStatus && book.readingStatus !== 'not-set') {
        label += ` (${book.readingProgress})`;
      }
      statusPill.textContent = label;
      statusPill.className = `status-badge-pill ${info.cls}`;
    }

    // Toggle Wishlist "Got it!" button in details
    const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
    const wishlistGotBtn = document.getElementById('btn-details-wishlist-gotit');
    if (wishlistGotBtn) {
      wishlistGotBtn.hidden = !(currentLib && currentLib.isWishlist);
    }

    // Render Quotes for this book
    renderBookDetailsQuotes(book);

    document.getElementById('modal-quick-book').close();
    document.getElementById('modal-details').showModal();
  }

  function renderBookDetailsQuotes(book) {
    const listEl = document.getElementById('details-quotes-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const matching = (State.quotes || []).filter(q => {
      if (q.bookId && q.bookId === book.id) return true;
      if (q.bookTitle && q.bookTitle.toLowerCase().trim() === book.name.toLowerCase().trim()) return true;
      return false;
    });

    if (matching.length === 0) {
      listEl.innerHTML = '<p class="details-quotes-empty">No memorable passages inscribed yet for this story.</p>';
      return;
    }

    matching.forEach(q => {
      const item = document.createElement('div');
      item.className = 'details-quote-snippet';
      item.innerHTML = `
        <blockquote class="details-quote-text">"${escapeHtml(q.text)}"</blockquote>
        <div class="details-quote-meta">
          ${q.page ? `<span class="quote-page">${escapeHtml(q.page)}</span>` : ''}
          ${q.notes ? `<span class="quote-notes">• ${escapeHtml(q.notes)}</span>` : ''}
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  function deleteBook(bookId) {
    const lib = State.libraries.find(l => l.id === State.currentLibraryId);
    if (!lib) return;
    lib.books = lib.books.filter(b => b.id !== bookId);
    Storage.saveAll();
    dismissPulledOutBook();
    const rows = getShelfRows(lib.books);
    State.topRowIndex = Math.max(0, Math.min(State.topRowIndex, rows.length - 2));
    renderCurrentLibrary();
    Toast.show('Story removed from shelf.');
  }

  // ==========================================================================
  // 11. SIDE DRAWER NAVIGATION
  // ==========================================================================
  function openSideDrawer() {
    document.getElementById('side-drawer').hidden = false;
    document.getElementById('drawer-overlay').hidden = false;
    renderDrawerLibraryList();
  }

  function closeSideDrawer() {
    document.getElementById('side-drawer').hidden = true;
    document.getElementById('drawer-overlay').hidden = true;
  }

  function renderDrawerLibraryList() {
    const list = document.getElementById('drawer-library-list');
    list.innerHTML = '';

    State.libraries.forEach(lib => {
      const li = document.createElement('li');
      li.className = `drawer-lib-item ${lib.id === State.currentLibraryId ? 'active' : ''}`;
      const prefix = lib.isWishlist ? '🎀 ' : '';
      li.innerHTML = `
        <span class="drawer-lib-name">${prefix}${escapeHtml(lib.name)}</span>
        <span class="drawer-lib-badge">${lib.books ? lib.books.length : 0} books</span>
      `;
      li.addEventListener('click', () => {
        openLibrary(lib.id);
        closeSideDrawer();
      });
      list.appendChild(li);
    });

    // Update Wishlist button text in drawer
    const drawerWishlistBtn = document.getElementById('btn-drawer-create-wishlist');
    if (drawerWishlistBtn) {
      const hasWishlist = State.libraries.some(l => l.isWishlist);
      drawerWishlistBtn.textContent = hasWishlist ? '🎀 Open THE WISHLIST' : '🎀 + THE WISHLIST';
    }

    const currentLibSection = document.getElementById('drawer-current-lib-section');
    currentLibSection.hidden = !State.currentLibraryId;
  }

  // ==========================================================================
  // 12. BACKUP & RESTORE ENGINE (JSON Save & Load)
  // ==========================================================================
  function exportLibrariesJson() {
    const backupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      libraries: State.libraries,
      quotes: State.quotes
    };
    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cozy-libraries-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Toast.show('Libraries & quotes saved to backup file.');
  }

  function handleFileImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let importedLibs = [];
        let importedQuotes = [];

        if (Array.isArray(parsed)) {
          // Legacy v1 backup (raw array of libraries)
          importedLibs = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // v2 backup object
          if (Array.isArray(parsed.libraries)) {
            importedLibs = parsed.libraries;
          } else {
            throw new Error('Invalid structure: Missing libraries array.');
          }
          if (Array.isArray(parsed.quotes)) {
            importedQuotes = parsed.quotes;
          }
        } else {
          throw new Error('Invalid structure: Expected an array or backup object.');
        }

        // Validate basic fields & normalize
        for (const lib of importedLibs) {
          if (!lib.id || !lib.name || !Array.isArray(lib.books)) {
            throw new Error('Invalid library data: missing name or books array.');
          }
          lib.books.forEach(normalizeBook);
        }

        State.pendingImportData = {
          libraries: importedLibs,
          quotes: importedQuotes
        };

        const countLibs = importedLibs.length;
        const countQuotes = importedQuotes.length;
        document.getElementById('restore-message').textContent = 
          `Found ${countLibs} reading room(s) and ${countQuotes} quote(s) in backup. Would you like to merge or replace?`;
        document.getElementById('modal-restore-choice').showModal();
      } catch (err) {
        TavernLady.showModal('Parchment Parsing Error', 'Could not load backup file: ' + err.message, '⚠️');
      }
    };
    reader.readAsText(file);
  }

  function applyRestore(mode) {
    if (!State.pendingImportData) return;
    const { libraries: importedLibs, quotes: importedQuotes } = State.pendingImportData;

    if (mode === 'replace') {
      State.libraries = importedLibs;
      if (importedQuotes && importedQuotes.length > 0) {
        State.quotes = importedQuotes;
      }
    } else if (mode === 'merge') {
      const existingIds = new Set(State.libraries.map(l => l.id));
      importedLibs.forEach(importedLib => {
        let uniqueId = importedLib.id;
        if (existingIds.has(uniqueId)) {
          uniqueId = 'lib-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
          importedLib.id = uniqueId;
        }
        State.libraries.push(importedLib);
      });

      if (importedQuotes && importedQuotes.length > 0) {
        const existingQuoteIds = new Set(State.quotes.map(q => q.id));
        importedQuotes.forEach(q => {
          let uniqueQId = q.id;
          if (existingQuoteIds.has(uniqueQId)) {
            uniqueQId = 'quote-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            q.id = uniqueQId;
          }
          State.quotes.push(q);
        });
      }
    }

    Storage.saveAll();
    State.pendingImportData = null;
    document.getElementById('modal-restore-choice').close();
    Toast.show('Libraries & quotes restored successfully!');

    if (State.currentLibraryId) {
      renderCurrentLibrary();
    } else {
      renderTodayMenu();
    }
    renderDrawerLibraryList();
  }

  // ==========================================================================
  // FEATURE 2: UNIVERSAL SEARCH & FILTERS ENGINE
  // ==========================================================================
  function populateSearchFilterOptions() {
    const libSelect = document.getElementById('filter-library-select');
    const genreSelect = document.getElementById('filter-genre-select');

    if (libSelect) {
      const curVal = libSelect.value;
      libSelect.innerHTML = '<option value="all">All Shelves</option>';
      State.libraries.forEach(lib => {
        const opt = document.createElement('option');
        opt.value = lib.id;
        opt.textContent = `${lib.isWishlist ? '🎀 ' : ''}${lib.name}`;
        libSelect.appendChild(opt);
      });
      libSelect.value = curVal || 'all';
      if (!libSelect.value) libSelect.value = 'all';
    }

    if (genreSelect) {
      const curVal = genreSelect.value;
      genreSelect.innerHTML = '<option value="all">All Genres</option>';
      const genres = new Set();
      State.libraries.forEach(lib => {
        (lib.books || []).forEach(b => {
          if (b.genre && b.genre.trim()) {
            genres.add(b.genre.trim());
          }
        });
      });
      Array.from(genres).sort((a, b) => a.localeCompare(b)).forEach(g => {
        const opt = document.createElement('option');
        opt.value = g;
        opt.textContent = g;
        genreSelect.appendChild(opt);
      });
      genreSelect.value = curVal || 'all';
      if (!genreSelect.value) genreSelect.value = 'all';
    }
  }

  function renderSearchDesk() {
    populateSearchFilterOptions();

    const queryInput = document.getElementById('input-search-query');
    const clearBtn = document.getElementById('btn-search-clear-input');
    const query = (queryInput ? queryInput.value : '').trim().toLowerCase();

    if (clearBtn) {
      clearBtn.hidden = !query;
    }

    const libFilter = document.getElementById('filter-library-select').value;
    const genreFilter = document.getElementById('filter-genre-select').value;
    const stickerFilter = document.getElementById('filter-sticker-select').value;
    const statusFilter = document.getElementById('filter-status-select').value;
    const sortOrder = document.getElementById('filter-sort-select').value;

    // Gather and filter books
    let matchedBooks = [];
    State.libraries.forEach(lib => {
      if (libFilter !== 'all' && lib.id !== libFilter) return;

      (lib.books || []).forEach(book => {
        // Genre filter
        if (genreFilter !== 'all' && (!book.genre || book.genre.toLowerCase() !== genreFilter.toLowerCase())) {
          return;
        }
        // Sticker filter
        if (stickerFilter !== 'all') {
          const s = book.sticker || 'none';
          if (s !== stickerFilter) return;
        }
        // Reading Status filter
        if (statusFilter !== 'all') {
          const st = book.readingStatus || 'not-set';
          if (st !== statusFilter) return;
        }
        // Query match
        if (query) {
          const nameMatch = (book.name || '').toLowerCase().includes(query);
          const authorMatch = (book.author || '').toLowerCase().includes(query);
          const genreMatch = (book.genre || '').toLowerCase().includes(query);
          const descMatch = (book.description || '').toLowerCase().includes(query);
          if (!nameMatch && !authorMatch && !genreMatch && !descMatch) {
            return;
          }
        }

        matchedBooks.push({ book, library: lib });
      });
    });

    // Sort books
    matchedBooks.sort((a, b) => {
      if (sortOrder === 'author') {
        return (a.book.author || '').localeCompare(b.book.author || '');
      } else if (sortOrder === 'date-newest') {
        return (b.book.dateAdded || 0) - (a.book.dateAdded || 0);
      } else if (sortOrder === 'date-oldest') {
        return (a.book.dateAdded || 0) - (b.book.dateAdded || 0);
      } else {
        // default title
        return (a.book.name || '').localeCompare(b.book.name || '');
      }
    });

    // Gather and filter quotes
    let matchedQuotes = [];
    (State.quotes || []).forEach(q => {
      if (libFilter !== 'all') {
        const targetLib = State.libraries.find(l => l.id === libFilter);
        const bookInLib = targetLib && (targetLib.books || []).some(b => {
          return (q.bookId && b.id === q.bookId) || (q.bookTitle && b.name.toLowerCase().trim() === q.bookTitle.toLowerCase().trim());
        });
        if (!bookInLib) return;
      }

      if (query) {
        const textMatch = (q.text || '').toLowerCase().includes(query);
        const authorMatch = (q.author || '').toLowerCase().includes(query);
        const bookMatch = (q.bookTitle || '').toLowerCase().includes(query);
        const notesMatch = (q.notes || '').toLowerCase().includes(query);
        if (!textMatch && !authorMatch && !bookMatch && !notesMatch) {
          return;
        }
      }

      matchedQuotes.push(q);
    });

    // Meta Count
    const countLabel = document.getElementById('search-count-label');
    if (countLabel) {
      const bText = `${matchedBooks.length} ${matchedBooks.length === 1 ? 'story' : 'stories'}`;
      const qText = `${matchedQuotes.length} ${matchedQuotes.length === 1 ? 'quote' : 'quotes'}`;
      countLabel.textContent = `Found ${bText} and ${qText}`;
    }

    const booksContainer = document.getElementById('search-books-container');
    const booksSection = document.getElementById('search-books-section');
    const quotesContainer = document.getElementById('search-quotes-container');
    const quotesSection = document.getElementById('search-quotes-section');
    const emptyState = document.getElementById('search-empty-state');

    booksContainer.innerHTML = '';
    quotesContainer.innerHTML = '';

    const totalResults = matchedBooks.length + matchedQuotes.length;

    if (totalResults === 0) {
      booksSection.hidden = true;
      quotesSection.hidden = true;
      emptyState.hidden = false;
      emptyState.innerHTML = TavernLady.renderCard('no-search-results', null, Date.now());
      return;
    }

    emptyState.hidden = true;

    // Render Books Grid
    if (matchedBooks.length > 0) {
      booksSection.hidden = false;
      matchedBooks.forEach(({ book, library }) => {
        const card = document.createElement('div');
        card.className = 'search-book-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.style.setProperty('--spine-color', book.spineColor || '#5a3528');

        const statusMap = {
          'to-read': '⏳ To Read',
          'reading': '📖 Reading',
          'finished': '✨ Finished'
        };
        const statusText = statusMap[book.readingStatus] || '';

        card.innerHTML = `
          <div class="search-book-spine-accent"></div>
          <div class="search-book-info">
            <h3 class="search-book-title">${escapeHtml(book.name)}</h3>
            <p class="search-book-author">${escapeHtml(book.author || 'Unknown Author')}</p>
            <div class="search-book-meta-tags">
              <span class="search-lib-tag">${library.isWishlist ? '🎀 ' : '📍 '}${escapeHtml(library.name)}</span>
              ${book.genre ? `<span class="search-genre-tag">${escapeHtml(book.genre)}</span>` : ''}
              ${statusText ? `<span class="search-status-tag">${escapeHtml(statusText)}</span>` : ''}
            </div>
            ${book.description ? `<p class="search-book-snippet">${escapeHtml(book.description.slice(0, 110))}${book.description.length > 110 ? '...' : ''}</p>` : ''}
          </div>
        `;

        card.addEventListener('click', () => {
          openLibrary(library.id);
          setTimeout(() => {
            State.activeBookId = book.id;
            openBookDetailsModal(book);
          }, 120);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });

        booksContainer.appendChild(card);
      });
    } else {
      booksSection.hidden = true;
    }

    // Render Quotes List
    if (matchedQuotes.length > 0) {
      quotesSection.hidden = false;
      matchedQuotes.forEach(q => {
        const item = document.createElement('div');
        item.className = 'search-quote-card';
        item.innerHTML = `
          <blockquote class="search-quote-text">"${escapeHtml(q.text)}"</blockquote>
          <div class="search-quote-meta">
            <strong>${escapeHtml(q.author || 'Unknown')}</strong>
            ${q.bookTitle ? `— <em>${escapeHtml(q.bookTitle)}</em>` : ''}
            ${q.page ? `(${escapeHtml(q.page)})` : ''}
          </div>
        `;
        quotesContainer.appendChild(item);
      });
    } else {
      quotesSection.hidden = true;
    }
  }

  function resetSearchFilters() {
    const q = document.getElementById('input-search-query');
    if (q) q.value = '';
    const l = document.getElementById('filter-library-select');
    if (l) l.value = 'all';
    const g = document.getElementById('filter-genre-select');
    if (g) g.value = 'all';
    const st = document.getElementById('filter-sticker-select');
    if (st) st.value = 'all';
    const s = document.getElementById('filter-status-select');
    if (s) s.value = 'all';
    const so = document.getElementById('filter-sort-select');
    if (so) so.value = 'title';

    renderSearchDesk();
  }

  // ==========================================================================
  // FEATURE 6: COMMONPLACE QUOTES ENGINE
  // ==========================================================================
  function renderQuotesJournal() {
    const eveningCard = document.getElementById('quote-evening-card');
    const eveningText = document.getElementById('evening-quote-text');
    const eveningCite = document.getElementById('evening-quote-cite');
    const container = document.getElementById('quotes-list-container');
    const emptyState = document.getElementById('quotes-empty-state');

    container.innerHTML = '';

    if (!State.quotes || State.quotes.length === 0) {
      if (eveningCard) eveningCard.hidden = true;
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.innerHTML = TavernLady.renderCard('no-quotes');
      }
      return;
    }

    if (emptyState) emptyState.hidden = true;

    // Quote of the Evening
    if (eveningCard && State.quotes.length > 0) {
      eveningCard.hidden = false;
      const q = State.quotes[State.eveningQuoteIndex % State.quotes.length];
      eveningText.textContent = `"${q.text}"`;
      eveningCite.innerHTML = `— <span class="cite-author">${escapeHtml(q.author || 'Unknown')}</span>${q.bookTitle ? `, <em class="cite-book">${escapeHtml(q.bookTitle)}</em>` : ''}${q.page ? ` (${escapeHtml(q.page)})` : ''}`;
    }

    // Quotes Grid
    State.quotes.forEach(quote => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      card.innerHTML = `
        <div class="quote-card-header">
          <span class="quote-feather">✒️</span>
          <div class="quote-card-actions">
            <button type="button" class="btn-quote-mini" data-action="edit" title="Edit quote">✏️</button>
            <button type="button" class="btn-quote-mini danger" data-action="delete" title="Delete quote">🗑️</button>
          </div>
        </div>
        <blockquote class="quote-card-text">"${escapeHtml(quote.text)}"</blockquote>
        <div class="quote-card-meta">
          <div class="quote-source-line">
            <strong class="quote-author">${escapeHtml(quote.author || 'Unknown')}</strong>
            ${quote.bookTitle ? `<span class="quote-book-title">— ${escapeHtml(quote.bookTitle)}</span>` : ''}
            ${quote.page ? `<span class="quote-page-tag">${escapeHtml(quote.page)}</span>` : ''}
          </div>
          ${quote.notes ? `<p class="quote-notes-text">${escapeHtml(quote.notes)}</p>` : ''}
        </div>
      `;

      card.querySelector('[data-action="edit"]').addEventListener('click', () => {
        openEditQuoteModal(quote);
      });

      card.querySelector('[data-action="delete"]').addEventListener('click', () => {
        showConfirmModal(
          'Delete Inscription?',
          'Remove this quote from your Commonplace Book?',
          () => deleteQuote(quote.id)
        );
      });

      container.appendChild(card);
    });
  }

  function shuffleEveningQuote() {
    if (!State.quotes || State.quotes.length <= 1) {
      Toast.show('Inscribe more quotes to draw another!');
      return;
    }
    let nextIdx = Math.floor(Math.random() * State.quotes.length);
    if (nextIdx === State.eveningQuoteIndex) {
      nextIdx = (nextIdx + 1) % State.quotes.length;
    }
    State.eveningQuoteIndex = nextIdx;
    renderQuotesJournal();
    Toast.show('Drew another quote for the evening 🌙');
  }

  function populateQuoteBookDropdown(selectedBookIdOrTitle = null) {
    const select = document.getElementById('select-quote-book');
    if (!select) return;

    select.innerHTML = `
      <option value="">— Select from your shelves —</option>
      <option value="__custom__">Custom / Other Book Title...</option>
    `;

    State.libraries.forEach(lib => {
      if (!lib.books || lib.books.length === 0) return;
      const group = document.createElement('optgroup');
      group.label = lib.name;
      lib.books.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.dataset.title = b.name;
        opt.dataset.author = b.author || '';
        opt.textContent = `${b.name} (${b.author || 'Unknown'})`;
        group.appendChild(opt);
      });
      select.appendChild(group);
    });

    if (selectedBookIdOrTitle) {
      let matched = false;
      for (const opt of select.options) {
        if (opt.value === selectedBookIdOrTitle) {
          select.value = opt.value;
          matched = true;
          break;
        }
      }
      if (!matched) {
        for (const opt of select.options) {
          if (opt.dataset && opt.dataset.title && opt.dataset.title.toLowerCase().trim() === selectedBookIdOrTitle.toLowerCase().trim()) {
            select.value = opt.value;
            matched = true;
            break;
          }
        }
      }
      if (!matched) {
        select.value = '__custom__';
        const customGroup = document.getElementById('group-quote-custom-book');
        if (customGroup) customGroup.hidden = false;
        const customInput = document.getElementById('input-quote-custom-book');
        if (customInput) customInput.value = selectedBookIdOrTitle;
      }
    }
  }

  function openQuoteModal(prefillBook = null) {
    State.editingQuoteId = null;
    document.getElementById('quote-form-title').textContent = 'Inscribe a Quote';
    document.getElementById('input-quote-text').value = '';
    document.getElementById('input-quote-page').value = '';
    document.getElementById('input-quote-notes').value = '';

    const customGroup = document.getElementById('group-quote-custom-book');
    if (customGroup) customGroup.hidden = true;
    const customInput = document.getElementById('input-quote-custom-book');
    if (customInput) customInput.value = '';

    if (prefillBook) {
      populateQuoteBookDropdown(prefillBook.id || prefillBook.name);
      document.getElementById('input-quote-author').value = prefillBook.author || '';
    } else {
      populateQuoteBookDropdown();
      document.getElementById('input-quote-author').value = '';
    }

    document.getElementById('btn-submit-quote-form').textContent = 'Inscribe in Journal';
    document.getElementById('modal-quote-form').showModal();
  }

  function openEditQuoteModal(quote) {
    State.editingQuoteId = quote.id;
    document.getElementById('quote-form-title').textContent = 'Edit Inscription';
    document.getElementById('input-quote-text').value = quote.text || '';
    document.getElementById('input-quote-page').value = quote.page || '';
    document.getElementById('input-quote-author').value = quote.author || '';
    document.getElementById('input-quote-notes').value = quote.notes || '';

    populateQuoteBookDropdown(quote.bookId || quote.bookTitle);

    document.getElementById('btn-submit-quote-form').textContent = 'Save Inscription';
    document.getElementById('modal-quote-form').showModal();
  }

  function deleteQuote(quoteId) {
    State.quotes = (State.quotes || []).filter(q => q.id !== quoteId);
    Storage.saveAll();
    Toast.show('Inscription removed from journal.');
    renderQuotesJournal();

    const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
    const activeBook = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
    if (activeBook) {
      renderBookDetailsQuotes(activeBook);
    }
  }

  // ==========================================================================
  // 13. UTILITIES
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // ==========================================================================
  // 14. INITIALIZATION & EVENT BINDINGS
  // ==========================================================================
  let libColorWheel = null;
  let bookColorWheel = null;

  function initApp() {
    try {
      // 1. Initialize Ambient Particles
      initDustMotes();

    // 2. Load Stored Data
    const storedData = Storage.loadAll();
    let storedLibs = storedData.libraries;
    if (!storedLibs) {
      storedLibs = [];
    }
    State.libraries = storedLibs;

    let storedQuotes = storedData.quotes;
    if (!storedQuotes) {
      storedQuotes = [];
    }
    State.quotes = storedQuotes;

    // 3. Room Dimmer setup
    const savedDimmer = Storage.loadDimmer();
    document.documentElement.style.setProperty('--room-dimmer', savedDimmer);
    const dockDimmer = document.getElementById('room-dimmer-input');
    const drawerDimmer = document.getElementById('drawer-dimmer-slider');
    dockDimmer.value = savedDimmer;
    drawerDimmer.value = savedDimmer;

    const handleDimmerChange = (val) => {
      document.documentElement.style.setProperty('--room-dimmer', val);
      dockDimmer.value = val;
      drawerDimmer.value = val;
      Storage.saveDimmer(val);
    };

    dockDimmer.addEventListener('input', (e) => handleDimmerChange(e.target.value));
    drawerDimmer.addEventListener('input', (e) => handleDimmerChange(e.target.value));

    // 4. Color Wheels setup
    libColorWheel = new ColorWheel(
      'canvas-lib-wheel', 'reticle-lib-wheel', 'slider-lib-lightness',
      'input-lib-hex', 'chip-lib-color', 'native-lib-color', '#ebd9b4'
    );

    bookColorWheel = new ColorWheel(
      'canvas-book-wheel', 'reticle-book-wheel', 'slider-book-lightness',
      'input-book-hex', 'chip-book-color', 'native-book-color', '#5a3528'
    );

    // Color palette preset clicks for books
    document.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        bookColorWheel.setColor(btn.dataset.color);
      });
    });

    // 5. Soundscape Controls
    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    const soundPopover = document.getElementById('sound-popover');
    const soundStatusLabel = document.getElementById('sound-status-label');
    const soundIcon = document.getElementById('sound-icon');
    const volumeSlider = document.getElementById('sound-volume-slider');
    const audioSettings = Storage.loadAudioSettings();

    volumeSlider.value = audioSettings.volume;
    AudioEngine.setVolume(audioSettings.volume);

    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundPopover.hidden = !soundPopover.hidden;
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('audio-cluster').contains(e.target)) {
        soundPopover.hidden = true;
      }
    });

    document.querySelectorAll('.sound-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.sound-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const soundType = chip.dataset.sound;
        AudioEngine.play(soundType);

        if (soundType === 'off') {
          soundStatusLabel.textContent = 'Sound: Off';
          soundIcon.textContent = '🔈';
        } else if (soundType === 'rain') {
          soundStatusLabel.textContent = 'Rain';
          soundIcon.textContent = '🌧️';
        } else if (soundType === 'fireplace') {
          soundStatusLabel.textContent = 'Fireplace';
          soundIcon.textContent = '🔥';
        }

        Storage.saveAudioSettings({ sound: soundType, volume: AudioEngine.volume });
      });
    });

    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      AudioEngine.setVolume(val);
      Storage.saveAudioSettings({ sound: AudioEngine.currentSound, volume: val });
    });

    // Pause audio when tab is backgrounded
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (AudioEngine.currentSound !== 'off') {
          AudioEngine.stop();
        }
      } else {
        const saved = Storage.loadAudioSettings();
        if (saved.sound !== 'off') {
          AudioEngine.play(saved.sound);
        }
      }
    });

    // 6. Navigation Buttons
    document.getElementById('btn-dock-menu').addEventListener('click', () => {
      dismissPulledOutBook();
      switchView('menu');
    });

    const dockSearchBtn = document.getElementById('btn-dock-search');
    if (dockSearchBtn) {
      dockSearchBtn.addEventListener('click', () => {
        dismissPulledOutBook();
        switchView('search');
      });
    }

    const dockQuotesBtn = document.getElementById('btn-dock-quotes');
    if (dockQuotesBtn) {
      dockQuotesBtn.addEventListener('click', () => {
        dismissPulledOutBook();
        switchView('quotes');
      });
    }

    document.getElementById('btn-open-side-drawer').addEventListener('click', openSideDrawer);
    document.getElementById('btn-drawer-close').addEventListener('click', closeSideDrawer);
    document.getElementById('drawer-overlay').addEventListener('click', closeSideDrawer);
    document.getElementById('btn-drawer-back').addEventListener('click', () => {
      closeSideDrawer();
      dismissPulledOutBook();
      switchView('menu');
    });

    // Drawer Study Navigation links
    const drawerNavMenu = document.getElementById('btn-drawer-nav-menu');
    if (drawerNavMenu) {
      drawerNavMenu.addEventListener('click', () => {
        closeSideDrawer();
        dismissPulledOutBook();
        switchView('menu');
      });
    }

    const drawerNavSearch = document.getElementById('btn-drawer-nav-search');
    if (drawerNavSearch) {
      drawerNavSearch.addEventListener('click', () => {
        closeSideDrawer();
        dismissPulledOutBook();
        switchView('search');
      });
    }

    const drawerNavQuotes = document.getElementById('btn-drawer-nav-quotes');
    if (drawerNavQuotes) {
      drawerNavQuotes.addEventListener('click', () => {
        closeSideDrawer();
        dismissPulledOutBook();
        switchView('quotes');
      });
    }

    const drawerNavWishlist = document.getElementById('btn-drawer-nav-wishlist');
    if (drawerNavWishlist) {
      drawerNavWishlist.addEventListener('click', () => {
        closeSideDrawer();
        dismissPulledOutBook();
        openOrCreateWishlist();
      });
    }

    // Return to Menu buttons from Search & Quotes
    const searchBackMenu = document.getElementById('btn-search-back-menu');
    if (searchBackMenu) {
      searchBackMenu.addEventListener('click', () => {
        dismissPulledOutBook();
        switchView('menu');
      });
    }

    const quotesBackMenu = document.getElementById('btn-quotes-back-menu');
    if (quotesBackMenu) {
      quotesBackMenu.addEventListener('click', () => {
        dismissPulledOutBook();
        switchView('menu');
      });
    }

    // Wishlist Shelf Buttons
    const menuWishlistBtn = document.getElementById('btn-menu-wishlist');
    if (menuWishlistBtn) {
      menuWishlistBtn.addEventListener('click', openOrCreateWishlist);
    }

    const drawerWishlistBtn = document.getElementById('btn-drawer-create-wishlist');
    if (drawerWishlistBtn) {
      drawerWishlistBtn.addEventListener('click', () => {
        closeSideDrawer();
        openOrCreateWishlist();
      });
    }

    // Create Library Buttons
    document.getElementById('btn-menu-create-lib').addEventListener('click', openCreateLibraryModal);
    document.getElementById('btn-drawer-create-lib').addEventListener('click', () => {
      closeSideDrawer();
      openCreateLibraryModal();
    });

    // Load Sample button on empty state
    document.getElementById('btn-load-sample-empty').addEventListener('click', () => {
      State.libraries = [JSON.parse(JSON.stringify(SAMPLE_LIBRARY))];
      Storage.saveAll();
      Toast.show('Loaded "The Midnight Study" sample library!');
      renderTodayMenu();
    });

    // FAB Add Story
    document.getElementById('fab-add-story').addEventListener('click', openAddBookModal);

    // Edit / Delete Current Library in Drawer
    document.getElementById('btn-drawer-edit-current').addEventListener('click', openEditLibraryModal);
    document.getElementById('btn-drawer-delete-current').addEventListener('click', () => {
      const lib = State.libraries.find(l => l.id === State.currentLibraryId);
      if (!lib) return;
      closeSideDrawer();
      showConfirmModal(
        'Delete Current Library?',
        `Are you sure you want to delete "${lib.name}" and all its books?`,
        () => deleteLibrary(lib.id)
      );
    });

    // 7. Modals: Quick Book Pop-up Handlers
    document.getElementById('btn-quick-close').addEventListener('click', () => {
      document.getElementById('modal-quick-book').close();
      dismissPulledOutBook();
    });

    document.getElementById('modal-quick-book').addEventListener('close', dismissPulledOutBook);

    document.getElementById('btn-quick-move').addEventListener('click', () => {
      State.selectedBookIds = new Set([State.activeBookId]);
      document.getElementById('modal-quick-book').close();
      dismissPulledOutBook();
      openMoveDestinationPicker();
    });

    const quickWishlistGot = document.getElementById('btn-quick-wishlist-gotit');
    if (quickWishlistGot) {
      quickWishlistGot.addEventListener('click', () => {
        State.selectedBookIds = new Set([State.activeBookId]);
        document.getElementById('modal-quick-book').close();
        dismissPulledOutBook();
        openMoveDestinationPicker(true);
      });
    }

    document.getElementById('btn-quick-change-name').addEventListener('click', () => {
      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
      if (!book) return;

      document.getElementById('input-quick-name').value = book.name;
      document.getElementById('modal-quick-book').close();
      document.getElementById('modal-change-name').showModal();
    });

    document.getElementById('btn-cancel-quick-name').addEventListener('click', () => {
      document.getElementById('modal-change-name').close();
      dismissPulledOutBook();
    });

    document.getElementById('form-change-name').addEventListener('submit', (e) => {
      e.preventDefault();
      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
      const newName = document.getElementById('input-quick-name').value.trim();

      if (book && newName) {
        book.name = newName;
        Storage.saveAll();
        document.getElementById('modal-change-name').close();
        dismissPulledOutBook();
        renderCurrentLibrary();
        Toast.show('Title updated.');
      }
    });

    // 8. Modals: Book Details ("More About") Handlers
    document.getElementById('btn-quick-details').addEventListener('click', () => {
      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
      if (book) openBookDetailsModal(book);
    });

    document.getElementById('btn-details-close').addEventListener('click', () => {
      document.getElementById('modal-details').close();
      dismissPulledOutBook();
    });

    document.getElementById('modal-details').addEventListener('close', dismissPulledOutBook);

    document.getElementById('btn-details-edit').addEventListener('click', () => {
      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
      if (book) openEditBookModal(book);
    });

    document.getElementById('btn-details-delete').addEventListener('click', () => {
      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
      if (!book) return;

      document.getElementById('modal-details').close();
      showConfirmModal(
        'Delete Story?',
        `Remove "${book.name}" from the bookshelf?`,
        () => deleteBook(book.id)
      );
    });

    const detailsWishlistGot = document.getElementById('btn-details-wishlist-gotit');
    if (detailsWishlistGot) {
      detailsWishlistGot.addEventListener('click', () => {
        State.selectedBookIds = new Set([State.activeBookId]);
        document.getElementById('modal-details').close();
        dismissPulledOutBook();
        openMoveDestinationPicker(true);
      });
    }

    const detailsAddQuoteBtn = document.getElementById('btn-details-add-quote');
    if (detailsAddQuoteBtn) {
      detailsAddQuoteBtn.addEventListener('click', () => {
        const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
        const book = currentLib ? currentLib.books.find(b => b.id === State.activeBookId) : null;
        document.getElementById('modal-details').close();
        openQuoteModal(book);
      });
    }

    // 9. Modals: Library Form (Create / Edit)
    document.getElementById('btn-cancel-lib-form').addEventListener('click', () => {
      document.getElementById('modal-library-form').close();
    });
    document.getElementById('btn-lib-form-close').addEventListener('click', () => {
      document.getElementById('modal-library-form').close();
    });

    document.getElementById('form-library').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-lib-name').value.trim();
      const wood = document.querySelector('input[name="shelf-wood"]:checked').value;
      const nameColor = libColorWheel.getHex();

      if (!name) return;

      if (State.editingLibraryId) {
        // Edit existing
        const lib = State.libraries.find(l => l.id === State.editingLibraryId);
        if (lib) {
          lib.name = name;
          lib.shelfWood = wood;
          lib.nameColor = nameColor;
          Storage.saveAll();
          Toast.show('Library updated.');
          renderCurrentLibrary();
        }
      } else {
        // Create new
        const newLib = {
          id: 'lib-' + Date.now(),
          name: name,
          shelfWood: wood,
          nameColor: nameColor,
          isWishlist: false,
          books: []
        };
        State.libraries.push(newLib);
        Storage.saveAll();
        Toast.show(`Opened "${name}"!`);
        openLibrary(newLib.id);
      }

      document.getElementById('modal-library-form').close();
    });

    // 10. Modals: Book Form (Add / Edit)
    document.getElementById('btn-cancel-book-form').addEventListener('click', () => {
      document.getElementById('modal-book-form').close();
      dismissPulledOutBook();
    });
    document.getElementById('btn-book-form-close').addEventListener('click', () => {
      document.getElementById('modal-book-form').close();
      dismissPulledOutBook();
    });

    document.getElementById('form-book').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-book-name').value.trim();
      const author = document.getElementById('input-book-author').value.trim();
      const genre = document.getElementById('input-book-genre').value.trim();
      const desc = document.getElementById('input-book-desc').value.trim();
      const sticker = document.querySelector('input[name="book-sticker"]:checked').value;
      const spineColor = bookColorWheel.getHex();

      const statusRadio = document.querySelector('input[name="book-status"]:checked');
      const readingStatus = statusRadio ? statusRadio.value : 'not-set';
      const progressInput = document.getElementById('input-book-progress');
      const readingProgress = progressInput ? progressInput.value.trim() : '';

      if (!name) return;

      const currentLib = State.libraries.find(l => l.id === State.currentLibraryId);
      if (!currentLib) return;

      if (State.editingBookId) {
        // Update existing book
        const book = currentLib.books.find(b => b.id === State.editingBookId);
        if (book) {
          book.name = name;
          book.author = author;
          book.genre = genre;
          book.description = desc;
          book.sticker = sticker;
          book.spineColor = spineColor;
          book.readingStatus = readingStatus;
          book.readingProgress = readingProgress;
          Storage.saveAll();
          Toast.show('Story updated.');
        }
      } else {
        // Add new book
        const newBookId = 'book-' + Date.now();
        const variance = getSpineVariance(newBookId);
        const newBook = {
          id: newBookId,
          name: name,
          author: author,
          genre: genre,
          spineColor: spineColor,
          sticker: sticker,
          description: desc,
          readingStatus: readingStatus,
          readingProgress: readingProgress,
          dateAdded: Date.now(),
          width: variance.width,
          heightFactor: variance.heightFactor
        };
        currentLib.books.push(newBook);
        Storage.saveAll();
        // Automatically scroll to the row where the new story was placed
        const perRow = getBooksPerRow();
        const newBookRow = Math.floor((currentLib.books.length - 1) / perRow);
        const totalRows = Math.max(2, Math.ceil(currentLib.books.length / perRow));
        State.topRowIndex = Math.min(newBookRow, Math.max(0, totalRows - 2));
        Toast.show('Placed on shelf!');
      }

      document.getElementById('modal-book-form').close();
      dismissPulledOutBook();
      renderCurrentLibrary();
    });

    // 11. Move Stories & Selection Mode Handlers
    document.getElementById('fab-move-stories').addEventListener('click', () => {
      toggleSelectionMode(true);
    });

    document.getElementById('btn-cancel-selection').addEventListener('click', () => {
      toggleSelectionMode(false);
    });

    document.getElementById('btn-submit-selection').addEventListener('click', () => {
      openMoveDestinationPicker();
    });

    document.getElementById('btn-move-cancel').addEventListener('click', () => {
      document.getElementById('modal-move-picker').close();
    });

    document.getElementById('btn-move-create-lib-shortcut').addEventListener('click', () => {
      document.getElementById('modal-move-picker').close();
      toggleSelectionMode(false);
      openCreateLibraryModal();
    });

    // 12. Endless Shelf Controls (Arrows, Wheel, Touch Swipe)
    document.getElementById('btn-shelf-up').addEventListener('click', () => {
      scrollShelf(-1);
    });

    document.getElementById('btn-shelf-down').addEventListener('click', () => {
      scrollShelf(1);
    });

    const shelfUnit = document.getElementById('shelf-unit');
    let lastWheelTime = 0;
    shelfUnit.addEventListener('wheel', (e) => {
      if (document.body.dataset.view !== 'library') return;
      const lib = State.libraries.find(l => l.id === State.currentLibraryId);
      if (!lib) return;
      const rows = getShelfRows(lib.books);
      if (rows.length <= 2) return;

      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelTime < 240) return;
      lastWheelTime = now;

      if (e.deltaY > 15) {
        scrollShelf(1);
      } else if (e.deltaY < -15) {
        scrollShelf(-1);
      }
    }, { passive: false });

    let touchStartY = 0;
    shelfUnit.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    shelfUnit.addEventListener('touchend', (e) => {
      if (document.body.dataset.view !== 'library') return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      if (Math.abs(deltaY) > 35) {
        if (deltaY > 0) {
          scrollShelf(1);
        } else {
          scrollShelf(-1);
        }
      }
    }, { passive: true });

    // 13. Confirmation Modal Handlers
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
      document.getElementById('modal-confirm').close();
      State.confirmActionCallback = null;
    });

    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
      document.getElementById('modal-confirm').close();
      if (typeof State.confirmActionCallback === 'function') {
        State.confirmActionCallback();
        State.confirmActionCallback = null;
      }
    });

    // 14. Backup Export & Import Handlers
    const fileInput = document.getElementById('backup-file-input');

    const triggerImport = () => {
      closeSideDrawer();
      fileInput.click();
    };

    document.getElementById('btn-backup-export').addEventListener('click', exportLibrariesJson);
    document.getElementById('btn-drawer-export').addEventListener('click', exportLibrariesJson);
    document.getElementById('btn-backup-import').addEventListener('click', triggerImport);
    document.getElementById('btn-drawer-import').addEventListener('click', triggerImport);

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileImport(e.target.files[0]);
        e.target.value = '';
      }
    });

    document.getElementById('btn-restore-merge').addEventListener('click', () => applyRestore('merge'));
    document.getElementById('btn-restore-replace').addEventListener('click', () => applyRestore('replace'));
    document.getElementById('btn-restore-cancel').addEventListener('click', () => {
      document.getElementById('modal-restore-choice').close();
      State.pendingImportData = null;
    });

    // 15. Search Desk Input & Filter Listeners
    const searchInput = document.getElementById('input-search-query');
    if (searchInput) {
      searchInput.addEventListener('input', () => renderSearchDesk());
    }
    const searchClearBtn = document.getElementById('btn-search-clear-input');
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        renderSearchDesk();
        if (searchInput) searchInput.focus();
      });
    }

    ['filter-library-select', 'filter-genre-select', 'filter-sticker-select', 'filter-status-select', 'filter-sort-select'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderSearchDesk);
    });

    const clearFiltersBtn = document.getElementById('btn-clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', resetSearchFilters);
    }

    // 16. Commonplace Quotes Form & Controls
    const shuffleQuoteBtn = document.getElementById('btn-shuffle-evening');
    if (shuffleQuoteBtn) {
      shuffleQuoteBtn.addEventListener('click', shuffleEveningQuote);
    }

    const openQuoteBtn = document.getElementById('btn-open-quote-modal');
    if (openQuoteBtn) {
      openQuoteBtn.addEventListener('click', () => openQuoteModal());
    }

    const quoteBookSelect = document.getElementById('select-quote-book');
    const customQuoteBookGroup = document.getElementById('group-quote-custom-book');
    if (quoteBookSelect && customQuoteBookGroup) {
      quoteBookSelect.addEventListener('change', () => {
        if (quoteBookSelect.value === '__custom__') {
          customQuoteBookGroup.hidden = false;
          const authorInput = document.getElementById('input-quote-author');
          if (authorInput && !authorInput.value) authorInput.focus();
        } else {
          customQuoteBookGroup.hidden = true;
          const opt = quoteBookSelect.options[quoteBookSelect.selectedIndex];
          if (opt && opt.dataset && opt.dataset.author) {
            document.getElementById('input-quote-author').value = opt.dataset.author;
          }
        }
      });
    }

    const cancelQuoteBtn = document.getElementById('btn-cancel-quote-form');
    if (cancelQuoteBtn) {
      cancelQuoteBtn.addEventListener('click', () => document.getElementById('modal-quote-form').close());
    }
    const closeQuoteBtn = document.getElementById('btn-quote-form-close');
    if (closeQuoteBtn) {
      closeQuoteBtn.addEventListener('click', () => document.getElementById('modal-quote-form').close());
    }

    const quoteForm = document.getElementById('form-quote');
    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('input-quote-text').value.trim();
        const bookSelect = document.getElementById('select-quote-book');
        const customBookInput = document.getElementById('input-quote-custom-book');
        const page = document.getElementById('input-quote-page').value.trim();
        const author = document.getElementById('input-quote-author').value.trim();
        const notes = document.getElementById('input-quote-notes').value.trim();

        if (!text) return;

        let bookId = null;
        let bookTitle = '';

        if (bookSelect.value === '__custom__') {
          bookTitle = customBookInput ? customBookInput.value.trim() : '';
        } else if (bookSelect.value) {
          bookId = bookSelect.value;
          const opt = bookSelect.options[bookSelect.selectedIndex];
          bookTitle = opt && opt.dataset && opt.dataset.title ? opt.dataset.title : '';
        }

        if (State.editingQuoteId) {
          const q = State.quotes.find(item => item.id === State.editingQuoteId);
          if (q) {
            q.text = text;
            q.bookId = bookId;
            q.bookTitle = bookTitle;
            q.page = page;
            q.author = author;
            q.notes = notes;
            Storage.saveAll();
            Toast.show('Inscription updated in journal.');
          }
        } else {
          const newQuote = {
            id: 'quote-' + Date.now(),
            text,
            bookId,
            bookTitle,
            author,
            page,
            notes,
            dateAdded: Date.now()
          };
          State.quotes.unshift(newQuote);
          Storage.saveAll();
          Toast.show('Inscribed into your Commonplace Book! 📜');
        }

        document.getElementById('modal-quote-form').close();
        renderQuotesJournal();

        const curLib = State.libraries.find(l => l.id === State.currentLibraryId);
        const activeB = curLib ? curLib.books.find(b => b.id === State.activeBookId) : null;
        if (activeB) {
          renderBookDetailsQuotes(activeB);
        }
      });
    }

    // Tavern Lady Dialog Close Listener
    const tavernCloseBtn = document.getElementById('btn-tavern-dialog-close');
    if (tavernCloseBtn) {
      tavernCloseBtn.addEventListener('click', () => {
        document.getElementById('modal-tavern-message').close();
      });
    }

    // Keyboard Accessibility: Escape key & Arrow navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dismissPulledOutBook();
        closeSideDrawer();
        if (State.isSelectionMode) {
          toggleSelectionMode(false);
        }
      } else if (document.body.dataset.view === 'library') {
        const anyModalOpen = document.querySelector('dialog[open]');
        if (!anyModalOpen) {
          if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollShelf(1);
          } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollShelf(-1);
          }
        }
      }
    });

    // 22. Window resize handler (re-flows shelf columns between desktop & mobile)
    window.addEventListener('resize', () => {
      if (document.body.dataset.view === 'library') {
        renderCurrentLibrary();
      }
    });

    // 23. Initial view render: start on Today's Menu
    switchView('menu');
    } catch (err) {
      console.error('INITAPP ERROR:', err);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
