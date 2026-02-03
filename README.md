![Recording 2025-07-26 204158](https://github.com/user-attachments/assets/6f5cefc1-ab97-4e89-8969-11edd19b4c7e)

# Konsole – Browser Terminal Emulator

Konsole is a lightweight, extensible console designed to fit perfectly into any project.  
It supports custom commands, and dynamic variable injection - all in a slick terminal UI, designed for scalablilty and ease-of-use.

## Live Demo

Try it here: https://nicholasc2.github.io/WebKonsole/

## Usage

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container);
```

## Built-in Commands

`echo` or `print` - Prints text to the console  
`clear` or `cls` - Clears the terminal screen  
`wait` or `delay` - Waits for a given number of milliseconds  
`help` or `?` - Lists available commands  
`version` or `ver` - Displays version info  
`nl`, `newline` or `br` - Prints a blank line  
`vars` or `variables` - Lists all variables  
`about` - Shows Konsole info  
`set` or `setvar` - Sets a variable for use in commands  

## Variable Replacement

Variables wrapped in curly braces will be dynamically replaced, for example
`echo {branch}`
will be replaced with
`echo stable`

Colors formatted like this:
`<c:#HEX>COLORED TEXT</c>`
will be replaced with the COLORED TEXT colored with the color defined in HEX.

Variables are defined like this:

```js
const container = document.getElementById("terminal");

const konsole = new Konsole(container, {
    variables: {
        "hello": "world"
    }
}};
```

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

## Credits

Created by NicholasC  
ASCII Art from: https://patorjk.com/software/taag/
