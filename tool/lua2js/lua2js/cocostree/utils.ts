import {IParser} from '../parsers/IParser'

let toJs: any;
export function getConvertResult(parser: IParser): ESTree.Node {
    if (!parser) {
        let node: any = {
            "type": "Literal",
            "value": null,
            "raw": "null"
        }

        return node;
    }

    let result = customConvert(parser);
    if (result) {
        return result;
    }

    toJs = toJs || require('./lua2js').toJs
    return toJs[parser.type](parser);
}

let custom: any;
function customConvert(parser: IParser): ESTree.Node | undefined {
    custom = custom || require('./customLua2js').custom2js
    for (let i = 0; i < custom.length; i++) {
        let c = custom[i];
        if (c.test(parser)) {
            return c.convert(parser);
        }
    }
}