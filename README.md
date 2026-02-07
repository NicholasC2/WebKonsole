![ezgif-36570c961dfe7213](https://github.com/user-attachments/assets/0389116b-ecae-41d6-8682-f0110a12b551)

# WebKonsole

WebKonsole is a lightweight, extensible console, designed to fit perfectly into any project. It supports custom commands, custom scripts, and dynamic variable injection, all in a slick terminal UI, designed for scalablilty and ease-of-use.

## Live Demo

Try it here: https://nicholasc2.github.io/WebKonsole/

## Usage

```js
const container = document.getElementById("terminal");
const konsole = new Konsole(container);
```

## Built-in Commands

`echo` - Prints text to the console.  
`clear` - Clears the terminal screen.  
`wait` - Waits for a given number of milliseconds.  
`help` - Lists available commands.  
`ver` - Displays version info.  
`nl` - Prints a blank line.  
`vars` - Lists all variables.  
`about` - Displays Konsole info.  
`set` - Sets a variable for use in commands.  
`run` - Runs a ".js" script.  

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
