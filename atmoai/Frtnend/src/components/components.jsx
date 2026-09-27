const { useState, useEffect, useRef } = React;

const IconCloudSun = ({ size = 22, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className={className} aria-hidden="true">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="M4.93 4.93l1.41 1.41" />
        <path d="M17.66 17.66l1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M6.34 17.66l-1.41 1.41" />
        <path d="M19.07 4.93l-1.41 1.41" />
        <path d="M17 18a5 5 0 0 0-10 0" />
        <path d="M7 18h10" />
    </svg>
);

const IconBell = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const IconX = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const IconMic = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M19 10a7 7 0 0 1-14 0" />
        <path d="M12 19v3" />
        <path d="M8 22h8" />
    </svg>
);

const IconSend = ({ size = 19 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
    </svg>
);

const IconMap = ({ size = 19 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
    </svg>
);

const IconGlobe = ({ size = 19 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M2.5 12h19" />
        <path d="M12 2.5a14.5 14.5 0 0 1 0 19" />
        <path d="M12 2.5a14.5 14.5 0 0 0 0 19" />
    </svg>
);

const IconLayers = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="m12 2 9 5-9 5-9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
    </svg>
);

const IconThermometer = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M14 14.76V4a2 2 0 0 0-4 0v10.76a4 4 0 1 0 4 0Z" />
    </svg>
);

const IconWind = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M3 8h11a3 3 0 1 0-3-3" />
        <path d="M3 12h15a3 3 0 1 1-3 3" />
        <path d="M3 16h8a3 3 0 1 0-3 3" />
    </svg>
);

const IconCloudRain = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="M7 18h10a4.5 4.5 0 0 0 .5-8.97A6.5 6.5 0 0 0 5 10.5 4 4 0 0 0 7 18Z" />
        <path d="M8 20v2" />
        <path d="M12 19v3" />
        <path d="M16 20v2" />
    </svg>
);

const IconAlert = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <path d="m12 3 9 17H3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const IconSearch = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
    </svg>
);

const IconLocate = ({ size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
    </svg>
);

const IconChevron = ({ direction = "down", size = 14 }) => {
    const path = direction === "up" ? "m6 9 6-6 6 6" : "m6 6 6 6 6-6";
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d={path} />
        </svg>
    );
};

const NAV_ITEMS = [
    { id: "landing", label: "HOME" },
    { id: "ai", label: "AI" },
    { id: "maps", label: "MAPS" },
    { id: "overview", label: "OVERVIEW" }
];

const TYPEWRITER_PHRASES = [
    "Is it going to rain in Hyderabad?",
    "How's the weather in Delhi?",
    "Will there be heavy rain tomorrow?",
    "What's the temperature in Mumbai?",
    "Is there a storm expected this week?",
    "How humid will it be today?"
];

const useTypewriter = (phrases, typingSpeed = 48, pauseTime = 1800) => {
    const [text, setText] = useState("");
    const [index, setIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = phrases[index] || "";
        const delay = deleting ? Math.max(typingSpeed * 0.42, 16) : typingSpeed;

        const timer = setTimeout(() => {
            if (!deleting) {
                const next = current.slice(0, text.length + 1);
                setText(next);

                if (next.length === current.length) {
                    setTimeout(() => setDeleting(true), pauseTime);
                }
                return;
            }

            const next = current.slice(0, Math.max(text.length - 1, 0));
            setText(next);

            if (next.length === 0) {
                setDeleting(false);
                setIndex((value) => (value + 1) % phrases.length);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [phrases, index, text, deleting, typingSpeed, pauseTime]);

    return text;
};

const Navigation = ({ view, setView }) => (
    <nav className="atmo-nav">
        <div className="atmo-nav-inner">
            <button
                className="brand-lockup"
                onClick={() => setView("landing")}
                aria-label="AtmoSphere Home"
            >
                <IconCloudSun size={24} />
                <span className="brand-word">
                    ATMO<span>SPHERE</span>
                </span>
            </button>

            <div className="nav-links">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-link ${view === item.id ? "active" : ""}`}
                        onClick={() => setView(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="nav-spacer" />
        </div>
    </nav>
);

const NotificationBell = ({ open, setOpen, onGoToOverview }) => (
    <div className="notification-anchor">
        <button
            className={`notification-button ${open ? "is-open" : ""}`}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close notifications" : "Open notifications"}
            aria-expanded={open}
        >
            {open ? <IconX /> : <IconBell />}
            {!open && <span className="notification-dot" />}
        </button>

        {open && (
            <div className="notification-panel glass-panel">
                <div className="notification-panel-head">
                    <div>
                        <div className="eyebrow">Alerts</div>
                        <h3>Notifications</h3>
                    </div>
                    <button className="icon-ghost" onClick={() => setOpen(false)} aria-label="Close">
                        <IconX />
                    </button>
                </div>

                <div className="notification-list">
                    <button className="notification-card notification-card-action" onClick={onGoToOverview}>
                        <div className="notification-card-meta">PREDICTION UPDATE</div>
                        <div className="notification-card-title">Significant event analysis is ready.</div>
                        <div className="notification-card-body">
                            Open the same Overview page used for local historical data and predictions.
                        </div>
                        <div className="notification-card-cta">Open Overview →</div>
                    </button>

                    <div className="notification-card">
                        <div className="notification-card-meta">SYSTEM</div>
                        <div className="notification-card-title">AtmoSphere is online.</div>
                        <div className="notification-card-body">
                            Climate layers, globe animation, and AI services are ready.
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const LocateButton = ({ onLocateMe, compact = false }) => (
    <button className={`locate-button ${compact ? "compact" : ""}`} onClick={onLocateMe}>
        <IconLocate size={16} />
        <span>Locate Me</span>
    </button>
);

const LandingPage = ({ setView, onLocateMe, notificationOpen, setNotificationOpen }) => {
    const featureCards = [
        {
            title: "Map Experience",
            body: "Explore weather layers through a responsive 2D/3D spatial view.",
            icon: <IconMap />
        },
        {
            title: "Multilingual AI",
            body: "Ask natural questions about weather and climate in the language you use.",
            icon: <IconCloudSun />
        },
        {
            title: "Voice Supported",
            body: "Keep the conversation hands-free with voice-ready interaction points.",
            icon: <IconMic />
        },
        {
            title: "Accuracy & Context",
            body: "Combine live conditions, historical context, and event signals in one place.",
            icon: <IconAlert />
        }
    ];

    return (
        <div className="landing-page">
            <section className="landing-hero">
                <div className="landing-hero-copy">
                    <div className="hero-kicker">Climate intelligence, made conversational.</div>
                    <h1>
                        WEATHER.<br />
                        CLIMATE.<br />
                        <span>INTELLIGENCE.</span>
                    </h1>
                    <p>
                        Conversational intelligence for weather, climate, and real-world decisions.
                        Understand what the forecast means, not just what it says.
                    </p>
                    <div className="hero-actions">
                        <button className="primary-cta" onClick={() => setView("maps")}>
                            Explore Platform →
                        </button>
                        <button className="secondary-cta" onClick={() => setView("ai")}>
                            Ask the AI
                        </button>
                    </div>
                </div>

                <div className="landing-controls">
                    <NotificationBell
                        open={notificationOpen}
                        setOpen={setNotificationOpen}
                        onGoToOverview={() => setView("overview")}
                    />
                    <LocateButton onLocateMe={onLocateMe} />
                </div>
            </section>

            <section className="landing-about">
                <div className="section-heading">
                    <div className="eyebrow">The platform</div>
                    <h2>Understand the atmosphere.</h2>
                    <p>
                        A calmer interface around a serious geospatial engine, with the Earth
                        remaining the visual focus rather than getting buried under controls.
                    </p>
                </div>

                <div className="feature-grid">
                    {featureCards.map((card) => (
                        <article className="feature-card glass-panel" key={card.title}>
                            <div className="feature-icon">{card.icon}</div>
                            <div>
                                <h3>{card.title}</h3>
                                <p>{card.body}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="about-footer">
                    <div>
                        <div className="eyebrow">About us</div>
                        <h3>Climate data without the dashboard clutter.</h3>
                    </div>
                    <button className="secondary-cta" onClick={() => setView("overview")}>
                        See the Overview →
                    </button>
                </div>
            </section>
        </div>
    );
};

const ChatPage = ({ chatHistory, onSendMessage, domain, setDomain, notificationOpen, setNotificationOpen, onGoToOverview }) => {
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);
    const placeholder = useTypewriter(TYPEWRITER_PHRASES);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const submit = (event) => {
        event.preventDefault();
        const value = input.trim();
        if (!value) return;
        onSendMessage(value, domain);
        setInput("");
    };

    return (
        <div className="app-page chat-page pointer-events-layer">
            <div className="page-top-controls">
                <NotificationBell
                    open={notificationOpen}
                    setOpen={setNotificationOpen}
                    onGoToOverview={onGoToOverview}
                />
            </div>

            <div className="chat-shell">
                <div className="chat-heading">
                    <div className="eyebrow">AI</div>
                    <h2>Talk to the atmosphere.</h2>
                    <p>Ask about weather, climate, risks, forecasts, and historical context.</p>
                    <label className="context-select">
                        <span>Context</span>
                        <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                            <option value="marine">Marine</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="aviation">Aviation</option>
                            <option value="disaster">Disaster</option>
                            <option value="research">Research</option>
                        </select>
                    </label>
                </div>

                <div className="chat-stream">
                    {chatHistory.map((msg, index) => (
                        <div
                            key={`${msg.role}-${index}-${msg.pendingId || ""}`}
                            className={`chat-row ${msg.role === "user" ? "user" : "assistant"}`}
                        >
                            {msg.role === "ai" && (
                                <div className="assistant-mark">
                                    <IconCloudSun size={18} />
                                </div>
                            )}
                            <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <form className="chat-composer glass-panel" onSubmit={submit}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={input ? "" : placeholder}
                        aria-label="Ask AtmoSphere"
                    />
                    <button type="button" className="composer-icon" aria-label="Voice input">
                        <IconMic />
                    </button>
                    <button
                        type="submit"
                        className={`composer-send ${input.trim() ? "enabled" : ""}`}
                        aria-label="Send message"
                    >
                        <IconSend />
                    </button>
                </form>
                <div className="chat-disclaimer">AtmoSphere can make mistakes. Verify critical conditions before acting.</div>
            </div>
        </div>
    );
};

const MapsPage = ({
    activeLayer,
    setActiveLayer,
    location,
    onLocateMe,
    onSearchLocation,
    onCoordinateSelect,
    notificationOpen,
    setNotificationOpen,
    onGoToOverview,
    globeEngine
}) => {
    const [mapMode, setMapMode] = useState("3D");
    const [timeline, setTimeline] = useState(0);
    const [selectedMetric, setSelectedMetric] = useState(activeLayer);
    const [searchValue, setSearchValue] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    const mapElementRef = useRef(null);
    const leafletMapRef = useRef(null);
    const leafletMarkerRef = useRef(null);
    const coordinateSelectRef = useRef(onCoordinateSelect);

    useEffect(() => {
        coordinateSelectRef.current = onCoordinateSelect;
    }, [onCoordinateSelect]);

    useEffect(() => {
        setSelectedMetric(activeLayer);
    }, [activeLayer]);

    useEffect(() => {
        if (!globeEngine) return;
        globeEngine.setInteractionEnabled(mapMode === "3D");
    }, [mapMode, globeEngine]);

    useEffect(() => {
        if (!mapElementRef.current || typeof L === "undefined") return;

        const map = L.map(mapElementRef.current, {
            zoomControl: true,
            attributionControl: true,
            worldCopyJump: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        map.on("click", (event) => {
            coordinateSelectRef.current?.(
                event.latlng.lat,
                event.latlng.lng
            );
        });

        leafletMapRef.current = map;

        const initialLat = Number(location?.lat);
        const initialLon = Number(location?.lon);

        if (Number.isFinite(initialLat) && Number.isFinite(initialLon)) {
            map.setView([initialLat, initialLon], 8);
        } else {
            map.setView([20, 0], 2);
        }

        const resizeTimer = window.setTimeout(() => map.invalidateSize(), 0);

        return () => {
            window.clearTimeout(resizeTimer);
            map.remove();
            leafletMapRef.current = null;
            leafletMarkerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map) return;

        const latitude = Number(location?.lat);
        const longitude = Number(location?.lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

        if (!leafletMarkerRef.current) {
            leafletMarkerRef.current = L.circleMarker(
                [latitude, longitude],
                {
                    radius: 7,
                    color: "#16c8ff",
                    weight: 2,
                    fillColor: "#16c8ff",
                    fillOpacity: 0.85
                }
            ).addTo(map);
        } else {
            leafletMarkerRef.current.setLatLng([latitude, longitude]);
        }

        map.setView([latitude, longitude], Math.max(map.getZoom(), 7), {
            animate: true,
            duration: 0.45
        });

        if (mapMode === "2D") {
            window.setTimeout(() => map.invalidateSize(), 0);
        }

        globeEngine?.setLocationMarker(latitude, longitude);
        globeEngine?.focusLocation(latitude, longitude, mapMode === "3D");
    }, [location, mapMode, globeEngine]);

    const layers = [
        { id: "none", label: "Base Earth", icon: null },
        { id: "temperature", label: "Temperature", icon: <IconThermometer /> },
        { id: "precipitation", label: "Precipitation", icon: <IconCloudRain /> },
        { id: "wind", label: "Wind / Pressure", icon: <IconWind /> },
        { id: "anomaly", label: "Climate Anomaly", icon: <IconAlert /> }
    ];

    const setMetric = (id) => {
        setSelectedMetric(id);
        setActiveLayer(id);
    };

    const shiftTimeline = (delta) => {
        setTimeline((value) => Math.max(-100, Math.min(100, value + delta)));
    };

    const submitSearch = async (event) => {
        event?.preventDefault();

        const query = searchValue.trim();
        if (!query || searching) return;

        setSearching(true);
        setSearchError("");

        try {
            await onSearchLocation(query);
        } catch (error) {
            setSearchError(
                error instanceof Error ? error.message : "Location search failed."
            );
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="app-page maps-page pointer-events-layer">
            <div className="page-top-controls">
                <NotificationBell
                    open={notificationOpen}
                    setOpen={setNotificationOpen}
                    onGoToOverview={onGoToOverview}
                />
            </div>

            <div className={`map-2d-surface ${mapMode === "2D" ? "is-visible" : ""}`}>
                <div ref={mapElementRef} className="leaflet-map" aria-label="2D OpenStreetMap view" />
            </div>

            <div className="maps-left-column">
                <form className="search-shell glass-panel" onSubmit={submitSearch}>
                    <IconSearch />
                    <input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={searching ? "Searching..." : "Find location"}
                        aria-label="Find location"
                        disabled={searching}
                    />
                    <button
                        type="button"
                        className="search-small"
                        onClick={onLocateMe}
                        aria-label="Use current location"
                        disabled={searching}
                    >
                        <IconLocate size={15} />
                    </button>
                </form>

                {searchError && (
                    <div className="map-search-error glass-panel" role="alert">
                        {searchError}
                    </div>
                )}

                <div className="map-summary glass-panel">
                    <div className="eyebrow">Selected location</div>
                    <h3>{location?.name || "Global view"}</h3>
                    <div className="summary-coordinates">
                        <span>{Number.isFinite(Number(location?.lat)) ? Number(location.lat).toFixed(4) : "--"}</span>
                        <span>{Number.isFinite(Number(location?.lon)) ? Number(location.lon).toFixed(4) : "--"}</span>
                    </div>
                    <div className="summary-note">
                        Search, Locate Me, and map clicks now share the same selected coordinates.
                    </div>
                </div>

                <LocateButton onLocateMe={onLocateMe} compact />
            </div>

            <div className="maps-right-column">
                <div className="location-panel glass-panel">
                    <div className="eyebrow">Address</div>
                    <h3>{location?.displayName || location?.name || "Select a region"}</h3>
                    <div className="coordinates">
                        <span>LAT {Number.isFinite(Number(location?.lat)) ? Number(location.lat).toFixed(4) : "--"}</span>
                        <span>LON {Number.isFinite(Number(location?.lon)) ? Number(location.lon).toFixed(4) : "--"}</span>
                    </div>
                </div>

                <div className="overview-mini glass-panel">
                    <div className="eyebrow">Overview of selected location</div>
                    <p>
                        {location
                            ? `${location.name} is selected. The 2D map and 3D globe use the same marker and coordinates.`
                            : "Click the Earth or the 2D map to select a region and populate its local context."}
                    </p>
                </div>

                <button
                    className="secondary-cta map-mode-toggle"
                    onClick={() => setMapMode((value) => value === "3D" ? "2D" : "3D")}
                >
                    {mapMode === "3D" ? <IconMap /> : <IconGlobe />}
                    <span>{mapMode === "3D" ? "Go 2D" : "Go 3D"}</span>
                </button>
            </div>

            <div className="maps-bottom-controls">
                <div className="layer-tabs glass-panel">
                    <div className="layer-title"><IconLayers /> Layers</div>
                    {layers.map((layer) => (
                        <button
                            key={layer.id}
                            className={`layer-tab ${selectedMetric === layer.id ? "active" : ""}`}
                            onClick={() => setMetric(layer.id)}
                        >
                            {layer.icon}
                            <span>{layer.label}</span>
                        </button>
                    ))}
                </div>

                <div className="timeline-panel glass-panel">
                    <div className="timeline-header">
                        <span>HISTORICAL</span>
                        <strong>LIVE</strong>
                        <span>FORECAST</span>
                    </div>
                    <input
                        type="range"
                        min="-100"
                        max="100"
                        value={timeline}
                        onChange={(e) => setTimeline(Number(e.target.value))}
                    />
                    <div className="timeline-actions">
                        <button onClick={() => shiftTimeline(-12)}>−12h</button>
                        <button onClick={() => shiftTimeline(-1)}>−1h</button>
                        <span>{timeline < 0 ? `${Math.abs(timeline)}h ago` : timeline > 0 ? `+${timeline}h` : "Now"}</span>
                        <button onClick={() => shiftTimeline(1)}>+1h</button>
                        <button onClick={() => shiftTimeline(12)}>+12h</button>
                    </div>
                    <div className="timeline-footer">
                        <span>24 hours</span>
                        <span>Days (+24 hours)</span>
                        <span>Selected: {selectedMetric === "none" ? "Base Earth" : selectedMetric}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewPage = ({
    location,
    notificationOpen,
    setNotificationOpen,
    onGoToOverview
}) => {
    const [metric, setMetric] = useState("temperature");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [rangeLabel, setRangeLabel] = useState("1 week");

    const metrics = [
        { id: "temperature", label: "Temperature" },
        { id: "precipitation", label: "Precipitation" },
        { id: "wind", label: "Wind" }
    ];

    const chartPoints = {
        temperature: "0,72 60,61 120,66 180,42 240,50 300,36 360,40 420,24 480,32 540,20",
        precipitation: "0,66 60,58 120,72 180,63 240,40 300,60 360,52 420,30 480,48 540,34",
        wind: "0,49 60,39 120,50 180,35 240,48 300,28 360,44 420,32 480,40 540,26"
    };

    useEffect(() => {
        if (fromDate && toDate) {
            setRangeLabel(`${fromDate} → ${toDate}`);
        } else {
            setRangeLabel("1 week");
        }
    }, [fromDate, toDate]);

    return (
        <div className="app-page overview-page pointer-events-layer overview-scroll">
            <div className="page-top-controls">
                <NotificationBell
                    open={notificationOpen}
                    setOpen={setNotificationOpen}
                    onGoToOverview={onGoToOverview}
                />
            </div>

            <div className="overview-content">
                <div className="overview-header">
                    <div>
                        <div className="eyebrow">Historical / Local Overview</div>
                        <h2>{location?.name || "Location overview"}</h2>
                        <p>Historical weather context and significant-event predictions.</p>
                    </div>

                    <div className="date-range glass-panel">
                        <span className="eyebrow">Duration</span>
                        <strong>{rangeLabel}</strong>
                    </div>
                </div>

                <div className="overview-controls glass-panel">
                    <label>
                        <span>Date 1</span>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </label>
                    <label>
                        <span>Date 2</span>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </label>
                    <button className="secondary-cta" onClick={() => {
                        setFromDate("");
                        setToDate("");
                    }}>
                        Reset to 1 week
                    </button>
                </div>

                <div className="metric-tabs glass-panel">
                    {metrics.map((item) => (
                        <button
                            key={item.id}
                            className={`metric-tab ${metric === item.id ? "active" : ""}`}
                            onClick={() => setMetric(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="overview-chart-card glass-panel">
                    <div className="overview-chart-head">
                        <div>
                            <div className="eyebrow">Historical trend</div>
                            <h3>{metrics.find((item) => item.id === metric)?.label}</h3>
                        </div>
                        <span className="chart-context">{rangeLabel}</span>
                    </div>

                    <svg className="overview-chart" viewBox="0 0 540 110" preserveAspectRatio="none" role="img" aria-label="Historical trend chart">
                        <defs>
                            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#39b9ff" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#39b9ff" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <polyline
                            fill="none"
                            stroke="#39b9ff"
                            strokeWidth="2.5"
                            points={chartPoints[metric]}
                        />
                    </svg>
                </div>

                <section className="predictions-section">
                    <div className="section-heading compact">
                        <div className="eyebrow">Predictions</div>
                        <h3>Significant events</h3>
                    </div>

                    <div className="prediction-empty glass-panel">
                        <IconAlert size={18} />
                        <span>No significant events predicted.</span>
                    </div>
                </section>
            </div>
        </div>
    );
};
