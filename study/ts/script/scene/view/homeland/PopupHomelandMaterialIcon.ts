const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'

@ccclass
export default class PopupHomelandMaterialIcon extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageArrow: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item3: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;
    _data: any;
    _index: any;

    ctor(data, index) {
        this._data = data;
        this._index = index;

        this.onCreate();
    }
    onCreate() {
        this._updateData();
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        if (this._index == 1) {
            this._imageArrow.node.active = (false);
        } else {
            this._imageArrow.node.active = (true);
        }
        this.node.setAnchorPoint(cc.v2(0, 0));
    }
    _updateData() {
        if (this._data == null) {
            return;
        }
        for (var i = 1; i <= 3; i++) {
            this['_item' + i].node.active = (false);
        }
        this._textLevel.string = (this._data.lv);
        if (this._data.list.length == 0) {
            var updateIcon = this['_item3'];
            var value = this._data.list[0];
            if (updateIcon) {
                updateIcon.unInitUI();
                updateIcon.node.active = (true);
                updateIcon.initUI(value.type, value.value, value.size);
            }
        } else {
            for (var j in this._data.list) {
                var value = this._data.list[j];
                var updateIcon = this['_item' + (parseFloat(j) + 1)];
                if (updateIcon) {
                    updateIcon.unInitUI();
                    updateIcon.node.active = (true);
                    updateIcon.initUI(value.type, value.value, value.size);
                }
            }
        }
    }
}