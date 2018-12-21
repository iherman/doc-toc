# Table of Content (TOC) script

Customized built-in element for the generation of a table of content (ToC). The table of content is collected from `<section>` elements with an immediate heading element (if there are several, the first one is used). Ie, the expected structure is

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

The `id` is set for all sections (unless there is one, which is reused) to create the relative links. By default, the section numbers are automatically added to the header texts and the corresponding ToC links (this can be controlled, see below). Also by default, the ToC uses the maximum depth of sections; this can also be set to a lower number. Finally, individual sections can be removed from the ToC hierarchy by setting their `data-notoc` attribute.

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
    <doc-toc>
        Any text or HTML content here
    </doc-toc>
    …
</body>
</html>
```

A `<nav>` element is _appended_ to the custom element, with its `role` attribute set to `doc-toc`. The ToC itself is appended to this `<nav>` content in the form of a `<ul>`; hierarchical ToC entries use nested `<ul>`. 

The following attributes can be set on the `<doc-toc>` element:

- `prefix=value`: the prefix used for setting the `id` attribute for the sections. The full `id` is set to `value_x.y.z`, where `x.y.z` is the numbering in the ToC hierarchy. Default value is `section`.
- `suppress_counter`: do not add the counter values to the section heading and the ToC entries. Default is to set the counter.
- `max_depth`: the maximum depth for the ToC. If set to 0 (or negative), the full hierarchy is used; if a positive number, that sets the maximum value for the hierarchy. Default is 0.
- `dynamic`: an extra interaction is added to the ToC entries: if the ToC entry has sub-entries, the section value part (which is always enclosed in a `<span>` element) gets an extra `tocvisible` class. Furthermore, that element also reacts on pointer click events to alternate between that class name and `tochidden`. CSS can then be used to, e.g., reveal/hide that sub-hierarchy (see `css/doc-toc.css` as an example). Default is not to add dynamic features. (Note that if this value is set, that implies the existence of the counter, i.e., the value of `suppress_counter` is ignored.)

## Customization possibilities

A number of class attributes are added to the ToC entries that can be used for CSS customization. These are:

- The ARIA `role` attribute of the `<nav>` element is set to `doc-toc`.
- The class for each `<ul>` is set to  `toc toclevelX`, with 'X' set to 1, 2, ... depending on the depth of the hierarchy.
- Each link element in the ToC get the `tocitem` class.
- The counter value (if used) is always enclosed in a `<span>` element with the class set to `tocnumber`.
- In case the dynamic features are used, the `<span>` element holding the counter value has also the class `tocvisible` (by default) or `tochidden` (as a result of user interaction).

Furthermore the `<section>` elements in the original texts can use the following attributes:

- `data-notoc`: if set, that section is ignored for the purpose of a ToC
- `data-tochidden`: if set, and the dynamic features are also used, the default for this hierarchy is to set the `tochidden` class value on the counter, instead of the default `tocvisible`.

The `css/doc-toc.css` provides some simple examples for customization.
