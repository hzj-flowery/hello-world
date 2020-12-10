import {Visitor} from './Visitor'
import { IParser } from '../parsers/IParser';
export class PrintVisitor implements Visitor {
    enter(parser: IParser, path: Array<string | number>) {
        console.log(JSON.stringify(path), JSON.stringify(parser.node));
    }

    leave(parser: IParser, path: Array<string | number>) {

    }
}