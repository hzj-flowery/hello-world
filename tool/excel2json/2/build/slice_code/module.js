const {getShortName} = require('./nameMap')

function Module(ast) {
    this.name = ast.key;
    let value=  ast.value;
    this.function = value[0];
    this.map = value[1];
}

let proto = Module.prototype;

proto.convertName = function() {
    this.shortName = getShortName(this.name)
    this.convertedFunc = {
        type: this.function.type
    }
}

proto.toString = function() {

}

module.exports = Module