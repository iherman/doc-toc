# Table of Content (TOC) script

Customized built-in element, extending the `<nav>` element, for the generation of a table of content (ToC). The table of content is collected from `<section>` elements with a heading element (if there are several, the first one is taken). Ie, the expected structure is

```
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

The `id` is set for all sections (unless there is one, that is reused) to create the relative links. By default, the section numbers are automatically added to the header texts and the corresponding ToC links; this can be suppressed. Also by default, the ToC uses the maximum depth of sections; this can also be set to a lower number. Finally, individual sections can be removed from the ToC hierarchy by setting their `data-notoc` attribute.

## Usage

Place the following reference to the javascript and the (custom) element into the HTML file:

```
<html>
<head>
    …
    <script src="js/doc-toc.js"></script>
    …
</head>
<body>
    …
    <nav is='doc-toc'>
        Any text or HTML content here
    </nav>
    …
</body>
</html>
```


The ToC is _appended_ to the `<nav>` content in the form of a `<ul>`; hierarchical ToC entries use nested `<ul>`. The class of each `<ul>` is set to `toc toclevelX`, with 'X' set to 1, 2, ... depending on the depth of the hierarchy. The ARIA `role` attribute of the `<nav>` element is set to (or extended with) `doc-toc`.

The following attributes can be set on the `<nav>` element:

- `prefix=value`: the prefix used for setting the `id` attribute for the sections. The full `id` is set to `value_x.y.z`, where `x.y.z` is the numbering in the ToC hierarchy. Default value is `section`.
- `suppress_counter`: do not add the counter numbers to the section heading and the ToC entries. Default is to set the counter.
- `max_depth`: the maximum depth for the ToC. If set to 0 (or negative), the full hierarchy is used; if a positive number, that sets the maximum value for the hierarchy. Default is 0. 
