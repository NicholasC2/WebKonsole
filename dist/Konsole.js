(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/Command.ts
  var Command = class {
    constructor(alias, run = async () => "Command is missing a run function.") {
      __publicField(this, "alias");
      __publicField(this, "run");
      this.alias = alias;
      this.run = run;
    }
  };
  var commands = [];
  function getCommands() {
    return [...commands];
  }
  function createCommand(alias, run) {
    if (!alias || alias.trim() == "") {
      throw new SyntaxError("Command must have alias");
    }
    if (alias.includes(" ")) {
      throw new SyntaxError("Command alias cannot contain spaces");
    }
    const exists = commands.some((c) => c.alias === alias);
    if (exists) {
      throw new Error(`Command ${alias} already exists`);
    }
    commands.push(new Command(alias, run));
  }
  function deleteCommand(alias) {
    const index = commands.findIndex((c) => c.alias === alias);
    if (index !== -1) {
      commands.splice(index, 1);
    }
  }
  function registerDefaultCommands() {
    createCommand(
      "echo",
      async function(args) {
        if (args.length === 0) return "<err>Usage: echo <text></err>";
        return args.join(" ");
      }
    );
    createCommand(
      "clear",
      async function(args) {
        if (args[0] == "--help") {
          return "Clears the terminal screen.";
        } else {
          this.container.innerHTML = "";
        }
      }
    );
    createCommand(
      "wait",
      async function(args) {
        if (args[0] == "--help") {
          return "Delays for a specified amount of milliseconds";
        } else {
          const time = parseInt(args[0], 10);
          if (isNaN(time) || time < 0) return "<err>Usage: wait <milliseconds></err>";
          await new Promise((res) => setTimeout(res, time));
        }
      }
    );
    createCommand(
      "help",
      async function(args) {
        if (args[0] == "--help") {
          return "Displays all available commands";
        } else {
          return "Available Commands:\n" + commands.map((cmd) => `  ${cmd.alias}`).join("\n");
        }
      }
    );
    createCommand(
      "ver",
      async function() {
        return [
          "Konsole Info:",
          `  Version : {version}`,
          `  Branch  : {branch}`,
          `  Dev     : NicholasC`
        ].join("\n");
      }
    );
    createCommand(
      "nl",
      async function(args) {
        if (args[0] == "--help") {
          return "Prints a new line";
        } else {
          return "\n";
        }
      }
    );
    createCommand(
      "vars",
      async function(args) {
        if (args[0] == "--help") {
          return "Lists all variables.";
        } else {
          const vars = Object.entries(this.options.variables);
          if (vars.length === 0) return "<err>No variables defined.</err>";
          return "Available Variables:\n" + vars.map(([key, value]) => `  ${key} = ${value.includes("\n") ? `[${value.split("\n")[0]}...]` : value}`).join("\n");
        }
      }
    );
    createCommand(
      "about",
      async function() {
        return [
          "For use where a console is needed on the web",
          "  Created by: NicholasC",
          "  ASCII Art Source: {ascii_gen}"
        ].join("\n");
      }
    );
    createCommand(
      "set",
      async function(args) {
        if (args[0] == "--help") {
          return "Sets a variable for use in commands.";
        } else {
          if (args.length < 2) return "<err>Usage: set <variable> <value></err>";
          const [key, ...valueParts] = args;
          const value = valueParts.join(" ");
          this.options.variables[key] = value;
          return `Variable ${key} set to "${value}"`;
        }
      }
    );
    createCommand(
      "run",
      async function(args) {
        if (args[0] == "--help") {
          return 'Runs a ".js" script.';
        } else {
          try {
            if (args.length < 1) return "<err>Usage: run <script location></err>";
            const result = await fetch(args[0]);
            if (!result.ok) return "<err>Inaccessible script location</err>";
            const script = await result.text();
            const blob = new Blob([script], { type: "text/javascript" });
            const url = URL.createObjectURL(blob);
            const module = await import(url);
            URL.revokeObjectURL(url);
            if (typeof module.default !== "function") {
              return "<err>Script has no default function</err>";
            }
            return await module.default.call(this);
          } catch (err) {
            if (err instanceof Error) {
              return `<err>Error running script: ${err.message}</err>`;
            }
            return `<err>Error running script: ${String(err)}</err>`;
          }
        }
      }
    );
  }

  // src/Konsole.ts
  var defaultVariables = {
    "version": "1.0.02",
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
  };
  var defaultStyle = {
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
    "overflow-y": "scroll",
    "text-align": "left"
  };
  var KonsoleOptions = class {
    constructor({ initCommand, prefix, cursor, variables } = {}) {
      __publicField(this, "initCommand");
      __publicField(this, "prefix");
      __publicField(this, "cursor");
      __publicField(this, "variables");
      this.initCommand = initCommand != null ? initCommand : "echo {version_ascii}\n echo v{version}-{branch}\n echo https://github.com/NicholasC2/WebKonsole";
      this.prefix = prefix != null ? prefix : "$ ";
      this.cursor = cursor != null ? cursor : "_";
      this.variables = Object.assign(defaultVariables, variables);
    }
  };
  var Konsole = class {
    constructor(container, options) {
      __publicField(this, "container");
      __publicField(this, "focused", false);
      __publicField(this, "cursor");
      __publicField(this, "input");
      __publicField(this, "history");
      __publicField(this, "commandRunning", false);
      __publicField(this, "options");
      __publicField(this, "createCommand", createCommand);
      __publicField(this, "deleteCommand", deleteCommand);
      __publicField(this, "getCommands", getCommands);
      this.container = container;
      this.options = new KonsoleOptions(options);
      for (const [key, value] of Object.entries(defaultStyle)) {
        if (!this.container.style.getPropertyValue(key)) {
          this.container.style.setProperty(key, value);
        }
      }
      registerDefaultCommands();
      this.cursor = {
        element: document.createElement("div"),
        blinkTime: 0,
        visible: false
      };
      this.input = {
        element: document.createElement("div"),
        previous: "",
        text: ""
      };
      this.history = {
        index: 0,
        entries: []
      };
      this.input.element.style.display = "inline";
      this.container.appendChild(this.input.element);
      this.cursor.element.style.userSelect = "none";
      this.container.appendChild(this.cursor.element);
      this.setupInputHandler();
      this.startBlink();
      this.runCommand(this.options.initCommand);
    }
    formatOutput(text) {
      let out = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      out = out.replace(
        /&lt;c:([^&]+?)&gt;([\s\S]*?)&lt;\/c&gt;/g,
        (_, color, content) => `<span style="color:${color}">${content}</span>`
      );
      out = out.replace(
        /&lt;err&gt;([\s\S]*?)&lt;\/err&gt;/g,
        (_, content) => `<span style="color:red">${content}</span>`
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
        if (!e.ctrlKey || e.key.toLowerCase() !== "c") {
          e.preventDefault();
        }
        this.resetCursorBlink();
        const input = this.input.text;
        switch (e.key) {
          case "Enter":
            if (e.shiftKey) {
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
            this.input.text = input.slice(0, -1);
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
    navigateHistory(direction) {
      this.history.index = Math.max(0, Math.min(this.history.index - direction, this.history.entries.length));
      const entry = this.history.entries[this.history.index - 1] || "";
      this.input.text = entry;
    }
    scrollToBottom() {
      this.container.scrollTop = this.container.scrollHeight;
    }
    update(...args) {
      let elems = [];
      args.forEach((text) => {
        const newElem = document.createElement("span");
        newElem.innerHTML = this.formatOutput(text);
        elems.push(newElem);
        this.container.appendChild(newElem);
      });
      if (this.input.text != this.input.previous) {
        this.input.element.innerText = this.input.text;
        this.input.previous = this.input.text;
        this.container.appendChild(this.input.element);
      }
      if (this.focused && this.cursor.visible && !this.commandRunning) {
        if (this.cursor.element.style.display != "inline") {
          this.cursor.element.style.display = "inline";
        }
      } else {
        if (this.cursor.element.style.display != "none") {
          this.cursor.element.style.display = "none";
        }
      }
      this.cursor.element.innerText = this.options.cursor;
      this.container.appendChild(this.cursor.element);
      return elems;
    }
    async replaceVars(text = "") {
      let prev = "";
      do {
        prev = text;
        for (const [key, value] of Object.entries(this.options.variables)) {
          text = text.replace(`{${key}}`, value);
        }
      } while (text !== prev);
      return text.replace("\\n", "\n");
    }
    async runCommand(inputText = "", inline = false) {
      this.commandRunning = true;
      this.cursor.visible = false;
      this.update();
      const lines = inputText.replaceAll(";", "\n").split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const replacedLine = await this.replaceVars(line);
        const args = replacedLine.split(" ");
        const alias = args.shift();
        if (!alias) continue;
        const command = getCommands().find((cmd) => cmd.alias == alias);
        if (this.container.innerText != "") this.update("\n");
        if (command) {
          const result = await command.run.call(this, args);
          if (result) {
            this.update(await this.replaceVars(result));
          }
        } else {
          this.update(`<err>Unknown command: "${alias}"</err>`);
        }
      }
      if (this.container.innerText != "") this.update("\n");
      if (!inline) this.update(this.options.prefix);
      this.commandRunning = false;
    }
  };

  // src/index.ts
  globalThis.Konsole = Konsole;
})();
