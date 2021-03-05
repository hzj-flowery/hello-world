import { TerritoryConst } from "../../../const/TerritoryConst";
import { Colors, G_EffectGfxMgr, G_Prompt, G_ServerTime, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonBox from "../../../ui/component/CommonBox";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import PopupChooseHeroHelper from "../../../ui/popup/PopupChooseHeroHelper";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";
import { Util } from "../../../utils/Util";
import { TerritoryHelper } from "./TerritoryHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTerritoryOneKeyCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;
    @property({
        type: cc.Button,
        visible: true
    }) _btnAdd: cc.Button = null;
    @property({
        type: cc.Node,
        visible: true
    }) _effectNode: cc.Node = null;
    @property({
        type: CommonBox,
        visible: true
    }) _commonBox: CommonBox = null;
    @property({
        type: cc.Node,
        visible: true
    }) _nodeFightEffect: cc.Node = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    }) _commonHeroIcon: CommonHeroIcon = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imageHeroState: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imageStateBk: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imageCity: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    }) _textStateName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    }) _txtCityName: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    }) _panelStateGetAward: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    }) _nodeCheckCon: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    }) _costResNum1: cc.Label = null;
    @property({
        type: cc.Toggle,
        visible: true
    }) _checkBox1: cc.Toggle = null;
    @property({
        type: cc.Toggle,
        visible: true
    }) _checkBox2: cc.Toggle = null;
    @property({
        type: cc.Toggle,
        visible: true
    }) _checkBox3: cc.Toggle = null;
    @property({
        type: cc.Label,
        visible: true
    }) _checkBoxText1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    }) _checkBoxText2: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    }) _checkBoxText3: cc.Label = null;
    private _cityId: any;
    private _parentView: any;
    private _checkIndex: any;
    private _cityState: any;
    private _stateFunc: { 0: any; 1: any; 2: any; 3: any; 4: any; 5: any; 6: any; };
    private _cityData: any;
    private _popupPatrol: any;
    private _popupPatrolSignal: any;
    private _timeScheduler: any;
    ctor(index, parentView) {
        this._cityId = index;
        this._parentView = parentView;
    }
    _onCheckBox(sender) {
        this._checkIndex = sender.target.name;
        this._updatePatrolInfo(Number(this._checkIndex));
    }
    _getPatrolCheckIndex() {
        for (var i = 1; i <= 3; i++) {
            var isCheck = this['_checkBox' + i].isChecked;
            if (isCheck == true) {
                return i;
            }
        }
        return 0;
    }
    getOneKeyParam() {
        if (this._cityState == TerritoryConst.STATE_ADD) {
            var info = G_UserData.getTerritory().getCurPatrolList()[this._cityId];
            var heroId = info[0];
            if (heroId && heroId > 0) {
                var checkIndex = this._getPatrolCheckIndex();
                if (checkIndex > 0) {
                    var data = {
                        id: this._cityId,
                        patrol_type: checkIndex,
                        hero_id: heroId
                    };
                    return [
                        true,
                        true,
                        data
                    ];
                }
            }
            return [
                true,
                false,
                null
            ];
        }
        return [
            false,
            false,
            null
        ];
    }
    _updatePatrolInfo(checkIndex) {
        for (var i = 1; i <= 3; i++) {
            if (i != checkIndex) {
                //this['_checkBox' + i].isChecked = (false);
                this['_checkBoxText' + i].node.color = (Colors.BRIGHT_BG_TWO);
            }
        }
        this['_checkBox' + checkIndex].isChecked = true;
        this['_checkBoxText' + checkIndex].node.color = (Colors.SYSTEM_TARGET);
        var typeItem = TerritoryHelper.getTerritoryPatrolCost('patrol_choice_time' + checkIndex)[0];
        this._costResNum1.string = (typeItem.size);
        this._parentView.updateCost();
        var info = G_UserData.getTerritory().getCurPatrolList()[this._cityId];
        var heroId = info[0];
        G_UserData.getTerritory().setCurPatrolInfo(this._cityId, heroId, checkIndex);
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        UIHelper.addClickEventListenerEx(this._btnAdd.node, handler(this, this._onPanelClick));
        this._commonBox.addClickEventListenerEx(handler(this, this._onPanelClick));
        for (var i = 1; i <= 3; i++) {
            UIHelper.addClickEventListenerEx(this['_checkBox' + i].node, handler(this, this._onCheckBox));
            this['_checkBox' + i].node.name = (i).toString();
        }
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
    _onPanelClick() {
        if (this._cityState == TerritoryConst.STATE_ADD) {
            const onClickChooseHero = (heroId) => {
                G_UserData.getTerritory().setCurPatrolInfo(this._cityId, heroId, this._getPatrolCheckIndex());
                this._parentView.updateView();
            }
            UIPopupHelper.popupChooseHero(PopupChooseHeroHelper.FROM_TYPE10, handler(this, onClickChooseHero), null, Lang.get('lang_territory_choose_hero_title'));
            return;
        }
        if (this._cityState == TerritoryConst.STATE_LOCK) {
            G_Prompt.showTip(this._cityData.lockMsg);
            return;
        }
        if (this._popupPatrol) {
            return;
        }
        G_UserData.getTerritory().c2sGetPatrolAward(this._cityId);
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
    _setNodeVisible(visible, ...arg) {
        var nodeList = { ...arg }
        for (var i in nodeList) {
            var node = nodeList[i];
            if (node) {
                if (node.node) {
                    node.node.active = (visible);
                } else {
                    node.active = (visible);
                }
            }
        }
    }
    _stateNone() {
        console.warn('PopupTerritoryOneKeyCell:_stateNone');
        this._nodeFightEffect.removeAllChildren();
        this._setNodeVisible(false, this._btnAdd, this._commonHeroIcon, this._imageHeroState, this._imageStateBk, this._panelStateGetAward, this._nodeFightEffect, this._nodeCheckCon);
        this._commonHeroIcon.node.stopAllActions();
        this._imageCity.node.active = (false);
        this._effectNode.active = (true);
        this._imageCity.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        this._txtCityName.node.color = (Colors.TERRITRY_CITY_NAME);
    }
    _stateLock() {
        console.warn('PopupTerritoryOneKeyCell:_stateLock');
        this._setNodeVisible(true, this._imageStateBk);
        this._setNodeVisible(false, this._btnAdd, this._commonHeroIcon, this._imageHeroState, this._nodeFightEffect, this._panelStateGetAward, this._nodeCheckCon);
        this._textStateName.node.color = (TerritoryConst.NONE_COLOR);
        this._textStateName.string = (Lang.get('lang_territory_onekey_none_tip'));
        this._imageCity.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        this._imageCity.node.active = (true);
        this._effectNode.active = (false);
        this._txtCityName.node.color = (Colors.TERRITRY_CITY_NAME_DRAK);
    }
    _stateFight() {
        console.warn('PopupTerritoryOneKeyCell:_stateFight');
        this._setNodeVisible(true, this._nodeFightEffect, this._imageStateBk);
        this._setNodeVisible(false, this._btnAdd, this._commonHeroIcon, this._imageHeroState, this._panelStateGetAward, this._nodeCheckCon);
        this._createSwordEft();
        this._textStateName.node.color = (Colors.NEW_RED_PACKET_NAME_COLOR);
        this._textStateName.string = (Lang.get('lang_territory_state_fight'));
    }
    _createSwordEft() {
        const effectFunction = (effect) => {
            if (effect == 'effect_shuangjian') {
                var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_shuangjian', null, false);
                subEffect.play();
                return subEffect.node;
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeFightEffect, 'moving_shuangjian', effectFunction, null, false);
    }
    _stateAdd() {
        console.warn('PopupTerritoryOneKeyCell:_stateAdd');
        this._setNodeVisible(true, this._btnAdd, this._nodeCheckCon);
        this._setNodeVisible(false, this._imageStateBk, this._commonHeroIcon, this._imageHeroState, this._panelStateGetAward, this._nodeFightEffect);
        var info = G_UserData.getTerritory().getCurPatrolList()[this._cityId];
        var heroId = info[0];
        var lastPatrolType = info[1];
        if (heroId && heroId > 0) {
            this._commonHeroIcon.node.active = (true);
            var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
            var data = {
                heroId: heroUnitData.getBase_id(),
                limitLevel: heroUnitData.getLimit_level(),
                limitRedLevel: heroUnitData.getLimit_rtg()
            };
            this._updateCommonHero(data);
        } else {
            this._commonHeroIcon.node.active = (false);
        }
        if (lastPatrolType > 0) {
            this._updatePatrolInfo(lastPatrolType);
        } else {
            this._updatePatrolInfo(1);
        }
    }
    getCost() {
        var res = 0;
        var info = G_UserData.getTerritory().getCurPatrolList()[this._cityId];
        var heroId = info[0];
        if (this._cityState == TerritoryConst.STATE_ADD && heroId && heroId > 0) {
            var checkIndex = this._getPatrolCheckIndex();
            if (checkIndex > 0) {
                var typeItem = TerritoryHelper.getTerritoryPatrolCost('patrol_choice_time' + checkIndex)[0];
                res = typeItem.size;
            }
        }
        return res;
    }
    _stateCountDown() {
        console.warn('PopupTerritoryOneKeyCell:_stateCountDown');
        this._setNodeVisible(true, this._commonHeroIcon, this._imageHeroState, this._imageStateBk);
        this._setNodeVisible(false, this._btnAdd, this._panelStateGetAward, this._nodeFightEffect, this._nodeCheckCon);
        this._updateCommonHero(this._cityData);
        this._startCountDown();
        Util.updateImageView(this._imageHeroState, Path.getTextSignet('txt_xunluozhong01'));
    }
    _updateCommonHero(data) {
        var baseId = data.heroId;
        if (baseId && baseId > 0) {
            var limitLevel = data.limitLevel;
            var limitRedLevel = data.limitRedLevel;
            this._commonHeroIcon.updateUI(baseId, null, limitLevel, limitRedLevel);
        }
    }
    _updateCountDown() {
        var remainTime = this._cityData.endTime;
        var cityId = this._cityId;
        var timeString = '00:00:00';
        if (remainTime > 0) {
            timeString = G_ServerTime.getLeftSecondsString(remainTime);
        }
        if (remainTime < G_ServerTime.getTime()) {
            return;
        }
        var pendingStr = '';
        if (this._cityState == TerritoryConst.STATE_COUNTDOWN || this._cityState == TerritoryConst.STATE_RIOT) {
            this._textStateName.node.color = (Colors.NEW_RED_PACKET_NAME_COLOR);
            pendingStr = Lang.get('lang_territory_countDown');
            if (this._cityState == TerritoryConst.STATE_COUNTDOWN) {
                if (TerritoryHelper.isRoitState(this._cityId) == true) {
                    return;
                }
            }
        }
        this._textStateName.string = (pendingStr + (' ' + timeString));
    }
    _startCountDown() {
        if (this._timeScheduler == null) {
            this._timeScheduler = cc.director.getScheduler().schedule(this._updateCountDown, this, 0.5);
            this._updateCountDown();
        }
    }
    _stopCountDown() {
        if (this._timeScheduler != null) {
            cc.director.getScheduler().unschedule(null, this._timeScheduler);
            this._timeScheduler = null;
        }
    }
    _stateRiot() {
        console.warn('PopupTerritoryOneKeyCell:_stateRiot');
        this._setNodeVisible(true, this._commonHeroIcon, this._imageStateBk, this._panelStateGetAward);
        this._setNodeVisible(false, this._imageHeroState, this._btnAdd, this._nodeFightEffect, this._nodeCheckCon);
        var eventId = G_UserData.getTerritory().getFirstRiotId(this._cityId), riotEvent;
        if (riotEvent) {
            var eventState = TerritoryHelper.getRiotEventState(riotEvent);
            if (eventState != TerritoryConst.RIOT_HELP) {
                Util.updateImageView(this._imageHeroState, Path.getTextSignet('txt_yiqiuzhu01'));
                this._imageHeroState.node.active = (true);
            }
        }
        this._startCountDown();
        this._updateCommonHero(this._cityData);
        this._showStateAnimation();
    }
    _showStateAnimation() {
        if (this._cityState == TerritoryConst.STATE_RIOT) {
            var bg = this._commonHeroIcon;
            var delay = cc.delayTime(0.2);
            var scaleB = cc.scaleTo(0.3, 1.2).easing(cc.easeBackIn());
            var scaleS = cc.scaleTo(0.3, 1).easing(cc.easeBackOut());
            var call = cc.callFunc(function () {
                var scalebB = cc.scaleTo(0.7, 1.1);
                var scalebS = cc.scaleTo(0.7, 1);
                var forever = cc.repeatForever(cc.sequence(scalebB, scalebS));
                bg.node.runAction(forever);
            });
            var seq = cc.sequence(delay, scaleB, scaleS, call);
            bg.node.stopAllActions();
            bg.node.setScale(0);
            bg.node.runAction(seq);
        }
    }
    _stateFinish() {
        console.warn('PopupTerritoryOneKeyCell:_stateFinish');
        this._setNodeVisible(true, this._imageStateBk, this._panelStateGetAward);
        this._setNodeVisible(false, this._imageHeroState, this._commonHeroIcon, this._nodeFightEffect, this._btnAdd, this._nodeCheckCon);
        if (this._cityState == TerritoryConst.STATE_FINISH) {
            this._commonBox.playBoxJump();
            this._textStateName.node.color = (TerritoryConst.FINISH_COLOR);
            this._textStateName.string = (Lang.get('lang_territory_finish'));
        }
    }
    clear() {
        this._stopCountDown();
    }
    reset() {
        this.clear();
        this._stateNone();
        this._cityData = TerritoryHelper.getTerritoryData(this._cityId);
        this._cityState = G_UserData.getTerritory().getTerritoryState(this._cityId) || 0;
        this._commonBox.setParams({});
    }
    updateUI() {
        this.reset();
        Util.updateImageView(this._imageCity, Path.getChapterIcon(this._cityData.cfg.pic));
        this._effectNode.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._effectNode, this._cityData.cfg.island_eff, null, null, false);
        if (this._stateFunc[this._cityState] != null) {
            this._stateFunc[this._cityState]();
        }
        this._txtCityName.string = (this._cityData.name);
    }
}