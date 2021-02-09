import PopupBase from "../../../ui/PopupBase";
import { FunctionConst } from "../../../const/FunctionConst";
import { Lang } from "../../../lang/Lang";
import PopupHelpInfoCell from "../../../ui/PopupHelpInfoCell";
import PopupHelpInfoTitleCell from "../../../ui/PopupHelpInfoTitleCell";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupQinTombHelp extends PopupBase {

    @property({ type: cc.Sprite, visible: true })
    _resourceNode: cc.Sprite = null;

    @property({ type: cc.Button, visible: true })
    _buttonClose: cc.Button = null;

    @property({ type: cc.ScrollView, visible: true })
    _listView: cc.ScrollView = null;
    @property({ type: cc.Prefab, visible: true })
    _helpInfoCellPrefab: cc.Prefab = null;
    @property({ type: cc.Prefab, visible: true })
    _helpInfoTitleCellPrefab: cc.Prefab = null;

    public updateUI(txtList) {
        this._listView.content.removeAllChildren();
        for (let k in txtList) {
            var txt = txtList[k];
            var itemWidget = this._createItem(txt);
            this._listView.content.addChild(itemWidget);
        }
    }

    public updateUIForHasSubTitle(txtData) {
        this._listView.content.removeAllChildren();
        for (let k in txtData) {
            var v = txtData[k];
            var itemWidget = this._createTitle(v.title);
            this._listView.content.addChild(itemWidget);
            for (k in v.list) {
                var txt = v.list[k];
                var itemWidget = this._createItem(txt);
                this._listView.content.addChild(itemWidget);
            }
        }
    }

    public updateByFunctionId(functionId) {
        this.setClickOtherClose(true);
        var funcName = FunctionConst.getFuncName(functionId);
        var txtData = Lang.get(funcName);
        if (this._isTxtList(txtData)) {
            this.updateUI(txtData);
        } else {
            this.updateUIForHasSubTitle(txtData);
        }
    }

    private _createItem(txt): cc.Node {
        var cell = cc.instantiate(this._helpInfoCellPrefab).getComponent(PopupHelpInfoCell);
        cell.updateUI(txt, 280);
        cell.node.setAnchorPoint(0, 0.5);
        return cell.node;
    }

    private _createTitle(txt): cc.Node {
        var cell = cc.instantiate(this._helpInfoTitleCellPrefab).getComponent(PopupHelpInfoTitleCell);
        cell.updateUI(txt);
        cell.node.setAnchorPoint(0, 0);
        cell.node.children[0].y = 0;
        return cell.node;
    }

    private _isTxtList(data) {
        for (let k in data) {
            var v = data[k];
            if (typeof (v) == 'object') {
                return false;
            }
        }
        return true;
    }

    public onClickClose() {
        this.close();
    }
}