import { FunctionConst } from "../../../const/FunctionConst";
import { Colors, G_EffectGfxMgr, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { SilkbagDataHelper } from "../../../utils/data/SilkbagDataHelper";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SilkbagIcon extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectDown: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMidBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectUp: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSelected: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDark: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageText_0: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageText: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDes: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRP: cc.Sprite = null;
    _index: any;
    _onClick: any;
    _pos: number;
    _isOpen: boolean;
    _effect1: any;
    _effect2: any;

    ctor(index, onClick) {
        this._index = index;
        this._onClick = onClick;
        this.onCreate();
    }
    onCreate() {
        this._initData();
        this._hideAllWidget();
    }
    _initData() {
        this._pos = 0;
        this._isOpen = false;
        this._effect1 = null;
        this._effect1 = null;
    }
    _hideAllWidget() {
        this._imageLock.node.active = (false);
        this._imageMidBg.node.active = (false);
        this._imageSelected.node.active = (false);
        this._imageDark.node.active = (false);
        this._imageText.node.active = (false);
        this._btnClose.node.active = (false);
        this._imageRP.node.active = (false);
        this.removeLightEffect();
    }
    updateIcon(pos) {
        this._hideAllWidget();
        this._pos = pos;
        var arr = FunctionCheck.funcIsOpened(FunctionConst['FUNC_SILKBAG_SLOT' + this._index]);
        var isOpen = arr[0], comment = arr[1], info = arr[2];
        this._isOpen = isOpen;
        if (isOpen) {
            var silkbagId = G_UserData.getSilkbagOnTeam().getIdWithPosAndIndex(pos, this._index);
            if (silkbagId > 0) {
                var unitData = G_UserData.getSilkbag().getUnitDataWithId(silkbagId);
                var baseId = unitData.getBase_id();
                this._imageMidBg.node.active = (true);
                this._btnClose.node.active = (true);
                var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId);
                UIHelper.loadTexture(this._imageMidBg, param.icon_mid_bg2);
                UIHelper.loadTexture(this._imageIcon, param.icon);
                this._textName.string = (param.name);
                this._textName.node.color = (param.icon_color);
                UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
                var heroId = G_UserData.getTeam().getHeroIdWithPos(pos);
                var heroUnitData = G_UserData.getHero().getUnitDataWithId(heroId);
                var heroBaseId = heroUnitData.getAvatarToHeroBaseId();
                var heroRank = heroUnitData.getRank_lv();
                var isInstrumentMaxLevel = G_UserData.getInstrument().isInstrumentLevelMaxWithPos(pos);
                var heroLimit = heroUnitData.getLeaderLimitLevel();
                var heroRedLimit = heroUnitData.getLeaderLimitRedLevel();
                var [isEffective, limitRank, isEffectiveForInstrument, limitLevel] = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit);
                if (!isEffective) {
                    var tips = '';
                    if (limitRank == false) {
                        tips = Lang.get('silkbag_not_effective');
                    } else if (limitRank && limitRank > 0) {
                        tips = Lang.get('silkbag_not_effective_limit_rank', { rank: limitRank });
                    } else if (isEffectiveForInstrument) {
                        tips = Lang.get('silkbag_not_effective_instrument');
                    } else if (limitLevel > 0) {
                        tips = Lang.get('silkbag_not_effective_limit_level', { level: limitLevel });
                    }
                    this._textName.string = (tips);
                    this._textName.node.color = (Colors.OBVIOUS_YELLOW);
                    UIHelper.enableOutline(this._textName, Colors.OBVIOUS_YELLOW_OUTLINE, 2);
                    this._imageDark.node.active = (true);
                }
                this.showIconEffect(baseId);
            } else {
                this._textName.string = (Lang.get('silkbag_no_wear'));
                this._textName.node.color = (Colors.BRIGHT_BG_TWO);
                UIHelper.enableOutline(this._textName, Colors.BRIGHT_BG_OUT_LINE_TWO);
            }
        } else {
            this._imageLock.node.active = (true);
            this._textName.string = (Lang.get('silkbag_unlock_level_tip', { level: info.level }));
            this._textName.node.color = (Colors.BRIGHT_BG_TWO);
            UIHelper.enableOutline(this._textName, Colors.BRIGHT_BG_OUT_LINE_TWO);
        }
    }
    onPanelTouch() {
        if (!this._isOpen) {
            return;
        }
        if (this._onClick) {
            this._onClick(this._index);
        }
    }
    onClickClose() {
        G_UserData.getSilkbag().c2sEquipSilkbag(this._pos, this._index, 0);
        if (this._onClick) {
            this._onClick(this._index);
        }
    }
    setSelected(selected) {
        this._imageSelected.node.active = (selected);
    }
    showRedPoint(visible) {
        this._imageRP.node.active = (visible);
    }
    playEffect(effectName) {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
    }
    onlyShow(pos, detailData) {
        this._hideAllWidget();
        var silkbagId = detailData.getSilkbagIdWithPosAndIndex(pos, this._index);
        if (silkbagId > 0) {
            var unitData = detailData.getSilkbagUnitDataWithId(silkbagId);
            var baseId = unitData.getBase_id();
            this._imageMidBg.node.active = (true);
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId);
            UIHelper.loadTexture(this._imageMidBg, param.icon_mid_bg2);
            UIHelper.loadTexture(this._imageIcon, param.icon);
            this._textName.string = (param.name);
            this._textName.node.color = (param.icon_color);
            UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
            var heroUnitData = detailData.getHeroDataWithPos(pos);
            var heroBaseId = detailData.getAvatarToHeroBaseId(heroUnitData);
            var heroRank = heroUnitData.getRank_lv();
            var isInstrumentMaxLevel = detailData.isInstrumentLevelMaxWithPos(pos);
            var heroLimit = detailData.getUserLeaderLimitLevel(heroUnitData);
            var heroRedLimit = detailData.getUserLeaderRedLimitLevel(heroUnitData);
            var [isEffective,limitRank, isEffectiveForInstrument, limitLevel] = SilkbagDataHelper.isEffectiveSilkBagToHero(baseId, heroBaseId, heroRank, isInstrumentMaxLevel, heroLimit, heroRedLimit);
            var profile = '';
            if (isEffective) {
                profile = param.profile;
            } else {
                var tips = '';
                if (limitRank == false) {
                    tips = Lang.get('silkbag_not_effective');
                } else if (limitRank && limitRank > 0) {
                    tips = Lang.get('silkbag_not_effective_limit_rank', { rank: limitRank });
                } else if (isEffectiveForInstrument) {
                    tips = Lang.get('silkbag_not_effective_instrument');
                } else if (limitLevel > 0) {
                    tips = Lang.get('silkbag_not_effective_limit_level', { level: limitLevel });
                }
                this._imageDark.node.active = (true);
            }
            this.showIconEffect(baseId);
        } else {
            this._textName.string = (Lang.get('silkbag_no_wear'));
            this._textName.node.color = (Colors.BRIGHT_BG_TWO);
            UIHelper.enableOutline(this._textName, Colors.BRIGHT_BG_OUT_LINE_TWO);
        }
    }
    removeLightEffect() {
        if (this._effect1) {
            this._effect1.runAction(cc.destroySelf());
            this._effect1 = null;
        }
        if (this._effect2) {
            this._effect2.runAction(cc.destroySelf());
            this._effect2 = null;
        }
    }
    showIconEffect(baseId) {
        this.removeLightEffect();
        var effects = SilkbagDataHelper.getEffectWithBaseId(baseId);
        if (effects == null) {
            return;
        }
        if (effects.length == 1) {
            var effectName = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName).node;
        }
        if (effects.length == 2) {
            var effectName1 = effects[0];
            this._effect1 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName1).node;
            var effectName2 = effects[1];
            this._effect2 = G_EffectGfxMgr.createPlayGfx(this._nodeEffectUp, effectName2).node;
        }
    }
    setPosition(v2) {
        this.node.setPosition(v2);
    }
}