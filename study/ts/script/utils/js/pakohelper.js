(function(){

    var pako = {}
    window['pako'] = pako;

    var async = true;

    var version = 0;
    if (cc.sys.platform === cc.sys.WECHAT_GAME && cc.sys.os === cc.sys.OS_ANDROID) {
        try {
            var info = wx.getSystemInfoSync();
            version = parseInt(info.version.split(".")[0]);
        } catch (error) {
            console.log(error);
        }
        if (version >= 8) {
            async = false;
        }
    }


    var queue = {};
    var inQueue = [];
    var url, worker;
    if (CC_PREVIEW) {
        url = 'plugins/assets/resources/script/workers/pako.js';
    } else if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        url = 'workers/index.js';
    } else {
        url = 'workers/pako_inflate.min.js';
    }

    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
        if (async) {
            worker = wx.createWorker(url);
            worker.onMessage(onMessage)   
        } else {
            worker = require("../../../../../../pako_inflate.min.js");
        }
    } else {
        worker = new Worker(url);
        worker.onmessage = onMessage;
        worker.onerror = onError;
    }

    function inflate(name, buffer, toString, callback) {
        if (async) {
            if (inQueue.indexOf(name) < 0) {
                if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                    var options
                    if (toString) {
                        options = {to: 'string'}
                    }
                    worker.postMessage({data: buffer, options: options});
                } else{
                    if (toString) {
                        options = {to: 'string'}
                        worker.postMessage(options);
                    }
                    worker.postMessage(buffer, [buffer]);
                }
                inQueue.push(name);
                queue[name] = [];
            }
            let info = {
                name: name,
                buffer: buffer,
                cb: callback
            }
            queue[name].push(info);
        } else {
            callback(null, worker.inflate(buffer, {to: 'string'}));
        }
    }

    pako.inflate = inflate;

    function onMessage(e) {
        var infoes = shiftQueue()
        for (let i = 0; i < infoes.length; i++) {
            infoes[i].cb(e.err, e.data);
        }

    }

    function onError(e) {
        console.warn(e);
        var infoes = shiftQueue()
        if (!infoes) {
            return;
        }
        for (let i = 0; i < infoes.length; i++) {
            infoes[i].cb(e);
        }
    }

    function shiftQueue(){
        var name = inQueue.shift();
        var infoes = queue[name];
        delete queue[name];
        if (!infoes || !infoes.length) {
            return;
        }

        return infoes;
    }
})()
