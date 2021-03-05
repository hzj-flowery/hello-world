import { AudioConst } from "../../../const/AudioConst";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { DataConst } from "../../../const/DataConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import EffectHelper from "../../../effect/EffectHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ServerTime, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import CommonMainMenu from "../../../ui/component/CommonMainMenu";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import CommonUI from "../../../ui/component/CommonUI";
import { HeroSpineNode } from "../../../ui/node/HeroSpineNode";
import { SpineNode } from "../../../ui/node/SpineNode";
import { PopupGetRewards } from "../../../ui/PopupGetRewards";
import PopupSystemAlert from "../../../ui/PopupSystemAlert";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { WayFuncDataHelper } from "../../../utils/data/WayFuncDataHelper";
import { handler } from "../../../utils/handler";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import ViewBase from "../../ViewBase";
import { RedPetAvatarNode } from "./RedPetAvatarNode";
import { RedPetHelper } from "./RedPetHelper";



const { ccclass, property } = cc._decorator;

@ccclass

export class RedPetView extends ViewBase {

    

    @property({
        type: cc.Sprite,
        visible: true
    })
    _stick: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _btnRefresh: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _purpleBtn: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _goldenBtn: cc.Sprite = null;

    @property({
        type: HeroSpineNode,
        visible: true
    })
    _spineHero: HeroSpineNode = null;
    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _nodeBook: CommonMainMenu = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _joyStick: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _arrowRoot: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _avatarRoot: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _bullet: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _bulletNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _guideEffectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroEffect: cc.Node = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _panel1: cc.Node = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _panel2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel3: cc.Node = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _purpleEffectNode: cc.Node = null;

    
    @property({
        type: cc.Node,
        visible: true
    })
    _goldenEffectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _goldenEffectNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _goldenEffectNode2: cc.Node = null;

    


    @property({
        type: cc.Node,
        visible: true
    })
    _purpleEffectNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _purpleEffectNode2: cc.Node = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _helpBtn: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _cost1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _cost2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _refreshCost: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _topTipsEffectNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _arrowRect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroAvatar: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroAvatarNode: cc.Node = null;

    

    @property({
        type: cc.Node,
        visible: true
    })
    _freeTextRoot: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _freeBg: cc.Sprite = null;
    
    
    

    @property({
        type: RedPetAvatarNode,
        visible: true
    })
    _petAvatarNode1: RedPetAvatarNode = null;

    @property({
        type: RedPetAvatarNode,
        visible: true
    })
    _petAvatarNode2: RedPetAvatarNode = null;

    @property({
        type: RedPetAvatarNode,
        visible: true
    })
    _petAvatarNode3: RedPetAvatarNode = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _awardList: CommonListViewLineItem = null;

    static ARROW_WIDTH = 45;
    static CACHE_SIZE = 50;
    static TOUCHE_RADIUS = 150;
    name: 'RedPetView';
    static waitEnterMsg(callBack) {
        function onMsgCallBack() {
            callBack();
        }
        G_UserData.getRedPetData().c2sGetRedPetInfo();
        var signal = G_SignalManager.addOnce(SignalConst.EVENT_GET_RED_PET_INFO, onMsgCallBack);
        return signal;
    }
    private _unusedArrows:Array<any>;
    private _usedArrows:Array<any>;
    private _bezier:any;
    private _intersectRandomNum:number;
    private _gachaType:number;
    private _intersectPanelId:number;
    private _startPlayFly:boolean;
    private _signalGetRedPetInfo:any;
    private _signalRefreshPetInfo:any;
    private _countDownScheduler:any;
    private _xuliLoopSoundId:any;
    private _redPetRect:cc.Rect;
    private _orangePetRect1:cc.Rect;
    private _orangePetRect2:cc.Rect;
    private _flyTimer:any;
    private _addSpeed:number;
    private _bezierTime:number;
    private _curBezierTime:number;
    private _bulletSize:any;
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(2014,true);
        this._unusedArrows = [];
        this._usedArrows = [];
        this._bezier = null;
        this._intersectRandomNum = 0;
        this._gachaType = null;
        this._intersectPanelId = null;
        this._startPlayFly = false;

        // this._stick.node.on(cc.Node.EventType.TOUCH_START,this._onAvatarPanelClick,this);
        this._btnRefresh.node.on(cc.Node.EventType.TOUCH_START,this._onRefreshClick,this);
        this._purpleBtn.node.on(cc.Node.EventType.TOUCH_START,this._onPurpleGourdClick,this);
        this._goldenBtn.node.on(cc.Node.EventType.TOUCH_START,this._onGoldenGourdClick,this);
        this._helpBtn.on(cc.Node.EventType.TOUCH_START,this._onHelpBtn,this);
        this._initView();
        this._initJoyStick();
        this._createArrowsCache();
        this._resetBullet();
        this._initPlayerAvatar();
        this._initPetAvatar();
        this._initPreAwardPanel();
        this._playTopTipsEffect();
        this._preCalculateRect();
        
    }
    onEnter() {
        this._signalGetRedPetInfo = G_SignalManager.add(SignalConst.EVENT_GACHA_RED_PET, handler(this, this._onEventGetAwards));
        this._signalRefreshPetInfo = G_SignalManager.add(SignalConst.EVENT_REFRESH_RED_PET, handler(this, this._onEventRefreshRedPetInfo));
        if(this._countDownScheduler)
        {
            this.unschedule(this._countDownScheduler);
        }
        this._countDownScheduler =handler(this, this._update);
        this.schedule(this._countDownScheduler, 1);
        G_AudioManager.playMusicWithId(AudioConst.SOUND_RED_PET_BG);
        this._spineHero.setAnimation('idle', true);
        if (this._gachaType == 2) {
            this._onGoldenGourdClick();
        } else {
            this._onPurpleGourdClick();
        }
    }
    onExit() {
        this._signalGetRedPetInfo.remove();
        this._signalGetRedPetInfo = null;
        this._signalRefreshPetInfo.remove();
        this._signalRefreshPetInfo = null;
        if (this._countDownScheduler) {
           this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
        this._endFly();
        this._startPlayFly = false;
        if (this._xuliLoopSoundId) {
            G_AudioManager.stopSound(this._xuliLoopSoundId);
            this._xuliLoopSoundId = null;
        }
    }
    _initView() {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_RED_PET_ACTIVITY, true);
        this._topbarBase.setImageTitle('txt_sys_com_qiling');
        this._nodeBook.updateUI(FunctionConst.FUNC_RED_PET_SHOP);
        this._nodeBook.addClickEventListenerEx(handler(this, this._onBtnShop));
        
        var costOnceNum = parseInt(Paramter.get(903).content);
        this._cost1.string = ''+(costOnceNum);
        var costTenNum = parseInt(Paramter.get(904).content);
        this._cost2.string = ''+(costTenNum);
        var refreshCostNum = parseInt(Paramter.get(905).content);
        this._refreshCost.string = (Lang.get('guild_create_cost', { value: refreshCostNum }));
        this._updateDrawFreeDesc();
    }
    _onRefreshClick() {
        if (this._startPlayFly == true) {
            return;
        }
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var costNum = parseInt(Paramter.get(905).content);
        var canRun = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costNum, true);
        if (!canRun) {
            return;
        }
        var isNotNeedConfirm = UserDataHelper.getPopModuleShow('RedPetViewRefresh');
        if (isNotNeedConfirm) {
            G_UserData.getRedPetData().c2sRedPetRefresh();
            return;
        }
        var title = Lang.get('common_title_notice');
        var content = Lang.get('pet_red_refresh_tips');
        function callback() {
            G_UserData.getRedPetData().c2sRedPetRefresh();
        }
      
        UIPopupHelper.popupSystemAlert(title,content,callback,null,function(popup:PopupSystemAlert){
            popup.setModuleName('RedPetViewRefresh');
            popup.setCheckBoxVisible(true);
        })  
    }
    _onEventRefreshRedPetInfo() {
        this._initPetAvatar();
        this._initPreAwardPanel();
        this._playPetRefreshEffect();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PET_REFRESH_SOUND);
    }
    _initPlayerAvatar() {
        this._spineHero  = HeroSpineNode.create() as HeroSpineNode;
        this._spineHero.setScale(0.8);
        this._heroAvatar.addChild(this._spineHero.node);
        var resJson = Path.getEffectSpine('fennuxiaoniao');
        this._spineHero.setAsset(resJson);
        this._spineHero.signalLoad.add(()=>{
            this._spineHero.setAnimation('idle', true);
        });
    }
    _initPetAvatar() {
        var pets = RedPetHelper.getShowPetsInfo();
        this._petAvatarNode2.updatePetAvatar({ id: pets[0].petId });
        this._petAvatarNode1.updatePetAvatar({ id: pets[1].petId });
        this._petAvatarNode3.updatePetAvatar({ id: pets[2].petId });
    }
    _playPetRefreshEffect() {
        this._petAvatarNode1.playRefreshEffect();
        this._petAvatarNode2.playRefreshEffect();
        this._petAvatarNode3.playRefreshEffect();
    }
    _onEventGetAwards(event, awards) {
        if (awards) {
            var action1 = cc.callFunc( ()=> {
                this._playAllPetsEmoji(awards);
            });
            var action2 = cc.delayTime(1);
            var action3 = cc.callFunc(()=> {
                this._removeAllPetsEmoji();
                PopupGetRewards.showRewards(awards);

                this._startPlayFly = false;
                if (this._gachaType == 1 || this._gachaType == 0) {
                    this._onPurpleGourdClick();
                } else if (this._gachaType == 2) {
                    this._onGoldenGourdClick();
                }
            });
            var action = cc.sequence(action1, action2, action3);
            this.node.runAction(action);
        }
        this._updateDrawFreeDesc();
    }
    _onBtnShop() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RED_PET_SHOP);
    }
    _updateShopRP() {
    }
    _resetBullet() {
        var worldPos = this._touchPanel.convertToWorldSpaceAR(cc.v2(0,0));
        var localPos = this._panelDesign.convertToNodeSpaceAR(worldPos);
        this._bullet.node.setPosition(cc.v2(0, 0));
        this._bulletNode.setPosition(cc.v2(localPos.x, localPos.y));
        this._bulletNode.active = (false);
        this._bullet.node.removeAllChildren();
        this._doBulletIdleAnim();
    }
    _doBulletIdleAnim() {
        var moveAction = cc.moveBy(1, cc.v2(0, 10));
        var moveAction1 = cc.moveBy(1, cc.v2(0, -10));
        var rep = cc.repeatForever(cc.sequence(moveAction,moveAction1));
        this._bullet.node.runAction(rep);
    }
    _removeAllPetsEmoji() {
        this._petAvatarNode1.removeEmoji();
        this._petAvatarNode2.removeEmoji();
        this._petAvatarNode3.removeEmoji();
    }
    _playAllPetsEmoji(awards) {
        if (awards == null || awards.length == 0 || this._intersectPanelId == null) {
            return;
        }
        var pets = [];
        var fragments = [];
        for (let k in awards) {
            var v = awards[k];
            if (v.type == TypeConvertHelper.TYPE_PET) {
                table.insert(pets, v);
            } else if (v.type == TypeConvertHelper.TYPE_FRAGMENT) {
                table.insert(fragments, v);
            }
        }
        this._petAvatarNode1.playEmojiEffect(pets, fragments, this._intersectPanelId == 1);
        this._petAvatarNode2.playEmojiEffect(pets, fragments, this._intersectPanelId == 2);
        this._petAvatarNode3.playEmojiEffect(pets, fragments, this._intersectPanelId == 3);
        this._intersectPanelId = null;
    }
    _setBulletToStickPos() {
        var pos = this._stick.node.getPosition();
        var stickPosX = pos.x; 
        var stickPosY = pos.y;
        var worldPos = this._touchPanel.convertToWorldSpaceAR(cc.v2(stickPosX, stickPosY));
        var localPos = this._panelDesign.convertToNodeSpaceAR(worldPos);
        this._bulletNode.setPosition(cc.v2(localPos.x, localPos.y));
    }
    _onHelpBtn() {
        UIPopupHelper.popupHelpInfo(FunctionConst.FUNC_RED_PET);
    }
    _initPreAwardPanel() {
        var rewards = RedPetHelper.getPreAwardInfo();
        this._awardList.updateUI(rewards);
        this._awardList.setMaxItemSize(5);
        this._awardList.setListViewSize(410, 100);
        this._awardList.setItemsMargin(2);
    }
    _playBulletParticleEffect() {
        var particleName = '';
        if (this._gachaType == 0 || this._gachaType == 1) {
            particleName = 'qilingguijizise';
        } else {
            particleName = 'qilingguijichengse';
        }
        let pNode = this._bullet.node.parent.getChildByName("ParticleSystemNode");
        if(!pNode)
        {
            pNode = new cc.Node();
            pNode.name = "ParticleSystemNode";
            pNode.addComponent(cc.ParticleSystem);
            this._bullet.node.parent.addChild(pNode);
        }
        var emitter = pNode.getComponent(cc.ParticleSystem);
       
        EffectHelper.loadEffectRes('effect/particle/' + (particleName + '.plist'),cc.ParticleAsset,(res:any)=>{
            if (emitter&&this._bullet) {
                emitter.file = res;
                emitter.node.setPosition(this._bullet.node.position);
                emitter.resetSystem();
            }
        })

    }
    _doFlyAction() {
        if (this._startPlayFly == true) {
            return;
        }
        var [ret, costYuBi, nameIndex] = this._checkCost();
        if (ret == false) {
            this._cancelFly();
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_6',
            yubiCount: costYuBi,
            itemCount: 1,
            itemNameIndex: nameIndex-1
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._realDoFlyAction));
    }
    _realDoFlyAction() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PET_FLY_SOUND);
        this._joyStick.active = (false);
        if (this._flyTimer) {
            this.unschedule(this._flyTimer);
            this._flyTimer = null;
        }
        this._spineHero.setAnimation('attack', false);
        this._playBulletParticleEffect();
        this._addSpeed = 0.8;
        this._bezierTime = 1;
        this._curBezierTime = 0;
        this._intersectRandomNum = Math.random();
        this._startPlayFly = true;
        this._flyTimer = handler(this, this._flyUpdate);
        this.schedule(this._flyTimer, 1 / 60);
    }
    _endFly() {
        let pNode = this._bullet.node.parent.getChildByName("ParticleSystemNode");
        if(pNode)
        {
            this._bullet.node.parent.removeChild(pNode);
        }
        if (this._flyTimer) {
            this.unschedule(this._flyTimer);
            this._flyTimer = null;
        }
        this._bezier = null;
        this._spineHero.setAnimation('idle', true);
        this._resetBullet();
    }
    _removeChooseEffect() {
        this._purpleEffectNode.removeAllChildren();
        this._purpleEffectNode1.removeAllChildren();
        this._goldenEffectNode.removeAllChildren();
        this._goldenEffectNode1.removeAllChildren();
    }
    _playHitEffect() {
        this._removeChooseEffect();
        if (this._intersectPanelId == null) {
            this._doGacha();
            return;
        }
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._doGacha();
            }
        }.bind(this);
        G_EffectGfxMgr.createPlayGfx(this['_panel' + this._intersectPanelId], 'effect_qiling_mingzhong1', eventFunction, true, cc.v2(30, 20));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_RED_PET_HIT_SOUND);
    }
    _flyUpdate(dt) {
        if (this._startPlayFly) {
            this._addSpeed = this._addSpeed + 0.007;
            this._curBezierTime = this._curBezierTime + 1 / 60 * this._addSpeed;
            var percent = Math.min(1, this._curBezierTime / this._bezierTime);
            var [posx, posy] = RedPetHelper.getBezierPosition(this._bezier, percent);
            this._bullet.node.setPosition(cc.v2(posx, posy));
            let pNode = this._bullet.node.parent.getChildByName("ParticleSystemNode");
            if(pNode)
            {
                //粒子飞
                pNode.setPosition(cc.v2(posx, posy));
            }
            if (percent >= 1) {
                this._playHitEffect();
                this._endFly();
            }
            var [isIntersectsWithPet,panelId] = this._checkBulletIntersectsWithPets();
            if (isIntersectsWithPet == true) {
                this._intersectPanelId = panelId;
                this._playHitEffect();
                this._endFly();
            }
        }
    }
    _showJoyStick() {
        this._joyStick.active = (true);
        this._bulletNode.active = (true);
    }
    _playChooseEffect() {
        var activeEffectName = '';
        var activeEffectNode = null;
        this._purpleEffectNode.removeAllChildren();
        this._goldenEffectNode.removeAllChildren();
        if (this._gachaType == 0 || this._gachaType == 1) {
            activeEffectName = 'effect_qiling_zisehulijihuo';
            activeEffectNode = this._purpleEffectNode;
        } else {
            activeEffectName = 'effect_qiling_chengsehulijihuo';
            activeEffectNode = this._goldenEffectNode;
        }
        G_EffectGfxMgr.createPlayGfx(activeEffectNode, activeEffectName, null);
    }
    _playChoosedStateEffect() {
        var choosedEffectName = '';
        var choosedEffectNode = null;
        this._purpleEffectNode1.removeAllChildren();
        this._goldenEffectNode1.removeAllChildren();
        this._goldenEffectNode2.removeAllChildren();
        if (this._gachaType == 0 || this._gachaType == 1) {
            choosedEffectName = 'effect_qiling_zisehuluguang';
            choosedEffectNode = this._purpleEffectNode1;
        } else {
            choosedEffectName = 'effect_qiling_chengsehuluguang';
            choosedEffectNode = this._goldenEffectNode1;
        }
        G_EffectGfxMgr.createPlayGfx(choosedEffectNode, choosedEffectName, null);
        if (this._gachaType == 2) {
            G_EffectGfxMgr.createPlayGfx(this._goldenEffectNode2, 'effect_qiling_chengsehuluguangzi', null);
        }
    }
    _playHeroAvatarXuliEffect() {
        var xuliEffectName = 'effect_qiling_xuli';
        this._heroEffect.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._heroEffect, xuliEffectName, null);
    }
    _playGuideEffect() {
        var guideEffectName = 'effect_qiling_yindao';
        this._guideEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._guideEffectNode, guideEffectName, null);
    }
    _playTopTipsEffect() {
        var effectName = 'moving_qiling_wenzixingxing';
        this._topTipsEffectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._topTipsEffectNode, effectName, null);
    }
    _onPurpleGourdClick(sender?, state?) {
        if (this._startPlayFly == true) {
            return;
        }
        var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var freeCnt = G_UserData.getRedPetData().getFree_times();
        var freeCD = G_UserData.getRedPetData().getFree_cd();
        if (G_ServerTime.getLeftSeconds(freeCD) <= 0) {
            this._gachaType = 0;
        } else {
            this._gachaType = 1;
        }
        // this._bullet.ignoreContentAdaptWithSize(true);
        UIHelper.loadTexture(this._bullet,Path.getRedPetImage('img_pet_hulu01a'))
        if (sender) {
            this._playChooseEffect();
        }
        this._playChoosedStateEffect();
        this._showJoyStick();
        this._playGuideEffect();
    }
    _onGoldenGourdClick(sender?, state?) {
        if (this._startPlayFly == true) {
            return;
        }
        this._gachaType = 2;
        // this._bullet.ignoreContentAdaptWithSize(true);
        UIHelper.loadTexture(this._bullet,Path.getRedPetImage('img_pet_hulu01b'));
        if (sender) {
            this._playChooseEffect();
        }
        this._playChoosedStateEffect();
        this._showJoyStick();
        this._playGuideEffect();
    }
    _checkCost() {
        var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
        var itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        var needNum = 0;
        var needYubi = null;
        if (this._gachaType == 2) {
            needNum = parseInt(Paramter.get(904).content);
            needYubi = needNum;
        } else if (this._gachaType == 1) {
            needNum = parseInt(Paramter.get(903).content);
            needYubi = needNum;
        } else if (this._gachaType == 0) {
            needNum = 0;
        } else {
        }
        if (itemNum < needNum) {
            this._toRecharge();
            return [false,null,null];
        }
        return [
            true,
            needYubi,
            this._gachaType
        ];
    }
    _toRecharge() {
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
    }
    _doGacha() {
        if (this._gachaType == null) {
            console.log('self._gachaType == nil !!!!!');
            return;
        }
        G_UserData.getRedPetData().c2sGachaRedPet(this._gachaType, 1);
    }
    _createFlyParabola(distanceX, distanceY) {
        var endPosX = 1200 * distanceX / RedPetView.TOUCHE_RADIUS;
        var endPos = cc.v2(endPosX + 50, -100);
        var startPos = cc.v2(0, 0);
        var midPointY = 1000 * distanceY / RedPetView.TOUCHE_RADIUS;
        var midPoint = cc.v2((endPos.x - startPos.x) / 2, midPointY + 200);
        this._bezier = [
            startPos,
            midPoint,
            endPos
        ];
        this._createBezierWith2Point(this._bezier, startPos, endPos, midPoint);
    }
    _createBezierWith2Point(bezier:Array<cc.Vec2>, startPos, endPos, midPoint) {
        var diffY = Math.abs(endPos.y - startPos.y);
        var diffX = Math.abs(endPos.x - startPos.x);
        var distance = Math.sqrt(diffX * diffX + diffY * diffY) + (midPoint.y - startPos.y);
        var loop = Math.ceil(distance / RedPetView.ARROW_WIDTH);
        this._resetArrowsCache();
        for (var i = 1; i <= loop; i++) {
            var percent = i / loop;
            var [posx, posy, angle] = RedPetHelper.getBezierPositionAndAngle(bezier, percent);
            var arrow = this._getUnusedArrow();
            var grayArrow:cc.Sprite = arrow.gray;
            var lightArrow:cc.Sprite = arrow.light;
            var pos = cc.v2(posx, posy);
            grayArrow.node.setPosition(pos);
            grayArrow.node.rotation = (angle);
            lightArrow.node.setPosition(pos);
            lightArrow.node.rotation = (angle);
        }
        for (let k in this._usedArrows) {
            var v = this._usedArrows[k];
            v.gray.node.active = (bezier[2].x < 300);
            v.light.node.active = (bezier[2].x >= 300);
        }
    }
    _preCalculateRect() {
        let pos2 = this._panel2.getPosition();
        var panel2X = pos2.x; 
        var panel2Y = pos2.y;
        var panel2Size = this._panel2.getContentSize();
        var panel2WorldPos = this._petAvatarNode2.node.convertToWorldSpaceAR(cc.v2(panel2X, panel2Y));
        var panel2LocalPos = this._panelDesign.convertToNodeSpaceAR(panel2WorldPos);
        this._redPetRect = new cc.Rect(panel2LocalPos.x,panel2LocalPos.y,panel2Size.width,panel2Size.height);
        let pos1 = this._panel1.getPosition();
        var panel1X = pos1.x;
        var panel1Y = pos1.y;
        var panel1WorldPos = this._petAvatarNode1.node.convertToWorldSpaceAR(cc.v2(panel1X, panel1Y));
        var panel1LocalPos = this._panelDesign.convertToNodeSpaceAR(panel1WorldPos);
        var panel1Size = this._panel1.getContentSize();
        this._orangePetRect1 = new cc.Rect(panel1LocalPos.x,panel1LocalPos.y,panel1Size.width,panel1Size.height);
        let pos3 = this._panel3.getPosition();
        var panel3X = pos3.x;
        var panel3Y = pos3.y;
        var panel3WorldPos = this._petAvatarNode3.node.convertToWorldSpaceAR(cc.v2(panel3X, panel3Y));
        var panel3LocalPos = this._panelDesign.convertToNodeSpaceAR(panel3WorldPos);
        var panel3Size = this._panel3.getContentSize();
        this._orangePetRect2 = new cc.Rect(panel3LocalPos.x,panel3LocalPos.y,panel3Size.width,panel3Size.height);
        this._bulletSize = this._arrowRect.getContentSize();
    }
    _checkBulletIntersectsWithPets() {
        let pos = this._bullet.node.getPosition();
        var bulletX = pos.x;
        var bulletY = pos.y;
        var worldPos = this._bulletNode.convertToWorldSpaceAR(cc.v2(bulletX, bulletY));
        var localPos = this._panelDesign.convertToNodeSpaceAR(worldPos);
        var bulletRect = new cc.Rect(localPos.x,localPos.y,this._bulletSize.width,this._bulletSize.height)
        var isIntersects = bulletRect.intersects(this._orangePetRect1);
        if (isIntersects == true) {
            if (this._bezier[2].x >= this._orangePetRect2.x) {
                if (this._intersectRandomNum >= 0.5) {
                    return [false,-1];
                }
            }
            return [
                true,
                1
            ];
        }
        isIntersects = bulletRect.intersects(this._orangePetRect2);
        if (isIntersects == true) {
            return [
                true,
                3
            ];
        }
        isIntersects = bulletRect.intersects(this._redPetRect);
        if (isIntersects == true) {
            return [
                true,
                2
            ];
        }
        return [false,0];
    }
    _checkIntersectsWithPets(rect:cc.Rect) {
        return rect.intersects(this._orangePetRect1) || rect.intersects(this._orangePetRect2) || rect.intersects(this._redPetRect);
    }
    _createArrowsCache() {
        this._unusedArrows = [];
        this._usedArrows = [];
        for (var i = 1; i <= RedPetView.CACHE_SIZE; i++) {
            var lightArrow = new cc.Node().addComponent(cc.Sprite);
            UIHelper.loadTexture(lightArrow,Path.getRedPetImage('img_donghua_xian01'));
            var grayArrow = new cc.Node().addComponent(cc.Sprite);
            UIHelper.loadTexture(grayArrow,Path.getRedPetImage('img_donghua_xian02'));
            lightArrow.node.active = (false);
            grayArrow.node.active = (false);
            this._arrowRoot.addChild(lightArrow.node);
            this._arrowRoot.addChild(grayArrow.node);
            table.insert(this._unusedArrows, {
                light: lightArrow,
                gray: grayArrow
            });
        }
    }
    _getUnusedArrow() {
        var arrow = null;
        if (this._unusedArrows.length > 0) {
            arrow = this._unusedArrows[this._unusedArrows.length-1];
            table.remove(this._unusedArrows, this._unusedArrows.length-1);
            table.insert(this._usedArrows, arrow);
            arrow.light.node.active = (true);
            arrow.gray.node.active = (true);
        } else {
            var lightArrow = new cc.Node().addComponent(cc.Sprite);
            UIHelper.loadTexture(lightArrow,Path.getRedPetImage('img_donghua_xian01'));
            var grayArrow = new cc.Node().addComponent(cc.Sprite);
            UIHelper.loadTexture(grayArrow,Path.getRedPetImage('img_donghua_xian02'));
            lightArrow.node.active = (false);
            grayArrow.node.active = (false);
            this._arrowRoot.addChild(lightArrow.node);
            this._arrowRoot.addChild(grayArrow.node);
            arrow = {
                light: lightArrow,
                gray: grayArrow
            };
            table.insert(this._usedArrows, arrow);
        }
        return arrow;
    }
    _resetArrowsCache() {
        for (let k in this._usedArrows) {
            var arrow = this._usedArrows[k];
            table.insert(this._unusedArrows, arrow);
            arrow.light.node.active = (false);
            arrow.gray.node.active = (false);
        }
        this._usedArrows = [];
    }
    _initJoyStick() {
       
        this._stick.node.on(cc.Node.EventType.TOUCH_START, this._onJoyStickTouchBegan,this);
        this._stick.node.on(cc.Node.EventType.TOUCH_MOVE,this._onJoyStickTouchMoved,this);
        this._stick.node.on(cc.Node.EventType.TOUCH_END,this._onJoyStickTouchEnded,this);
        this._stick.node.on(cc.Node.EventType.TOUCH_CANCEL,this._onJoyStickTouchCancelled,this);

        this._joyStick.active = (false);
        let pos = this._heroAvatarNode.getPosition();
        var avatarPosX = pos.x;
        var avatarPosY = pos.y;
        var worldPos = this._avatarRoot.convertToWorldSpaceAR(cc.v2(avatarPosX, avatarPosY));
        var localPos = this._panelDesign.convertToNodeSpaceAR(worldPos);
        this._joyStick.x = (localPos.x + 10);
    }
    _onJoyStickTouchBegan(touch:cc.Event.EventTouch) {
        var localPos = this._touchPanel.convertToNodeSpaceAR(touch.getLocation());
        if (this._startPlayFly == true || localPos.x > 150 || localPos.x < 0 || localPos.y > 150 || localPos.y < 0) {
            return false;
        } else if (this._gachaType) {
            // localPos.x = Math.max(0, Math.min(localPos.x, RedPetView.TOUCHE_RADIUS));
            // localPos.y = Math.max(0, Math.min(localPos.y, RedPetView.TOUCHE_RADIUS));
            this._stick.node.setPosition(localPos);
            this._setBulletToStickPos();
            this._spineHero.setAnimation('dile2', true);
            this._playHeroAvatarXuliEffect();
            this._guideEffectNode.removeAllChildren();
            this._bullet.node.setPosition(cc.v2(0, 0));
            this._bullet.node.stopAllActions();
            this._xuliLoopSoundId = G_AudioManager.playSoundWithIdExt(AudioConst.SOUND_RED_PET_XULI_SOUND, null, true);
            return true;
        }
    }
    _onJoyStickTouchMoved(touch:cc.Event.EventTouch) {
        
        var localPos = this._touchPanel.convertToNodeSpaceAR(touch.getLocation());
        console.log("触摸点的位置------",touch.getLocationInView(),localPos.x,localPos.y);
        // localPos.x = Math.max(0, Math.min(localPos.x, RedPetView.TOUCHE_RADIUS));
        // localPos.y = Math.max(0, Math.min(localPos.y, RedPetView.TOUCHE_RADIUS));

        this._stick.node.setPosition(localPos);
        this._setBulletToStickPos();
        this._createFlyParabola(0 - localPos.x, 0 - localPos.y);
    }
    _onJoyStickTouchEnded(touch:cc.Event.EventTouch) {
        this._stick.node.setPosition(cc.v2(0,0));
        this._resetArrowsCache();
        this._heroEffect.removeAllChildren();
        if (this._xuliLoopSoundId) {
            G_AudioManager.stopSound(this._xuliLoopSoundId);
            this._xuliLoopSoundId = null;
        }
        if (this._bezier == null || this._bezier[2].x < 300) {
            G_Prompt.showTip(Lang.get('red_pet_not_aim'));
            this._cancelFly();
            return;
        }
        if (this._bezier) {
            this._doFlyAction();
        }
    }
    _onJoyStickTouchCancelled(touch:cc.Event.EventTouch) {
        this._stick.node.setPosition(cc.v2(0,0));
        this._resetArrowsCache();
    }
    _cancelFly() {
        this._spineHero.setAnimation('idle', true);
        this._resetBullet();
        this._showJoyStick();
        this._playGuideEffect();
    }
    _update(dt) {
        this._updateDrawFreeDesc();
    }
    private _freeText:cc.RichText;
    _updateDrawFreeDesc() {
        var freeCnt = G_UserData.getRedPetData().getFree_times();
        var freeCD = G_UserData.getRedPetData().getFree_cd();
        // this._freeTextRoot.removeAllChildren();
        if(!this._freeText)
        {
            this._freeText = new cc.Node().addComponent(cc.RichText);
            this._freeTextRoot.addChild(this._freeText.node);
        }
        var freeTime = G_ServerTime.getLeftSeconds(freeCD);
        if (freeTime > 0) {
            var talentInfo = Lang.get('pet_red_free_cd_des', { cd: G_ServerTime.getLeftDHMSFormatEx(freeCD) });
            RichTextExtend.udpateWithContent(this._freeText,talentInfo);
            this._freeText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._freeBg.node.setContentSize(cc.size(195, 32));
        } else {
            if (this._gachaType == 1) {
                this._gachaType = 0;
            }
            var talentInfo = Lang.get('pet_red_free_count_des', { left: 1 });
            RichTextExtend.udpateWithContent(this._freeText,talentInfo);
            this._freeText.node.setAnchorPoint(cc.v2(0, 0.5));
            this._freeBg.node.setContentSize(cc.size(150, 32));
        }
    }
}