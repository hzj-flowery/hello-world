import { G_ConfigLoader, G_UserData } from "../../../init";

export default class RollNoticeTask {
    _name: any;
    _filterList: any[];
    _notRunSelf: any;
    _pause: boolean;
    _stop: boolean;
    constructor(name, filterList, notRunSelf) {
        this._name = name;
        this._filterList = filterList || [];
        this._notRunSelf = notRunSelf;
        this._pause = false;
        this._stop = false;
    }
    start() {
        this._stop = false;
    }
    isExistEffect(id) {
        if (typeof (id) != 'number') {
            return '';
        }
        var PaoMaDeng = G_ConfigLoader.getConfig('paomadeng');
        var cfg = PaoMaDeng.get(id);
        return cfg.if_team_display;
    }
    canReceiveNotice(value) {
        if (this._stop) {
            return false;
        }
        if (value == null || typeof (value) != 'object') {
            return false;
        }
        if (this._filterList.indexOf(value.noticeType) != -1) {
            return false;
        }
        return true;
    }
    canRunNotice(value) {
        var isSelf = value.sendId && G_UserData.getBase().getId() == value.sendId;
        var notRun = (this._notRunSelf != -1) && isSelf == true;
        if (notRun) {
            return false;
        }
        return !this._pause && this.canReceiveNotice(value);
    }
    stop() {
        this._stop = true;
    }
    pause() {
        this._pause = true;
    }
    resume() {
        this._pause = false;
    }
    clear() {
        this.stop();
    }
    getName() {
        return this._name;
    }
}