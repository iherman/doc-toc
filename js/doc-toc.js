/**
 * Customized built-in element, extending the `<nav>` element, for the generation of a table of content (ToC). The table of content
 * is collected from `<section>` elements that have a heading element (if there are several, the first one is taken). 
 * 
 * See the separate README.md for details
 * 
 */
class DocToc extends HTMLElement {
    constructor() {
        super();
        this._id_prefix = 'section';
        this._generate_counter = true; 
        this._max_depth = 0;
        this._nav = undefined;
    }

    static get observedAttributes() { return ['role', 'prefix', 'suppress_counter', 'max_depth'] }

    connectedCallback() {
        if (!this._nav) {
            // a `nav` element is added as the top level element for the ToC
            this._nav = document.createElement('nav');
            this._nav.setAttribute('role','doc-toc');
            this.append(this._nav);
        }
        if (this.hasAttribute('prefix')) {
            this._id_prefix = this.getAttribute('prefix')
        }
        if (this.hasAttribute('suppress_counter')) {
            this._generate_counter = false;
        }
        if (this.hasAttribute('max_depth')) {
            const n = Number(this.getAttribute('max_depth'));
            this._max_depth = Number.isInteger(n) ? n : 0;
        }
        getToc(this._nav, this._generate_counter, this._id_prefix, this._max_depth)
    }
}

customElements.define("doc-toc", DocToc);


/**
 * Generate a ToC structure for the current document.
 * 
 * @param {HTMLElement} target The element that will hold the TOC entries
 * @param {Boolean} generate_counter Whether the section header and the toc entries should be automatically numbered.
 * @param {String} id_prefix The string used to generate id values for sections (to be used as targets from the ToC links) unless there is one in the element.
 * @param {Integer} max_depth The maximum depth of the hierarchy into the TOC. 0 or negative means no limit.
 * @returns {Array} array of ToC structures, to be converted into HTML 
 */
function getToc(target, generate_counter, id_prefix, max_depth) {
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
            return `${prefix.map((n) => n.toString()).join(".")}.${last.toString()}`
        }
    }

    /**
     * 
     * TODO:
     * - control on what the _ should be with a default (this may have to be made in the web component script)
     * - control over the depth of sections to be displayed in the ToC
     * 
     * @param {HTMLElement} toc_target where to put the generated TOC 
     * @param {HTMLElement} current where to look for suitable sections 
     * @param {Array} counters counters of the parent ToC entries, to be used as counters for the sections and ToC entries
     * @param {Boolean} count whether counters should be added to the ToC entries and the text
     * @returns {Array} array of ToC structures, to be converted into HTML 
     */
    const getTocObject = (toc_target, current, counters, count) => {
        /** The list containing the toc entries */
        const ul = document.createElement('ul')
        ul.setAttribute('class',`toc toclevel${counters.length+1}`);

        // See if we have reached the maximum depth; if so, no more toc
        if (max_depth > 0 && counters.length+1 > max_depth) return;

        /** 'num' is the number variable for the toc entries (on one level)  */
        let num = 0;
        /**
         * The 'li' elements for the toc entries are first collected before being added to their parent,
         * and added to the 'ul' element only when they are all collected.
         * This means that no 'ul' elements are added in case there is no valid toc entry 
         */
        const toc = [];

        // note the selector that takes care of the notoc attribute!
        current.querySelectorAll('section:not([data-notoc])').forEach((section) => {
            // Only a direct child counts
            if (section.parentElement !== current) return;

            // getting the first header-like element in the section
            const header = section.querySelector('h1,h2,h3,h4,h5,h6');

            // if there is no such header, or it is not a direct child, then break the cycle
            if (header === undefined || header.parentElement !== section) return;

            // Get the 'id' for the section
            let id = section.id;

            // Calculate the numbering
            const header_number = getHeaderNumber(counters, ++num)

            // if no id is set on the section, add one
            if (id === "") {
                id = `${id_prefix}_${header_number}`;
                section.id = id;
            }

            // Get the link text, and modify it
            let text = '';
            if (count) {
                text = `${header_number}. ${header.textContent}`;
                header.textContent = text;
            } else {
                text = header.textContent
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.setAttribute('href', `#${id}`);
            a.textContent = text;
            li.append(a);

            // The recursive step is here: if necessary, the li element is extended to add a toc hierarchy
            getTocObject(li, section, counters.concat([num]), count);

            toc.push(li);
        });

        // if 'toc' is not empty, toc entries have been indeed generated, so we can construct the TOC
        if (toc.length > 0) {
            toc.forEach((entry) => ul.append(entry));
            toc_target.append(ul);
        }
    }

    // The top level is either the body element or, if there, the main element.
    const body = document.querySelector('body');
    if (body === undefined) return;
    const start = body.querySelector('main') || body;
    getTocObject(target, start, [], generate_counter)
}

