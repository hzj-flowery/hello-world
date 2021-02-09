import { BaseData } from "./BaseData";
import { G_NetworkManager, G_SignalManager, G_UserData, G_ConfigLoader } from "../init";
import { MessageIDConst } from "../const/MessageIDConst";
import { SignalConst } from "../const/SignalConst";
import { Lang } from "../lang/Lang";
import { RollNoticeConst } from "../const/RollNoticeConst";
import { ChatConst } from "../const/ChatConst";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface RollNoticeData {
}
let schema = {};
export class RollNoticeData extends BaseData {

        _systemMsgList:any[];
        _s2cRollNoticeListener;
        _signalRecvFlushData;
    public static schema = schema;
    constructor(properties?) {
        super(properties);
        this._systemMsgList = [];
        this._s2cRollNoticeListener = G_NetworkManager.add(MessageIDConst.ID_S2C_RollNotice, this._s2cRollNotice.bind(this));
        this._signalRecvFlushData = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, this._onEventRecvFlushData.bind(this));
    }
    public clear() {
        this._s2cRollNoticeListener.remove();
        this._s2cRollNoticeListener = null;
        this._signalRecvFlushData.remove();
        this._signalRecvFlushData = null;
    }
    public reset() {
        this._systemMsgList = [];
    }
    public _onEventRecvFlushData() {
        if (this._systemMsgList.length > 0) {
            return;
        }
        let rollMsg = {
            msg: Lang.get('system_msg'),
            noticeType: RollNoticeConst.NOTICE_TYPE_GM,
            param: '',
            sendId: 0
        };
        this._onAddNewMessage(rollMsg);
    }
    public _s2cRollNotice(id, message) {
        if (RollNoticeConst.NOTICE_TYPE_GM != message.notice_type && message.notice_id == 0) {
            let msg = message['msg'];
            let noticeType = message['notice_type'];
            let noticeId = message['notice_id'];
            console.assert(null, 'RollNoticeData test %s %s %s');
            return;
        }
        let location = message['location'] || {};
        let rollMsg: any = {
            msg: null,
            noticeType: message.notice_type,
            param: '',
            sendId: message.send_id
        };
        if (RollNoticeConst.NOTICE_TYPE_GM == message.notice_type) {
            rollMsg.msg = message.msg;
        } else {
            let PaoMaDeng = G_ConfigLoader.getConfig(ConfigNameConst.PAOMADENG);
            let cfg = PaoMaDeng.get(message.notice_id);
            console.assert(cfg, 'paomadeng not find id ' + String(message.notice_id));
            rollMsg.msg = cfg.description;
            rollMsg.param = message.msg;
            rollMsg.noticeId = message.notice_id;
        }
        for (let k in location) {
            let v = location[k];
            if (v == RollNoticeConst.ROLL_POSITION_ROLL_MSG) {
                G_SignalManager.dispatch(SignalConst.EVENT_ROLLNOTICE_RECEIVE, rollMsg);
            }
            if (v == RollNoticeConst.ROLL_POSITION_CHAT_MSG) {
                this._onAddNewMessage(rollMsg);
            }
        }
    }
    public _onAddNewMessage(newMsg) {
        let chatMsgData = G_UserData.getChat().createChatMsgDataBySysMsg(newMsg);
        this._systemMsgList.push(chatMsgData);
        if (this._systemMsgList.length > ChatConst.MAX_MSG_CACHE_NUM[ChatConst.CHANNEL_SYSTEM-1]) {
            this._systemMsgList.shift();
        }
        if (newMsg) {
            G_SignalManager.dispatch(SignalConst.EVENT_SYSTEM_MSG_RECEIVE, chatMsgData);
        }
        return newMsg;
    }
    public getSystemMsgList() {
        return this._systemMsgList;
    }
}
