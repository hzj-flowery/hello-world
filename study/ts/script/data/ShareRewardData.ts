import { config } from "../config";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { TimeConst } from "../const/TimeConst";
import { G_GameAgent, G_NativeAgent, G_NetworkManager, G_ServerTime, G_SignalManager, G_UserData } from "../init";
import { WxUserInfo } from "../utils/WxUserInfo";
import { BaseData } from "./BaseData";

export interface ShareRewardData {
    getInvite_num_award_id(): any[];
    setInvite_num_award_id(value): void
    getUser_info()
    setUser_info(value): void
}
let schema = {};
schema['invite_num_award_id'] = [
    'object',
    []
];
schema['user_info'] = [
    'object',
    []
];
export class ShareRewardData extends BaseData {
    public static schema = schema;
    _listenerGetInviteAwardInfo: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _listenerGetInviteUserLvAward: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _listenerGetInviteNumAward: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _listenerReportInviteInfo: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    constructor() {
        super();

        this._listenerGetInviteAwardInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_GetInviteAwardInfo, this._s2cGetInviteAwardInfo.bind(this));
        this._listenerGetInviteUserLvAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetInviteUserLvAward, this._s2cGetInviteUserLvAward.bind(this));
        this._listenerGetInviteNumAward = G_NetworkManager.add(MessageIDConst.ID_S2C_GetInviteNumAward, this._s2cGetInviteNumAward.bind(this));
        this._listenerReportInviteInfo = G_NetworkManager.add(MessageIDConst.ID_S2C_ReportInviteInfo, this._s2cReportInviteInfo.bind(this));
    }

    _s2cReportInviteInfo(id, msg) {
        let ret = msg.ret;
    }

    c2sReportInviteInfo() {
        var a = config.remoteCfg;
        console.log(a);
        G_NetworkManager.send(MessageIDConst.ID_C2S_ReportInviteInfo, {
            "uid": G_NativeAgent.invitorUserId ,
            "sid": G_NativeAgent.invitorServerId, 
            "invite_end_time": G_ServerTime.getTime() + 10 *86400,
            "weixin_head_url": WxUserInfo.instance.getUserAvatarUrl(),
            "weixin_name": WxUserInfo.instance.getUserNickName()
        });
    }

    c2sGetInviteAwardInfo() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetInviteAwardInfo, {});
    }

    public _s2cGetInviteAwardInfo(id, message) {
        let ret = message.ret;
        // if (ret == 1) {
        this.setInvite_num_award_id(message.invite_num_award_id);
        this.setUser_info(message.user_info);
        G_SignalManager.dispatch(SignalConst.EVENT_GetInviteAwardInfo);
        // }
    }

    c2sGetInviteUserLvAward(uid, awardId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetInviteUserLvAward, {
            "invited_uid": uid,
            "award_id": awardId
        });
    }

    public _s2cGetInviteUserLvAward(id, message) {
        let ret = message.ret;
        if (ret == 1) {
            var uid = message.invited_uid;
            var infos = this.getUser_info();
            for (var k in infos) {
                var info = infos[k];
                if (info.invited_uid == uid) {
                    info.have_award_id.push(message.have_award_id);
                    G_SignalManager.dispatch(SignalConst.EVENT_GetInviteUserLvAward, info, message.info);
                    break;
                }
            }

        }
    }

    c2sGetInviteNumAward(awardId) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetInviteNumAward, {
            "invite_num_award_id": awardId
        });
    }


    public _s2cGetInviteNumAward(id, message) {
        let ret = message.ret;
        if (ret == 1) {
            var arr = this.getInvite_num_award_id();
            arr.push(message.invite_num_award_id);
            G_SignalManager.dispatch(SignalConst.EVENT_GetInviteNumAward, arr, message.info);
        }
    }

    public   getActivityEndTime() {
        var serverOpenTime = Math.max(1609380000, G_UserData.getBase().getServer_open_time());
        var openZeroTime = G_ServerTime.secondsFromZero(serverOpenTime, TimeConst.RESET_TIME_SECOND);
        var durationDay = config.remoteCfg.wxShareDay || 14;
        var endTime = openZeroTime + durationDay * 24 * 3600;
        return endTime;
    }

}