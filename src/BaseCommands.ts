import Command from "./Command.js";

let baseCommands: Command[] = [];

baseCommands.push(
    new Command(["echo"], "Repeats anything after the command", async function (_alias, args) {
        if (!args) {
            return "";
        }
        return args!.join(" ");
    })
);

baseCommands.push(
    new Command(["clear"],
        "Clears the terminal", async function () {
            this.buffer = [this.options.prefix!];
        })
);

baseCommands.push(
    new Command(["help"], "Displays all commands", async function () {
        let output = `help for Konsole {version}\n  commands:\n`;
        for (const cmd of this.commands) {
            output += `   ${cmd.alias.join(" or ")} : ${cmd.description || ''}\n`;
        }
        return output;
    })
);

baseCommands.push(
    new Command(["wait"],
        "Delays for the amount of seconds specified", async (_alias, args) => {
            if (!args) {
                return await new Promise(resolve => setTimeout(resolve, 1));
            }
            return await new Promise(resolve => setTimeout(resolve, Number(args[0]) * 1000));
        }
    )
)

baseCommands.push(
    new Command(
        ["version"],
        "Displays version information", async function () {
            return `Konsole Version: {version}
Konsole Branch: {branch}
Developers: NicholacsC, BoxyPlayz`
        }
    )
)

baseCommands.push(
    new Command(["popup"], "Shows a popup", async function (_alias, args) {
        if (!args) {
            return "";
        }
        alert(args.join(" "));
        return;
    })
);

export default baseCommands;