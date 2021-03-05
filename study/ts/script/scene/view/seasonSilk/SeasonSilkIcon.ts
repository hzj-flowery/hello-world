import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { Colors, G_UserData, G_EffectGfxMgr } from "../../../init";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SeasonSilkIcon extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _imageMidBg: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageIcon: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageDark: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageText_0: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeEffect: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnClose: cc.Button = null;

    private _index;
    private _silkData;
    private _clickCallBack;
    public init(index, callback) {
        this._index = index;
        this._silkData = {};
        this._clickCallBack = callback;
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelTouch));
    }
    private _initView() {
        this._imageMidBg.node.active = false;
        this._imageSelected.node.active = false;
        this._imageDark.node.active = false;
        this._btnClose.node.active = false;
        this._textName.string = Lang.get('silkbag_no_wear');
        this._textName.node.color = (Colors.BRIGHT_BG_TWO);
        UIHelper.enableOutline(this._textName, Colors.BRIGHT_BG_OUT_LINE_TWO);
    }

    public updateUI(data) {
        this._initView();
        this._silkData = data;
        if (data.silkId > 0) {
            var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, data.silkId);
            UIHelper.loadTexture(this._imageMidBg, param.icon_mid_bg2);
            UIHelper.loadTexture(this._imageIcon, param.icon);
            this._textName.string = param.name;
            this._textName.node.color = (param.icon_color);
            UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
            this._imageMidBg.node.active = true;
            this._btnClose.node.active = true;
        } else {
            this._textName.string = Lang.get('silkbag_no_wear');
            this._textName.node.color = (Colors.BRIGHT_BG_TWO);
            UIHelper.enableOutline(this._textName, Colors.BRIGHT_BG_OUT_LINE_TWO);
        }
    }

    public playEffect(effectName) {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffect, effectName);
    }

    public setSelected(selected) {
        this._imageSelected.node.active = selected;
    }

    private _onPanelTouch() {
        if (this._clickCallBack) {
            this._clickCallBack(this._index, this._silkData);
        }
    }

    public onClickClose() {
        if (this._silkData.silkId <= 0) {
            return;
        }
        this._silkData.silkbag[this._silkData.silkPos - 1] = 0;
        G_UserData.getSeasonSport().c2sFightsSilkbagSetting(this._silkData.groupPos, this._silkData.groupName, this._silkData.silkbag);
        if (this._clickCallBack) {
            this._clickCallBack(this._index, this._silkData);
        }
    }
}