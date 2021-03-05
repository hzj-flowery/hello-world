const { ccclass, property } = cc._decorator;

import { SignalConst } from '../../../const/SignalConst';
import { TerritoryConst } from '../../../const/TerritoryConst';
import { Colors, G_EffectGfxMgr, G_Prompt, G_ServerTime, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonBox from '../../../ui/component/CommonBox';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import PopupTerritoryPatrol from './PopupTerritoryPatrol';
import { TerritoryHelper } from './TerritoryHelper';


@ccclass
export default class TerritoryCityNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContainer: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCity: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _effectNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCity_normal: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCity_gray: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageCityHover: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFightEffect: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon: CommonHeroIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelStateGetAward: cc.Node = null;

    @property({
        type: CommonBox,
        visible: true
    })
    _commonBox: CommonBox = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnAdd: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCityName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageStateBk: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textStateName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageHeroState: cc.Sprite = null;
    _enterTime: number;
    _remainTime: number;
    _stateFunc: {};
    _cityData: any;
    _cityState: any;
    _cityId: any;
    _timeScheduler: any;
    _popupPatrol: any;
    _popupPatrolSignal: any;
    _levelBg: any;
    _level: any;
    _countDown: any;

    onCreate() {
        this._enterTime = G_ServerTime.getTime();
        this._remainTime = this._enterTime + 20;
        this._imageCityHover.node.opacity = (0);
        // this._panelContainer.addTouchEventListenerEx(handler(this, this._onPanelTouched));
        // this._panelContainer.setClickSoundCallback(function () {
        // });
        // this._btnAdd.addClickEventListenerEx(handler(this, this._onPanelClick));
        this._commonBox.addClickEventListenerEx(handler(this, this.onPanelClick));
        // this._btnAdd.setTouchEnabled(true);
        this._stateFunc = {
            [TerritoryConst.STATE_NONE]: handler(this, this._stateNone),
            [TerritoryConst.STATE_LOCK]: handler(this, this._stateLock),
            [TerritoryConst.STATE_FIGHT]: handler(this, this._stateFight),
            [TerritoryConst.STATE_ADD]: handler(this, this._stateAdd),
            [TerritoryConst.STATE_COUNTDOWN]: handler(this, this._stateCountDown),
            [TerritoryConst.STATE_RIOT]: handler(this, this._stateRiot),
            [TerritoryConst.STATE_FINISH]: handler(this, this._stateFinish)
        };

    }
    onEnter() {
    }
    onExit() {
        this.clear();
    }
    reset() {
        this.clear();
        this._stateNone();
        this._cityData = TerritoryHelper.getTerritoryData(this._cityId);
        this._cityState = G_UserData.getTerritory().getTerritoryState(this._cityId) || 0;
        this._commonBox.setParams({});
    }
    showUI(needShow) {
        if (needShow == false) {
            this.node.active = (false);
            return;
        }
        this.node.setScale(0.76);
        this.node.active = (true);
        var scaleTo = cc.scaleTo(0.1, 0.88);
        var scaleTo2 = cc.scaleTo(0.1, 1);
        var callBackAction = cc.callFunc(function () {
            this.node.setScale(1);
        }.bind(this));
        var seq = cc.sequence(scaleTo, scaleTo2, callBackAction);
        this.node.runAction(seq);
    }
    updateUI(index) {
        this._cityId = index;
        this.node.name = ('TerritoryCityNode' + this._cityId);
        this.reset();
        UIHelper.loadTexture(this._imageCity_normal, Path.getChapterIcon(this._cityData.cfg.pic));
        this._imageCity_normal.sizeMode = cc.Sprite.SizeMode.RAW;
        UIHelper.loadTexture(this._imageCity_gray, Path.getChapterIcon(this._cityData.cfg.pic));
        this._imageCity_gray.sizeMode = cc.Sprite.SizeMode.RAW;
        this._effectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, this._cityData.cfg.island_eff, null, null, false);
        //dump(this._cityData.name);
        if (this._stateFunc[this._cityState] != null) {
            this._stateFunc[this._cityState]();
        }
        this._textCityName.string = (this._cityData.name);
    }
    _updateCommonHero() {
        this._commonHeroIcon.node.active = (true);
        this._panelStateGetAward.active = (false);
        var baseId = this._cityData.heroId;
        if (baseId && baseId > 0) {
            var limitLevel = this._cityData.limitLevel
            var limitRedLevel = this._cityData.limitRedLevel
            this._commonHeroIcon.updateUI(baseId, null, limitLevel, limitRedLevel);
        }
    }
    _setNodeVisible(visible, ...nodeList) {
        for (var i in nodeList) {
            var node = nodeList[i];
            if (node) {
                node.active = (visible);
            }
        }
    }
    onPanelClick() {
        //dump(this._cityState);
        if (this._cityState == TerritoryConst.STATE_ADD) {
        }
        if (this._cityState == TerritoryConst.STATE_LOCK) {
            G_Prompt.showTip(this._cityData.lockMsg);
            return;
        }
        if (this._popupPatrol) {
            return;
        }

        var resource = cc.resources.get("prefab/territory/PopupTerritoryPatrol") as cc.Prefab;
        var node1 = cc.instantiate(resource) as cc.Node;
        let cell = node1.getComponent(PopupTerritoryPatrol);
        cell.ctor();
        cell.openWithAction();
        cell.updateUI(this._cityId);
        this._popupPatrol = cell;
        this._popupPatrolSignal = this._popupPatrol.signal.add(handler(this, this._onPopupPatrolClose));
    }
    _onPopupPatrolClose(event) {
        if (event == 'close') {
            this._popupPatrol = null;
            if (this._popupPatrolSignal) {
                this._popupPatrolSignal.remove();
                this._popupPatrolSignal = null;
            }
        }
    }
    onPanelTouched(sender, event) {
        // if (event == ccui.TouchEventType.began) {
        //     this._nodeCity.stopAllActions();
        //     this._nodeCity.setScale(0.9);
        //     if (this._callback) {
        //         this._callback();
        //     }
        //     this._clock = os.clock();
        //     return true;
        // } else if (event == ccui.TouchEventType.ended) {
        //     var action = this.getActionByTag(100);
        //     if (action) {
        //         return;
        //     }
        //     this._nodeCity.stopAllActions();
        //     this._nodeCity.runAction(cc.scaleTo(0.1, 0.7));
        //     var passClock = os.clock() - this._clock;
        //     var waitTime = 0.2 - passClock;
        //     if (waitTime < 0) {
        //         waitTime = 0.5;
        //     }
        //     var delay = cc.delayTime(waitTime);
        //     var sequence = cc.sequence(delay, cc.callFunc(handler(this, this._onPanelClick)));
        //     sequence.setTag(100);
        //     this.runAction(sequence);
        // } else if (event == ccui.TouchEventType.canceled) {
        //     this._nodeCity.stopAllActions();
        //     this._nodeCity.runAction(cc.scaleTo(0.1, 0.7));
        // }
    }
    clear() {
        this._stopCountDown();
    }
    _updateCountDown(dt?) {
        var remainTime = this._cityData.endTime;
        var cityId = this._cityId;
        var timeString = '00:00:00';
        if (remainTime > 0) {
            timeString = G_ServerTime.getLeftSecondsString(remainTime);
        }
        if (remainTime < G_ServerTime.getTime()) {
            //logWarn('TerritoryCityNode:_updateCountDown enter finish');
            G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, null);
            return;
        }
        var pendingStr = '';
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN || this._cityState == TerritoryConst.STATE_RIOT) {
            this._textStateName.node.color = (new cc.Color(255, 184, 12));
            pendingStr = Lang.get('lang_territory_countDown');
            if (this._cityState == TerritoryConst.STATE_COUNTDOWN) {
                if (TerritoryHelper.isRoitState(this._cityId) == true) {
                    G_SignalManager.dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, null);
                    return;
                }
            }
        }
        this._imageStateBk.node.active = (true);
        this._textStateName.string = (pendingStr + (' ' + timeString));
    }
    _startCountDown() {
        this._timeScheduler = this.schedule(this._updateCountDown, 0.5);
        this._updateCountDown();
    }
    _stopCountDown() {
        this.unschedule(this._updateCountDown);
    }
    _showStateAnimation() {
        if (this._cityState == TerritoryConst.STATE_RIOT) {
            var bg = this._commonHeroIcon;
            var delay = cc.delayTime(0.2);
            var scaleB = cc.scaleTo(0.3, 1.2);
            scaleB.easing(cc.easeBackIn());
            var scaleS = cc.scaleTo(0.3, 1);
            scaleS.easing(cc.easeBackOut());
            var call = cc.callFunc(function () {
                var scalebB = cc.scaleTo(0.7, 1.1);
                var scalebS = cc.scaleTo(0.7, 1);
                var forever = cc.repeatForever(cc.sequence(scalebB, scalebS));
                bg.node.runAction(forever);
            }.bind(this));
            var seq = cc.sequence(delay, scaleB, scaleS, call);
            bg.node.stopAllActions();
            bg.node.setScale(0);
            bg.node.runAction(seq);
        }
    }
    _stateNone() {
        console.log('TerritoryCityNode:_stateNone');
        this._nodeFightEffect.removeAllChildren();
        this._setNodeVisible(true, this._textStateName.node, this._levelBg, this._level);
        this._setNodeVisible(false, this._imageHeroState.node, this._imageLock.node, this._commonHeroIcon.node, this._nodeFightEffect, this._panelStateGetAward, this._imageStateBk.node, this._btnAdd.node);
        this._commonHeroIcon.node.active = (false);
        this._commonHeroIcon.node.stopAllActions();
        this._imageCity_gray.node.active = (false);
        this._imageCity_normal.node.active = (true);
        this._effectNode.active = (true);
        // ShaderHelper.filterNode(this._imageCity, '', true);
        // this._imageCity.setState(0);
        this._textCityName.node.color = (Colors.TERRITRY_CITY_NAME);
    }
    _stateLock() {
        console.log('TerritoryCityNode:_stateLock');
        this._setNodeVisible(true, this._imageStateBk.node, this._textStateName, this._levelBg, this._level);
        this._setNodeVisible(false, this._imageHeroState.node, this._imageLock.node, this._nodeFightEffect, this._panelStateGetAward, this._btnAdd.node);
        this._textStateName.node.color = (Colors.DRAK_TEXT);
        this._textStateName.string = (Lang.get('lang_territory_state_none'));
        // ShaderHelper.filterNode(this._imageCity, 'gray');
        // this._imageCity.setState(1);
        // var material = cc.Material.getInstantiatedBuiltinMaterial("2d-gray-sprite", this.node) //creator自带的 builtin-2d-gray-sprite
        // this.node.getComponent(cc.Sprite).setMaterial(0, material)
        this._imageCity_gray.node.active = (true);
        this._imageCity_normal.node.active = (false);

        // this._imageCity.node.active = (true);
        this._effectNode.active = (false);
        this._textCityName.node.color = (Colors.TERRITRY_CITY_NAME_DRAK);
    }
    _createSwordEft() {
        function effectFunction(effect) {
            if (effect == 'effect_shuangjian') {
                var subEffect = new cc.Node();
                G_EffectGfxMgr.createPlayGfx(subEffect, "effect_shuangjian");
                return subEffect;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFightEffect, 'moving_shuangjian', effectFunction, null, false);
    }
    _stateFight() {
        console.log('TerritoryCityNode:_stateFight');
        this._setNodeVisible(true, this._nodeFightEffect);
        this._setNodeVisible(true, this._imageStateBk.node, this._textStateName, this._levelBg, this._level);
        this._setNodeVisible(false, this._imageHeroState.node, this._imageLock.node, this._panelStateGetAward, this._btnAdd.node);
        this._createSwordEft();
        // this._imageCity.node.active = (true);
        this._textStateName.node.color = (Colors.SYSTEM_TIP);
        this._textStateName.string = (Lang.get('lang_territory_state_fight'));
    }
    _stateAdd() {
        console.log('TerritoryCityNode:_stateAdd');
        this._setNodeVisible(true, this._imageStateBk.node, this._textStateName, this._levelBg, this._level, this._btnAdd.node);
        this._setNodeVisible(false, this._imageHeroState.node, this._imageLock.node, this._panelStateGetAward, this._nodeFightEffect);
        this._textStateName.node.color = (Colors.SYSTEM_TIP);
        this._textStateName.string = (Lang.get('lang_territory_state_add'));
    }
    _stateCountDown() {
        console.log('TerritoryCityNode:_stateCountDown');
        this._setNodeVisible(true, this._imageStateBk.node, this._imageHeroState.node, this._textStateName, this._levelBg, this._level, this._countDown);
        this._setNodeVisible(false, this._imageLock.node, this._panelStateGetAward, this._nodeFightEffect, this._btnAdd.node);
        this._updateCommonHero();
        this._startCountDown();
        UIHelper.loadTexture(this._imageHeroState, Path.getTextSignet('txt_xunluozhong01'));
    }
    _stateRiot() {
        console.log('TerritoryCityNode:_stateRiot');
        this._setNodeVisible(true, this._textStateName, this._levelBg, this._level, this._imageStateBk.node, this._panelStateGetAward);
        this._setNodeVisible(false, this._imageHeroState.node, this._imageLock.node, this._nodeFightEffect, this._btnAdd.node);
        var [eventId, riotEvent] = G_UserData.getTerritory().getFirstRiotId(this._cityId);
        if (riotEvent) {
            var eventState = TerritoryHelper.getRiotEventState(riotEvent);
            if (eventState != TerritoryConst.RIOT_HELP) {
                UIHelper.loadTexture(this._imageHeroState, Path.getTextSignet('txt_yiqiuzhu01'));
                this._imageHeroState.node.active = (true);
            }
        }
        this._startCountDown();
        this._updateCommonHero();
        this._showStateAnimation();
    }
    _stateFinish() {
        console.log('TerritoryCityNode:_stateFinish');
        this._setNodeVisible(true, this._textStateName, this._levelBg, this._level, this._imageStateBk.node, this._panelStateGetAward);
        this._setNodeVisible(false, this._commonHeroIcon.node, this._imageLock.node, this._nodeFightEffect, this._btnAdd.node, this._countDown);
        this._commonHeroIcon.node.active = (false);
        if (this._cityState == TerritoryConst.STATE_FINISH) {
            this._commonBox.playBoxJump();
            this._textStateName.node.color = (new cc.Color(168, 255, 0));
            this._textStateName.string = (Lang.get('lang_territory_finish'));
        }
    }

}