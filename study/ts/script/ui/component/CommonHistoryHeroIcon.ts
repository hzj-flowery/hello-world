import EffectGfxNode from "../../effect/EffectGfxNode";
import { G_EffectGfxMgr, G_SceneManager, G_UserData } from "../../init";
import PopupHistoryHeroDetail from "../../scene/view/historyhero/PopupHistoryHeroDetail";
import { HistoryHeroDataHelper } from "../../utils/data/HistoryHeroDataHelper";
import { Path } from "../../utils/Path";
import { table } from "../../utils/table";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import CommonIconBase from "./CommonIconBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHistoryHeroIcon extends CommonIconBase {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUnknow: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _mask: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRound: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEquip: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _equipFrameR: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAwakenR: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _awakenFrame: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSquare: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _iconAwakenSquare: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _equipSlotSquare: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _equipIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;
    _roundType: boolean;
    _effect1: any;
    _effect2: any;
    _closeHandler: any;
    _unitData: any;
    _tag: number;
    static super: any;
    _nodeEffectUp: any;
    _nodeEffectDown: any;

    onLoad() {
        this._type = TypeConvertHelper.TYPE_HISTORY_HERO;
        this._roundType = false;
        this._effect1 = null;
        this._effect2 = null;
        this._closeHandler = null;
        this._unitData = null;
        this._tag = 0;
        this.showCloseBtn(false);
        if (this._btnClose) {
            UIHelper.addEventListener(this.node, this._btnClose, 'CommonHistoryHeroIcon', '_onCloseBtnTouch');
        }
        super.onLoad();
    }
    updateUI(value, size) {
        var itemParams = super.updateUI(value, size);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
        if (this._equipFrameR && this._equipSlotSquare && this._equipIcon) {
            UIHelper.loadTexture(this._equipFrameR, itemParams.icon_equip_frame_round);
            UIHelper.loadTexture(this._equipSlotSquare, Path.getHistoryHeroImg('img_historical_hero_equip_fram0' + itemParams.color));
            UIHelper.loadTexture(this._equipIcon, itemParams.icon_equip);
        }
        if (this._roundType) {
            UIHelper.loadTexture(this._imageBg, itemParams.icon_bg_round);
            UIHelper.loadTexture(this._imageIcon, itemParams.icon_round);
        } else {
            UIHelper.loadTexture(this._imageBg, itemParams.icon_bg);
            UIHelper.loadTexture(this._imageIcon, itemParams.icon);
        }
    }
    updateUIWithUnitData(unitData, size) {
        var itemParams = super.updateUI(unitData.getConfig().id, 1);
        if (itemParams.size != null) {
            this.setCount(itemParams.size);
        }
        this.showIconEffect();
        UIHelper.loadTexture(this._imageIcon, itemParams.icon_round);
        UIHelper.loadTexture(this._equipFrameR, itemParams.icon_equip_frame_round);
        UIHelper.loadTexture(this._equipIcon, itemParams.icon_equip);
        UIHelper.loadTexture(this._equipSlotSquare, Path.getHistoryHeroImg('img_historical_hero_equip_fram0' + itemParams.color));
        if (this._roundType) {
            UIHelper.loadTexture(this._imageBg, itemParams.icon_bg_round);
            UIHelper.loadTexture(this._imageIcon, itemParams.icon_round);
        } else {
            UIHelper.loadTexture(this._imageBg, itemParams.icon_bg);
            UIHelper.loadTexture(this._imageIcon, itemParams.icon);
        }
        if (unitData) {
            this._unitData = unitData;
            this.updateUIBreakThrough(unitData.getBreak_through());
        }
    }
    updateUIBreakThrough(level) {
        if (level == 1) {
            this._nodeAwakenR.active = (false);
            this._iconAwakenSquare.node.active = (false);
            this._equipIcon.node.active = (false);
            this._equipFrameR.node.active = (true);
        } else if (level == 2) {
            this._nodeAwakenR.active = (false);
            this._iconAwakenSquare.node.active = (false);
            this._equipIcon.node.active = (true);
            this._equipFrameR.node.active = (true);
        } else if (level == 3) {
            this._nodeAwakenR.active = (true);
            this._iconAwakenSquare.node.active = (true);
            this._equipIcon.node.active = (true);
            this._equipFrameR.node.active = (true);
        }
    }
    resetUI() {
        UIHelper.loadTexture(this._imageBg, Path.getHistoryHeroImg('img_historical_hero_fram01'));
        this._nodeAwakenR.active = (false);
        this._iconAwakenSquare.node.active = (false);
        this._equipIcon.node.active = (false);
        this._equipFrameR.node.active = (false);
    }
    setRoundIconMask(bShowMask) {
        this._mask.node.active = (bShowMask);
    }
    setType(type) {
        this._type = type;
    }
    setRoundType(bRound) {
        this._roundType = bRound;
        this.needLoadIconBg = !this._roundType;
        this._nodeRound.active = (bRound);
        this._nodeSquare.active = (!bRound);
    }
    showEquipFrame(bShow, unitData) {
        this._equipIcon.node.active = (bShow);
        this._equipFrameR.node.active = (bShow);
        this._nodeAwakenR.active = (bShow);
        this._iconAwakenSquare.node.active = (bShow);
        if (bShow) {
            if (unitData) {
                this._unitData = unitData;
                if (unitData.getBreak_through() == 1) {
                    this._nodeAwakenR.active = (false);
                    this._iconAwakenSquare.node.active = (false);
                    this._equipIcon.node.active = (false);
                    this._equipFrameR.node.active = (true);
                } else if (unitData.getBreak_through() == 2) {
                    this._nodeAwakenR.active = (false);
                    this._iconAwakenSquare.node.active = (false);
                    this._equipIcon.node.active = (true);
                    this._equipFrameR.node.active = (true);
                } else if (unitData.getBreak_through() == 3) {
                    this._nodeAwakenR.active = (true);
                    this._iconAwakenSquare.node.active = (true);
                    this._equipIcon.node.active = (true);
                    this._equipFrameR.node.active = (true);
                }
            }
        }
    }
    showRedPoint(bShow) {
        this._redPoint.node.active = (bShow);
    }
    setTouchEnabled(bEnable) {
        super.setTouchEnabled(bEnable);
    }

    _onTouchCallBack(sender, state) {
        if (this._callback) {
            this._callback(sender, this._itemParams);
        } else {
            var isHave = G_UserData.getHistoryHero().isHaveHero(this._itemParams.cfg.id);
            var list = [];
            table.insert(list, {
                cfg: this._itemParams.cfg,
                isHave: isHave
            });
            G_SceneManager.openPopup('prefab/historyhero/PopupHistoryHeroDetail', (p: PopupHistoryHeroDetail) => {
                p.ctor(this._type, null, list, false, 1, this._itemParams.cfg.id);
                p.openWithAction();
            })
        }
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.runAction(cc.removeSelf());
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.runAction(cc.removeSelf());
            this._effect2 = null;
        }
    }
    showIconEffect(scale?) {
        this.removeLightEffect();
        if (this._itemParams == null) {
            return;
        }
        var baseId = this._itemParams.cfg.id;
        var effects = HistoryHeroDataHelper.getHistoryHeroEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (this._nodeEffectUp == null) {
            this._nodeEffectUp = ccui.Helper.seekNodeByName(this._target, 'NodeEffectUp');
        }
        if (this._nodeEffectDown == null) {
            this._nodeEffectDown = ccui.Helper.seekNodeByName(this._target, 'NodeEffectDown');
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName).node;
        }
        if (effects.length == 2) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectDown, effectName).node;
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2).node;
        }
    }
    showCloseBtn(bVisible) {
        if (this._btnClose) {
            this._btnClose.node.active = (bVisible);
        }
    }
    setCloseBtnHandler(handler) {
        this._closeHandler = handler;
    }
    setTag(tag) {
        this._tag = tag;
    }
    getTag(tag) {
        return this._tag;
    }
    getParam() {
        return this._itemParams;
    }
    _onCloseBtnTouch() {
        this._closeHandler(this);
    }
}