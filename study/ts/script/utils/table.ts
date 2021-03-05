class Table {
    static insert(data: any[], item) {
        data.push(item);
    }

    static remove(list: any[], idx) {
        list.splice(idx, 1);
    }

    static getn(t):number{
        let count:number = 0;
       for(let j in t)
       {
           count++;
       }
       return count;
    }
    
    static maxn(boutInfo){
        let keys = [];
        for(let k in boutInfo)
        {
           let tep = parseInt(k);
           if(typeof tep=="number")
           {
               keys.push(tep);
           }
           else
           {
               console.log("warn----",k);
           }
        }
        if(keys.length>0)
        {
            keys.sort();
        }
        else
        {
            console.log("error 没有找到索引为数字的key");
            return null;
        }
        return keys[keys.length-1];
    }

    static sort(array: any[], sortFunc: (a, b) => boolean) {
        array && array.sort((a, b) => {
            return sortFunc(a, b) ? -1 : 1;
        })
    }

    static insertValueByPos(data: Array<any>, pos: number, value: any) {
        if(data&&data.length==0)
        {
            data.push(value);
            return;
        }
        var newRet = [];
        for (var j = 0; j < data.length; j++) {
            if (j == pos) {
                newRet.push(value);
            }
            newRet.push(data[j]);
        }
        return newRet;
    }

    static nums(data: any): number {
        var count = 0;
        for (var j in data) {
            if (data[j]) {
                count++;
            }
        }
        return count;
    }

    static values(data: any): Array<any> {
        var ret: Array<any> = [];
        for (var k in data) {
            ret.push(data[k]);
        }
        return ret;

    }

    static keys(data: any): Array<any> {
        var ret: Array<any> = [];
        for (var k in data) {
            ret.push(k);
        }
        return ret;

    }
}
export { Table as table };
