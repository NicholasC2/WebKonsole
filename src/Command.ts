export type CommandRun = (args: string[]) => Promise<string | void> | string | void;

export interface Command {
    alias: string[];
    run: CommandRun;
}

export function splitCommands(input: string): string[] {
    const commands: string[] = [];

    let current = "";
    let quote: "'" | '"' | null = null;
    let escaped = false;

    for (const char of input) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            escaped = true;
            continue;
        }

        if (quote) {
            if (char === quote) {
                quote = null;
            } else {
                current += char;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }

        if (char === ";") {
            if (current.trim()) {
                commands.push(current.trim());
            }
            current = "";
            continue;
        }

        current += char;
    }

    if (current.trim()) {
        commands.push(current.trim());
    }

    return commands;
}

export function tokenize(input: string): string[] {
    const tokens: string[] = [];

    let current = "";
    let quote: "'" | '"' | null = null;
    let escaped = false;

    for (const char of input) {
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            escaped = true;
            continue;
        }

        if (quote) {
            if (char === quote) {
                quote = null;
            } else {
                current += char;
            }
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            continue;
        }

        if (char === " ") {
            if (current) {
                tokens.push(current);
                current = "";
            }
            continue;
        }

        current += char;
    }

    if (current) {
        tokens.push(current);
    }

    return tokens;
}