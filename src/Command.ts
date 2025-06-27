import Konsole from "./Konsole.js";

export default class Command {
    public alias: string[];
    public description: string;
    public run: (this: Konsole, alias?: string, args?: string[]) => Promise<any> | any;
    constructor( alias: string[] = [], 
        description: string = "", 
        run: (this: Konsole, alias?: string, args?: string[]) => Promise<any> | any) {
        this.alias = alias;
        this.description = description;
        this.run = run;
    }
};