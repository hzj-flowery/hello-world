import { BaseData } from "./BaseData";
//阵容红点数据
export class TeamRedPointData extends BaseData{
    public static schema = {};
    constructor(){
        super();
        this._initData();
    }
    private _info:any;
    private _initData(){
        this._info = {};
        var posRP = {};
        var reinforcementRP = {};
        var equipRP = {};
        var treasureRP = {};
        for (var i = 1;i<=6;i++) {
            posRP[i] = null;
            equipRP[i] = {};
            treasureRP[i] = {};
            for (var j = 1; j<=4;j++) {
                equipRP[i][j] = null;
            }
            for (var k = 1; k<=2;k++) {
                treasureRP[i][k] = null;
            }
        }
        for (var i = 1;i<=8;i++) {
            reinforcementRP[i] = null;
        }
        this._info['posRP'] = posRP;
        this._info['equipRP'] = equipRP;
        this._info['treasureRP'] = treasureRP;
        this._info['reinforcementRP'] = reinforcementRP;
    }
    public setPosRP(pos, show) {
        this._info['posRP'][pos] = show;
    }
    public getPosRP(pos) {
        return this._info['posRP'][pos];
    }
    public setEquipRP (pos, slot, show) {
        this._info['equipRP'][pos][slot] = show;
    }
    public getEquipRP(pos, slot) {
        return this._info['equipRP'][pos][slot];
    }
    public setTreasureRP(pos, slot, show) {
        this._info['treasureRP'][pos][slot] = show;
    }
    public geTreasureRP(pos, slot) {
        return this._info['treasureRP'][pos][slot];
    }
    public setReinforcementRP(pos, show) {
        this._info['reinforcementRP'][pos] = show;
    }
    public getReinforcementRP(pos) {
        return this._info['reinforcementRP'][pos];
    }
}