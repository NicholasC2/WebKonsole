var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Command from "./Command.js";
let baseCommands = [];
baseCommands.push(new Command(["echo", "print"], "prints out everything after the command", function (_alias, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args) {
            return "";
        }
        return args.join(" ");
    });
}));
baseCommands.push(new Command(["clear", "cls"], "clears the screen", function () {
    return __awaiter(this, void 0, void 0, function* () {
        this.buffer = [this.options.prefix];
    });
}));
baseCommands.push(new Command(["help"], "displays all commands", function () {
    return __awaiter(this, void 0, void 0, function* () {
        let output = `help for Konsole {version}\n  commands:\n`;
        for (const cmd of this.commands) {
            output += `   ${cmd.alias.join(" or ")} : ${cmd.description || ''}\n`;
        }
        return output;
    });
}));
baseCommands.push(new Command(["wait"], "delays for the amount of milliseconds supplied", (_alias, args) => __awaiter(void 0, void 0, void 0, function* () {
    if (!args) {
        return yield new Promise(resolve => setTimeout(resolve, 1));
    }
    return yield new Promise(resolve => setTimeout(resolve, Number(args[0])));
})));
baseCommands.push(new Command(["version", "ver"], "displays version information", function () {
    return __awaiter(this, void 0, void 0, function* () {
        return `Konsole Version: {version}
Konsole Branch: {branch}
Developers: NicholacsC, BoxyPlayz`;
    });
}));
export default class Konsole {
    constructor(Container, options = {}) {
        this.buffer = [];
        this.container = Container;
        this.options = Object.assign({
            width: "100%",
            height: "100%",
            textColor: "lime",
            backgroundColor: "black",
            font: "monospace",
            initCommand: "echo {version_ascii}\nv{version}-{branch}",
            prefix: "$ ",
            variables: {
                version: "1.2.0",
                version_ascii: "\
 __  __  ____  __  _   ____  ____  _     ____  \n\
|  |/  // () \|  \| | (_ (_`/ () \| |__ | ===| \n\
|__|\__\\____/|_|\__|.__)__)\____/|____||____| \n\
                ",
                ascii_gen: "https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole",
                branch: "stable"
            },
        }, options);
        this.buffer = [];
        this.cursorVisible = true;
        this.blinkTime = 0;
        this.history = [];
        this.history_index = 0;
        this.commands = baseCommands;
        setInterval(() => {
            if (this.blinkTime >= 500) {
                this.cursorVisible = !this.cursorVisible;
                this.update();
                this.blinkTime = 0;
            }
            this.blinkTime += 100;
        }, 100);
        window.addEventListener("keydown", (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.blinkTime = 0;
            this.cursorVisible = true;
            if (this.buffer.length === 0) {
                this.buffer.push(this.options.prefix || "");
            }
            const currentIndex = this.buffer.length - 1;
            const currentLine = this.buffer[currentIndex] || "";
            if (event.key === "Enter") {
                const inputText = currentLine.slice(this.options.prefix.length);
                if (this.history[0] != inputText && inputText.trim()) {
                    this.history.unshift(inputText);
                    if (this.history_index != 0)
                        this.history_index++;
                }
                yield this.runCommand(inputText);
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (event.key === "Backspace") {
                if (event.shiftKey) {
                    this.buffer[currentIndex] = this.options.prefix;
                }
                else if (currentLine.length > this.options.prefix.length) {
                    this.buffer[currentIndex] = currentLine.slice(0, -1);
                }
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (event.ctrlKey && event.key === "l") {
                this.buffer = [this.options.prefix];
            }
            else if (event.key.length === 1 && !event.ctrlKey && !event.altKey) {
                this.buffer[currentIndex] += event.key;
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (event.key == "ArrowUp") {
                if (this.history.includes((this.buffer[currentIndex] || "").slice(this.options.prefix.length, (this.buffer[currentIndex] || "").length)) || this.history_index == 0)
                    this.history_index++;
                if (this.history_index > this.history.length)
                    this.history_index = this.history.length;
                if (this.history_index == 0)
                    return;
                this.buffer[currentIndex] = this.options.prefix + this.history[this.history_index - 1];
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (event.key == "ArrowDown") {
                if (this.history.includes((this.buffer[currentIndex] || "").slice(this.options.prefix.length, (this.buffer[currentIndex] || "").length)) || this.history_index == 0)
                    this.history_index -= 1;
                if (this.history_index < 0)
                    this.history_index = 0;
                if (this.history_index == 0) {
                    this.buffer[currentIndex] = this.options.prefix;
                    this.update();
                    return;
                }
                ;
                this.buffer[currentIndex] = this.options.prefix + this.history[this.history_index - 1];
                this.container.scrollTop = this.container.scrollHeight;
            }
            else if (event.key == "v" && event.ctrlKey) {
                this.buffer[currentIndex] += yield navigator.clipboard.readText();
                this.container.scrollTop = this.container.scrollHeight;
            }
            this.update();
        }));
        this.runCommand(this.options.initCommand || "");
    }
    update() {
        Object.assign(this.container.style, {
            backgroundColor: this.options.backgroundColor,
            color: this.options.textColor,
            fontFamily: this.options.font,
            width: this.options.width,
            height: this.options.height
        });
        const output = this.buffer.join("\n");
        const cursor = this.cursorVisible ? "|" : " ";
        this.container.innerText = output + cursor;
    }
    replaceVars() {
        return __awaiter(this, arguments, void 0, function* (text = "") {
            let prev;
            do {
                prev = text;
                for (const [key, value] of Object.entries(this.options.variables)) {
                    text = text.replaceAll(`{${key}}`, value);
                }
            } while (text !== prev);
            text = text.replaceAll("\\n", "\n");
            return text;
        });
    }
    runCommand(text) {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer.push("");
            for (var line of text.split(";")) {
                if (!line.trim())
                    continue;
                line = line.trim();
                const replaced = yield this.replaceVars(line);
                const args = replaced.split(" ");
                const alias = args.shift();
                let matched = false;
                for (const cmd of this.commands) {
                    if (cmd.alias.includes(alias || "")) {
                        const result = yield cmd.run.call(this, alias, args);
                        if (result) {
                            this.buffer[this.buffer.length - 1] = yield this.replaceVars(result);
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
        });
    }
    register(command) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.commands.some(cmd => cmd.alias.some(alias => command.alias.includes(alias)))) {
                throw new Error("Command alias already exists");
            }
            this.commands.push(command);
        });
    }
}
//# sourceMappingURL=Konsole.js.map