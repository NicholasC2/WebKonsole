class Command {
    constructor(alias = [], shortDesc = "", longDesc = "", run = async () => "Need to add Run function") {
        this.alias = alias;
        this.shortDesc = shortDesc;
        this.longDesc = longDesc || shortDesc;
        this.run = run;
    }
}

const copyrightElem = document.createElement("div");
copyrightElem.innerText = "Copyright © 2025 NicholasC";
copyrightElem.style.right = "10px";
copyrightElem.style.bottom = "10px";
copyrightElem.style.position = "absolute";
copyrightElem.style.color = "white";
copyrightElem.style.opacity = "50%"

const defaultStyle = {
    backgroundColor: "black",
    boxSizing: "border-box",
    color: "lime",
    cursor: "text",
    fontFamily: "monospace",
    overflowX: "auto",
    overflowY: "auto",
    padding: "5px",
    whiteSpace: "pre",
    width: "100%",
    height: "100%",
};

const defaultOptions = {
    initCommand: "echo {version_ascii}\nv{version}-{branch}\nhttps://github.com/NicholasC2/WebKonsole\n",
    prefix: "$ ",
    cursor: "_",
    variables: {
        version: "1.4.1",
        version_ascii: `\
<c:#00ff0030>:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: </c>
<c:#00ff0050>:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        </c>
<c:#00ff0070>+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        </c>
<c:#00ff0090>+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   </c>
<c:#00ff00B0>+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        </c>
<c:#00ff00D0>#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        </c>
<c:#00ff00F0>###    ### ########  ###    ####  ########   ########  ########## ########## </c>`,
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
            this.container.innerHTML = "";
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
        "Lists all variables. ",
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
                "For use where a console is needed on the web",
                "  Created by: NicholasC",
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

let cursorOldText = ""

class Konsole {
    constructor(container, options = defaultOptions, style = {}) {
        this.container = container;
        this.cursorVisible = true;
        this.blinkTime = 0;
        this.history = [];
        this.historyIndex = 0;
        this.showFocus = false;
        this.commandRunning = false;
        this.cursorElem = document.createElement("span")
        this.cursorElem.style.userSelect = "none"
        this.cursorTextElem = document.createElement("span")
        this.cursorText = ""

        this.container.appendChild(copyrightElem);
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

    formatOutput(text) {
        let out = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        out = out.replace(
            /&lt;c:([^&]+?)&gt;([\s\S]*?)&lt;\/c&gt;/g,
            (m, color, content) => {
                return `<span style="color:${color}">${content}</span>`;
            }
        );

        out = out.replace(
            /(https?:\/\/[^\s]+)/g,
            `<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#4f4ff7">$1</a>`
        );

        return out;
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
            if (this.commandRunning) return;

            if(!e.ctrlKey || e.key.toLowerCase() !== "c") {
                e.preventDefault();
            }
            this.resetCursorBlink();

            switch (e.key) {
                case "Enter":
                    this.update(this.cursorText)
                    if (this.cursorText.trim()) {
                        if (this.history[0] !== this.cursorText) this.history.unshift(this.cursorText);
                        this.historyIndex = 0;
                    }
                    await this.runCommand(this.cursorText);
                    this.cursorText = "";
                    break;

                case "Backspace":
                    this.cursorText = this.cursorText.slice(0,-1)
                    break;

                case "ArrowUp":
                    this.navigateHistory(-1);
                    break;

                case "ArrowDown":
                    this.navigateHistory(1);
                    break;

                default:
                    if (e.ctrlKey && e.key.toLowerCase() === "l") {
                        this.container.innerHTML = "";
                    } else if (e.ctrlKey && e.key.toLowerCase() === "v") {
                        const text = await navigator.clipboard.readText();
                        this.cursorText += text;
                    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                        this.cursorText += e.key;
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

    navigateHistory(direction) {
        this.historyIndex = Math.max(0, Math.min(this.historyIndex - direction, this.history.length));
        const entry = this.history[this.historyIndex - 1] || "";
        this.cursorText = this.options.prefix + entry;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    update(...args) {
        args.forEach((text)=>{
            const newElem = document.createElement("span");
            newElem.innerHTML = this.formatOutput(text);
            this.container.appendChild(newElem);
        })

        if(this.cursorText != cursorOldText) {
            this.cursorTextElem.innerText = this.cursorText
            cursorOldText = this.cursorText
            this.container.appendChild(this.cursorTextElem)
        }

        if(this.showFocus && this.cursorVisible && !this.commandRunning) {
            if(this.cursorElem.style.display != "inline") {
                this.cursorElem.style.display = "inline"
            }
        } else {
            if(this.cursorElem.style.display != "none") {
                this.cursorElem.style.display = "none"
            }
        }

        this.cursorElem.innerText = this.options.cursor
        this.container.appendChild(this.cursorElem)
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
        this.commandRunning = true;

        const lines = inputText.split(";").map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            const replacedLine = await this.replaceVars(line);
            const args = replacedLine.split(" ");
            const alias = args.shift();
            const command = this.options.commands.find(cmd => cmd.alias.includes(alias));

            if (command) {
                const result = await command.run.call(this, alias, args);
                if (result) {
                    this.update("\n"+await this.replaceVars(result));
                }
            } else {
                this.update(`\nUnknown command: ${alias}`);
            }
        }
        this.update("\n"+this.options.prefix);
        this.commandRunning = false;
    }
}

