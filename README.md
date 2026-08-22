# WebKonsole

WebKonsole is a lightweight, extensible console, designed to fit perfectly into any project. It supports custom commands, and custom scripts, designed for ease-of-use.

Try it here: https://nicholasc2.github.io/WebKonsole/

## Usage

```js
const container = document.getElementById("terminal");
const konsole = new Konsole(container);
```

## Variable Replacement

Variables wrapped in curly braces will be dynamically replaced, for example
`echo {branch}`
will be replaced with
`echo stable`

Variables are defined like this:

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container, {
    variables: {
        "hello": "world"
    }
});
```

## Colors

Colors formatted like
`{c:COLOR}COLORED TEXT{/c}`
will be replaced with the COLORED TEXT colored with the color defined in COLOR using standard css colors.
