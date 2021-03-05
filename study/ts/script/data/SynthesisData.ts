import { BaseData } from "./BaseData";
import { G_NetworkManager, G_UserData, G_ConfigLoader, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { ArraySort } from "../utils/handler";
import { SynthesisDataHelper } from "../utils/data/SynthesisDataHelper";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { SignalConst } from "../const/SignalConst";
import { ObjKeyLength } from "../utils/GlobleFunc";

export interface SynthesisData {
    getAwards(): Object
    setAwards(value: Object): void
    getLastAwards(): Object
}
let schema = {};
schema['awards'] = [
    'object',
    0
];
export class SynthesisData extends BaseData {

    public static schema = schema;
    _recvSynthesisResult;
    constructor(properties?) {
        super(properties);
        this._recvSynthesisResult = G_NetworkManager.add(MessageIDConst.ID_S2C_Synthesis, this._s2cRecvSynthesisResult.bind(this));
    }
    public clear() {
        this._recvSynthesisResult.remove();
        this._recvSynthesisResult = null;
    }
    public reset() {
    }

    _isConfigSynthesisOpen(configData) {
        var gameUserLevel = G_UserData.getBase().getLevel();
        var treeLevel = G_UserData.getHomeland().getMainTreeLevel();
        if (gameUserLevel >= configData.level && (configData.condition_type == 0 || configData.condition_type == 3 && treeLevel >= configData.condition_value)) {
            return true;
        }
        return false;
    }
    public getSynthesisConfigData() {
        let data = {};
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        let configLength = SynthesisConfig.length();
        for (let index = 1; index <= configLength; index++) {
            let configData = SynthesisConfig.get(index);
            if (this._isConfigSynthesisOpen(configData)) {
                let type = configData.type;
                data[type] = data[type] || [];
                data[type].push(index);
            }
        }
        return data;
    }
    public getDataTypes(data) {
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        if (data == null) {
            return {};
        }
        let types = [];
        for (let type in data) {
            let v = data[type];
            types.push(type);
        }
        let sortFunc = function (a, b) {
            let a_id = data[a][0];
            let b_id = data[b][0];
            let a_config = SynthesisConfig.get(a_id);
            let b_config = SynthesisConfig.get(b_id);
            if (a_config.level != b_config.level) {
                return a_config.level < b_config.level;
            }
            return a_config.id < b_config.id;
        };
        ArraySort(types, sortFunc);
        cc.log(types);
        return types;
    }
    public checkCanSynthesis() {
        let configData = this.getSynthesisConfigData();
        if (ObjKeyLength (configData) == 0) {
            return false;
        }
        let canSynthesis = false;
        for (let type in configData) {
            let v = configData[type];
            for (let index in configData[type]) {
                let id = configData[type][index];
                canSynthesis = this.checkMaterailEnoughById(id);
                if (canSynthesis == true) {
                    return canSynthesis;
                }
            }
        }
        return canSynthesis;
    }
    public checkMaterailEnoughByType(configData, type) {
        if (configData[type] == null || configData[type].length == 0) {
            return false;
        }
        let isMaterialEnough = true;
        for (let index in configData[type]) {
            let id = configData[type][index];
            isMaterialEnough = this.checkMaterailEnoughById(id);
            if (isMaterialEnough == true) {
                break;
            }
        }
        return isMaterialEnough;
    }
    public checkMaterailEnoughById(id) {
        let SynthesisConfig = G_ConfigLoader.getConfig(ConfigNameConst.SYNTHESIS);
        let configInfo = SynthesisConfig.get(id);
        if (configInfo == null || configInfo.type == 2) {
            return false;
        }
        let num = SynthesisDataHelper.getSynthesisMaterilNum(configInfo);
        let isMaterialEnough = true;
        let ownCostNum = UserDataHelper.getNumByTypeAndValue(configInfo.cost_type, configInfo.cost_value);
        for (let index = 1; index <= num; index++) {
            let type = configInfo['material_type_' + index];
            let value = configInfo['material_value_' + index];
            let size = configInfo['material_size_' + index];
            let ownNum = UserDataHelper.getNumByTypeAndValue(type, value);
            if (ownNum < size || ownCostNum < configInfo.cost_size) {
                isMaterialEnough = false;
                break;
            }
        }
        return isMaterialEnough;
    }
    public c2sGetSynthesisResult(synthesis_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_Synthesis, { id: synthesis_id });
    }
    public _s2cRecvSynthesisResult(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'] || {};
        G_SignalManager.dispatch(SignalConst.EVENT_SYNTHESIS_RESULT, awards);
    }
}
