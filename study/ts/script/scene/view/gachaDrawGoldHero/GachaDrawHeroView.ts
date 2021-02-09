const {ccclass, property} = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'

import CommonHeroCountry2 from '../../../ui/component/CommonHeroCountry2'

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonRechargeReward from '../../../ui/component/CommonRechargeReward'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import ViewBase from '../../ViewBase';
import { G_ServerTime, G_UserData, Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_BulletScreenManager, G_NetworkManager, G_SignalManager, G_ResolutionManager, G_ConfigLoader, G_HeroVoiceManager } from '../../../init';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { AudioConst } from '../../../const/AudioConst';
import { handler } from '../../../utils/handler';
import { GachaGoldenHeroConst } from '../../../const/GachaGoldenHeroConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import GoldHeroLayer from './GoldHeroLayer';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import PopupBase from '../../../ui/PopupBase';
import PopupItemGuider from '../../../ui/PopupItemGuider';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import GachaGoldenHeroHelper from '../gachaGoldHero/GachaGoldenHeroHelper';
import PopupHeroDetail from '../heroDetail/PopupHeroDetail';
import { FunctionConst } from '../../../const/FunctionConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { BullectScreenConst } from '../../../const/BullectScreenConst';
import { MessageIDConst } from '../../../const/MessageIDConst';
import { SignalConst } from '../../../const/SignalConst';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { DataConst } from '../../../const/DataConst';
import CommonUI from '../../../ui/component/CommonUI';
import { ConfigNameConst } from '../../../const/ConfigNameConst';

@ccclass
export default class GachaDrawHeroView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _effectHuoyan: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectZhaomu: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectDrawcard: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeOneDraw: cc.Node = null;

    

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _goldenBook: CommonMainMenu = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFreeCountdown: cc.Node = null;

    

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageItemIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageItemIcon1: cc.Sprite = null;

    

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemIconTotal: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemIconTotal1: cc.Label = null;

    

    @property({
        type: CommonRechargeReward,
        visible: true
    })
    _commonRecharge: CommonRechargeReward = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnGoGet: cc.Button = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelRightTop: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgFreeBg: cc.Sprite = null;

    

    @property({
        type: CommonHeroCountry2,
        visible: true
    })
    _commonCountry1: CommonHeroCountry2 = null;

    @property({
        type: CommonHeroCountry2,
        visible: true
    })
    _commonCountry2: CommonHeroCountry2 = null;

    @property({
        type: CommonHeroCountry2,
        visible: true
    })
    _commonCountry3: CommonHeroCountry2 = null;

    @property({
        type: CommonHeroCountry2,
        visible: true
    })
    _commonCountry4: CommonHeroCountry2 = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBottom: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFreeDraw: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFreeIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTenDraw: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTenIcon: cc.Sprite = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _commonBtnFree: CommonButtonLevel0Normal = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _commonBtnTen: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeItem2: cc.Node = null;

    

    @property(cc.Prefab)
    goldHeroLayer:cc.Prefab = null;

    _selectedPos: any;
    _allHeroIds: any[];
    _heroCount: number;
    _heroId: any;
    _isPlayAni: boolean;
    _countDownScheduler: any;
    _msgGacha: any;
    _signalRewadsClose: any;
    _signalUpdateItem: any;
    _signalUpdateItemPro:any;
    _effectNode: any;
    _isPageViewMoving: boolean;
    _freeRichText:cc.RichText;
    _tenRichText:cc.RichText;

    private _currentChooseZhenyin:number;
    ctor(heroId,zhenyin) {
        this._effectNode = null;
        this._heroId = heroId;
        this._isPageViewMoving = false;
        this._isPlayAni = false;
        this._currentChooseZhenyin = zhenyin || 0;
        UIHelper.addEventListener(this.node, this._commonBtnFree._button, 'GachaDrawHeroView', '_onButtonFree');
        UIHelper.addEventListener(this.node, this._commonBtnTen._button, 'GachaDrawHeroView', '_onButtonTen');
        UIHelper.addEventListener(this.node, this._btnGoGet, 'GachaDrawHeroView', '_onButtonToGet');
        this.setSceneSize();
    }
    onCreate() {
       
        var params = G_SceneManager.getViewArgs('gachaDrawGoldHero');
        this.ctor(params[0],params[1]);
        this._initSelectedPos(this._heroId);
        this._initIconImg();
        this._initCountry();
        this._initBtnDesc();
        this._initCommonBtn();
        this._showPanel(false);
    }
    onEnter() {
        this._nodeFreeCountdown.removeAllChildren();
        this._nodeFreeDraw.removeAllChildren();
        this._msgGacha = G_NetworkManager.add(MessageIDConst.ID_S2C_Gacha, handler(this, this._s2cGacha));
        this._signalRewadsClose = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_DRAWCLOSE, handler(this, this._onEventRewadsClose));
        this._signalUpdateItem = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_UPDATEITEM, handler(this, this._onEventUpdateItem));
        this._signalUpdateItemPro = G_SignalManager.add(SignalConst.EVENT_RECV_CURRENCYS_INFO, handler(this, this._onEventUpdateItem));
        this._updateForward();
        this._palyShowZhaomu();
        this._updateDrawFreeDesc();
        this._updateDrawTenDesc();
        this._updateBulletLayer();
        // G_AudioManager.playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN);
        if (this._countDownScheduler) {
            this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
        this._countDownScheduler = handler(this, this._update);
        this.schedule(this._countDownScheduler, 1);
    }
    onExit() {
        this._msgGacha.remove();
        this._msgGacha = null;
        this._signalRewadsClose.remove();
        this._signalRewadsClose = null;
        this._signalUpdateItem.remove();
        this._signalUpdateItem = null;
        this._signalUpdateItemPro.remove();
        this._signalUpdateItemPro = null;
        var runningScene = G_SceneManager.getTopScene();
        if (runningScene && runningScene.getName() != 'fight') {
            G_BulletScreenManager.clearBulletLayer();
        }
        if (this._countDownScheduler) {
            this.unschedule(this._countDownScheduler);
            this._countDownScheduler = null;
        }
    }
    _updateBulletLayer() {
        var isOpenBullet = G_UserData.getBulletScreen().isBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE);
        if (isOpenBullet) {
            G_BulletScreenManager.setBulletScreenOpen(BullectScreenConst.GACHA_GOLDENHERO_TYPE, true);
            G_BulletScreenManager.showBulletLayer();
        }
    }
    _updateTotalItem() {
        var total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
        var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
        this._textItemIconTotal.string = (Lang.get('gacha_goldenhero_itemtotal', { num: yubiNum }));
        this._textItemIconTotal1.string = (Lang.get('gacha_goldenhero_itemtotal', { num: total }));
        var targetPosX = this._textItemIconTotal.node.x + this._textItemIconTotal.node.getContentSize().width;
        this._btnGoGet.node.x = (targetPosX);
        this._nodeItem2.active  = (total > 0);
    }
    _initIconImg() {
        var typeRes = TypeConvertHelper.convert(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE, 1);
        var total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
        var yubiTypeRes = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2, 1);
        if (yubiTypeRes.res_mini) {
            this._imageItemIcon.node.addComponent(CommonUI).loadTexture(yubiTypeRes.res_mini);
        }
        if (typeRes.res_mini) {
            this._imageItemIcon1.node.addComponent(CommonUI).loadTexture(typeRes.res_mini);
        }
        if (total >= 10) {
            this._imageFreeIcon.node.addComponent(CommonUI).loadTexture(typeRes.res_mini);
            this._imageTenIcon.node.addComponent(CommonUI).loadTexture(typeRes.res_mini);
        } else if (total > 0) {
            this._imageFreeIcon.node.addComponent(CommonUI).loadTexture(typeRes.res_mini);
            this._imageTenIcon.node.addComponent(CommonUI).loadTexture(yubiTypeRes.res_mini);
        } else {
            this._imageFreeIcon.node.addComponent(CommonUI).loadTexture(yubiTypeRes.res_mini);
            this._imageTenIcon.node.addComponent(CommonUI).loadTexture(yubiTypeRes.res_mini);
        }
        this._commonRecharge.node.active = (false);
        this._updateTotalItem();
    }
    _initCommonBtn() {
        this._topBar.setImageTitle('txt_sys_jianlongzaitian');
        this._topBar.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
        this._topBar.setCallBackOnBack(handler(this, this._onReturnBack));
        this['_goldenBook'].updateUI(FunctionConst.FUNC_GACHA_GOLDENHERO_BOOK);
        this['_goldenBook'].addClickEventListenerEx(handler(this, this._onButtonClickShop));
    }
    _onReturnBack() {
        if (this._isPlayAni) {
            return;
        }
        G_SceneManager.popScene();
    }
    _onButtonClickShop() {
        var info = HeroDataHelper.getHeroConfig(this._heroId);
        var heroID = this._heroId;
        var limit = info.limit;
        
        UIPopupHelper.popupHeroDetail(function(popup:PopupHeroDetail){
            popup.initData(TypeConvertHelper.TYPE_HERO, heroID, true, limit);
            popup.openWithAction();
            var heroList = GachaGoldenHeroHelper.getGoldHeroCfgWithCountry(this._currentChooseZhenyin);
            popup.setPageData(heroList);
            popup.setDrawing(true);
        }.bind(this));
    }
    _toRecharge() {
        // var popup = new (require('PopupItemGuider'))(Lang.get('way_type_get'));
        WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
    }

    _showTips() {
        var entTime = G_UserData.getGachaGoldenHero().getEnd_time();
        if (G_ServerTime.getLeftSeconds(entTime) <= 0) {
            G_Prompt.showTip(Lang.get('gacha_goldenhero_recharging'));
            return true;
        }
        return false;
    }
    _onButtonFree() {
        if (this._isPlayAni) {
            return;
        }
        if (this._showTips()) {
            return;
        }
        var checkCost = function (itemNum, freeCnt, freeCD) {
            if (freeCnt > 0 && G_ServerTime.getLeftSeconds(freeCD) <= 0) {
                return [
                    true,
                    0,
                    0
                ];
            } else {
                if (itemNum > 0) {
                    return [
                        true,
                        1,
                        0
                    ];
                } else {
                    var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
                    var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
                    var onceNeedNum = parseInt(Paramter.get(883).content);
                    if (onceNeedNum <= yubiNum) {
                        return [
                            true,
                            1,
                            onceNeedNum
                        ];
                    } else {
                        this._toRecharge();
                        return [false,0,0];
                    }
                }
            }
        }.bind(this)
        var itemNum = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
        var freeCnt = G_UserData.getGachaGoldenHero().getFree_cnt();
        var freeCD = G_UserData.getGachaGoldenHero().getFree_cd();
        var costYuBi = null;
        var [ret, typeIndex, costYuBi] = checkCost(itemNum, freeCnt, freeCD);
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_1',
            yubiCount: costYuBi,
            itemCount: 1
        };
        if(costYuBi<=0)
        {
            this._doGacha(typeIndex);
        }
        else
        {
            UIPopupHelper.popupCostYubiTip(params, handler(this, this._doGacha), typeIndex);
        }
    }
    _onButtonTen() {
        if (this._isPlayAni) {
            return;
        }
        if (this._showTips()) {
            return;
        }
        var checkCost = function () {
            var itemOwnerNum = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
            if (itemOwnerNum >= 10) {
                return [true,0,0];
            } else {
                var yubiNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2);
                var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
                var onceNeedNum = parseInt(Paramter.get(883).content);
                var totalNeedNum = onceNeedNum * 10;
                if (totalNeedNum <= yubiNum) {
                    return [
                        true,
                        totalNeedNum,
                        0
                    ];
                } else {
                    this._toRecharge();
                    return [false,0,0];
                }
            }
        }.bind(this);
        var [ret, costYuBi] = checkCost();
        if (ret == false) {
            return;
        }
        var params = {
            moduleName: 'COST_YUBI_MODULE_NAME_1',
            yubiCount: costYuBi,
            itemCount: 10
        };
        UIPopupHelper.popupCostYubiTip(params, handler(this, this._doGacha), 2);
    }
    _doGacha(typeIndex) {
        G_UserData.getGachaGoldenHero().c2sGacha(typeIndex, this._heroId);
    }
    _onButtonToGet() {
        this._toRecharge();
    }
    _s2cGacha(id, message) {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_RECRUIT);
        var award = (message['awards']) || [];
        if (award && award.length > 0) {
            this._showPanel(false);
            this._palyShowZhaomu(true, award);
        }
        if ((message['free_cnt'])) {
            var freeCnt = (message['free_cnt']) || 5;
            freeCnt = 5 - freeCnt;
            G_UserData.getGachaGoldenHero().setFree_cnt(freeCnt);
        }
        if ((message['free_cd'])) {
            G_UserData.getGachaGoldenHero().setFree_cd((message['free_cd']));
        }
        G_UserData.getGachaGoldenHero().setLuck_draw_num((message['luck_draw_num']) || 0);
        this._initIconImg();

         this._nodeFreeCountdown.removeAllChildren();
        this._nodeFreeDraw.removeAllChildren();
        this._updateDrawFreeDesc();
        this._updateDrawTenDesc();
    }
    _onEventRewadsClose() {
        this._showPanel(true);
        this._effectZhaomu.active = (true);
        this._effectDrawcard.active = (false);
    }
    _onEventUpdateItem() {
        this._updateTotalItem();
    }
    _showPanel(isShow) {
        this._panelRightTop.active = (isShow);
        this._panelBottom.active = (isShow);
        this._goldenBook.node.active = (isShow);
    }
    _palyShowZhaomu(isDraw?, awards?) {
        var effectFunction = function (effect):cc.Node {
            if (effect == 'mingzi') {
                var heroResConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
                var configInfo = heroResConfig.get(this._heroId);
                var mingzi = new cc.Node().addComponent(cc.Sprite);
                mingzi.node.addComponent(CommonUI).loadTexture(Path.getGoldHeroTxt(configInfo.gold_hero_show));
                if (!isDraw) {
                    G_HeroVoiceManager.playVoiceWithHeroId(this._heroId, true);
                }
                return mingzi.node;
            } else if (effect == 'lihui') {
                var view = cc.instantiate(this.goldHeroLayer).getComponent(GoldHeroLayer);
                view.ctor(this._heroId, handler(this, this._updatePageItem));
                view.node.setAnchorPoint(cc.v2(0.5, 0));
                return view.node;
            }
        }.bind(this);
        var eventFunction = function (event) {
            if (event == 'anniu') {
            } else if (event == 'gongxihuode') {
                PopupGetRewards.loadPopupGetRewards(null, function(popup:PopupGetRewards){
                    popup.showDrawCard(awards);
                });
            } else if (event == 'finish') {
                if (!isDraw) {
                    this._showPanel(!isDraw);
                    this._initHuoGuangEffect();
                }
                this._isPlayAni = false;
            }
        }.bind(this);
        this._isPlayAni = true;
        this._effectZhaomu.active = (!isDraw);
        this._effectDrawcard.active = (isDraw);
        if (isDraw) {
            this._effectDrawcard.removeAllChildren();
        }
        var effectNode = isDraw && this._effectDrawcard || this._effectZhaomu;
        var flash = isDraw && 'moving_jinjiangzhaomu_2' || 'moving_jinjiangzhaomu_1';
        G_EffectGfxMgr.createPlayMovingGfx(effectNode, flash, effectFunction, eventFunction, false);
    }

    _initHuoGuangEffect() {
        var effectIndex = 1;
        var selectedFlash = this['_effectHuoyan'].getChildByName('shanguang_effect' + effectIndex);
        if (selectedFlash == null) {
            var lightEffect = G_EffectGfxMgr.createPlayGfx(this._effectHuoyan, GachaGoldenHeroConst.DRAW_HERO_EFFECT[effectIndex-1]);
            lightEffect.node.setAnchorPoint(0, 0);
            lightEffect.play();
            lightEffect.node.name = ('shanguang_effect' + effectIndex);
        }
    }
    _initBtnDesc() {
        this._commonBtnFree.setString(Lang.get('gacha_goldenhero_draw_free'));
        this._commonBtnTen.setString(Lang.get('gacha_goldenhero_draw_ten'));
    }

    _initCountry() {
        var groupIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupIdByCountry(this._currentChooseZhenyin) || {};
        for (var i = 1; i <= 4; i++) {
            (this['_commonCountry' + i] as CommonHeroCountry2).show(false);
        }
        var startIndex = 4 - groupIds.length + 1;
        var i = 1;
        for (var index = startIndex; index <= 4; index++) {
            if (this['_commonCountry' + index]) {
                (this['_commonCountry' + index] as CommonHeroCountry2).show(true);
                (this['_commonCountry' + index] as CommonHeroCountry2).updateHero(index, groupIds[i-1]);
                (this['_commonCountry' + index] as CommonHeroCountry2).addClickEventListenerEx(handler(this, this._touchCountry));
                i = i + 1;
            }
        }
    }
    _touchCountry(sender,flag) {
        if (this._heroId == flag) {
            return;
        }
        var groupIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupIdByCountry(this._currentChooseZhenyin) || [];
        this._selectedPos = flag;
        this._heroId = flag;
        this._effectZhaomu.removeAllChildren();
        this._updateCountry();
        this._palyShowZhaomu();
    }
    _updateCountry() {
        for (var i = 1; i <= 4; i++) {
            this['_commonCountry' + i].showSelected(this._heroId);
        }
    }
    _initSelectedPos(id) {
        this._allHeroIds = G_UserData.getGachaGoldenHero().getGoldHeroGroupIdByCountry(this._currentChooseZhenyin) || [];
        this._selectedPos = this._allHeroIds.indexOf(id);
        this._heroCount = this._allHeroIds.length;
    }
    _updatePageItem(pos) {
        this._selectedPos = pos;
        this._updateCountry();
    }
    _updateDrawFreeDesc() {
        var freeCnt = G_UserData.getGachaGoldenHero().getFree_cnt();
        var freeCD = G_UserData.getGachaGoldenHero().getFree_cd();
        this._imgFreeBg.node.active = (false);
       
        this._imageFreeIcon.node.active = (true);
        var costNum = 0;
        var total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
        if (total == 0) {
            var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            var onceNeedNum = parseInt(Paramter.get(883).content);
            costNum = onceNeedNum;
        } else {
            costNum = 1;
        }
        var oneDrawDescStr = Lang.get('gacha_goldenhero_drawten', { num: costNum });
        var richText1 = this._nodeOneDraw.getChildByName("oneDrawDescStr1");
        if(!richText1)
        {
            richText1 = new cc.Node().addComponent(cc.RichText).node;
            richText1.setAnchorPoint(0, 0.5);
            richText1.name = "oneDrawDescStr1";
            this._nodeOneDraw.addChild(richText1);
        }
        RichTextExtend.setRichTextByFormatString(richText1.getComponent(cc.RichText),oneDrawDescStr, {
            defaultColor: Colors.DARK_BG_THREE,
            defaultSize: 22,
            other: { 1: { fontSize: 22 } }
        });
        
        var descStr = '';
        if (freeCnt > 0) {
            var freeTime = G_ServerTime.getLeftSeconds(freeCD);
            if (freeTime > 0) {
                descStr = Lang.get('gacha_goldenhero_freecountdown', { time: G_ServerTime.secCountToString(freeTime) });
                this._commonBtnFree.setString(Lang.get('gacha_goldenhero_draw_one'));

                var richText2 = this._nodeFreeCountdown.getChildByName("oneDrawDescStr2");
                if(!richText2)
                {
                    richText2 = new cc.Node().addComponent(cc.RichText).node;
                    richText2.name = "oneDrawDescStr2";
                    richText2.setAnchorPoint(0.5, 0.5);
                    this._nodeFreeCountdown.addChild(richText2);
                }
                RichTextExtend.setRichTextByFormatString(richText2.getComponent(cc.RichText),descStr, {
                    defaultColor: Colors.DARK_BG_THREE,
                    defaultSize: 22,
                    other: {1: { fontSize: 22 } }
                });
               
                this._imgFreeBg.node.active = (true);
            } else {
                descStr = Lang.get('gacha_goldenhero_drawfree', { num: freeCnt });
                this._commonBtnFree.setString(Lang.get('gacha_goldenhero_draw_free'));
                var richText3 = this._nodeFreeDraw.getChildByName("oneDrawDescStr3");
                if(!richText3)
                {
                    richText3 = new cc.Node().addComponent(cc.RichText).node;
                    richText3.name = "oneDrawDescStr3";
                    richText3.setAnchorPoint(0.5, 0.5);
                    this._nodeFreeDraw.addChild(richText3);
                }
                RichTextExtend.setRichTextByFormatString(richText3.getComponent(cc.RichText),descStr, {
                    defaultColor: Colors.DARK_BG_THREE,
                    defaultSize: 22,
                    other: { 1: { fontSize: 22 } }
                });
                this._nodeOneDraw.removeAllChildren();
                this._imageFreeIcon.node.active = (false);
            }
        } else {
            this._commonBtnFree.setString(Lang.get('gacha_goldenhero_draw_one'));
            this._nodeFreeDraw.removeAllChildren();
        }
    }
    _updateDrawTenDesc() {
        this._nodeTenDraw.removeAllChildren();
        var costNum = 0;
        var total = UserDataHelper.getNumByTypeAndValue(GachaGoldenHeroConst.ITEM_DATA_TYPE, GachaGoldenHeroConst.ITEM_DATA_VALUE);
        if (total < 10) {
            var Paramter = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER);
            var onceNeedNum = parseInt(Paramter.get(883).content);
            costNum = onceNeedNum * 10;
        } else {
            costNum = 10;
        }
        var richText = RichTextExtend.createRichTextByFormatString(Lang.get('gacha_goldenhero_drawten', { num: costNum }), {
            defaultColor: Colors.DARK_BG_THREE,
            defaultSize: 22,
            other: { [1]: { fontSize: 22 } }
        });
        richText.node.setAnchorPoint(0, 0.5);
        this._nodeTenDraw.addChild(richText.node);
    }
    _updateForward() {
        if (this._btnGoGet.node.active) {
            if (G_ServerTime.getLeftSeconds(G_UserData.getGachaGoldenHero().getEnd_time()) <= 0) {
                this._btnGoGet.node.active = (false);
            }
        }
    }
    _update(dt) {
        this._updateDrawFreeDesc();
        this._updateForward();
    }    

}
