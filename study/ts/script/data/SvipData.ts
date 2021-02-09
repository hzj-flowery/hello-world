import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { MessageErrorConst } from "../const/MessageErrorConst";
import { FunctionConst } from "../const/FunctionConst";

export interface SvipData {
}
let schema = {};
export class SvipData extends BaseData {
    public static schema = schema;
_recvGameAdmit;
    constructor(properties?) {
        super(properties);
        this._recvGameAdmit = G_NetworkManager.add(MessageIDConst.ID_S2C_GameAdmit, this._s2cGameAdmit.bind(this));
    }
    public clear() {
        this._recvGameAdmit.remove();
        this._recvGameAdmit = null;
    }
    public reset() {
    }
    public c2sGameAdmit(realName, birthday, phone, qq) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GameAdmit, {
            real_name: realName,
            birthday: birthday,
            phone: phone,
            qq: qq
        });
    }
    public _s2cGameAdmit(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SUPER_VIP);
        G_SignalManager.dispatch(SignalConst.EVENT_SVIP_REGISTE_SUCCESS);
    }
}
