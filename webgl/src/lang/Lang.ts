import { LangTemplate } from "./LangTemplate";

export class Lang {

    // 获取文本
    public static get(key, values?:any): string {
        let tmpl: string = LangTemplate[key];
        if (!tmpl) {
            return key;// 直接返回key作为默认值，目的是直接显示此key来表示这个key找不到值
        }

        if (values != null) {
            //replace vars in tmpl
            for (const k in values) {
                if(values[k]==null)continue;
                values[k] = values[k].toString().replace("%%", "____");//先把%换成其他的。
                var reg = new RegExp("#" + k + "#", "g")
                tmpl = tmpl.replace(reg, values[k]);       
                tmpl = tmpl.replace("____", "%%");
            }
        }
        return tmpl;
    }

    //直接传入文字，获得格式化文本
    public static getTxt(str, values) {
        return this.getTxtWithMark(str, values, "#");
    }

    public static getTxtWithMark(str, values, mark) {
        let tmpl = str;
        if (values != null) {
            for (const key in values) {
                var reg = new RegExp("#" + key + "#", "g")
                tmpl = tmpl.replace(reg, values[key]);
            }
        }
        return tmpl;
    }

    public static  getTableTxt(table, values) {
        var tmpl = table;
        var formatFunc = function (param) {
            for (let k in param) {
                var v = param[k];
                if (typeof(v) == 'string') {
                    param[k] = Lang.getTxt(v, values);
                } else if (typeof(v) == 'object') {
                    formatFunc(v);
                }
            }
        }
        if (values != null) {
            formatFunc(tmpl);
        }
        return tmpl;
    };
}