
/* ==========================================
   NAVEGAÇÃO
========================================== */

const globalNavbar = document.querySelector(".navbar");
const localNav = document.querySelector(".pega-local-nav");

function updateNavigationOffsets() {

    const globalHeight = globalNavbar
        ? Math.ceil(globalNavbar.getBoundingClientRect().height)
        : 0;

    const localHeight = localNav
        ? Math.ceil(localNav.getBoundingClientRect().height)
        : 0;

    document.documentElement.style.setProperty(
        "--pega-global-nav-height",
        `${globalHeight}px`
    );

    document.documentElement.style.setProperty(
        "--pega-local-nav-height",
        `${localHeight}px`
    );
}

updateNavigationOffsets();

if (window.ResizeObserver) {

    const navigationObserver = new ResizeObserver(
        updateNavigationOffsets
    );

    if (globalNavbar) {
        navigationObserver.observe(globalNavbar);
    }

    if (localNav) {
        navigationObserver.observe(localNav);
    }
}


/* ==========================================
   MAPA INTERATIVO DEMONSTRATIVO
========================================== */

function initPegaDemoMap() {

    const component = document.querySelector(".pega-demo-map");

    if (!component) return;

    const container = component.querySelector(
        ".pega-demo-map-container"
    );

    const status = component.querySelector(
        ".pega-demo-map-status"
    );

    const controls = component.querySelector(
        ".pega-demo-map-controls"
    );

    const resetButton = component.querySelector(
        "[data-map-reset]"
    );

    const expandButton = component.querySelector(
        "[data-map-expand]"
    );

    const legend = component.querySelector(
        ".pega-demo-map-legend"
    );

    if (!container || !status) return;

    if (container.classList.contains("leaflet-container")) {
        return;
    }

    const leaflet = window.L;
    const { translate, onChange } = siteLanguage;

    if (!leaflet) {

        const showUnavailable = () => {
            status.textContent = translate("Não foi possível carregar o mapa interativo.");
        };
        showUnavailable();
        onChange(showUnavailable);

        return;
    }


    /* ==========================================
       CONFIGURAÇÕES
    ========================================== */

    const bounds = leaflet.latLngBounds(
        [-34, -74],
        [6, -28]
    );

    const plasma = [
        "#0d0887",
        "#7e03a8",
        "#cc4778",
        "#f89540",
        "#f0f921"
    ];

    const gramsFormatter = () => new Intl.NumberFormat(siteLanguage.locale, {
        maximumFractionDigits: 0
    });

    const fullscreenClass = "pega-demo-map-fullscreen";

    const parent = component.parentElement;

    let previousOverflow = "";

    let mapMessage = "Carregando mapa-base...";

    let dataMessage = "Carregando dados demonstrativos...";


    /* ==========================================
       INICIALIZAÇÃO DO MAPA
    ========================================== */

    const map = leaflet.map(container, {

        zoomControl: false,

        scrollWheelZoom: false,

        touchZoom: true,

        doubleClickZoom: true,

        dragging: true,

        preferCanvas: true,

        zoomSnap: 0.25,

        minZoom: 2,

        maxZoom: 12

    });


    /* ==========================================
       STATUS
    ========================================== */

    function updateStatus() {

        status.textContent = [
            mapMessage,
            dataMessage
        ].filter(Boolean).map(translate).join(" ");

        status.hidden = !status.textContent;
    }


    /* ==========================================
       MAPA-BASE
    ========================================== */

    const tiles = leaflet.tileLayer(

        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

            referrerPolicy: "strict-origin-when-cross-origin",

            maxZoom: 19
        }

    );

    tiles.on("tileload", () => {

        mapMessage = "";

        updateStatus();

    });

    tiles.on("tileerror", () => {

        mapMessage = "Mapa-base temporariamente indisponível.";

        updateStatus();

    });

    tiles.addTo(map);


    /* ==========================================
       RESTAURAR VISUALIZAÇÃO
    ========================================== */

    function resetView() {

        map.closePopup();

        map.fitBounds(bounds, {

            padding: [12, 12],

            animate: false

        });

    }

    resetView();

    if (controls) {
        controls.hidden = false;
    }

    resetButton?.addEventListener("click", resetView);


    /* ==========================================
       GERADOR DETERMINÍSTICO

       Mantém os mesmos dados demonstrativos
       sempre que a página for atualizada.
    ========================================== */

    let seed = 20261126;

    function random() {

        seed = (
            Math.imul(1664525, seed) + 1013904223
        ) >>> 0;

        return seed / 4294967296;
    }


    /* ==========================================
       DISTRIBUIÇÃO GEOGRÁFICA

       Centros e amplitudes aproximadas das UFs.

       Nome, latitude, longitude,
       amplitude latitude, amplitude longitude.
    ========================================== */

    const states = [

        ["Acre", -9.1, -70.4, 1.0, 1.7],

        ["Alagoas", -9.6, -36.6, 0.35, 0.55],

        ["Amapá", 1.3, -51.9, 1.1, 0.7],

        ["Amazonas", -4.1, -63.8, 3.0, 4.5],

        ["Bahia", -12.4, -41.7, 2.8, 2.2],

        ["Ceará", -5.3, -39.6, 1.4, 0.9],

        ["Distrito Federal", -15.8, -47.9, 0.12, 0.15],

        ["Espírito Santo", -19.6, -40.6, 0.8, 0.35],

        ["Goiás", -16.0, -49.5, 2.0, 1.8],

        ["Maranhão", -5.1, -45.3, 2.1, 1.4],

        ["Mato Grosso", -12.8, -55.8, 3.0, 3.0],

        ["Mato Grosso do Sul", -20.5, -54.7, 2.2, 1.8],

        ["Minas Gerais", -18.5, -44.6, 2.7, 2.8],

        ["Pará", -4.0, -52.8, 3.0, 3.5],

        ["Paraíba", -7.2, -36.7, 0.5, 1.0],

        ["Paraná", -24.7, -51.6, 1.2, 1.7],

        ["Pernambuco", -8.3, -38.2, 0.55, 1.7],

        ["Piauí", -7.5, -42.8, 2.1, 1.0],

        ["Rio de Janeiro", -22.2, -43.2, 0.4, 0.8],

        ["Rio Grande do Norte", -5.8, -36.5, 0.45, 0.8],

        ["Rio Grande do Sul", -29.6, -53.5, 1.6, 1.9],

        ["Rondônia", -10.8, -62.8, 1.4, 1.2],

        ["Roraima", 2.1, -61.2, 1.5, 1.0],

        ["Santa Catarina", -27.2, -50.5, 0.7, 1.5],

        ["São Paulo", -22.1, -48.5, 1.4, 2.2],

        ["Sergipe", -10.6, -37.3, 0.35, 0.35],

        ["Tocantins", -10.3, -48.3, 2.4, 0.9]

    ];


    /* ==========================================
       GERAR 505 REGISTROS FICTÍCIOS
    ========================================== */

    function generateDemoRecords() {

        const records = [];

        const total = 505;

        const base = Math.floor(total / states.length);

        const remainder = total % states.length;

        let id = 1;

        states.forEach((state, index) => {

            const [
                name,
                centerLat,
                centerLng,
                spreadLat,
                spreadLng
            ] = state;

            const quantity = base + (
                index < remainder ? 1 : 0
            );

            for (let i = 0; i < quantity; i++) {

                const latitude = centerLat +
                    (random() * 2 - 1) * spreadLat;

                const longitude = centerLng +
                    (random() * 2 - 1) * spreadLng;

                const grams = Math.round(
                    1000 + random() * 99000
                );

                records.push({

                    id: "DEMO-" + String(id).padStart(3, "0"),

                    state: name,

                    latitude,

                    longitude,

                    grams,

                    fuel: "Biomassa",

                    pollutant: "BC"

                });

                id++;
            }

        });

        return records;
    }


    /* ==========================================
       PALETA PLASMA
    ========================================== */

    function interpolatePlasma(ratio) {

        ratio = Math.max(0, Math.min(1, ratio));

        const position = ratio * (plasma.length - 1);

        const index = Math.min(

            Math.floor(position),

            plasma.length - 2

        );

        const fraction = position - index;

        const channels = [1, 3, 5].map(start => {

            const low = parseInt(

                plasma[index].slice(start, start + 2),

                16

            );

            const high = parseInt(

                plasma[index + 1].slice(start, start + 2),

                16

            );

            return Math.round(
                low + (high - low) * fraction
            );

        });

        return `rgb(${channels.join(", ")})`;

    }


    /* ==========================================
       POPUP DOS MARCADORES
    ========================================== */

    function buildPopup(record) {

        const popup = document.createElement("div");

        popup.className = "pega-demo-map-popup";

        const title = document.createElement("strong");

        title.textContent = record.id;

        popup.appendChild(title);

        const information = [

            translate("Combustível: Biomassa"),

            translate("Poluente: BC"),

            translate("Emissão simulada:") + " " +
                gramsFormatter().format(record.grams) + " g",

            translate("Dado fictício demonstrativo")

        ];

        information.forEach(text => {

            const paragraph = document.createElement("p");

            paragraph.textContent = text;

            popup.appendChild(paragraph);

        });

        return popup;
    }


    /* ==========================================
       RENDERIZAÇÃO DOS MARCADORES
    ========================================== */

    let activePopup;

    function translatePopupButton() {
        const button = activePopup?.getElement()?.querySelector(".leaflet-popup-close-button");
        button?.setAttribute("aria-label", translate("Fechar janela do mapa"));
    }

    map.on("popupopen", ({ popup }) => {
        activePopup = popup;
        translatePopupButton();
    });

    map.on("popupclose", () => {
        activePopup = null;
    });

    onChange(() => {
        updateStatus();
        activePopup?.update();
        translatePopupButton();
    });

    function renderRecords(records) {

        if (!records.length) return;

        const values = records.map(
            record => record.grams
        );

        const min = Math.min(...values);

        const max = Math.max(...values);

        const markers = records.map(record => {

            const ratio = max === min
                ? 0.5
                : (record.grams - min) / (max - min);

            return leaflet.circleMarker(

                [
                    record.latitude,
                    record.longitude
                ],

                {

                    radius: 3,

                    weight: 0.5,

                    color: "#b5c4cc",

                    opacity: 0.7,

                    fillColor: interpolatePlasma(ratio),

                    fillOpacity: 0.95

                }

            ).bindPopup(() => buildPopup(record));

        });

        leaflet.layerGroup(markers).addTo(map);


        /* LEGENDA */

        if (legend) {

            const gradient = legend.querySelector(
                ".pega-demo-map-gradient"
            );

            const minLabel = legend.querySelector(
                "[data-map-min]"
            );

            const maxLabel = legend.querySelector(
                "[data-map-max]"
            );

            if (gradient) {

                gradient.style.background =
                    `linear-gradient(90deg, ${plasma.join(", ")})`;

            }

            function updateLegendLabels() {
                const format = gramsFormatter();
                if (minLabel) minLabel.textContent = format.format(min);
                if (maxLabel) maxLabel.textContent = format.format(max);
            }

            updateLegendLabels();
            onChange(updateLegendLabels);

            legend.hidden = false;

        }

    }


    /* ==========================================
       CARREGAMENTO DOS DADOS

       Sem fetch.
       Sem upload.
       Sem backend.
    ========================================== */

    try {

        const records = generateDemoRecords();

        renderRecords(records);

        dataMessage = "";

    } catch (error) {

        dataMessage =
            "Não foi possível carregar os dados demonstrativos.";

        console.error(error);

    }

    updateStatus();


    /* ==========================================
       ZOOM COM A RODINHA DO MOUSE
    ========================================== */

    container.addEventListener("pointerdown", event => {

        if (

            event.pointerType === "mouse" &&

            event.button === 0

        ) {

            map.scrollWheelZoom.enable();

        }

    });

    container.addEventListener("pointerleave", () => {

        if (!isExpanded()) {

            map.scrollWheelZoom.disable();

        }

    });


    /* ==========================================
       TELA INTEIRA
    ========================================== */

    function isExpanded() {

        return (

            document.fullscreenElement === component ||

            component.classList.contains(fullscreenClass)

        );

    }

    onChange(refreshFullscreen);

    function refreshFullscreen() {

        const expanded = isExpanded();

        const label = translate(expanded ? "Sair da tela inteira" : "Tela inteira");

        if (expandButton) {

            expandButton.title = label;

            expandButton.setAttribute(
                "aria-label",
                label
            );

            expandButton.setAttribute(
                "aria-pressed",
                String(expanded)
            );

            const icon = expandButton.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-expand",
                    !expanded
                );

                icon.classList.toggle(
                    "fa-compress",
                    expanded
                );

            }

        }

        if (expanded) {

            map.scrollWheelZoom.enable();

        } else {

            map.scrollWheelZoom.disable();

        }

        requestAnimationFrame(() => {

            map.invalidateSize({
                pan: false
            });

        });

    }


    /* ==========================================
       ALTERNATIVA DE TELA INTEIRA POR CSS
    ========================================== */

    function exitCssFullscreen() {

        component.classList.remove(fullscreenClass);

        parent.appendChild(component);

        parent.style.minHeight = "";

        document.body.style.overflow = previousOverflow;

        refreshFullscreen();

        expandButton?.focus({
            preventScroll: true
        });

    }

    expandButton?.addEventListener("click", async () => {

        if (document.fullscreenElement === component) {

            await document.exitFullscreen();

            return;

        }

        if (component.classList.contains(fullscreenClass)) {

            exitCssFullscreen();

            return;

        }

        try {

            await component.requestFullscreen();

        } catch {

            parent.style.minHeight =
                component.offsetHeight + "px";

            previousOverflow =
                document.body.style.overflow;

            document.body.style.overflow = "hidden";

            document.body.appendChild(component);

            component.classList.add(fullscreenClass);

            refreshFullscreen();

        }

    });


    /* ==========================================
       EVENTOS DE TELA INTEIRA
    ========================================== */

    document.addEventListener(

        "fullscreenchange",

        refreshFullscreen

    );

    document.addEventListener("keydown", event => {

        if (

            event.key === "Escape" &&

            component.classList.contains(fullscreenClass)

        ) {

            exitCssFullscreen();

        }

    });


    /* ==========================================
       RESPONSIVIDADE
    ========================================== */

    if (window.ResizeObserver) {

        const mapObserver = new ResizeObserver(() => {

            map.invalidateSize({

                pan: false

            });

        });

        mapObserver.observe(container);

    }

}


/* ==========================================
   EXECUTAR MAPA
========================================== */

function startPegaDemoMap() {

    try {

        initPegaDemoMap();

    } catch (error) {

        console.error(
            "Erro ao inicializar o mapa PEGA:",
            error
        );

        const mapStatus = document.querySelector(
            ".pega-demo-map-status"
        );

        if (mapStatus) {

            const showError = () => {
                mapStatus.textContent = siteLanguage.translate("Não foi possível inicializar o mapa demonstrativo.");
            };
            showError();
            siteLanguage.onChange(showError);

        }

    }

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        startPegaDemoMap
    );

} else {

    startPegaDemoMap();

}

(() => {
    const section = document.getElementById("funcionamento");
    const flow = section?.querySelector(".pega-flow");
    if (!flow) return;

    const grid = flow.querySelector(".pega-flow-grid");
    const steps = Array.from(grid.children);
    const svg = flow.querySelector(".pega-flow-track");
    const gradient = svg.querySelector("linearGradient");
    const path = svg.querySelector(".pega-flow-path");
    const particleGroup = svg.querySelector(".pega-flow-particles");
    const particles = Array.from(particleGroup.children);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");

    let pathLength = 0;
    let distance = 0;
    let previousTime = null;
    let frame = null;
    let inView = !window.IntersectionObserver;

    function animateParticles(time) {
        const elapsed = previousTime === null ? 0 : time - previousTime;
        distance = (distance + elapsed * 0.13) % pathLength;
        previousTime = time;

        particles.forEach((particle, index) => {
            const offset = index * pathLength / particles.length;
            const point = path.getPointAtLength((distance + offset) % pathLength);
            particle.setAttribute("cx", point.x);
            particle.setAttribute("cy", point.y);
        });
        particleGroup.setAttribute("visibility", "visible");
        frame = requestAnimationFrame(animateParticles);
    }

    function syncAnimation() {
        section.classList.toggle("pega-flow-in-view", inView && !document.hidden);
        if (inView && !document.hidden && !motion.matches && pathLength > 0) {
            if (frame === null) frame = requestAnimationFrame(animateParticles);
            return;
        }
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = null;
        particleGroup.setAttribute("visibility", "hidden");
    }

    function updatePath() {
        const origin = flow.getBoundingClientRect();
        if (!origin.width || !origin.height) return;

        const columns = Number(getComputedStyle(grid).getPropertyValue("--pega-flow-columns"));
        const centers = steps.map((step) => {
            const box = step.getBoundingClientRect();
            return { x: box.left - origin.left + box.width / 2, y: box.top - origin.top + box.height / 2 };
        });

        const [first, ...remaining] = centers;
        const commands = [`M ${first.x} ${first.y}`];

        remaining.forEach((point, index) => {
            const previous = centers[index];
            const row = Math.floor(index / columns);
            const startsNewRow = (index + 1) % columns === 0;
            if (columns > 1 && startsNewRow) {
                const direction = row % 2 === 0 ? 1 : -1;
                const bend = Math.min(72, (point.y - previous.y) / 3) * direction;
                commands.push(`C ${previous.x + bend} ${previous.y}, ${point.x + bend} ${point.y}, ${point.x} ${point.y}`);
            } else {
                commands.push(`L ${point.x} ${point.y}`);
            }
        });

        svg.setAttribute("viewBox", `0 0 ${origin.width} ${origin.height}`);
        gradient.setAttribute("x2", origin.width);
        gradient.setAttribute("y2", origin.height);
        path.setAttribute("d", commands.join(" "));
        pathLength = path.getTotalLength();
        syncAnimation();
    }

    if (window.ResizeObserver) {
        const layoutObserver = new ResizeObserver(updatePath);
        layoutObserver.observe(flow);
        steps.forEach((step) => layoutObserver.observe(step));
    }
    window.addEventListener("resize", updatePath);
    document.addEventListener("visibilitychange", syncAnimation);
    motion.addEventListener("change", syncAnimation);

    if (window.IntersectionObserver) {
        const sectionObserver = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            syncAnimation();
        });
        sectionObserver.observe(flow);

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                cardObserver.unobserve(target);
                if (!motion.matches && target.firstElementChild.animate) {
                    target.firstElementChild.animate(
                        [{ opacity: 0.4, translate: "0 8px" }, { opacity: 1, translate: "0 0" }],
                        { duration: 380, delay: (steps.indexOf(target) % 5) * 35, easing: "ease-out" }
                    );
                }
            });
        }, { threshold: 0.15 });
        steps.forEach((step) => cardObserver.observe(step));
    }

    updatePath();
})();

(() => {
    const docs = document.getElementById("documentacao");
    if (!docs) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const groups = [...docs.querySelectorAll("[data-doc-tabs]")].map((group) => {
        const nav = group.querySelector("nav");
        const links = [...nav.querySelectorAll("a")];
        const panels = links.map((link) => document.getElementById(link.hash.slice(1)));
        const picker = group.querySelector(".doc-picker");
        const select = picker?.querySelector("select");
        const reading = group.querySelector(":scope > .doc-reading");
        let active = -1;

        if (panels.some((panel) => !panel)) return null;

        function selectPanel(index, animate = false) {
            if (active === index) return;
            active = index;
            links.forEach((link, tabIndex) => {
                const selected = tabIndex === index;
                link.setAttribute("aria-selected", String(selected));
                link.tabIndex = selected ? 0 : -1;
                panels[tabIndex].hidden = !selected;
            });
            if (select) select.selectedIndex = index;
            if (reading) reading.scrollTop = 0;

            if (animate && !motion.matches) {
                panels[index].animate?.(
                    [{ opacity: .5, transform: "translateY(5px)" }, { opacity: 1, transform: "translateY(0)" }],
                    { duration: 180, easing: "ease-out" }
                );
            }
        }

        function navigate(index, updateUrl = true) {
            selectPanel(index, true);
            if (updateUrl && location.hash !== links[index].hash) {
                try {
                    history.pushState(null, "", links[index].hash);
                } catch {
                    // The panel is already selected, including in restricted local previews.
                }
            }
        }

        nav.setAttribute("role", "tablist");
        nav.setAttribute("aria-orientation", select ? "vertical" : "horizontal");
        links.forEach((link, index) => {
            const panel = panels[index];
            link.id = panel.id + "-tab";
            link.setAttribute("role", "tab");
            link.setAttribute("aria-controls", panel.id);
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", link.id);
            panel.tabIndex = 0;

            link.addEventListener("click", (event) => {
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                navigate(index);
            });

            link.addEventListener("keydown", (event) => {
                const previous = select ? "ArrowUp" : "ArrowLeft";
                const next = select ? "ArrowDown" : "ArrowRight";
                const last = links.length - 1;
                const keys = {
                    [previous]: (index + last) % links.length,
                    [next]: (index + 1) % links.length,
                    Home: 0,
                    End: last
                };
                const target = keys[event.key];
                if (typeof target !== "number") return;
                event.preventDefault();
                navigate(target);
                links[target].focus();
            });

            if (select) {
                const option = document.createElement("option");
                option.value = panel.id;
                const updateOption = () => { option.textContent = link.lastChild.textContent.trim(); };
                updateOption();
                siteLanguage.onChange(updateOption);
                select.append(option);
            }
        });

        if (select) {
            select.addEventListener("change", () => navigate(select.selectedIndex));
            picker.hidden = false;
        }

        return { group, panels, selectPanel };
    }).filter(Boolean);

    function selectFromHash() {
        const target = document.getElementById(location.hash.slice(1));
        for (const { panels, selectPanel } of groups) {
            const index = panels.findIndex((panel) => target && panel.contains(target));
            if (index >= 0) selectPanel(index);
            else if (!target) selectPanel(0);
        }
    }

    groups.forEach(({ group, selectPanel }) => {
        selectPanel(0);
        group.classList.add("doc-enhanced");
    });
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    window.addEventListener("popstate", selectFromHash);


    const layout = docs.querySelector(".doc-layout");
    const sidebar = layout.querySelector(".doc-sidebar");

    function syncReadingHeight() {
        const height = sidebar.getBoundingClientRect().height;
        if (height > 0) layout.style.setProperty("--doc-sidebar-height", height + "px");
    }

    syncReadingHeight();
    if (typeof ResizeObserver === "function") {
        const observer = new ResizeObserver(syncReadingHeight);
        observer.observe(sidebar);
    } else {
        window.addEventListener("resize", syncReadingHeight);
    }

    const imageDialog = docs.querySelector(".doc-image-dialog");
    const dialogTitle = imageDialog.querySelector("h3");
    const dialogImage = imageDialog.querySelector("img");
    let lastPreview;

    imageDialog.addEventListener("click", (event) => {
        if (event.target === imageDialog) imageDialog.close();
    });

    imageDialog.addEventListener("close", () => {
        dialogImage.removeAttribute("src");
        lastPreview?.focus({ preventScroll: true });
    });

    const loadedImages = new Map();

    function loadResultImage(figure) {
        // Keep unpublished image paths in the markup without requesting them.
        if (figure.hasAttribute("data-doc-image-pending")) return Promise.resolve(false);

        const path = figure.dataset.docImage;
        if (!loadedImages.has(path)) {
            loadedImages.set(path, new Promise((resolve) => {
                const image = new Image();
                image.onload = () => resolve(image.naturalWidth > 0);
                image.onerror = () => resolve(false);
                image.src = path;
            }));
        }
        return loadedImages.get(path);
    }

    function showResult(figure) {
        const preview = figure.querySelector(".doc-result-preview");
        const image = preview.querySelector("img");
        const placeholder = figure.querySelector(".doc-result-placeholder");
        image.src = figure.dataset.docImage;
        if (placeholder) placeholder.hidden = true;
        figure.hidden = false;
        preview.hidden = false;

        preview.addEventListener("click", () => {
            if (typeof imageDialog.showModal !== "function") {
                window.open(image.src, "_blank", "noopener,noreferrer");
                return;
            }
            lastPreview = preview;
            dialogTitle.textContent = figure.querySelector("h5").textContent;
            dialogImage.alt = image.alt;
            dialogImage.src = image.src;
            imageDialog.showModal();
        });
    }

    function loadSingleResult(figure) {
        return loadResultImage(figure).then((available) => {
            if (available) showResult(figure);
            return available;
        });
    }

    docs.querySelectorAll("[data-doc-profile]").forEach(async (profile) => {
        const individual = [...profile.querySelectorAll('[data-doc-image-kind="individual"]')];
        const available = await Promise.all(individual.map(loadResultImage));
        if (!available.every(Boolean)) {
            const combined = profile.querySelector('[data-doc-image-kind="combined"]');
            if (await loadSingleResult(combined)) {
                individual.forEach((figure) => { figure.hidden = true; });
                return;
            }
        }
        individual.forEach((figure, index) => {
            if (available[index]) showResult(figure);
        });
    });

    docs.querySelectorAll("[data-doc-image]:not([data-doc-image-kind])").forEach(loadSingleResult);
    const reports = docs.querySelector(".doc-report-results");
    reports.querySelectorAll("[data-doc-image]").forEach(async (figure) => {
        if (await loadSingleResult(figure)) reports.hidden = false;
    });

    const directoryTree = docs.querySelector(".doc-tree code");
    const originalTree = directoryTree.textContent;

    function updateDirectoryTree() {
        const highlighted = directoryTree.hasAttribute("data-highlighted");
        directoryTree.textContent = originalTree.replace(
            /(# )([^\n]+)/g,
            (_, prefix, comment) => prefix + siteLanguage.translate(comment)
        );
        if (highlighted && window.hljs) {
            delete directoryTree.dataset.highlighted;
            window.hljs.highlightElement(directoryTree);
        }
    }

    updateDirectoryTree();
    siteLanguage.onChange(updateDirectoryTree);

    const calculator = docs.querySelector(".doc-calculator");
    const fields = calculator.querySelector(".doc-inputs");
    const inputs = [...fields.querySelectorAll("input")];
    const output = calculator.querySelector("output");

    function updateEstimate() {
        const [activity, factor] = inputs.map((input) => input.valueAsNumber);
        const grams = activity * factor;
        if (inputs.some((input) => !input.validity.valid) || !Number.isFinite(grams)) {
            output.value = siteLanguage.translate("Informe valores não negativos com um resultado finito.");
            return;
        }

        const format = new Intl.NumberFormat(siteLanguage.locale, { maximumSignificantDigits: 10 });
        output.value = [[grams, "g"], [grams / 1000, "kg"], [grams / 1000000, "t"]]
            .map(([value, unit]) => format.format(value) + " " + unit)
            .join(" · ");
    }

    updateEstimate();
    siteLanguage.onChange(updateEstimate);
    fields.hidden = false;
    fields.addEventListener("input", updateEstimate);
})();
