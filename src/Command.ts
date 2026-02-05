import { Konsole } from "./Konsole";

type CommandRun = (
    konsole: Konsole,
    args: string[]
) => Promise<string | void>;
  
class Command {
    alias: string;
    run: CommandRun;
  
    constructor(
        alias: string,
        run: CommandRun = async () => "Command is missing a run function."
    ) {
        this.alias = alias;
        this.run = run;
    }
}

const commands: Command[] = []

export function getCommands() {
    return [...commands];
}

export function createCommand(alias: string, run: CommandRun) {
    if(!alias || alias.trim() == "") {
        throw new SyntaxError("Command must have alias");
    }

    if (alias.includes(" ")) {
        throw new SyntaxError("Command alias cannot contain spaces");
    }
    
    const exists = commands.some(c => c.alias === alias);

    if (exists) {
        throw new Error(`Command ${alias} already exists`);
    }

    commands.push(new Command(alias, run));
}

export function deleteCommand(alias: string) {
    const index = commands.findIndex(c => c.alias === alias);

    if (index !== -1) {
        commands.splice(index, 1);
    }
}

export function registerDefaultCommands() {
    createCommand(
        "echo",
        async function (this: Konsole, args) {
            if (args.length === 0) return "<err>Usage: echo <text></err>";
            return args.join(" ");
        }
    );

    createCommand(
        "clear",
        async function (this: Konsole, args) {
            if(args[0] == "--help") {
                return "Clears the terminal screen."
            } else {
                this.container.innerHTML = "";
            }
        }
    );

    createCommand(
        "wait",
        async function (this: Konsole, args) {
            if(args[0] == "--help") {
                return "Delays for a specified amount of milliseconds"
            } else {
                const time = parseInt(args[0], 10);
                if (isNaN(time) || time < 0) return "<err>Usage: wait <milliseconds></err>";
                await new Promise(res => setTimeout(res, time));
            }
        }
    );

    createCommand(
        "help", 
        async function (this: Konsole, args) {
            if(args[0] == "--help") {
                return "Delays for a specified amount of milliseconds"
            } else {
                if (args.length > 0) {
                    const commands = getCommands()
                    const cmd = commands.find(c => c.alias == args[0]);
                    return cmd ? `${cmd.alias}` : `<err>No such command: ${args[0]}</err>`;
                }

                const lines = commands.map(cmd => {
                    const aliases = cmd.alias;
                    const helpText = cmd.run(this, ["--help"]);
                    return `  ${aliases.padEnd(20)}`;
                });

                return "Available Commands:\n" + lines.join("\n");
            }
        }
    );

    createCommand(
        "version",
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
        "nl",
        "Prints a blank line.",
        "Usage: nl\nInserts a newline into the output.",
        async function () {
            return "\n";
        }
    );

    createCommand(
        "vars",
        "Lists all variables.",
        "Usage: vars\nLists all available variables that can be used with curly braces (e.g., {version}).",
        async function (this: Konsole) {
            const vars = Object.entries(this.options.variables);
            if (vars.length === 0) return "<err>No variables defined.</err>";
            
            return "Available Variables:\n" +
                vars.map(([key, value]) => `  ${key} = ${value.includes("\n") ? `[${value.split("\n")[0]}...]` : value}`).join("\n");
        }
    );

    createCommand(
        "about",
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
        "set",
        "Sets a variable for use in commands.",
        "Usage: set <variable> <value>\nSets a variable that can be used in commands with curly braces (e.g., {variable}).",
        async function (this: Konsole, _, args) {
            if (args.length < 2) return "<err>Usage: set <variable> <value></err>";
            const [key, ...valueParts] = args;
            const value = valueParts.join(" ");
            this.options.variables[key] = value;
            return `Variable ${key} set to "${value}"`;
        }
    );

    createCommand(
        "run",
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