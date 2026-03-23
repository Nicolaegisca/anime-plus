document.addEventListener("DOMContentLoaded", function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navCenter = document.querySelector(".nav-center");
    if (navToggle && navCenter) {
        navToggle.addEventListener("click", function () {
            navCenter.classList.toggle("open");
            var open = navCenter.classList.contains("open");
            navToggle.setAttribute("aria-expanded", String(open));
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 720) {
                navCenter.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    var logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("click", function () {
            try {
                sessionStorage.removeItem("anime-plus-current-page");
            } catch (e) { }
        });
    }
});

