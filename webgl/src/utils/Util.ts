
export class Util {
    

    static format(str, ...args) {
        var index = 0;
        return str.replace(/(%[0-9]*[a-zA-Z0-9])/g, function (str, match, number) {
            var rep = args[index];
            var need2Num = str.indexOf('2') > 0;
            var result = rep != 'undefined' ? rep : "";
            if(need2Num && typeof(rep) == 'number' && rep < 10){
                result = '0'+result
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

    //最小min，最大max-1
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    static urlencode(str:string){
        var ret="";
        for(var i=0;i<str.length;i++){
            var chr = str.charAt(i);
            if(chr == "+"){
                ret+=" ";
            }else if(chr=="%"){
                var asc = str.substring(i+1,i+3);
                if(parseInt("0x"+asc)>0x7f){
                    ret+=(parseInt("0x"+asc+str.substring(i+4,i+6))).toString();
                    i+=5;
                }else{
                    ret+=(parseInt("0x"+asc)).toString();
                    i+=2;
                }
            }else{
                ret+= chr;
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
