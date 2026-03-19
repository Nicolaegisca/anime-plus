document.addEventListener("DOMContentLoaded", async function () {
    if (window.location.protocol !== "file:") {
        try {
            const r = await fetch("/api/anime");
            if (r.ok) window.animeList = await r.json();
        } catch (e) {}
    }
    const animeList = window.animeList || [];
    const gridEl = document.getElementById("watchlist-grid");
    const emptyEl = document.getElementById("watchlist-empty");

    function loadWatchlist() {
        try {
            const raw = localStorage.getItem("anime-plus-watchlist");
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveWatchlist(list) {
        localStorage.setItem("anime-plus-watchlist", JSON.stringify(list));
    }

    let watchlist = loadWatchlist();

    function getCurrentUser() {
        try {
            return localStorage.getItem("anime-plus-user") || null;
        } catch (e) {
            return null;
        }
    }

    function buildCard(item) {
        const inWatchlist = watchlist.includes(item.title);
        const genresLabel = item.genre.replace(/,/g, " · ");

        const card = document.createElement("article");
        card.className = "card";
        if (item.href) card.classList.add("card-clickable");

        const poster = document.createElement("div");
        poster.className = "card-poster";
        poster.style.backgroundImage = "url(\"" + item.img + "\")";

        const content = document.createElement("div");
        content.className = "card-content";
        const titleEl = document.createElement("h3");
        titleEl.className = "card-title";
        titleEl.textContent = item.title;
        const metaEl = document.createElement("p");
        metaEl.className = "card-meta";
        metaEl.textContent = genresLabel + " · " + item.year;
        const descEl = document.createElement("p");
        descEl.className = "card-desc";
        descEl.textContent = item.description;
        content.appendChild(titleEl);
        content.appendChild(metaEl);
        content.appendChild(descEl);

        const footer = document.createElement("div");
        footer.className = "card-footer";
        const tag = document.createElement("span");
        tag.className = "card-tag";
        tag.textContent = (item.type || "TV") + " · " + (item.episodes ? item.episodes + " eps" : "–");
        const watchBtn = document.createElement("button");
        watchBtn.type = "button";
        watchBtn.className = "card-watch";
        watchBtn.textContent = inWatchlist ? "In watchlist" : "Add to watchlist";
        if (inWatchlist) watchBtn.classList.add("in-watchlist");
        watchBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (watchlist.includes(item.title)) {
                watchlist = watchlist.filter(function (t) { return t !== item.title; });
            } else {
                watchlist.push(item.title);
            }
            saveWatchlist(watchlist);
            render();
        });
        footer.appendChild(tag);
        footer.appendChild(watchBtn);

        card.appendChild(poster);
        card.appendChild(content);
        card.appendChild(footer);

        if (item.href) {
            card.style.cursor = "pointer";
            card.addEventListener("click", function (event) {
                if (event.target.closest(".card-watch")) return;
                window.location.href = item.href;
            });
        }
        return card;
    }

    function render() {
        if (!gridEl) return;
        gridEl.innerHTML = "";
        var user = getCurrentUser();
        if (!user) {
            if (emptyEl) {
                emptyEl.textContent = "Login to use your watchlist.";
                emptyEl.hidden = false;
            }
            return;
        }
        const items = animeList.filter(function (item) { return watchlist.includes(item.title); });
        if (items.length === 0) {
            if (emptyEl) emptyEl.hidden = false;
            return;
        }
        if (emptyEl) emptyEl.hidden = true;
        items.forEach(function (item) {
            gridEl.appendChild(buildCard(item));
        });
    }

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

    render();
});
