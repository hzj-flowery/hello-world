import { HeroConst } from "../../const/HeroConst";
import EffectGfxNode from "../../effect/EffectGfxNode";
import { Colors, G_EffectGfxMgr, G_SceneManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { AvatarDataHelper } from "../../utils/data/AvatarDataHelper";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { UIPopupHelper } from "../../utils/UIPopupHelper";
import PopupItemGuider from "../PopupItemGuider";
import CommonIconBase from "./CommonIconBase";
import { ComponentIconHelper } from "./ComponentIconHelper";

const { ccclass, property } = cc._decorator;
var WIDTH_CONST = 100;
@ccclass
export default class CommonHeroIcon extends CommonIconBase {

    @property({ type: cc.Sprite, visible: true })
    _imageUnknow: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _headFrameMask: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _headFrameIcon: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _headFrameSelected: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _headFrameLock: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _redPoint: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _tmpId: cc.Label = null;

    private static WIDTH_CONST = 100;

    private _limitLevel;
    private _moving: EffectGfxNode;
    private _textLevel: cc.Label;
    private _imageItemTop: cc.Sprite;
    _limitRedLevel: any;

    onLoad(): void {
        if (this._hasLoad) return;
        this._type = this._type == null ? TypeConvertHelper.TYPE_HERO : this._type;
        super.onLoad();
        this.showTopImage(false);
        this.setTouchEnabled(false);
    }

    public refreshToEmpty(useUnknow?) {
        if (useUnknow) {
            this.loadIcon(Path.getCommonIcon('hero', '999'));
            this.loadColorBg(Path.getUICommon('img_frame_empty01'), 255);
        } else {
            super.refreshToEmpty();
        }
    }

    public updateUI(value, size?, limitLevel?, limitRedLevel?) {
        if (value == 0) {
            this.refreshToEmpty();
            return;
        }
        this._limitLevel = limitLevel;
        this._limitRedLevel = limitRedLevel
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, value, null, null, limitLevel, limitRedLevel);
        itemParams.size = size;
        if (itemParams.icon_bg != null) {
            this.loadColorBg(itemParams.icon_bg);
        }
        if (itemParams.icon != null) {
            this.loadIcon(itemParams.icon);
        }
        if (itemParams.size) {
            this.setCount(itemParams.size);
        }
        this._itemParams = itemParams;
    }

    public updateIcon(avatarInfo, size?, frameId?, scale?) {
        if (!avatarInfo) {
            return;
        }
        if (avatarInfo.isHasAvatar) {
            var avatarConfig = AvatarDataHelper.getAvatarConfig(avatarInfo.avatarBaseId);
            if (avatarConfig.limit == 1) {
                this.updateUI(avatarInfo.covertId, size, HeroConst.HERO_LIMIT_RED_MAX_LEVEL);
            } else {
                this.updateUI(avatarInfo.covertId, size);
            }
        } else {
            this.updateUI(avatarInfo.covertId, size);
        }
        if (frameId) {
            this.updateHeadFrame(frameId, scale);
        }
    }

    public updateHeroIcon(baseId, size?) {
        if (!baseId) {
            return;
        }
        this.updateUI(baseId, size);
    }

    public updateHeadFrame(frameId, scale?) {
        if (!frameId || frameId <= 0) {
            frameId = 1;
        }
        var itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HEAD_FRAME, frameId, null, null, null);
        itemParams.scale = 1;
        this.setHeadFrameScale(itemParams.scale);
        if (itemParams.frame != null) {
            this._headFrameIcon.node.active = (true);
            if (this._moving != null) {
                this._headFrameIcon.node.removeChild( this._moving.node);
                //this._moving.node.destroy();
                this._moving = null;
            }
            this._setFrameImg(itemParams.frame);
        }
        if (itemParams.moving != '' && itemParams.moving != null) {
            this._headFrameIcon.node.active = (true);
            this._setFrameImg(Path.getFrameIcon('img_head_frame_com001'));
            if (this._moving != null) {
                this._headFrameIcon.node.removeChild( this._moving.node);
                this._moving = null;
            }
            this._moving = G_EffectGfxMgr.createPlayGfx(this._headFrameIcon.node, itemParams.moving);
        }
    }

    private _setFrameImg(img) {
        UIHelper.loadTexture(this._headFrameIcon, img);
    }

    public setSelected(visible) {
        this._headFrameSelected.node.active = (visible);
    }

    public setLocked(visible) {
        this._headFrameLock.node.active = (visible);
    }

    public setRedPointVisible(visible) {
        this._redPoint.node.active = (visible);
    }

    public setHeadFrameScale(scale) {
        this._headFrameIcon.node.setScale(CommonHeroIcon.WIDTH_CONST / CommonHeroIcon.WIDTH_CONST * scale);
        this._headFrameSelected.node.setScale(CommonHeroIcon.WIDTH_CONST / CommonHeroIcon.WIDTH_CONST * scale);
    }

    public setHeroIconMask(needMask) {
        this._headFrameMask.node.active = (needMask);
    }

    public setIconSelect(showSelect) {
        // CommonHeroIcon.prototype.setIconSelect.call(this, showSelect);
        super.setIconSelect(showSelect);
        //this._imageSelect.setPosition(CommonHeroIcon.WIDTH_CONST / 2, CommonHeroIcon.WIDTH_CONST / 2);
    }

    public setCallback(callback) {
        super.setCallBack(callback);
        // CommonHeroIcon.prototype.setCallback.call(this, callback);
    }

    // public setName(name) {
    //     super.setName(name);
    //     this._labelItemName.node.setPosition(CommonHeroIcon.WIDTH_CONST / 2, -3);
    // }

    public setQuality(quality) {
        var iconBg = Path.getUICommon('frame/img_frame_0' + quality);
        this.loadColorBg(iconBg);
    }

    public setLevel(level) {
        if (this._textLevel == null) {
            var params = {
                name: '_textLevel',
                text: '+' + '0',
                fontSize: 24,
                color: Colors.COLOR_QUALITY[0],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[0]
            };
            var label = UIHelper.createLabel(params).getComponent(cc.Label);
            label.node.setAnchorPoint(cc.v2(0.5, 0));
            // label.node.setPosition(cc.v2(8, 2));
            if(this._panelItemContent){
                label.node.y = -(this._panelItemContent as cc.Node).height / 2;
            }
            this.appendUI(label.node);
            this._textLevel = label;
        }
        this._textLevel.string = ('Lv ' + level);
    }

    public setTopImage(imgPath) {
        if (imgPath == null || imgPath == '') {
            return;
        }
        if (this._imageItemTop == null) {
            var params = {
                name: '_imageItemTop',
                texture: imgPath
            };
            ComponentIconHelper._setPostion(params, 'leftTop2');
            var uiWidget = UIHelper.createImage(params).getComponent(cc.Sprite);
            uiWidget.node.setScale(0.75);
            uiWidget.node.setAnchorPoint(0.5, 0.5);
            this.appendUI(uiWidget.node);
            this._imageItemTop = uiWidget;
        }
        UIHelper.loadTexture(this._imageItemTop, imgPath);
    }

    public showTopImage(show) {
        if (show == null) {
            show = false;
        }
        if (this._imageItemTop) {
            this._imageItemTop.node.active = (show);
        }
    }

    public _onTouchCallBack(sender: cc.Touch, state) {
        // TODO:
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._callback) {
                this._callback(this._target, this._itemParams, this._limitLevel, this._limitRedLevel);
            } else {
                if (this._itemParams.cfg.type == 3) {
                    G_SceneManager.openPopup(Path.getCommonPrefab("PopupItemGuider"),(popupItemGuider: PopupItemGuider)=>{
                        popupItemGuider.updateUI(TypeConvertHelper.TYPE_HERO, this._itemParams.cfg.id);
                        popupItemGuider.setTitle(Lang.get('way_type_get'));
                        popupItemGuider.openWithAction();
                    })

                } else {
                    //var PopupHeroDetail = new (require('PopupHeroDetail'))(TypeConvertHelper.TYPE_HERO, this._itemParams.cfg.id, null, this._limitLevel);
                    // PopupHeroDetail.openWithAction();
                    UIPopupHelper.popupIconDetail(TypeConvertHelper.TYPE_HERO, this._itemParams.cfg.id)

                }
            }
        }
    }

    public showHeroUnknow(s) {
        this._imageUnknow.node.active = (s);
        this._headFrameIcon.node.active = !s;
    }
}