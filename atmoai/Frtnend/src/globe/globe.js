const GLOBE_RADIUS = 100;

class GlobeEngine {
    constructor(containerId, onLocationSelect) {
        this.container = document.getElementById(containerId);
        this.onLocationSelect = onLocationSelect;
        this.interactionEnabled = false;
        this.currentView = "landing";
        this.autoSpin = true;
        this.autoSpinSpeed = 0.0008;
        this.transitionSpeed = 0.045;
        this.markerPulseSpeed = 5;
        this.targetCamera = new THREE.Vector3(0, 50, 300);
        this.targetEarthPosition = new THREE.Vector3(55, 0, 0);
        this.targetEarthRotation = new THREE.Vector3(0, 0, 0);
        this.lastResizeHandler = null;
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = null;

        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.copy(this.targetCamera);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 120;
        this.controls.maxDistance = 400;
        this.controls.enabled = false;

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.position.set(500, 300, 500);
        this.scene.add(this.sunLight);

        this.earthGroup = new THREE.Group();
        this.scene.add(this.earthGroup);

        this.markersGroup = new THREE.Group();
        this.earthGroup.add(this.markersGroup);

        this.createLayers();
        this.setupInteraction();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();

        this.lastResizeHandler = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.lastResizeHandler, false);
        this.setInteractionEnabled(false);
    }

    createLayers() {
        const textureLoader = new THREE.TextureLoader();
        const radius = GLOBE_RADIUS;
        const segments = 64;

        const earthGeo = new THREE.SphereGeometry(radius, segments, segments);
        const earthMat = new THREE.MeshPhongMaterial({
            color: 0x051535,
            emissive: 0x01020a,
            shininess: 15
        });
        this.earthBase = new THREE.Mesh(earthGeo, earthMat);
        this.earthGroup.add(this.earthBase);

        textureLoader.load(
            './Frtnend/src/globe/assets/earth-blue-marble.jpg',
            (tex) => {
                tex.encoding = THREE.sRGBEncoding;
                earthMat.map = tex;
                earthMat.color.setHex(0xffffff);
                earthMat.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Earth texture failed to load:', error)
        );

        const cloudGeo = new THREE.SphereGeometry(radius + 0.5, segments, segments);
        const cloudMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
        this.earthGroup.add(this.clouds);

        textureLoader.load(
            './Frtnend/src/globe/assets/clouds.png',
            (tex) => {
                tex.encoding = THREE.sRGBEncoding;
                cloudMat.map = tex;
                cloudMat.opacity = 0.8;
                cloudMat.needsUpdate = true;
            },
            undefined,
            (error) => console.error('Cloud texture failed to load:', error)
        );

        const atmosGeo = new THREE.SphereGeometry(radius + 2, segments, segments);
        const atmosMat = new THREE.ShaderMaterial({
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
            depthWrite: false
        });
        this.atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        this.earthGroup.add(this.atmosphere);

        const dataGeo = new THREE.SphereGeometry(radius + 0.2, segments, segments);
        this.dataUniforms = {
            uTime: { value: 0.0 },
            uLayerType: { value: 0 },
            uOpacity: { value: 1.0 }
        };
        const dataMat = new THREE.ShaderMaterial({
            vertexShader: dataVertexShader,
            fragmentShader: dataFragmentShader,
            uniforms: this.dataUniforms,
            transparent: true,
            depthWrite: false
        });
        this.dataLayer = new THREE.Mesh(dataGeo, dataMat);
        this.earthGroup.add(this.dataLayer);

        this.createStars();
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const starsVertices = [];

        for (let i = 0; i < 2000; i += 1) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            if (Math.sqrt(x * x + y * y + z * z) > 300) {
                starsVertices.push(x, y, z);
            }
        }

        starsGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(starsVertices, 3)
        );

        this.starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(this.starField);
    }

    setupInteraction() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.onCanvasClick = async (event) => {
            if (!this.interactionEnabled) return;

            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(this.earthBase);

            if (!intersects.length) return;

            const worldPoint = intersects[0].point.clone();
            const localPoint = this.earthBase.worldToLocal(worldPoint);
            const coords = this.pointToLatLon(localPoint);

            this.addMarker(localPoint);

            if (!this.onLocationSelect) return;

            try {
                const response = await fetch('/api/reverse-geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        latitude: coords.lat,
                        longitude: coords.lon
                    })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Reverse geocoding failed');
                }

                const address = data.address || {};
                const name =
                    address.suburb ||
                    address.town ||
                    address.village ||
                    address.city ||
                    address.municipality ||
                    address.county ||
                    'Selected Coordinates';

                this.onLocationSelect({
                    lat: coords.lat.toFixed(2),
                    lon: coords.lon.toFixed(2),
                    name,
                    city: address.city || null,
                    state: address.state || null,
                    country: address.country || null,
                    displayName: data.displayName || null
                });
            } catch (error) {
                console.error('Reverse geocoding failed:', error);
                this.onLocationSelect({
                    lat: coords.lat.toFixed(2),
                    lon: coords.lon.toFixed(2),
                    name: 'Selected Coordinates'
                });
            }
        };

        this.renderer.domElement.addEventListener('click', this.onCanvasClick);
    }

    setInteractionEnabled(enabled) {
        this.interactionEnabled = Boolean(enabled);
        if (this.controls) {
            this.controls.enabled = this.interactionEnabled;
            this.controls.autoRotate = false;
        }
        if (this.renderer?.domElement) {
            this.renderer.domElement.style.pointerEvents = this.interactionEnabled ? 'auto' : 'none';
            this.renderer.domElement.style.cursor = this.interactionEnabled ? 'grab' : 'default';
        }
    }

    setView(view) {
        this.currentView = view;

        const presets = {
            landing: {
                camera: [0, 50, 300],
                earth: [55, 0, 0],
                rotation: [0, 0, 0],
                spin: 0.0008,
                interactive: false
            },
            maps: {
                camera: [0, 0, 220],
                earth: [0, 0, 0],
                rotation: [0, 0, 0],
                spin: 0,
                interactive: true
            },
            overview: {
                camera: [0, 28, 300],
                earth: [-42, 34, 0],
                rotation: [0.02, -0.36, 0],
                spin: 0.00045,
                interactive: false
            },
            ai: {
                camera: [0, 10, 345],
                earth: [52, 12, 0],
                rotation: [0.02, -0.85, 0],
                spin: 0.0005,
                interactive: false
            }
        };

        const preset = presets[view] || presets.landing;
        this.targetCamera.set(...preset.camera);
        this.targetEarthPosition.set(...preset.earth);
        this.targetEarthRotation.set(...preset.rotation);
        this.autoSpinSpeed = preset.spin;
        this.setInteractionEnabled(preset.interactive);
    }

    // Kept for compatibility with older UI code.
    setCinematicMode(isCinematic) {
        this.setView(isCinematic ? 'landing' : 'maps');
    }

    setLayer(typeStr) {
        const typeMap = {
            none: 0,
            temperature: 1,
            precipitation: 2,
            wind: 3,
            anomaly: 4
        };
        const newType = typeMap[typeStr] !== undefined ? typeMap[typeStr] : 0;
        this.dataUniforms.uLayerType.value = newType;

        if (newType !== 0) {
            this.earthBase.material.color.setHex(
                this.earthBase.material.map ? 0x888888 : 0x020815
            );
            this.clouds.material.opacity = 0.1;
        } else {
            this.earthBase.material.color.setHex(
                this.earthBase.material.map ? 0xffffff : 0x051535
            );
            if (this.clouds.material.map) this.clouds.material.opacity = 0.8;
        }
    }

    pointToLatLon(point) {
        const normalized = point.clone().normalize();
        const lat = Math.asin(normalized.y) * (180 / Math.PI);
        const lon = Math.atan2(normalized.x, normalized.z) * (180 / Math.PI);
        return { lat, lon };
    }

    latLonToPoint(lat, lon, radius = GLOBE_RADIUS + 2) {
        const latRad = THREE.MathUtils.degToRad(lat);
        const lonRad = THREE.MathUtils.degToRad(lon);
        const cosLat = Math.cos(latRad);
        return new THREE.Vector3(
            radius * cosLat * Math.sin(lonRad),
            radius * Math.sin(latRad),
            radius * cosLat * Math.cos(lonRad)
        );
    }

    setLocationMarker(lat, lon) {
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        const localPoint = this.latLonToPoint(lat, lon);
        this.addMarker(localPoint);
    }

    addMarker(localPoint) {
        while (this.markersGroup.children.length > 0) {
            const child = this.markersGroup.children.pop();
            child.geometry?.dispose?.();
            child.material?.dispose?.();
        }

        const markerPosition = localPoint.clone().normalize().multiplyScalar(GLOBE_RADIUS + 2);

        const geometry = new THREE.SphereGeometry(1.75, 18, 18);
        const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(markerPosition);

        const ringGeo = new THREE.RingGeometry(2.4, 3.25, 40);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(markerPosition);
        ring.lookAt(0, 0, 0);

        this.markersGroup.add(marker);
        this.markersGroup.add(ring);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime();

        this.camera.position.lerp(this.targetCamera, this.transitionSpeed);
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
        }

        if (this.clouds) {
            this.clouds.rotation.y += 0.0008;
        }

        if (this.dataUniforms) {
            this.dataUniforms.uTime.value = time;
        }

        if (this.markersGroup.children.length > 1) {
            const ring = this.markersGroup.children[1];
            const scale = 1 + Math.sin(time * this.markerPulseSpeed) * 0.22;
            ring.scale.setScalar(scale);
            ring.material.opacity = 0.42 + (Math.sin(time * this.markerPulseSpeed) + 1) * 0.08;
        }

        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        cancelAnimationFrame(this.animationFrameId);
        this.renderer?.domElement?.removeEventListener('click', this.onCanvasClick);
        this.controls?.dispose?.();
        if (this.lastResizeHandler) {
            window.removeEventListener('resize', this.lastResizeHandler);
        }
        if (this.renderer?.domElement?.parentNode === this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        this.renderer?.dispose?.();
    }
}

window.GlobeEngine = GlobeEngine;
