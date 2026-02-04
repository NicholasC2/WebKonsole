(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/Variable.ts
  var Variable = class {
    constructor(key, value) {
      __publicField(this, "key");
      __publicField(this, "value");
      this.key = key;
      this.value = value;
    }
  };
  var defaultVariables = [
    new Variable("version", "1.4.6"),
    new Variable("version_ascii", `:::    ::: ::::::::  ::::    :::  ::::::::   ::::::::  :::        :::::::::: 
:+:   :+: :+:    :+: :+:+:   :+: :+:    :+: :+:    :+: :+:        :+:        
+:+  +:+  +:+    +:+ :+:+:+  +:+ +:+        +:+    +:+ +:+        +:+        
+#++:++   +#+    +:+ +#+ +:+ +#+ +#++:++#++ +#+    +:+ +#+        +#++:++#   
+#+  +#+  +#+    +#+ +#+  +#+#+#        +#+ +#+    +#+ +#+        +#+        
#+#   #+# #+#    #+# #+#   #+#+# #+#    #+# #+#    #+# #+#        #+#        
###    ### ########  ###    ####  ########   ########  ########## ########## `),
    new Variable("ascii_gen", "https://patorjk.com/software/taag/"),
    new Variable("branch", "experimental-ts")
  ];

  // src/Command.ts
  var Command = class {
    constructor(alias = [], shortDesc = "", longDesc = "", run = async () => "This command is missing the run function") {
      __publicField(this, "alias");
      __publicField(this, "shortDesc");
      __publicField(this, "longDesc");
      __publicField(this, "run");
      this.alias = alias;
      this.shortDesc = shortDesc;
      this.longDesc = longDesc || shortDesc;
      this.run = run;
    }
  };
  var defaultCommands = [
    new Command(
      ["echo", "print"],
      "Prints text to the console.",
      "Usage: echo <text>\nPrints the provided text back to the screen.",
      async function(_, args) {
        if (args.length === 0) return "<err>Usage: echo <text></err>";
        return args.join(" ");
      }
    ),
    new Command(
      ["clear", "cls"],
      "Clears the terminal screen.",
      "Usage: clear\nResets the console display and clears all previous output.",
      async function() {
        this.container.innerHTML = "";
      }
    ),
    new Command(
      ["wait", "delay"],
      "Waits for a given number of milliseconds.",
      "Usage: wait <ms>\nPauses the terminal for a specific number of milliseconds. Useful for scripting delays.",
      async function(_, args) {
        const time = parseInt(args[0], 10);
        if (isNaN(time) || time < 0) return "<err>Usage: wait <milliseconds></err>";
        await new Promise((res) => setTimeout(res, time));
      }
    ),
    new Command(
      ["help", "?"],
      "Lists available commands.",
      "Usage: help [command]\nWithout arguments, lists all available commands.\nUse `help <command>` for detailed info.",
      async function(_, args) {
        if (args.length > 0) {
          const cmd = this.options.commands.find((c) => c.alias.includes(args[0]));
          return cmd ? `${cmd.alias.join(" | ")}
${cmd.longDesc}` : `<err>No such command: ${args[0]}</err>`;
        }
        const lines = this.options.commands.map((cmd) => {
          const aliases = cmd.alias.join(" | ");
          return `  ${aliases.padEnd(20)} - ${cmd.shortDesc}`;
        });
        return "Available Commands:\n" + lines.join("\n");
      }
    ),
    new Command(
      ["version", "ver"],
      "Displays version info.",
      "Usage: version\nShows current version, branch, and developer information.",
      async function() {
        return [
          "Konsole Info:",
          `  Version : {version}`,
          `  Branch  : {branch}`,
          `  Dev     : NicholasC`
        ].join("\n");
      }
    ),
    new Command(
      ["nl", "newline", "br"],
      "Prints a blank line.",
      "Usage: nl\nInserts a newline into the output.",
      async function() {
        return "\n";
      }
    ),
    new Command(
      ["vars", "variables"],
      "Lists all variables. ",
      "Usage: vars\nLists all available variables that can be used with curly braces (e.g., {version}).",
      async function() {
        const vars = Object.entries(this.options.variables);
        if (vars.length === 0) return "<err>No variables defined.</err>";
        return "Available Variables:\n" + vars.map(([k, v]) => `  ${k} = ${typeof v === "string" && v.includes("\n") ? `[${v.split("\n")[0]}...]` : v}`).join("\n");
      }
    ),
    new Command(
      ["about"],
      "Displays Konsole info.",
      "Usage: about\nShows Konsole's developer and ASCII art source.",
      async function() {
        return [
          "For use where a console is needed on the web",
          "  Created by: NicholasC",
          "  ASCII Art Source: {ascii_gen}"
        ].join("\n");
      }
    ),
    new Command(
      ["set", "setvar"],
      "Sets a variable for use in commands.",
      "Usage: set <variable> <value>\nSets a variable that can be used in commands with curly braces (e.g., {variable}).",
      async function(_, args) {
        if (args.length < 2) return "<err>Usage: set <variable> <value></err>";
        const [key, ...valueParts] = args;
        const value = valueParts.join(" ");
        this.options.variables[key] = value;
        return `Variable ${key} set to "${value}"`;
      }
    ),
    new Command(
      ["run"],
      'Runs a ".kjs" script',
      'Usage: run <script location>\nRuns a ".kjs" script.',
      async function(_, args) {
        try {
          if (args.length < 1) return "<err>Usage: run <script location></err>";
          const result = await fetch(args[0]);
          if (!result.ok) return "<err>Inaccessible script location</err>";
          const script = await result.text();
          return await this.runCommand(script, true);
        } catch (err) {
          return `<err>Failed to fetch script: ${err.message}</err>`;
        }
      }
    )
  ];

  // src/Konsole.ts
  var defaultStyle = {
    "background-color": "black",
    "box-sizing": "border-box",
    "color": "lime",
    "cursor": "text",
    "font-family": "monospace",
    "overflow": "auto",
    "padding": "5px",
    "white-space": "pre",
    "width": "100%",
    "height": "100%"
  };
  var KonsoleOptions = class {
    constructor(initCommand = "echo {version_ascii}\n echo v{version}-{branch}\n echo https://github.com/NicholasC2/WebKonsole", prefix = "$ ", cursor = "_", style = [], variables = [], commands = []) {
      __publicField(this, "initCommand");
      __publicField(this, "prefix", "$ ");
      __publicField(this, "cursor", "_");
      __publicField(this, "style");
      __publicField(this, "variables");
      __publicField(this, "commands");
      this.initCommand = initCommand;
      this.prefix = prefix;
      this.cursor = cursor;
      this.style = style;
      this.variables = [
        ...defaultVariables,
        ...variables
      ];
      this.commands = [
        ...defaultCommands,
        ...commands
      ];
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
      this.container = container;
      this.options = Object.assign(new KonsoleOptions(), options);
      Object.assign(this.container.style, defaultStyle, this.options.style);
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
      args.forEach((text) => {
        const newElem = document.createElement("span");
        newElem.innerHTML = this.formatOutput(text);
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
    }
    async replaceVars(text = "") {
      let prev = "";
      do {
        prev = text;
        for (const variable of this.options.variables) {
          text = text.replace(`{${variable.key}}`, variable.value.toString());
        }
      } while (text !== prev);
      return text.replace("\\n", "\n");
    }
    async runCommand(inputText = "", inline = false) {
      this.commandRunning = true;
      const lines = inputText.replaceAll(";", "\n").split("\n").map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        const replacedLine = await this.replaceVars(line);
        const args = replacedLine.split(" ");
        const alias = args.shift();
        if (!alias) continue;
        const command = this.options.commands.find((cmd) => cmd.alias.includes(alias));
        if (command) {
          const result = await command.run.call(this, alias, args);
          if (result) {
            this.update("\n" + await this.replaceVars(result));
          }
        } else {
          this.update(`
Unknown command: ${alias}`);
        }
      }
      if (!inline) this.update("\n" + this.options.prefix);
      this.commandRunning = false;
    }
  };

  // src/index.ts
  globalThis.Konsole = Konsole;
})();
