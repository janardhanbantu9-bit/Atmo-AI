const { useState, useEffect, useRef } = React;

const App = () => {
    const [view, setView] = useState("landing");
    const [activeLayer, setActiveLayer] = useState("none");
    const [location, setLocation] = useState(null);
    const [domain, setDomain] = useState("marine");
    const [notificationOpen, setNotificationOpen] = useState(false);

    const [chatHistory, setChatHistory] = useState([
        {
            role: "ai",
            text: "Atmosphere Intelligence online. Ask me about weather, climate, historical trends, or significant events."
        }
    ]);

    const engineRef = useRef(null);

    useEffect(() => {
        if (engineRef.current) return;

        engineRef.current = new GlobeEngine("canvas-container", (locData) => {
            setLocation(locData);
            setView("maps");
            setNotificationOpen(false);
        });
    }, []);

    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.setView(view);
    }, [view]);

    useEffect(() => {
        if (!engineRef.current || !location) return;

        const latitude = Number(location.lat);
        const longitude = Number(location.lon);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            engineRef.current.setLocationMarker(latitude, longitude);
        }
    }, [location]);

    useEffect(() => {
        if (!engineRef.current) return;
        engineRef.current.setLayer(activeLayer);
    }, [activeLayer]);

    const buildLocation = ({
        latitude,
        longitude,
        name,
        address = {},
        displayName = null,
        city = null,
        state = null,
        country = null
    }) => {
        const lat = Number(latitude);
        const lon = Number(longitude);

        const resolvedCity = city || address.city || address.town || address.municipality || null;
        const resolvedState = state || address.state || address.state_district || null;
        const resolvedCountry = country || address.country || null;

        return {
            lat,
            lon,
            name:
                name ||
                resolvedCity ||
                address.village ||
                address.suburb ||
                address.county ||
                "Selected Coordinates",
            city: resolvedCity,
            state: resolvedState,
            country: resolvedCountry,
            displayName:
                displayName ||
                [
                    name || resolvedCity || address.village || address.suburb || null,
                    resolvedState,
                    resolvedCountry
                ].filter(Boolean).join(", ") ||
                null
        };
    };

    const reverseGeocode = async (latitude, longitude) => {
        const response = await fetch("/api/reverse-geocode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ latitude, longitude })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Unable to resolve the selected location.");
        }

        return buildLocation({
            latitude: data.latitude ?? latitude,
            longitude: data.longitude ?? longitude,
            address: data.address || {},
            displayName: data.displayName || null
        });
    };

    const selectLocation = (loc) => {
        if (!loc) return;
        setLocation(loc);
        setView("maps");
        setNotificationOpen(false);
    };

    const handleCoordinateSelect = async (latitude, longitude) => {
        try {
            const loc = await reverseGeocode(latitude, longitude);
            selectLocation(loc);
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            selectLocation(
                buildLocation({
                    latitude,
                    longitude,
                    name: "Selected Coordinates"
                })
            );
        }
    };

    const handleSearchLocation = async (query) => {
        const response = await fetch(`/api/geocode?name=${encodeURIComponent(query)}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Location search failed.");
        }

        const firstResult = data.results?.[0];

        if (!firstResult) {
            throw new Error(`No location found for "${query}".`);
        }

        const latitude = Number(firstResult.latitude);
        const longitude = Number(firstResult.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("The location service returned invalid coordinates.");
        }

        let loc;

        try {
            loc = await reverseGeocode(latitude, longitude);
        } catch (error) {
            console.warn("Search reverse geocoding failed:", error);

            loc = buildLocation({
                latitude,
                longitude,
                name: firstResult.name,
                city: firstResult.name,
                state: firstResult.admin1 || null,
                country: firstResult.country || null
            });
        }

        selectLocation(loc);
        return loc;
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            window.alert("Location services are not available in this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const loc = await reverseGeocode(coords.latitude, coords.longitude);
                    selectLocation(loc);
                } catch (error) {
                    window.alert(
                        error instanceof Error
                            ? error.message
                            : "Unable to resolve your location."
                    );
                }
            },
            (error) => {
                const messages = {
                    1: "Location permission was denied.",
                    2: "Your location could not be determined.",
                    3: "Location request timed out."
                };
                window.alert(messages[error.code] || "Unable to determine your location.");
            },
            {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 300000
            }
        );
    };

    const handleUserMessage = async (text, selectedDomain = domain, selectedLocation = location) => {
        const pendingId = `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        setChatHistory((prev) => [
            ...prev,
            { role: "user", text },
            { role: "ai", text: "Thinking…", pendingId }
        ]);

        try {
            const reply = await window.sendMessage(text, selectedDomain, selectedLocation);

            setChatHistory((prev) =>
                prev.map((message) =>
                    message.pendingId === pendingId
                        ? { role: "ai", text: reply }
                        : message
                )
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to get a response. Please try again.";

            setChatHistory((prev) =>
                prev.map((item) =>
                    item.pendingId === pendingId
                        ? { role: "ai", text: `Sorry, I couldn't get a response: ${message}` }
                        : item
                )
            );
        }
    };

    const goTo = (nextView) => {
        setView(nextView);
        setNotificationOpen(false);
    };

    return (
        <div className="atmo-app">
            <Navigation view={view} setView={goTo} />

            {view === "landing" && (
                <LandingPage
                    setView={goTo}
                    onLocateMe={handleLocateMe}
                    notificationOpen={notificationOpen}
                    setNotificationOpen={setNotificationOpen}
                />
            )}

            {view === "ai" && (
                <ChatPage
                    chatHistory={chatHistory}
                    onSendMessage={handleUserMessage}
                    domain={domain}
                    setDomain={setDomain}
                    location={location}
                    notificationOpen={notificationOpen}
                    setNotificationOpen={setNotificationOpen}
                    onGoToOverview={() => goTo("overview")}
                />
            )}

            {view === "maps" && (
                <MapsPage
                    activeLayer={activeLayer}
                    setActiveLayer={setActiveLayer}
                    location={location}
                    onLocateMe={handleLocateMe}
                    onSearchLocation={handleSearchLocation}
                    onCoordinateSelect={handleCoordinateSelect}
                    notificationOpen={notificationOpen}
                    setNotificationOpen={setNotificationOpen}
                    onGoToOverview={() => goTo("overview")}
                    globeEngine={engineRef.current}
                />
            )}

            {view === "overview" && (
                <OverviewPage
                    location={location}
                    notificationOpen={notificationOpen}
                    setNotificationOpen={setNotificationOpen}
                    onGoToOverview={() => goTo("overview")}
                />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
