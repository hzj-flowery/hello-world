
export class Util {


    static format(str, ...args) {
        var index = 0;
        return str.replace(/(%[0-9]*[a-zA-Z0-9])/g, function (str, match, number) {
            var rep = args[index];
            var need2Num = str.indexOf('2') > 0;
            var result = rep != 'undefined' ? rep : "";
            if (need2Num && typeof (rep) == 'number' && rep < 10) {
                result = '0' + result
            }
            index++;
            return result;
        });
    }

    static formatTimeStr(time: number): string {
        if (time < 0) {
            return time.toString();
        }
        else if (time >= 0 && time < 10) {
            return "0" + time.toString();
        }
        else {
            return time.toString();
        }
    }

    static rgbaToHex(rgba) {
        // 先剪除字符中的空格，避免写正则时加入过多的\s*; 但是r  g  b(10, 2  0, 30) 也会判定为正确的表示颜色字符串。实际使用中也不会出现这种。
        rgba = rgba.replace(/\s+/g, "");
        let pattern = /^rgba?\((\d+),(\d+),(\d+),?(\d*\.\d+)?\)$/,
            result = pattern.exec(rgba);
        if (!result) {
            throw new Error(`传入的${rgba}格式不正确`);
        }

        /* r:result[1], g:result[2], b:result[3], a: result[4] */
        let colors = [];
        for (var i = 1, len = 3; i <= len; ++i) {
            let str = Number(result[i]).toString(16);
            if (str.length == 1) {
                str = 0 + str;
            }
            colors.push(str);
        }

        return {
            color: "#" + colors.join(""),
            opacity: result[4] ? result[4] : "1",
        };
    }

    static hexToRgb(hex: string) {
        /*
          hex: {String}, "#333", "#AF0382"
          "0xffffffff"
        */
        if (hex.indexOf("0x") >= 0) {
            hex = hex.slice(2);
        }
        else {
            hex = hex.slice(1);
        }
        if (hex.length == 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        return {
            r: Number.parseInt(hex.slice(0, 2), 16),
            g: Number.parseInt(hex.slice(2, 4), 16),
            b: Number.parseInt(hex.slice(4, 6), 16),
            a: Number.parseInt(hex.slice(6, 8), 16)
        }
    }

    /*
      输出如下
      {r: 85, g: 85, b: 85}
      {r: 175, g: 56, b: 35}
    */

    //最小min，最大max-1
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    static urlencode(str: string) {
        var ret = "";
        for (var i = 0; i < str.length; i++) {
            var chr = str.charAt(i);
            if (chr == "+") {
                ret += " ";
            } else if (chr == "%") {
                var asc = str.substring(i + 1, i + 3);
                if (parseInt("0x" + asc) > 0x7f) {
                    ret += (parseInt("0x" + asc + str.substring(i + 4, i + 6))).toString();
                    i += 5;
                } else {
                    ret += (parseInt("0x" + asc)).toString();
                    i += 2;
                }
            } else {
                ret += chr;
            }
        }
        return ret;
    }

    static compareVersion(version1: string, version2: string): 1 | 0 | -1 {
        let v1 = version1.split('.');
        let v2 = version2.split('.');

        const len = Math.max(v1.length, v2.length);

        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);

            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }

        return 0;
    }
}
