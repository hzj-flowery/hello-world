import { VariableType } from "./VariableType";

export interface Variable {
    type: VariableType,
    luaname: string,
    jsname: string,
    [key: string]: any
}