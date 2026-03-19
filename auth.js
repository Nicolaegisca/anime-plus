document.addEventListener("DOMContentLoaded", function () {
    var savedTheme = "dark";
    try {
        savedTheme = localStorage.getItem("anime-plus-theme") || "dark";
    } catch (e) { }
    var isLightInit = savedTheme === "light";
    document.body.classList.toggle("light-mode", isLightInit);
    document.documentElement.setAttribute("data-theme", isLightInit ? "light" : "dark");

    var stored = null;
    try {
        stored = localStorage.getItem("anime-plus-user") || null;
    } catch (e) {
        stored = null;
    }
    var username = stored || null;
    var watchlistLinks = document.querySelectorAll(
        '.nav a[href="watchlist.html"], .nav a[href="../watchlist.html"]'
    );
    for (var w = 0; w < watchlistLinks.length; w++) {
        watchlistLinks[w].style.display = username ? "" : "none";
    }
    var menu = document.querySelector(".user-menu");
    var toggle = document.querySelector(".user-toggle");
    var panel = document.querySelector(".user-dropdown");
    if (!menu || !toggle || !panel) return;
    var path = window.location.pathname || "";
    var prefix = /\/anime\//.test(path) ? "../" : "";

    function esc(s) {
        return String(s || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/"/g, "&quot;");
    }

    function themeRowHtml() {
        return (
            '<div class="user-dropdown-divider"></div>' +
            '<button type="button" class="user-dropdown-theme" data-theme-toggle aria-label="Toggle light or dark mode">' +
            '<i class="fas fa-sun user-dropdown-theme-icon" aria-hidden="true"></i>' +
            '<span class="user-dropdown-theme-label">Light mode</span></button>'
        );
    }

    function updateThemeRow(btn) {
        if (!btn) return;
        var isLight = document.body.classList.contains("light-mode");
        var icon = btn.querySelector(".user-dropdown-theme-icon");
        var label = btn.querySelector(".user-dropdown-theme-label");
        if (icon) {
            icon.classList.remove("fa-moon", "fa-sun");
            icon.classList.add(isLight ? "fa-moon" : "fa-sun");
        }
        if (label) {
            label.textContent = isLight ? "Dark mode" : "Light mode";
        }
    }

    function wireThemeToggle() {
        var themeBtn = panel.querySelector("[data-theme-toggle]");
        if (!themeBtn) return;
        updateThemeRow(themeBtn);
        themeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            var isLight = document.body.classList.toggle("light-mode");
            document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
            try {
                localStorage.setItem("anime-plus-theme", isLight ? "light" : "dark");
            } catch (e2) { }
            updateThemeRow(themeBtn);
        });
    }

    function setToggleGuest() {
        toggle.innerHTML =
            '<span class="user-toggle-avatar" aria-hidden="true"><i class="fas fa-user"></i></span>' +
            '<span class="user-toggle-label">Account</span>' +
            '<i class="fas fa-caret-down user-toggle-caret" aria-hidden="true"></i>';
    }

    function setToggleUser(first) {
        toggle.innerHTML =
            '<span class="user-toggle-avatar">' + esc(first) + "</span>" +
            '<span class="user-toggle-label">Account</span>' +
            '<i class="fas fa-caret-down user-toggle-caret" aria-hidden="true"></i>';
    }

    if (!username) {
        setToggleGuest();
        panel.innerHTML =
            '<div class="user-dropdown-header">' +
            '<span class="user-dropdown-avatar user-dropdown-avatar-guest" aria-hidden="true"><i class="fas fa-user"></i></span>' +
            '<div class="user-dropdown-info">' +
            '<span class="user-dropdown-name">Guest</span>' +
            '<span class="user-dropdown-sub">Log in for watchlist</span>' +
            "</div></div>" +
            '<div class="user-dropdown-divider"></div>' +
            '<a class="user-dropdown-item" href="' +
            prefix +
            'login.html"><i class="fas fa-sign-in-alt"></i> Login</a>' +
            '<a class="user-dropdown-item" href="' +
            prefix +
            'register.html"><i class="fas fa-user-plus"></i> Register</a>' +
            themeRowHtml();
        wireThemeToggle();
        return;
    }

    var first = username.charAt(0).toUpperCase();
    setToggleUser(first);
    panel.innerHTML =
        '<div class="user-dropdown-header">' +
        '<span class="user-dropdown-avatar">' +
        esc(first) +
        "</span>" +
        '<div class="user-dropdown-info">' +
        '<span class="user-dropdown-name">' +
        esc(username) +
        "</span></div></div>" +
        '<div class="user-dropdown-divider"></div>' +
        '<a class="user-dropdown-item" href="' +
        prefix +
        'watchlist.html"><i class="fas fa-heart"></i> Watchlist</a>' +
        themeRowHtml() +
        '<div class="user-dropdown-divider"></div>' +
        '<a class="user-dropdown-item user-dropdown-logout" href="#" data-logout="1"><i class="fas fa-sign-out-alt"></i> Logout</a>';
    wireThemeToggle();
    var logoutLink = panel.querySelector("[data-logout]");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            try {
                localStorage.removeItem("anime-plus-user");
            } catch (e2) { }
            window.location.reload();
        });
    }
});
