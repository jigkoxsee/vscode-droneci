import * as vscode from 'vscode';
import { emojify } from 'node-emoji';
import { ViewNode } from './viewnode';

export class APIConfig {
    constructor(
        public readonly server: string,
        public readonly token: string
    ) { }
}

export const getConfig = () => {
    let server = vscode.workspace.getConfiguration('droneci').get<string>('server','');
    let token = vscode.workspace.getConfiguration('droneci').get<string>('token','');
    return new APIConfig(server, token);
 };

function EmojiStatus(status: string): string {
    switch (status) {
        case 'success':
            return '✅';
        case 'failure':
            return '❌';
        case 'running':
            return '🕐';
        case 'killed':
            return '🔪';
        case 'skipped':
            return '🚫';
        default:
            return '❔';
    }
}

export class Feed extends ViewNode {

    constructor(
        // public readonly active: Boolean,
        public readonly build: Build,
        public readonly name: string,
        public readonly slug: string,
        public readonly uid: string,
        public readonly version: Number,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(`${EmojiStatus(build.status)}${build.number} ${emojify(build.message)}`, collapsibleState);
    }


    get tooltip(): string {
        return `${this.slug}-${this.build.source}`;
    }

    get description(): string {
        return `${this.build.status}`;
    }

    get iconPath(): any {
        return vscode.Uri.parse(this.build.author_avatar);
    }
    get uri(): string {
        return `/api/repos/${this.slug}/builds/${this.build.number}`;
    }

    contextValue = 'feed';

}

export class Build extends ViewNode {
    constructor(
        public readonly author_avatar: string,
        public readonly author_name: string,
        public readonly created: Number,
        public readonly number: Number,
        public readonly link: string,
        public readonly message: string,
        public readonly status: string,
        public readonly source: string,
        public readonly stages: Stage[],
    ) {
        super(`${author_name}`, vscode.TreeItemCollapsibleState.Collapsed);
    }
    contextValue = 'build';
}

class Stage extends ViewNode {
    constructor(
        public readonly name: string,
        public readonly number: Number,
        public readonly steps: Step[],
    ) {
        super(name, vscode.TreeItemCollapsibleState.Collapsed);
    }
    contextValue = 'stage';

}

export class Step extends ViewNode {
    constructor(
        public readonly slug: string,
        public readonly build_number: Number,
        public readonly stage_number: Number,
        public readonly number: Number,
        public readonly name: string,
        public readonly status: string,
    ) {
        super(`${EmojiStatus(status)} ${name}`, vscode.TreeItemCollapsibleState.None);
    }

    get description(): string {
        return `${this.name}`;
    }

    get tooltip(): string {
        return `${this.status}`;
    }

    get link(): string {
        return `${this.slug}/${this.build_number}/${this.stage_number}/${this.number}`;
    }

    get logUri(): string {
        return `api/repos/${this.slug}/builds/${this.build_number}/logs/${this.stage_number}/${this.number}`;
    }
    contextValue = 'step';
}

export class StepLog {
    constructor(
    public readonly pos: Number,
    public readonly out: string,
    public readonly time: Number
    ) {

    }
    toString(): string{
        return this.out;
    }
}