import { FunctionConst } from "../const/FunctionConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MilitaryMasterPlanHelper } from "../scene/view/militaryMasterPlan/MilitaryMasterPlanHelper";
import { handler } from "../utils/handler";
import { BaseData } from "./BaseData";
var schema = {};
export class MilitaryMasterPlanDataNew extends BaseData {
    static schema = schema;
    private _sysHandleGetInfor: any;
    private _sysHandleBuyInforLany: any;
    constructor() {
        super();
        this._sysHandleGetInfor = G_NetworkManager.add(MessageIDConst.ID_S2C_GetSuperLevelGiftInfo, handler(this, this._s2cSuperLevelGift));
        this._sysHandleBuyInforLany = G_NetworkManager.add(MessageIDConst.ID_S2C_BuySuperLevelGift, handler(this, this._s2cEventPurchass));
    }
    clear() {
        if (this._sysHandleGetInfor)
            this._sysHandleGetInfor.remove();
        this._sysHandleGetInfor = null;
        if (this._sysHandleBuyInforLany)
            this._sysHandleBuyInforLany.remove();
        this._sysHandleBuyInforLany = null;

    }
    reset() {

    }

    public c2sSuperLevelGiftInfor(): void {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetSuperLevelGiftInfo, {})
    }
    public c2sBuySuperLevelGift(id, award_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_BuySuperLevelGift, { id: id, award_type: award_id });
    }
    private _superLevelGiftData:Array<any> = [];
    private _s2cSuperLevelGift(id, message): void {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        this._superLevelGiftData = MilitaryMasterPlanHelper.parseSuperLevelGiftInforMessage(message);
        G_SignalManager.dispatch(SignalConst.EVENT_GetSuperLevelGiftInfo, this._superLevelGiftData);
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_JUN_SHI_MIAO_JI);
    }
    private _s2cEventPurchass(id, message): void {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awardList = message["info"];
        G_SignalManager.dispatch(SignalConst.EVENT_BuySuperLevelGift, awardList);
    }
    public getSuperLevelGiftData() {
        return this._superLevelGiftData;
    }
}