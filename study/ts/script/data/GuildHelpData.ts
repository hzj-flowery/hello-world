import { BaseData } from "./BaseData";

export interface GuildHelpData {
    getMember(): Object
    setMember(value: Object): void
    getLastMember(): Object
    getHelp_base(): Object
    setHelp_base(value: Object): void
    getLastHelp_base(): Object
}
let schema = {};
schema['member'] = [
    'object',
    {}
];
schema['help_base'] = [
    'object',
    {}
];
export class GuildHelpData extends BaseData {
    public static schema = schema;

    constructor(properties?) {
        super(properties);
    }
    public clear() {
    }
    public reset() {
    }
}
