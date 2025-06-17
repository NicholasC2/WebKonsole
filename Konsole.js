class Konsole {
    constructor(container, options = {
        width: "100%",
        height: "100%",
        textColor: "lime",
        backgroundColor: "black",
        font: "monospace",
        initCommand: "echo {version}",
        prefix: "$",
        commands: [
            {
                "alias": ["echo", "print"],
                "run": (alias, args)=>{
                    this.buffer.push(args.join(" "))
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
        Object.assign(this.container.style, {
            backgroundColor: options.backgroundColor,
            color: options.textColor,
            fontFamily: options.font,
            width: options.width,
            height: options.height,
            overflowY: "scroll",
            whiteSpace: "pre-wrap",
            padding: "5px",
            boxSizing: "border-box"
        })
        window.addEventListener("keydown", (event) => {
            if(event.key == "Enter") {
                const inputText = this.buffer[this.buffer.length-1].slice(1,0)
                this.buffer.push(options.prefix+inputText)
                this.runCommand(inputText)
            }
            this.buffer[this.buffer.length-1] += event.key
            this.update()
        })
        this.runCommand(options.initCommand)
        this.update()
    }

    update() {
        this.container.innerText = this.buffer.join("\n")
    }

    replaceVars(text = "") {
        const variables = Object.entries(this.options.variables);
        variables.forEach((variable) => {
            const [key, value] = variable
            text = text.replaceAll(`{${key}}`, value)
        })
        return text
    }

    runCommand(cmd = "") {
        cmd = this.replaceVars(cmd)
        const args = cmd.split(" ")
        const alias = args.shift()
        let found = false
        for (const command of this.options.commands) {
            if(command.alias.includes(alias)) {
                command.run(alias, args)
                found = true
                break;
            }
        }
        if(!found) {
            this.buffer.push(`Unknown command: ${alias}`)
        }
    }
}