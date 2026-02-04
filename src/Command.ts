import { Konsole } from "./Konsole";
import { Variable } from "./Variable";

export type CommandRun = (
    alias: string,
    args: string[]
) => Promise<string | void>;
  
class Command {
    alias: string[];
    shortDesc: string;
    longDesc: string;
    run: CommandRun;
  
    constructor(
        alias: string[] = [],
        shortDesc = "",
        longDesc = "",
        run: CommandRun = async () => "This command is missing the run function."
    ) {
        this.alias = alias;
        this.shortDesc = shortDesc;
        this.longDesc = longDesc || shortDesc;
        this.run = run;
    }
}

const commands: Command[] = []

export function getCommands() {
    return commands;
}

export function createCommand(alias: string[], shortDesc: string, longDesc: string, run: CommandRun) {
    for(const command of commands) {
        const found: any = command.alias.find((alias, i) => {
            if(commands.some(c => c.alias.includes(alias))) {
                return i;
            } else {
                return -1;
            }
        });

        const newCommand = new Command(alias, shortDesc, longDesc, run);

        if(found != -1) {
            commands[found] = newCommand
        } else {
            commands.push(newCommand)
        }
    }
}

export function registerDefaultCommands() {
    createCommand(
        ["echo", "print"],
        "Prints text to the console.",
        "Usage: echo <text>\nPrints the provided text back to the screen.",
        async function (_, args) {
            if (args.length === 0) return "<err>Usage: echo <text></err>";
            return args.join(" ");
        }
    );

    createCommand(
        ["clear", "cls"],
        "Clears the terminal screen.",
        "Usage: clear\nResets the console display and clears all previous output.",
        async function (this: Konsole) {
            this.container.innerHTML = "";
        }
    );

    createCommand(
        ["wait", "delay"],
        "Waits for a given number of milliseconds.",
        "Usage: wait <ms>\nPauses the terminal for a specific number of milliseconds. Useful for scripting delays.",
        async function (_, args) {
            const time = parseInt(args[0], 10);
            if (isNaN(time) || time < 0) return "<err>Usage: wait <milliseconds></err>";
            await new Promise(res => setTimeout(res, time));
        }
    );

    createCommand(
        ["help", "?"], 
        "Lists available commands.",
        "Usage: help [command]\nWithout arguments, lists all available commands.\nUse `help <command>` for detailed info.",
        async function (this: Konsole, _, args) {
            if (args.length > 0) {
                const cmd = this.options.commands.find(c => c.alias.includes(args[0]));
                return cmd ? `${cmd.alias.join(" | ")}\n${cmd.longDesc}` : `<err>No such command: ${args[0]}</err>`;
            }

            const lines = this.options.commands.map(cmd => {
                const aliases = cmd.alias.join(" | ");
                return `  ${aliases.padEnd(20)} - ${cmd.shortDesc}`;
            });

            return "Available Commands:\n" + lines.join("\n");
        }
    );

    createCommand(
        ["version", "ver"],
        "Displays version info.",
        "Usage: version\nShows current version, branch, and developer information.",
        async function () {
            return [
                "Konsole Info:",
                `  Version : {version}`,
                `  Branch  : {branch}`,
                `  Dev     : NicholasC`
            ].join("\n");
        }
    );

    createCommand(
        ["nl", "newline", "br"],
        "Prints a blank line.",
        "Usage: nl\nInserts a newline into the output.",
        async function () {
            return "\n";
        }
    );

    createCommand(
        ["vars", "variables"],
        "Lists all variables.",
        "Usage: vars\nLists all available variables that can be used with curly braces (e.g., {version}).",
        async function (this: Konsole) {
            const vars = this.options.variables;
            if (vars.length === 0) return "<err>No variables defined.</err>";
            
            return "Available Variables:\n" +
                vars.map((v) => `  ${v.key} = ${v.value.includes("\n") ? `[${v.value.split("\n")[0]}...]` : v.value}`).join("\n");
        }
    );

    createCommand(
        ["about"],
        "Displays Konsole info.",
        "Usage: about\nShows Konsole's developer and ASCII art source.",
        async function () {
            return [
                "For use where a console is needed on the web",
                "  Created by: NicholasC",
                "  ASCII Art Source: {ascii_gen}"
            ].join("\n");
        }
    );

    createCommand(
        ["set", "setvar"],
        "Sets a variable for use in commands.",
        "Usage: set <variable> <value>\nSets a variable that can be used in commands with curly braces (e.g., {variable}).",
        async function (this: Konsole, _, args) {
            if (args.length < 2) return "<err>Usage: set <variable> <value></err>";
            const [key, ...valueParts] = args;
            const value = valueParts.join(" ");
            const variable = this.options.variables.find(v => v.key === key);
            if (variable) {
                variable.value = value;
            } else {
                this.options.variables.push(new Variable(key, value));
            }
            return `Variable ${key} set to "${value}"`;
        }
    );

    createCommand(
        ["run"],
        "Runs a \".ks\" script.",
        "Usage: run <script location>\nRuns a \".ks\" script.",
        async function(this: Konsole, _, args) {
            try {
                if(args.length < 1) return "<err>Usage: run <script location></err>";
                const result = await fetch(args[0])
                if(!result.ok) return "<err>Inaccessible script location</err>";
                const script = await result.text()
                return await this.runCommand(script, true);
            } catch(err: unknown) {
                if (err instanceof Error) {
                    return `<err>Failed to fetch script: ${err.message}</err>`;
                }
                return `<err>Failed to fetch script: ${String(err)}</err>`;
            }
        }
    );
}