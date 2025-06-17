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
                "run": (alias, args)=>{
                    return new Promise((resolve)=>{
                        resolve(args.join(" "))
                    })
                }
            },
            {
                "alias": ["clear", "cls"],
                "run": ()=>{
                    return new Promise((resolve)=>{
                        this.buffer = [this.options.prefix]
                        resolve()
                    })
                }
            },
            {
                "alias": ["wait"],
                "run": (alias, args)=>{
                    return new Promise((resolve)=>{
                        setTimeout(resolve, args[0])
                    })
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
        this.update()
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
        this.runCommand(options.initCommand).then(()=>{
            this.update()
        })
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

    async runCommand(text = "") {
        return new Promise(async(resolve)=>{
            for(var cmd of text.split("\n")) {
                if(cmd.trim() == "") {
                    this.buffer.push("")
                    continue
                }
                cmd = await this.replaceVars(cmd)
                const args = cmd.split(" ")
                const alias = args.shift()
                let found = false
                for (const command of this.options.commands) {
                    if(command.alias.includes(alias)) {
                        this.buffer.push("")
                        this.update()
                        const output = await command.run(alias, args)
                        if(output) {
                            this.buffer[this.buffer.length-1] = output
                        }
                        found = true
                        break;
                    }
                }
                if(!found) {
                    this.buffer.push(`Unknown command: ${alias}`)
                }
            }
            this.buffer[this.buffer.length-1] = this.options.prefix
            resolve()
        })
    }
}