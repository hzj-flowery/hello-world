import CommonButtonLevel0Highlight from "../../../ui/component/CommonButtonLevel0Highlight";
import { handler } from "../../../utils/handler";
import EffectGfxNode from "../../../effect/EffectGfxNode";
import { G_EffectGfxMgr, Colors, G_UserData, G_SceneManager } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { TacticsConst } from "../../../const/TacticsConst";
import CommonTacticsIcon from "../../../ui/component/CommonTacticsIcon";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { Lang } from "../../../lang/Lang";
import UIActionHelper from "../../../utils/UIActionHelper";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { table } from "../../../utils/table";
import PopupTacticsUnclock from "../tactics/PopupTacticsUnclock";
import PopupChooseTactics from "../../../ui/popup/PopupChooseTactics";
import PopupTacticsDetail from "../../../ui/popup/PopupTacticsDetail";


const { ccclass, property } = cc._decorator;
@ccclass
export default class TeamTacticsPositionIcon extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    }) _target: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _resourceNode: cc.Node = null;;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgBg: cc.Sprite = null;;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgLock: cc.Sprite = null;;

    @property({
        type: cc.Sprite,
        visible: true
    }) _spriteEmpty: cc.Sprite = null;;

    @property({
        type: CommonTacticsIcon,
        visible: true
    }) _nodeTacticsIcon: CommonTacticsIcon = null;;

    @property({
        type: cc.Sprite,
        visible: true
    }) _imgInfo: cc.Sprite = null;;

    @property({
        type: cc.Label,
        visible: true
    }) _txtInfo: cc.Label = null;;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch: cc.Node = null;;

    _subEffect: EffectGfxNode;
    _subEffect2: EffectGfxNode;
    _effUnlockCallback: any;
    _state: any;
    _slot: any;
    _fixBaseId: number;
    _showState: number;
    _pos: any;
    onLoad() {
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this, this._onPanelTouch));
        this._init();
    }
    _init() {
        this._nodeTacticsIcon.node.active = (false);
        this._subEffect = G_EffectGfxMgr.createPlayGfx(this._target, 'effect_ui_jiesuo', null, false);
        this._subEffect.node.active = (false);
        this._subEffect.node.zIndex = (-1);
        this._subEffect.node.setScale(0.9583);
        var self = this;
        function eventFunc(event) {
            if (event == 'finish') {
                if (self._effUnlockCallback) {
                    self._effUnlockCallback();
                }
                self.updateUI(self._pos, self._slot);
            }
        }
        this._subEffect2 = G_EffectGfxMgr.createPlayGfx(this._target, 'effect_ui_suolie', eventFunc, false, cc.v2(0, 0));
        this._subEffect2.node.active = (false);
        this._subEffect2.node.zIndex = (-1);
        this._subEffect2.node.setScale(0.9583);
    }
    unlockPosition(callback) {
        this._effUnlockCallback = callback;
        this._imgBg.node.active = (true);
        this._imgLock.node.active = (true);
        this._spriteEmpty.node.active = (false);
        this._nodeTacticsIcon.node.active = (false);
        var self = this;
        function eventFunction(event, frameIndex, node) {
            if (event == 'finish') {
                self._imgBg.node.active = (false);
                self._imgLock.node.active = (false);
                self._subEffect2.node.active = (true);
                self._subEffect2.play();
            }
        }
        var effect = G_EffectGfxMgr.createPlayGfx(this._target, 'effect_tactics_unlock', eventFunction, true, cc.v2(0, 55));
        this.updateUI(this._pos, this._slot);
    }
    updateUIWithFixState(state, slot, tacticsUnitData) {
        this._state = state;
        this._slot = slot;
        var baseId = 0;
        if (tacticsUnitData != null) {
            baseId = tacticsUnitData.getBase_id();
        }
        this._fixBaseId = baseId;
        this._showState = 1;
        if (this._subEffect) {
            this._subEffect.node.active = (false);
        }
        if (this._subEffect2) {
            this._subEffect2.node.active = (false);
        }
        this._imgInfo.node.active = (false);
        this._txtInfo.node.active = (false);
        UIHelper.loadTexture(this._imgBg, Path.getTacticsImage('img_tactis_zhanfawei02'))
        if (state == TacticsConst.STATE_WEARED) {
            this._imgBg.node.active = (true);
            this._imgLock.node.active = (false);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (true);
            this._nodeTacticsIcon.getComponent(CommonTacticsIcon).updateUI(baseId);
        } else if (state == TacticsConst.STATE_EMPTY) {
            this._imgBg.node.active = (true);
            this._imgLock.node.active = (false);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (false);
        } else {
            UIHelper.loadTexture(this._imgBg, Path.getTacticsImage('img_tactis_zhanfawei01'));
            this._imgBg.node.active = (true);
            this._imgLock.node.active = (true);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (false);
        }
    }
    _updateUI(baseId) {
        var state = this._state;
        var [_, _, funcLevelInfo] = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TACTICS_POS' + this._slot]);
        this._subEffect.node.active = (false);
        this._subEffect2.node.active = (false);
        var isSetGray = false;
        UIHelper.loadTexture(this._imgBg, Path.getTacticsImage('img_tactis_zhanfawei02'));
        if (state == TacticsConst.STATE_LOCK_LEVEL) {
            isSetGray = true;
            this._imgBg.node.active = (true);
            UIHelper.loadTexture(this._imgBg, Path.getTacticsImage('img_tactis_zhanfawei01'));
            this._imgLock.node.active = (true);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (false);
            this._imgInfo.node.active = (true);
            this._txtInfo.node.active = (true);
            var txtStr = Lang.get('hero_txt_level', { level: funcLevelInfo.level });
            this._txtInfo.string = (txtStr);
            this._txtInfo.node.color = (Colors.TacticsGrayColor);
        } else if (state == TacticsConst.STATE_LOCK) {
            this._imgBg.node.active = (false);
            this._imgLock.node.active = (false);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (false);
            this._imgInfo.node.active = (true);
            this._txtInfo.node.active = (true);
            this._txtInfo.string = (Lang.get('tactics_unlock_tip'));
            this._txtInfo.node.color = (Colors.TacticsActiveColor);
            this._subEffect.node.active = (true);
        } else if (state == TacticsConst.STATE_EMPTY) {
            this._imgBg.node.active = (true);
            this._imgLock.node.active = (false);
            this._spriteEmpty.node.active = (true);
            UIActionHelper.playBlinkEffect(this._spriteEmpty.node);
            this._nodeTacticsIcon.node.active = (false);
            this._imgInfo.node.active = (false);
            this._txtInfo.node.active = (false);
        } else {
            this._imgBg.node.active = (true);
            this._imgLock.node.active = (false);
            this._spriteEmpty.node.active = (false);
            this._nodeTacticsIcon.node.active = (true);
            this._imgInfo.node.active = (false);
            this._txtInfo.node.active = (false);
            this._updateIcon(baseId);
        }
    }
    _updateIcon(baseId) {
        var heroId = G_UserData.getTeam().getHeroIdWithPos(this._pos);
        var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
        var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
        var isEffect = G_UserData.getTactics().isSuitTacticsToHero(baseId, heroBaseId);
        var isEffective = TacticsDataHelper.isEffectiveTacticsToHero(baseId, this._pos);
        this._nodeTacticsIcon.updateUI(baseId);
        if (isEffect && isEffective) {
            this._imgInfo.node.active = (false);
            this._txtInfo.node.active = (false);
        } else {
            this._imgInfo.node.active = (true);
            this._txtInfo.node.active = (true);
            this._txtInfo.string = (Lang.get('tactics_suit_not'));
            this._txtInfo.node.color = (Colors.RED);
        }
    }
    updateUI(pos, slot) {
        this._pos = pos;
        this._slot = slot;
        var state = this._getState();
        this._state = state;
        var baseId = 0;
        var tacticsId = G_UserData.getBattleResource().getResourceId(pos, 5, slot);
        if (tacticsId) {
            var tacticsUnitData = G_UserData.getTactics().getUnitDataWithId(tacticsId);
            baseId = tacticsUnitData.getBase_id();
        }
        this._updateUI(baseId);
    }
    _getState() {
        var pos = this._pos;
        var slot = this._slot;
        var slotList = G_UserData.getTactics().getUnlockInfoByPos(pos);
        var isLock = true;
        for (var i in slotList) {
            var v = slotList[i];
            if (v == slot) {
                isLock = false;
                break;
            }
        }
        if (slot == 1) {
            isLock = false;
        }
        if (isLock) {
            var isOpenSlot = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_TACTICS_POS' + slot]), _, funcLevelInfo;
            if (!isOpenSlot) {
                return [
                    TacticsConst.STATE_LOCK_LEVEL,
                    funcLevelInfo
                ];
            } else {
                return TacticsConst.STATE_LOCK;
            }
        } else {
            var tacticsId = G_UserData.getBattleResource().getResourceId(pos, 5, slot);
            if (tacticsId == null) {
                return TacticsConst.STATE_EMPTY;
            } else {
                return TacticsConst.STATE_WEARED;
            }
        }
    }
    setTouchEnabled(enabled) {
    }
    _onPanelTouchSelf() {
        var state = this._state;
        var slot = this._slot;
        if (state == TacticsConst.STATE_LOCK_LEVEL) {
            return;
        } else if (state == TacticsConst.STATE_LOCK) {
            var [needColor, needNum] = TacticsDataHelper.getTacticsPosUnlockParam(this._slot);
            if (needNum == 0) {
                this._onUnlockConfirm({});
            } else {
                var callBack = handler(this, this._onUnlockConfirm);
                G_SceneManager.openPopup('prefab/tactics/PopupTacticsUnclock', (popup: PopupTacticsUnclock) => {
                    popup.updateUI(this._pos, this._slot, callBack);
                    popup.openWithAction();
                })
            }
        } else if (state == TacticsConst.STATE_EMPTY) {
            var callBack = handler(this, this._onPutonConfirm);
            G_SceneManager.openPopup('prefab/common/PopupChooseTactics', (popup: PopupChooseTactics) => {
                popup.setTitle(Lang.get('tactics_puton_tip'));
                popup.updateUI(this._pos, this._slot, callBack);
                popup.openWithAction();
            })
        } else {
            var callBack = handler(this, this._onPutonConfirm);
            G_SceneManager.openPopup('prefab/common/PopupChooseTactics', (popup: PopupChooseTactics) => {
                popup.setTitle(Lang.get('tactics_puton_tip'));
                popup.updateUI(this._pos, this._slot, callBack);
                popup.openWithAction();
            })
        }
    }
    _onPanelTouchOther() {
        var baseId = this._fixBaseId;
        if (baseId != null && baseId != 0) {
            G_SceneManager.openPopup('prefab/common/PopupTacticsDetail', (popup: PopupTacticsDetail) => {
                popup.ctor(this._imgBg, baseId);
                popup.open();
            })
        }
    }
    _onPanelTouch() {
        if (this._showState == 1) {
            this._onPanelTouchOther();
        } else {
            this._onPanelTouchSelf();
        }
    }
    _onUnlockConfirm(list) {
        var pos = this._slot;
        var materials = [];
        for (var _ in list) {
            var unitData = list[_];
            if (unitData) {
                table.insert(materials, unitData.getId());
            }
        }
        G_UserData.getTactics().c2sUnlockTacticsPos(this._pos, pos, materials);
    }
    _onPutonConfirm(tacticsId) {
        var tactisIdList = G_UserData.getBattleResource().getTacticsIdsWithPos(this._pos);
        var heroId = G_UserData.getTeam().getHeroIdWithPos(this._pos);
        var isPutdown = false;
        for (var i in tactisIdList) {
            var v = tactisIdList[i];
            if (v == tacticsId) {
                isPutdown = true;
                break;
            }
        }
        if (isPutdown) {
            var tacticsUnitData = G_UserData.getTactics().getUnitDataWithId(tacticsId);
            var pos = tacticsUnitData.getPos();
            G_UserData.getTactics().c2sPutDownTactics(tacticsId, heroId, pos);
        } else {
            G_UserData.getTactics().c2sPutOnTactics(tacticsId, heroId, this._slot);
        }
    }
}