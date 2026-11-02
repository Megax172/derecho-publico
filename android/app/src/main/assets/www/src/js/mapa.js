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
    $("nota-invitado").classList.toggle("oculto", !guestMode);

    function initializeMap() {
        const token = window.APP_CONFIG && window.APP_CONFIG.mapboxToken;
        if (!window.mapboxgl || !token || token.includes("REEMPLAZAR_")) {
            $("mapa-error").textContent = "Token público de mapa no es válido :(";
            $("mapa-error").classList.remove("oculto");
            return;
        }

        mapboxgl.accessToken = token;
        const center = window.APP_CONFIG.initialCenter || [-73.0503, -36.82699];
        map = new mapboxgl.Map({
            container: "mapa",
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
                { coords: [-73.0503, -36.8270], color: "#4268f5" },
                { coords: [-73.0590, -36.8230], color: "#68c9ef" },
                { coords: [-73.0430, -36.8310], color: "#7ba785" },
                { coords: [-73.0640, -36.8330], color: "#4268f5" },
                { coords: [-73.0370, -36.8190], color: "#68c9ef" }
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
        const url = `reporte.html?type=${encodeURIComponent(kind)}&mode=${guestMode ? "guest" : "user"}`;
        window.location.href = url;
    }

    $("boton-retorno").addEventListener("click", () => {
        window.location.href = "index.html";
    });
        $("boton-menu-desp").addEventListener("click", () => $("barra-lado").classList.remove("oculto"));
    $("lado-cerrar").addEventListener("click", () => $("barra-lado").classList.add("oculto"));
    $("lado-mapa").addEventListener("click", () => $("barra-lado").classList.add("oculto"));
    $("lado-reportar").addEventListener("click", () => { $("barra-lado").classList.add("oculto"); openReport("Denuncia"); });
    $("boton-reportar").addEventListener("click", () => openReport("Denuncia"));

    $("boton-buscar").addEventListener("click", () => {
        $("barra-busqueda").classList.remove("oculto");
        $("busca-direccion").focus();
    });
    $("busca-cerrar").addEventListener("click", () => $("barra-busqueda").classList.add("oculto"));

    async function searchAddress() {
        const query = $("busca-direccion").value.trim();
        if (!query) return;
        const token = window.APP_CONFIG && window.APP_CONFIG.mapboxToken;
        if (!token || token.includes("REEMPLAZAR_")) {
            toast("Configura el token público de Mapbox.");
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
                button.className = "resultado-busqueda";
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
