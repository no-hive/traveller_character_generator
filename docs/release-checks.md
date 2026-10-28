# Verification — v15.1

The release is checked with `node --test` and `python3 scripts/verify-project.py`.

The suite covers all thirteen careers, saves and migrations, committed dice, event choices, minimal history, the desktop gate, missing-image placeholders and the procedural airlock. Additional regressions cover the real initial UI session, fourth-faction completion, recovery of an affected saved world review, the Nivara preset, normal Background Skills and Point Allocation, and minimum-distance scrolling.

The final-faction crash was caused by save migration inserting the legacy Aurora homeworld during creation-mode initialization. The completed-world review then preferred that incomplete legacy record to the generated world. Initialization now retains a null homeworld until one is chosen, affected generation saves discard the injected placeholder, and world review explicitly reads the generated world.

Nivara uses a fixed complete world record. Trade Classifications and Background Skill options come from the normal world engine; no extra dice or skill grants are introduced by selecting it.

Characteristic rolls retain all six mechanical results while showing only the latest detailed roll and a compact summary. Scroll tests verify that visible results remain stationary and off-screen results move only the required distance.

The project verifier checks local HTTP startup, all 52 runtime resources, JavaScript syntax and the assignments of the 101 original story illustrations. Original story images are not bundled; named placeholders are intentional.

Door colors are monochrome, and door geometry is generated locally. Fonts and the starfield are bundled. No external assets are used by the entrance.

README files and code comments are English. Internal legacy skill identifiers are retained for saved-character and rules-table compatibility.

Real-browser visual verification remains limited by the private sign-in gate and the unavailable local preview service in this environment. Runtime logic, generated markup, resources and HTTP responses are verified automatically.
