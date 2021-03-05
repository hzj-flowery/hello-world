import { Colors, G_EffectGfxMgr, G_SceneManager } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import PopupFrameItemInfo from "../popup/PopupFrameItemInfo";
import CommonIconBase from "./CommonIconBase";
import CommonUI from "./CommonUI";
var WIDTH_CONST = 130;
const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonHeadFrame extends CommonIconBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _selectedBg: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _redPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _tmpId: cc.Label = null;

    constructor() {
        super();
        this._type = TypeConvertHelper.TYPE_HEAD_FRAME;
    }

    public _isClickFrame: boolean;
    private _moving: any;
    private _textLevel: cc.Node;

    _init() {
        this._panelItemContent.setContentSize(cc.size(WIDTH_CONST, WIDTH_CONST));
    }

    onLoad(): void {
        super.onLoad();
        this._init();

        this._selectedBg = this._selectedBg || this.node.getChildByName('ImageIcon').getComponent(cc.Sprite);
        this._redPoint = this._redPoint || this.node.getChildByName('RedPoint').getComponent(cc.Sprite);
        if(this._selectedBg){
            this._selectedBg.node.active = false;
        }
        if(this._redPoint){
            this._redPoint.node.active = false;
        }
    }
    refreshToEmpty(useUnknow) {
        if (useUnknow) {
            this.setFrameBgImg(Path.getFrameIcon('img_head_frame_com001'));
        } else {
            super.refreshToEmpty();
        }
    }
    updateUI(value, scale) {
        if (value == 0) {
            value = 1;
        }
        var itemParams = TypeConvertHelper.convert(this._type, value, null, null, null);
        itemParams.scale = scale || 1;
        this.setHeadFrameScale(itemParams.scale);
        if (itemParams.frame != null) {
            this._imageBg.node.active = (true);
            if (this._moving != null) {
                this._moving.node.destroy();
                this._moving = null;
            }
            this.setFrameBgImg(itemParams.frame);
        }
        if (itemParams.moving != '' && itemParams.moving != null) {
            this._imageBg.node.active = (true);
            this.setFrameBgImg(Path.getFrameIcon('img_head_frame_com001'));
            if (this._moving != null) {
                this._moving.node.destroy();
                this._moving = null;
            }
            this._moving = G_EffectGfxMgr.createPlayGfx(this._imageBg.node, itemParams.moving);
        }
        else
        {
            if (this._moving != null) {
                this._moving.node.destroy();
                this._moving = null;
            }
        }
        this._itemParams = itemParams;
    }
    updateIcon(frameInfo, scale) {
        if (!frameInfo || frameInfo == null) {
            return;
        }
        this.updateUI(frameInfo.getId(), scale);
    }
    _onTouchCallBack(sender: cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._callback) {
                this._callback(this._target, this._itemParams);
            }
            if (this._itemParams) {
                cc.warn('CommonIconBase:_onTouchCallBack : ' + this._itemParams.name);
                if (this._isClickFrame) {
                    this.showDetailInfo();
                }
            }
        }
    }
    isClickFrame(...vars) {
        this._isClickFrame = true;
    }
    showDetailInfo(...vars) {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupFrameItemInfo"),function(popup:PopupFrameItemInfo){
            popup.setInitData(null,null);
            popup.openWithAction();
            popup.updateUI(this._itemParams.cfg.id);
            
        }.bind(this))
        
    }
    setFrameBgImg(img) {
        this._imageBg.node.addComponent(CommonUI).loadTexture(img);
    }
    getBgImgSize(...vars) {
        return this._imageBg.node.getContentSize();
    }
    setSelected(visible) {
        this._selectedBg.node.active = (visible);
    }
    setLocked(visible) {
        this._imageLock.node.active = (visible);
    }
    setRedPointVisible(visible) {
        this._redPoint.node.active = (visible);
    }
    setHeadFrameScale(scale) {
        this._imageBg.node.setScale(WIDTH_CONST / WIDTH_CONST * scale);
        this._selectedBg.node.setScale(WIDTH_CONST / WIDTH_CONST * scale);
    }
    setIconMask(needMask) {
        super.setIconMask(needMask);
        this._imageMask.setScale(1.1);
        // this._imageMask.setPosition(WIDTH_CONST / 2, WIDTH_CONST / 2);
        
    }
    setIconSelect(showSelect) {
        super.setIconSelect(showSelect)
        // this._imageSelect.setPosition(WIDTH_CONST / 2, WIDTH_CONST / 2);
        
    }
    setName(name) {
        super.setName(name);
      //  this._labelItemName.node.setPosition(WIDTH_CONST / 2, 14);
    }
    setLevel(level) {
        if (this._textLevel != null) {
            this._textLevel.destroy();
            this._textLevel = null;
        }
        if (this._textLevel == null) {
            var params = {
                name: '_textLevel',
                text: '+' + '0',
                fontSize: 22,
                color: Colors.COLOR_QUALITY[0],
                outlineColor: Colors.COLOR_QUALITY_OUTLINE[0]
            };
            var label = UIHelper.createLabel(params);
            label.setAnchorPoint(new cc.Vec2(0, 0));
            label.setPosition(new cc.Vec2(-45,-50));
            this._imageBg.node.addChild(label);
            this._textLevel = label;
            this._textLevel.getComponent(cc.Label).string = ('Lv ' + level);
        }
    }


}