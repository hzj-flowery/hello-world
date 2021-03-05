import { BaseService } from "./BaseService";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { G_SceneManager, G_UserData, G_SignalManager } from "../init";
import { FunctionConst } from "../const/FunctionConst";
import { SignalConst } from "../const/SignalConst";

export class TerritoryService extends BaseService {
    _redPoint;
    constructor() {
        super();
        this.start();
        this._redPoint = null;
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main' && runningSceneName != 'challenge' && runningSceneName != 'territory') {
            return;
        }
        let [ isOpen ] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PVE_TERRITORY);
        if (!isOpen) {
            return;
        }
        let redValue1 = G_UserData.getTerritory().isShowRedPoint();
        let redValue2 = G_UserData.getTerritory().isRiotRedPoint();
        let redPoint = redValue1 || redValue2;
        if (this._redPoint == null) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
            // console.log('------------------------------------------TerritoryService: redPoint');
        } else if (this._redPoint != redPoint) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY);
            // console.log('------------------------------------------TerritoryService: redPoint');
        }
        this._redPoint = redPoint;
    }
}
