import PopupBase from "../../../ui/PopupBase";
import CommonButtonLevel0Normal from "../../../ui/component/CommonButtonLevel0Normal";
import { Lang } from "../../../lang/Lang";
import { G_EffectGfxMgr } from "../../../init";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
var POSX = {
    [1]: [0],
    [2]: [
        -81,
        82
    ]
};
@ccclass
export default class PopupRedRainSettlement extends PopupBase {
    public static path = 'redPacketRain/PopupRedRainSettlement';
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTextMoney: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBig: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBigNum: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSmall: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textSmallNum: cc.Label = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonClose: CommonButtonLevel0Normal = null;
    _data: any;
    _onExitCallback: any;


    ctor(data, onExitCallback) {
        this._data = data;
        this._onExitCallback = onExitCallback;
        this._buttonClose.addClickEventListenerEx(handler(this, this._onClickClose));
    }
    onCreate() {
        this._textNum.string = ((this._data.money).toString());
        var bigNum = this._data.bigNum;
        var smallNum = this._data.smallNum;
        this._textBigNum.string = (Lang.get('red_packet_rain_big_num', { num: bigNum }));
        this._textSmallNum.string = (Lang.get('red_packet_rain_small_num', { num: smallNum })); this._nodeBig.active = (bigNum > 0);
        this._nodeSmall.active = (smallNum > 0);
        var showCount = 0;
        var showNodes = [];
        if (bigNum > 0) {
            showNodes.push(this._nodeBig);
            showCount = showCount + 1;
        }
        if (smallNum > 0) {
            showNodes.push(this._nodeSmall);
            showCount = showCount + 1;
        }
        for (var i in showNodes) {
            var node: cc.Node = showNodes[i];
            node.x = (POSX[showCount][i]);
        }
        var size = this._textNum.node.getContentSize();
        var posX = this._textNum.node.x;
        this._imageTextMoney.node.x = (posX + size.width);
        this._buttonClose.setString(Lang.get('red_pacekt_rain_settlement_confirm_btn'));
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, 'moving_gongxizhugong', null, null, false);
    }
    onEnter() {
    }
    onExit() {
        if (this._onExitCallback) {
            this._onExitCallback();
        }
    }
    _onClickClose() {
        this.close();
    }
}