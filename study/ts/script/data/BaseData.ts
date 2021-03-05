import { TimeExpiredData } from "./TimeExpiredData";
import { StringUcfirst } from "../utils/handler";
import { Util } from "../utils/Util";

function filterProperties(properties, filter) {
    for (let i in filter) {
        let field = filter[i];
        properties[field] = null;
    }
}
export class BaseData extends TimeExpiredData {
    public static schema: {[key: string]: any} = { id: ['string'] };
    public static fields = ['id'];

    constructor (properties?) {
        super();
        if (!properties || typeof properties != 'object') {
            properties = {};
        }
        this.setProperties(properties);
    }

    public setProperties (properties) {
       // console.assert(typeof properties == 'object', '%s:setProperties() - invalid properties');
        for (let field in (this.constructor as any).schema) {
            let schema = (this.constructor as any).schema[field];
            let typ = schema[0], def = schema[1], id = schema[2];
            let propname = field + '_';
            let val = null;
            if (properties[field] !== null && properties[field] !== undefined) {
                val = properties[field];
            }
            if (val !== null && val !== undefined) {
                if (typ == 'number') {
                    val = Number(val);
                }
                if (typ == 'boolean') {
                    if (val == 'true' || val == true) {
                        val = true;
                    } else {
                        val = false;
                    }
                }
           // console.assert(typeof properties == 'object', '%s:setProperties() - invalid properties');
                this[propname] = val;
            } else if ((this[propname] === null || this[propname] === undefined) && 
                (def !== null && def !== undefined)) {
                if (typeof def == 'object') {
                    //先用json，发现问题再修复
                    val =def.length == undefined ? {} : []; // JSON.parse(JSON.stringify(def));
                } else if (typeof def == 'function') {
                    val = def();
                } else {
                    val = def;
                }
                this[propname] = val;
            }
            var keyName = StringUcfirst(field);
            let skey = 'set' + keyName;
            if (this[skey] === undefined || this[skey] === null) {
                this[skey] = function (this, value) {
                    this[field + '_'] = value;
                };
            }
            let g = 'get';
            if (typ == 'boolean') {
                g = 'is';
            }
            let gkey = g + keyName;
            if (this[gkey] === undefined || this[skey] === null) {
                this[gkey] = function (this) {
                    return this[field + '_'];
                };
            }
        }
        return this;
    }
    public getProperties (fields, filter) {
        let schema = (this.constructor as any).schema;
        if (typeof fields != 'object') {
            fields = (this.constructor as any).fields;
        }
        let properties = {};
        for (let i in fields) {
            let field = fields[i];
            let propname = field + '_';
            let typ = schema[field][0];
            let val = this[propname];
            //console.assert(typeof val == typ, '%s:getProperties() - type mismatch.format(%s expected %s, actual is %s');
            properties[field] = val;
        }
        if (typeof filter == 'object') {
            filterProperties(properties, filter);
        }
        return properties;
    }
    public backupProperties () {
        for (let field in (this.constructor as any).schema) {
            let schema = (this.constructor as any).schema[field];
            let propname = field + '_';
            let typ = schema[0];
            let val = this[propname];
           // console.assert(typeof val == typ, '%s:getProperties() - type mismatch, %s expected %s, actual is %s');
            this[field + '_last_'] = val;
            let g = 'get';
            if (typ == 'boolean') {
                g = 'is';
            }
            let gkey = g + ('Last' + StringUcfirst(field));
            if (this[gkey] == null) {
                this[gkey] = function (this) {
                    return this[field + '_last_'];
                };
            }
        }
    }

    rawget(msg, key){
        return msg[key];
    }
}