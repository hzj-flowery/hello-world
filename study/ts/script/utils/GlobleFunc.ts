
export var assert = function (value, ...str) {
    if (CC_DEBUG) {
        console.assert(value ,str.toString());
    }
}

export function clone(src) {
    return JSON.parse(JSON.stringify(src));
}

export var unpack = function (value: object): Array<any> {
    var arr: Array<any> = [];
    for (var j in value) {
        arr.push(value[j]);
    }
    return arr;
}

export var clone2 = function (origin: any) {
    if (!origin) {
        return null;
    }
    var data: any = {};
    for (var j in origin) {
        data[j] = origin[j];
    }
    return data;
}

export function rawget(msg, key){
    return msg[key];
}

export function rawequal(a,b){
    return a==b;
}



/**
 * 
 * function table.insertto(dest, src, begin)
    begin = checkint(begin)
    if begin <= 0 then
        begin = #dest + 1
    end

    local len = #src
    for i = 0, len - 1 do
        dest[i + begin] = src[i + 1]
    end
end
 * @param src 
 * @param data 
 * @param pos 
 */

export var insertto = function (dest: Array<any>, src, begin: number):Array<any> {
    // var newData: Array<any> = [];
    // for (var j = 0; j < begin; j++) {
    //     newData.push(dest[j]);
    // }
    // for(var j =0;j<src.length;j++)
    // {
    //     newData.push(src[j]);
    // }
    // for(var j = begin;j<dest.length;j++)
    // {
    //     newData.push(dest[j]);
    // }
    // dest = newData;
    // return dest;
    begin = Math.floor(begin);
    if(begin<=0)
    begin = dest.length;
    var len = src.length;
    for(var j =0;j<=len-1;j++)
    {
        dest[j + begin] = src[j]
    }
    return dest;
}

export function ObjKeyLength(obj:any) {
    if (!obj) {
        return 0;
    }
    var len = 0;
    for (var key in obj) {
        len++;
    }
    return len;
}

export function uniquePush(arr:any[], value) {
    if (arr.indexOf(value) == -1) {
        arr.push(value);
    }
}

export function applyFunc(f:Function, params) {
    if (!params || params.length == 0) {
        f();
    }else {
        switch(params.length) {
            case 1:
                f(params[0]);
                break;
            case 2:
                f(params[0], params[1]);
                break;
            case 3:
                f(params[0], params[1], params[2]);
                break;
            case 4:
                f(params[0], params[1], params[2], params[3]);
                break;
            default:
                break;
        }
    }
}

export var APP_DEVELOP_MODE = false;