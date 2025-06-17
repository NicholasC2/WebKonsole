class Konsole {
    constructor(container, options = {
        width: "100%",
        height: "100%",
        textColor: "lime",
        backgroundColor: "black",
        font: "monospace",
        initCommand: "echo {version}",
        prefix: "$ ",
        commands: [
            {
                "alias": ["echo", "print"],
                "run": async(alias, args)=>{
                    return Promise.resolve(args.join(" "));
                }
            },
            {
                "alias": ["clear", "cls"],
                "run": async()=>{
                    return new Promise((resolve)=>{
                        this.buffer = [this.options.prefix]
                        resolve()
                    })
                }
            },
            {
                "alias": ["wait"],
                "run": async(alias, args)=>{
                    return new Promise((resolve)=>{
                        setTimeout(resolve, args[0])
                    })
                }
            },
            {
                "alias": ["yoshikage"],
                "run": async(alias, args)=>{
                    return Promise.resolve("My name is Yoshikage Kira. I'm 33 years old. My house is in the northeast section of Morioh, where all the villas are, and I am not married. I work as an employee for the Kame Yu department stores, and I get home every day by 8 PM at the latest. I don't smoke, but I occasionally drink. I'm in bed by 11 PM, and make sure I get eight hours of sleep, no matter what. After having a glass of warm milk and doing about twenty minutes of stretches before going to bed, I usually have no problems sleeping until morning. Just like a baby, I wake up without any fatigue or stress in the morning. I was told there were no issues at my last check-up. I'm trying to explain that I'm a person who wishes to live a very quiet life. I take care not to trouble myself with any enemies, like winning and losing, that would cause me to lose sleep at night. That is how I deal with society, and I know that is what brings me happiness. Although, if I were to fight I wouldn't lose to anyone.")
                }
            }
        ],
        variables: {
            "version": "Konsole v1.0.0"
        }
    }) {
        if(!container instanceof HTMLElement) {
            throw new Error("Container must be an Element")
        }
        this.container = container
        this.options = options
        this.buffer = []
        setInterval(()=>{
            this.update()
        }, 16)
        window.addEventListener("keydown", async(event) => {
            event.preventDefault()
            if(event.key == "Enter") {
                if(event.ctrlKey) {
                    this.buffer[this.buffer.length-1] += "\n"
                } else {
                    const current_buffer = this.buffer[this.buffer.length-1]
                    const inputText = current_buffer.slice(this.options.prefix.length,current_buffer.length)
                    await this.runCommand(inputText)
                }
            }
            if(event.key == "Backspace") {
                if(event.shiftKey) {
                    this.buffer[this.buffer.length-1] = this.options.prefix
                } else {
                    const current_buffer = this.buffer[this.buffer.length-1]
                    if(current_buffer.slice(0,current_buffer.length - 1).startsWith(this.options.prefix)) {
                        this.buffer[this.buffer.length-1] = current_buffer.slice(0,current_buffer.length - 1)
                    }
                }
            }
            if(event.key == "l" && event.ctrlKey && !event.altKey && !event.shiftKey) {
                this.buffer = [this.options.prefix]
            }
            if(event.key.length == 1 && !event.ctrlKey && !event.altKey) {
                this.buffer[this.buffer.length-1] += event.key
            }
            this.update()
        })
        this.runCommand(options.initCommand)
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
            boxSizing: "border-box"
        })
        this.container.innerText = this.buffer.join("\n")+"|"
    }

    async replaceVars(text = "") {
        return new Promise(async(resolve)=>{
            const variables = Object.entries(this.options.variables);
            variables.forEach((variable) => {
                const [key, value] = variable
                text = text.replaceAll(`{${key}}`, value)
            })
            resolve(text)
        })
    }

    async runCommand(text) {
        for (var cmd of text.split("\n")) {
            if (cmd.trim() === "") {
                this.buffer.push("");
                continue;
            }

            cmd = await this.replaceVars(cmd);
            const args = cmd.split(" ");
            const alias = args.shift();
            let found = false;

            for (const command of this.options.commands) {
                if (command.alias.includes(alias)) {
                    this.buffer.push("");
                    const output = await command.run(alias, args);
                    if (output) {
                        this.buffer[this.buffer.length - 1] = output;
                        this.buffer.push("")
                    }
                    found = true;
                    break;
                }
            }

            if (!found) {
                this.buffer.push(`Unknown command: ${alias}`);
            }
        }

        this.buffer[this.buffer.length - 1] = this.options.prefix;
        return;
    }
}
