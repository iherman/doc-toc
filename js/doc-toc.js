/**
 * Customized built-in element, extending the `<nav>` element, for the generation of a
 * table of content (ToC). The table of content is collected from `<section>` elements
 * that have a heading element (if there are several, the first one is taken).
 *
 * See the separate README.md for details.
 *
 */

/* eslint-env browser */

/**
 * Generate a ToC structure for the current document.
 *
 * @param {HTMLElement} target The element that will hold the TOC entries.
 * @param {Boolean} generate_counter Whether the section header and the toc entries should be automatically numbered.
 * @param {String} id_prefix The string used to generate id values for sections (to be used as targets
 * from the ToC links) unless there is one in the element.
 * @param {Integer} max_depth The maximum depth of the hierarchy into the TOC. 0 or negative means no limit.
 * @param {Boolean} dynamic whether the ToC should be dynamic or not
 */
function getToc(target, generate_counter, id_prefix, max_depth, dynamic) {
    /**
     * Event handler: switch between the 'tocvisible' and 'tochidden' classnames
     *
     * @param {Event} e
     */
    const change_visibility = (e) => {
        const className = e.target.className.split(' ');
        const newClassName = className.map((c) => {
            switch (c) {
                case 'tocvisible': return 'tochidden';
                case 'tochidden': return 'tocvisible';
                default: return c;
            }
        }).join(' ');
        // alert(newClassName);
        e.target.className = newClassName;
    };

    /**
     * Display the numbering values in the form of '1.2.3.4'
     *
     * @param {Array} prefix array of numbers representing the number values from the parent. Maybe empty
     * @param {Number} last number of the last value
     */
    const getHeaderNumber = (prefix, last) => {
        if (prefix.length === 0) {
            return last.toString();
        } else {
            return `${prefix.map((n) => n.toString()).join('.')}.${last.toString()}`;
        }
    };

    /**
     * The core of the procedure: goes through the immediate `<section>` children of the `current` layer
     * (i.e., the top level `<body>` or `<main>`), gets the header, gets or, possibly, sets the `id`
     * attribute, and generate the corresponding `<li><span>number</span> <a href="#id">header</a></li>`.
     * All these are collected into a `<ul>` appended to the `toc_target`.
     *
     * There is a recursive call after the creation of the `<li>` to see if the current `<section>`
     * has subsections to expand the current `<li>` if necessary.
     *
     * @param {HTMLElement} toc_target where to put the generated TOC
     * @param {HTMLElement} current where to look for suitable sections
     * @param {Array} counters counters of the parent ToC entries, to be used as
     * counters for the sections and ToC entries
     * @returns {Array} array of ToC structures, to be converted into HTML
     */

    /**
     * Get hold of the data structure that will be used for the creation of the TOC; this is the case
     * when the structure is extracted from `<section>` elements.
     *
     * The core of the procedure: goes through the immediate `<section>` children of the `current` layer
     * (i.e., the top level `<body>` or `<main>`), gets the header, gets or, possibly, sets the `id`
     * attribute, and generate data structure of the form:
     *
     * * `href`      : the `@id` value of the target, to be used for the link
     * * `name`      : the text of the header, to be used in as the link text in the toc
     * * `counter`   : the counter value for the TOC, to be used, if requested, in the TOC
     * * `tochidden` : whether the `@data-tochidden` attribute is set for the header
     * * `children`  : the possible children structures as an array. This is a recursive call.
     *
     * The `@id` attribute is added to the section element itself (if needed) and the text
     * is modified with the counter number, if requested.
     *
     * @param {HTMLElement} current where to look for suitable sections
     * @param {Array} counters counters of the parent ToC entries, to be used as
     *   counters for the sections and ToC entries
     * @returns {Array} array of ToC structures
     */
    const getTocFromSections = (current, counters) => {
        // See if we have reached the maximum depth; if so, no more toc
        if (max_depth > 0 && counters.length + 1 > max_depth) return [];

        /** 'num' is the number variable for the toc entries (on one level); added to the values in `current` */
        let num = 0;

        /**
         * The array of structures for the TOC entries
         */
        const toc = [];

        // note the selector that takes care of the notoc attribute!
        current.querySelectorAll('section:not([data-notoc])').forEach((section) => {
            // Only a direct child counts...
            if (section.parentElement !== current) return;

            // getting the first header-like element in the section
            const header = section.querySelector('h1, h2, h3, h4, h5, h6');

            // if there is no such header, or it is not a direct child, then break the cycle,
            // i.e., this section is ignored for the ToC
            if (header === undefined || header.parentElement !== section) return;

            // Calculate the full counter value for numbering
            num += 1;
            const header_number = getHeaderNumber(counters, num);

            // Get the 'id' for the section
            let id = section.id;
            // if no id is set on the section, add one
            if (id === '') {
                id = `${id_prefix}_${header_number}`;
                section.id = id;
            }

            // Get the link text; possibly modify the original with the counter value (if requested)
            let text = header.textContent;
            if (generate_counter) {
                header.textContent = `${header_number}. ${text}`;
                text = ` ${text}`;
            }

            const toc_structure = {
                href      : id,
                name      : text,
                counter   : header_number,
                tochidden : section.hasAttribute('data-tochidden'),
                children  : getTocFromSections(section, counters.concat([num]))
            };

            // Add the new entry to the list of ToC links.
            toc.push(toc_structure);
        });

        return toc;
    };

    /**
     * Generate the TOC, using the toc structure. It generates a hierarchy of `<ul>` elements, putting
     * the (possible) into a separate `<span>`. In case of a dynamic menu, the latter get specific
     * class names (see general description) and is target to a click even to change that class name.
     *
     * The function is recursive, insofar as the children ToC hierarchy leads to a recursive call to create
     * the corresponding embedded `<ul>`.
     *
     * @param {HTMLElement} toc_target where to put the generated TOC
     * @returns {Array} array of ToC structures, to be converted into HTML
     */
    const generate_toc = (toc_target, toc_structure) => {
        if (toc_structure.length === 0) return;
        const ul = document.createElement('ul');
        toc_target.append(ul);
        toc_structure.forEach((toc_entry) => {
            // This is the rough structure, to be greatly refined!!!!!
            const li = document.createElement('li');
            const a = document.createElement('a');
            const span = document.createElement('span');

            // If the counter option is set, the number is used for a 'span'
            if (generate_counter) {
                span.className = 'tocnumber';
                span.textContent = `${toc_entry.counter}.`;
                li.append(span);
            }

            a.setAttribute('href', toc_entry.href);
            a.textContent = toc_entry.name;
            li.append(a);

            // see if there are children; if so,
            // a recursion takes place, but the dynamic
            // structure is also generated
            if (toc_entry.children.length > 0) {
                generate_toc(li, toc_entry.children);
                if (dynamic) {
                    // note that if the dynamic flag is set, it implies the display of counters
                    span.className = toc_entry.tochidden ? 'tocnumber tochidden' : 'tocnumber tocvisible';
                    span.addEventListener('click', change_visibility);
                }
            }
            ul.append(li);
        });
    };

    // The top level to look for the headers is either the body element or, if it exists, the (first) main element.
    const body = document.querySelector('body');
    if (body === undefined) return;
    const start = body.querySelector('main') || body;

    const full_toc = getTocFromSections(start, []);
    // console.log(JSON.stringify(full_toc, null, 4));
    generate_toc(target, full_toc);
}


class DocToc extends HTMLElement {
    constructor() {
        super();
        this._id_prefix = 'section';
        this._generate_counter = true;
        this._max_depth = 0;
        this._dynamic = false;
        this._nav = undefined;
    }

    static get observedAttributes() { return ['prefix', 'suppress_counter', 'max_depth', 'dynamic']; }

    connectedCallback() {
        if (!this._nav) {
            // a `nav` element is added as the top level element for the ToC
            this._nav = document.createElement('nav');
            this._nav.setAttribute('role', 'doc-toc');
            this.append(this._nav);
        }
        if (this.hasAttribute('prefix')) {
            this._id_prefix = this.getAttribute('prefix');
        }
        this._generate_counter = !this.hasAttribute('suppress_counter');
        if (this.hasAttribute('dynamic')) {
            this._generate_counter = true;
            this._dynamic = true;
        }
        if (this.hasAttribute('max_depth')) {
            const n = Number(this.getAttribute('max_depth'));
            this._max_depth = Number.isInteger(n) ? n : 0;
        }

        // Generate the table of content structure into this element
        // I am not sure it is necessary to make the main processing and event handler,
        // but it is certainly more safe...
        window.addEventListener('load', () => {
            getToc(this._nav, this._generate_counter, this._id_prefix, this._max_depth, this._dynamic);
        });
    }
}
customElements.define('doc-toc', DocToc);
