import { BaseService } from "./BaseService";
import { G_SceneManager, G_SignalManager } from "../init";
import { LogicCheckHelper } from "../utils/LogicCheckHelper";
import { FunctionConst } from "../const/FunctionConst";
import { UserDataHelper } from "../utils/data/UserDataHelper";
import { SignalConst } from "../const/SignalConst";
import { ShopConst } from "../const/ShopConst";

export class ShopService extends BaseService {
    
    _redPoint
    constructor() {
        super()
        this.start();
        this._redPoint = null;
    }
    public tick() {
        let runningSceneName = G_SceneManager.getRunningScene().getName();
        if (runningSceneName != 'main') {
            return;
        }
        let [ isOpen ] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SHOP_SCENE);
        if (!isOpen) {
            return;
        }
        let [recoverTime, intervalTime, isRecoverFull] = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.HERO_SHOP);
        let redPoint = isRecoverFull;
        if (this._redPoint == null) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE);
            // console.log('------------------------------------------ShopService: redPoint');
        } else if (this._redPoint != redPoint) {
            G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE);
            // console.log('------------------------------------------ShopService: redPoint');
        }
        this._redPoint = redPoint;
    }
}
