import { BaseData } from "./BaseData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { G_ConfigLoader } from "../init";
import { clone, clone2 } from "../utils/GlobleFunc";

let schema = {};
schema['id'] = [
    'number',
    0
];
schema['attr'] = [
    'object',
    {}
];

export interface AttrRecordUnitData {

getId(): number
setId(value: number): void
getLastId(): number
getAttr(): Object
setAttr(value: Object): void
getLastAttr(): Object

}
export class AttrRecordUnitData extends BaseData {
    public static schema = schema;

    reset() {
    }
    clear() {
    }
    updateData(attr) {
        this.backupProperties();
        super.setProperties({ attr: attr });
    }
    getCurValue(attrId) {
        let attr = this.getAttr();
        let value = attr[attrId];
        return value || 0;
    }
    getLastValue(attrId) {
        let attr = this.getLastAttr();
        return attr[attrId] || 0;
    }
    getCurAttrList(...vars) {
        let attr = this.getAttr();
        return attr;
    }
    getDiffValue(attrId) {
        let curValue = this.getCurValue(attrId);
        let lastValue = this.getLastValue(attrId);
        let diffValue = curValue - lastValue;
        return diffValue;
    }
    getAllAttrIds():Array<any> {
        let attr:Array<any> = clone2(this.getAttr());
        let lastAttr = clone2(this.getLastAttr());
        let attrIds = [];
        for(let key in attr)
        {
            attrIds.push(key);
        }
        for(let key in lastAttr)
        {
            attrIds.push(key);
        }
        return attrIds;
    }
    getAllAttrIdsBySort():Array<any> {
        let sortFun = function (a, b) {
            let infoA = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(a);
            let infoB = G_ConfigLoader.getConfig(ConfigNameConst.ATTRIBUTE).get(b);
            console.assert(infoA && infoB, cc.js.formatStr('attribute config can not find Aid = %d, Bid = %d', a, b));
            let orderA = infoA.order;
            let orderB = infoB.order;
            return orderA - orderB;
        }
        let attrIds = this.getAllAttrIds();
        attrIds.sort(sortFun);
        return attrIds;
    }
}