import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { HomelandConst } from "../../../const/HomelandConst";
import { Lang } from "../../../lang/Lang";
import { HomelandHelp } from "./HomelandHelp";
import { Colors, G_EffectGfxMgr } from "../../../init";
import { stringUtil } from "../../../utils/StringUtil";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

var EFFECT_COLOR = {
    [3]: 'effect_shenshu_chouqian_languang',
    [4]: 'effect_shenshu_chouqian_ziguang',
    [5]: 'effect_shenshu_chouqian_huangguang'
};

@ccclass
export default class HomelandPraySignNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectBack: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMid: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectMid: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFront: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textColor: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDes: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTime: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectFront: cc.Node = null;
    _pos: any;
    _callback: any;
    _canClick: boolean;
    _data: any;


    ctor(pos, callback) {
        this._pos = pos;
        this._callback = callback;
        this._canClick = true;
        UIHelper.addEventListenerToNode(this.node, this._imageBack.node, 'HomelandPraySignNode', '_onClick');
    }
    onLoad() {
        this._imageMid.node.active = (false);
    }
    updateUI(data) {
        this._data = data;
        if (data) {
            this._imageBack.node.active = (false);
            this._imageFront.node.active = (true);
            var info = data.getConfig();
            this._textColor.string = (info.color_text);
            this._textName.string = (info.name);
            var strTime = '';
            if (info.type == HomelandConst.TREE_BUFF_TYPE_3) {
                strTime = Lang.get('homeland_buff_duration');
            }
            this._textTime.string = (strTime);
            var template = stringUtil.gsub(info.description, '#%w+#', '$c103_%1$');
            var value = HomelandHelp.getValueOfBuff(info.value, info.equation);
            var times = HomelandHelp.getTimesOfBuff(info.times, info.type);
            var formatStr = Lang.getTxt(template, {
                value: value,
                times: times
            });
            var params = {
                defaultColor: Colors.NORMAL_BG_ONE,
                defaultSize: 20
            };
            var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
            richText.node.setAnchorPoint(cc.v2(0.5, 1));
            richText.maxWidth = 160;
            this._nodeDes.removeAllChildren();
            this._nodeDes.addChild(richText.node);
        } else {
            this._imageBack.node.active = (true);
            this._imageFront.node.active = (false);
            G_EffectGfxMgr.createPlayGfx(this._nodeEffectBack, 'effect_shenshu_chouqian_xiaoxingxing', null, null, null);
        }
    }
    playEnterEffect() {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectFront, 'effect_shenshu_chouqianfaguang', null, null, null);
    }
    playDrawEffect() {
        G_EffectGfxMgr.createPlayGfx(this._nodeEffectFront, 'effect_shenshu_chouqian_shanbai', null, null, null);
        this._nodeEffectMid.active = (true);
        this._imageMid.node.active = (true);
        var color = this._data.getConfig().color;
        var midEffectName = EFFECT_COLOR[color];
        if (midEffectName) {
            G_EffectGfxMgr.createPlayGfx(this._nodeEffectMid, midEffectName, null, null, null);
        }
    }
    stopDrawEffect() {
        this._nodeEffectMid.active = (false);
        this._imageMid.node.active = (false);
    }
    _onClick() {
        if (this._canClick && this._callback) {
            this._callback(this._pos);
        }
    }
    setClickEnable(enable) {
        this._canClick = enable;
    }
}