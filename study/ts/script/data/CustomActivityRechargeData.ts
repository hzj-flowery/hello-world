import { BaseData } from './BaseData';
import { G_NetworkManager, G_SignalManager } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { CustomActivityConst } from '../const/CustomActivityConst';
import { CustomActivityRechargeUnitData } from './CustomActivityRechargeUnitData';
import { ActivityEquipDataHelper } from '../utils/data/ActivityEquipDataHelper';
import { TypeConvertHelper } from '../utils/TypeConvertHelper';
import { FunctionConst } from '../const/FunctionConst';

export interface CustomActivityRechargeData {
    getCurSelectedIndex(): number
    setCurSelectedIndex(value: number): void
    getLastCurSelectedIndex(): number
    getCurSelectedIndex2(): number
    setCurSelectedIndex2(value: number): void
    getLastCurSelectedIndex2(): number
}
let schema = {};
schema['curSelectedIndex'] = [
    'number',
    0
];
schema['curSelectedIndex2'] = [
    'number',
    0
];
export class CustomActivityRechargeData extends BaseData {
    public static schema = schema;

    _datas;
    _recvSpecialActInfo;
    _recvPlaySpecialActivity;
    _recvSpecialActLimitInfo;
    _signalCustomActivityOpenNotice;

    constructor(properties?) {
        super(properties);
        this._datas = {};
        this._recvSpecialActInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_SpecialActInfo, this._s2cSpecialActInfo.bind(this));
        this._recvPlaySpecialActivity = G_NetworkManager.add(MessageIDConst.ID_S2C_PlaySpecialActivity, this._s2cPlaySpecialActivity.bind(this));
        this._recvSpecialActLimitInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_SpecialActLimitInfo, this._s2cSpecialActLimitInfo.bind(this));
        this._signalCustomActivityOpenNotice = G_SignalManager.add(SignalConst.EVENT_CUSTOM_ACTIVITY_OPEN_NOTICE, this._customActivityOpenNotice.bind(this));
    }
    public clear() {
        this._recvSpecialActInfo.remove();
        this._recvSpecialActInfo = null;
        this._recvPlaySpecialActivity.remove();
        this._recvPlaySpecialActivity = null;
        this._signalCustomActivityOpenNotice.remove();
        this._signalCustomActivityOpenNotice = null;
        this._recvSpecialActLimitInfo.remove();
        this._recvSpecialActLimitInfo = null;
    }
    public reset() {
    }
    public c2sSpecialActInfo(actType) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_SpecialActInfo, { act_type: actType });
    }
    public _s2cSpecialActInfo(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let actType = message['act_type'];
        let unitData = this.getUnitDataWithType(actType);
        unitData.updateData(message);
        this._datas[actType] = unitData;
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_INFO, actType);
    }
    public _customActivityOpenNotice(eventName, customActivityUnitData, visible) {
        let actType = customActivityUnitData.getAct_type();
        if (visible) {
            if (actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_EQUIP || actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_PET || actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_HORSE_CONQUER) {
                this.c2sSpecialActInfo(actType);
            }
        }
    }
    public getUnitDataWithType(actType) {
        let unitData = this._datas[actType];
        if (unitData == null) {
            unitData = new CustomActivityRechargeUnitData();
            this._datas[actType] = unitData;
        }
        return unitData;
    }
    public c2sPlaySpecialActivity(actType, drawType, dropIndex) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_PlaySpecialActivity, {
            draw_type: drawType,
            act_type: actType,
            drop_index: dropIndex
        });
    }
    public _s2cPlaySpecialActivity(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let actType = message['act_type'];
        let drawType = message['draw_type'];
        let usedFree = message['used_free'];
        let totalUse = message['total_use'];
        let lastDrawTime = message['last_draw_time'];
        let addRecords = message['add_records'];
        let unitData = this.getUnitDataWithType(actType);
        unitData.setAct_type(actType);
        unitData.setFree_use(usedFree);
        unitData.setTotal_use(totalUse);
        unitData.setLast_draw_time(lastDrawTime);
        let records = unitData.getRecords();
        let object = [];
        let equips = [];
        for (let i in addRecords) {
            let id = addRecords[i];
            records.push(id);
            object.push(id);
            let info = ActivityEquipDataHelper.getActiveDropConfig(id);
            if (info.type == TypeConvertHelper.TYPE_EQUIPMENT) {
                let award = {
                    type: info.type,
                    value: info.value,
                    size: info.size
                };
                equips.push(award);
            }
        }
        unitData.setRecords(records);
        unitData.resetTime();
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_PLAY_SUCCESS, actType, drawType, object, equips);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_ACTIVITY);
    }
    public _s2cSpecialActLimitInfo(id, message) {
        let actType = message['act_type'];
        let limitUse = message['limit_use'];
        let unitData = this.getUnitDataWithType(actType);
        unitData.setTotal_use(limitUse);
        G_SignalManager.dispatch(SignalConst.EVENT_CUSTOM_ACTIVITY_RECHARGE_LIMIT_CHANGE, actType, limitUse);
    }
}
