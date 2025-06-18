class Konsole {
    constructor(container, options = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new Error("Container must be an HTMLElement");
        }

        this.container = container;
        this.options = Object.assign({
            width: "100%",
            height: "100%",
            textColor: "lime",
            backgroundColor: "black",
            font: "monospace",
            initCommand: "echo {version_ascii}\n{version}\n",
            prefix: "$ ",
            variables: {
                version: "v1.1.0-stable",
                version_ascii: "\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: \n\
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        \n\
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        \n\
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   \n\
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        \n\
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        \n\
###    ### ########  ###    ####  ########   ########  ########## ########## ",
                ascii_gen: "https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole"
            },
            commands: [
                {
                    alias: ["echo", "print"],
                    description: "prints out everything after the command",
                    run: async (alias, args) => args.join(" ")
                },
                {
                    alias: ["clear", "cls"],
                    description: "clears the screen",
                    run: async function () {
                        this.buffer = [this.options.prefix];
                    }
                },
                {
                    alias: ["wait"],
                    description: "delays for the amount of milliseconds supplied",
                    run: async (alias, args) => {
                        await new Promise(resolve => setTimeout(resolve, Number(args[0])));
                    }
                },
                {
                    alias: ["help"],
                    description: "displays all commands",
                    run: async function () {
                        let output = `help for Konsole {version}\n  commands:\n`;
                        for (const cmd of this.options.commands) {
                            output += `   ${cmd.alias.join(" | ")} : "${cmd.description || ''}"\n`;
                        }
                        return output;
                    }
                },
                {
                    alias: ["version", "ver"],
                    description: "displays version information",
                    run: async () => "{version}"
                }
            ]
        }, options);

        this.buffer = [];
        this.cursorVisible = true;
        this.blinkTime = 0;

        setInterval(() => {
            if (this.blinkTime >= 500) {
                this.cursorVisible = !this.cursorVisible;
                this.update();
                this.blinkTime = 0;
            }
            this.blinkTime+=100
        }, 100);

        window.addEventListener("keydown", async (event) => {
            event.preventDefault();
            this.blinkTime = 0
            this.cursorVisible = true;

            if (this.buffer.length === 0) {
                this.buffer.push(this.options.prefix);
            }

            const currentIndex = this.buffer.length - 1;
            const currentLine = this.buffer[currentIndex];

            if (event.key === "Enter") {
                const inputText = currentLine.slice(this.options.prefix.length);
                await this.runCommand(inputText);
            } else if (event.key === "Backspace") {
                if (event.shiftKey) {
                    this.buffer[currentIndex] = this.options.prefix;
                } else if (currentLine.length > this.options.prefix.length) {
                    this.buffer[currentIndex] = currentLine.slice(0, -1);
                }
            } else if (event.ctrlKey && event.key === "l") {
                this.buffer = [this.options.prefix];
            } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
                this.buffer[currentIndex] += event.key;
            }

            this.update();
        });

        this.runCommand(this.options.initCommand);
    }

    update() {
        Object.assign(this.container.style, {
            backgroundColor: this.options.backgroundColor,
            color: this.options.textColor,
            fontFamily: this.options.font,
            width: this.options.width,
            height: this.options.height,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            padding: "5px",
            boxSizing: "border-box",
        });

        const output = this.buffer.join("\n");
        const cursor = this.cursorVisible ? "|" : " ";
        this.container.innerText = output + cursor;
        this.container.scrollTop = this.container.scrollHeight;
    }

    async replaceVars(text = "") {
        for (const [key, value] of Object.entries(this.options.variables)) {
            text = text.replaceAll(`{${key}}`, value);
        }
        text = text.replaceAll("\\n", "\n");
        return text;
    }

    async runCommand(text) {
        this.buffer.push("");

        for (const line of text.split(";")) {
            if (!line.trim()) continue;

            const replaced = await this.replaceVars(line);
            const args = replaced.split(" ");
            const alias = args.shift();

            let matched = false;
            for (const cmd of this.options.commands) {
                if (cmd.alias.includes(alias)) {
                    const result = await cmd.run.call(this, alias, args);
                    if (result) {
                        this.buffer[this.buffer.length - 1] = await this.replaceVars(result);
                        this.buffer.push("");
                    }
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                this.buffer[this.buffer.length - 1] = `Unknown command: ${alias}`;
                this.buffer.push("");
            }
        }

        this.buffer[this.buffer.length - 1] = this.options.prefix;
        this.update();
    }
}
