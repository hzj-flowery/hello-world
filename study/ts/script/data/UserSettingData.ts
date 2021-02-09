import { G_StorageManager, G_AudioManager } from "../init";
import { BaseData } from "./BaseData";

let schema = {};
export class UserSettingData extends BaseData {

    public static schema = schema;
    public static FILE_NAME = 'usersettting';

    _data;
    _isInit: boolean;
    constructor(properties?) {
        super(properties);
        super(properties)
        this._isInit = false;
        this._data = this._getData();
    }
    public clear() {
        this._data = this._getData();
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
        return this._data;
    }
    public flush() {
        this._saveData(this._data);
    }
    public _saveData(data) {
        G_StorageManager.save(UserSettingData.FILE_NAME, data);
        this._data = data;
    }
    public _getData() {
        this._data = G_StorageManager.load(UserSettingData.FILE_NAME) || {};
        return this._data;
    }
    public getSettingValue(key) {
        let data = this.getData();
        let dataValue = data[key];
        return dataValue;
    }
    public setSettingValue(key, value) {
        let data = this.getData();
        data[key] = value;
        this._saveData(data);
    }
    public initMusic() {
        let data = this.getData();
        let isChange = false;
        if (data['musicEnabled'] == null) {
            data['musicEnabled'] = 1;
            isChange = true;
        }
        if (data['soundEnabled'] == null) {
            data['soundEnabled'] = 1;
            isChange = true;
        }
        if (isChange) {
            this._saveData(data);
        }
    }
    public updateMusic() {
        let data = this.getData();
        this.initMusic();
        if (data['musicEnabled'] == 1) {
            G_AudioManager.setMusicEnabled(true);
            if (data['mus_volume'] != null) {
                G_AudioManager.setMusicVolume(data['mus_volume']);
            }
        } else {
            G_AudioManager.setMusicEnabled(false);
        }
        if (data['soundEnabled'] == 1) {
            G_AudioManager.setSoundEnabled(true);
            if (data['sou_volume'] != null) {
                G_AudioManager.setSoundVolume(data['sou_volume']);
            }
        } else {
            G_AudioManager.setSoundEnabled(false);
        }
        if (data['gfxEnabled'] == 1) {
        } else {
        }
    }
    public getHideWearEquip() {
        let value = this.getSettingValue('hideWearEquip') || 1;
        let hide = value == 1 && true || false;
        return hide;
    }
    public setHideWearEquip(hide) {
        let value = hide && 1 || 0;
        this.setSettingValue('hideWearEquip', value);
    }
    public getHideWearHistoryHero() {
        let value = this.getSettingValue('HideWearHistoryHero') || 1;
        let hide = value == 1 && true || false;
        return hide;
    }
    public setHideWearHistoryHero(hide) {
        let value = hide && 1 || 0;
        this.setSettingValue('HideWearHistoryHero', value);
    }
    public getHideWearHorseEquip() {
        let value = this.getSettingValue('hideWearHorseEquip') || 1;
        let hide = value == 1 && true || false;
        return hide;
    }
    public setHideWearHorseEquip(hide) {
        let value = hide && 1 || 0;
        this.setSettingValue('hideWearHorseEquip', value);
    }
    public getHideWearTreasure() {
        let value = this.getSettingValue('hideWearTreasure') || 1;
        let hide = value == 1 && true || false;
        return hide;
    }
    public setHideWearTreasure(hide) {
        let value = hide && 1 || 0;
        this.setSettingValue('hideWearTreasure', value);
    }
    public getHideWearSilkbag() {
        let value = this.getSettingValue('hideWearSilkbag') || 1;
        let hide = value == 1 && true || false;
        return hide;
    }
    public setHideWearSilkbag(hide) {
        let value = hide && 1 || 0;
        this.setSettingValue('hideWearSilkbag', value);
    }
}
