import { BaseData } from './BaseData';
import { MessageIDConst } from '../const/MessageIDConst';
import { G_NetworkManager, G_SignalManager } from '../init';
import { Slot } from '../utils/event/Slot';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { SignalConst } from '../const/SignalConst';
export class AvatarActivityData extends BaseData {
    public static schema = {};

    public _signalRecvAvatarActivity: Slot;
    constructor (properties?) {
        super(properties);
        this._signalRecvAvatarActivity = G_NetworkManager.add(MessageIDConst.ID_S2C_AvatarActivity, this._s2cAvatarActivity.bind(this));
    }
    public clear () {
        this._signalRecvAvatarActivity.remove();
        this._signalRecvAvatarActivity = null;
    }
    public reset () {
    }
    public c2sAvatarActivity (op_type) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_AvatarActivity, { op_type: op_type });
    }
    public _s2cAvatarActivity (id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_AVATAR_ACTIVITY_SUCCESS, message);
    }
}