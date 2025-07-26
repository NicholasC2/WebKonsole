class Command {
    constructor(alias = [], shortDesc = "", longDesc = "", run = async () => "Need to add Run function") {
        this.alias = alias;
        this.shortDesc = shortDesc;
        this.longDesc = longDesc || shortDesc;
        this.run = run;
    }
}


const defaultStyle = {
    backgroundColor: "black",
    boxSizing: "border-box",
    color: "lime",
    cursor: "text",
    fontFamily: "monospace",
    height: "100%",
    overflowX: "auto",
    overflowY: "auto",
    padding: "5px",
    whiteSpace: "pre",
    width: "100%",
};

const defaultOptions = {
    initCommand: "echo {version_ascii}\nv{version}-{branch}",
    prefix: "$ ",
    variables: {
        version: "1.1.3",
        version_ascii: `\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ##########`,
        ascii_gen: "https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole",
        branch: "stable",
    },
    commands: [],
    defaultCommandsHandled: false,
};

const defaultCommands = [
    new Command(
        ["echo", "print"],
        "Prints text to the console.",
        "Usage: echo <text>\nPrints the provided text back to the screen.",
        async function (_, args) {
            if (args.length === 0) return "Usage: echo <text>";
            return args.join(" ");
        }
    ),

    new Command(
        ["clear", "cls"],
        "Clears the terminal screen.",
        "Usage: clear\nResets the console display and clears all previous output.",
        async function () {
            this.buffer = [this.options.prefix];
        }
    ),

    new Command(
        ["wait", "delay"],
        "Waits for a given number of milliseconds.",
        "Usage: wait <ms>\nPauses the terminal for a specific number of milliseconds. Useful for scripting delays.",
        async function (_, args) {
            const time = parseInt(args[0], 10);
            if (isNaN(time) || time < 0) return "Usage: wait <milliseconds>";
            await new Promise(res => setTimeout(res, time));
        }
    ),

    new Command(
        ["help", "?"], 
        "Lists available commands.",
        "Usage: help [command]\nWithout arguments, lists all available commands.\nUse `help <command>` for detailed info.",
        async function (_, args) {
            if (args.length > 0) {
                const cmd = this.options.commands.find(c => c.alias.includes(args[0]));
                return cmd ? `${cmd.alias.join(" | ")}\n${cmd.longDesc}` : `No such command: ${args[0]}`;
            }

            const lines = this.options.commands.map(cmd => {
                const aliases = cmd.alias.join(" | ");
                return `  ${aliases.padEnd(20)} - ${cmd.shortDesc}`;
            });

            return "Available Commands:\n" + lines.join("\n");
        }
    ),

    new Command(
        ["version", "ver"],
        "Displays version info.",
        "Usage: version\nShows current version, branch, and developer information.",
        async function () {
            return [
                "Konsole Info:",
                `  Version : {version}`,
                `  Branch  : {branch}`,
                `  Dev     : NicholasC`
            ].join("\n");
        }
    ),

    new Command(
        ["nl", "newline", "br"],
        "Prints a blank line.",
        "Usage: nl\nInserts a newline into the output.",
        async function () {
            return "\n";
        }
    ),

    new Command(
        ["vars", "variables"],
        "Shows available template variables.",
        "Usage: vars\nLists all available variables that can be used with curly braces (e.g., {version}).",
        async function () {
            const vars = Object.entries(this.options.variables);
            if (vars.length === 0) return "No variables defined.";
            
            return "Available Variables:\n" +
                vars.map(([k, v]) => `  ${k} = ${typeof v === "string" && v.includes("\n") ? `[${v.split("\n")[0]}...]` : v}`).join("\n");
        }
    ),

    new Command(
        ["about"],
        "Displays Konsole info.",
        "Usage: about\nShows Konsole's developer and ASCII art source.",
        async function () {
            return [
                "Konsole Emulator",
                "  Created by: NicholasC",
                "  Inspired by classic terminals.",
                "  ASCII Art Source: {ascii_gen}"
            ].join("\n");
        }
    ),

    new Command(
        ["set", "setvar"],
        "Sets a variable for use in commands.",
        "Usage: set <variable> <value>\nSets a variable that can be used in commands with curly braces (e.g., {variable}).",
        async function (_, args) {
            if (args.length < 2) return "Usage: set <variable> <value>";
            const [key, ...valueParts] = args;
            const value = valueParts.join(" ");
            this.options.variables[key] = value;
            return `Variable ${key} set to "${value}"`;
        }
    )
];

class Konsole {
    constructor(container, options = defaultOptions, style = {}) {
        this.container = container;
        this.buffer = [];
        this.cursorVisible = true;
        this.blinkTime = 0;
        this.history = [];
        this.historyIndex = 0;
        this.showFocus = false;
        this.command_running = false;

        this.style = Object.assign({}, defaultStyle, style);
        this.options = Object.assign({}, defaultOptions, options);
        Object.assign(this.container.style, this.style);

        if (!this.options.defaultCommandsHandled) {
            this.registerDefaultCommands();
        }

        this.setupInputHandler();
        this.startBlink();
        this.runCommand(this.options.initCommand);
    }

    registerDefaultCommands() {
        this.options.commands.push(...defaultCommands);
        this.options.defaultCommandsHandled = true;
    }

    startBlink() {
        setInterval(() => {
            this.blinkTime += 100;
            if (this.blinkTime >= 500) {
                this.cursorVisible = !this.cursorVisible;
                this.blinkTime = 0;
                this.update();
            }
        }, 100);
    }

    setupInputHandler() {
        this.container.setAttribute("tabindex", "0");

        this.container.addEventListener("keydown", async (e) => {
            if (this.command_running) return;

            e.preventDefault();
            this.resetCursorBlink();

            if (this.buffer.length === 0) this.buffer.push(this.options.prefix);

            const idx = this.buffer.length - 1;
            const line = this.buffer[idx];
            const input = line.slice(this.options.prefix.length);

            switch (e.key) {
                case "Enter":
                    if (input.trim()) {
                        if (this.history[0] !== input) this.history.unshift(input);
                        this.historyIndex = 0;
                    }
                    await this.runCommand(input);
                    break;

                case "Backspace":
                    this.handleBackspace(e, idx, line);
                    break;

                case "ArrowUp":
                    this.navigateHistory(-1, idx);
                    break;

                case "ArrowDown":
                    this.navigateHistory(1, idx);
                    break;

                default:
                    if (e.ctrlKey && e.key.toLowerCase() === "l") {
                        this.buffer = [this.options.prefix];
                    } else if (e.ctrlKey && e.key.toLowerCase() === "v") {
                        const text = await navigator.clipboard.readText();
                        this.buffer[idx] += text;
                    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                        this.buffer[idx] += e.key;
                    }
                    break;
            }

            this.scrollToBottom();
            this.update();
        });

        this.container.addEventListener("focus", () => {
            this.showFocus = true;
            this.resetCursorBlink();
            this.update();
        });

        this.container.addEventListener("blur", () => {
            this.showFocus = false;
            this.update();
        });
    }

    resetCursorBlink() {
        this.cursorVisible = true;
        this.blinkTime = 0;
    }

    handleBackspace(e, idx, line) {
        const { prefix } = this.options;
        if (e.shiftKey) {
            this.buffer[idx] = prefix;
        } else if (line.length > prefix.length) {
            this.buffer[idx] = line.slice(0, -1);
        }
    }

    navigateHistory(direction, idx) {
        this.historyIndex = Math.max(0, Math.min(this.historyIndex - direction, this.history.length));
        const entry = this.history[this.historyIndex - 1] || "";
        this.buffer[idx] = this.options.prefix + entry;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    update() {
        const output = this.buffer.join("\n");
        const cursor = (this.showFocus && this.cursorVisible && !this.command_running) ? "_" : " ";
        this.container.innerText = output + cursor;
    }

    async replaceVars(text = "") {
        let prev;
        do {
            prev = text;
            for (const [key, val] of Object.entries(this.options.variables)) {
                text = text.replaceAll(`{${key}}`, val);
            }
        } while (text !== prev);

        return text.replaceAll("\\n", "\n");
    }

    async runCommand(inputText) {
        this.command_running = true;
        this.buffer.push("");

        const lines = inputText.split(";").map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            const replacedLine = await this.replaceVars(line);
            const args = replacedLine.split(" ");
            const alias = args.shift();
            const command = this.options.commands.find(cmd => cmd.alias.includes(alias));

            if (command) {
                const result = await command.run.call(this, alias, args);
                if (result) {
                    this.buffer[this.buffer.length - 1] = await this.replaceVars(result);
                    this.buffer.push("");
                }
            } else {
                this.buffer[this.buffer.length - 1] = `Unknown command: ${alias}`;
                this.buffer.push("");
            }
        }

        this.buffer[this.buffer.length - 1] = this.options.prefix;
        this.update();
        this.command_running = false;
    }
}
