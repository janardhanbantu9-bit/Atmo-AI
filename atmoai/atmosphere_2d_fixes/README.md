# AtmoSphere 2D/3D + Groq fixes

Target branch: `2d-map-integration`

These fixes are designed to sit on top of the branch you already committed.

## What this patch changes

1. **3D globe interaction**
   - Stops the camera transition from fighting OrbitControls.
   - A pointer interaction immediately hands camera control to OrbitControls.
   - Location focusing can animate before manual interaction takes over.
   - Keeps Maps 3D interactive while Home/AI/Overview remain cinematic.

2. **2D Leaflet loading**
   - Keeps more tiles buffered.
   - Avoids excessive tile refreshes while zooming.
   - Disables tile fade animation to reduce the visible block-by-block loading effect.
   - Calls `invalidateSize()` when the 2D map is shown.

3. **Groq named-location tool calling**
   - `get_location` uses Open-Meteo geocoding.
   - `get_weather` uses Open-Meteo weather data.
   - Groq can now call those tools when the user asks about a named place such as Saudi Arabia.
   - The selected Maps location is automatically supplied as context for "here/current location" style questions.
   - The frontend already passes `domain` and `location`; the patch preserves that path.

## Apply

From the **`atmoai` project root**:

```bash
node ../atmosphere_2d_fixes/apply-fixes.mjs
```

If you unzip this folder somewhere else, run the script from the directory containing `atmoai`, or edit `PROJECT_ROOT` in the script.

The script makes `.bak` backups before modifying files and stops if an expected source pattern is missing.

After applying:

```bash
git diff
```

Then test the app before committing.

## Important

This is a patch for the already-committed `2d-map-integration` branch. It does not replace your whole project and it does not touch your API key.

Groq tool calling is implemented as local function/tool calling: the model requests a tool, your backend executes it, then the tool result is sent back to Groq for the final answer.
