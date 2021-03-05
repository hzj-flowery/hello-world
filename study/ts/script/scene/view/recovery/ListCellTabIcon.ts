import RecoveryTableItem from "./RecoveryTableItem";
import { Lang } from "../../../lang/Lang";
import { FunctionConst } from "../../../const/FunctionConst";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ListCellTabIcon extends RecoveryTableItem {
    _clickCallBack: any;
    _txtListPrex: string;
    _funcConstPre: string;

    init(clickCallBack) {
        this._clickCallBack = clickCallBack;
        this._txtListPrex = 'recovery_tab_title_';
        this._funcConstPre = 'FUNC_RECOVERY_TYPE';
    }
    onLoad() {
        var size = this._resourcePanel.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    setTxtListPrex(txtPrex) {
        this._txtListPrex = txtPrex;
    }

    setFuncionConstPrex(funcPrex) {
        this._funcConstPre = funcPrex;
    }

    _updateState(bLast) {
        // this._resourcePanel.active = (true);
        // this._nodeTabIcon.node.active = (!bLast);
        // this._imageTop.node.active = (!bLast);
        // this._imageBottom.node.active = (!bLast);
        // this._imageLink.node.active = (!bLast);
    }
    showRedPoint(bShow) {
        this._nodeTabIcon.showRedPoint(bShow);
    }
    setSelected(bSelect) {
        this._nodeTabIcon.setSelected(bSelect);
    }
    updateUI(bLast, index, value, lastIndex) {
        this.setTag(value);
        this._imageTop.node.active = (index == 0);
        this._imageBottom.node.active = bLast;
        this._imageLink.node.active = (!bLast);
        var size = this._resourcePanel.getContentSize();
        this.node.setContentSize(size);
        // if (bLast) {
        //     //  this._resourcePanel.y = (Math.abs(this._imageBottom.node.y));
        //     this.node.setContentSize(size.width, size.height + Math.abs(this._imageBottom.node.y))
        // } else {
        //     //      this._resourcePanel.y = (Math.abs(this._imageLink.node.y) - 6);
        //     this.node.setContentSize(size.width, size.height + Math.abs(this._imageLink.node.y) - 6)
        // }

        var txt = Lang.get(this._txtListPrex + value);
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst[this._funcConstPre + value])[0];
        this._nodeTabIcon.updateUI(txt, isOpen, value);
        this._nodeTabIcon.setCallback(handler(this, this.clickItem));
    }

    clickItem(value) {
        if (this._clickCallBack) {
            this._clickCallBack(value);
        }
    }
}