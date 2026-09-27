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
        if (!engineRef.current) return;
        engineRef.current.setLayer(activeLayer);
    }, [activeLayer]);

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
            throw new Error(data.error || "Unable to resolve your location.");
        }

        const address = data.address || {};
        return {
            lat: Number(latitude).toFixed(2),
            lon: Number(longitude).toFixed(2),
            name:
                address.suburb ||
                address.town ||
                address.village ||
                address.city ||
                address.municipality ||
                address.county ||
                "Current location",
            city: address.city || null,
            state: address.state || null,
            country: address.country || null,
            displayName: data.displayName || null
        };
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
                    setLocation(loc);
                    engineRef.current?.setLocationMarker(Number(loc.lat), Number(loc.lon));
                    setView("maps");
                    setNotificationOpen(false);
                } catch (error) {
                    window.alert(error instanceof Error ? error.message : "Unable to resolve your location.");
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

    const handleUserMessage = async (text) => {
        const pendingId = `pending-${Date.now()}-${Math.random().toString(16).slice(2)}`;

        setChatHistory((prev) => [
            ...prev,
            { role: "user", text },
            { role: "ai", text: "Thinking…", pendingId }
        ]);

        try {
            const reply = await window.sendMessage(text);

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
