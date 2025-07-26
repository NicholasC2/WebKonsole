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

## Usage

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container);
```

---

## Built-in Commands

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
}};
```

---

## Styling

You can override default styles:

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container, null, {
  color: "lime",
  backgroundColor: "black",
  fontFamily: "monospace",
  padding: "5px"
}};
```

---

## Credits

Created by NicholasC  
ASCII Art from: https://patorjk.com/software/taag/
