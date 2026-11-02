(() => {
    const loginButton = document.getElementById("boton-sesion");
    const guestButton = document.getElementById("boton-invitado");

    loginButton.addEventListener("click", () => {
        window.location.href = "mapa.html?mode=user";
    });

    guestButton.addEventListener("click", () => {
        window.location.href = "mapa.html?mode=guest";
    });
})();
