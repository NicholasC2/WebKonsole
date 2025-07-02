class Command {
    constructor(alias = [], description = "", run = async () => "Need to add Run function") {
        this.alias = alias
        this.description = description.toString()
        this.run = run
    }
}

class Konsole {
    constructor(container, options = {}) {
        this.container = container;
        this.options = Object.assign({
            width: "100%",
            height: "100%",
            textColor: "lime",
            backgroundColor: "black",
            font: "monospace",
            initCommand: "echo {version_ascii}\nv{version}-{branch}",
            prefix: "$ ",
            variables: {
                version: "1.1.2",
                version_ascii: "\
:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: \n\
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        \n\
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        \n\
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   \n\
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        \n\
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        \n\
###    ### ########  ###    ####  ########   ########  ########## ########## ",
                ascii_gen: "https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole",
                branch: "stable"
            },
            commands: [
                new Command(["echo", "print"], "prints out everything after the command", async (alias, args) => args.join(" ")),
                new Command(["clear", "cls"], "clears the screen", async (alias, args) => {
                    this.buffer = [this.options.prefix];
                }),
                new Command(["wait", "delay"], "delays for the amount of milliseconds supplied", async (alias, args) => {
                    await new Promise(resolve => setTimeout(resolve, Number(args[0])));
                }),
                new Command(["help"], "displays all commands", async function () {
                    let output = `help for Konsole {version}\n  commands:\n`;
                    for (const cmd of this.options.commands) {
                        output += `   ${cmd.alias.join(" | ")} : "${cmd.description || ''}"\n`;
                    }
                    return output;
                }),
                new Command(["version", "ver"], "displays version information", async () => "Konsole Version: {version}\nKonsole Branch: {branch}\nDeveloper/s: NicholasC"),
                new Command(["nl", "new-line"], "prints a new line", async () => "\n")
            ]
        }, options);

        this.buffer = [];
        this.cursorVisible = true;
        this.blinkTime = 0;
        this.history = [];
        this.history_index = 0;

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
                if(this.history[0] != inputText && inputText.trim()) {
                    this.history.unshift(inputText);
                    if(this.history_index != 0) this.history_index++;
                }
                await this.runCommand(inputText);
                this.container.scrollTop = this.container.scrollHeight;
            } else if (event.key === "Backspace") {
                if (event.shiftKey) {
                    this.buffer[currentIndex] = this.options.prefix;
                } else if (currentLine.length > this.options.prefix.length) {
                    this.buffer[currentIndex] = currentLine.slice(0, -1);
                }
                this.container.scrollTop = this.container.scrollHeight;
            } else if (event.ctrlKey && event.key === "l") {
                this.buffer = [this.options.prefix];
            } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
                this.buffer[currentIndex] += event.key;
                this.container.scrollTop = this.container.scrollHeight;
            } else if(event.key == "ArrowUp") {
                if(this.history.includes(this.buffer[currentIndex].slice(this.options.prefix.length, this.buffer[currentIndex].length)) || this.history_index == 0) this.history_index++;
                if(this.history_index > this.history.length) this.history_index = this.history.length;
                if(this.history_index == 0) return;
                this.buffer[currentIndex] = this.options.prefix + this.history[this.history_index - 1]
                this.container.scrollTop = this.container.scrollHeight;
            } else if(event.key == "ArrowDown") {
                if(this.history.includes(this.buffer[currentIndex].slice(this.options.prefix.length, this.buffer[currentIndex].length)) || this.history_index == 0) this.history_index-=1;
                if(this.history_index < 0) this.history_index = 0;
                if(this.history_index == 0) {
                    this.buffer[currentIndex] = this.options.prefix
                    this.update();
                    return;
                };
                this.buffer[currentIndex] = this.options.prefix + this.history[this.history_index - 1]
                this.container.scrollTop = this.container.scrollHeight;
            } else if(event.key == "v" && event.ctrlKey) {
                this.buffer[currentIndex] += await navigator.clipboard.readText()
                this.container.scrollTop = this.container.scrollHeight;
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
    }

    async replaceVars(text = "") {
        let prev;
        do {
            prev = text;
            for (const [key, value] of Object.entries(this.options.variables)) {
                text = text.replaceAll(`{${key}}`, value);
            }
        } while (text !== prev);

        text = text.replaceAll("\\n", "\n");
        return text;
    }

    async runCommand(text) {
        this.buffer.push("");

        for (var line of text.split(";")) {
            if (!line.trim()) continue;

            line = line.trim()

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
