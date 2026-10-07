# Implementation Plan: Cozy Library Book Keeper (Personal Website)

Build a Dim & Cozy Dark-Academia Book Keeper single-page web application using pure HTML, CSS, and vanilla JavaScript. The application will be 100% free, require zero backend or external assets, store data in `localStorage`, and be ready for immediate deployment to GitHub Pages.

## User Review Required

> [!IMPORTANT]
> **Starter Experience**: For first-time visitors who open the site with an empty `localStorage`, we will offer a gentle 1-click **"Load Sample Library (The Midnight Study)"** button on *Today's Menu*, or allow starting completely fresh with **"Create New Library"**. This allows immediate exploration of the shelf aesthetics, stickers, and soundscapes without having to manually type multiple books first.
> 
> **Project Directory**: The project will be created in `C:\Users\Administrator\.gemini\antigravity\scratch\cozy-library`. Once completed, you can open this folder in your IDE or push it to your GitHub repository.

## Architecture & Design Decisions

```
cozy-library/
├── index.html       # Single-page app with semantic structure: Today's Menu, Shelf View, Modals, SVGs
├── style.css        # Cozy dark-academia aesthetics, CSS variables, wood textures, responsive rules, animations
├── script.js        # State store, Shelf renderer, Spine text auto-fit, Color Wheel, Web Audio engine, Backups
└── README.md        # Complete documentation with step-by-step GitHub Pages deployment and Git guide
```

### 1. Visual Theme & Dark-Academia Ambience
- **Color Palette**: Dim espresso and charcoal backgrounds (`#141110`, `#1a1614`, `#221c18`), warm amber lamp light (`rgba(245, 180, 100, 0.15)`), antique parchment accents (`#d9cbba`, `#f3ece3`).
- **Typography** (Google Fonts with robust system fallbacks):
  - `MonteCarlo`: Exclusively for the Library Name on the central name band.
  - `Cinzel Decorative`: For headers ("Today's Menu", pop-up headers, section titles).
  - `Cormorant Garamond` (Semi-bold / 600): For book spine titles, form controls, details, body text.
- **Shelf Woods**:
  - *Café Noir*: Coffee-brown wood (`#3B2416` base, `#533420` highlight)
  - *Dark Olive*: Deep olive-green wood (`#2F3B22` base, `#455633` highlight)
  - *Strawberry Coral*: Warm coral-red wood (`#8A3532` base, `#A8433F` highlight)
- **Ambient Touches**:
  - Breathing lamp-glow radial vignette in the top-right corner.
  - 20 slow-drifting CSS dust motes catching the lamp rays.
  - Cute steaming teacup / flickering candle inline SVG shelf ornament.
  - Room dimmer slider ("Room light") adjusting ambient opacity while preserving high-contrast text legibility.
  - `prefers-reduced-motion` compliance across all animations.

### 2. Screens & Core Flow
- **Screen 1: Today's Menu**:
  - Centered cafe-style menu board with decorative wavy/scalloped border drawn via pure CSS/SVG.
  - Cinzel Decorative title: "Today's Menu".
  - "Create New Library" prominent card.
  - List of user's saved libraries with book count, edit, and delete (with confirmation dialog).
  - Dimmer control & Backup ("Save my libraries" / "Load my libraries") buttons.
- **Screen 2: Inside a Library**:
  - Upper shelf row, center Name Band, Lower shelf row. Dynamic additional shelf rows automatically added if books exceed capacity.
  - Thin vertical wooden dividers framing compartments.
  - **Name Band**: ~240–280px tall on desktop (120–140px on mobile), MonteCarlo font in user-chosen color, subtle top-left to bottom-right wood gradient, 4-side perimeter frame.
  - **Books**: Upright spines with deterministic slight height and thickness variance based on book ID.
  - **Spine Text**: First 2–3 words (2 if words are long, 3 if short), never breaking words in half, automatic light/dark contrast computation against the spine background, vertical spine layout.
  - **Book Pull-Out Animation**: Tapping a book smoothly pulls it forward/upward (~12px with soft shadow) before opening the pop-up, returning when dismissed.
  - **Sticker Slots**: Directly below each book spine, holds cute inline SVG sticker remarks:
    - 🤍 White Heart (Kawaii puffy sticker with soft outline)
    - ❌ Red Cross (Cute rounded crimson stamp)
    - 😐 Neutral Face (Minimalist cozy expression)
  - **Side Menu (Slide-out panel)**:
    - Return to Today's Menu.
    - Quick switch between libraries.
    - Edit library metadata (Name, Wood, Name color).
    - Delete library (with confirmation).
    - Room light dimmer.
    - JSON Backup & Restore.
  - **Add Stories +**: Fixed floating action button at bottom right opening the Book Creator modal.

### 3. Pop-ups & Modal System
- **Quick Book Pop-up** (opens upon tapping a book):
  - Displays full title.
  - "Change Name" quick inline edit.
  - "Details" button to open the deep inspection modal.
- **"More About" Pop-up**:
  - Full title, Author, Genre, Description.
  - Sticker badge displayed beside the details.
  - "Edit Book" action (opens editor).
  - "Delete Book" action (with confirmation dialog).
- **Create / Edit Library Modal**:
  - Text input for library name.
  - Clickable wood swatch cards (Café Noir, Dark Olive, Strawberry Coral).
  - Custom Canvas/HSV Colour Wheel picker + Lightness slider + Hex input + native color picker fallback.
- **Create / Edit Book Modal**:
  - Full title, Author, Genre, Multi-line description.
  - Book spine colour wheel picker with presets.
  - Sticker remark selector (Heart, Cross, Neutral, None).

### 4. Audio Engine (Web Audio API - 100% Free & Offline)
- Synthesizes cozy background noise procedurally without any external audio files:
  - **Soft Rain**: Pink/white noise buffer passed through a low-pass BiquadFilter (around 600–900 Hz) with subtle stereo panning and gentle envelope.
  - **Fireplace Crackle**: Low-frequency rumble (low-pass filter around 180 Hz) layered with random sporadic high-frequency burst impulses ("snaps" and "pops").
- Muted by default per modern browser autoplay policies.
- Volume slider, mute toggle, and tab visibility listener (`document.visibilityState`) to pause audio when tab is backgrounded.

### 5. Data Persistence & Backup System
- Stored under `localStorage.getItem('cozy_libraries_data')`.
- Safe schema validation and fallback on corrupt storage.
- **Export**: Downloads a clean `.json` file (`cozy-libraries-backup.json`).
- **Import**: Validates JSON structure, confirms action with user, supports both **Replace** or **Merge** (avoiding duplicate IDs).

---

## Proposed Changes

We will create the complete project inside `C:\Users\Administrator\.gemini\antigravity\scratch\cozy-library`.

#### [NEW] `index.html`
- Contains semantic layout:
  - Ambient layers (lamp glow, floating dust specks container).
  - "Today's Menu" screen view.
  - "Library Bookshelf" screen view with upper shelf, name band, lower shelf, overflow container, and decorative SVG elements (steaming cup / candle).
  - Audio control dock (speaker icon, sound selector, volume slider).
  - Side navigation drawer.
  - All native `<dialog>` modals with ARIA attributes and keyboard trap handling.
  - Reusable inline SVG definitions (`#svg-heart`, `#svg-cross`, `#svg-neutral`, `#svg-menu-board`, `#svg-cup`).

#### [NEW] `style.css`
- Dark-academia design system using CSS custom properties (`--bg-primary`, `--wood-base`, `--wood-light`, `--name-color`, `--dimmer-level`, etc.).
- Custom scalloped/wavy border styles for Today's Menu board.
- Realistic CSS wood grain & gradient treatments for shelf planks and name band.
- Book spine vertical layout with text truncation logic and contrasting text colors.
- Smooth animations: dust motes floating, lamp glow breathing, book pull-out slide, drawer slide-in, modal scale-up.
- Responsive breakpoints for laptop/desktop and mobile phones (narrow viewport layout, minimum 44px tap targets).
- Media queries for `prefers-reduced-motion: reduce`.

#### [NEW] `script.js`
- **Data Management**: Model definitions for `Library` and `Book`, localStorage CRUD, JSON schema validator, import/export logic.
- **Shelf Renderer**: Dynamic grid construction, vertical dividers, seed-based spine height/thickness variance, word wrapping & font size scaling for 2–3 words.
- **Colour Wheel Component**: Reusable canvas-based HSV color wheel with draggable reticle, lightness track, color presets, and sync with fallback `<input type="color">`.
- **Audio Synthesizer**: Procedural noise generation using Web Audio API nodes (`AudioContext`, `BiquadFilterNode`, `GainNode`, buffer source), state management, and smooth gain ramping.
- **UI Controller**: Screen transitions (Today's Menu <-> Bookshelf), modal dialog management, book pull-out selection state, room dimmer synchronization.

#### [NEW] `README.md`
- Project overview and feature highlights.
- Clear step-by-step instructions for hosting on GitHub Pages for free.
- Git setup commands (`git init`, `git add .`, `git commit`, `git remote add`, `git push`).
- Guide on how the Web Audio engine, localStorage persistence, and color wheels work.

---

## Verification Plan

### Automated / Browser Verification
1. Open `index.html` in a local browser.
2. Verify visual appearance:
   - Today's Menu cafe board styling and typography.
   - Creating a library with each wood type (Café Noir, Dark Olive, Strawberry Coral).
   - Adding books with different titles, spine colours, and sticker remarks.
   - Testing 2-word vs 3-word title formatting on the spines.
   - Testing book pull-out animation on click.
   - Quick pop-up -> Details modal -> Edit -> Delete flows.
   - Side menu drawer navigation.
   - Audio generator (Soft Rain & Fireplace) toggling and volume control.
   - Room light dimmer slider adjusting overall mood.
   - Backup JSON export and import (test both replace and merge modes).
3. Test responsiveness at Desktop (1440px), Tablet (768px), and Mobile (375px) screen widths.
4. Verify complete keyboard accessibility (`Escape` closes modals, tab navigation).
