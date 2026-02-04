import { Variable, defaultVariables } from "./Variable";
import { Command, defaultCommands } from "./Command";

const defaultStyle = {
    "background-color": "black",
    "box-sizing": "border-box",
    "color": "lime",
    "cursor": "text",
    "font-family": "monospace",
    "overflow": "auto",
    "padding": "5px",
    "white-space": "pre",
    "width": "100%",
    "height": "100%"
}

export class KonsoleOptions {
    initCommand: string
    prefix: string = "$ "
    cursor: string = "_"
    style: Object
    variables: Variable[]
    commands: Command[]

    constructor(initCommand: string = "echo {version_ascii}\n echo v{version}-{branch}\n echo https://github.com/NicholasC2/WebKonsole", prefix: string = "$ ", cursor: string = "_", style: Object = [], variables: Variable[] = [], commands: Command[] = []) {
        this.initCommand = initCommand
        this.prefix = prefix;
        this.cursor = cursor;
        this.style = style;
        this.variables = [
            ...defaultVariables,
            ...variables
        ]
        this.commands = [
            ...defaultCommands,
            ...commands
        ]
    }
}

export class Konsole {
    container: HTMLElement;
    focused: boolean = false;
    cursor: {
        visible: boolean;
        blinkTime: number;
        element: HTMLElement;
    };
    input: {
        text: string;
        previous: string;
        element: HTMLElement;
    };
    history: {
        index: number;
        entries: string[];
    };
    commandRunning: boolean = false;
    options: KonsoleOptions;

    constructor(container: HTMLElement, options: KonsoleOptions) {
        this.container = container;
        this.options = Object.assign(new KonsoleOptions(), options);
        Object.assign(this.container.style, defaultStyle, this.options.style)

        this.cursor = {
            element: document.createElement("div"),
            blinkTime: 0,
            visible: false
        }

        this.input = {
            element: document.createElement("div"),
            previous: "",
            text: ""
        }

        this.history = {
            index: 0,
            entries: []
        }

        this.input.element.style.display = "inline";
        this.container.appendChild(this.input.element);
        this.cursor.element.style.userSelect = "none";
        this.container.appendChild(this.cursor.element);

        this.setupInputHandler();
        this.startBlink();
        this.runCommand(this.options.initCommand);
    }

    formatOutput(text: string) {
        let out = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        out = out.replace(
            /&lt;c:([^&]+?)&gt;([\s\S]*?)&lt;\/c&gt;/g,
            (_, color:string, content:string) => `<span style="color:${color}">${content}</span>`
        );

        out = out.replace(
            /&lt;err&gt;([\s\S]*?)&lt;\/err&gt;/g,
            (_, content:string) => `<span style="color:red">${content}</span>`
        );

        out = out.replace(
            /(https?:\/\/[^\s]+)/g,
            `<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#4f4ff7">$1</a>`
        );

        return out;
    }

    startBlink() {
        setInterval(() => {
            this.cursor.blinkTime += 100;
            if (this.cursor.blinkTime >= 500) {
                this.cursor.visible = !this.cursor.visible;
                this.cursor.blinkTime = 0;
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

            const input = this.input.text;

            switch (e.key) {
                case "Enter":
                    if(e.shiftKey) {
                        this.input.text += "\n";
                    } else {
                        this.input.text = "";
                        this.update(input);
                        if (input.trim()) {
                            if (this.history.entries[0] !== input) this.history.entries.unshift(input);
                            this.history.index = 0;
                        }
                        await this.runCommand(input);
                    }
                    break;

                case "Backspace":
                    this.input.text = input.slice(0,-1)
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
                        this.input.text += text;
                    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                        this.input.text += e.key;
                    }
                    break;
            }

            this.scrollToBottom();
            this.update();
        });

        this.container.addEventListener("focus", () => {
            this.focused = true;
            this.resetCursorBlink();
            this.update();
        });

        this.container.addEventListener("blur", () => {
            this.focused = false;
            this.update();
        });
    }

    resetCursorBlink() {
        this.cursor.visible = true;
        this.cursor.blinkTime = 0;
    }

    navigateHistory(direction: number) {
        this.history.index = Math.max(0, Math.min(this.history.index - direction, this.history.entries.length));
        const entry = this.history.entries[this.history.index - 1] || "";
        this.input.text = entry;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    update(...args: string[]) {
        args.forEach((text)=>{
            const newElem = document.createElement("span");
            newElem.innerHTML = this.formatOutput(text);
            this.container.appendChild(newElem);
        })

        if(this.input.text != this.input.previous) {
            this.input.element.innerText = this.input.text
            this.input.previous = this.input.text
            this.container.appendChild(this.input.element)
        }

        if(this.focused && this.cursor.visible && !this.commandRunning) {
            if(this.cursor.element.style.display != "inline") {
                this.cursor.element.style.display = "inline"
            }
        } else {
            if(this.cursor.element.style.display != "none") {
                this.cursor.element.style.display = "none"
            }
        }

        this.cursor.element.innerText = this.options.cursor
        this.container.appendChild(this.cursor.element)
    }

    async replaceVars(text = "") {
        let prev = "";
        do {
            prev = text;
            for (const variable of this.options.variables) {
                text = text.replace(`{${variable.key}}`, variable.value.toString());
            }
        } while (text !== prev);

        return text.replace("\\n", "\n");
    }

    async runCommand(inputText: string = "", inline = false) {
        this.commandRunning = true;

        const lines = inputText.replaceAll(";", "\n").split("\n").map(l => l.trim()).filter(Boolean);

        for (const line of lines) {
            const replacedLine = await this.replaceVars(line);
            const args = replacedLine.split(" ");
            const alias = args.shift();
            if(!alias) continue;
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
        if(!inline) this.update("\n"+this.options.prefix);
        this.commandRunning = false;
    }
}