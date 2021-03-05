import PopupBase from "../../../ui/PopupBase";
import { G_UserData, G_SignalManager, G_ConfigLoader, G_EffectGfxMgr, Colors, G_Prompt } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import CommonStoryAvatar from "../../../ui/component/CommonStoryAvatar";
import PanelFamousReward1 from "./PanelFamousReward1";
import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { DropHelper } from "../../../utils/DropHelper";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ParameterIDConst from "../../../const/ParameterIDConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { DataConst } from "../../../const/DataConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import CommonResourceInfo from "../../../ui/component/CommonResourceInfo";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import PanelFamousReward2 from "./PanelFamousReward2";
import CommonTalkNodeFamous from "../../../ui/component/CommonTalkNodeFamous";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupFamousDetail extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: CommonStoryAvatar,
        visible: true
    })
    _heroAvatar: CommonStoryAvatar = null;

    @property({
        type: CommonTalkNodeFamous,
        visible: true
    })
    _talkNode: CommonTalkNodeFamous = null;

    @property({
        type: PanelFamousReward1,
        visible: true
    })
    _panelReward1: PanelFamousReward1 = null;

    @property({
        type: PanelFamousReward1,
        visible: true
    })
    _panelReward2: PanelFamousReward1 = null;

    @property({
        type: PanelFamousReward2,
        visible: true
    })
    _panelReward3: PanelFamousReward2 = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _fightBtn: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _fightBtnNode: cc.Node = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _costInfo: CommonResourceInfo = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _closeBtn: cc.Button = null;

    private _data;
    private _configData;
    private _signalExecuteStage;

    public init(stageId) {
        this._data = G_UserData.getStage().getStageById(stageId);
        this._configData = this._data.getConfigData();
        this._signalExecuteStage = null;
    }

    public onCreate() {
        this._heroAvatar.node.removeFromParent();
        this._talkNode.node.removeFromParent();
        this._panelReward1.node.removeFromParent();
        this._panelReward2.node.removeFromParent();
        this._panelReward3.node.removeFromParent();
        this._fightBtnNode.removeFromParent();
        this._costInfo.node.removeFromParent();
        this._heroName.node.removeFromParent();
        this._closeBtn.node.removeFromParent();
        this._createAnim();
    }

    public onEnter() {
        this._signalExecuteStage = G_SignalManager.add(SignalConst.EVENT_EXECUTE_STAGE, handler(this, this._onEventExecuteStage));
    }

    public onExit() {
        this._signalExecuteStage.remove();
        this._signalExecuteStage = null;
    }

    private _createAnim() {
        let effectFunction = (effect): cc.Node => {
            if (effect == 'lihui') {
                this._heroAvatar.updateUI(this._configData.res_id);
                return this._heroAvatar.node;
            } else if (effect == 'jiangli1') {
                let reward = DropHelper.getDropReward(this._configData.first_drop);
                return this._createReward(1, reward);
            } else if (effect == 'jiangli2') {
                let myLevel = G_UserData.getBase().getLevel();
                let Parameter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
                let exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content;
                let money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content;
                let rewards = [{
                    type: TypeConvertHelper.TYPE_RESOURCE,
                    value: DataConst.RES_EXP,
                    size: myLevel * exp * this._configData.cost
                },
                {
                    type: TypeConvertHelper.TYPE_RESOURCE,
                    value: DataConst.RES_GOLD,
                    size: myLevel * money * this._configData.cost
                }
                ];
                return this._createReward(2, rewards);
            } else if (effect == 'jiangli3') {
                let rewards = DropHelper.getStageDrop(this._configData);
                return this._createRewardItem(rewards);
            } else if (effect == 'tiaozhan') {
                return this._createFightBtn();
            } else if (effect == 'xiaohao') {
                return this._createCostNode();
            } else if (effect == 'mingzi') {
                return this._createName();
            } else if (effect == 'close') {
                return this._createCloseBtn();
            } else if (effect == 'duihua') {
                return this._createTalk();
            }
        }
        function eventFunc(event) {
            if (event == 'finish') {
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupFamousDetail");
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_mingjiangfuben', effectFunction, eventFunc, false);
    }

    private _createName(): cc.Node {
        var fontColor = Colors.getFamousNameColor();
        this._heroName.node.color = fontColor;
        this._heroName.string = this._configData.name;
        return this._heroName.node;
    }

    private _createReward(index, rewards): cc.Node {
        if (index == 1) {
            this._panelReward1.updateUI(index, rewards);
            return this._panelReward1.node;
        }
        if (index == 2) {
            this._panelReward2.updateUI(index, rewards);
            return this._panelReward2.node;
        }
        return new cc.Node();
    }

    private _createRewardItem(rewards) {
        this._panelReward3.updateUI(3, rewards);
        return this._panelReward3.node;
    }

    private _createFightBtn(): cc.Node {
        if (this._data.getExecute_count() >= this._configData.challenge_num) {
            return UIHelper.newSprite(Path.getTextSignet('img_yitiaozhan')).node;
        } else {
            this._fightBtn.setString(Lang.get('stage_fight'));
            this._fightBtn.addClickEventListenerEx(handler(this, this._onFightClick));
            this._fightBtn.node.name = ('_btnFight');
            return this._fightBtnNode;
        }
    }

    private _createCostNode(): cc.Node {
        if (this._data.getExecute_count() >= this._configData.challenge_num) {
            return new cc.Node();
        }
        this._costInfo.onLoad();
        this._costInfo.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, this._configData.cost);
        this._costInfo.node.y = (-10);
        this._costInfo.showResName(true, Lang.get('famous_cost'));
        return this._costInfo.node;
    }

    public _onFightClick() {
        var leftCount = G_UserData.getChapter().getFamousLeftCount();
        if (leftCount <= 0) {
            G_Prompt.showTip(Lang.get('famous_no_count'));
            return;
        }
        // var bagFull = LogicCheckHelper.checkPackFullByAwards(this._awardsList);
        var bagFull = LogicCheckHelper.checkPackFullByAwards(null);
        if (bagFull) {
            return;
        }
        var needVit = this._configData.cost;
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit);
        if (!success) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_TOPBAR_PAUSE);
        G_UserData.getStage().c2sExecuteStage(this._configData.id);
    }

    private _createCloseBtn(): cc.Node {
        return this._closeBtn.node;
    }

    public onCloseClick(sender, event) {
        this.closeWithAction();
    }

    private _createTalk() {
        if (this._configData.talk != '') {
            this._talkNode.setText(this._configData.talk, 400);
            // this._talkNode.node.setPosition(-130, -50);
            return this._talkNode.node;
        }
        else {
            return new cc.Node();
        }
    }

    private _onEventExecuteStage(eventName, a, b, c, isWin) {
        if (isWin) {
            this.close();
        }
    }
}