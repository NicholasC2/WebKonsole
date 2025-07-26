
# Konsole – Browser Terminal Emulator

Konsole is a **lightweight, extensible terminal emulator** designed to run directly in your browser.  
It supports custom commands, ANSI-style behavior, and dynamic variable injection — all in a slick retro terminal UI.

---

## Features

- Built with JavaScript
- Register your own commands easily
- Command history with up/down arrow support
- Dynamic variable replacement (e.g., `{version}`)
- Works in any modern browser
- Retro-themed styling and blinking cursor

---

## Usage

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container, {
    initCommand: "echo Welcome to Konsole!\nversion",
    prefix: "$ ",
    variables: {
        version: "1.1.3",
        branch: "stable"
    }
});
