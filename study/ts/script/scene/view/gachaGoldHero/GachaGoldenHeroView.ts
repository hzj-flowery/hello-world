const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonChatMiniNode from '../chat/CommonChatMiniNode'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

import CommonHelp from '../../../ui/component/CommonHelp'

import CommonRechargeReward from '../../../ui/component/CommonRechargeReward'
import { G_SceneManager, G_BulletScreenManager, G_UserData, Colors, G_ServerTime, G_EffectGfxMgr, G_AudioManager, G_ResolutionManager, G_SignalManager } from '../../../init';
import { BullectScreenConst } from '../../../const/BullectScreenConst';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { FunctionConst } from '../../../const/FunctionConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import GachaGoldenHeroHelper from './GachaGoldenHeroHelper';
import { AudioConst } from '../../../const/AudioConst';
import { SignalConst } from '../../../const/SignalConst';
import ViewBase from '../../ViewBase';
import GoldHeroAvatar from './GoldHeroAvatar';
import PopupBase from '../../../ui/PopupBase';
import PopupJoyGachaView from './PopupJoyGachaView';
import PopupJoyAwards from './PopupJoyAwards';
import PopupGachaAwardsRank from './PopupGachaAwardsRank';
import CommonMiniChat from '../../../ui/component/CommonMiniChat';

@ccclass
export default class GachaGoldenHeroView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectMain: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_2_1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_2_2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_3_1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_3_2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_3_3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_4_1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_4_2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_4_3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_4_4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectFront: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRank: cc.Node = null;

    @property({
        type: CommonRechargeReward,
        visible: true
    })
    _commonRecharge: CommonRechargeReward = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _activityCountDown: cc.Node = null;

    @property({
        type: CommonHelp,
        visible: true
    })
    _commonHelp: CommonHelp = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelJoy: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIconTxt: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textJoyTime: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonJoyIcon: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouchJoy: cc.Node = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _gachaAwards: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _gachaShop: CommonMainMenu = null;

    @property({
        type: CommonMiniChat,
        visible: true
    })
    _commonChat: CommonMiniChat = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _gachaShowAward: CommonMainMenu = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectLight: cc.Node = null;

    @property(cc.Prefab)
    goldHeroAvatar:cc.Prefab = null;

    @property(cc.Prefab)
    pointRankView:cc.Prefab = null;


    _isBulletOpen: boolean;
    _danmuPanel: cc.Node;
    _joyGachaView: any;
    _countDownHandler: any;
    _poolData: any;
    _countDownScheduler: any;
    _countDownNode:cc.RichText;

    private _currentChooseZhenyin:number
    public static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getGachaGoldenHero().c2sGachaEntry();
        var signal = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, onMsgCallBack);
        return signal;
    }
    ctor(ChooseZhenyin) {
        this._isBulletOpen = true;
        //this._panelTouchJoy.on('touchend', this._onButtonClickJoy);
        //UIHelper.addClickEventListenerEx(this._panelTouchJoy, handler(this,this._onButtonClickJoy));
        var btnTouch = this._panelTouchJoy.addComponent(cc.Button);
        UIHelper.addEventListener(this.node, btnTouch, 'GachaGoldenHeroView', '_onButtonClickJoy');
        this._countDownNode = null;
        this._currentChooseZhenyin = ChooseZhenyin||1;
    }
    onCreate() {
        var params = G_SceneManager.getViewArgs('gachaGoldHero');
        this.ctor(params?params[0]:1);
        this.setSceneSize();

        this._panelDesign.setContentSize(this.node.width,this.node.height);
        this._initFuncIcon();
        this._initEffectAvatar();
        this._initEffectFont();
        this._initRankView();
        this._updateJoyDraw(true);
        this._updateJoyCountDown();
        this._initDanmu();
    }
    onEnter() {
        this._topBar.setImageTitle('txt_sys_jianlongzaitian');
        if (this._isBulletOpen) {
            G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE, true);
        }
        G_AudioManager.playMusicWithId(AudioConst.SOUND_GACHA_GOLDEN_HERO);
        if(this._countDownScheduler)
        this.unschedule(this._countDownScheduler)
        this._countDownScheduler = handler(this, this._update);
        this.schedule(this._countDownScheduler, 0.1);
    }
    onExit() {
        this._endSchedule();
        var runningScene = G_SceneManager.getTopScene();
        if (runningScene && runningScene.getName() != 'fight') {
            G_BulletScreenManager.clearBulletLayer();
        }
        if (this._countDownScheduler) {
            this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
    }
    _playLightEffect() {
        this._nodeEffectLight.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectLight, 'effect_baisequanpingbaoguang');
    }
   
    _initEffectAvatar() {
        var groupIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupIdByCountry(this._currentChooseZhenyin) || {};
        var num = groupIds.length;
        var panel:cc.Node = this['_panel_' + num];
        if (num == 0 || panel == null) {
            return;
        }
        panel.active = (true);
        var createAvatar = function (index):cc.Node {
            var groupIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupIdByCountry(this._currentChooseZhenyin) || {};

            var avatar = (cc.instantiate(this.goldHeroAvatar) as cc.Node).getComponent(GoldHeroAvatar);
            avatar.ctor(handler(this, this._touchAvatar));
            avatar.updateUI(groupIds[index-1], null, true);
            avatar.setScale(0.9);
            avatar.setAligement(Math.ceil(index / 2));
            avatar.turnBack(index > 2);
            var type = 2;
            // if (index > 1 && index < 4) {
            //     type = 0;
            // }
            avatar.setNamePositionY(type);
            return avatar.node;
        }.bind(this);
        for (let k=1;k<=groupIds.length;k++) {
            var v = groupIds[k-1];
            var node = this['_node_' + (num + ('_' + k))];
            if (node) {
                var avatar = createAvatar(k);
                node.addChild(avatar);
            }
        }
    }
    _initEffectFont() {

        this._nodeEffectFront.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectFront, 'moving_jinjiangzhaomu_dianjiang_front', null,null, false);
    }

    _updateJoyDraw(isCreateIn?) {
        this._poolData = GachaGoldenHeroHelper.getGachaState();
        var id = G_UserData.getGachaGoldenHero().getDrop_id();
        var data = GachaGoldenHeroHelper.getGoldenHeroDraw(id);
        this._commonJoyIcon.unInitUI();
        this._commonJoyIcon.initUI(data.type, data.value, 1);
        this._commonJoyIcon.setTouchEnabled(false);
        var index = 0;
        if (this._poolData.isOver) {
            index = 1;
        } else {
            index = this._poolData.isLottery && 2 || 1;
        }
        UIHelper.loadTexture(this._imageIconTxt, Path.getGoldHeroTxt(GachaGoldenHeroConst.DRAW_JOY_ICONTXT[index-1]));
        //this._imageIconTxt.ignoreContentAdaptWithSize(true);
        if (isCreateIn) {
            if (G_UserData.getGachaGoldenHero().isAutoPopupJoy() && this._poolData.isLottery) {
                var prizeLists = G_UserData.getGachaGoldenHero().getPrizeLists() || {};
                if (this._joyGachaView == null && GachaGoldenHeroHelper.isLottery(prizeLists)) {
                    this._startCountDown(true);
                }
            }
        } else if (this._poolData.isLottery) {
            var prizeLists = G_UserData.getGachaGoldenHero().getPrizeLists() || {};
            if (this._joyGachaView == null && GachaGoldenHeroHelper.isLottery(prizeLists)) {
                this._startCountDown(false);
            }
        }
    }
    _updateJoyCountDown() {
        if (!this._poolData||(this._poolData && this._poolData.stage <= 0)) {
            this._panelJoy.active = (false);
            return;
        }
        var leftTime = G_ServerTime.getLeftSeconds(this._poolData.countDowm);
        if (leftTime <= 0) {
            if (this._poolData.isLottery) {
                G_UserData.getGachaGoldenHero().setLuck_draw_num(0);
            }
            this._updateJoyDraw();
        }
        var times = G_ServerTime.getLeftDHMSFormatEx(this._poolData.countDowm);
        if (this._poolData.isLottery) {
            if (this._poolData.isOver) {
                times = Lang.get('gacha_goldenhero_joinend', { time: times });
            } else {
                times = Lang.get('gacha_goldenhero_joinstart', { time: times });
            }
        } else {
            if (this._poolData.isCrossDay) {
                times = Lang.get('gacha_goldenhero_joinstart', { time: times });
            } else {
                times = Lang.get('gacha_goldenhero_joinend', { time: times });
            }
        }
        this._textJoyTime.string = ((times));
    }
    _updateActivityEnd() {
        
        var entTime = G_UserData.getGachaGoldenHero().getEnd_time();
        var showTime = G_UserData.getGachaGoldenHero().getShow_time();
        var leftTime = G_ServerTime.getLeftSeconds(entTime);
        var desc = leftTime > 0 && Lang.get('gacha_goldenhero_activityendtime', { time: G_ServerTime.getLeftDHMSFormatEx(entTime) }) || Lang.get('gacha_goldenhero_activityshowTime', { time: G_ServerTime.getLeftDHMSFormatEx(showTime) });
        var fontSize = leftTime > 0 && 20 || 18;

        if(this._countDownNode){
            RichTextExtend.setRichTextByFormatString(this._countDownNode, desc, {
                defaultColor: Colors.CLASS_WHITE,
                defaultSize: fontSize,
                other: { 1: { color: Colors.GOLDENHERO_ACTIVITY_END_NORMAL } }
            });
        }else{
            this._activityCountDown.removeAllChildren();
            var richText = RichTextExtend.createRichTextByFormatString(desc, {
                defaultColor: Colors.CLASS_WHITE,
                defaultSize: fontSize,
                other: { 1: { color: Colors.GOLDENHERO_ACTIVITY_END_NORMAL } }
            });
            richText.node.setAnchorPoint(cc.v2(0.5, 0.5));
            this._activityCountDown.addChild(richText.node);
            this._countDownNode = richText;
        }
        
    }
    _closeJooy() {
        this._joyGachaView = null;
    }
    _startCountDown(isCreateIn) {
        this._endSchedule();
        var callBack = handler(this, this._closeJooy);
        var parent = this;
        this._countDownHandler = function () {
            PopupBase.loadCommonPrefab('PopupJoyGachaView', (popup:PopupJoyGachaView)=>{
                popup.ctor(callBack);
                parent._joyGachaView = popup;
                parent._joyGachaView.openWithAction();
            });
            G_UserData.getGachaGoldenHero().setAutoPopupJoy(false);
        }.bind(this);
        this.scheduleOnce(this._countDownHandler, 1.5);
    }
    _endSchedule() {
        if (this._countDownHandler) {
            this.unschedule(this._countDownHandler);
            this._countDownHandler = null;
        }
    }
    _initFuncIcon() {
        
        this._topBar.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
        this._topBar.setCallBackOnBack(handler(this, this._onReturnBack));
        this._commonRecharge.updateUI(6, 166, 30, 1);
        this._commonHelp.updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO);

        this['_gachaAwards'].updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_POINT);
        UIHelper.addClickEventListenerEx(this['_gachaAwards'].node, handler(this, this._onButtonClickAwards));
        this['_gachaShop'].updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_SHOP);
        UIHelper.addClickEventListenerEx(this['_gachaShop'].node, handler(this, this._onButtonClickShop));
        this['_gachaShowAward'].updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_DAILY);
        UIHelper.addClickEventListenerEx(this['_gachaShowAward'].node, handler(this, this._onButtonClickShowAwards));
    }
    _onReturnBack() {
        G_UserData.getGachaGoldenHero().c2sGachaExit();
        G_SceneManager.popScene();
    }
    _onButtonClickJoy() {
        if (this._joyGachaView == null) {
            var joyGachaView = this._joyGachaView;
            var callBack = handler(this, this._closeJooy);
            PopupBase.loadCommonPrefab('PopupJoyGachaView', (popup:PopupJoyGachaView)=>{
                popup.ctor(callBack);
                joyGachaView = popup;
                popup.openWithAction();
            });
        }
    }
    _onButtonClickShowAwards() {
        //G_SceneManager.showDialog('app.scene.view.gachaGoldHero.PopupJoyAwards');
        PopupBase.loadCommonPrefab('PopupJoyAwards', (popup:PopupJoyAwards)=>{
            popup.openWithAction();
        });
    }
    _onButtonClickAwards() {
        //G_SceneManager.showDialog('app.scene.view.gachaGoldHero.PopupGachaAwardsRank');
        G_SceneManager.showDialog('prefab/'+PopupGachaAwardsRank.path);
    }
    _onButtonClickShop() {
        G_SceneManager.showScene('gachaGoldShop');
    }
    _initRankView() {
        var node = cc.instantiate(this.pointRankView);
        this._nodeRank.addChild(node);
    }
    _initDanmu() {
        this._danmuPanel = this._commonChat.getPanelDanmu();
        UIHelper.addClickEventListenerEx(this._danmuPanel, handler(this, this._onBtnDanmu));
        this._danmuPanel.active = (true);
        G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE, true);
        this._updateBulletScreenBtn(BullectScreenConst.GACHA_GOLDENHERO_TYPE);
    }
    _onBtnDanmu() {
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE);
        G_UserData.getBulletScreen().setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE, !bulletOpen);
        this._updateBulletScreenBtn(BullectScreenConst.GACHA_GOLDENHERO_TYPE);
    }
    _updateBulletScreenBtn(bulletType) {
        this._danmuPanel.getChildByName('Node_1').active = (false);
        this._danmuPanel.getChildByName('Node_2').active = (false);
        var bulletOpen = G_UserData.getBulletScreen().isBulletScreenOpen(bulletType);
        if (bulletOpen == true) {
            this._danmuPanel.getChildByName('Node_1').active = (true);
            G_BulletScreenManager.showBulletLayer();
            this._isBulletOpen = true;
        } else {
            this._danmuPanel.getChildByName('Node_2').active = (true);
            G_BulletScreenManager.hideBulletLayer();
            this._isBulletOpen = false;
        }
    }
    _touchAvatar(heroId) {
        G_SceneManager.showScene('gachaDrawGoldHero', heroId,this._currentChooseZhenyin);
    }
    _update(dt) {
        this._updateActivityEnd();
        this._updateJoyCountDown();
    }

}