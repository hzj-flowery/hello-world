import { Visitor } from "./Visitor";
import { IParser } from "../parsers/IParser";

export class VarargLiteralVisitor implements Visitor {
    private inThreeDotFunction: boolean;
    private threeDotUsed: number;

    constructor() {
        this.inThreeDotFunction = false;
        this.threeDotUsed = 0;
    }

    public enter(parser: IParser): void {
        if (this.inThreeDotFunction) {
            if (parser.node.type === 'VarargLiteral') {
                this.threeDotUsed++;
            }
        } else {
            if (this.isThreeDotFunction(parser)) {
                this.inThreeDotFunction = true;
            }
        }
    }

    public leave(parser: IParser): void {
        if (this.inThreeDotFunction && this.isThreeDotFunction(parser)) {
            if (this.threeDotUsed <= 1) {
                //一次是在arguments中，所有至少是2次，body中才有可能使用了变长参数
                let parameters = parser.getChildAt('parameters') as Array<IParser>;
                for (let i = 0 ; i < parameters.length; i++) {
                    let param = parameters[i];
                    if (param.node.type === 'VarargLiteral') {
                        parameters.splice(i, 1);
                        break;
                    }
                }

            }

            this.threeDotUsed = 0;
            this.inThreeDotFunction = false;
        }
    }

    private isThreeDotFunction(parser: IParser): boolean {
        let node = parser.node;
        if (node.type === 'FunctionDeclaration') {
            let parameters = parser.getChildAt('parameters') as Array<IParser>;
            for (let i = 0 ; i < parameters.length; i++) {
                let param = parameters[i];
                if (param.node.type === 'VarargLiteral') {
                    return true;
                }
            }
        }

        return false;
    }

}
