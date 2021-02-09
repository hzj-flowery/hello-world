import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import PopupStatistics from "../fight/PopupStatistics";
import ComponentBase from "./ComponentBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryBase extends PopupBase {

    public static NORMAL_FIX_X = 290
    private static PicLeft =
        [
            Path.getText("battle/txt_com_battle_v04"),
            Path.getText("battle/txt_com_battle_v01"),
            Path.getText("battle/txt_com_battle_v03"),
        ]
    private static PicRight =
        [
            Path.getText("battle/txt_com_battle_v01"),
            Path.getText("battle/txt_com_battle_v02"),
            Path.getText("battle/txt_com_battle_v01"),
        ]

    private _callback;
    private _isStart: boolean;
    private _isFinish: boolean;
    private _componentList: ComponentBase[];
    private _nowComponent: ComponentBase;
    private _playIndex;
    private _levelUp;
    private _midXPos;
    private _statisticsData;
    private _winType;

    private _panelFinish: cc.Node;
    private _btnStatistics: cc.Node;
    private _btnReplay: cc.Node;

    public init(battleData, callback: Function, componentList?: ComponentBase[], midXPos?, notShowBlack?) {
        this._callback = callback;
        this._isStart = false;
        this._isFinish = false;
        this._componentList = componentList || [];
        this._nowComponent = null;
        this._playIndex = 0;
        this._levelUp = null;
        this._midXPos = midXPos || 0;
        this._statisticsData = battleData.statisticsData;
        this._winType = battleData.star;
        this.setNotCreateShade(notShowBlack);
        this.node.name = "SummaryBase";
    }

    protected onCreate() {

        if (this._isOnLoadCalled != 0) {
            return;
        }

        for (let i = 0; i < this._componentList.length; i++) {
            var v = this._componentList[i];
            this.node.addChild(v.node);
        }

        this._panelFinish = new cc.Node("_panelFinish");
        this._panelFinish.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelFinish.setAnchorPoint(0.5, 0.5);
        this._panelFinish.setPosition(0, 0);
        this._panelFinish.addComponent(cc.BlockInputEvents);

        this.node.addChild(this._panelFinish);
    }

    protected onEnter() {

    }

    protected onExit() {

    }

    private setStart() {
        for (let i = 0; i < this._componentList.length; i++) {
            this._componentList[i].node.zIndex = (i + 1);
        }
        this._isStart = true;
        this._isFinish = false;
        this._playIndex = 1;
        this._nowComponent = null;
    }

    protected checkStart(event) {
        if (event == 'play_begin') {
            this.setStart();
        }
    }

    private checkNextComponent() {
        if (!this._nowComponent) {
            this._nowComponent = this._componentList[this._playIndex - 1];
        }
    }

    private onFinish() {
        this._createContinueNode();
        this._isFinish = true;
    }

    update(f) {
        if (!this._isStart || this._isFinish) {
            return;
        }
        if (this._playIndex > this._componentList.length) {
            this.onFinish();
        } else {
            this.checkNextComponent();
            if (this._nowComponent) {
                if (!this._nowComponent.isStart()) {
                    this._nowComponent.setStart();
                } else {
                    this._nowComponent.setUpdate(f);
                    if (this._nowComponent.isFinish()) {
                        this._nowComponent = null;
                        this._playIndex = this._playIndex + 1;
                    }
                }
            }
        }
    }

    private _onTouchHandler(sender) {
        this.onClickPanel();
    }

    public onStatisticsClick(sender, event) {
        G_SceneManager.openPopup(Path.getPrefab('PopupStatistics', "fight"), (popupStatistics: PopupStatistics) => {
            popupStatistics.init(this._statisticsData);
            popupStatistics.openWithAction();
        });
    }

    public onReplayClick(sender, event) {
        if (G_UserData.getSeasonSport()) {
            G_UserData.getSeasonSport().setPlayReport(true);
        }
        G_SignalManager.dispatch(SignalConst.EVENT_BATTLE_REPLAY);
        this.close();
    }

    public isAnimEnd() {
        return this._isFinish;
    }

    public doCallBack() {
        if (this._callback) {
            this._callback();
        }
    }

    private onClickPanel() {
        if (!this._isFinish) {
            return;
        }
        this._levelUp = UserCheck.isLevelUp(this._callback);
        // this._panelFinish.setTouchEnabled(false);
    }

    private _createContinueNode() {

        this._panelFinish.once(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchHandler));

        var height = Math.min(640, G_ResolutionManager.getDesignHeight());

        var continueNode: cc.Node;
        cc.resources.load(Path.getPrefab('CommonContinueNode', 'common'), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            continueNode = cc.instantiate(res)
            this.node.addChild(continueNode, 100);
            continueNode.setPosition(this._midXPos, 25 - height * 0.5);
        }.bind(this));
        var open = FunctionCheck.funcIsOpened(FunctionConst.FUNC_FIGHT_STATISTICS)[0];
        if (open) {
            var params = {
                name: '_imageLevel',
                texture: Path.getBattleRes('bth_tongji01')
            };
            this._btnStatistics = UIHelper.createImage(params);
            let btn: cc.Button = this._btnStatistics.addComponent(cc.Button);
            this.node.addChild(this._btnStatistics);
            this._btnStatistics.setAnchorPoint(0, 0);
            var x = G_ResolutionManager.getDesignCCSize().width / 2;
            this._btnStatistics.setPosition(-x, -320);

            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "SummaryBase";
            clickEventHandler.handler = "onStatisticsClick";
            btn.clickEvents.push(clickEventHandler);

            var spriteTongji = UIHelper.newSprite(Path.getBattleFont('txt_tongji01')).node;
            this._btnStatistics.addChild(spriteTongji);
            spriteTongji.setPosition(95, 20);
        }
        open = FunctionCheck.funcIsOpened(FunctionConst.FUNC_FITHG_REPLAY)[0];
        if (open) {
            var params = {
                name: '_imageLevel',
                texture: Path.getBattleRes('bth_huifang03')
            };
            this._btnReplay = UIHelper.createImage(params);
            let btn: cc.Button = this._btnReplay.addComponent(cc.Button);
            this.node.addChild(this._btnReplay);
            this._btnReplay.setAnchorPoint(0, 0);
            var x = G_ResolutionManager.getDesignCCSize().width / 2 - 150;
            this._btnReplay.setPosition(-x, -310);

            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node;
            clickEventHandler.component = "SummaryBase";
            clickEventHandler.handler = "onReplayClick";
            btn.clickEvents.push(clickEventHandler);

            var spriteTongji = UIHelper.newSprite(Path.getBattleFont('txt_huifang02')).node;
            this._btnReplay.addChild(spriteTongji);
            spriteTongji.setPosition(40, 10);
        }
    }

    protected playWinText(effect) {
        if (effect == 'left') {
            return UIHelper.newSprite(SummaryBase.PicLeft[this._winType - 1]).node;
        } else if (effect == 'right') {
            return UIHelper.newSprite(SummaryBase.PicRight[this._winType - 1]).node;
        }
    }
}