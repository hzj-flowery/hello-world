"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var Parser = /** @class */ (function () {
    function Parser(node, parent) {
        var _this = this;
        this.node = node;
        this.parent = parent;
        this.children = {};
        var visitorKeys = utils_1.getVisitorKeys(this.node.type);
        visitorKeys.forEach(function (k) {
            var node = _this.node;
            var child = node[k];
            delete node[k];
            if (Array.isArray(child)) {
                var arrayParser = [];
                for (var i = 0; i < child.length; i++) {
                    arrayParser[i] = new Parser(child[i], _this);
                }
                _this.children[k] = arrayParser;
            }
            else if (child) {
                _this.children[k] = new Parser(child, _this);
            }
        });
    }
    Parser.prototype.parseVariableTypes = function (scopeStack, root) {
    };
    Parser.prototype.traverse = function (visitor) {
        for (var key in this.children) {
            var child = this.children[key];
            if (Array.isArray(child)) {
                for (var i = 0; i < child.length; i++) {
                    visitor.enter(child[i], [key, i]);
                    child[i].traverse(visitor);
                    visitor.leave(child[i], [key, i]);
                }
            }
            else {
                visitor.enter(child, [key]);
                child.traverse(visitor);
                visitor.leave(child, [key]);
            }
        }
    };
    Parser.prototype.removeFromParent = function () {
        var parent = this.parent;
        if (!parent) {
            return;
        }
        var keys = Object.keys(parent.children);
        var key;
        var children;
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            children = parent.children[key];
            if (children === this) {
                delete parent.children[key];
                break;
            }
            else if (Array.isArray(children)) {
                var index = children.indexOf(this);
                if (index > -1) {
                    children.splice(index, 1);
                }
                else {
                    console.warn("can't find node from parent", JSON.stringify(this.node));
                }
            }
        }
        this.parent = null;
    };
    Parser.prototype.addToParent = function (parent, path) {
        this.removeFromParent();
        parent.addChild(this, path);
    };
    Parser.prototype.addChild = function (child, path) {
        child.removeFromParent();
        child.parent = this;
        var path0 = path[0];
        var children = this.children[path0];
        if (!children) {
            if (path.length === 1) {
                this.children[path0] = child;
            }
            else {
                var path1 = path[1];
                children = [];
                this.children[path0] = children;
                children.splice(path1, 0, child);
            }
        }
        else {
            if (path.length === 1) {
                // console.warn('replace child', JSON.stringify(this.node), path[0])
                this.children[path0] = child;
            }
            else {
                children = children;
                var path1 = path[1];
                children.splice(path1, 0, child);
            }
        }
    };
    Parser.prototype.getChildAt = function (path) {
        return this.children[path];
    };
    Object.defineProperty(Parser.prototype, "type", {
        get: function () {
            return this.node.type;
        },
        enumerable: true,
        configurable: true
    });
    Parser.prototype.toLuaNode = function () {
        var node = Object.assign({}, this.node);
        for (var key in this.children) {
            var child = this.children[key];
            if (Array.isArray(child)) {
                node[key] = [];
                for (var i in child) {
                    node[key][i] = child[i].toLuaNode();
                }
            }
            else {
                node[key] = child.toLuaNode();
            }
        }
        return node;
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map