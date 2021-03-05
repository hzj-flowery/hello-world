import { stringUtil } from "./StringUtil";

export var UTF8: any = {};
UTF8.getUtf8charByteNum = function (ch) {
    var byteNum = 0;
    if (ch >= 252 && ch < 254) {
        byteNum = 6;
    } else if (ch >= 248) {
        byteNum = 5;
    } else if (ch >= 240) {
        byteNum = 4;
    } else if (ch >= 224) {
        byteNum = 3;
    } else if (ch >= 192) {
        byteNum = 2;
    } else if (ch > 0 && ch <= 127) {
        byteNum = 1;
    }
    return byteNum;
};
UTF8.utf8charbytes = function (s, i) {
    i = i || 0;
    var c = stringUtil.byte(s, i);
    return UTF8.getUtf8charByteNum(c);
};
UTF8.utf8len = function (s) {
    return s.length;
};
UTF8.utf8sub = function (s, i, j) {
    return stringUtil.sub(s,i,j);
};
UTF8.utf8replace = function (s, mapping) {
    var pos = 0;
    var bytes = stringUtil.len(s);
    var charbytes;
    var newstr = '';
    while (pos < bytes) {
        charbytes = UTF8.utf8charbytes(s, pos);
        var c = stringUtil.sub(s, pos, pos + charbytes - 1);
        newstr = newstr + (mapping[c] || c);
        pos = pos + charbytes;
    }
    return newstr;
};