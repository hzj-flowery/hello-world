import { BaseData } from './BaseData';
import { ChatConst } from '../const/ChatConst';
import { G_ServerTime } from '../init';
import { ChatPlayerData } from './ChatPlayerData';
import { UserDataHelper } from '../utils/data/UserDataHelper';
import { KvPairs } from './KvPairs';
let schema = {};
schema['sender'] = [
    'object',
    {}
];

schema['reciver'] = [
    'object',
    {}
];

schema['channel'] = [
    'number',
    0
];

schema['content'] = [
    'string',
    ''
];

schema['sysMsg'] = [
    'object',
    null
];

schema['id'] = [
    'number',
    0
];

schema['status'] = [
    'number',
    0
];

schema['msg_type'] = [
    'number',
    0
];

schema['index'] = [
    'number',
    0
];

schema['voiceInfo'] = [
    'object',
    {}
];

schema['voicePlay'] = [
    'boolean',
    false
];

schema['eventInfo'] = [
    'object',
    {}
];

schema['parameter'] = [
    'object',
    {}
];

export interface ChatMsgData {
    getSender(): ChatPlayerData
    setSender(value: ChatPlayerData): void
    getLastSender(): ChatPlayerData
    getReciver(): ChatPlayerData
    setReciver(value: ChatPlayerData): void
    getLastReciver(): ChatPlayerData
    getChannel(): number
    setChannel(value: number): void
    getLastChannel(): number
    getContent(): string
    setContent(value: string): void
    getLastContent(): string
    getSysMsg(): Object
    setSysMsg(value: Object): void
    getLastSysMsg(): Object
    getId(): number
    setId(value: number): void
    getLastId(): number
    getStatus(): number
    setStatus(value: number): void
    getLastStatus(): number
    getMsg_type(): number
    setMsg_type(value: number): void
    getLastMsg_type(): number
    getIndex(): number
    setIndex(value: number): void
    getLastIndex(): number
    getVoiceInfo(): any
    setVoiceInfo(value: any): void
    getLastVoiceInfo(): any
    isVoicePlay(): boolean
    setVoicePlay(value: boolean): void
    isLastVoicePlay(): boolean
    getEventInfo(): Object
    setEventInfo(value: Object): void
    getLastEventInfo(): Object
    getParameter(): Object
    setParameter(value: Object): void
    getLastParameter(): Object
}
export class ChatMsgData extends BaseData {
    public static id = 0;

    public static schema = schema;

    public _time: number;
    public _needShowTimeLabel: boolean;

    constructor(properties?) {
        super(properties)
        let senderPlayerData = new ChatPlayerData();
        let reciverPlayerData = new ChatPlayerData();
        this.setSender(senderPlayerData);
        this.setReciver(reciverPlayerData);
        this._time = G_ServerTime.getTime();
        this._needShowTimeLabel = false;
        ChatMsgData.id = ChatMsgData.id + 1;
        this.setId(ChatMsgData.id);
    }
    public clear() {
    }
    public reset() {
    }
    public initDataWithPrivateMsg(v) {
        let msgType = v['msg_type'] || ChatConst.MSG_TYPE_TEXT;
        this.getSender().setId(v.sender_id);
        this.getSender().setName(v.sender_name);
        this.getSender().setBase_id(v.sender_base_id);
        this.getSender().setOffice_level(v.sender_office_level);
        this.getSender().setAvatar_base_id(v.sender_avatar_base_id);
        this.getSender().setTitles(v.sender_title);
        this.getSender().setHead_frame_id(v.sender_head_frame_id);
        this.setChannel(ChatConst.CHANNEL_PRIVATE);
        this.getReciver().setId(v.recive_id);
        this.getReciver().setName(v.recive_name);
        this.getReciver().setBase_id(v.recive_base_id);
        this.getReciver().setOffice_level(v.recive_office_level);
        this.getReciver().setAvatar_base_id(v.recive_avatar_base_id);
        this.getReciver().setHead_frame_id(v.recive_head_frame_id);
        this.setStatus(v.status);
        this.setMsg_type(msgType);
        this.setId(v.id);
        this.setTime(v.send_time);
        if (msgType == ChatConst.MSG_TYPE_VOICE) {
            let voiceInfo = this._decodeVoiceInfo(v.content);
            this.setVoiceInfo(voiceInfo);
            this.setContent(voiceInfo.voiceText);
        } else {
            this.setContent(v.content);
        }
        let [covertId, playerInfo] = UserDataHelper.convertAvatarId(this.getReciver());
        this.getReciver().setPlayer_info(playerInfo);
        console.log(playerInfo);
        [covertId, playerInfo] = UserDataHelper.convertAvatarId(this.getSender());
        this.getSender().setPlayer_info(playerInfo);
        console.log(playerInfo);
        this._createParameter(v);
    }
    public initDataWithSycMsg(v) {
        let msgType = v['msg_type'] || ChatConst.MSG_TYPE_TEXT;
        this.setMsg_type(msgType);
        if (msgType == ChatConst.MSG_TYPE_VOICE) {
            let voiceInfo = this._decodeVoiceInfo(v.content);
            this.setVoiceInfo(voiceInfo);
            this.setContent(voiceInfo.voiceText);
        } else {
            this.setContent(v.content);
        }
        this._createParameter(v);
    }
    public _createParameter(v) {
        let parameter = new KvPairs();
        parameter.initData(v);
        this.setParameter(parameter);
    }
    public setNeedShowTimeLabel(value) {
        this._needShowTimeLabel = value;
    }
    public getNeedShowTimeLabel() {
        return this._needShowTimeLabel;
    }
    public setTime(time) {
        this._time = time;
    }
    public getTime() {
        return this._time;
    }
    public getChatObjectId() {
        let target = this.getChatObject();
        if (target) {
            return target.getId();
        }
        return 0;
    }
    public getChatObject() {
        let sender = this.getSender();
        let reciver = this.getReciver();
        let senderIsSelf = sender.isSelf();
        let reciverIsSelf = reciver.isSelf();
        if (senderIsSelf) {
            return reciver;
        } else if (reciverIsSelf) {
            return sender;
        } else {
            return null;
        }
        return null;
    }
    public isVoice() {
        return this.getMsg_type() == ChatConst.MSG_TYPE_VOICE;
    }
    public _decodeVoiceInfo(content) {
        let arr = content.split('#');
        let url = arr[1];
        let voiceLen = arr[2];
        let voiceText = arr[3];
        return {
            voiceUrl: url,
            voiceLen: voiceLen,
            voiceText: voiceText
        };
    }
    public voiceEquil(chatMsg) {
        if (!this.isVoice() || !chatMsg.isVoice()) {
            return false;
        }
        let voiceInfo01 = this.getVoiceInfo();
        let voiceInfo02 = chatMsg.getVoiceInfo();
        return voiceInfo01.voiceUrl == voiceInfo02.voiceUrl;
    }
    public isEvent() {
        return this.getMsg_type() == ChatConst.MSG_TYPE_EVENT;
    }
}