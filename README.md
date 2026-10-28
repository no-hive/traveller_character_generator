# traveller-character-generator — v15.1

<img width="1672" height="941" alt="t23" src="https://github.com/user-attachments/assets/ef1def72-84cf-4182-906b-b1584ee098ef" />

### A browser-based character generator for Mongoose Traveller (2008), featuring step-by-step lifepath creation and a retrofuturistic interface. It covers thirteen careers, homeworld generation, psionics, service history, Benefits and starting equipment. Local use requires no build step, npm installation or external service.

## Fan project and non-commercial use

This is an unofficial, fan-made project created solely for personal, non-commercial use. We do not sell or monetize this project, and commercial use of this project is not permitted.

Traveller and the Mongoose Traveller rules and related copyrighted material belong to Mongoose Publishing and their respective rights holders. All rights to those materials and trademarks remain with their owners. We claim no ownership of the original game, its rules, setting, artwork or trademarks.

This project is not affiliated with, endorsed by, sponsored by or approved by Mongoose Publishing. It is a fan-created game aid, not a replacement for the official rulebooks. Please support the game by purchasing the official publications.

This notice does not grant any rights to third-party material. Bundled fonts remain subject to their separate licenses in `docs/font-licenses`. For the publisher's terms, see [Mongoose Publishing's Traveller licensing page](https://www.mongoosepublishing.com/pages/traveller-licensing).

## Run locally

1. Extract the complete `traveller-local` folder.
2. If available, place the 101 original story illustrations in `images`, beside `index.html` and `dist`. Preserve their filenames and extensions; `images/README.txt` lists them all.
3. Start the local server:

```sh
python3 start-local.py
```

On Windows, use `py start-local.py`. Open **http://localhost:8000** in a desktop browser. Press Ctrl+C to stop. If the port is busy, run `python3 start-local.py --port 8001` and open http://localhost:8001. The server binds only to your computer and uses Python's standard library.

You can also open `index.html` or `dist/index.html` directly. A stable local-server address is recommended for browser saves.

Original story illustrations are not included. Missing files display named placeholders. Keep your existing `images` folder when updating. Files t12, t36, t43 and t68 are not required. Fonts and the generated SVG starfield are included.

## Homeworld creation

Generate a world using Standard Traveller, Space Opera or Hard Science rules, or select **Use default homeworld · Nivara** before starting. **Skip world generation · Nivara** is also available during generation and review.

Nivara is a huge, frozen arctic planet with tens of billions of people living in connected, heated megacities. Its fixed profile is **AA73A86-C**: Size 10, Atmosphere 7, Hydrographics 3, Population 10, Government 8, Law 6, Starport A and Tech Level 12. Trade Classifications and Background Skill options use the same rules as generated worlds. Selecting the preset consumes no dice and grants no extra skills.

Creation-method, Solo Creation and Iron Man settings still apply. A homeworld cannot be replaced after character creation begins. World-creation saves containing an old Aurora placeholder now resume using the actual generated world, including after the final faction-strength roll.

## Events and history

Events combine their situation, action choices, dice and result. Action cards show actual success probabilities and consequences before selection; formulas are expandable. The selected card contains its action button. Rolling commits the approach, and restoring a save keeps the same result.

Collapsed history entries show only titles. Click a title for the story, chosen action, dice and character changes. New entries start collapsed.

The interface keeps the viewport still when new content is already visible. An off-screen result is revealed with only the necessary scroll distance. Characteristic rolls use a compact six-result summary instead of a growing list of dice blocks.

## Desktop appearance

Desktop browsers require a window at least 1024 px wide. Phones, tablets and narrower windows show **Desktop version only**. Enlarging a desktop window restores the interface without resetting its save.

The retro terminal has a monochrome starfield, static screen lines, hard borders and mechanical-looking buttons. Navigation has a solid black background. The character panel is lighter blue with dark blue text. The local SVG starfield does not move or flicker.

IBM Plex Mono is used for text, headings, controls and numbers. IBM Plex Sans and Rajdhani are also bundled for future variants. Fonts are local in `dist/fonts`; OFL licenses are in `docs/font-licenses`.

Illustrations appear on the left and descriptions on the right. Actions and results occupy the full width below. Missing artwork keeps a named placeholder in its image column. Expanded history uses the same layout.

## Airlock entrance

Each desktop page load starts behind closed spacecraft doors. Press **Enter your Travel** to unlock them. Panels, ribs, bolts and locks are generated by local SVG code; the entrance uses no external textures or assets.

The application cannot receive pointer or keyboard input until the doors finish opening. Repeated clicks cannot start multiple animations. Reduced-motion preferences bypass the animation. The mobile notice takes priority over the airlock.

## Navigation and saves

- **Restart** creates a new character after confirmation and backs up the previous save.
- **Rules** opens the rules overview in the top navigation.
- **About Project** describes the application and supplementary rules.
- **Gallery** lists all 101 story illustrations in their original numerical order with their assignments.

Life Events, E7, Connections, Campaign Packs and Point Allocation intentionally have no artwork. There is no character portrait. Story illustrations use a 16:9 aspect ratio.

Progress is stored in browser localStorage. Use the same browser and address. Saves do not transfer automatically between the published site, `file://`, localhost or different ports. Private browsing and clearing browser data can remove saves. Supported older saves are migrated on loading.

## Rules

The generator is based on Mongoose Traveller (2008). Eight supplementary career events are original project rules: on their listed 2d6 results, an extra d6 selects the supplementary event on 1–2 or the original on 3–6. See `docs/additional-events.md` for details. Life Events and the original E2, E7 and E12 results are unchanged by that extension.

Every original illustration has an assignment; see `docs/image-assignments.md` or Gallery. General aging and transition screens do not require separate illustrations.

Ship purchases and the use of psionics during adventures are outside the generator's scope. Exact line-by-line compliance with the printed rulebook has not been independently certified.

## Checks

Node.js is required for tests; no npm packages need to be installed. Run from the project folder:

```sh
node --test
python3 scripts/verify-project.py
```

To also check all original story illustrations and their HTTP loading:

```sh
python3 scripts/verify-project.py --images
```

Validation notes and limitations are in `docs/release-checks.md`. The verification script checks local runtime resources, JavaScript syntax, image assignments and a real local HTTP startup.

## Project files

- `dist/`: active interface, engine, rules tables, fonts and generated starfield. These are the working sources; no build is required.
- `images/`: original story illustrations, supplied separately.
- `tests/`: automated regression tests.
- `scripts/verify-project.py`: project and local HTTP verification.
- `docs/`: architecture, artwork assignments, supplementary events and validation notes.
- `start-local.py`: server using Python's standard library.
- `VERSION`: project release number, independent of the internal save-format version.

The distribution excludes user saves, browser profiles and development dependencies. Code comments and README files are written in English. Legacy internal skill identifiers remain unchanged to preserve compatibility with rules tables and saved characters.
