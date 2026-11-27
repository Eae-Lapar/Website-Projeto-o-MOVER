(() => {
    const storageKey = "o3-mover-language";
    const english = window.pageTranslations;
    const switcher = document.querySelector(".language-switcher");
    const buttons = [...switcher.querySelectorAll("button")];
    const bindings = [];
    let language = readPreference();

    function readPreference(fallback = "pt-BR") {
        try {
            return localStorage.getItem(storageKey) === "en" ? "en" : "pt-BR";
        } catch {
            return fallback;
        }
    }

    const normalize = (value) => value.trim().replace(/\s+/g, " ");
    const translate = (value) =>
        language === "en" && Object.hasOwn(english, normalize(value))
            ? english[normalize(value)]
            : value;

    function bind(value, write) {
        const key = normalize(value);
        if (Object.hasOwn(english, key)) {
            bindings.push(() => write(
                language === "en" ? value.replace(value.trim(), () => english[key]) : value
            ));
        }
    }

    function register(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => node.parentElement.closest("script, style, noscript")
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT
        });
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const override = node.parentElement.dataset.en;
            if (override === undefined) {
                bind(node.data, (value) => { node.data = value; });
            } else {
                const original = node.data;
                bindings.push(() => { node.data = language === "en" ? override : original; });
            }
        }

        const attributes = ["alt", "title", "aria-label", "placeholder"];
        root.querySelectorAll(attributes.map((name) => `[${name}]`).join(",")).forEach((element) => {
            attributes.forEach((name) => {
                if (element.hasAttribute(name)) {
                    bind(element.getAttribute(name), (value) => element.setAttribute(name, value));
                }
            });
        });
        root.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')
            .forEach((meta) => bind(meta.content, (value) => { meta.content = value; }));
    }

    function apply() {
        document.documentElement.lang = language;
        switcher.setAttribute("aria-label", language === "en" ? "Page language" : "Idioma da página");
        buttons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.lang === language));
        });
        bindings.forEach((update) => update());
    }

    function changeLanguage(nextLanguage) {
        if (language === nextLanguage) return;
        language = nextLanguage;
        apply();
        document.dispatchEvent(new Event("site-language-change"));
    }

    window.siteLanguage = {
        get locale() { return language; },
        translate,
        register(root) {
            const first = bindings.length;
            register(root);
            bindings.slice(first).forEach((update) => update());
        },
        onChange(callback) {
            document.addEventListener("site-language-change", callback);
        }
    };

    register(document);
    apply();

    buttons.forEach((button) => button.addEventListener("click", () => {
        if (language === button.lang) return;
        try {
            localStorage.setItem(storageKey, button.lang);
        } catch {
            // The current page can still be translated.
        }
        changeLanguage(button.lang);
    }));

    window.addEventListener("pageshow", () => changeLanguage(readPreference(language)));
    window.addEventListener("storage", (event) => {
        if (event.key === storageKey || event.key === null) {
            changeLanguage(readPreference(language));
        }
    });
})();
