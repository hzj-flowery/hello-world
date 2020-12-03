const meta = require('./meta');
function texture2d(content) {
    meta.call(this, content);
    let datas = this.content.data.split('|');
    this.content = datas.map((d) => {
        return {
            __type__: "cc.Texture2D",
            content: d
        }
    })
}

let proto = texture2d.prototype = Object.create(meta.prototype);
proto.constructor = texture2d;

proto.toString = function() {
    return JSON.stringify({
        type: 'cc.Texture2D',
        data: this.content.map((c) => {
            return c.content
        }).join('|')
    })
}

module.exports = texture2d;