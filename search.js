document.addEventListener("DOMContentLoaded", async function () {
    if (window.location.protocol !== "file:") {
        try {
            const r = await fetch("/api/anime");
            if (r.ok) window.animeList = await r.json();
        } catch (e) {}
    }
    const animeList = window.animeList || [];
    const gridEl = document.getElementById("search-grid");
    const emptyEl = document.getElementById("search-empty");
    const resultCountEl = document.getElementById("result-count");
    const searchInput = document.getElementById("search-query");

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function loadWatchlist() {
        try {
            var raw = localStorage.getItem("anime-plus-watchlist");
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveWatchlist(list) {
        localStorage.setItem("anime-plus-watchlist", JSON.stringify(list));
    }

    var watchlist = loadWatchlist();

    function getCurrentUser() {
        try {
            return localStorage.getItem("anime-plus-user") || null;
        } catch (e) {
            return null;
        }
    }

    function buildCard(item) {
        var inWatchlist = watchlist.includes(item.title);
        var genresLabel = item.genre.replace(/,/g, " · ");

        var card = document.createElement("article");
        card.className = "card";
        if (item.href) card.classList.add("card-clickable");

        var poster = document.createElement("div");
        poster.className = "card-poster";
        poster.style.backgroundImage = "url(\"" + item.img + "\")";

        var content = document.createElement("div");
        content.className = "card-content";
        var titleEl = document.createElement("h3");
        titleEl.className = "card-title";
        titleEl.textContent = item.title;
        var metaEl = document.createElement("p");
        metaEl.className = "card-meta";
        metaEl.textContent = genresLabel + " · " + item.year;
        var descEl = document.createElement("p");
        descEl.className = "card-desc";
        descEl.textContent = item.description;
        content.appendChild(titleEl);
        content.appendChild(metaEl);
        content.appendChild(descEl);

        var footer = document.createElement("div");
        footer.className = "card-footer";
        var tag = document.createElement("span");
        tag.className = "card-tag";
        tag.textContent = (item.type || "TV") + " · " + (item.episodes ? item.episodes + " eps" : "–");
        footer.appendChild(tag);
        if (getCurrentUser()) {
            var watchBtn = document.createElement("button");
            watchBtn.type = "button";
            watchBtn.className = "card-watch";
            watchBtn.textContent = inWatchlist ? "In watchlist" : "Add to watchlist";
            if (inWatchlist) watchBtn.classList.add("in-watchlist");
            watchBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var user = getCurrentUser();
                if (!user) {
                    window.location.href = "login.html";
                    return;
                }
                if (watchlist.includes(item.title)) {
                    watchlist = watchlist.filter(function (t) { return t !== item.title; });
                } else {
                    watchlist.push(item.title);
                }
                saveWatchlist(watchlist);
                render();
            });
            footer.appendChild(watchBtn);
        }

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
        var q = getQuery();
        if (searchInput) searchInput.value = q;

        gridEl.innerHTML = "";
        if (!q) {
            if (emptyEl) {
                emptyEl.textContent = "Enter a search term above.";
                emptyEl.hidden = false;
            }
            if (resultCountEl) resultCountEl.textContent = "0";
            return;
        }

        var lower = q.toLowerCase();
        var filtered = animeList.filter(function (item) {
            return item.title.toLowerCase().indexOf(lower) !== -1 ||
                item.genre.toLowerCase().indexOf(lower) !== -1 ||
                (item.description && item.description.toLowerCase().indexOf(lower) !== -1);
        });

        if (filtered.length === 0) {
            if (emptyEl) {
                emptyEl.textContent = "No results for \"" + q + "\". Try different keywords.";
                emptyEl.hidden = false;
            }
            if (resultCountEl) resultCountEl.textContent = "0";
            return;
        }

        if (emptyEl) emptyEl.hidden = true;
        if (resultCountEl) resultCountEl.textContent = String(filtered.length);
        filtered.forEach(function (item) {
            gridEl.appendChild(buildCard(item));
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            var base = window.location.pathname;
            var newUrl = base + (searchInput.value ? "?q=" + encodeURIComponent(searchInput.value) : "");
            window.history.replaceState({}, "", newUrl);
            render();
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
