import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import { G_EffectGfxMgr } from "../../../init";
import ListViewCellBase from "../../../ui/ListViewCellBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeasonSilkIconCell extends ListViewCellBase {
    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;
    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;
    @property({ type: cc.Sprite, visible: true })
    _imageColor: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageIcon: cc.Sprite = null;
    _index: any;
    _silkData: {};
    _clickCallBack: any;


    ctor(index, callback) {
        this._index = index;
        this._silkData = {};
        this._clickCallBack = callback;
        this.node.name = 'SeasonSilkIconCell';
    }

    onCreate() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._panelTouch.setTouchEnabled(false);
        this._imageColor.node.active = (false);
    }

    updateUI(data) {
        this._silkData = data;
        if (data.silkId > 0) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.silkId);
            UIHelper.loadTexture(this._imageIcon, param.icon);
            var baseId = data.silkId;
            this._imageColor.node.active = (true);
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, baseId);
            UIHelper.loadTexture(this._imageColor, param.icon_mid_bg2);
        } else {
            this._imageColor.node.active = (false);
        }
    }

    playEffect(effectName) {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
    }

    _onPanelTouch() {
        if (this._clickCallBack) {
            this._clickCallBack(this._index, this._silkData);
        }
    }
}
