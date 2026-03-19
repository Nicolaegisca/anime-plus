document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector(".auth-form");
    var errorEl = document.querySelector(".auth-error");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var u = document.getElementById("username");
            var p = document.getElementById("password");
            var username = (u && u.value) ? u.value.trim() : "";
            var password = (p && p.value) ? p.value.trim() : "";
            var error = "";
            if (!username || !password) {
                error = "Username and password are required.";
            } else if (password.length < 6) {
                error = "Password must be at least 6 characters.";
            }
            if (error) {
                if (errorEl) {
                    errorEl.textContent = error;
                    errorEl.hidden = false;
                }
                return;
            }
            try {
                localStorage.setItem("anime-plus-user", username);
            } catch (e2) {}
            window.location.href = "index.html";
        });
    }
});

