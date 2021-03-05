import { BaseData } from "./BaseData";
import { G_StorageManager, G_UserData } from "../init";

let schema = {};
export class UserConfigData extends BaseData {
    public static FILE_NAME = 'userconfig';
    public static schema = schema;

    _data;
    _isInit: boolean;

    constructor(properties?) {
        super(properties);
        super(properties)
        this._data = {};
        this._isInit = false;
    }
    public clear() {
    }
    public reset() {
        this._isInit = false;
        this._data = {};
    }
    public _init() {
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        this._data = this._getData();
    }
    public getData() {
        if (this._data.length == 0 && this._isInit == false) {
            this._init();
        }
        return this._data;
    }
    public flush() {
        this._saveData(this._data);
    }
    public _saveData(data) {
        G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
        G_StorageManager.saveWithUser(UserConfigData.FILE_NAME, data);
        this._data = data;
    }
    public _getData() {
        G_StorageManager.setUserInfo('', G_UserData.getBase().getId());
        this._data = G_StorageManager.loadUser(UserConfigData.FILE_NAME) || {};
        return this._data;
    }
    public getConfigValue(key) {
        let data = this.getData();
        let dataValue = data[key];
        return dataValue;
    }
    public setConfigValue(key, value) {
        let data = this.getData();
        data[key] = value;
        this._saveData(data);
    }
}
