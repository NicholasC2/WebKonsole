![Recording 2025-07-26 204158](https://github.com/user-attachments/assets/6f5cefc1-ab97-4e89-8969-11edd19b4c7e)

# Konsole – Browser Console

Konsole is a lightweight, extensible console, designed to fit perfectly into any project. It supports custom commands, custom scripts, and dynamic variable injection, all in a slick terminal UI, designed for scalablilty and ease-of-use.

## Live Demo

Try it here: https://nicholasc2.github.io/WebKonsole/

## Usage

```js
const container = document.getElementById("terminal");
const konsole = new Konsole(container);
```

## Built-in Commands

`echo`  - Prints text to the console.  
`clear` - Clears the terminal screen.  
`wait`  - Waits for a given number of milliseconds.  
`help`  - Lists available commands.  
`ver`   - Displays version info.  
`nl`    - Prints a blank line.  
`vars`  - Lists all variables.  
`about` - Displays Konsole info.  
`set`   - Sets a variable for use in commands.  
`run`   - Runs a ".ks" script.  

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
`<c:COLOR>COLORED TEXT</c>`
will be replaced with the COLORED TEXT colored with the color defined in COLOR using standard css color tags.

## Scripts

An example script can be found in `scripts/`

## Credits

Created by NicholasC  
ASCII Art from: https://patorjk.com/software/taag/