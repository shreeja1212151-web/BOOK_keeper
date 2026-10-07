# ☕ Cozy Library Book Keeper

> A dim, warm, dark-academia personal book recorder and cozy bookshelf website. Built with pure HTML, CSS, and vanilla JavaScript — completely free, offline-ready, and zero-cost to host on GitHub Pages.

---

## 📖 Overview

**Cozy Library Book Keeper** is a personal reading haven. You can create multiple virtual reading rooms, each featuring its own wooden bookshelf, personalized name band, and book collection. Books stand upright as custom-colored spines with slight height and thickness variance, cute sticker remarks, and interactive pull-out animations.

Anyone you share your link with receives their own private set of libraries, safely stored in their browser's local memory (`localStorage`).

---

## ✨ Features

### 1. Ambience & Dark-Academia Aesthetics
- **Cozy Mood**: Dim espresso and charcoal palette with warm amber lamp-glow vignette and subtle wood grain textures.
- **Atmospheric Touches**:
  - Soft breathing corner lamp glow.
  - Gentle floating dust motes drifting through the light.
  - Steaming teacup ornament resting upon the shelf band ledge.
  - **Room Light Dimmer**: A cozy candle slider allowing you to adjust the room darkness to your liking.
- **Handcrafted Google Fonts**:
  - `MonteCarlo`: Exclusively for the grand library name on the central band.
  - `Cinzel Decorative`: For headers ("Today's Menu", dialogs, sections).
  - `Cormorant Garamond`: Semi-bold serif for readable spines, details, and buttons.

### 2. Screens & User Flow
- **Today's Menu (Cafe Menu Board)**:
  - Centered menu card with an ornate scalloped/wavy border.
  - Quick action to **Create New Library**.
  - Overview of all your saved reading rooms with book counts.
  - 1-click **"Load Sample Library"** (*The Midnight Study*) for instant demonstration.
  - Safe deletion with confirmation dialogs.
- **Inside the Bookshelf & Endless Shelves**:
  - Upper shelf, dramatic central **Name Band**, and Lower shelf enclosed in a fixed wooden frame.
  - **Endless Windowed Scrolling**: Bookshelf holds unlimited books across rows (7 books/row on desktop, 4 on mobile).
  - **Smooth Step Transitions (350ms)**: Rows slide gracefully one step at a time without breaking the stationary name band or frame.
  - **Multi-Input Controls**: Navigate rows via mouse wheel, mobile touch swipe, shelf frame arrow buttons (`▲` / `▼`), or keyboard arrows/Page keys.
  - **Shelf Indicator**: Real-time counter badge (e.g. `Shelves 1–2 of 5`).
  - **Auto-Scroll Landing**: Newly added stories automatically slide the shelf directly to where the new book lands.
  - **3 Muted Wood Finishes**:
    - *Café Noir* (Rich coffee-brown wood)
    - *Dark Olive* (Deep olive-green wood)
    - *Strawberry Coral* (Warm coral-red wood)
- **Wood-Tinted Doodle Wallpaper**:
  - Handcrafted vector line-art wallpaper featuring cats curled up, steaming teapots, quills, celestial bodies, flowers, and books.
  - Floats strictly in the cozy room space *outside* the wooden shelf and menu card.
  - **Dynamic Wood Tinting**: The doodle strokes smoothly cross-fade (500ms) to match the active library's wood tone (*#D3A365* for Café Noir, *#97B07F* for Dark Olive, and *#E58F86* for Strawberry Coral).
- **Extra Dramatic Central Band Banner**:
  - Grand `MonteCarlo` cursive calligraphy title (`clamp(96px, 9vw, 128px)`).
  - Soft breathing golden halo aura, twinkling starlight sparkles (`✦ ✧ ✦`), and golden filigree flourishes.

### 3. Books & Interactive Pull-Out Animation
- **Realistic Spines**: Deterministic thickness (32–48px) and height variance saved per book ID.
- **Smart Spine Titles**: Displays the first 2 to 3 words cleanly, never breaking a word in half, with automatic light/dark contrast ink calculation.
- **Pull-Out Physics**: Tapping any book smoothly glides it upward and forward with a soft shadow before opening the pop-up.
- **Two-Stage Pop-ups**:
  - **Quick Book Pop-up**: Shows full title, author, "Move", "Change Name", and "Details".
  - **"More About" Pop-up**: Displays full notes, genre, author, cute sticker badge, with "Edit Story" and "Delete Story" options.

### 4. Move Stories (Batch & Single)
- **Batch Selection Mode**: Tap the **"Move Stories ⇄"** floating action button to enter selection mode.
- **Visual Feedback**: Books highlight with a warm golden frame, soft glow, and a `✓` checkmark badge.
- **Counter Banner**: A floating bottom banner tracks selected stories, with options to "Select All" or "Cancel".
- **Destination Library Picker**: Modal showing each library's custom wood swatch and book count for seamless story transfers.
- **Single-Book Move**: Quick 1-click move button directly inside the quick book pop-up.

### 5. Cute Sticker Remarks (Book Ratings)
Inline SVG stickers designed with soft outlines and cute puffy shadows:
- 🤍 **Loved** (White Heart with highlight shine)
- ❌ **Dropped** (Cute rounded crimson cross)
- 😐 **Neutral** (Warm honey face with soft blush)
- Resting in designated slots directly below each book on the shelf.

### 6. Custom Canvas Colour Wheels
- Zero external libraries or heavy dependencies.
- Interactive HSV/HSL colour wheels with draggable reticle, lightness slider, hex code input, and native fallback picker.
- Used for both the **Library Name Colour** and **Book Spine Colours**.

### 7. Procedural Ambient Audio (Web Audio API)
- 100% synthesized in the browser without any audio files or network requests:
  - 🌧️ **Soft Rain**: Filtered pink noise with a low-pass filter (~750Hz).
  - 🔥 **Fireplace Crackle**: Warm low rumble with sporadic gentle crackle pops.
- Muted by default to follow browser policies.
- Includes volume slider, state memory, and auto-pause when the browser tab is hidden.

### 8. Backup & Restore (Save & Load Libraries)
- **Save my libraries**: Downloads a clean `.json` file (`cozy-libraries-backup.json`) containing all reading rooms and books.
- **Load my libraries**: Restores any backup file with schema validation and prompts you to either **Merge** or **Replace** your data.

---

## 📁 Project Structure

```
cozy-library/
├── index.html       # Semantic single-page application structure & inline SVG stickers
├── style.css        # Dark-academia theme, wood textures, responsive rules, animations
├── script.js        # State, procedural audio engine, canvas color wheel, shelf renderer
└── README.md        # Documentation and GitHub Pages publishing instructions
```

---

## 🚀 How to Publish for Free on GitHub Pages

Publishing this website on GitHub Pages takes less than 2 minutes and is **100% free forever**.

### Step 1: Initialize Git and Commit Your Files
Open your terminal (or PowerShell / Command Prompt) and navigate to the project directory:

```bash
cd path/to/cozy-library
git init
git add .
git commit -m "Initial commit: Cozy Library Book Keeper"
```

### Step 2: Create a New Repository on GitHub
1. Log in to your account at [GitHub.com](https://github.com).
2. Click the **+** (New repository) button in the upper right.
3. Repository name: `cozy-library` (or any name you prefer).
4. Set it to **Public** (required for free GitHub Pages).
5. Do **not** check "Initialize with a README" (since we already have one).
6. Click **Create repository**.

### Step 3: Push Your Code to GitHub
Copy the commands shown on GitHub under "push an existing repository from the command line" and run them:

```bash
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cozy-library.git
git push -u origin main
```
*(Replace `YOUR-USERNAME` with your actual GitHub username.)*

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub.
2. Click the **Settings** tab (the gear icon near the top).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Choose `main` and folder `/ (root)`.
   - Click **Save**.
5. Wait about 30 to 60 seconds. Refresh the page, and GitHub will provide your live URL:
   ```
   https://YOUR-USERNAME.github.io/cozy-library/
   ```

---

## 🔗 Sharing Your Link

You can share your live GitHub Pages link with friends, book clubs, or on social media!
- When anyone clicks your link, the website loads in their own browser.
- Their data is stored locally in their browser's `localStorage` — completely private to them.
- They can also use the **Save my libraries** button to download a JSON file and send you their bookshelf to load into yours!

---

## ⌨️ Accessibility & Controls

- **Keyboard Navigation**: Press <kbd>Escape</kbd> at any time to close open pop-ups, dismiss pulled-out books, or exit the side drawer.
- **Touch Friendly**: All tap targets and buttons are sized at 44px+ for phone screens.
- **Reduced Motion**: Automatically respects visitors with `prefers-reduced-motion` enabled by disabling ambient particles and transitions.

---

## 📜 License & Freedom

100% Free and Open Source. Created for cozy book lovers, students, and readers everywhere. Feel free to customize colors, add more stickers, or expand your personal library!
