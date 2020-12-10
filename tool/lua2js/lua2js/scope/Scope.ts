import { ScopeType } from "./ScopeType";
import { VariableType } from "./VariableType";
import { Variable } from "./Variable"; import { Property } from "./Property";

export class Scope {
    public children: {[key: string]: Scope};

    public parent: Scope | undefined;

    private variables: {[key: string]: Variable};

    constructor(public readonly type: ScopeType, public readonly name: string) {
        this.variables = {};
        this.children = {};
        this.variables = {};
    }

    public addChild(scope: Scope) {
        scope.parent = scope;
        this.children[scope.name] = scope;
    }

    public setVar(name: string, variable: Variable) {
        if (this.variables[name]) {
            console.warn('repeat variable:', name, this.name, this.type)
            return;
        }

        this.variables[name] = variable;
    }

    public changeVarType(name: string, type: VariableType) {
        let variable = this.getVar(name);
        if (variable) {
            variable.type = type;
        } else {
            console.error('unknown variable:', name);
        }
    }

    public getVar(name: string): Variable | undefined {
        let scope: Scope | undefined = this;
        while(scope && !scope.variables[name]) {
            scope = scope.parent;
        }

        if (scope) {
            return scope.variables[name];
        }
    }

    public setProperty(name: string, base: string, property: Property) {

    }
}