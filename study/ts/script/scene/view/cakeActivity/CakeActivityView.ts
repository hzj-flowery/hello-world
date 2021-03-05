const { ccclass, property } = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { CakeActivityConst } from '../../../const/CakeActivityConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import EffectHelper from '../../../effect/EffectHelper';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ServerTime, G_SignalManager, G_UserData, G_SceneManager } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonHelp from '../../../ui/component/CommonHelp';
import CommonMainMenu from '../../../ui/component/CommonMainMenu';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { CakeActivityDataHelper } from '../../../utils/data/CakeActivityDataHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { handler } from '../../../utils/handler';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import CakeActivityInfoList from './CakeActivityInfoList';
import CakeAwardBox from './CakeAwardBox';
import CakeGuildTab from './CakeGuildTab';
import CakeMaterialNode from './CakeMaterialNode';
import CakeNode from './CakeNode';
import CakeRankNode from './CakeRankNode';
import PopupCakeAwardPreview from './PopupCakeAwardPreview';
import PopupCakeDailyAward from './PopupCakeDailyAward';
import PopupCakeGet from './PopupCakeGet';
import PopupCakeLevelAward from './PopupCakeLevelAward';
import { Path } from '../../../utils/Path';
import PopupGachaAwardsRank from '../gachaGoldHero/PopupGachaAwardsRank';










@ccclass
export default class CakeActivityView extends ViewBase {

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: CakeNode,
        visible: true
    })
    _nodeCake: CakeNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCakeName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCakeLevel: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarExp: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textExpPercent2: cc.Label = null;

    @property({
        type: CakeAwardBox,
        visible: true
    })
    _nodeAward: CakeAwardBox = null;

    @property({
        type: CakeGuildTab,
        visible: true
    })
    _nodeCakeTab1: CakeGuildTab = null;

    @property({
        type: CakeGuildTab,
        visible: true
    })
    _nodeCakeTab2: CakeGuildTab = null;

    @property({
        type: CakeGuildTab,
        visible: true
    })
    _nodeCakeTab3: CakeGuildTab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAwardPrompt: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDownTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCountDown: cc.Label = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonShop: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonGetMaterial: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonAwardPreview: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _buttonDaily: CommonMainMenu = null;

    @property({
        type: CakeMaterialNode,
        visible: true
    })
    _nodeMaterial1: CakeMaterialNode = null;

    @property({
        type: CakeMaterialNode,
        visible: true
    })
    _nodeMaterial2: CakeMaterialNode = null;

    @property({
        type: CakeMaterialNode,
        visible: true
    })
    _nodeMaterial3: CakeMaterialNode = null;

    @property({
        type: CakeActivityInfoList,
        visible: true
    })
    _nodeInfoList: CakeActivityInfoList = null;

    @property({
        type: CakeRankNode,
        visible: true
    })
    _nodeRank: CakeRankNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _nodeHelp: CommonHelp = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    _targetTime: number;
    _actStage: number;
    _lastActStage: number;
    _curCakeConfigInfo: any;
    _curCakeData: any;
    _cakeDataList: any[];
    _curCakeIndex: number;
    _materialFakeCount: any[];
    _isTouchingMaterical: boolean;
    _signalEnterSuccess: any;
    _signalAddCakeExp: any;
    _signalUpdateCakeInfo: any;
    _signalUpdateRankCakeAndNotice: any;
    _signalGetLevelUpReward: any;
    _signalUpdateLevelUpReward: any;
    _signalCakeActivityUpdateStatus: any;
    _signalGetRechargeReward: any;
    _signalRechargeReward:any;
    _signalGetTaskReward: any;
    _signalRedPointClick: any;
    _signalLoginSuccess: any;
    _signalGetDailyReward: any;


    public static waitEnterMsg(callBack) {
        function onMsgCallBack() {

            var imgs: Array<ResourceData> = [
                {
                    path: "ui3/anniversary/img_special_02",
                    type: cc.SpriteFrame
                },
                {
                    path: "ui3/anniversary/img_special_01",
                    type: cc.SpriteFrame
                },
                {
                    path: "prefab/cakeActivity/CakeMaterialNode",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeNode",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeActivityInfoList",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeRankNode",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeAwardBox",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeGuildTab",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeLevelAwardCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/PopupGachaAwardsRank",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeDailyAwardCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeGetEggCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeGetCreamCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeRankGuildCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeRankPlayerCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivityShop/CakeActivityShopCell",
                    type: cc.Prefab
                },
                {
                    path: "prefab/cakeActivity/CakeAwardPreviewCell",
                    type: cc.Prefab
                },
            ];

            ResourceLoader.loadResArrayWithType(imgs, null, () => {
                callBack();
            });

        }
        var msgReg = G_SignalManager.addOnce(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, onMsgCallBack);
        G_UserData.getCakeActivity().c2sEnterCakeActivity();
        return msgReg;
    }
    onCreate() {
        this._initData();
    }
    _initData() {
        this._targetTime = 0;
        this._actStage = CakeActivityConst.ACT_STAGE_0;
        this._lastActStage = CakeActivityConst.ACT_STAGE_0;
        this._curCakeConfigInfo = null;
        this._curCakeData = null;
        this._cakeDataList = [];
        this._curCakeIndex = 0;
        this._materialFakeCount = [];
        this._isTouchingMaterical = false;
        this._commonChat.getPanelDanmu().active = false;
    }
    _initView() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_CAKE_ACTIVITY);
        var name1 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_1);
        var name2 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_2);
        var name3 = CakeActivityDataHelper.getMaterialName(CakeActivityConst.MATERIAL_TYPE_3);
        this._nodeHelp.updateUI(FunctionConst.FUNC_CAKE_ACTIVITY, {name1: name1,name2: name2,name3: name3});
        this._buttonShop.updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP);
        this._buttonDaily.updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_DAILY_AWARD);
        var type = G_UserData.getCakeActivity().getActType();
        var info = CakeActivityDataHelper.getCakeResouceConfig(type);
        var customIcon = Path.getCommonIcon('main', info.gain_icon);
        var customIconTxt = info.gain_icon_word;
        this._buttonGetMaterial.updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL, customIcon, customIconTxt);
        this._buttonAwardPreview.updateUI(FunctionConst.FUNC_CAKE_ACTIVITY_AWARD_PREVIEW);
        for (var i = 1; i <= 3; i++) {
            (this['_nodeMaterial' + i] as CakeMaterialNode).initData(i, handler(this, this._onClickMaterial), handler(this, this._onClickMaterialStep))
            this['_material' + i] = (this['_nodeMaterial' + i] as CakeMaterialNode);
            this['_material' + i].setStartCallback(handler(this, this._onStartCallback));
            this['_material' + i].setStopCallback(handler(this, this._onStopCallback));
        }
        this._cake = this._nodeCake;
        this._nodeInfoList.ctor(handler(this, this._doAddCakeExp));
        this._infoList = this._nodeInfoList;
        this._rank = this._nodeRank;
        this._nodeAward.ctor(this._nodeAward.node,handler(this, this._onClickAwardBox));
        this._awardBox = this._nodeAward;
        for (var i = 1; i <= 3; i++) {
            this['_nodeCakeTab' + i].ctor(i, handler(this, this._onClickCakeTab));
            this['_cakeTab' + i] = this['_nodeCakeTab' + i];
        }
    }

    private _awardBox:CakeAwardBox;
    private _rank:CakeRankNode;
    private _cake:CakeNode;
    private _infoList:CakeActivityInfoList;

    onEnter() {
        this._initView();
        this._signalEnterSuccess = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_ENTER_SUCCESS, handler(this, this._onEventEnterSuccess));
        this._signalAddCakeExp = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_ADD_CAKE_EXP, handler(this, this._onEventAddCakeExp));
        this._signalUpdateCakeInfo = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_CAKE_INFO, handler(this, this._onEventUpdateCakeInfo));
        this._signalUpdateRankCakeAndNotice = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_RANK_CAKE_AND_NOTICE, handler(this, this._onEventUpdateRankCakeAndNotice));
        this._signalGetLevelUpReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_LEVEL_UP_REWARD, handler(this, this._onEventGetLevelUpReward));
        this._signalUpdateLevelUpReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_LEVEL_UP_REWARD, handler(this, this._onEventUpdateLevelUpReward));
        this._signalCakeActivityUpdateStatus = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_UPDATE_ACTIVITY_STATUS, handler(this, this._onEventCakeActivityUpdateStatus));
        this._signalGetRechargeReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_RECHARGE_REWARD, handler(this, this._onEventGetRechargeReward));
        this._signalRechargeReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_RECHARGE_REWARD, handler(this, this._onEventRechargeReward));
        this._signalGetTaskReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_TASK_REWARD, handler(this, this._onEventGetTaskReward));
        this._signalRedPointClick = G_SignalManager.add(SignalConst.EVENT_RED_POINT_CLICK, handler(this, this._onEventRedPointClick));
        this._signalLoginSuccess = G_SignalManager.add(SignalConst.EVENT_LOGIN_SUCCESS, handler(this, this._onEventLoginSuccess));
        this._signalGetDailyReward = G_SignalManager.add(SignalConst.EVENT_CAKE_ACTIVITY_GET_DAILY_REWARD, handler(this, this._onEventGetDailyReward));
        this._updateData();
        this._updateView();
        this._nodeInfoList.initInfoList();
        this._updateCakeTab();
        this._startCountDown();
        G_AudioManager.playMusicWithId(AudioConst.SOUND_BGM_CAKE_MAIN);
        if (this._lastActStage == CakeActivityConst.ACT_STAGE_2 && this._actStage == CakeActivityConst.ACT_STAGE_3) {
            G_UserData.getCakeActivity().c2sEnterCakeActivity();
        }
    }
    onExit() {
        this._stopCountDown();
        this._signalEnterSuccess.remove();
        this._signalEnterSuccess = null;
        this._signalAddCakeExp.remove();
        this._signalAddCakeExp = null;
        this._signalUpdateCakeInfo.remove();
        this._signalUpdateCakeInfo = null;
        this._signalUpdateRankCakeAndNotice.remove();
        this._signalUpdateRankCakeAndNotice = null;
        this._signalGetLevelUpReward.remove();
        this._signalGetLevelUpReward = null;
        this._signalUpdateLevelUpReward.remove();
        this._signalUpdateLevelUpReward = null;
        this._signalCakeActivityUpdateStatus.remove();
        this._signalCakeActivityUpdateStatus = null;
        this._signalGetRechargeReward.remove();
        this._signalGetRechargeReward = null;
        this._signalGetTaskReward.remove();
        this._signalRechargeReward.remove();
        this._signalRechargeReward = null;
        this._signalGetTaskReward = null;
        this._signalRedPointClick.remove();
        this._signalRedPointClick = null;
        this._signalLoginSuccess.remove();
        this._signalLoginSuccess = null;
        this._signalGetDailyReward.remove();
        this._signalGetDailyReward = null;
        this._nodeInfoList.onExit();
    }
    _startCountDown() {
        this._stopCountDown();
        this.schedule(this._updateCountDown, 1);
        this._updateCountDown();
    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }
    _updateCountDown() {
        var countDown = this._targetTime - G_ServerTime.getTime();
        if (countDown >= 0) {
            var timeString = G_ServerTime.getLeftDHMSFormatEx(this._targetTime);
            this._textCountDown.string = (timeString);
        } else {
            this._textCountDown.string = ('');
            if (this._actStage == CakeActivityConst.ACT_STAGE_2) {
                G_UserData.getCakeActivity().c2sEnterCakeActivity();
            }
            this._updateActivityStage();
        }
    }
    _updateCakeData() {
        this._cakeDataList = G_UserData.getCakeActivity().getCakeDataList();
        this._curCakeData = this._cakeDataList[this._curCakeIndex];
        this._curCakeConfigInfo = CakeActivityDataHelper.getCurCakeLevelConfig(this._curCakeData.getCake_level());
    }
    _updateView() {
        var ret = this._updateActivityStage();
        if (ret == false) {
            return;
        }
        this._updateCakeView();
        this._initCakeTab();
        this._updateAwardBox();
        this._updateMaterial();
        this._updateRank();
        this._updateShopRp();
        this._updateMaterialBtnRp();
        this.updateDailyBtnRp();
    }

    _updateData() {
        var index = G_UserData.getCakeActivity().getSelectCakeIndex();
        this._curCakeIndex = index;
        this._updateCakeData();
    }
    _updateActivityStage() {
        var [actStage, startTime, endTime] = CakeActivityDataHelper.getActStage();
        if (actStage == CakeActivityConst.ACT_STAGE_0) {
            G_Prompt.showTip(Lang.get('cake_activity_countdown_finish'));
            G_SceneManager.popScene();
            return false;
        }
        this._lastActStage = this._actStage;
        this._actStage = actStage;
        var helpPosX = -320; //6
        var info = CakeActivityDataHelper.getCurCakeResouceConfig();
        var sceneId1 = info.cake_map1;
        var sceneId2 = info.cake_map2;
        if (actStage == CakeActivityConst.ACT_STAGE_1) {
            this.updateSceneId(sceneId1);
            this._topbarBase.setImageTitle('txt_sys_zhounianqing');
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_title_1'));
            this._textCountDownTitle.node.x = (200);
            this._textCountDown.node.x = (205);
            this._targetTime = endTime;
            helpPosX = -360;
        } else if (actStage == CakeActivityConst.ACT_STAGE_2) {
            this.updateSceneId(sceneId1);
            this._topbarBase.setImageTitle('txt_sys_zhounianqing');
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_title_2'));
            this._textCountDownTitle.node.x = (213);
            this._textCountDown.node.x = (218);
            this._targetTime = endTime;
            helpPosX = -360;
        } else if (actStage == CakeActivityConst.ACT_STAGE_3) {
            this.updateSceneId(sceneId2);
            this._topbarBase.setImageTitle('txt_sys_kuafuzhounianqing');
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_title_3'));
            this._textCountDownTitle.node.x = (200);
            this._textCountDown.node.x = (205);
            this._targetTime = endTime;
            helpPosX = -320;
        } else if (actStage == CakeActivityConst.ACT_STAGE_4) {
            this.updateSceneId(sceneId2);
            this._topbarBase.setImageTitle('txt_sys_kuafuzhounianqing');
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_title_4'));
            this._textCountDownTitle.node.x = (200);
            this._textCountDown.node.x = (205);
            this._targetTime = endTime;
            helpPosX = -320;
        } else {
            this._textCountDownTitle.string = (Lang.get('cake_activity_countdown_finish'));
            this._textCountDownTitle.node.x = (223);
        }
        this._nodeHelp.node.setPosition(helpPosX, 295);
        this._rank.updateStage();
    }
    _updateCakeView() {
        this._cake.updateUI(this._curCakeConfigInfo);
        var guildName = this._curCakeData.getGuild_name();
        var foodName = CakeActivityDataHelper.getFoodName();
        this._textCakeName.string = (Lang.get('cake_activity_cake_name', {
            name: guildName,
            foodName: foodName
        }));
        this._textCakeLevel.string = (Lang.get('cake_activity_cake_level', { level: this._curCakeData.getCake_level() }));
        var totalExp = this._curCakeConfigInfo.exp;
        if (totalExp == 0) {
            var info = CakeActivityDataHelper.getCurCakeLevelConfig(this._curCakeData.getCake_level() - 1);
            totalExp = info.exp;
        }
        var curExp = this._curCakeData.getCake_exp();
        var percent = curExp / totalExp;
        this._loadingBarExp.progress = (percent);
        this._textExpPercent1.string = (curExp);
        this._textExpPercent2.string = (totalExp);
    }
    _fakeUpdateCakeView(itemId) {
        var type = CakeActivityDataHelper.getMaterialTypeWithId(itemId);
        this['_material' + type].setCount(this._materialFakeCount[itemId]);
    }
    _fakePushBullet(itemId, realCostCount) {
        var fakeNoticeDatas = [];
        var tempData: any = {};
        tempData.notice_id = CakeActivityConst.NOTICE_TYPE_COMMON;
        tempData.contents = [];
        if (this._actStage == CakeActivityConst.ACT_STAGE_3) {
            tempData.contents.push({
                key: 'sname',
                value: G_UserData.getBase().getReal_server_name()
            });
        }
        tempData.contents.push({
            key: 'uname',
            value: G_UserData.getBase().getName()
        });
        tempData.contents.push({
            key: 'itemid1',
            value: (itemId).toString()
        });
        tempData.contents.push({
            key: 'itemnum',
            value: (realCostCount).toString()
        });
        var fakeNoticeData = G_UserData.getCakeActivity().createFakeNoticeData(tempData);
        fakeNoticeDatas.push(fakeNoticeData);
        this._nodeInfoList.pushBullet(fakeNoticeDatas);
    }
    _updateAwardBox() {
        var rewards = G_UserData.getCakeActivity().getUpRewards();
        var notReceieveId = 0;
        for (var i in rewards) {
            var reward = rewards[i];
            if (reward.isReceived == false) {
                notReceieveId = reward.rewardId;
                break;
            }
        }
        this._nodeAward.node.active = (true);
        if (notReceieveId > 0) {
            this._nodeAward.updateUI(CakeActivityConst.AWARD_STATE_2, notReceieveId);
        } else {
            var cakeLevel = this._curCakeData.getCake_level();
            if (cakeLevel < CakeActivityConst.MAX_LEVEL) {
                var info = CakeActivityDataHelper.getCurCakeLevelConfig(cakeLevel + 1);
                var awardId = info.lv;
                this._nodeAward.updateUI(CakeActivityConst.AWARD_STATE_1, awardId);
            } else {
                this._nodeAward.node.active = (false);
            }
        }
    }
    _initCakeTab() {
        var TAB_POS = {
            [1]: [cc.v2(-147, 220)],
            [2]: [
                cc.v2(-212, 220),
                cc.v2(-82, 220)
            ],
            [3]: [
                cc.v2(-277, 220),
                cc.v2(-147, 220),
                cc.v2(-18, 220)
            ]
        };
        var showCount = 0;
        if ((this._actStage == CakeActivityConst.ACT_STAGE_3 || this._actStage == CakeActivityConst.ACT_STAGE_4) && G_UserData.getCakeActivity().getMyGuildCakeIndex() == 0) {
            for (var i = 0; i < this._cakeDataList.length; i++) {
                var data = this._cakeDataList[i];
                this['_cakeTab' + (i + 1)].updateUI(data);
                showCount = showCount + 1;
            }
        }
        for (var i = 1; i <= 3; i++) {
            if (i <= showCount) {
                this['_nodeCakeTab' + i].node.active = (true);
                var pos = TAB_POS[showCount][i - 1];
                if (pos) {
                    this['_nodeCakeTab' + i].node.setPosition(pos);
                }
            } else {
                this['_nodeCakeTab' + i].node.active = (false);
            }
        }
    }
    _updateMaterial() {
        for (var i = 1; i <= 3; i++) {
            var count = this['_material' + i].updateCount();
            var [itemId] = CakeActivityDataHelper.getMaterialItemId(i);
            this._materialFakeCount[itemId] = count;
        }
    }
    _updateRank() {
        this._nodeRank.updateRank();
    }
    _updateMyPoint() {
        this._nodeRank.updateMyScore();
    }
    _updateShopRp() {
        var show = RedPointHelper.isModuleReach(FunctionConst.FUNC_CAKE_ACTIVITY_SHOP);
        this._buttonShop.showRedPoint(show);
    }
    onClickShop() {
        var functionId = this._buttonShop.getFuncId();
        WayFuncDataHelper.gotoModuleByFuncId(functionId);
    }
    onClickGet() {
        G_SceneManager.openPopup("prefab/cakeActivity/PopupCakeGet")
    }
    onClickAwardPreview() {
        if (this._actStage == CakeActivityConst.ACT_STAGE_0) {
            G_Prompt.showTip(Lang.get('cake_activity_act_end_tip'));
            return;
        }
        var index = null;
        if (this._actStage == CakeActivityConst.ACT_STAGE_3) {
            index = 2;
        }
        var popup = Util.getNode("prefab/cakeActivity/PopupGachaAwardsRank", PopupCakeAwardPreview) as PopupCakeAwardPreview;
        popup.ctor(index);
        popup.openWithAction();
    }
    onClickDaily() {
        G_SceneManager.openPopup("prefab/cakeActivity/PopupCakeDailyAward",(popup:PopupCakeDailyAward)=>{
            popup.initData(this);
            popup.openWithAction();
        });
    }
    _onClickMaterial(item) {
    }
    _doAddCakeExp(item) {
        var addGuildId = this._curCakeData.getGuild_id();
        var itemId = item.id;
        var itemNum = item.num;
        G_UserData.getCakeActivity().c2sAddGuildCakeExp(addGuildId, itemId, itemNum);
        this._setClickEnabled(false);
    }
    _onStartCallback(itemId, count) {
        this._isTouchingMaterical = true;
    }
    _onStopCallback() {
        this._isTouchingMaterical = false;
    }
    _onClickMaterialStep(itemId, itemValue, costCountEveryTime) {
        if (CakeActivityDataHelper.isCanGiveMaterial(true) == false) {
            return false;
        }
        if (this._materialFakeCount[itemId] <= 0) {
            return false;
        }
        var realCostCount = Math.min(this._materialFakeCount[itemId], costCountEveryTime);
        this._materialFakeCount[itemId] = this._materialFakeCount[itemId] - realCostCount;
        this._fakeUpdateCakeView(itemId);
        this._fakePlayEffect(itemId);
        this._fakePushBullet(itemId, realCostCount);
        this._playMaterialSound(itemId);
        return [
            true,
            realCostCount
        ];
    }
    _playMaterialSound(itemId) {
        var soundId = CakeActivityDataHelper.getMaterialSoundIdWithId(itemId);
        if (soundId > 0) {
            G_AudioManager.playSoundWithId(soundId);
        }
    }
    _onClickAwardBox(state, awardId) {
        if ((this._actStage == CakeActivityConst.ACT_STAGE_3 || this._actStage == CakeActivityConst.ACT_STAGE_4) && G_UserData.getCakeActivity().getMyGuildCakeIndex() == 0) {
            G_Prompt.showTip(Lang.get('cake_activity_can_not_receive_award_tip'));
            return;
        }
        var curLevel = this._curCakeData.getCake_level();
        G_SceneManager.openPopup("prefab/cakeActivity/PopupCakeLevelAward",(cell:PopupCakeLevelAward)=>{
            cell.initData(curLevel);
        cell.openWithAction();
        })
    }
    _onClickCakeTab(index) {
        if (this._curCakeIndex == (index - 1)) {
            return;
        }
        this._curCakeIndex = index - 1;
        this._updateCakeTab();
    }
    _updateCakeTab() {
        for (var i = 1; i <= 3; i++) {
            this['_cakeTab' + i].setSelected(this._curCakeIndex == (i - 1));
        }
        this._updateCakeData();
        this._updateCakeView();
        this._updateAwardBox();
        if (this._actStage == CakeActivityConst.ACT_STAGE_3) {
            G_UserData.getCakeActivity().setSelectCakeIndex(this._curCakeIndex);
        }
    }
    _onEventEnterSuccess() {
        this._updateData();
        this._updateView();
        this._nodeInfoList.initInfoList();
        this._updateCakeTab();
    }
    _onEventAddCakeExp(eventName, itemId, itemNum, awards, noticeDatas, addEggLimit) {
        this._updateMaterial();
        this._updateCakeData();
        this._updateCakeView();
        this._updateMyPoint();
        if (addEggLimit) {
            var materialName = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId).name;
            G_Prompt.showTip(Lang.get('cake_activity_add_egg_limit_tip', { materialName: materialName }));
        }
        this._setClickEnabled(true);
        G_Prompt.showAwardsExploreMode(this._nodeAwardPrompt, awards);
    }
    _onEventUpdateCakeInfo(eventName, guildIds) {
        var curGuildId = this._curCakeData.getGuild_id();
        var isIn = false;
        for (var i in guildIds) {
            var guildId = guildIds[i];
            if (curGuildId == guildId) {
                isIn = true;
            }
        }
        if (isIn) {
            this._updateCakeData();
            this._updateCakeView();
            if (this._curCakeData.isLevelUp()) {
                this._playLevelUpEffect();
                G_AudioManager.playSoundWithId(AudioConst.SOUND_CAKE_LVUP);
            }
        }
    }
    _onEventUpdateRankCakeAndNotice(eventName, noticeDatas) {
        this._updateRank();
        this._nodeInfoList.pushBullet(noticeDatas);
    }
    _onEventGetLevelUpReward(eventName, awards) {
        this._updateMaterial();
        this._updateAwardBox();
    }
    _onEventGetDailyReward(eventName) {
        this._updateMaterial();
    }
    _onEventUpdateLevelUpReward(eventName) {
        this._updateAwardBox();
    }
    _onEventCakeActivityUpdateStatus() {
        this._updateActivityStage();
    }
    _onEventRechargeReward() {
        this._updateMaterial();
    }
    _onEventGetRechargeReward() {
        this._updateMaterial();
    }
    _onEventGetTaskReward(eventName, taskId, awards) {
        this._updateMaterial();
        this._updateMaterialBtnRp();
    }
    _onEventRedPointClick(eventName, funcId) {
        if (funcId == FunctionConst.FUNC_CAKE_ACTIVITY_GET_MATERIAL) {
            this._updateMaterialBtnRp();
        }
    }
    _onEventLoginSuccess() {
        G_UserData.getCakeActivity().c2sEnterCakeActivity();
    }
    _fakePlayEffect(itemId) {
        this._playSingleEffect(itemId);
    }
    _playSingleEffect(itemId) {
        var particleNames = {
            [2]: 'tujiegreen',
            [3]: 'tujieblue',
            [4]: 'tujiepurple',
            [5]: 'tujieorange'
        };
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
        var color = param.cfg.color;
        var particleName = particleNames[color] || particleNames[2];
        let node1 = new cc.Node();
        var emitter = node1.addComponent(cc.ParticleSystem) as cc.ParticleSystem;
        let file = 'particle/' + (particleName + '.plist');

        EffectHelper.loadEffectRes(file, cc.ParticleAsset, function (res) {
            if (res) {
                emitter.file = res;
                emitter.resetSystem();
            }
        }.bind(this))

        var type = CakeActivityDataHelper.getMaterialTypeWithId(itemId);
        var startPos = UIHelper.convertSpaceFromNodeToNode(this['_nodeMaterial' + type].node, this.node);
        emitter.node.setPosition(startPos);
        this.node.addChild(emitter.node);
        var pointPos1 = cc.v2(startPos.x, startPos.y + 200);
        var endPos = UIHelper.convertSpaceFromNodeToNode(this._nodeCake.node, this.node);
        var pointPos2 = cc.v2((startPos.x + endPos.x) / 2, startPos.y + 100);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        action1.easing = cc.easeSineIn();
        emitter.node.runAction(cc.sequence(action1, cc.callFunc(function () {
            this._playFinishEffect();
            this._setClickEnabled(true);
        }.bind(this)), cc.destroySelf()));
    }
    _playFinishEffect() {
        function effectFunction(effect) {
            return new cc.Node();
        }
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(this.node, 'moving_equipjinglian', effectFunction, eventFunction, true);
        effect.node.setPosition(cc.v2(/* G_ResolutionManager.getDesignWidth() * 0.5 + */ 30, /* G_ResolutionManager.getDesignHeight() * 0.5 +  */50));
    }
    _setClickEnabled(enable) {
        for (var i = 1; i <= 3; i++) {
            this['_cakeTab' + i].setEnabled(enable);
        }
    }
    _playLevelUpEffect() {
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, 'moving_dangao_dangaoshengji', null, eventFunction, true);
    }
    _updateMaterialBtnRp() {
        var show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'getMaterial');
        this._buttonGetMaterial.showRedPoint(show);
    }
    updateDailyBtnRp() {
        var show = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_CAKE_ACTIVITY, 'getDailyAward');
        this._buttonDaily.showRedPoint(show);
    }

}
