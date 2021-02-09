import PopupBase from "./PopupBase";
import { Lang } from "../lang/Lang";
import PopupHelpInfoCell from "./PopupHelpInfoCell";
import { Util } from "../utils/Util";
import PopupHelpInfoTitleCell from "./PopupHelpInfoTitleCell";
import { FunctionConst } from "../const/FunctionConst";

const { ccclass, property } = cc._decorator;
@ccclass
export class PopupHelpInfo extends PopupBase {
    static preLoadRes = [
        'prefab/common/PopupHelpInfoCell',
        'prefab/common/PopupHelpInfoTitleCell'
    ];
    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _title: cc.Label = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    private spaceY: number = 8;

    updateByFunctionId(functionId, param) {
        var funcName = FunctionConst.getFuncName(functionId);
        var txtData = Lang.get(funcName);
        if (this._isTxtList(txtData)) {
            this.updateUI(txtData);
        } else {
            txtData = Lang.getTableTxt(txtData, param);
            this.updateUIForHasSubTitle(txtData);
        }
    }

    updateByLangName(langName) {
        var txtData = Lang.get(langName);
        if (this._isTxtList(txtData)) {
            this.updateUI(txtData);
        } else {
            this.updateUIForHasSubTitle(txtData);
        }
    }

    updateUI(txtList) {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        for (var k in txtList) {
            var txt = txtList[k];
            var itemWidget = this._createItem(txt);
            this.addNode(itemWidget.node);
        };
        this._listView.scrollToTop();
    }

    _createItem(txt) {
        var cell: PopupHelpInfoCell = Util.getNode('prefab/common/PopupHelpInfoCell', PopupHelpInfoCell);
        cell.updateUI(txt, null);
        return cell;
    }

    _createTitle(txt) {
        var cell: PopupHelpInfoTitleCell = Util.getNode('prefab/common/PopupHelpInfoTitleCell', PopupHelpInfoTitleCell);
        cell.updateUI(txt);
        return cell;
    }

    updateUIForHasSubTitle(txtData) {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        for (var k in txtData) {
            var v = txtData[k];
            var itemWidget = this._createTitle(v.title);
            this._listView.content.addChild(itemWidget.node);
            this._listView.content.height += (26);
            itemWidget.node.x = 0;
            itemWidget.node.y = -this._listView.content.height;
            this._listView.content.height += 26;
            for (var t in v.list) {
                var txt = v.list[t];
                var itemWidget2 = this._createItem(txt);
                this._listView.content.addChild(itemWidget2.node);
                itemWidget2.node.x = 0;
                itemWidget2.node.y = -this._listView.content.height - itemWidget2.node.height;
                this._listView.content.height += itemWidget2.node.height + this.spaceY;

                // itemWidget2.node.y = -this._listView.content.height - this.spaceY+26;
                // this._listView.content.height += this.spaceY;
            }
        }
    }

    _isTxtList(data) {
        for (var k in data) {
            var v = data[k];
            if (typeof (v) == 'object') {
                return false;
            }
        }
        return true;
    }

    private addNode(node: cc.Node): void {
        this._listView.content.addChild(node);
        node.y = -this._listView.content.height - this.spaceY - node.height;
        this._listView.content.height += (node.height + this.spaceY);
    }

}