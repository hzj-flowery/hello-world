import CommonTreasureAvatar from "../../../../ui/component/CommonTreasureAvatar";
import { handler } from "../../../../utils/handler";
import { Lang } from "../../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TreasureTransformNode extends cc.Component {
    @property({ type: CommonTreasureAvatar, visible: true })
    _fileNodeItem: CommonTreasureAvatar = null;
    @property({ type: cc.Label, visible: true })
    _textTip: cc.Label = null;
    @property({ type: cc.Button, visible: true })
    _buttonAdd: cc.Button = null;
    @property({ type: cc.Label, visible: true })
    _textNum: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imageNum: cc.Sprite = null;

    _target: any;
    _type: any;
    _callback: any;
    _itemId: number;
    _itemCount: number;
    _lock: boolean;
    ctor( type, callback) {
        this._type = type;
        this._callback = callback;
        this._initData();
        this._initView();
    }
    _initData() {
        this._itemId = 0;
        this._itemCount = 0;
        this._lock = false;
    }
    _initView() {
        this._fileNodeItem.setTouchEnabled(true);
        this._fileNodeItem.setCallBack(handler(this, this._onClickItem));
        this._textTip.string = (Lang.get('transform_choose_tip' + this._type, { name: Lang.get('transform_tab_icon_2') }));
    }
    _resetView() {
        this._fileNodeItem.node.opacity = (255);
        this._fileNodeItem.node.active = (false);
        this._textTip.node.active = (false);
        this._buttonAdd.node.active = (false);
        this._imageNum.node.active = (false);
    }
    updateUI() {
        this._resetView();
        if (this._lock) {
            return;
        }
        if (this._itemId > 0) {
            this._fileNodeItem.updateUI(this._itemId);
            this._fileNodeItem.node.active = (true);
        } else {
            this._buttonAdd.node.active = (true);
            this._textTip.node.active = (true);
        }
        if (this._itemCount > 1) {
            this._textNum.string = (Lang.get('transform_choose_count', {
                name: Lang.get('transform_tab_icon_2'),
                count: this._itemCount
            }));
            this._imageNum.node.active = (true);
        }
    }
    setLock(lock) {
        this._lock = lock;
    }
    setItemId(itemId) {
        this._itemId = itemId;
    }
    getItemId() {
        return this._itemId;
    }
    setItemCount(count) {
        this._itemCount = count;
    }
    getItemCount() {
        return this._itemCount;
    }
    onButtonAddClicked() {
        if (this._callback) {
            this._callback();
        }
    }
    _onClickItem() {
        if (this._callback) {
            this._callback();
        }
    }
    setEnabled(enable) {
        this._fileNodeItem.setTouchEnabled(enable);
        this._buttonAdd.enabled = (enable);
    }
    getItemNode() {
        return this._fileNodeItem;
    }
}