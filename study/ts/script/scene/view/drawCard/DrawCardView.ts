const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_ConfigLoader, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelpBig from '../../../ui/component/CommonHelpBig';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import PopupSelectRewardTab from '../../../ui/PopupSelectRewardTab';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { bit } from '../../../utils/bit';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import ViewBase from '../../ViewBase';
import { MilitaryMasterPlanHelper } from '../militaryMasterPlan/MilitaryMasterPlanHelper';
import { MilitaryMasterPlanView } from '../militaryMasterPlan/MilitaryMasterPlanView';
import DrawCardCashCell from './DrawCardCashCell';
import DrawCardCashTenCell from './DrawCardCashTenCell';
import DrawCardMoneyCell from './DrawCardMoneyCell';
import DrawCardPointBox from './DrawCardPointBox';
import DrawCardScoreIntroLayer from './DrawCardScoreIntroLayer';
import DrawNormalEffect from './DrawNormalEffect';
import DrawOneEffect from './DrawOneEffect';
import DrawTenEffect from './DrawTenEffect';







@ccclass
export default class DrawCardView extends ViewBase {
    _moneyDrawType: number;
    _goldDrawType: number;
    _goldDrawTenType: number;
    _isBanshu: boolean;
    _signalRecruitInfo: any;
    _signalRecruitNormal: any;
    _signalRecruitGold: any;
    _signalRecruitGoldTen: any;
    _signalRecruitPointGet: any;
    _effectNode: any;
    _scheduleHandler: any;
    _selectedBoxIndex: any;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _btnBook: CommonMainMenu = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _commonHelp: CommonHelpBig = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _myPoint: cc.Label = null;

    @property({
        type: DrawCardPointBox,
        visible: true
    })
    _box1: DrawCardPointBox = null;

    @property({
        type: DrawCardPointBox,
        visible: true
    })
    _box2: DrawCardPointBox = null;

    @property({
        type: DrawCardPointBox,
        visible: true
    })
    _box3: DrawCardPointBox = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _btnInfo: cc.Node = null;

    @property({
        type: DrawCardMoneyCell,
        visible: true
    })
    _moneyCell: DrawCardMoneyCell = null;

    @property({
        type: DrawCardCashCell,
        visible: true
    })
    _cashCell: DrawCardCashCell = null;

    @property({
        type: DrawCardCashTenCell,
        visible: true
    })
    _cashTenCell: DrawCardCashTenCell = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topNode: CommonTopbarBase = null;


    private static readonly ZORDER_EFFECT = 1000;
    private static readonly MONEY_DRAW_FREE = 1;
    private static readonly MONEY_DRAW_TOKEN = 2;
    private static readonly GOLD_DRAW_FREE = 1;
    private static readonly GOLD_DRAW_TOKEN = 2;
    private static readonly GOLD_DRAW_GOLD = 3;
    private static readonly BOX_NUM = 3;

    onLoad() {
        super.onLoad();
        this.setSceneSize();
        this._moneyDrawType = DrawCardView.MONEY_DRAW_FREE;
        this._goldDrawType = DrawCardView.GOLD_DRAW_FREE;
        this._goldDrawTenType = DrawCardView.GOLD_DRAW_FREE;
        var isBanshu = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_OPEN).content);
        //默认不是版署
        isBanshu = 0;
        if (isBanshu == 1) {
            this._isBanshu = true;
        } else {
            this._isBanshu = false;
        }

    }

    public static waitEnterMsg(callback) {
        var data: Array<string> = [];
        data.push("prefab/drawCard/DrawNormalEffect");
        data.push("prefab/drawCard/DrawOneEffect");
        data.push("prefab/drawCard/DrawTenEffect");
        cc.resources.load(data, cc.Prefab, handler(this, () => {
            // EffectGfxManager.prototype.loadPlayMovingGfx("moving_card_open_yes");
            callback();
        }));
    }

    start() {
        // super.start();
        if (this._topNode) {
            this._topNode.setImageTitle('txt_sys_com_jiuguan');
            this._topNode.updateUI(TopBarStyleConst.STYLE_DRAW_CARD);
        }
    }

    onDestroy() {
        super.onDestroy();
    }

    onCreate() {
        this._moneyCell.addTouchFunc(handler(this, this.onMoneyDrawClick));
        this._moneyCell.updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN, 1);

        this._cashCell.addTouchFunc(handler(this, this.onGoldClick));

        this._cashTenCell.addTouchFunc(handler(this, this.onGoldTenClick));
        this._cashTenCell.setRedPointVisible(false);
        this._cashTenCell.setFreeVisible(false);
        this._cashTenCell.setResourceVisible(true);

        var value = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST10).content);
        this._cashTenCell.updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value);

        this._box1.addTouchFunc(handler(this, this.boxTouch));
        var param = {
            point: parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_BOX1_POINT).content),
            imageClose: Path.getChapterBox('baoxiangtong_guan'),
            imageOpen: Path.getChapterBox('baoxiangtong_kai'),
            imageEmpty: Path.getChapterBox('baoxiangtong_kong')
        };
        this._box1.setParam(param);
        this._box2.addTouchFunc(handler(this, this.boxTouch));
        param = {
            point: parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_BOX2_POINT).content),
            imageClose: Path.getChapterBox('baoxiangyin_guan'),
            imageOpen: Path.getChapterBox('baoxiangyin_kai'),
            imageEmpty: Path.getChapterBox('baoxiangyin_kong')
        };
        this._box2.setParam(param);
        this._box3.addTouchFunc(handler(this, this.boxTouch));
        param = {
            point: parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_BOX3_POINT).content),
            imageClose: Path.getChapterBox('baoxiangjin_guan'),
            imageOpen: Path.getChapterBox('baoxiangjin_kai'),
            imageEmpty: Path.getChapterBox('baoxiangjin_kong')
        };
        this._box3.setParam(param);
        this._commonHelp.updateUI(FunctionConst.FUNC_DRAW_HERO);
    }
    onEnter() {
        if (G_UserData.getRecruitData().isExpired() == true) {
            G_UserData.getRecruitData().c2sRecruitInfo();
        }
        this._signalRecruitInfo = G_SignalManager.add(SignalConst.EVENT_RECRUIT_INFO, handler(this, this._onEventRecruitInfo));
        this._signalRecruitNormal = G_SignalManager.add(SignalConst.EVENT_RECRUIT_NORMAL, handler(this, this._onEventRecruitNormal));
        this._signalRecruitGold = G_SignalManager.add(SignalConst.EVENT_RECRUIT_GOLD, handler(this, this._onEventRecruitGold));
        this._signalRecruitGoldTen = G_SignalManager.add(SignalConst.EVENT_RECRUIT_GOLD_TEN, handler(this, this._onEventRecruitGoldTen));
        this._signalRecruitPointGet = G_SignalManager.add(SignalConst.EVENT_RECRUIT_POINT_GET, handler(this, this._onEventRecruitPointGet));
        this._effectNode = new cc.Node();
        this.node.addChild(this._effectNode, DrawCardView.ZORDER_EFFECT);
        var height = Math.min(640, cc.winSize.height);
        var width = Math.min(1136, cc.winSize.width);
        this._effectNode.setPosition(width * 0.5, height * 0.5);
        this._refreshMoneyCell();
        this._refreshGoldCell();
        this._refreshGoldTenCell();
        this._refreshBoxState();
        this.schedule(this._refreshMoneyCell, 1);
        this._btnBook.updateUI(FunctionConst.FUNC_DRAW_CARD_HAND_BOOK);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, DrawCardView);
    }
    onExit() {
        this._signalRecruitInfo.remove();
        this._signalRecruitInfo = null;
        this._signalRecruitNormal.remove();
        this._signalRecruitNormal = null;
        this._signalRecruitGold.remove();
        this._signalRecruitGold = null;
        this._signalRecruitGoldTen.remove();
        this._signalRecruitGoldTen = null;
        this._signalRecruitPointGet.remove();
        this._signalRecruitPointGet = null;
        this.unschedule(this._refreshMoneyCell);
    }
    _refreshBoxState() {
        var myPoint = G_UserData.getRecruitData().getRecruit_point();
        var state = G_UserData.getRecruitData().getRecruit_point_get();
        var box3Point = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_BOX3_POINT).content);
        this._myPoint.string = myPoint.toString();
        var boxStates = bit.tobits(state);
        for (var i = 1; i <= DrawCardView.BOX_NUM; i++) {
            var box = this['_box' + i];
            if (myPoint >= box.getBoxPoint()) {
                if (boxStates[i - 1] && boxStates[i - 1] == 1) {
                    box.setBoxState(DrawCardPointBox.STATE_EMPTY);
                } else {
                    box.setBoxState(DrawCardPointBox.STATE_OPEN);
                }
            } else {
                box.setBoxState(DrawCardPointBox.STATE_NORMAL);
            }
        }
    }
    _refreshMoneyCell() {
        var recruitData = G_UserData.getRecruitData();
        var freeCount = recruitData.getNormal_cnt();
        var lastRecuritTime = recruitData.getNormal_free_time();
        var freeTime = lastRecuritTime + parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_TNTERVAL).content);
        var tblFreeCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content);
        if (freeCount >= tblFreeCount) {
            this._moneyCell.setRedPointVisible(false);
            this._moneyCell.setFreeVisible(false);
            this._moneyCell.setResourceVisible(true);
            this._moneyCell.setTextCountDown();
            this._moneyDrawType = DrawCardView.MONEY_DRAW_TOKEN;
        }
        else if (G_ServerTime.getTime() > freeTime) {
            this._moneyCell.setRedPointVisible(true);
            this._moneyCell.setFreeVisible(true);
            this._moneyCell.setResourceVisible(false);
            this._moneyCell.setTextCountDown();
            this._moneyDrawType = DrawCardView.MONEY_DRAW_FREE;
            this._moneyCell.setTextCountDown(Lang.get("recruit_free_cnt", { count1: tblFreeCount - freeCount, count2: tblFreeCount }));
        }
        else {
            this._moneyCell.setRedPointVisible(false);
            this._moneyCell.setFreeVisible(false);
            this._moneyCell.setResourceVisible(true);
            var timeDiff = freeTime - G_ServerTime.getTime();
            var timeString = G_ServerTime._secondToString(timeDiff);
            this._moneyCell.setTextCountDown(Lang.get('recruit_time_count_down', { count: timeString }));
            this._moneyDrawType = DrawCardView.MONEY_DRAW_TOKEN;
        }
        var token = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_TOKEN);
        if (token > 0) {
            this._moneyCell.setRedPointVisible(true);
        }
        if (this._isBanshu) {
            var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_CNT).content) - recruitData.getDaily_normal_cnt();
            var getMoney = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_NORMAL_GIVE).content);
            this._moneyCell.refreshBanshuInfo(getMoney, leftCount, 1);
        }
        else {
            this._moneyCell.setBanshuVisible(false);
        }
    }
    _refreshGoldCell() {
        if (this._isBanshu) {
            this._cashCell.setRedPointVisible(false);
            this._cashCell.setFreeVisible(false);
            this._cashCell.setResourceVisible(true);
            this._cashCell.updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 1);
            var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData.getRecruitData().getDaily_gold_cnt();
            var getMoney = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_MONEY_GIVE).content);
            this._cashCell.refreshBanshuInfo(getMoney, leftCount, 1);
            var token = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN);
            if (token > 0) {
                this._goldDrawType = DrawCardView.GOLD_DRAW_TOKEN;
            } else {
                this._goldDrawType = DrawCardView.GOLD_DRAW_GOLD;
            }
            if (G_UserData.getRecruitData().getGold_baodi_cnt() == 1) {
                this._cashCell.setTextCountDown(Lang.get('recruit_must_baodi'));
            } else {
                this._cashCell.setTextCountDown(Lang.get('recruit_baodi_1', { count: G_UserData.getRecruitData().getGold_baodi_cnt() }));
            }
            return;
        }
        else {
            this._cashCell.setBanshuVisible(false);
        }
        var recruitData = G_UserData.getRecruitData();
        var token = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN);
        if (recruitData.getGold_cnt() == 0) {
            this._cashCell.setRedPointVisible(true);
            this._cashCell.setFreeVisible(true);
            this._cashCell.setResourceVisible(false);
            this._goldDrawType = DrawCardView.GOLD_DRAW_FREE;
        }
        else if(token > 0){
            this._cashCell.setRedPointVisible(true);
            this._cashCell.setFreeVisible(false);
            this._cashCell.setResourceVisible(true);
            this._cashCell.updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 1)
            this._goldDrawType = DrawCardView.GOLD_DRAW_TOKEN;
        } 
        else {
            this._cashCell.setRedPointVisible(false);
            this._cashCell.setFreeVisible(false);
            this._cashCell.setResourceVisible(true);
            var value = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST1).content);
            this._cashCell.updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value);
            this._goldDrawType = DrawCardView.GOLD_DRAW_GOLD;
        }
        if (recruitData.getGold_baodi_cnt() == 1) {
            this._cashCell.setTextCountDown(Lang.get('recruit_must_baodi'));
        } else {
            this._cashCell.setTextCountDown(Lang.get('recruit_baodi_1', { count: recruitData.getGold_baodi_cnt() }));
        }
    }
    _refreshGoldTenCell() {
        if (this._isBanshu) {
            this._cashTenCell.setRedPointVisible(false);
            this._cashTenCell.setFreeVisible(false);
            this._cashTenCell.setResourceVisible(true);
            this._cashTenCell.updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 10);
            var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData.getRecruitData().getDaily_gold_cnt();
            var tenCount = Math.floor(leftCount / 10);
            var getMoney = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_MONEY_GIVE).content) * 10;
            this._cashTenCell.refreshBanshuInfo(getMoney, tenCount, 10);
            var recruitData = G_UserData.getRecruitData();
            var count = recruitData.getGold_baodi_cnt();
            var next = 1;
            if (count > 10) {
                next = 2;
            }
            var goldBaodiCnt = Lang.get('recruit_baodi_count')[next];
            this._cashTenCell.setTextCountDown(Lang.get('recruit_baodi_10', { count: goldBaodiCnt }));
            return;
        }
        else {
            this._cashTenCell.setBanshuVisible(false);
        }
        var recruitData = G_UserData.getRecruitData();
        if (recruitData.getGold_baodi_cnt() == 1) {
            this._cashTenCell.setTextCountDown(Lang.get('recruit_must_baodi'));
        } else {
            this._cashTenCell.setTextCountDown(Lang.get('recruit_baodi_1', { count: recruitData.getGold_baodi_cnt() }));
        }
        var token = G_UserData.getItems().getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN);
        if (token >= 10) {
            this._cashTenCell.setRedPointVisible(true);
            this._cashTenCell.updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 10);
            this._goldDrawTenType = DrawCardView.GOLD_DRAW_TOKEN;
        } else {
            this._cashTenCell.setRedPointVisible(false);
            var value = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST10).content);
            this._cashTenCell.updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value);
            this._goldDrawTenType = DrawCardView.GOLD_DRAW_GOLD;
        }
    }
    onMoneyDrawClick() {
        if (this._moneyDrawType == DrawCardView.MONEY_DRAW_FREE) {
            G_UserData.getRecruitData().c2sRecruitNormal(this._moneyDrawType);
        } else {
            if (this._isBanshu) {
                var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_CNT).content) - G_UserData.getRecruitData().getDaily_normal_cnt();
                if (leftCount <= 0) {
                    G_Prompt.showTip(Lang.get('recruit_no_count'));
                    return;
                }
            }
            var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN, 1);
            if (success) {
                G_UserData.getRecruitData().c2sRecruitNormal(this._moneyDrawType);
            }
        }
    }
    onGoldClick() {
        if (this._goldDrawType == DrawCardView.GOLD_DRAW_GOLD) {
            var needValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST1).content);
            var alertInfo = Lang.get('recruit_confirm_info_1', {
                count: needValue,
                tokenCount: 1
            });
            // var popupSystemAlert = new PopupSystemAlert();
            // popupSystemAlert.setCheckBoxVisible(false);
            // popupSystemAlert.openWithAction();
            G_SceneManager.openPopup("prefab/common/PopupSystemAlert", (popup: PopupSystemAlert) => {
                popup.setup(Lang.get('recruit_confirm'), alertInfo, handler(this, this._sendGoldDraw));
                popup.setCheckBoxVisible(false);
                popup.openWithAction();
            });
        } else {
            G_UserData.getRecruitData().c2sRecruitGoldOne(this._goldDrawType);
        }
    }
    _sendGoldDraw() {
        if (this._isBanshu) {
            var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData.getRecruitData().getDaily_gold_cnt();
            if (leftCount <= 0) {
                G_Prompt.showTip(Lang.get('recruit_no_count'));
                return;
            }
        }
        var needValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST1).content);
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needValue);
        if (success) {
            G_UserData.getRecruitData().c2sRecruitGoldOne(this._goldDrawType);
        }
    }
    onGoldTenClick() {
        if (this._goldDrawTenType == DrawCardView.GOLD_DRAW_GOLD) {
            var needValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST10).content);
            var alertInfo = Lang.get('recruit_confirm_info_10', {
                count: needValue,
                tokenCount: 10
            });
            // var popupSystemAlert = new PopupSystemAlert(Lang.get('recruit_confirm'), alertInfo, handler(this, this._sendGoldTenDraw));
            // popupSystemAlert.setCheckBoxVisible(false);
            // popupSystemAlert.openWithAction();

            G_SceneManager.openPopup("prefab/common/PopupSystemAlert", (popup: PopupSystemAlert) => {
                popup.setup(Lang.get('recruit_confirm'), alertInfo, handler(this, this._sendGoldTenDraw));
                popup.setCheckBoxVisible(false);
                popup.openWithAction();
            });
        } else {
            G_UserData.getRecruitData().c2sRecruitGoldTen(this._goldDrawTenType);
        }
    }
    _sendGoldTenDraw() {
        if (this._isBanshu) {
            var leftCount = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData.getRecruitData().getDaily_gold_cnt();
            var leftTenCount = Math.floor(leftCount / 10);
            if (leftTenCount <= 0) {
                G_Prompt.showTip(Lang.get('recruit_no_count'));
                return;
            }
        }
        var needValue = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.RECRUIT_GOLD_COST10).content);
        var success = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needValue);
        if (success) {
            G_UserData.getRecruitData().c2sRecruitGoldTen(this._goldDrawTenType);
        }
    }
    _onEventRecruitInfo(eventName, message) {
        this._refreshGoldCell();
        this._refreshGoldTenCell();
        this._refreshMoneyCell();
        this._refreshBoxState();
    }
    _onEventRecruitNormal(eventName, awards) {
        // var AudioConst = require('AudioConst');
        G_AudioManager.playSoundWithId(AudioConst.SOUND_DRAW_CARD1);

        var resource = cc.resources.get("prefab/drawCard/DrawNormalEffect");
        var node1 = cc.instantiate(resource) as cc.Node;
        let effect = node1.getComponent(DrawNormalEffect);
        effect.initData(awards, DrawNormalEffect.DRAW_TYPE_MONEY);
        effect.open();
        effect.setCloseCB(this.callCloseBack.bind(this,awards));
        this._refreshMoneyCell();
        this._refreshBoxState();
    }
    private callCloseBack(awards){
        let config = G_ConfigLoader.getConfig(ConfigNameConst.HERO);
        for(let j = 0;j<awards.length;j++)
        {
            let color = config.get(awards[j].value)["color"];
            if(MilitaryMasterPlanHelper.isOpen(MilitaryMasterPlanHelper.Type_HeroZhaoMu,color))
            {
                G_SceneManager.showDialog("prefab/militaryMasterPlan/MilitaryMasterPlanView",function(pop:MilitaryMasterPlanView){
                    pop.setInitData(MilitaryMasterPlanHelper.Type_HeroZhaoMu);
                    pop.openWithAction();
                });
                break;
            }
        }
    }

    _onEventRecruitGold(eventName, awards) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_DRAW_CARD1);

        var resource = cc.resources.get("prefab/drawCard/DrawOneEffect");
        var node1 = cc.instantiate(resource) as cc.Node;
        let effect = node1.getComponent(DrawOneEffect);
        effect.initData(awards, DrawNormalEffect.DRAW_TYPE_GOLD);
        effect.open();
        effect.setCloseCB(this.callCloseBack.bind(this,awards));
        this._refreshGoldCell();
        this._refreshGoldTenCell();
        this._refreshBoxState();
    }
    _onEventRecruitGoldTen(eventName, awards) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_DRAW_CARD10);
        var resource = cc.resources.get("prefab/drawCard/DrawTenEffect");
        var node1 = cc.instantiate(resource) as cc.Node;
        let effect = node1.getComponent(DrawTenEffect);
        effect.initData(awards, DrawNormalEffect.DRAW_TYPE_GOLD);
        effect.open();
        effect.setCloseCB(this.callCloseBack.bind(this,awards));

        this._refreshGoldCell();
        this._refreshGoldTenCell();
        this._refreshBoxState();
    }
    boxTouch(sender) {
        for (var i = 1; i <= 3; i++) {
            var box = this['_box' + i];
            if (box == sender) {
                var boxIndex = i;
                var state = sender.getState();
                this.openBox(boxIndex, state);
                break;
            }
        }
    }
    openBox(index, state) {
        if (state == DrawCardPointBox.STATE_EMPTY) {
            G_Prompt.showTip(Lang.get('recruit_already_get_hero'));
            return;
        }
        var boxId = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst['RECRUIT_POINT_BOX_' + index]).content);
        this._selectedBoxIndex = index;
        var itemList = UIPopupHelper.getBoxItemList(boxId)[0];
        PopupSelectRewardTab.getIns(PopupSelectRewardTab, (popupSelectRewardTab: PopupSelectRewardTab) => {
            popupSelectRewardTab.ctor(Lang.get('recruit_point_box_title'), handler(this, this._getBoxReward));
            popupSelectRewardTab.updateUI(itemList);
            popupSelectRewardTab.openWithAction();
            if (state == DrawCardPointBox.STATE_NORMAL) {
                popupSelectRewardTab.setBtnEnabled(false);
            }
        })
    }
    _getBoxReward(data) {
        var bagFull = UserCheck.isPackFull(TypeConvertHelper.TYPE_HERO)[0];
        if (bagFull) {
            return;
        }
        G_UserData.getRecruitData().c2sRecruitPointGet(this._selectedBoxIndex, data.boxId, data.index);
    }
    _onEventRecruitPointGet(eventName, awards) {
        if (awards && awards.length > 0) {
            PopupGetRewards.showRewards(awards, null);
        }
        this._refreshBoxState();
    }
    onBookClick() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HAND_BOOK);
    }
    onInfoClick() {
        var data: Array<string> = [];
        data.push("prefab/drawCard/DrawCardScoreIntroLayer");
        cc.resources.load(data, cc.Prefab, handler(this, this.onScoreIntroLoadComplete))
    }

    private onScoreIntroLoadComplete() {
        var resource = cc.resources.get("prefab/drawCard/DrawCardScoreIntroLayer");
        var node1 = cc.instantiate(resource) as cc.Node;
        let cell = node1.getComponent(DrawCardScoreIntroLayer);
        cell.setNotCreateShade(true);
        cell.openWithAction();
    }
}