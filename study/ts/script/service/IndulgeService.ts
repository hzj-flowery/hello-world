import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";
import { TimeConst } from "../const/TimeConst";
import { G_SceneManager, G_SignalManager, G_UserData } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { UIPopupHelper } from "../utils/UIPopupHelper";
import { BaseService } from "./BaseService";

export class IndulgeService extends BaseService {

    public _showStage01: boolean;
    public _showStage02: boolean;
    public _alertDialog;
    constructor() {
        super();
        this.start();
        this._showStage01 = null;
        this._showStage02 = null;
        this._alertDialog = null;
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INDULGE)[0];
        if (!isOpen) {
            return;
        }
        let visible01 = G_UserData.getBase().getOnlineTime() >= TimeConst.INDULGE_TIME_01;
        let visible02 = G_UserData.getBase().getOnlineTime() >= TimeConst.INDULGE_TIME_02;
        let showDialog = false;
        if (visible01 == true && this._showStage01 != visible01) {
            this._showStage01 = visible01;
            console.log('------------------------------------------IndulgeService:EVENT_MAIN_CITY_CHECK_BTNS');
            G_SignalManager.dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_AVOID_GAME);
            showDialog = true;
            //this._alertDialog = alertDialog;
            console.log('------------------------------------------IndulgeService:show dialog 01');
        }
        if (visible02 == true && this._showStage02 != visible02) {
            this._showStage02 = visible02;
            showDialog = true;
            console.log('------------------------------------------IndulgeService:show dialog 02');
        }
        if (showDialog) {
            if (this._alertDialog) {
                this._alertDialog.destroy()
            }
            let alertDialog = UIPopupHelper.popupIndulgeDialog(this._exitDialog.bind(this));
            this._alertDialog = alertDialog;
        }
    }
    public _exitDialog() {
        this._alertDialog = null;
    }
}
