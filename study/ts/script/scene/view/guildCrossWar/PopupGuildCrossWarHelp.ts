import PopupBase from "../../../ui/PopupBase";
import { FunctionConst } from "../../../const/FunctionConst";
import { Lang } from "../../../lang/Lang";
import { Util } from "../../../utils/Util";
import PopupHelpInfoCell from "../../../ui/PopupHelpInfoCell";
import PopupHelpInfoTitleCell from "../../../ui/PopupHelpInfoTitleCell";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupGuildCrossWarHelp extends PopupBase {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    onCreate() {
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(txtList) {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        for (var k = 0; k < txtList.length; k++) {
            var txt = txtList[k];
            var itemWidget = this._createItem(txt);
            this._listView.content.addChild(itemWidget.node);
            itemWidget.node.x = 0;
            this._listView.content.height += itemWidget.node.height;
            itemWidget.node.y = -this._listView.content.height;
        }
    }
    updateUIForHasSubTitle(txtData) {
        this._listView.content.removeAllChildren();
        this._listView.content.height = 0;
        for (var k = 0; k < txtData.length; k++) {
            var v = txtData[k];
            var itemWidget = this._createTitle(v.title);
            this._listView.content.addChild(itemWidget.node);
            itemWidget.node.x = 0;
            this._listView.content.height += itemWidget.node.height;
            itemWidget.node.y = -this._listView.content.height;
            for (var i = 0; i < v.list.length; i++) {
                var txt = v.list[i];
                var liss = this._createItem(txt);
                this._listView.content.addChild(liss.node);
                liss.node.x = 0;
                this._listView.content.height += liss.node.height;
                liss.node.y = -this._listView.content.height;
            }
        }
    }
    updateByFunctionId(functionId) {
        var funcName = FunctionConst.getFuncName(functionId);
        var txtData = Lang.get(funcName);
        if (this._isTxtList(txtData)) {
            this.updateUI(txtData);
        } else {
            this.updateUIForHasSubTitle(txtData);
        }
    }
    _createItem(txt) {
        var cell = Util.getNode("prefab/guildCrossWar/PopupHelpInfoCell", PopupHelpInfoCell) as PopupHelpInfoCell;
        cell.updateUI(txt, 280);
        return cell;
    }
    _createTitle(txt) {
        var cell = Util.getNode("prefab/guildCrossWar/PopupHelpInfoTitleCell", PopupHelpInfoTitleCell) as PopupHelpInfoTitleCell;
        cell.updateUI(txt);
        return cell;
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
    onClickClose() {
        this.close();
    }
}