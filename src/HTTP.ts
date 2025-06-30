import Command from "./Command.js";

export default class HTTP extends Command {

    constructor() {
        super(
            ["fetch"],
            "Sends an HTTP GET request to the specified URL",
            async function (_alias, args) {
                if (!args || args.length === 0) {
                    return "Usage: fetch <url>";
                }
                const url = args[0];
                try {
                    const response = await fetch("https://corsproxy.io/?url=" + encodeURIComponent(url || "https://example.com"));
                    if (!response.ok) {
                        return `Error: ${response.status} ${response.statusText}`;
                    }
                    const data = await response.text();
                    return data;
                } catch (error: any) {
                    return `Fetch error: ${error.message}`;
                }
            }
        )
    }
}