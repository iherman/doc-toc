# Table of Content (ToC) script

Adding a ToC to a `<nav>` element that has the DPUB ARIA `@role` attribute set to `doc-toc`.

There are two ways to extract the ToC entries: either using the HTML header elements (i.e., `<h1>`, `<h2>`,…,`<h6>`), or use `<section>` element with an included header. The former is the default; the latter can be chosen by setting a specific attribute (see below).

## Alternatives for sectioning

### Using the header elements

This means simply using the hierarchy of the `<h1>`, `<h2>`,…,`<h6>` elements. If the HTML content includes a `<main>` element, then only the header included in it are used.

Note that the 'top level' ToC entry is decided by the _first_ header element, regardless of whether it is a `<h1>`,  `<h2>`, etc. Also, if a, say, `<h2>` is followed by an `<h4>`, then this is simply considered as the "next" entry in the hierarchy, i.e., no "intermediate" hierarchy will be included. In other words, only the relative values of `x` in `<hx>` are used.

The `@id` is set for all headers (unless there is one, which is reused) to create the relative links. By default, the section numbers are automatically added to the header texts and the corresponding ToC link texts (this can be controlled, see below). Also by default, the ToC uses the maximum depth of sections; this can also be set to a lower number. Finally, individual headers can be removed from the ToC by setting their `@data-notoc` attribute.

### Using sections

The table of content is collected from `<section>` elements with an immediate heading element (if there are several, the first one is used). Ie, the expected structure is

```html
<section>
    <h2>header 1</h2>
    …
</section>
<section>
    <h2>header 2</h2>
    <section>
        <h3>header 2.1</h3>
        …
    </section>
</section>
```

The sections are collected from within a `<main>` element, if any, or from `<body>` otherwise. Section elements without a header are disregarded. The exact header element (e.g., `<h2>` or `<h3>`) is not relevant, only the structure counts.

The `@id` is set for all sections (unless there is one, which is reused) to create the relative links. By default, the section numbers are automatically added to the header texts and the corresponding ToC link texts (this can be controlled, see below). Also by default, the ToC uses the maximum depth of sections; this can also be set to a lower number. Finally, individual sections can be removed from the ToC hierarchy by setting their `@data-notoc` attribute.

## Usage in HTML

Place the following reference to the script and the `<nav>` element into the HTML file:

```html
<html>
<head>
    …
    <script src="js/doc-toc.js"></script>
    …
</head>
<body>
    …
    <nav role='doc-toc'></nav>
    …
</body>
</html>
```

If the overall title of the document is not to be added to the ToC, either the `@data-notoc` attribute can  be used on the title, or the following structure can be used:

```html
<html>
<head>
    …
    <script src="js/doc-toc.js"></script>
    …
</head>
<body>
    <header>
        <h1>Title of the document</h1>

        …
        <nav role='doc-toc'></nav>
    </header>
    <main>
        …
    </main>
</body>
</html>
```

The ToC itself is added to the `<nav>` content in the form of a `<ul>`; hierarchical ToC entries use nested `<ul>`. The type and some details of the ToC can be controlled using `@data-options` attribute on the `<nav>` element; the value of the attribute is a space separated list of values, which can be as follows:

- `use_sections`: by default, the list of HTML header elements are used to collect the ToC. If this attribute is set, a hierarchy of section elements with headers control the ToC.
- `prefix=value`: the prefix used for setting the `@id` attribute for the sections. The full `@id` is set to `value_x.y.z`, where `x.y.z` is the numbering in the ToC hierarchy. Default value is “section”.
- `suppress_counters`: do not add the counter values to the section heading and the ToC entries. Default is to set the counter.
- `max_depth`: the maximum depth for the ToC. If set to 0 (or negative), the full hierarchy is used; if a positive number, that sets the maximum value for the hierarchy. Default is 0.
- `dynamic`: an extra interaction is added to the ToC entries: if the ToC entry has sub-entries, the counter value part (which is always enclosed in a `<span>` element, see below) gets an extra `tocvisible` class. Furthermore, that element also reacts on pointer click events to alternate between `tocvisible` and `tochidden`. CSS can then be used to, e.g., reveal/hide that sub-hierarchy (see [`css/doc-toc.css`](css/doc-toc.css) as an example). Default is not to add dynamic features. (Note that if this value is set, that implies the existence of the counter, i.e., the  possible  `suppress_counter` option value is ignored.)

For example, a dynamic ToC, with depth maximized to 5, and acting on sections can be set by:

```html
<nav role='doc-toc' data-options='dynamic max_depth=5 use_sections'></nav>
```

## Customization possibilities

A number of class attributes are added to the ToC entries that can be used for CSS customization. These are:

- The class for each `<ul>` is set to  `toc` and `toclevelX`, with 'X' set to 1, 2, ... depending on the depth of the hierarchy.
- Each link element in the ToC gets the `tocitem` class.
- The counter value (if used) is always enclosed in a `<span>` element with the class set to `tocnumber`.
- In case the dynamic features are used, the `<span>` element holding the counter value has also the class `tocvisible` (by default) or `tochidden` (as a result of user interaction).

Furthermore, the headers, respectively the `<section>` elements, in the HTML source can use the following attributes:

- `@data-notoc`: if set, that header/section is ignored for the purpose of a ToC
- `@data-tochidden`: if set, and the dynamic features are also used, the default for this hierarchy is to set the `tochidden` class value on the counter, instead of the default `tocvisible`.

The [`css/doc-toc.css`](css/doc-toc.css) provides examples for customization.
