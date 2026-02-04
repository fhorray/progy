---
description: Reset a module to practice it again (archives old work)
---

# /redo Command

Resets a specific module so the user can do it again from scratch. Old solutions are archived.

## Steps for AI

1. **Identify Module**
   - Parse the module number/name from input (e.g. "04" or "ownership").
   - Locate the module folder in `src/exercises/`.

2. **Archive Old Work**
   - Generate timestamp (YYYYMMDD_HHMM).
   - Create archive folder: `src/archive/<timestamp>_<module>/`.
   - **Move** all `.rs` files from `src/exercises/<module>/` to the archive folder.
   - Do NOT move the `README.md`.

3. **Reset Progress**
   - Read `PROGRESS.md`.
   - Find lines related to this module and uncheck them (change `[x]` to `[ ]`).
   - If entire module checkbox exists, uncheck it too.

4. **Notify**
   - "Module **<module>** has been reset!"
   - "Your old solutions are saved in `src/archive/`."
   - "Run `/next` to start the first exercise of this module again."
