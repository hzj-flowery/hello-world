import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData, G_SignalManager } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";

export class CustomActivityService extends BaseService {
    public _actShow: boolean;
    constructor() {
        super();
        this.start();
        this._actShow = false;
    }
    public tick() {
        if (G_SceneManager.getRunningScene() == null) {
            return;
        }
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_ACTIVITY)[0];
        if (!isOpen) {
            return;
        }
        G_UserData.getTimeLimitActivity().checkTimeLimitActivityChange();
        let actShow = G_UserData.getTimeLimitActivity().hasTimeLimitActivityCanVisible();
        if (this._actShow != actShow) {
            this._actShow = actShow;
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_ACTIVITY);
            // console.log('------------------------------------------CustomActivityService:EVENT_MAIN_CITY_CHECK_BTNS');
        }
        if (this.isInModule()) {
            if (G_UserData.getCustomActivity().isExpired()) {
                // console.log('------------------------------------------CustomActivityService:expired');
                G_UserData.getCustomActivity().resetData();
            }
        }
    }
}
