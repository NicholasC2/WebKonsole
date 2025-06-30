import Command from "./Command.js";

export default class Jeff extends Command {
    constructor() {
        super(
            ["jeff"],
            "Jeff.",
            async function (_alias, _args) {
                this.works = false;
                await new Promise(resolve => setTimeout(resolve, 5000));
                alert("Konsole is now Jeff.")
                return await new Promise(resolve => setTimeout(resolve, 999999999))
            }
        );
    }
}