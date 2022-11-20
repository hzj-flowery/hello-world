class StringUtil {
    /**  ---------------------------------------- format() start -------------------------------------- */
    private esc(s, r) {
        for (let i = 0; i < r.length; i += 2)
            s = s.replace(r[i], r[i + 1]);
        return s;
    }

    private formatUnit(param, pMinLength, pPrecision) {
        let mf = pMinLength ? parseInt(pMinLength) : 1000;
        let pr = pPrecision ? Math.floor(10 * parseFloat('0' + pPrecision)) : 2;

        let i = 0;
        let val = parseFloat(param || 0);
        let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];

        for (i = 0; (i < units.length) && (val > mf); i++)
            val /= mf;
        return val.toFixed(pr) + ' ' + units[i];
    }
    private formatTime(param) {
        let ts = param || 0;
        let tm = 0;
        let th = 0;
        let td = 0;

        if (ts > 59) {
            tm = Math.floor(ts / 60);
            ts = ts % 60;
        }

        if (tm > 59) {
            th = Math.floor(tm / 60);
            tm = tm % 60;
        }

        if (th > 23) {
            td = Math.floor(th / 24);
            th = th % 24;
        }
        return td > 0 ? this.format('%dd %dh %dm %ds', [td, th, tm, ts]) : this.format('%dh %dm %ds', [th, tm, ts]);
    }

    format(str, args: any[]) {
        const html_esc = [/&/g, '&#38;', /"/g, '&#34;', /'/g, '&#39;', /</g, '&#60;', />/g, '&#62;'];
        const quot_esc = [/"/g, '&#34;', /'/g, '&#39;'];


        let out = '';
        let re = /^(([^%]*)%('.|0|\x20)?(-)?(\d+)?(\.\d+)?(%|b|c|d|u|f|o|s|x|X|q|h|j|t|m))/;
        let a = [];
        let numSubstitutions = 0;

        while ((a = re.exec(str)) !== null) {
            let m = a[1];
            let leftpart = a[2], pPad = a[3], pJustify = a[4], pMinLength = a[5];
            let [pPrecision, subst] = a[6], pType = a[7];

            if (pType === '%') {
                subst = '%';
            } else {
                if (numSubstitutions < args.length) {
                    let param = args[numSubstitutions++];

                    let pad = ' ';
                    if (pPad && pPad.substr(0, 1) === '\'')
                        pad = leftpart.substr(1, 1);
                    else if (pPad)
                        pad = pPad;

                    let justifyRight = true;
                    if (pJustify && pJustify === '-')
                        justifyRight = false;

                    let minLength = -1;
                    if (pMinLength)
                        minLength = parseInt(pMinLength);

                    let precision = -1;
                    if (pPrecision && pType === 'f')
                        precision = parseInt(pPrecision.substring(1));

                    subst = param;

                    switch (pType) {
                        case 'b':
                            subst = (parseInt(param) || 0).toString(2);
                            break;

                        case 'c':
                            subst = String.fromCharCode(parseInt(param) || 0);
                            break;

                        case 'd':
                            subst = (parseInt(param) || 0);
                            break;

                        case 'u':
                            subst = Math.abs(parseInt(param) || 0);
                            break;

                        case 'f':
                            subst = (precision > -1) ? ((parseFloat(param) || 0.0)).toFixed(precision) : (parseFloat(param) || 0.0);
                            break;

                        case 'o':
                            subst = (parseInt(param) || 0).toString(8);
                            break;

                        case 's':
                            subst = param;
                            break;

                        case 'x':
                            subst = ('' + (parseInt(param) || 0).toString(16)).toLowerCase();
                            break;

                        case 'X':
                            subst = ('' + (parseInt(param) || 0).toString(16)).toUpperCase();
                            break;

                        case 'h':
                            subst = this.esc(param, html_esc);
                            break;

                        case 'q':
                            subst = this.esc(param, quot_esc);
                            break;

                        case 'j':
                            //  subst = String.serialize(param);
                            break;

                        case 't':
                            subst = this.formatTime(param);
                            break;

                        case 'm':
                            subst = this.formatUnit(param, pMinLength, pPrecision);
                            break;
                    }

                    subst = (typeof (subst) === 'undefined') ? '' : subst.toString();

                    if (minLength > 0 && pad.length > 0) {
                        let padLength = minLength - subst.length;
                        for (let i = 0; i < padLength; i++)
                            subst = justifyRight ? (pad + subst) : (subst + pad);
                    }
                }
            }

            out += leftpart + subst;
            str = str.substr(m.length);
        }
        return out + str;
    }

    /**-----------------format() end--------------------- */

    gsub(src: string, find, replace) {
        return src.replace(find, replace);
    }

    len(src: string) {
        return src.length;
    }

    sub(src: string, start: number, end?: number) {
        return src.substring(start - 1, end);
    }

    find(src: string, find, startIdx = 0) {
        return src.indexOf(find, startIdx);
    }

    split(src: string, separator) {
        return src.split(separator);
    }

    byte(src: string, index) {
        var bytes = [];
        var c = src.charCodeAt(index);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
        return bytes[0];
    }

    trim(src: string) {
        return src.trim();
    }

    utf8len(str: string) {
        if (str == null) {
            return 0;
        }
        // var realLength = 0; 
        // var len = str.length; 
        // var charCode = -1; 
        // for(var i = 0; i < len; i++){ 
        //     charCode = str.charCodeAt(i); 
        //     if (charCode >= 0 && charCode <= 128) {  
        //         realLength += 1; 
        //     }else{  
        //         // 如果是中文则长度加3 
        //         realLength += 3; 
        //     } 
        // }  
        // return realLength; 
        return str.length;
    }
}

export let stringUtil = new StringUtil();