import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { G_EffectGfxMgr, G_Prompt, G_SceneManager, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import CommonStoryAvatar2 from "../../../ui/component/CommonStoryAvatar2";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { CrossWorldBossHelperT } from "./CrossWorldBossHelperT";


const {ccclass, property} = cc._decorator;

@ccclass

export default class PopupCrossWorldBossSign extends PopupBase{
    name: 'PopupCrossWorldBossSign';
    @property({
        type: cc.Label,
        visible: true
    })
    _labelCountdown: cc.Label = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _imgHelpBtn: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _goBtn: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _avatarNameImg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _desImg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgBg: cc.Sprite = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _campInfo: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nextTips: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePoZhao: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMy: cc.Sprite = null;
    
    
    
    
    @property({
        type: cc.Node,
        visible: true
    })
    _btnEffectNode: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFire: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _avatarNode: cc.Node = null;
    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _commonListViewItem: CommonListViewLineItem = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CommonStoryAvatar2: cc.Prefab = null;
    
    

     private _refreshHandler:Function;
     private _playerAvatars:any;
     private _signalEnterBossInfo:any;

    onCreate() {
        this.setSceneSize();
        this._labelCountdown.node.active = (false);
        let listen1 = new cc.Component.EventHandler();
        listen1.component = "PopupCrossWorldBossSign";
        listen1.target = this.node;
        listen1.handler = "_closeCallback";
        let listen2 = new cc.Component.EventHandler();
        listen2.component = "PopupCrossWorldBossSign";
        listen2.target = this.node;
        listen2.handler = "_onHelpBtn";
        this._btnClose.clickEvents = [];
        this._btnClose.clickEvents.push(listen1);
        this._imgHelpBtn.clickEvents = [];
        this._imgHelpBtn.clickEvents.push(listen2);
        this._goBtn.node.on(cc.Node.EventType.TOUCH_START,this._onBtnGo,this);
    }
    _startRefreshHandler() {
        this._endRefreshHandler();
        var [isAvailabel] = G_UserData.getCrossWorldBoss().isActivityAvailable();
        if (isAvailabel == true) {
            this._labelCountdown.node.active = (false);
            this._playBtnEffect();
            return true;
        }
        if (this._refreshHandler != null) {
            return;
        }
        this._labelCountdown.node.active = (true);
        this._refreshHandler = handler(this, this._onRefreshTick);
        this.schedule(this._refreshHandler, 1);
    }
    _endRefreshHandler() {
        if (this._refreshHandler != null) {
            this.unschedule(this._refreshHandler);
            this._refreshHandler = null;
        }
    }
    _playBtnEffect() {
        this._btnEffectNode.removeAllChildren();
        this._btnEffectNode.setScale(1.2);
        G_EffectGfxMgr.createPlayGfx(this._btnEffectNode, 'effect_youxiangtishi_b');
    }
    _onRefreshTick() {
        var [isAvailabel,availableTime] = G_UserData.getCrossWorldBoss().isActivityAvailable();
        var message = G_ServerTime.getLeftSecondsString(availableTime || 0);
        if (isAvailabel == true) {
            this._labelCountdown.node.active = (false);
            this._endRefreshHandler();
            this._playBtnEffect();
            return;
        }
        this._labelCountdown.string = (message);
    }
    _onHelpBtn() {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_CROSS_WORLD_BOSS);
    }
    _playFire() {
        this._nodeFire.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._nodeFire,'effect_tujietiaozi_2');
    }
    _initPreAwardPanel() {
        var rewards = CrossWorldBossHelperT.getPreviewRewards();
        this._commonListViewItem.updateUI(rewards);
        this._commonListViewItem.setMaxItemSize(5);
        this._commonListViewItem.setListViewSize(410, 100);
        this._commonListViewItem.setItemsMargin(2);
    }
    _showProgressEffect() {
        
        var avatar = cc.instantiate(this._CommonStoryAvatar2).getComponent(CommonStoryAvatar2);
        var bossHeroId = CrossWorldBossHelperT.getBossHeroId();
        if (bossHeroId) {
            avatar.updateUI(bossHeroId);
            avatar.setAvatarScale(1.0);
            avatar.node.setPosition(cc.v2(0, -281));
        }
        this._avatarNode.addChild(avatar.node);
        var x = this._imgBg.node.x;
        let y = this._imgBg.node.y;
        if (bossHeroId == 450) {
            this._avatarNode.setPosition(cc.v2(x + 10, y + 40));
        } else {
            this._avatarNode.setPosition(cc.v2(x + 10, y + 20));
        }
    }
    onEnter() {
        this._signalEnterBossInfo = G_SignalManager.add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_INFO, handler(this, this._onEventGetInfo));
        this._avatarNameImg.node.active = (false);
        this._desImg.node.active = (false);
        var bossConfigInfo = CrossWorldBossHelperT.getBossInfo();
        if (bossConfigInfo) {
            var bossConfigId = bossConfigInfo.id;
            this._avatarNameImg.node.active = (true);
            UIHelper.loadTexture(this._avatarNameImg,Path.getGoldHeroTxt(CrossWorldBossConst.DRAW_HERO_MINGZI[bossConfigId]));
            this._desImg.node.active = (true);
            UIHelper.loadTexture(this._desImg,Path.getGoldHeroTxt(CrossWorldBossConst.DRAW_HERO_DESC[bossConfigId]));
        }
        this._showProgressEffect();
        this._playFire();
        this._initPreAwardPanel();
        this._initCampPanel();
        this._startRefreshHandler();
        this._onRefreshTick();
    }
    onExit() {
        // scheduler.performWithDelayGlobal(function () {
        //     sp.SpineCache.getInstance().removeUnusedSpines();
        //     cc.Director.getInstance().getTextureCache().removeUnusedTextures();
        //     collectgarbage('collect');
        // } 0.5);
        G_SignalManager.dispatch(SignalConst.EVENT_CROSS_WORLDBOSS_EXIT,{})
        this._endRefreshHandler();
        this._signalEnterBossInfo.remove();
        this._signalEnterBossInfo = null;
    }
    _initCampPanel() {
        var selfCamp = G_UserData.getCrossWorldBoss().getSelf_camp();
        if (selfCamp && selfCamp != 0) {
            this._nextTips.active = (false);
            this._campInfo.active = (true);
            var myCampIconPath = CrossWorldBossHelperT.getCampIconPathById(selfCamp);
            UIHelper.loadTexture(this._imageMy,myCampIconPath);
            var bossId = G_UserData.getCrossWorldBoss().getBoss_id();
            var bossInfo = CrossWorldBossHelperT.getBossConfigInfo(bossId);
            if (bossInfo) {
                var pozhaoCamp = CrossWorldBossHelperT.getPozhaoCampByBossId(bossInfo.id);
                var pozhaoCampIconPath = CrossWorldBossHelperT.getCampIconPathById(pozhaoCamp);
                UIHelper.loadTexture(this._imagePoZhao,pozhaoCampIconPath);
            }
        } else {
            this._nextTips.active = (true);
            this._campInfo.active = (false);
        }
    }
    _onEventGetInfo() {
    }
    _closeCallback() {
        this.close();
    }
    _onBtnGo() {
        var [isOpen] = G_UserData.getCrossWorldBoss().isActivityAvailable();
        if (isOpen == false) {
            G_Prompt.showTip(Lang.get('country_boss_open_tip'));
            return;
        }
        this.close();
        G_SceneManager.showScene('crossWorldBoss');
    }
}