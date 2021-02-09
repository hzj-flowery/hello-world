import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_ConfigLoader, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonPowerUpButton from "../../../ui/component/CommonPowerUpButton";
import PopupBase from "../../../ui/PopupBase";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import PopupStatistics from "../fight/PopupStatistics";
import SummaryBase from "./SummaryBase";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SummaryLoseBase extends PopupBase {

    private static LosePic =
        [
            Path.getText("battle/txt_com_battle_f02"),
            Path.getText("battle/txt_com_battle_f01"),
        ]

    private _powerUpBtns: cc.Node[];
    private _functionIds: any[];
    private _callback;
    private _statisticsData;
    private _loseType;

    private _panelFinish: cc.Node;
    private _btnStatistics: cc.Node;
    private _btnReplay: cc.Node;

    public init(battleData, callback) {
        this._panelFinish = null;
        this._powerUpBtns = [];
        this._functionIds = [];
        this._getStrengthenFunc();
        this._callback = callback;
        this._statisticsData = battleData.statisticsData;
        this._loseType = battleData.loseType;
    }

    public onCreate() {
        this._panelFinish = new cc.Node("_panelFinish");
        this._panelFinish.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelFinish.setAnchorPoint(0.5, 0.5);
        this._panelFinish.setPosition(0, 0);
        this._panelFinish.addComponent(cc.BlockInputEvents);
        this.node.addChild(this._panelFinish);
    }

    public onEnter() {
    }

    public onExit() {
    }

    private _getStrengthenFunc() {
        let FunctionStrengthen = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_STRENGTHEN);
        var count = FunctionStrengthen.length();
        for (let i = 0; i < count; i++) {
            var tblFunction = FunctionStrengthen.indexOf(i);
            var myLevel = G_UserData.getBase().getLevel();
            if (myLevel >= tblFunction.level_min && myLevel <= tblFunction.level_max) {
                for (let j = 1; j <= 4; j++) {
                    var funcId = tblFunction['function_' + j];
                    this._functionIds.push(funcId);
                }
                break;
            }
        }
    }

    protected _createLoseNode(index): cc.Node {
        var functionId = this._functionIds[index - 1];
        var content = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(functionId);
        let node: cc.Node = new cc.Node();
        cc.resources.load(Path.getPrefab('CommonPowerUpButton', 'common'), cc.Prefab, (err, res) => {
            if (err != null || res == null) {
                return;
            }
            let powerUpBtn: CommonPowerUpButton = cc.instantiate(res).getComponent(CommonPowerUpButton);
            node.addChild(powerUpBtn.node);
            powerUpBtn.setIcon(Path.getCommonIcon('main', content.icon));
            powerUpBtn.setFuncName(content.name);
            powerUpBtn.setFuncIndex(index);
            powerUpBtn.setTouchFunc(handler(this, this._onBtnClick));
        });
        this._powerUpBtns.push(node);
        return node;
    }

    protected _createText(language?) {
        var lang = language || 'txt_sys_promote01';
        var text = Lang.get(lang);
        var fontColor = Colors.getSummaryLineColor();
        var label = UIHelper.createWithTTF(text, Path.getFontW8(), 24);
        label.node.color = (fontColor);
        return label.node;
    }

    protected _createContinueNode() {
        this._panelFinish.once(cc.Node.EventType.TOUCH_START, handler(this, this._onTouchHandler));

        var height = Math.min(640, G_ResolutionManager.getDesignHeight());
        let midXPos = SummaryBase.NORMAL_FIX_X;

        var continueNode: cc.Node;
        cc.resources.load(Path.getPrefab('CommonContinueNode', 'common'), cc.Prefab, function (err, res) {
            if (err != null || res == null) {
                return;
            }
            continueNode = cc.instantiate(res)
            this.node.addChild(continueNode, 100);
            continueNode.setPosition(-midXPos + 30, 25 - height * 0.5);
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
            clickEventHandler.component = "SummaryLoseBase";
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
            clickEventHandler.component = "SummaryLoseBase";
            clickEventHandler.handler = "onReplayClick";
            btn.clickEvents.push(clickEventHandler);

            var spriteTongji = UIHelper.newSprite(Path.getBattleFont('txt_huifang02')).node;
            this._btnReplay.addChild(spriteTongji);
            spriteTongji.setPosition(40, 10);
        }
    }

    private _onTouchHandler(sender) {
        if (this._callback != null) {
            this._callback();
            this._callback = null;
        }
    }

    private _onBtnClick(funcIndex) {
        var index = funcIndex;
        if (index == null || index <= 0) {
            return;
        }
        this._gotoFunc(index);
    }

    private _gotoFunc(index) {
        var functionId = this._functionIds[index - 1];
        let args: any[] = WayFuncDataHelper.getGotoFuncByFuncId(functionId, null)
        var goToFunc = args[0];
        let isLayer = args[1];
        if (goToFunc == false) {
            return;
        }
        if (isLayer == false && typeof (goToFunc) == 'function') {
            if (this._callback) {
                this._callback();
            }
            goToFunc();
        }
    }

    protected _createLosePic() {
        var picPath = SummaryLoseBase.LosePic[this._loseType];
        return UIHelper.newSprite(picPath).node;
    }

    public onStatisticsClick(sender) {
        G_SceneManager.openPopup(Path.getPrefab('PopupStatistics', "fight"), (popupStatistics: PopupStatistics) => {
            popupStatistics.init(this._statisticsData);
            popupStatistics.openWithAction();
        });
    }

    public onReplayClick(sender, event) {
        G_SignalManager.dispatch(SignalConst.EVENT_BATTLE_REPLAY);
        this.close();
    }
}