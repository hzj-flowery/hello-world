import { BaseData } from "./BaseData";
import { G_SignalManager, G_ServerTime, G_StorageManager, G_UserData } from "../init";
import { SignalConst } from "../const/SignalConst";
import { TimeConst } from "../const/TimeConst";

export interface UserOperaData {
}
let schema = {};
export class UserOperaData extends BaseData {
public static FILE_NAME = 'useroperatime';
public static schema = schema;

        _data;
        _registeredPopupList;
        _isInit: boolean;
        _signalEnterMainScene;

    constructor(properties?) {
        super(properties);
        this._data = {};
        this._registeredPopupList = {};
        this._isInit = false;
        this._signalEnterMainScene = G_SignalManager.add(SignalConst.EVENT_RECV_FLUSH_DATA, this._onEnterMainScene.bind(this));
    }
    public clear() {
        this._signalEnterMainScene.remove();
        this._signalEnterMainScene = null;
    }
    public reset() {
        this._isInit = false;
        this._data = {};
    }
    public _onEnterMainScene() {
        this._init();
        for (let k in this._registeredPopupList) {
            let v = this._registeredPopupList[k];
        }
    }
    public registerPopup(popupId) {
        this._registeredPopupList.push(popupId);
    }
    public _init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        this._data = this._getData();
    }
    public flush() {
        this._saveData(this._data);
    }
    public _saveData(data) {
        G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
        G_StorageManager.saveWithUser(UserOperaData.FILE_NAME, data);
    }
    public _getData() {
        G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
        return G_StorageManager.loadUser(UserOperaData.FILE_NAME) || {};
    }
    public isFirstLogin(key) {
        let data = this._getData();
        if (!data[key]) {
            return true;
        }
        let zeroSeconds = TimeConst.RESET_TIME * 3600;
        let lastestTime = data[key];
        let seconds = G_ServerTime.secondsFromToday(lastestTime);
        return seconds < zeroSeconds;
    }
    public setLastestTime(key, time, instantUpdate) {
        let data = this._getData();
        data[key] = time;
        if (instantUpdate) {
            this._saveData(data);
        }
    }
}
