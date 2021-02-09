import { TacticsConst } from "../../../const/TacticsConst";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { handler } from "../../../utils/handler";
import UIHelper from "../../../utils/UIHelper";
const { ccclass, property } = cc._decorator;

@ccclass
export class TacticsTopItemModule extends ListViewCellBase {
    private _target: any;
    @property({
        type: cc.Node,
        visible: true
    }) _panelClick: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imgBg: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    }) _txtNum: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    }) _imgIcon: cc.Sprite = null;
    private _color: any;
    ctor(target) {
        this._target = target;
        //this._panelClick.addClickEventListenerEx(handler(this, this._onClick), true, null, 0);
    }
    _onClick(sender) {
    }
    init(color) {
        this._color = color;
        var path = TacticsConst['TOP_ITEM_COLOR_' + color] || TacticsConst.TOP_ITEM_COLOR_5;
        UIHelper.loadTexture(this._imgIcon, path);
    }
    updateInfo() {
        var [num, totalNum] = TacticsDataHelper.getTacticsNumInfoByColor(this._color);
        this._txtNum.string = (num + ('/' + totalNum));
    }
}