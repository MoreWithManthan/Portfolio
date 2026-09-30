# MoreWithManthan — Bold Portfolio

A separate portfolio inspired by the supplied yellow-and-cream folder-card UI references: condensed typography, thick ink outlines, hard shadows, pink and purple accents, and responsive layouts. The original portfolio is a different project and is not overwritten by this codebase.

## Run locally

No npm installation or build is required. From this folder, run:

```sh
python3 -m http.server 3000 --directory dist
```

Open http://localhost:3000. HTTPS or localhost is required for the browser SHA-256 calculator.

## Deploy to Vercel

1. Upload this folder's contents to a new GitHub repository.
2. In Vercel, select **Add New → Project**, then import that repository.
3. Choose **Other** for the framework. Leave the build and install commands empty. Set the output directory to `dist` (also supplied by `vercel.json`).
4. Deploy. There are no environment variables, API keys, or backend services required.

## Edit

- `content.json`: project descriptions, technology names, certifications, and social links.
- `create_page.py`: page structure and the personal introduction, journey, and contact copy.
- Run `python3 create_page.py` after changing those files to regenerate `dist/index.html` and `dist/content.js`.
- `dist/style.css`: colors, layout, typography, and responsive rules.
- `dist/appearance.css`: palette tokens, border and shadow options, theme controls, the interests strip, and the wider project viewer.
- `dist/themes.js`: eight color palettes, three corner shapes, three outline weights, and three shadow styles. Use the Theme button in the header. Preferences apply immediately, survive reloads on the same device, and can be reset to the original style.
- `dist/app.js`: project dialog, terminal, CTF, and SHA-256 calculator.
- `dist/neko.js`: one animated roaming companion, character picker, dragging, and a local scripted CTF guide. Right-click, long-press, or use Companion settings in the footer to switch among Manthan, Krish, Savy, Khushi, Kritika, Jiya, Sheersh, and Akshita. Click the character for help. Movement respects reduced-motion preferences and pauses while dialogs are open.
- `dist/clicks.js`: mechanical mouse and keyboard sounds, synthesized live with the Web Audio API (no audio files or network requests). A left mouse click anywhere on the page plays a microswitch snap on press and a lighter tick on release. Keyboard sounds play only while typing in an editable field (terminal, CTF answer, hash box, companion chat) and only for keys that edit text: characters, Space, Enter, Backspace and Delete, each with its own sound. Arrows, Tab, Shift, shortcuts and keys pressed outside text fields are silent. Use the **Click sounds** button in the footer to turn all of it on or off; the choice is remembered on the visitor's device. Sound starts after the visitor's first interaction, as browsers require.
- `dist/assets/`: supplied portrait and résumé PDF.
- `dist/fonts/`: self-hosted fonts and their licenses.

The generated files in `dist` are committed and immediately deployable. GitHub and social links point to Manthan's existing profiles. No analytics or remote font requests are included. The CTF is an educational client-side puzzle; its answers are intentionally discoverable. Terminal commands are simulated and never execute shell code. The hash calculator uses the browser Web Crypto API.

Skills and social profiles use icon tiles with accessible names and hover/focus labels. Concepts without a brand mark use Lucide symbols. Companion selection and pause settings are stored only on the visitor's device, separately from the original portfolio.

Project details use a wider two-column layout on desktop with the header and previous/next controls always visible. On small or short screens, only the content area scrolls. Left and right arrow keys cycle through projects while the viewer is open.

Switching companions updates the chat title and greeting immediately. A different companion starts a fresh local conversation; reopening the same companion preserves that conversation until reload.

Easter eggs: type `secrets`, `neofetch`, `sudo`, `meow`, or `party` in the terminal; tap the portrait's Hello, world! sticker; or enter ↑ ↑ ↓ ↓ ← → ← → B A outside text fields and dialogs. The secret color palette can be dismissed with Back to my theme. These surprises have no flashing or external requests.

Use the supplied personal assets only with their owner's permission. See `ASSET-NOTICES.md` for third-party asset licenses.

## Project CTFs

The playground includes 12 challenges: three original warm-ups and three each for SENTRA CORE V2 (signature triage, hashing, telemetry), CrashAgent-AI (canary leaks, rating ceilings, prompt-injection boundaries), and NervoStep-ML (subject leakage, tensor shapes, attribution). All project scenarios are fictional learning exercises. Choose any challenge from the grouped selector or enter from a project’s “Try project CTF” button. Captures show explanations, track session progress, and support replay. Companion hints follow the selected challenge. No requests are sent to the real projects.

## Human companions

All eight choices are human companions; only one appears at a time. Each has directional walking frames, idle expressions, a portrait, and a short description. The old Garisha selection migrates to Akshita.

Edit `dist/companions.js` for names, descriptions, portraits, and optional comments. Set `comment` to a real comment supplied or approved by that person; leave it `null` to hide the quote. No testimonials have been invented. The `frames` rectangles in that file center each pose and align feet without modifying the original artwork. Sprite sheets use four columns and four rows: down, right (mirrored for left), up, and idle expressions.

CrashAgent-AI portfolio copy is based on the user-supplied CrashCodeAI project specification. The linked repository is being populated separately; planned production integrations are not described as complete. NeuroSole remains listed as a published-patent milestone, separately from featured projects.
