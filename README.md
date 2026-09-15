# Manthan Garg — Sleek Portfolio

Personalized from [ramxcodes/sleek-portfolio](https://github.com/ramxcodes/sleek-portfolio), retaining the Hanken Grotesk font, monochrome theme, compact layout, and original Oneko sprite/animation. MIT license retained.

## Develop

Requires Node.js 20+ and Bun. From the extracted folder:

```sh
bun install
bun run dev
```

Open `http://localhost:3000`. To build and serve the production export:

```sh
bun run build
bun run start
```

`bun run start` serves the generated `out/` directory on port 3000 (override with `PORT`). The exported files can also be deployed to any static host. The base portfolio requires no API keys. Spotify is optional and requires owner authorization; see [Spotify setup](docs/spotify-setup.md). `bun run lint` checks the application source.

The source ZIP contains application code, configuration, the dependency lockfiles, local fonts/images/logos, all six selectable characters, and the resume. It omits installed dependencies, build caches, Git history, and the ChatGPT-specific hosting identity. Run the commands above to reproduce the build.

## Content

The supplied pixel portrait is bundled unchanged as `public/assets/manthan-pixel.png` and framed in the compact profile header. The layout follows the supplied Sleek Portfolio reference, with a 51rem maximum reading width and responsive navigation, profile, project, and skill layouts. Experience details remain available in expandable rows. No visible template credits are shown; license and provenance notices remain in the source.

Edit `src/config/Portfolio.ts` for projects, skills, certifications, and social links. The attached September 2026 resume takes precedence over the older portfolio. DPDP and Design Thinking certifications are carried over from the user's previous portfolio; issuer details are not invented. Other profile copy is in `src/app/page.tsx`.

## Easter eggs

The Ctrl/Cmd+K search, backtick/tilde shortcut, and security lab open a keyboard-accessible native dialog. The terminal supports command history, autocomplete, portfolio commands, real SHA-256, Base64, and inert network simulations. The five-stage CTF uses only synthetic artifacts, stores progress locally, and includes reset/hints. The hash calculator supports SHA-256/384/512 and legacy SHA-1, UTF-8 text, files up to 25 MB, and copy. No input leaves the browser.

The original cat follows pointer movements, wanders on touch devices, and remains stationary with reduced-motion preferences.

## Provenance

- Source theme: ramxcodes/sleek-portfolio (MIT; see LICENSE).
- Cat: original repository's public/oneko sprite and script, credit to adryd325/oneko.js.
- Portrait: user-supplied ManthanPortfolioImage.png, preserved unchanged.
- Human sprite: built-in image generation from the supplied portrait; public/oneko/manthan-sprite.png. See docs/manthan-sprite.md for the generation specification.
- Resume: user-supplied Manthan_Garg_Resume(1).pdf.
- Project details: supplied resume and verified GitHub repository destinations.

The site contains no contact backend, analytics tracker, external font dependency, or bundled API credentials. The optional Spotify service reads server environment variables. Email opens the visitor's mail application.

## Companions and social logos

The roster has Manthan (animated human, generated from the supplied pixel portrait), Kritika (pink female cat), Savy (lilac female cat), Garisha (mint female cat), Jiya (amber female cat), and Krish (blue male cat). Cats use the original Oneko animation with local SVG color filters; the human uses a local 4×4 sprite atlas with front/back/side walk cycles, blinking, waving, and sleeping frames. These are website companions, not ChatGPT Pets.

Right-click a companion, long-press for 550ms on touch, press Shift+F10 when focused, to open the picker. Selecting a character preserves keyboard focus without freezing roaming. Pointer targets stay within the viewport, so the walking animation stops at screen edges. Exactly one character is active; the moving companion itself is the button. Old “show all” preferences migrate automatically. Drag or use arrow keys to position them; “Resume movement” resumes movement. Preferences are stored locally and degrade safely when browser storage is unavailable. Reduced-motion settings and background tabs stop movement; hover, open dialogs, and chat pause roaming. Clicking any character opens the preserved local CTF guide under that character’s name. The guide is curated, not a remote LLM.

Ctrl/Cmd+K opens the section/tool search. Use arrow keys, Enter, and Escape, or tap a result. No blog posts, listening activity, or employment history have been fabricated to fill the reference template. The optional Spotify row appears only after real listening data is available.

The header and contact section share all seven icon links. X uses the original template's icon; TryHackMe, HackerRank, and LeetCode assets come from Simple Icons (https://github.com/simple-icons/simple-icons). GitHub, LinkedIn, and email use the existing Lucide dependency. Assets are served locally and icon links retain accessible labels and tooltips.

## Technology artwork

Technology logos are bundled locally from [Devicon](https://github.com/devicons/devicon) (`icons/*/*-original.svg`). Concepts and tools without a bundled brand logo use descriptive Lucide symbols. The intro, project cards, and skill categories use logo-only rows. Hover or keyboard-focus an icon to read its name. Screen-reader labels are retained. The page follows the reference’s compact profile and clean section rows, capped at 51rem with fluid side gutters. Technology categories use two columns on desktop and tablets, and one on phones.

## Verify

Run `bun run test` for companion-state and interaction tests, and `bun run build` for the production build, lint, and type checks.
