(() => {
    const $ = (id) => document.getElementById(id);
    const params = new URLSearchParams(window.location.search);
    const guestMode = params.get("mode") === "guest";
    let map = null;

    function toast(message) {
        const el = $("toast");
        el.textContent = message;
        el.classList.remove("oculto");
        window.clearTimeout(toast.timer);
        toast.timer = window.setTimeout(() => el.classList.add("oculto"), 3000);
    }

    document.querySelectorAll(".requiere-sesion").forEach(el => {
        el.classList.toggle("oculto", guestMode);
    });
    $("guest-note").classList.toggle("oculto", !guestMode);

    function initializeMap() {
        const token = window.APP_CONFIG && window.APP_CONFIG.mapboxToken;
        if (!window.mapboxgl || !token || token.includes("REEMPLAZAR_")) {
            $("mapa-error").textContent = "Token público de mapa no es válido :(";
            $("mapa-error").classList.remove("oculto");
            return;
        }

        mapboxgl.accessToken = token;
        const center = window.APP_CONFIG.initialCenter || [-70.6483, -33.4569];
        map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v12",
            center,
            zoom: window.APP_CONFIG.initialZoom || 13,
            attributionControl: true
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
        map.on("load", () => {
            $("mapa-error").classList.add("oculto");
            // Marcadores ilustrativos; no representan reportes reales.
            [
                { coords: [-70.655, -33.451], color: "#4268f5" },
                { coords: [-70.641, -33.457], color: "#68c9ef" },
                { coords: [-70.649, -33.464], color: "#7ba785" },
                { coords: [-70.665, -33.455], color: "#4268f5" },
                { coords: [-70.635, -33.448], color: "#68c9ef" }
            ].forEach(p => new mapboxgl.Marker({ color: p.color }).setLngLat(p.coords).addTo(map));
        });
        map.on("error", () => {
            $("mapa-error").textContent = "No se pudo cargar el mapa. Revisa tu conexión a internet.";
            $("mapa-error").classList.remove("oculto");
        });
    }

    function openReport(kind) {
        if (guestMode) {
            toast("El modo invitado solo permite consultar el mapa.");
            return;
        }
        const url = `report.html?type=${encodeURIComponent(kind)}&mode=${guestMode ? "guest" : "user"}`;
        window.location.href = url;
    }

    $("boton-retorno").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    $("lado-cerrar").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    $("boton-menu-desp").addEventListener("click", () => $("side-menu").classList.remove("oculto"));
    $("lado-cerrar").addEventListener("click", () => $("side-menu").classList.add("oculto"));
    $("lado-mapa").addEventListener("click", () => $("side-menu").classList.add("oculto"));
    $("lado-reportar").addEventListener("click", () => { $("side-menu").classList.add("oculto"); openReport("Denuncia"); });
    $("boton-reportar").addEventListener("click", () => openReport("Denuncia"));

    $("boton-buscar").addEventListener("click", () => {
        $("barra-busqueda").classList.remove("oculto");
        $("busca-direccion").focus();
    });
    $("busca-cerrar").addEventListener("click", () => $("search-panel").classList.add("oculto"));

    async function searchAddress() {
        const query = $("busca-direccion").value.trim();
        if (!query) return;
        const token = window.APP_CONFIG && window.APP_CONFIG.mapboxToken;
        if (!token || token.includes("REEMPLAZAR_")) {
            toast("nuh uh");
            return;
        }
        const results = $("busca-resultados");
        results.textContent = "Buscando…";
        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${encodeURIComponent(token)}&limit=5&language=es`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error de búsqueda");
            const data = await response.json();
            results.innerHTML = "";
            if (!data.features.length) { results.textContent = "No se encontraron resultados."; return; }
            data.features.forEach(feature => {
                const button = document.createElement("button");
                button.className = "search-result";
                button.textContent = feature.place_name;
                button.addEventListener("click", () => {
                    if (map) map.flyTo({ center: feature.center, zoom: 16 });
                    $("barra-busqueda").classList.add("oculto");
                    $("busca-resultados").innerHTML = "";
                });
                results.appendChild(button);
            });
        } catch (_) {
            results.textContent = "No se pudo completar la búsqueda. Revisa la conexión.";
        }
    }
    $("busca-enter").addEventListener("click", searchAddress);
    $("busca-direccion").addEventListener("keydown", e => { if (e.key === "Enter") searchAddress(); });

    initializeMap();
})();
