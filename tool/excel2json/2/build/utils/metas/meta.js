const fs = require('fs');

function meta(content) {
    this.content = content;
}

let proto = meta.prototype;

proto.getMetaByIndex = function(i) {
    return this.content[i];
}

proto.toString = function() {
    return JSON.stringify(this.content);
}

module.exports = meta;