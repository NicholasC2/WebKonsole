import { Command } from "./Command";
import { tokenize } from "./Tokenizer";

export const defaultVariables = {
    "version": "1.0.07",
    "version_ascii": `\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ########## `, // https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole
    "ascii_gen": "https://patorjk.com/software/taag/",
    "branch": "stable"
}

const defaultStyle = {
    "background-color": "black",
    "box-sizing": "border-box",
    "color": "lime",
    "cursor": "text",
    "font-family": "monospace",
    "white-space": "pre-wrap",
    "overflow-wrap": "break-word",
    "padding": "5px",
    "width": "100%",
    "height": "100%",
    "overflow-y": "auto",
    "text-align": "left"
}

export namespace WebKonsole {
    export interface Options {
        initCommand: string
        prefix: string
        cursor: {
            text: string
            blinkTime: number;
        }
        variables: Record<string, string>
    }

    export class Instance {
        private inputElement: HTMLElement;
        private cursorElement: HTMLElement;
        private commandRunning: boolean = false;
        private exitCommand: boolean = false;
        private commands: Command[] = [];

        constructor(
            public element: HTMLElement, 
            public options: Options,
            public commandHistory: Command[]
        ) {
            this.element.classList.add("konsole-defaults");
            Object.assign(this.element.style, defaultStyle);

            this.cursorElement = document.createElement("div");
            this.inputElement = document.createElement("div");

            this.inputElement.style.display = "inline";
            this.element.appendChild(this.inputElement);
            this.cursorElement.style.userSelect = "none";
            this.element.appendChild(this.cursorElement);

            const blinkChangeState = () => {
                this.cursorElement.innerText =
                    this.cursorElement.innerText === this.options.cursor.text
                        ? ""
                        : this.options.cursor.text;

                setTimeout(blinkChangeState, this.options.cursor.blinkTime);
            };

            blinkChangeState();

            this.runCommand(this.options.initCommand);
        }

        registerCommand(command: Command) {
            this.commands.push(command);
        }

        unregisterCommand(name: string) {
            let index = this.commands.findIndex(c => c.alias === name);

            while(index !== 0) {
                this.commands.splice(index, 1);
                index = this.commands.findIndex(c => c.alias === name);
            }
        }

        registerDefaultCommands() {
            this.registerCommand(
                {
                    alias: "echo",
                    run: async (args) => {
                        args.shift();
                        if (args.length === 0) return "<err>Usage: echo <text></err>";
                        return args.join(" ");
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["clear", "cls"],
                    run: async (args) => {
                        if(args[1] == "--help") {
                            return "Clears the terminal screen."
                        } else {
                            this.element.innerHTML = "";
                        }
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["wait", "delay"],
                    run: async (args) => {
                        if(args[1] == "--help") {
                            return "Delays for a specified amount of milliseconds"
                        } else {
                            const time = parseInt(args[1], 10);
                            if (isNaN(time) || time < 0) return "<c:red>Usage: wait <milliseconds></c>";
                            await new Promise(res => setTimeout(res, time));
                        }
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["help", "?"],
                    run: async (args) => {
                        if(args[1] == "--help") {
                            return "Displays all available commands"
                        } else {
                            return "Available Commands:\n" + this.commands.map(c => `  ${typeof c.alias === "string" ? c.alias : c.alias.join(" | ")}`).join("\n");
                        }
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["ver", "version"],
                    run: async () => {
                        return [
                            "Konsole Info:",
                            `  Version : {version}`,
                            `  Branch  : {branch}`,
                            `  Dev     : NicholasC`
                        ].join("\n");
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["vars", "variables"],
                    run: async (args) => {
                        if(args[1] == "--help") {
                            return "Lists all variables."
                        } else {
                            const vars = Object.entries(this.options.variables);
                            if (vars.length === 0) return "<err>No variables defined.</err>";
                            
                            return "Available Variables:\n" +
                                vars.map(([key, value]) => `  ${key} = ${value.includes("\n") ? `[${value.split("\n")[0]}...]` : value}`).join("\n");
                        }
                    }
                }
            );

            this.registerCommand(
                {
                    alias: ["about", "abt"],
                    run: async () => {
                        return [
                            "For use where a console is needed on the web",
                            "  Created by: NicholasC",
                            "  ASCII Art Source: {ascii_gen}"
                        ].join("\n");
                    }
                }
            );

            this.registerCommand(
                {
                    alias: "set",
                    run: async (args) => {
                        if(args[1] == "--help") {
                            return "Sets a variable for use in commands."
                        } else {
                            if (args.length < 3) return "<c:red>Usage: set <variable> <value></c>";
                            const [_, key, ...valueParts] = args;
                            const value = valueParts.join(" ");
                            this.options.variables[key] = value;
                            return `Variable ${key} set to "${value}"`;
                        }
                    }
                }
            );

            this.registerCommand(
                {
                    alias: "run",
                    run: async function(this: Konsole, args) {
                    if(args[0] == "--help") {
                        return "Runs a \".js\" script."
                    } else {
                        try {
                            if(args.length < 1) return "<err>Usage: run <script location></err>";
                            const result = await fetch(args[0])
                            if(!result.ok) return "<err>Inaccessible script location</err>";
                            const script = await result.text()

                            const blob = new Blob([script], { type: "text/javascript" });
                            const url = URL.createObjectURL(blob);

                            const module = await import(url);
                            URL.revokeObjectURL(url);

                            if (typeof module.default !== "function") {
                                return "<err>Script has no default function</err>";
                            }

                            return await module.default.call(this);
                        } catch(err: unknown) {
                            if (err instanceof Error) {
                                return `<err>Error running script: ${err.message}</err>`;
                            }
                            return `<err>Error running script: ${String(err)}</err>`;
                        }
                    }
                }
                }
            )

            createCommand(
                "pause",
                async function(this: Konsole, args) {
                    if(args[0] == "--help") {
                        return "pauses until the user presses enter."
                    } else {
                        this.update("Press enter to continue...")
                        return new Promise((resolve) => {
                            this.container.addEventListener("keydown", (event)=>{
                                if(event.key == "Enter") {
                                    resolve();
                                }
                            })
                        })
                    }
                }
            );
        }

        async formatInput(text: string) {
            let prev = "";

            while (text !== prev) {
                prev = text;
                for (const [key, value] of Object.entries(this.options.variables)) {
                    text = text.replaceAll(`{${key}}`, value);
                }
            }

            return text.replaceAll("\\n", "\n");
        }

        formatOutput(text: string) {
            let out = text
                .replaceAll(/&/g, "&amp;")
                .replaceAll(/</g, "&lt;")
                .replaceAll(/>/g, "&gt;");

            out = out.replaceAll(
                /&lt;c:([^&]+?)&gt;([\s\S]*?)&lt;\/c&gt;/g,
                (_, color:string, content:string) => `<span style="color:${color}">${content}</span>`
            ); // colors

            out = out.replaceAll(
                /(https?:\/\/[^\s]+)/g,
                `<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#4f4ff7">$1</a>`
            ); // links

            return out;
        }

        setupInputHandler() {
            this.element.setAttribute("tabindex", "0");

            this.element.addEventListener("keydown", async (e) => {
                e.preventDefault();
                this.resetCursorBlink();
                
                if (this.commandRunning) return; // prevent anything after this to run if a command is already running

                switch (e.key) {
                    case "Enter":
                        if(e.shiftKey) {
                            this.inputElement.innerText += "\n";
                        } else {
                            const inputText = this.inputElement.innerText;

                            this.inputElement.innerText = "";
                            
                            if (inputText.trim().length > 0) {
                                if (this.history.entries[0] !== input) this.history.entries.unshift(input);
                                this.history.index = 0;
                                await this.runCommand(input);
                            }
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

        async parseCommand(inputText: string = ""): Command {
            const parts = tokenize(inputText, ";");

            for (const part of parts) {
                const replacedLine = await this.formatInput(part);

                const args = replacedLine.split(" ");
                const alias = args.shift();

                if(!alias) continue;
                const command = getCommands().find(cmd => cmd.alias == alias);
                if(this.container.innerText != "") this.update("\n");

                if (command) {
                    if(this.exitCommand) return
                    const result = await command.run.call(this, args);
                    if(this.exitCommand) return
                    if (result) {
                        this.update(await this.formatInput(result));
                    }
                } else {
                    this.update(`<err>Unknown command: "${alias}"</err>`);
                }
            }

            if(this.exitCommand) return

            if(this.container.innerText != "") this.update("\n");
            if(!inline) this.update(this.options.prefix);
            this.commandRunning = false;
            this.cursor.hidden = false;
        }
    }
}