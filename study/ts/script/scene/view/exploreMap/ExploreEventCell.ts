
import { ExploreConst } from "../../../const/ExploreConst";
import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExploreEventCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _cellNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBase: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLight: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _eventName: cc.Label = null;

    private _eventData;
    private _pos;
    private _onClick;
    private _discoverData;

    public setUp(eventData, pos, onClick) {
        this._eventData = eventData;
        this._pos = pos;
        this._onClick = onClick;
        this._discoverData = G_ConfigLoader.getConfig(ConfigNameConst.EXPLORE_DISCOVER).get(this._eventData.getEvent_type());

        var size = this._cellNode.getContentSize();
        this.node.setContentSize(size);
        this._eventName.string = this._discoverData.name;

        this._imageBase.node.on(cc.Node.EventType.TOUCH_END, this.onPanelClick, this);
    }

    //设置选中太
    _setHighLight() {
        this._imageLight.node.active = true;
        this._eventName.node.color = ExploreConst.TAB_LIGHT_COLOR;
    }
    //设置普通太
    _setNormal() {
        this._imageLight.node.active = false;
        this._eventName.node.color = ExploreConst.TAB_NORMAL_COLOR;
    }
    //设置选中框
    setChoose(choose) {
        if (choose) {
            this._setHighLight();
        } else {
            this._setNormal();
        }
    }
    //点击事件
    onPanelClick() {
        if (this._imageLight.node.active) return;
        this._onClick && this._onClick(this._pos);
    }

}