(() => {
  // src/Command.ts
  function tokenize(input) {
    const tokens = [];
    let current = "";
    let quote = null;
    let escaped = false;
    for (const char of input) {
      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (quote) {
        if (char === quote) {
          quote = null;
        } else {
          current += char;
        }
        continue;
      }
      if (char === "'" || char === '"') {
        quote = char;
        continue;
      }
      if (char === " ") {
        if (current) {
          tokens.push(current);
          current = "";
        }
        continue;
      }
      current += char;
    }
    if (current) {
      tokens.push(current);
    }
    return tokens;
  }

  // src/Konsole.ts
  var defaultOptions = {
    cursor: {
      blinkTime: 500,
      text: "|"
    },
    initCommand: "echo {version_ascii}\n{version}-{branch}",
    prefix: "$ ",
    variables: {
      "version": "1.0.08",
      "version_ascii": `:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ########## `,
      // https://patorjk.com/software/taag/#p=display&f=Alligator2&t=Konsole
      "ascii_gen": "https://patorjk.com/software/taag/",
      "branch": "stable"
    }
  };
  var WebKonsole;
  ((WebKonsole2) => {
    class Instance {
      constructor(element, options, commandHistory = [], commandIndex = 0) {
        this.element = element;
        this.commandHistory = commandHistory;
        this.commandIndex = commandIndex;
        this.outputElement = document.createElement("div");
        this.inputOuter = document.createElement("div");
        this.prefixElement = document.createElement("div");
        this.inputElement = document.createElement("input");
        this.commandRunning = false;
        this.commands = [];
        this.options = {
          ...defaultOptions,
          ...options,
          cursor: {
            ...defaultOptions.cursor,
            ...options == null ? void 0 : options.cursor
          },
          variables: {
            ...defaultOptions.variables,
            ...options == null ? void 0 : options.variables
          }
        };
        Object.assign(this.element.style, {
          backgroundColor: "black",
          boxSizing: "border-box",
          cursor: "text",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          padding: "5px",
          width: "100%",
          height: "100%",
          overflowY: "auto",
          textAlign: "left",
          fontFamily: "monospace",
          color: "lime",
          fontSize: "medium"
        });
        Object.assign(this.inputElement.style, {
          background: "transparent",
          border: "none",
          outline: "none",
          width: "100%",
          flex: "1",
          caretColor: "lime",
          fontFamily: "monospace",
          color: "lime",
          padding: "0",
          fontSize: "medium"
        });
        Object.assign(this.inputOuter.style, {
          display: "inline-flex",
          flexDirection: "row",
          width: "100%"
        });
        this.element.appendChild(this.outputElement);
        this.element.appendChild(this.inputOuter);
        this.prefixElement.innerText = this.options.prefix;
        this.inputOuter.appendChild(this.prefixElement);
        this.inputOuter.appendChild(this.inputElement);
        this.inputElement.onkeydown = async (event) => {
          if (this.commandRunning) return;
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (this.inputElement.value.trim().length > 0 && this.commandHistory[this.commandHistory.length - 1] != this.inputElement.value) {
              this.commandHistory.push(this.inputElement.value);
              this.commandIndex = this.commandHistory.length;
            }
            this.render(this.prefixElement.innerText + this.inputElement.value + "\n");
            await this.exec(tokenize(this.inputElement.value));
            this.inputElement.value = "";
            this.prefixElement.innerText = this.options.prefix;
          }
          const commandHistory2 = [...this.commandHistory, ""];
          if (event.key === "ArrowUp") {
            if (this.commandIndex > 0) {
              this.commandIndex--;
            }
            this.inputElement.value = commandHistory2[this.commandIndex];
            event.preventDefault();
          }
          if (event.key === "ArrowDown") {
            if (this.commandIndex < this.commandHistory.length) {
              this.commandIndex++;
            }
            this.inputElement.value = commandHistory2[this.commandIndex];
            event.preventDefault();
          }
        };
        let pos = { x: 0, y: 0 };
        this.element.onmousedown = (event) => {
          pos = { x: event.clientX, y: event.clientY };
        };
        this.element.onmouseup = (event) => {
          const dist = Math.hypot(pos.x - event.clientX, pos.y - event.clientY);
          if (Math.abs(dist) < 5) {
            this.inputElement.focus();
          }
        };
        this.registerDefaultCommands();
        this.exec(tokenize(this.options.initCommand));
      }
      async exec(command) {
        if (command.length === 0 || command[0].length === 0) {
          this.render("");
          return;
        }
        ;
        const cmd = this.commands.find((c) => c.alias.includes(command[0]));
        if (cmd) {
          this.commandRunning = true;
          this.inputOuter.style.display = "none";
          const result = await cmd.run(command);
          if (result) {
            this.render(result);
          }
          this.commandRunning = false;
          this.inputOuter.style.display = "inline-flex";
          this.inputElement.focus();
        } else {
          this.render(`{c:red}Command not found: "${command[0]}"{/c}`);
        }
        this.render("\n");
      }
      registerCommand(command) {
        const aliases = Array.isArray(command.alias) ? command.alias : [command.alias];
        if (!this.commands.some((c) => {
          const existing = Array.isArray(c.alias) ? c.alias : [c.alias];
          return aliases.some((alias) => existing.includes(alias));
        })) {
          this.commands.push(command);
        }
      }
      unregisterCommand(name) {
        this.commands = this.commands.filter((c) => {
          const aliases = Array.isArray(c.alias) ? c.alias : [c.alias];
          return !aliases.includes(name);
        });
      }
      registerDefaultCommands() {
        this.registerCommand({
          alias: ["echo"],
          run: async (args) => {
            args.shift();
            if (args.length === 0) return "{c:red}Usage: echo <text>{/c}";
            return args.join(" ");
          }
        });
        this.registerCommand({
          alias: ["clear", "cls"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Clears the terminal screen.";
            } else {
              this.outputElement.innerHTML = "";
            }
          }
        });
        this.registerCommand({
          alias: ["wait", "delay"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Delays for a specified amount of milliseconds.";
            } else {
              const time = parseInt(args[1], 10);
              if (isNaN(time) || time < 0) {
                return "{c:red}Usage: wait <milliseconds>{/c}";
              }
              await new Promise((res) => setTimeout(res, time));
            }
          }
        });
        this.registerCommand({
          alias: ["help", "?"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Displays all available commands.";
            }
            return "Available Commands:\n" + this.commands.map(
              (c) => `  ${typeof c.alias === "string" ? c.alias : c.alias.join(" | ")}`
            ).join("\n");
          }
        });
        this.registerCommand({
          alias: ["ver", "version"],
          run: async () => {
            return [
              "Konsole Info:",
              "  Version : {version}",
              "  Branch  : {branch}",
              "  Dev     : NicholasC"
            ].join("\n");
          }
        });
        this.registerCommand({
          alias: ["vars", "variables"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Lists all variables.";
            }
            const vars = Object.entries(this.options.variables);
            if (vars.length === 0) {
              return "{c:red}No variables defined.{/c}";
            }
            return "Available Variables:\n" + vars.map(
              ([key, value]) => `  ${key} = ${value.includes("\n") ? `[${value.split("\n")[0]}...]` : value}`
            ).join("\n");
          }
        });
        this.registerCommand({
          alias: ["about", "abt"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Displays information about WebKonsole.";
            }
            return [
              "For use where a console is needed on the web",
              "  Created by: NicholasC",
              "  ASCII Art Source: {ascii_gen}"
            ].join("\n");
          }
        });
        this.registerCommand({
          alias: ["set"],
          run: async (args) => {
            if (args[1] === "--help") {
              return "Sets a variable for use in commands.";
            }
            if (args.length < 3) {
              return "{c:red}Usage: set <variable> <value>{/c}";
            }
            const [, key, ...valueParts] = args;
            const value = valueParts.join(" ");
            this.options.variables[key] = value;
            return `Variable ${key} set to "${value}"`;
          }
        });
        this.registerCommand({
          alias: ["run"],
          run: async (args) => {
            if (args[1] === "--help") {
              return 'Runs a ".js" script.';
            }
            try {
              if (args.length < 2) {
                return "{c:red}Usage: run <script location>{/c}";
              }
              const result = await fetch(args[1]);
              if (!result.ok) {
                return "{c:red}Inaccessible script location{/c}";
              }
              const script = await result.text();
              const blob = new Blob([script], {
                type: "text/javascript"
              });
              const url = URL.createObjectURL(blob);
              const module = await import(url);
              URL.revokeObjectURL(url);
              if (typeof module.default !== "function") {
                return "{c:red}Script has no default function{/c}";
              }
              return await module.default.call(this);
            } catch (err) {
              if (err instanceof Error) {
                return `{c:red}Error running script: ${err.message}{/c}`;
              }
              return `{c:red}Error running script: ${String(err)}{/c}`;
            }
          }
        });
        this.registerCommand({
          alias: ["pause"],
          run: async (args) => {
            if (args[1] == "--help") {
              return "pauses until the user presses enter.";
            } else {
              this.render("\nPress enter to continue...");
              return new Promise((resolve) => {
                this.element.addEventListener("keydown", (event) => {
                  if (event.key == "Enter") {
                    resolve();
                  }
                });
              });
            }
          }
        });
      }
      render(text) {
        text = text.replace(
          /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g,
          (_, name) => {
            var _a;
            return (_a = this.options.variables[name]) != null ? _a : `{${name}}`;
          }
        );
        text = text.replace(
          /\{c:([^}]+)\}([\s\S]*?)\{\/c\}/g,
          (_, color, content) => `<span style="color:${color}">${content}</span>`
        );
        text = text.replace(
          /\{a:(https?:\/\/[^\s}]+)\}([\s\S]*?)\{\/a\}/g,
          (_, url, content) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#4f4ff7">${content}</a>`
        );
        this.outputElement.insertAdjacentHTML("beforeend", text);
      }
    }
    WebKonsole2.Instance = Instance;
  })(WebKonsole || (WebKonsole = {}));

  // src/index.ts
  globalThis.WebKonsole = WebKonsole;
})();
