import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const files = {
  globe: path.join(PROJECT_ROOT, "Frtnend", "src", "globe", "globe.js"),
  components: path.join(PROJECT_ROOT, "Frtnend", "src", "components", "components.jsx"),
  groq: path.join(PROJECT_ROOT, "backend", "services", "groqServices.js"),
};

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function backup(file) {
  const backupPath = `${file}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(file, backupPath);
  }
}

function replaceExact(file, source, oldText, newText, label) {
  if (!source.includes(oldText)) {
    throw new Error(`Could not find expected pattern in ${label}. No change was made to that file.`);
  }
  return source.replace(oldText, newText);
}

/* ---------- Groq local tool calling ---------- */

backup(files.groq);
fs.writeFileSync(files.groq, `import OpenAI from "openai";
import { getLocation } from "../tools/getLocation.js";
import { getWeather } from "../tools/getWeather.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = "openai/gpt-oss-120b";

const tools = [
  {
    type: "function",
    function: {
      name: "get_location",
      description:
        "Find coordinates and basic location information for a named place. Use this when the user explicitly asks about a place that is not already the selected app location.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Place name, city, country, region, or other geographic name.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "Get current and forecast weather data for a latitude and longitude using Open-Meteo.",
      parameters: {
        type: "object",
        properties: {
          latitude: {
            type: "number",
            description: "Latitude in decimal degrees.",
          },
          longitude: {
            type: "number",
            description: "Longitude in decimal degrees.",
          },
        },
        required: ["latitude", "longitude"],
        additionalProperties: false,
      },
    },
  },
];

function cleanLocation(location) {
  if (!location || typeof location !== "object") return null;

  const latitude = Number(location.lat);
  const longitude = Number(location.lon);

  return {
    name: location.name ?? null,
    city: location.city ?? null,
    state: location.state ?? null,
    country: location.country ?? null,
    displayName: location.displayName ?? null,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}

function compactWeather(weather) {
  if (!weather) return null;

  return {
    latitude: weather.latitude ?? null,
    longitude: weather.longitude ?? null,
    timezone: weather.timezone ?? null,
    current: weather.current
      ? {
          time: weather.current.time ?? null,
          temperature_2m: weather.current.temperature_2m ?? null,
          apparent_temperature: weather.current.apparent_temperature ?? null,
          relative_humidity_2m: weather.current.relative_humidity_2m ?? null,
          precipitation: weather.current.precipitation ?? null,
          weather_code: weather.current.weather_code ?? null,
          cloud_cover: weather.current.cloud_cover ?? null,
          wind_speed_10m: weather.current.wind_speed_10m ?? null,
          wind_direction_10m: weather.current.wind_direction_10m ?? null,
          wind_gusts_10m: weather.current.wind_gusts_10m ?? null,
        }
      : null,
    daily: weather.daily
      ? {
          time: Array.isArray(weather.daily.time)
            ? weather.daily.time.slice(0, 4)
            : [],
          temperature_2m_max: Array.isArray(weather.daily.temperature_2m_max)
            ? weather.daily.temperature_2m_max.slice(0, 4)
            : [],
          temperature_2m_min: Array.isArray(weather.daily.temperature_2m_min)
            ? weather.daily.temperature_2m_min.slice(0, 4)
            : [],
          precipitation_sum: Array.isArray(weather.daily.precipitation_sum)
            ? weather.daily.precipitation_sum.slice(0, 4)
            : [],
          precipitation_probability_max: Array.isArray(
            weather.daily.precipitation_probability_max
          )
            ? weather.daily.precipitation_probability_max.slice(0, 4)
            : [],
          weather_code: Array.isArray(weather.daily.weather_code)
            ? weather.daily.weather_code.slice(0, 4)
            : [],
        }
      : null,
  };
}

async function executeTool(toolCall) {
  const name = toolCall.function?.name;
  let args = {};

  try {
    args = JSON.parse(toolCall.function?.arguments || "{}");
  } catch {
    return { error: "Tool arguments were invalid JSON." };
  }

  try {
    if (name === "get_location") {
      return await getLocation({ query: String(args.query || "").trim() });
    }

    if (name === "get_weather") {
      const latitude = Number(args.latitude);
      const longitude = Number(args.longitude);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return { error: "Invalid latitude or longitude." };
      }

      return compactWeather(await getWeather({ latitude, longitude }));
    }

    return { error: \`Unknown tool: \${name}\` };
  } catch (error) {
    console.error(\`Groq tool \${name} failed:\`, error);
    return {
      error:
        error instanceof Error
          ? error.message
          : \`Tool \${name} failed.\`,
    };
  }
}

export async function askGroq(
  userMessage,
  { domain = "research", location = null } = {}
) {
  const selectedLocation = cleanLocation(location);

  let selectedWeather = null;

  if (
    selectedLocation &&
    Number.isFinite(selectedLocation.latitude) &&
    Number.isFinite(selectedLocation.longitude)
  ) {
    try {
      selectedWeather = compactWeather(
        await getWeather({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        })
      );
    } catch (error) {
      console.warn("Unable to fetch selected-location weather:", error);
    }
  }

  const systemPrompt = [
    "You are AtmoSphere Intelligence, a concise weather and climate assistant.",
    "Answer directly in 1-4 short sentences unless a slightly longer answer is necessary.",
    "Do not restate the user's question.",
    "Do not use generic introductions, filler, or unnecessary conclusions.",
    "Use tools whenever live or location-specific weather information is required.",
    "If the user explicitly names a place that differs from the selected app location, call get_location first.",
    "After finding a place, call get_weather when the question requires weather information.",
    "If the user says here, this location, current location, or otherwise refers to the app's selected location, use SELECTED LOCATION instead of geocoding a new place.",
    "Never claim that you lack data for a named place before trying get_location.",
    "Never invent weather values.",
    \`The active app domain/context is: \${domain}.\`,
    "",
    \`SELECTED LOCATION:\\n\${JSON.stringify(selectedLocation)}\`,
    "",
    \`SELECTED LOCATION WEATHER:\\n\${JSON.stringify(selectedWeather)}\`,
  ].join("\\n");

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const maxIterations = 4;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.2,
      max_completion_tokens: 500,
    });

    const assistantMessage = response.choices?.[0]?.message;

    if (!assistantMessage) {
      throw new Error("Groq returned an empty response.");
    }

    if (!assistantMessage.tool_calls?.length) {
      return assistantMessage.content || "I couldn't generate a response.";
    }

    messages.push(assistantMessage);

    for (const toolCall of assistantMessage.tool_calls) {
      const result = await executeTool(toolCall);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error("Groq tool-call loop exceeded its safety limit.");
}
`, "utf8");

/* ---------- Globe interaction ---------- */

backup(files.globe);
let globe = read(files.globe);

globe = replaceExact(
  files.globe,
  globe,
  `        this.focusToken = 0;
        this.targetCamera = new THREE.Vector3(0, 50, 300);`,
  `        this.focusToken = 0;
        this.cameraTransitionActive = true;
        this.earthRotationTransitionActive = false;
        this.targetCamera = new THREE.Vector3(0, 50, 300);`,
  "globe constructor"
);

globe = replaceExact(
  files.globe,
  globe,
  `        this.renderer.domElement.addEventListener('click', this.onCanvasClick);
    }

    setInteractionEnabled(enabled) {`,
  `        this.renderer.domElement.addEventListener('click', this.onCanvasClick);

        // The first pointer interaction in Maps should immediately hand
        // camera control to OrbitControls instead of letting the preset
        // transition keep pulling the camera back.
        this.onPointerDown = () => {
            if (this.interactionEnabled) {
                this.cameraTransitionActive = false;
                this.earthRotationTransitionActive = false;
            }
        };
        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    }

    setInteractionEnabled(enabled) {`,
  "globe pointer interaction"
);

globe = replaceExact(
  files.globe,
  globe,
  `        if (this.controls) {
            this.controls.enabled = this.interactionEnabled;
            this.controls.autoRotate = false;
        }`,
  `        if (this.controls) {
            this.controls.enabled = this.interactionEnabled;
            this.controls.autoRotate = false;

            if (this.interactionEnabled) {
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            }
        }`,
  "globe controls"
);

globe = replaceExact(
  files.globe,
  globe,
  `        this.targetEarthRotation.set(
            -latRadians,
            -lonRadians,
            0
        );
    }
    setView(view) {`,
  `        this.targetEarthRotation.set(
            -latRadians,
            -lonRadians,
            0
        );
        this.earthRotationTransitionActive = true;
    }

    setView(view) {`,
  "globe location focus"
);

globe = replaceExact(
  files.globe,
  globe,
  `        this.focusToken += 1;
        this.targetCamera.set(...preset.camera);`,
  `        this.focusToken += 1;
        this.cameraTransitionActive = true;
        this.targetCamera.set(...preset.camera);`,
  "globe view transition"
);

globe = replaceExact(
  files.globe,
  globe,
  `        this.camera.position.lerp(this.targetCamera, this.transitionSpeed);
        this.earthGroup.position.lerp(this.targetEarthPosition, this.transitionSpeed);

        if (!this.interactionEnabled) {
            this.earthGroup.rotation.x = THREE.MathUtils.lerp(
                this.earthGroup.rotation.x,
                this.targetEarthRotation.x,
                this.transitionSpeed
            );
            this.earthGroup.rotation.z = THREE.MathUtils.lerp(
                this.earthGroup.rotation.z,
                this.targetEarthRotation.z,
                this.transitionSpeed
            );
            this.earthGroup.rotation.y = THREE.MathUtils.lerp(
                this.earthGroup.rotation.y,
                this.targetEarthRotation.y,
                this.transitionSpeed
            );
            this.earthGroup.rotation.y += this.autoSpinSpeed;
        } else {
            this.controls.update();
        }`,
  `        if (this.cameraTransitionActive) {
            this.camera.position.lerp(this.targetCamera, this.transitionSpeed);

            if (this.camera.position.distanceTo(this.targetCamera) < 0.35) {
                this.camera.position.copy(this.targetCamera);
                this.cameraTransitionActive = false;
            }
        }

        this.earthGroup.position.lerp(this.targetEarthPosition, this.transitionSpeed);

        if (
            this.earthRotationTransitionActive &&
            this.earthGroup.rotation.distanceTo(this.targetEarthRotation) < 0.01
        ) {
            this.earthGroup.rotation.copy(this.targetEarthRotation);
            this.earthRotationTransitionActive = false;
        }

        if (!this.interactionEnabled) {
            this.earthGroup.rotation.x = THREE.MathUtils.lerp(
                this.earthGroup.rotation.x,
                this.targetEarthRotation.x,
                this.transitionSpeed
            );
            this.earthGroup.rotation.z = THREE.MathUtils.lerp(
                this.earthGroup.rotation.z,
                this.targetEarthRotation.z,
                this.transitionSpeed
            );
            this.earthGroup.rotation.y = THREE.MathUtils.lerp(
                this.earthGroup.rotation.y,
                this.targetEarthRotation.y,
                this.transitionSpeed
            );
            this.earthGroup.rotation.y += this.autoSpinSpeed;
        } else {
            if (this.earthRotationTransitionActive) {
                this.earthGroup.rotation.x = THREE.MathUtils.lerp(
                    this.earthGroup.rotation.x,
                    this.targetEarthRotation.x,
                    this.transitionSpeed
                );
                this.earthGroup.rotation.y = THREE.MathUtils.lerp(
                    this.earthGroup.rotation.y,
                    this.targetEarthRotation.y,
                    this.transitionSpeed
                );
                this.earthGroup.rotation.z = THREE.MathUtils.lerp(
                    this.earthGroup.rotation.z,
                    this.targetEarthRotation.z,
                    this.transitionSpeed
                );
            }

            this.controls.update();
        }`,
  "globe animation loop"
);

globe = replaceExact(
  files.globe,
  globe,
  `        this.renderer?.domElement?.removeEventListener('click', this.onCanvasClick);
        this.controls?.dispose?.();`,
  `        this.renderer?.domElement?.removeEventListener('click', this.onCanvasClick);
        this.renderer?.domElement?.removeEventListener('pointerdown', this.onPointerDown);
        this.controls?.dispose?.();`,
  "globe dispose"
);

fs.writeFileSync(files.globe, globe, "utf8");

/* ---------- Leaflet loading ---------- */

backup(files.components);
let components = read(files.components);

components = replaceExact(
  files.components,
  components,
  `        const map = L.map(mapElementRef.current, {
            zoomControl: true,
            attributionControl: true,
            worldCopyJump: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);`,
  `        const map = L.map(mapElementRef.current, {
            zoomControl: true,
            attributionControl: true,
            worldCopyJump: true,
            preferCanvas: true,
            zoomAnimation: false,
            fadeAnimation: false,
            markerZoomAnimation: false
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
            keepBuffer: 4,
            updateWhenIdle: true,
            updateWhenZooming: false,
            crossOrigin: true
        }).addTo(map);`,
  "Leaflet map initialization"
);

components = replaceExact(
  files.components,
  components,
  `    useEffect(() => {
        if (!globeEngine) return;
        globeEngine.setInteractionEnabled(mapMode === "3D");
    }, [mapMode, globeEngine]);`,
  `    useEffect(() => {
        if (!globeEngine) return;

        globeEngine.setInteractionEnabled(mapMode === "3D");

        if (mapMode === "2D" && leafletMapRef.current) {
            const timer = window.setTimeout(() => {
                leafletMapRef.current?.invalidateSize({ pan: false });
            }, 80);

            return () => window.clearTimeout(timer);
        }
    }, [mapMode, globeEngine]);`,
  "2D/3D mode synchronization"
);

fs.writeFileSync(files.components, components, "utf8");

console.log("Applied AtmoSphere fixes.");
console.log("Backups created as *.bak beside modified files.");
console.log("Run `git diff` and test before committing.");
