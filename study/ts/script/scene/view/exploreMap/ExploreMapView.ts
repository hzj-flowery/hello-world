
import { AudioConst } from '../../../const/AudioConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { DataConst } from '../../../const/DataConst';
import { ExploreConst } from '../../../const/ExploreConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { ExploreBaseData } from '../../../data/ExploreBaseData';
import EffectGfxMoving from '../../../effect/EffectGfxMoving';
import { G_AudioManager, G_ConfigLoader, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_TutorialManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { EffectGfxType } from '../../../manager/EffectGfxManager';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { SpineNode } from '../../../ui/node/SpineNode';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import BigImagesNode from '../../../utils/BigImagesNode';
import { Color } from '../../../utils/Color';
import { Slot } from '../../../utils/event/Slot';
import { handler } from '../../../utils/handler';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { UserCheck } from '../../../utils/logic/UserCheck';
import { Path } from '../../../utils/Path';
import ResourceLoader, { ResourceData } from '../../../utils/resource/ResourceLoader';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import { Util } from '../../../utils/Util';
import ViewBase from '../../ViewBase';
import { ExploreResCfg } from '../exploreMain/ExploreResCfg';
import ExploreGainEft from './ExploreGainEft';
import { ExploreMapHelper } from './ExploreMapHelper';
import { ExploreMapLayer } from './ExploreMapLayer';
import ExploreMapViewIcons from './ExploreMapViewIcons';
import ALDStatistics from '../../../utils/ALDStatistics';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExploreMapView extends ViewBase {

    public static waitEnterMsg(callback: Function) {
        //moving_chufaqiyu

        var exploreId = G_SceneManager.getViewArgs('exploreMap')[0];
        var data: ExploreBaseData = G_UserData.getExplore().getExploreById(exploreId);
        var mapId = data.getMap_id();
        var mapInfo = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_MAP).get(mapId);
        var sbgPath: string = 'ui3/stage/' + mapInfo.map_size;
        var resArr: ResourceData[] = ExploreResCfg.MapResArr.concat([{ path: sbgPath, type: cc.JsonAsset }]);

        var mapEvents = data.getEvents();
        for (var i: number = 0, n: number = mapEvents.length; i < n; i++) {
            var eventType: number = mapEvents[i];
            if (!eventType == null || eventType == 0) continue;
            if (!ExploreMapHelper.isExploreTreasure(eventType)) continue;
            var treasurePath: string = ExploreMapHelper._getExploreTreasureIconInfo(exploreId, eventType).treasureIconPath;
            resArr.push({
                path: treasurePath,
                type: cc.SpriteFrame
            });
        }


        ResourceLoader.loadResArrayWithType(resArr, (err, resoure) => {
            var arr: string[] = BigImagesNode.getImages(Path.getStageBG(mapInfo.map_size));
            cc.resources.load(arr, cc.SpriteFrame, (err1, resoure1) => {
                G_EffectGfxMgr.loadEffectGfxList([{
                    type: EffectGfxType.MovingGfx,
                    name: "moving_chufaqiyu"
                }], () => {
                    callback && callback();
                });
            });
        });
    }

    static MAX_ROLL_TIME = 99999;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollMap: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _particleNode: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnRoll: cc.Button = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCheckbox: cc.Node = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBox: cc.Toggle = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTips: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _openTips: cc.Label = null;

    @property({
        type: cc.Toggle,
        visible: true
    })
    _checkBoxOneKey: cc.Toggle = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _openTipsOneKey: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _expProgress: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _exploreProgress: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelEffect: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    private _eventIconListView: cc.ScrollView = null;

    private _eventsCnt: number = 0;
    private _isDoingEvent: boolean;
    private _doEventType: number;

    private _eventIcons: ExploreMapViewIcons;

    private _data: ExploreBaseData;
    private _mapLayer: ExploreMapLayer;

    private _signalRollExplore: Slot;
    private _signalGetReward: Slot;
    private _isFirstOnEnter: boolean = true;
    private _actionsQueue: any[] = [];
    private _canDoDice: boolean = true;
    private _isPlayAction: boolean = false;
    private _exploreGainEft: ExploreGainEft;
    private _diceEffect: SpineNode;
    private _finishExplore: boolean = false;
    private _baseAwards: any[] = [];
    private _crit: number;
    private _diceNum: number = 0;
    private _moveFinishTutorialStepCount: number = 0;
    private _remainCount: number = 0;
    private _additionAward: any[] = [];
    private _popupSignal: Slot;
    private _checkBoxOrignalPos: cc.Vec3;
    private _isExplorePass: boolean;
    private _nodeEffect: cc.Node;

    private qiyuEffect: EffectGfxMoving;

    protected onCreate() {
        this.setSceneSize();
    }
    protected onEnter() { }
    protected onExit() { }

    start() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_EXPLORE);

        var exploreId = G_SceneManager.getViewArgs('exploreMap')[0];
        this._data = G_UserData.getExplore().getExploreById(exploreId);

        this._actionsQueue = [];
        this._checkBoxOrignalPos = this._checkBox.node.position.clone();
        this._topBar.setTitle(this._data.getConfigData().name, 40, Color.DARK_BG_THREE, Color.DARK_BG_OUTLINE);
        this._topBar.updateUI(TopBarStyleConst.STYLE_EXPLORE);
        // this._topBar.setCallBackOnBack(this._onClickBack.bind(this));
        this._topBar.resumeUpdate();

        this._mapLayer = this._scrollMap.content.addComponent(ExploreMapLayer);
        this._mapLayer.setUp(this._scrollMap, this._data);
        this._addParticle();
        this._panelEffect.active = false;

        this._nodeEffect = new cc.Node();
        this._nodeEffect.setPosition(0, 0);
        this._nodeEffect.setAnchorPoint(0, 0);
        this.node.addChild(this._nodeEffect);

        this._isExplorePass = G_UserData.getExplore().isExplorePass(this._data.getId());
        var pos = this._eventIconListView.node.getPosition();
        this._eventIconListView.node.setPosition(pos.x + G_ResolutionManager.getBangOffset(), pos.y);
        this._eventIcons = new cc.Node().addComponent(ExploreMapViewIcons);
        this._eventIcons.setUp(this, this._eventIconListView);
        this._signalRollExplore = G_SignalManager.add(SignalConst.EVENT_EXPLORE_ROLL, handler(this, this._onEventRollExplore));
        this._signalGetReward = G_SignalManager.add(SignalConst.EVENT_EXPLORE_GET_REWARD, handler(this, this._onEventGetReward));
        this._setCheckBoxState();
        this._reset();
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
        this._checkBox.node.on(cc.Node.EventType.TOUCH_END, this.onClickCheckBox, this);
        this._checkBoxOneKey.node.on(cc.Node.EventType.TOUCH_END, this.onClickCheckBoxOneKey, this);
    }

    _onClickBack() {
        G_SceneManager.popScene();
        // G_SceneManager.showScene('exploreMain');
    }

    onDestroy() {
        if (this.qiyuEffect && this.qiyuEffect.node && this.qiyuEffect.node.isValid) {
            this.qiyuEffect.node.destroy();
        }
        this._signalRollExplore.remove();
        this._signalRollExplore = null;
        this._signalGetReward.remove();
        this._signalGetReward = null;
        this.unscheduleAllCallbacks();
        G_Prompt.clearTips();
    }
    _addParticle() {
        var particleName = this._data.getConfigData().fly;
        if (particleName && particleName != '') {
            // var emitter = cc.ParticleSystemQuad.create(Path.getParticle(particleName));
            // if (emitter) {
            //     this._particleNode.addChild(emitter);
            //     emitter.resetSystem();
            // }
        }
    }
    _reset() {
        this.node.stopAllActions();
        this.destroyQiyuEffect();
        this.createNewQiyuEffect();
        this._nodeEffect.stopAllActions();
        this._nodeEffect.removeAllChildren();

        this._actionsQueue.splice(0, this._actionsQueue.length);
        this._canDoDice = true;
        this._isPlayAction = false;
        this._data = G_UserData.getExplore().getExploreById(this._data.getId());
        this._mapLayer.createMap(this._data, !this._isExplorePass);
        this._mapLayer.resetStatus();
        this._createGainEft();
        this._createDiceEffect();
        // this._setCheckBoxState();
        this._checkEnd();
        this._refreshUI();
        this._eventIcons.initDataAndUI();
        this._nextDice();
        if (this._finishExplore) return;
        this.pushAction(() => {
            this._eventIcons.runFirstOnEnterAction(() => {
                if (this._eventIcons.getCurVisibelIconsNum() > 0) {
                    this._eventIconAppearForGuide();
                }
                this.nextAction();
            });
        });
    }
    _createGainEft() {
        if (this._exploreGainEft) {
            this._exploreGainEft.node.destroy();
            this._exploreGainEft = null;
        }
        var gainNode: cc.Node = new cc.Node();
        gainNode.setAnchorPoint(0.5, 0.5);
        this._exploreGainEft = gainNode.addComponent(ExploreGainEft);
        this._exploreGainEft.node.setPosition(0, 100);
        this.node.addChild(gainNode);
    }
    _createDiceEffect() {
        if (this._diceEffect) {
            this._diceEffect.resetSkeletonPose();
            this._diceEffect.destroy();
            this._diceEffect = null;
        }
        this._diceEffect = SpineNode.create();
        this._diceEffect.setAsset(Path.getEffectSpine('ui101'));
        this._diceEffect.node.active = false;
        this.node.addChild(this._diceEffect.node);
        this._diceEffect.node.setPosition(0, 0);
        this._diceEffect.signalComplet.add((...value) => {
            this._onDiceFinish();
        });
    }
    _checkEnd() {
        var reward = this._data.getAward();
        if ((reward && reward.length != 0) || this._mapLayer.isActorRunEnd()) {
            this._finishExplore = true;
        }
    }
    _refreshUI() {
        this._refreshBoxPercent();
    }
    _refreshBoxPercent() {
        var percent: number = this._mapLayer.getPercent();
        this._exploreProgress.string = percent + '%';
        var userBase = G_UserData.getBase();
        var exp = userBase.getExp();
        var roleData = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(userBase.getLevel());
        if (roleData) {
            percent = Math.min(100, Math.floor(exp / roleData.exp * 100));
            this._expProgress.string = percent + '%';
        }
    }
    _onDiceFinish() {
        this._diceEffect.node.active = false;
        this._exploreGainEft.startEffect(this._baseAwards, this._crit, handler(this, this._finishTextSummary));
        this._mapLayer.moveForward(this._diceNum, handler(this, this._moveFinish));
    }
    _moveFinish() {

        if (G_TutorialManager.isDoingStep(18) || G_TutorialManager.isDoingStep(19)) {
            if (this._moveFinishTutorialStepCount == 0) {
                this._moveFinishTutorialStepCount = this._moveFinishTutorialStepCount + 1;
                G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ExploreMapView:_moveFinish');
            }
        }

        this._refreshUI();

        if (this._finishExplore) {
            this._procExploreOver();
        } else {
            var levelUp = UserCheck.isLevelUp(handler(this, this._checkAdditionAward));
            if (levelUp && levelUp[0]) {
                this._setCheckBoxState();
                this._onFinishMultiple();
            }
        }
    }
    _procExploreOver() {
        this._remainCount = 0;
        this._mapLayer.hidePassBox();
        G_Prompt.showTip(Lang.get('exploer_finish'), handler(this, this._getBoxReward));
    }
    _setCheckBoxState() {
        var arr = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EXPLORE_ROLL_TEN);
        var isOpen = arr[0];
        if (isOpen) {
            this._checkBox.isChecked = (G_UserData.getExplore().getAutoExplore() == ExploreConst.EXPLORE_AUTO);
            this._checkBox.interactable = true;
            this._openTips.string = Lang.get('explore_opened_multiple_tips');
        } else {
            var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_EXPLORE_ROLL_TEN);
            this._checkBox.isChecked = false;
            this._checkBox.interactable = false;
            this._openTips.string = Lang.get('explore_open_multiple_level_tips', { level: funcLevelInfo.level });
        }
        arr = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EXPLORE_ROLL_ONE_KEY);
        var oneKeyOpen = arr[0];
        if (oneKeyOpen) {
            this._checkBoxOneKey.isChecked = G_UserData.getExplore().getAutoExplore() == ExploreConst.EXPLORE_ONE_KEY;
            this._openTipsOneKey.string = Lang.get('explore_opened_one_key_tips');
        } else {
            var funcLevelInfo = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL).get(FunctionConst.FUNC_EXPLORE_ROLL_ONE_KEY);
            this._checkBoxOneKey.isChecked = false;
            this._checkBoxOneKey.interactable = false;
            this._openTipsOneKey.string = Lang.get('explore_open_one_key_tips', { level: funcLevelInfo.level });
            this._checkBoxOneKey.node.active = false;
            this._checkBox.node.setPosition(this._checkBoxOrignalPos.x, (this._checkBoxOrignalPos.y + this._checkBoxOneKey.node.position.y) / 2);
        }
        this._checkBoxOneKey.node.active = oneKeyOpen;
    }
    onClickCheckBox() {
        var event: number = this._checkBox.isChecked ? ExploreConst.EXPLORE_AUTO : 0;
        G_UserData.getExplore().setAutoExplore(event);
        this._checkBoxOneKey.isChecked = false;
        if (!this._checkBox.isChecked) {
            if (this._remainCount > 0) {
                this._onFinishMultiple();
            }
        }
    }
    onClickCheckBoxOneKey() {
        var event: number = this._checkBoxOneKey.isChecked ? ExploreConst.EXPLORE_ONE_KEY : 0;
        G_UserData.getExplore().setAutoExplore(event);
        this._checkBox.isChecked = false;
        if (!this._checkBoxOneKey.isChecked) {
            if (this._remainCount > 0) {
                this._onFinishMultiple();
            }
        }
    }
    onBtnRoll() {
        if (this._finishExplore) return;
        if (this._remainCount > 0) {
            this._onFinishMultiple();
        } else {
            if (this._isAutoExplore()) {
                this._onBeginMultiple();
            } else if (this._isOneKeyExplore()) {
                UIPopupHelper.popupConfirm(Lang.get('explore_one_key_confirm'), () => {
                    this._onBeginMultiple();
                });
            } else {
                this._onDice();
            }
        }
    }
    _onDice() {
        if (!this._canDoDice) {
            this._onFinishMultiple();
            return;
        }
        var reward = this._data.getAward();
        if (reward.length != 0) {
            this._onFinishMultiple();
            return;
        }
        var arr = UserCheck.isPackFull(TypeConvertHelper.TYPE_TREASURE);
        if (arr[0]) {
            this._onFinishMultiple();
            return;
        }
        var configData = this._data.getConfigData();
        var needSprit = configData.roll_size;
        var suc = UserCheck.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_SPIRIT, needSprit);
        if (!suc) {
            this._onFinishMultiple();
            return;
        }
        G_UserData.getExplore().c2sRollExplore(this._data.getId());
    }
    _nextDice() {
        this._panelEffect.active = false;
        if (this._finishExplore) {
            this._procExploreOver();
            return;
        }
        this._canDoDice = true;
        if (this._remainCount > 0) {
            this._remainCount = this._remainCount - 1;
            this._onDice();
        }
        if (this._remainCount == 0) {
            this._onFinishMultiple();
        }
    }

    private isBeginTexture: boolean = true;
    _onBeginMultiple() {
        console.log('开始');
        this._remainCount = ExploreMapView.MAX_ROLL_TIME - 1;
        this._mapLayer.setActorAutoExploreWord(true);
        if (!this.isBeginTexture) return;
        this.isBeginTexture = false;
        var btnSprite: cc.Sprite = this._btnRoll.node.getComponent(cc.Sprite);
        btnSprite.spriteFrame = cc.resources.get(Path.getExploreImage('txt_youli_tingzhi01'), cc.SpriteFrame);
        this._onDice();
    }
    _onFinishMultiple() {
        console.log('结束');
        this._remainCount = 0;
        this._mapLayer.setActorAutoExploreWord(false);
        if (this.isBeginTexture) return;
        this.isBeginTexture = true;
        var btnSprite: cc.Sprite = this._btnRoll.node.getComponent(cc.Sprite);
        btnSprite.spriteFrame = cc.resources.get(Path.getExploreImage('txt_youli_kaishi01'), cc.SpriteFrame);
    }
    _onEventRollExplore(eventName, message) {
        // message = message[0];
        var num = message.num;
        var diceEffectNum = num;
        var endDis: number = this._mapLayer.getRunEndDis();
        if (endDis <= num) {
            num = endDis;
            this._finishExplore = true;
            diceEffectNum = Math.floor(Math.randInt() * (7 - num)) + num;
        }
        this._startDiceAnim(num, diceEffectNum);
        this._baseAwards = [];
        this._crit = 1;
        if (message['base_award']) {
            for (var i in message.base_award) {
                var v = message.base_award[i];
                var award = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                this._baseAwards.push(award);
            }
            this._baseAwards.sort((a, b) => {
                if (a.value > b.value) return 1;
                if (a.value == b.value) return 0;
                return -1;
            })
        }
        if (message['crit']) {
            this._crit = message.crit;
        }
        this._additionAward.splice(0, this._additionAward.length);
        if (message['box_award']) {
            for (i in message.box_award) {
                var v = message.box_award[i];
                var award = {
                    type: v.type,
                    value: v.value,
                    size: v.size
                };
                this._additionAward.push(award);
            }
        }
    }
    _startDiceAnim(diceNum, diceEffectNum) {
        this._diceNum = diceNum;
        this._canDoDice = false;
        this._mapLayer.jumpMap();
        this._diceEffect.getSpine().premultipliedAlpha = false;
        this._diceEffect.node.active = true;
        this._diceEffect.setAnimation('dice' + diceEffectNum, false);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_EXPLORE_DICE, null);
    }
    _exploreOver() {
        this._data.clearRollNum();
        if (!this._isExplorePass) {
            G_UserData.getExplore().setFirstPassCity(this._data.getId());
        }
        var levelUp = UserCheck.isLevelUp((showLevelUp) => {
            if (G_TutorialManager.isDoingStep() == true && showLevelUp) {
            }
            else if (this._isOneKeyExplore()) {
                this._isExplorePass = G_UserData.getExplore().isExplorePass(this._data.getId());
                this._finishExplore = false;
                this._scrollMap.content.setPosition(0, 0);
                this._reset();
                this._onBeginMultiple();
            } else {
                console.log('explore end');
                this._onClickBack();
            }
        });
    }
    _finishTextSummary() {
        console.log('_finishTextSummary');
    }
    _checkAdditionAward() {
        console.log('弹出奖励>>>>', this._additionAward.length);
        if (this._additionAward.length == 0) {
            this._checkEventTrigger();
        }
        else {
            G_Prompt.showAwards(this._additionAward || []);
            this._finishGetEft();
        }

    }
    _finishGetEft() {
        var action1 = cc.delayTime(0.3);
        var action2 = cc.callFunc(() => {
            this._nextDice();
            this._mapLayer.hideCurPosIcon();
        });
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }
    _checkEventTrigger() {
        var eventType = this._mapLayer.getCurPosEventType();
        if (eventType != 0) {
            if (this._mapLayer.isCurPosTreasure()) {
                this._nextDice();
            } else {
                this._playEventEffect(eventType);
            }
            this._mapLayer.hideCurPosIcon();
        } else {
            this._nextDice();
        }
    }
    _playEventEffect(type) {
        //   this._canDoDice = true;
        this._isDoingEvent = true;
        this._eventsCnt++;
        this._doEventType = type;
        //   this.scheduleOnce(handler(this, this.checkStuck, this._eventsCnt), 5);
        this.pushAction(() => {
            this._createEventEffectFunc(type);
        });
    }

    checkStuck(arg) {
        if (this._isDoingEvent && this._eventsCnt == arg[0] && this._remainCount > 0) {
            // this._nextDice();
            ALDStatistics.instance.aldSendEvent('游历卡住', { "type": this._doEventType });
        }
    }

    _createEventEffectFunc(type) {
        this._eventIcons.updateEventIconsDataByType(type);
        this._eventIcons.checkIconInVisibleViewPort(type, () => {
        });
        // this._panelEffect.active = true;
        var discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(type);

        this._nodeEffect.setPosition(0, 0);
        this._nodeEffect.setScale(1);

        // this._nodeEffect.addChild(this.qiyuEffect.node);
        // this.qiyuEffect.setHandler((effect) => {
        //     return this._effectFunction(discoverData, effect);
        // }, (event) => {
        //     this._eventFunction(event, type);
        // });
        // this.qiyuEffect.node.active = true;
        // this.qiyuEffect.play();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_chufaqiyu', (effect) => {
            return this._effectFunction(discoverData, effect);
        }, (event) => {
            this._eventFunction(event, type);
        }, true);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_EXPLORE_EVENT, null);
    }

    _effectFunction(discoverData, effect: string) {
        if (effect == 'tubiao') {
            var spriteName = Path.getExploreIconImage(discoverData.res_id2 + '_icon');
            var image = Util.newSprite(spriteName);
            return image.node;
        } else if (effect == 'mingzi') {
            console.log('奇遇名字:  ', discoverData.name);
            var labelName: cc.Label = UIHelper.createLabel({ fontSize: 22 }).getComponent(cc.Label);
            // labelName.name = '\u3010' + discoverData.name + '\u3011';
            labelName.string = discoverData.name;
            var colorArr = Color.getFTypeColor();
            labelName.node.color = colorArr[0];
            UIHelper.enableOutline(labelName, colorArr[1], 2);
            return labelName.node;
        }
    }

    private _eventFunction(event, type) {
        if (event == 'finish') {
            this._addEventIcons(type);
        } else if (event == 'beijing') {
            this._panelEffect.active = false;
        }
    }

    _addEventIcons(eventType) {
        //assert((eventType != null, 'eventType == nil');
        var targetPosV3 = this._eventIcons.getIconWorldPosByType(eventType);
        //assert((targetPosV3 != null, 'targetPosV3 == nil');
        var parent = this._nodeEffect.getParent();
        var targetPos = parent.convertToNodeSpaceAR(targetPosV3);
        var time = Math.sqrt(targetPos.x * targetPos.x + targetPos.y * targetPos.y) / 2500;
        console.log('奇遇动画结束: ', this._nodeEffect.position, targetPos, time);
        var moveToAction: cc.ActionInterval = cc.moveTo(time, targetPos.x, targetPos.y);
        var sclaeToAction = cc.scaleTo(time, 0.3);
        var spawnAction = cc.spawn(moveToAction, sclaeToAction);
        var callFuncAction = cc.callFunc(() => {
            this.destroyQiyuEffect();
            this.createNewQiyuEffect();
            this._nodeEffect.removeAllChildren();
            this._eventIcons.doLayout(eventType, () => {
                this._eventIconAppearForGuide();
                this._isDoingEvent = false;
                this._nextDice();
                this.nextAction();
            });
        });
        var seqAction = cc.sequence(spawnAction, callFuncAction);
        this._nodeEffect.runAction(seqAction);

        // this._nodeEffect.runAction(cc.moveBy(0.4, -500, 0));
    }
    _getBoxReward() {
        this._finishExplore = true;
        G_UserData.getExplore().c2sExploreGetReward(this._data.getId());
    }
    _getExplorePassAwards() {
        var passAwards = [];
        var configData = this._data.getConfigData();
        if (this._isExplorePass) {
            for (var i = 1; i <= 3; i++) {
                var award = {
                    type: configData['reward' + (i + '_type')],
                    value: configData['reward' + (i + '_resource')],
                    size: configData['reward' + (i + '_size')]
                };
                if (award.type && award.type != 0) {
                    passAwards.push(award);
                }
            }
        } else {
            for (var i = 1; i <= 3; i++) {
                var award = {
                    type: configData['first' + (i + '_type')],
                    value: configData['first' + (i + '_resource')],
                    size: configData['first' + (i + '_size')]
                };
                if (award.type && award.type != 0) {
                    passAwards.push(award);
                }
            }
        }
        return passAwards;
    }
    _onEventGetReward(eventName, message) {
        console.log(eventName, message);

        var title = '';
        var titlePath = '';
        if (this._isExplorePass) {
            title = Lang.get('explore_box_title_normal');
            titlePath = Path.getSystemImage('txt_sys_tongguanbaoxiang');
        } else {
            title = Lang.get('explore_box_title_first');
            titlePath = Path.getSystemImage('txt_sys_shoutongbaoxiang');
        }
        var awards = this._getExplorePassAwards();
        PopupGetRewards.popupReward(awards, title, null, handler(this, this._exploreOver), titlePath, (popupGetRewards: PopupGetRewards) => {
            if (this._isOneKeyExplore()) {
                this._popupSignal = popupGetRewards.signal.add((event) => {
                    if (event == 'anim') {
                        popupGetRewards.close();
                    } else if (event == 'close') {
                        if (this._popupSignal) {
                            this._popupSignal.remove();
                            this._popupSignal = null;
                        }
                    }
                });
            }
        });

        // popupGetRewards.show(awards, title, null, handler(this, this._exploreOver), titlePath);
    }

    pushAction(func) {
        this._actionsQueue.push(func);
        if (this._isPlayAction) return;
        this._isPlayAction = true;
        this.nextAction();
    }
    nextAction() {
        var func = this._actionsQueue.pop();
        if (!func) {
            this._isPlayAction = false;
            return;
        }
        func();
    }
    _eventIconAppearForGuide() {
        if (G_TutorialManager.isDoingStep(18) || G_TutorialManager.isDoingStep(19)) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, 'ExploreMapView:_eventIconAppearForGuide');
        }
    }
    _isAutoExplore() {
        var isCheck = this._checkBox.isChecked;
        var isEnable = this._checkBox.interactable;
        return isCheck && isEnable;
    }
    _isOneKeyExplore() {
        var isCheck = this._checkBoxOneKey.isChecked;
        var isEnable = this._checkBoxOneKey.interactable;
        return isCheck && isEnable;
    }

    private destroyQiyuEffect(): void {
        if (!this.qiyuEffect) return;
        this.qiyuEffect.node.destroy();
        this.qiyuEffect = null;
    }

    private createNewQiyuEffect(): void {
        // this.qiyuEffect = G_EffectGfxMgr.loadPlayMovingGfx('moving_chufaqiyu');
    }

}