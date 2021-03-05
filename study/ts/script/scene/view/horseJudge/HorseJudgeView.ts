const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import HorseConst from '../../../const/HorseConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors, G_AudioManager, G_EffectGfxMgr, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import ViewBase from '../../ViewBase';




@ccclass
export default class HorseJudgeView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _nodeTip: cc.Node = null;

    @property({ type: CommonHelpBig, visible: true })
    _buttonHelp: CommonHelpBig = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _button1: CommonButtonLevel0Highlight = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _button2: CommonButtonLevel0Highlight = null;

    @property({ type: CommonResourceInfo, visible: true })
    _nodeCost1: CommonResourceInfo = null;

    @property({ type: CommonResourceInfo, visible: true })
    _nodeCost2: CommonResourceInfo = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffectBg: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topBar: CommonTopbarBase = null;

    private COST_COUNT1 = HorseConst.JUDGE_COST_COUNT_1;
    private COST_COUNT2 = HorseConst.JUDGE_COST_COUNT_2;

    private _signalHorseJudgeSuccess;
    private _idle: cc.Node;
    private _lasso: cc.Node;

    public preloadRes(callBack: Function, params) {
        this.addPreloadSceneRes(114);
        super.preloadRes(callBack, params);
    }

    onCreate() {
        this.setSceneSize();
        this.updateSceneId(114);
        this._topBar.setImageTitle('txt_sys_com_xiangma');
        this._topBar.updateUI(TopBarStyleConst.STYLE_HORSE);
        this._buttonHelp.updateUI(FunctionConst.FUNC_HORSE_JUDGE);
        var content = Lang.get('horse_judge_tip_des');
        var richText = RichTextExtend.createWithContent(content);
        richText.node.setAnchorPoint(0.5, 0.5);
        this._nodeTip.addChild(richText.node);
        this._button1.setString(Lang.get('horse_judge_btn_1'));
        this._button2.setString(Lang.get('horse_judge_btn_2'));
        this._nodeCost1.onLoad();
        this._nodeCost2.onLoad();
        this._nodeCost1.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, this.COST_COUNT1);
        this._nodeCost2.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS, this.COST_COUNT2);
        this._nodeCost1.showResName(true, Lang.get('horse_judge_cost_des'));
        this._nodeCost2.showResName(true, Lang.get('horse_judge_cost_des'));
        this._nodeCost1.setTextColor(Colors.NUMBER_WHITE);
        this._nodeCost2.setTextColor(Colors.NUMBER_WHITE);
        this._initEffectBg();
        this._button1.addClickEventListenerEx(handler(this, this._onClick1));
        this._button2.addClickEventListenerEx(handler(this, this._onClick2));
    }

    public onEnter() {
        this._signalHorseJudgeSuccess = G_SignalManager.add(SignalConst.EVENT_HORSE_JUDGE_SUCCESS, handler(this, this._horseJudgeSuccess));
        this._playIdle();
        this._updateData();
        this._updateView();
    }

    public onExit() {
        this._signalHorseJudgeSuccess.remove();
        this._signalHorseJudgeSuccess = null;
    }

    private _updateData() {
    }

    private _updateView() {
        this._updateRP();
    }

    private _updateRP() {
        var reach1 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, 'type1');
        var reach2 = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE_JUDGE, 'type2');
        this._button1.showRedPoint(reach1);
        this._button2.showRedPoint(reach2);
    }

    private _checkCost(index) {
        var myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS);
        var needCount = this.COST_COUNT1;
        if (index == 2) {
            needCount = this.COST_COUNT2;
        }
        if (myCount >= needCount) {
            return true;
        } else {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"), (popup: PopupItemGuider) => {
                popup.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_CLASSICS);
                popup.openWithAction();
            })
            return false;
        }
    }

    private _onClick1() {
        if (LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_HORSE) == true) {
            return;
        }
        if (this._checkCost(1) == false) {
            return;
        }
        this._setBtnEnable(false);
        G_UserData.getHorse().c2sWarHorseDraw(this.COST_COUNT1);
    }

    private _onClick2() {
        if (LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_HORSE) == true) {
            return;
        }
        if (this._checkCost(2) == false) {
            return;
        }
        this._setBtnEnable(false);
        G_UserData.getHorse().c2sWarHorseDraw(this.COST_COUNT2);
    }

    private _setBtnEnable(enable) {
        this._button1.setEnabled(enable);
        this._button2.setEnabled(enable);
    }

    private _horseJudgeSuccess(eventName, awards) {
        this._updateRP();
        this._playLasso(awards);
    }

    private _initEffectBg() {
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectBg, 'moving_xiangma_chuansongmen', null, null, false);
    }

    private _playIdle() {
        this._resetIdle();
        this._idle = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_xiangma_idle', null, null, false).node;
    }

    private _playLasso(awards) {
        function eventFunction(event) {
            if (event == 'huode') {
                PopupGetRewards.showRewards(awards);
            } else if (event == 'finish') {
                if (this._playIdle) {
                    this._playIdle();
                }
                this._setBtnEnable(true);
                this._lasso.runAction(cc.destroySelf());
                this._lasso = null;
            }
        }
        this._resetIdle();
        this._resetLasso();
        this._lasso = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_xiangma_huodedaoju', null, eventFunction.bind(this), false).node;
        G_AudioManager.playSoundWithId(AudioConst.SOUND_HORSE_JUDGE);
    }

    private _resetIdle() {
        if (this._idle) {
            this._idle.removeFromParent();
            this._idle = null;
        }
    }

    private _resetLasso() {
        if (this._lasso) {
            this._lasso.removeFromParent();
            this._lasso = null;
        }
    }
}