import { BaseService } from "./BaseService";
import { G_SceneManager, G_UserData, G_SignalManager } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";

export class Day7ActivityService extends BaseService {
    public _actShow: boolean;
    
    constructor() {
        super();
        this.start();
        this._actShow = false;
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WEEK_ACTIVITY)[0];
        if (!isOpen) {
            return;
        }
        let actShow = G_UserData.getDay7Activity().isInActRewardTime();
        if (this._actShow != actShow) {
            this._actShow = actShow;
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_SEVEN_DAY_RECHARGE);
            console.log('------------------------------------------Day7ActivityService:EVENT_MAIN_CITY_CHECK_BTNS');
        }
        if (G_UserData.getDay7Activity().isExpired()) {
            G_UserData.getDay7Activity().resetData();
            console.log('------------------------------------------Day7ActivityService:expired');
        }
    }
}
