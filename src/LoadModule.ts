import Command from "./Command.js";

export default class LoadModule extends Command {
    constructor() {
        super(
            ["load"],
            "Loads a module from a specified URL",
            async function (_alias, args) {
                if (!args || args.length === 0) {
                    return "Usage: load <url>";
                }
                const url = args[0];
                try {
                    const module = import(url || "https://example.com");
                    const commandClass = eval((await module).default);
                    if (!commandClass) {
                        return "Error: Loaded module is not a valid Command class.";
                    }
                    const instance = new commandClass;
                    if (!(instance instanceof Command)) {
                        return "Error: Loaded module is not a valid Command.";
                    }
                    this.register(instance);
                    return `Module loaded successfully: ${instance.alias.join(", ")}`;
                } catch (error: any) {
                    return `Fetch error: ${error.message}`;
                }
            }
        )
    }
}