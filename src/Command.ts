export type CommandRun = (args: CommandArguments) => Promise<string | void>;

export interface Command {
    alias: string | string[];
    run: CommandRun;
}

export type CommandArguments = string[]; // includes the command