import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_UserData, G_RecoverMgr } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { FunctionConst } from "../const/FunctionConst";
import { FunctionCheck } from "../utils/logic/FunctionCheck";
import { TowerBaseData } from "./TowerBaseData";
import { TowerSurpriseData } from "./TowerSurpriseData";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { TowerSuperStageUnitData } from "./TowerSuperStageUnitData";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import ParameterIDConst from "../const/ParameterIDConst";
import { ArraySort } from "../utils/handler";
import { DataConst } from "../const/DataConst";

export interface TowerData {
    getNow_layer(): number
    setNow_layer(value: number): void
    getLastNow_layer(): number
    getNow_star(): number
    setNow_star(value: number): void
    getLastNow_star(): number
    getMax_layer(): number
    setMax_layer(value: number): void
    getLastMax_layer(): number
    getMax_star(): number
    setMax_star(value: number): void
    getLastMax_star(): number
    getLayers(): Object
    setLayers(value: Object): void
    getLastLayers(): Object
    getSurprises(): Object
    setSurprises(value: Object): void
    getLastSurprises(): Object
    isShowStarEft(): boolean
    setShowStarEft(value: boolean): void
    isLastShowStarEft(): boolean
    getSpuer_cnt(): number
    setSpuer_cnt(value: number): void
    getLastSpuer_cnt(): number
    getSuperStages(): Object
    setSuperStages(value: Object): void
    getLastSuperStages(): Object
    getShowRewardSuperStageId(): number
    setShowRewardSuperStageId(value: number): void
    getLastShowRewardSuperStageId(): number
    getSuperStageSelectStageId(): number
    setSuperStageSelectStageId(value: number): void
    getLastSuperStageSelectStageId(): number
}
let schema = {};
schema['now_layer'] = [
    'number',
    0
];
schema['now_star'] = [
    'number',
    0
];
schema['max_layer'] = [
    'number',
    0
];
schema['max_star'] = [
    'number',
    0
];
schema['layers'] = [
    'object',
    {}
];
schema['surprises'] = [
    'object',
    []
];
schema['showStarEft'] = [
    'boolean',
    false
];
schema['spuer_cnt'] = [
    'number',
    0
];
schema['superStages'] = [
    'object',
    {}
];
schema['showRewardSuperStageId'] = [
    'number',
    0
];
schema['superStageSelectStageId'] = [
    'number',
    null
];
export class TowerData extends BaseData {
    public static schema = schema;

    _listenerTowerData;
    _listenerGetBox;
    _listenerSurprise;
    _listenerSweep;
    _listenerChallenge;
    _listenerExecute;
    _signalRecvRecoverInfo;
    _s2cExecuteTowerSuperStageListener;
    constructor(properties?) {
        super(properties);
        this._listenerTowerData = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTower, this._recvTowerData.bind(this));
        this._listenerGetBox = G_NetworkManager.add(MessageIDConst.ID_S2C_GetTowerBox, this._recvGetBox.bind(this));
        this._listenerSurprise = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteSurprise, this._recvSurprise.bind(this));
        this._listenerSweep = G_NetworkManager.add(MessageIDConst.ID_S2C_FastExecuteTower, this._recvSweep.bind(this));
        this._listenerChallenge = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteTowerFast, this._recvChallenge.bind(this));
        this._listenerExecute = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteTower, this._recvBattle.bind(this));
        this._signalRecvRecoverInfo = G_SignalManager.add(SignalConst.EVENT_RECV_RECOVER_INFO, this._eventRecvRecoverInfo.bind(this));
        this._s2cExecuteTowerSuperStageListener = G_NetworkManager.add(MessageIDConst.ID_S2C_ExecuteTowerSuperStage, this._s2cExecuteTowerSuperStage.bind(this));
        this._createSuperStageData();
    }
    public clear() {
        this._listenerTowerData.remove();
        this._listenerTowerData = null;
        this._listenerGetBox.remove();
        this._listenerGetBox = null;
        this._listenerSurprise.remove();
        this._listenerSurprise = null;
        this._listenerSweep.remove();
        this._listenerSweep = null;
        this._listenerExecute.remove();
        this._listenerExecute = null;
        this._signalRecvRecoverInfo.remove();
        this._signalRecvRecoverInfo = null;
        this._s2cExecuteTowerSuperStageListener.remove();
        this._s2cExecuteTowerSuperStageListener = null;
        this._listenerChallenge.remove();
        this._listenerChallenge = null;
    }
    public reset() {
    }
    public _recvTowerData(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.refreshData(message.tower);
        this._refreshSuperStageData(message);
        this.resetTime();
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_GET_INFO);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TOWER_SUPER);
    }
    public _eventRecvRecoverInfo(event) {
        if (FunctionCheck.funcIsOpened(FunctionConst.FUNC_PVE_TOWER)[0]) {
            if (this.hasCountFull()) {
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
            }
        }
    }
    public getLayerByIndex(layerId) {
        let layerList = this.getLayers();
        return layerList[layerId];
    }
    public getSurpriseById(id) {
        let surprises = this.getSurprises();
        for (let _ in surprises) {
            let v = surprises[_];
            if (v.getSurprise_id() == id) {
                return v;
            }
        }
        return null;
    }
    public refreshData(data) {
        this.resetTime();
        this.setNow_layer(data.now_layer);
        this.setNow_star(data.now_star);
        this.setMax_layer(data.max_layer);
        this.setMax_star(data.max_star);
        if (data.hasOwnProperty('layers')) {
            let towerLayers = {};
            for (let i = 0; i < data.layers.length; i++) {
                let layer = new TowerBaseData(data.layers[i]);
                towerLayers[layer.getId()] = layer;
            }
            this.setLayers(towerLayers);
        }
        if (data.hasOwnProperty('surprise')) {
            let surprises = [];
            for (let i = 0; i < data.surprise.length; i++) {
                let surprise = new TowerSurpriseData(data.surprise[i]);
                surprises.push(surprise);
            }
            this.setSurprises(surprises);
        }
    }
    public _createSuperStageData() {
        let EquipEssenceStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_ESSENCE_STAGE);
        let stageList = {};
        let stageCount = EquipEssenceStage.length();
        for (let i = 0; i < stageCount; i++) {
            let config = EquipEssenceStage.indexOf(i);
            this._createSuperStageUnitData(stageList, config.id, false);
        }
        this.setSuperStages(stageList);
    }
    public _refreshSuperStageData(message) {
        this.setSpuer_cnt(message.spuer_cnt);
        let superSatgeUnitList = this.getSuperStages();
        let superSatgePassedIds = message['tower_super_stage'] || {};
        for (let k in superSatgePassedIds) {
            let v = superSatgePassedIds[k];
            if (v != 0) {
                this._createSuperStageUnitData(superSatgeUnitList, v, true);
            }
        }
    }
    public _createSuperStageUnitData(list, stageId, pass) {
        let stageUnitData = new TowerSuperStageUnitData();
        stageUnitData.updateData({
            id: stageId,
            pass: pass
        });
        list[stageId] = stageUnitData;
        return stageUnitData;
    }
    public isSuperStageOpen(stageId) {
        let stageUnit = this.getSuperStageUnitData(stageId);
        if (stageUnit.isPass()) {
            return true;
        }
        let config = stageUnit.getConfig();
        let nowLayer = this.getNow_layer();
        if (config.need_equip_stage != 0) {
            let star = this.getHistoryStarByLayer(config.need_equip_stage);
            if (star <= 0) {
                return false;
            }
        }
        let needStageUnit = this.getSuperStageUnitData(config.need_id);
        if (!needStageUnit) {
            return true;
        }
        return needStageUnit.isPass();
    }
    public _getSuperStageNextStageId(stageId) {
        let EquipEssenceStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_ESSENCE_STAGE);
        for (let i = 0; i < EquipEssenceStage.length(); i += 1) {
            let config = EquipEssenceStage.indexOf(i);
            if (config.need_equip_stage == stageId) {
                return config.id;
            }
        }
        return null;
    }
    public getSuperStageUnitData(stageId) {
        let superSatgeUnitList = this.getSuperStages();
        return superSatgeUnitList[stageId];
    }
    public receiveBox(layerId) {
        let layerData = this.getLayerByIndex(layerId);
        if (layerData) {
            layerData.setReceive_box(true);
        }
    }
    public openBox(layerId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTowerBox, { layer: layerId });
    }
    public _recvGetBox(id, message) {
        if (message.ret != 1) {
            return;
        }
        this.receiveBox(message.layer);
        let rewards = [];
        if (message.hasOwnProperty('box_reward')) {
            for (let i in message.box_reward) {
                let v = message.box_reward[i];
                let item = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                rewards.push(item);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_GET_BOX, rewards);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
    }
    public executeSurprise(surpriseId) {
        if (this.isExpired() == true) {
            this.c2sGetTower();
            return;
        }
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteSurprise, { surprise_id: surpriseId });
    }
    public _recvSurprise(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('tower')) {
            this.refreshData(message.tower);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_EXECUTE_SURPRISE, message);
    }
    public sendSweep() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_FastExecuteTower, {});
    }
    public sendChallenge() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteTowerFast, {});
    }
    public _recvSweep(id, message) {
        console.log("_onEventChallenge1")
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('tower')) {
            this.refreshData(message.tower);
        }
        let results = [];
        if (message.hasOwnProperty('award')) {
            for (let _ in message.award) {
                let v = message.award[_];
                let result: any = {};
                result.rewards = [];
                if (v.hasOwnProperty('total_award')) {
                    result.from = 'tower';
                    for (let _ in v.total_award) {
                        let vv = v.total_award[_];
                        let reward = {
                            type: vv.type,
                            value: vv.value,
                            size: vv.size
                        };
                        result.rewards.push(reward);
                    }
                }
                if (v.hasOwnProperty('add_award')) {
                    result.addRewards = [];
                    for (let _ in v.add_award) {
                        let vv = v.add_award[_];
                        let reward: any = {
                            type: vv.award.type,
                            value: vv.award.value,
                            size: vv.award.size
                        };
                        reward.index = vv.index;
                        result.addRewards.push(reward);
                    }
                }
                results.push(result);
                if (v.hasOwnProperty('box_award')) {
                    let boxResult: any = {};
                    boxResult.from = 'box';
                    boxResult.rewards = [];
                    for (let _ in v.box_award) {
                        let vv = v.box_award[_];
                        let reward = {
                            type: vv.type,
                            value: vv.value,
                            size: vv.size
                        };
                        boxResult.rewards.push(reward);
                    }
                    results.push(boxResult);
                }
            }
        }
        console.log("_onEventChallenge2")
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_SWEEP, results);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
    }
    public _recvChallenge(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('tower')) {
            this.refreshData(message.tower);
        }
        let results = [];
        if (message.hasOwnProperty('award')) {
            for (let _ in message.award) {
                let v = message.award[_];
                let result: any = {};
                if (v.hasOwnProperty('is_pass')) {
                    result.pass = v.is_pass;
                }
                result.rewards = [];
                if (v.hasOwnProperty('total_award')) {
                    result.from = 'tower';
                    for (let _ in v.total_award) {
                        let vv = v.total_award[_];
                        let reward = {
                            type: vv.type,
                            value: vv.value,
                            size: vv.size
                        };
                        result.rewards.push(reward);
                    }
                }
                if (v.hasOwnProperty('add_award')) {
                    result.addRewards = [];
                    for (let _ in v.add_award) {
                        let vv = v.add_award[_];
                        let reward: any = {
                            type: vv.award.type,
                            value: vv.award.value,
                            size: vv.award.size
                        };
                        reward.index = vv.index;
                        result.addRewards.push(reward);
                    }
                }
                results.push(result);
                if (v.hasOwnProperty('box_award')) {
                    let boxResult: any = {};
                    boxResult.from = 'box';
                    boxResult.rewards = [];
                    for (let _ in v.box_award) {
                        let vv = v.box_award[_];
                        let reward = {
                            type: vv.type,
                            value: vv.value,
                            size: vv.size
                        };
                        boxResult.rewards.push(reward);
                    }
                    results.push(boxResult);
                }
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_CHALLENGE, results);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
    }
    public c2sGetTower() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetTower, {});
    }
    public c2sExecuteTower(layerId, difficulty) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteTower, {
            layer: layerId,
            star: difficulty
        });
    }
    public pullData() {
        this.c2sGetTower();
    }
    public _recvBattle(id, message) {
        if (message.ret != 1) {
            return;
        }
        let nowLayer = this.getNow_layer();
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_EXECUTE, message);
        if (message.hasOwnProperty('tower')) {
            this.refreshData(message.tower);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TOWER);
    }
    public getHistoryStarByLayer(layerId) {
        let data = this.getLayerByIndex(layerId);
        if (data) {
            return data.getStar();
        }
        return 0;
    }
    public hasRedPoint() {
        let red1 = this.hasAttackOnceRedPoint();
        let red2 = this.hasBoxReward();
        let red3 = this.hasCountFullRedPoint();
        // cc.warn(String(red1) + (' xxx  ' + (String(red2) + (' ' + String(red3)))));
        return red1 || red2 || red3;
    }
    public hasAttackOnceRedPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_PVE_TOWER, { attackOnce: true });
        if (showed) {
            return false;
        }
        return this.getNow_layer() <= 0;
    }
    public hasCountFullRedPoint() {
        let showed = G_UserData.getRedPoint().isTodayShowedRedPointByFuncId(FunctionConst.FUNC_PVE_TOWER, { fullCount: true });
        if (showed) {
            return false;
        }
        return this.hasCountFull();
    }
    public hasSuperStageChallengeCountRedPoint() {
        return this.getSuperChallengeCount() > 0;
    }
    public hasCountFull() {
        let userBaseData = G_UserData.getBase();
        let towerCount = userBaseData.getResValue(DataConst.RES_TOWER_COUNT);
        let recoverUnit = G_RecoverMgr.getRecoverUnit(3);
        let maxCount = recoverUnit.getMaxLimit();
        return towerCount >= maxCount;
    }
    public hasBoxReward() {
        let EquipStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE);
        let nowLayer = this.getNow_layer();
        if (nowLayer == 0) {
            return false;
        }
        let nowLayerConfig = EquipStage.get(nowLayer);
        console.assert(nowLayerConfig, 'equip_stage not find config by id ' + String(nowLayer));
        let layerData = G_UserData.getTowerData().getLayerByIndex(nowLayer);
        return nowLayerConfig.box_id != 0 && layerData.getNow_star() > 0 && !layerData.isReceive_box();
    }
    public getNextLayer() {
        let EquipStage = G_ConfigLoader.getConfig(ConfigNameConst.EQUIP_STAGE);
        let nowLayer = this.getNow_layer();
        let nextLayer = 0;
        if (nowLayer == 0) {
            nextLayer = EquipStage.indexOf(1).id;
        } else {
            let nowLayerConfig = EquipStage.get(nowLayer);
            if (nowLayerConfig.box_id != 0 && !G_UserData.getTowerData().getLayerByIndex(nowLayer).isReceive_box()) {
                nextLayer = nowLayer;
            } else {
                nextLayer = EquipStage.get(nowLayer).next_id;
                if (nextLayer == 0) {
                    nextLayer = nowLayer;
                }
            }
        }
        return nextLayer;
    }
    public hasTowerSweepRedPoint() {
        let nowLayer = this.getNow_layer();
        let nextLayer = this.getNextLayer();
        if (nextLayer == nowLayer) {
            return false;
        }
        let layerData = G_UserData.getTowerData().getLayerByIndex(nextLayer);
        if (layerData && layerData.getStar() >= 3) {
            return true;
        }
        return false;
    }
    public hasTowerChallengeRedPoint() {
        return false;
        let nowLayer = this.getNow_layer();
        let nextLayer = this.getNextLayer();
        if (nextLayer == nowLayer) {
            return false;
        }
        let layerData = G_UserData.getTowerData().getLayerByIndex(nextLayer);
        if (layerData && layerData.getStar() >= 3) {
            return true;
        }
        return false;
    }
    public c2sExecuteTowerSuperStage(stageId, sweepType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_ExecuteTowerSuperStage, {
            stage_id: stageId,
            type: sweepType
        });
    }
    public _s2cExecuteTowerSuperStage(id, message) {
        if (message.ret != 1) {
            return;
        }
        if (message.hasOwnProperty('spuer_cnt')) {
            this.setSpuer_cnt(message.spuer_cnt);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_TOWER_SUPER);
        G_SignalManager.dispatch(SignalConst.EVENT_TOWER_EXECUTE_SUPER, message);
    }
    public processStageUnitData(stageId, isWin) {
        let stageUnitData = this.getSuperStageUnitData(stageId);
        if (isWin) {
            this._createSuperStageUnitData(this.getSuperStages(), stageId, true);
            if (!stageUnitData.isPass()) {
                this.setShowRewardSuperStageId(stageUnitData.getId());
                let nextStageId = this._getSuperStageNextStageId(stageUnitData.getId());
                if (nextStageId) {
                    this.setSuperStageSelectStageId(nextStageId);
                }
            }
        }
        return stageUnitData;
    }
    public getSuperStageList() {
        let superSatgeUnitList = this.getSuperStages();
        let stageList = [];
        let unOpenCount = 0;
        for (let k in superSatgeUnitList) {
            let v = superSatgeUnitList[k];
            stageList.push(v);
        }
        let sortfunction = function (obj1, obj2) {
            return obj1.getId() < obj2.getId();
        };
        ArraySort(stageList, sortfunction);
        let newStageList = [];
        for (let k in stageList) {
            let v = stageList[k];
            if (!G_UserData.getTowerData().isSuperStageOpen(v.getId())) {
                unOpenCount = unOpenCount + 1;
            }
            if (unOpenCount > 3) {
                break;
            }
            newStageList.push(v);
        }
        return newStageList;
    }
    public getSuperChallengeCount() {
        let count = G_UserData.getTowerData().getSpuer_cnt();
        let totalCount = UserDataHelper.getParameter(ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME);
        return totalCount - count;
    }
}
