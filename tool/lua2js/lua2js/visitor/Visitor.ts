import { IParser } from "../parsers/IParser";

export interface Visitor {
    enter(parser: IParser, path: Array<string | number>): void
    leave(parser: IParser, path: Array<string | number>): void
}