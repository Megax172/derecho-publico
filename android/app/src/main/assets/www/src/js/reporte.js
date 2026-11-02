(() => {
    const $ = (id) => document.getElementById(id);
    const params = new URLSearchParams(window.location.search);
    const reportType = params.get("type") || "Denuncia";
    const guestMode = params.get("mode") === "guest";
    if (guestMode) { window.location.replace("mapa.html?mode=guest"); return; }

    function toast(message) {
        const el = $("toast");
        el.textContent = message;
        el.classList.remove("oculto");
        window.clearTimeout(toast.timer);
        toast.timer = window.setTimeout(() => el.classList.add("oculto"), 3000);
    }

    function backToMap(replace = false) {
        const url = `mapa.html?mode=${guestMode ? "guest" : "user"}`;
        if (replace) window.location.replace(url);
        else window.location.href = url;
    }

    $("titulo-reporte").textContent = reportType === "Aviso" ? "Crear aviso" : "Crear denuncia";
    $("tipo-rep").value = reportType === "Aviso" ? "aviso-temp" : "denuncia";

    $("boton-reporte-atras").addEventListener("click", () => backToMap());
    $("cancelar-repor").addEventListener("click", () => backToMap(true));

    $("gps-boton").addEventListener("click", () => {
        if (!navigator.geolocation) { toast("Este entorno no permite obtener la ubicación."); return; }
        $("estado-gps").textContent = "Obteniendo ubicación…";
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            $("ubicacion").value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            $("estado-gps").textContent = "Ubicación obtenida.";
        }, () => {
            $("estado-gps").textContent = "No se pudo obtener la ubicación. Revisa los permisos del dispositivo.";
        }, { enableHighAccuracy: true, timeout: 12000 });
    });

    $("imagenes").addEventListener("change", () => {
        const preview = $("preview-evid");
        preview.innerHTML = "";
        Array.from($("imagenes").files || []).slice(0, 8).forEach(file => {
            if (!file.type.startsWith("image/")) return;
            const img = document.createElement("img");
            img.alt = file.name;
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        });
    });

    $("reporte-formulario").addEventListener("submit", event => {
        event.preventDefault();
        if (!$("tipo-rep").value || !$("niv-acceso").value || !$("ubicacion").value.trim()) {
            toast("Completa el tipo, la accesibilidad y la ubicación.");
            return;
        }
        // Prototipo local: no se transmiten ni guardan los datos.
        toast("Reporte preparado (prototipo): no se ha enviado a ningún servidor.");
        $("reporte-formulario").reset();
        $("preview-evid").innerHTML = "";
        window.setTimeout(() => backToMap(true), 900);
    });
})();
