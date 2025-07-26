```
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ##########
```

# Konsole – Browser Terminal Emulator

Konsole is a lightweight, extensible terminal emulator designed to run directly in your browser.  
It supports custom commands, ANSI-style behavior, and dynamic variable injection — all in a slick retro terminal UI.

---

## Live Demo

Try it here: https://nicholasc2.github.io/webkonsole

---

## Features

- Built with plain JavaScript
- Easily register custom commands
- History support (up and down arrow keys)
- Variable replacement using `{variable}`
- Works in any modern browser
- Retro-styled look with blinking cursor

---

## Usage

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container, {
    initCommand: "echo {welcome-message}",
    prefix: "$ ",
    variables: {
        "welcome-message": "Hello, World!\nWelcome to Konsole!"
    }
});
```

---

## Built-in Commands
-
`echo <text>`      - Prints text  
`clear` or `cls`      - Clears the terminal  
`wait <ms>`        - Pauses for X milliseconds  
`help`             - Lists available commands  
`version` or `ver`    - Shows version info  
`nl`               - Outputs a blank line  
`vars`             - Lists all variables  
`about`            - Shows credits and project info
`set` or `setvar`    - Sets a variable for use in commands
---

## Variable Replacement

Variables wrapped in curly braces will be dynamically replaced:

`echo {version}`

Defined like this:

```js
variables: {
    version: "1.1.3",
    branch: "stable"
}
```

---

## Styling

You can override default styles by passing a `style` object:

```js
style: {
  color: "lime",
  backgroundColor: "black",
  fontFamily: "monospace",
  padding: "5px"
}
```

---

## Credits

Created by NicholasC  
ASCII Art from: https://patorjk.com/software/taag/

---
