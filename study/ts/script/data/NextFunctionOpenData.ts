import { BaseData } from "./BaseData";
import { G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { SignalConst } from "../const/SignalConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TextHelper } from "../utils/TextHelper";
import { ArraySort } from "../utils/handler";

export interface NextFunctionOpenData {
}
let schema = {};
export class NextFunctionOpenData extends BaseData {
    public static schema = schema;

    _curLevel;
    _nextFunctionInfo;
    _isNotInit;
    _signalUserLevelUpdate;
    constructor(properties?) {
        super(properties);
        this._curLevel = 0;
        this._nextFunctionInfo = null;
        this._isNotInit = true;
        this._signalUserLevelUpdate = G_SignalManager.add(SignalConst.EVENT_USER_LEVELUP, this._onEventUserLevelUpdate.bind(this));
    }
    public clear() {
        this._signalUserLevelUpdate.remove();
        this._signalUserLevelUpdate = null;
    }
    public reset() {
        this._curLevel = 0;
        this._nextFunctionInfo = null;
        this._isNotInit = true;
    }
    public _onEventUserLevelUpdate() {
        this.getNextFunctionOpenInfo();
    }
    public getNextFunctionOpenInfo() {
        let curLevel = G_UserData.getBase().getLevel();
        if (this._curLevel != curLevel || this._isNotInit) {
            this._isNotInit = null;
            this._curLevel = curLevel;
            this._nextFunctionInfo = null;
            let functionPreviewConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_PREVIEW);
            let functionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
            curLevel = G_UserData.getBase().getLevel();
            let indexs = functionPreviewConfig.index();
            let functionsConfig = [];
            for (let _ in indexs) {
                let v = indexs[_];
                let config = functionPreviewConfig.indexOf(v);
                let functionID = config.function_id;
                let functionConfig = functionLevelConfig.get(functionID);
                console.assert(functionConfig != null, 'can not find function id = %s');
                if (curLevel < functionConfig.level) {
                    let temp:any = {};
                    temp.functionID = functionID;
                    temp.text = TextHelper.convertKeyValuePair(config.text, {
                        key: 'level',
                        value: functionConfig.level
                    })[0];
                    temp.icon = functionConfig.icon;
                    temp.level = functionConfig.level;
                    temp.name = functionConfig.name;
                    temp.nameImage = config.name_pic;
                    functionsConfig.push(temp);
                }
            }
            ArraySort(functionsConfig, function (a, b) {
                return a.level < b.level;
            });
            for (let _ in functionsConfig) {
                let v = functionsConfig[_];
                if (v.level > curLevel) {
                    this._nextFunctionInfo = v;
                    break;
                }
            }
        }
        return this._nextFunctionInfo;
    }
}
