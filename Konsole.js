class Command {
    constructor(alias = [], description = "", run = async () => "Need to add Run function") {
        this.alias = alias;
        this.description = description;
        this.run = run;
    }
}

class Konsole {
    constructor(container, options = {}) {
        this.container = container;
        this.buffer = [];
        this.cursorVisible = true;
        this.blinkTime = 0;
        this.history = [];
        this.historyIndex = 0;

        // Merge default options
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
                version_ascii:
`:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ##########`,
                ascii_gen: "https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole",
                branch: "stable"
            },
            commands: []
        }, options);

        // Add default commands
        this.registerDefaultCommands();

        // Start cursor blink
        this.startBlink();

        // Set up input handling
        this.setupInputHandler();

        // Run initial command
        this.runCommand(this.options.initCommand);
    }

    registerDefaultCommands() {
        this.options.commands.push(
            new Command(["echo", "print"], "Prints text", async (_, args) => args.join(" ")),
            new Command(["clear", "cls"], "Clears the screen", async () => {
                this.buffer = [this.options.prefix];
            }),
            new Command(["wait", "delay"], "Waits for milliseconds", async (_, args) => {
                const time = parseInt(args[0], 10);
                if (!isNaN(time)) await new Promise(res => setTimeout(res, time));
            }),
            new Command(["help"], "Displays available commands", async () => {
                return "Available commands:\n" +
                    this.options.commands.map(cmd =>
                        `  ${cmd.alias.join(" | ")} : ${cmd.description}`
                    ).join("\n");
            }),
            new Command(["version", "ver"], "Shows version info", async () => 
                "Konsole Version: {version}\nKonsole Branch: {branch}\nDeveloper/s: NicholasC"
            ),
            new Command(["nl", "new-line"], "Prints a new line", async () => "\n")
        );
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
        window.addEventListener("keydown", async (e) => {
            e.preventDefault();
            this.resetCursorBlink();

            if (this.buffer.length === 0) this.buffer.push(this.options.prefix);
            const idx = this.buffer.length - 1;
            const line = this.buffer[idx];

            const input = line.slice(this.options.prefix.length);

            if (e.key === "Enter") {
                if (input.trim()) {
                    if (this.history[0] !== input) this.history.unshift(input);
                    this.historyIndex = 0;
                }
                await this.runCommand(input);
            } else if (e.key === "Backspace") {
                this.handleBackspace(e, idx, line);
            } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
                this.buffer = [this.options.prefix];
            } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                this.buffer[idx] += e.key;
            } else if (e.key === "ArrowUp") {
                this.navigateHistory(-1, idx);
            } else if (e.key === "ArrowDown") {
                this.navigateHistory(1, idx);
            } else if (e.ctrlKey && e.key.toLowerCase() === "v") {
                this.buffer[idx] += await navigator.clipboard.readText();
            }

            this.scrollToBottom();
            this.update();
        });
    }

    resetCursorBlink() {
        this.cursorVisible = true;
        this.blinkTime = 0;
    }

    handleBackspace(e, idx, line) {
        if (e.shiftKey) {
            this.buffer[idx] = this.options.prefix;
        } else if (line.length > this.options.prefix.length) {
            this.buffer[idx] = line.slice(0, -1);
        }
    }

    navigateHistory(direction, idx) {
        this.historyIndex -= direction;
        this.historyIndex = Math.max(0, Math.min(this.historyIndex, this.history.length));
        const entry = this.history[this.historyIndex - 1] || "";
        this.buffer[idx] = this.options.prefix + entry;
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
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
            for (const [key, val] of Object.entries(this.options.variables)) {
                text = text.replaceAll(`{${key}}`, val);
            }
        } while (text !== prev);

        return text.replaceAll("\\n", "\n");
    }

    async runCommand(inputText) {
        this.buffer.push("");

        for (const line of inputText.split(";").map(l => l.trim()).filter(Boolean)) {
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
    }
}
