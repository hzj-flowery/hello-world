import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";
import { FightConfig } from "../FightConfig";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";


export default class Slowground extends cc.Component {
    private static ZORDER_YELLOW = 1;
    private static ZORDER_WHITE = 2;

    private _layerYellow: cc.Node;
    private _layerWhite: cc.Node;

    public init() {

    }

    public showWhiteAndYellow(callback) {
        this._layerYellow = UIHelper.newSprite(Path.getUICommon("img_com_line01"), new cc.Size(3000, 3000)).node;
        this._layerYellow.color = new cc.Color(255, 230, 0, 255);
        this._layerYellow.setAnchorPoint(0.5, 0.5);
        // this._layerYellow.setContentSize(cc.size(3000, 3000));
        this.node.addChild(this._layerYellow, Slowground.ZORDER_YELLOW);
        this._layerWhite = UIHelper.newSprite(Path.getUICommon("img_com_line01"), new cc.Size(3000, 3000)).node;
        this._layerYellow.color = new cc.Color(255, 255, 255, 255);
        this._layerWhite.setAnchorPoint(0.5, 0.5);
        // this._layerWhite.setContentSize(cc.size(3000, 3000));
        this.node.addChild(this._layerWhite, Slowground.ZORDER_WHITE);
        var actionOut = cc.fadeOut(0);
        var actionIn = cc.fadeIn(0);
        var actionDelay = cc.delayTime(FightConfig.SLOW_SCREEN_TIME);
        var actionQueue = cc.sequence(actionDelay, actionOut, actionDelay, actionIn);
        var actionCallBack = cc.callFunc(function () {
            this._layerWhite.active = false;
            this._layerYellow.active = false;
            if (callback) {
                callback();
            }
        }.bind(this));
        var actionEndCG = cc.callFunc(function () {
            FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_SHOW_ENDCG);
        });
        var action = cc.sequence(actionQueue, actionQueue, actionQueue, actionEndCG, actionCallBack);
        this._layerWhite.runAction(action);
    }
}