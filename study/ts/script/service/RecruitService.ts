import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData, G_SignalManager } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";

export class RecruitService extends BaseService {

    _hasNotice: boolean;
    constructor() {
        super();
        this.start();
        this._hasNotice = false;
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let [ isOpen ] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WEEK_ACTIVITY);
        if (!isOpen) {
            return;
        }
        let hasCount = G_UserData.getRecruitData().hasFreeCount();
        if (!hasCount) {
            return;
        }
        if (G_UserData.getRecruitData().hasFreeNormalCount()) {
            if (!this._hasNotice) {
                G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE);
                this._hasNotice = true;
            }
        } else {
            this._hasNotice = false;
        }
    }
}
