import { BaseData } from './BaseData';
import { G_StorageManager, G_ConfigManager } from '../init';
import { ChatConst } from '../const/ChatConst';
export class ChatSetting extends BaseData {

    public _chatSettingData;

    constructor (properties?) {
        super(properties);
        this._loadSetting();
    }
    public clear () {
    }
    public reset () {
        this._loadSetting();
    }
    public _loadSetting () {
        this._chatSettingData = G_StorageManager.load(ChatConst.CHAT_SETTING_NAME) || {};
    }
    public saveSetting () {
        let message = this._chatSettingData;
        G_StorageManager.save(ChatConst.CHAT_SETTING_NAME, message);
    }
    public _getSettingValue (key) {
        return this._chatSettingData[key];
    }
    public saveSettingValue (key, value) {
        this._chatSettingData[key] = value;
        this.saveSetting();
    }
    public getCheckBoxValue (id) {
        let checkboxData = this._getSettingValue('checkbox') as any[];
        let checkValue = -1;
        if (checkboxData && checkboxData.length > 0) {
            checkValue = checkboxData[id-1];
        }
        if (checkValue == -1) {
            if (id == ChatConst.SETTING_KEY_AUTO_VOICE_WORLD || id == ChatConst.SETTING_KEY_AUTO_VOICE_GANG) {
                checkValue = G_ConfigManager.isVoiceAutoPay() && 1 || 0;
            } else {
                checkValue = ChatConst.SETTING_CHECK_BOX_DEFAULT[id-1];
            }
        }
        return checkValue;
    }
    public isReceiveMsgOfChannel (channel) {
        return true;
    }
    public isShowMiniMsgOfChannel (channel) {
        let key = null;
        if (channel == ChatConst.CHANNEL_WORLD) {
            key = ChatConst.SETTING_KEY_RECEPT_WORLD;
        } else if (channel == ChatConst.CHANNEL_SYSTEM) {
            key = ChatConst.SETTING_KEY_RECEPT_SYSTEM;
        }
        if (!key) {
            return true;
        }
        let checkValue = this.getCheckBoxValue(key);
        if (checkValue && checkValue == 1) {
            return true;
        }
        return false;
    }
    public isAutoPlayVoiceOfChannel (channel) {
        let key = null;
        if (channel == ChatConst.CHANNEL_WORLD) {
            key = ChatConst.SETTING_KEY_AUTO_VOICE_WORLD;
        } else if (channel == ChatConst.CHANNEL_GUILD) {
            key = ChatConst.SETTING_KEY_AUTO_VOICE_GANG;
        } else if (channel == ChatConst.CHANNEL_PRIVATE) {
            key = ChatConst.SETTING_KEY_AUTO_VOICE_PRIVATE;
        }
        if (!key) {
            return false;
        }
        let checkValue = this.getCheckBoxValue(key);
        if (checkValue && checkValue == 1) {
            return true;
        }
        return false;
    }
}