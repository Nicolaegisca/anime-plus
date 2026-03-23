document.addEventListener("DOMContentLoaded", async function () {
    if (window.location.protocol !== "file:") {
        try {
            const r = await fetch("/api/anime");
            if (r.ok) window.animeList = await r.json();
        } catch (e) { }
    }
    const animeList = window.animeList || [];

    const gridEl = document.getElementById("anime-grid");
    const emptyEl = document.getElementById("anime-empty");
    const resultCountEl = document.getElementById("result-count");
    const paginationEl = document.getElementById("pagination");

    const pageSizes = [12, 6];
    const PAGE_KEY = "anime-plus-current-page";

    let currentPage = 1;
    try {
        const savedPage = sessionStorage.getItem(PAGE_KEY);
        const savedNum = savedPage ? parseInt(savedPage, 10) : NaN;
        if (!isNaN(savedNum) && savedNum >= 1 && savedNum <= pageSizes.length) {
            currentPage = savedNum;
        }
    } catch (e) { }

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

    function getCurrentUser() {
        try {
            return localStorage.getItem("anime-plus-user") || null;
        } catch (e) {
            return null;
        }
    }

    let watchlist = loadWatchlist();

    function buildCard(item) {
        const inWatchlist = watchlist.includes(item.title);
        const genresLabel = item.genre.replace(/,/g, " · ");

        const card = document.createElement("article");
        card.className = "card";
        if (item.href) {
            card.classList.add("card-clickable");
        }

        const poster = document.createElement("div");
        poster.className = "card-poster";
        poster.style.backgroundImage = `url("${item.img}")`;

        const content = document.createElement("div");
        content.className = "card-content";

        const titleEl = document.createElement("h3");
        titleEl.className = "card-title";
        titleEl.textContent = item.title;

        const metaEl = document.createElement("p");
        metaEl.className = "card-meta";
        metaEl.textContent = `${genresLabel} · ${item.year}`;

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
        const typeLabel = item.type || "TV";
        const epsLabel = item.episodes ? `${item.episodes} eps` : "–";
        tag.textContent = `${typeLabel} · ${epsLabel}`;

        footer.appendChild(tag);
        if (getCurrentUser()) {
            const watchBtn = document.createElement("button");
            watchBtn.type = "button";
            watchBtn.className = "card-watch";
            if (inWatchlist) {
                watchBtn.classList.add("in-watchlist");
                watchBtn.textContent = "In watchlist";
            } else {
                watchBtn.textContent = "Add to watchlist";
            }
            watchBtn.addEventListener("click", function () {
                var user = getCurrentUser();
                if (!user) {
                    window.location.href = "login.html";
                    return;
                }
                if (watchlist.includes(item.title)) {
                    watchlist = watchlist.filter((t) => t !== item.title);
                } else {
                    watchlist.push(item.title);
                }
                saveWatchlist(watchlist);
                renderResults();
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
                try {
                    sessionStorage.setItem(PAGE_KEY, String(currentPage));
                } catch (e) { }
                window.location.href = item.href;
            });
        }

        return card;
    }

    function getPageSlice() {
        let start = 0;
        for (let i = 0; i < currentPage - 1 && i < pageSizes.length; i++) {
            start += pageSizes[i];
        }
        const size = pageSizes[currentPage - 1] != null ? pageSizes[currentPage - 1] : pageSizes[0];
        return animeList.slice(start, start + size);
    }

    function renderResults() {
        if (!gridEl) return;
        gridEl.innerHTML = "";
        if (animeList.length === 0) {
            emptyEl.hidden = false;
            if (resultCountEl) resultCountEl.textContent = "0";
            if (paginationEl) paginationEl.innerHTML = "";
            return;
        }
        emptyEl.hidden = true;
        const pageItems = getPageSlice();
        if (resultCountEl) resultCountEl.textContent = String(pageItems.length);
        pageItems.forEach((item) => {
            gridEl.appendChild(buildCard(item));
        });

        if (paginationEl) {
            const totalPages = pageSizes.length;
            paginationEl.innerHTML = "";
            for (let p = 1; p <= totalPages; p++) {
                const a = document.createElement("a");
                a.href = "#results";
                a.className = "pagination-link" + (p === currentPage ? " pagination-current" : "");
                a.textContent = String(p);
                a.addEventListener("click", function (e) {
                    e.preventDefault();
                    currentPage = p;
                    try {
                        sessionStorage.setItem(PAGE_KEY, String(currentPage));
                    } catch (e) { }
                    renderResults();
                    const results = document.getElementById("results");
                    if (results) results.scrollIntoView({ behavior: "smooth", block: "start" });
                });
                paginationEl.appendChild(a);
            }
        }
    }

    const navToggle = document.querySelector(".nav-toggle");
    const navCenter = document.querySelector(".nav-center");
    if (navToggle && navCenter) {
        navToggle.addEventListener("click", function () {
            navCenter.classList.toggle("open");
            const open = navCenter.classList.contains("open");
            navToggle.setAttribute("aria-expanded", String(open));
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 720) {
                navCenter.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    const logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("click", function () {
            try {
                sessionStorage.removeItem(PAGE_KEY);
            } catch (e) { }
            currentPage = 1;
        });
    }

    const startBtn = document.querySelector(".btn.btn-primary");
    if (startBtn) {
        startBtn.addEventListener("click", function (e) {
            if (startBtn.getAttribute("href") === "#results") {
                e.preventDefault();
                try {
                    sessionStorage.removeItem(PAGE_KEY);
                } catch (e) { }
                currentPage = 1;
                renderResults();
                const results = document.getElementById("results");
                if (results) results.scrollIntoView({ behavior: "smooth", block: "start" });
                return;
            }
        });
    }

    renderResults();
});
