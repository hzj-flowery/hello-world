const { ccclass, property } = cc._decorator;

import CommonTabIcon from '../../../ui/component/CommonTabIcon'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { FunctionConst } from '../../../const/FunctionConst';

@ccclass
export default class RecoveryTableItem extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourcePanel: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTop: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLink: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBottom: cc.Sprite = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon: CommonTabIcon = null;

    tag;
    _clickCallBack: any;

    setTag(value) {
        this.tag = value;
    }

    getTag() {
        return this.tag;
    }

    initData(clickCallBack) {
        this._clickCallBack = clickCallBack;
    }
    onCreate() {
        var size = this._resourcePanel.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._resourcePanel.active = (false);
    }
    onEnter() {
    }
    onExit() {
    }
    _updateState(bLast) {
        this._resourcePanel.active = (true);
        this._nodeTabIcon.node.active  = (!bLast);
        this._imageTop.node.active = (!bLast);
        this._imageBottom.node.active = (bLast);
    }
    showRedPoint(bShow) {
        this._nodeTabIcon.showRedPoint(bShow);
    }
    setSelected(bSelect) {
        this._nodeTabIcon.setSelected(bSelect);
    }
    updateUI(bLast, index, value) {
        this._updateState(bLast);
        if (bLast) {
            return;
        }
        function clickItem(value) {
            if (this._clickCallBack) {
                this._clickCallBack(value);
            }
        }
        var txt = Lang.get('recovery_tab_title_' + value);
        var [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst['FUNC_RECOVERY_TYPE' + value]);
        this._nodeTabIcon.updateUI(txt, isOpen, value);
        this._nodeTabIcon.setCallback(clickItem);
    }

}