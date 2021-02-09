import { G_UserData } from "../../../init";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonNormalMiniPop4 from "../../../ui/component/CommonNormalMiniPop4";
import PopupBase from "../../../ui/PopupBase";
import { AttrDataHelper } from "../../../utils/data/AttrDataHelper";
import { table } from "../../../utils/table";
import { TextHelper } from "../../../utils/TextHelper";
import { BoutHelper } from "./BoutHelper";
const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupAttrOverView extends PopupBase{
    name: 'PopupAttrOverView';
    @property({
        type: CommonNormalMiniPop4,
        visible: true
    })
    _commonNodeBk: CommonNormalMiniPop4 = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _panelAttr: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _boutName: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CommonDesValue: cc.Prefab = null;

    
    
    
    private _attrPanelSize:cc.Size;
    onCreate() {
        this._attrPanelSize = this._panelAttr.getContentSize();
        this._commonNodeBk.addCloseEventListener(()=> {
            this.close();
        });
    }
    onEnter() {
        this._updateUI();
        this._acquiredBout();
    }
    onExit() {
    }
    _acquiredBout() {
        var nameList = '';
        var boutList = G_UserData.getBout().getBoutList();
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var boutInfo = G_UserData.getBout().getBoutInfo();
        var list = G_UserData.getBout().getBoutAcquire();
        var count = table.nums(list);
        if (boutList[curBoutId] && table.nums(boutList[curBoutId]) > 0) {
            count = count + 1;
        }
        count = cc.misc.clampf(1, count, table.maxn(boutInfo));
        for (var i = 1; i <= count; i++) {
            var info = BoutHelper.getBoutBaseItem(i);
            var ser = i == 1?(nameList):nameList + '、';
            if (i == 5) {
                ser = ser + '\n';
            }
            nameList = ser + info.name;
        }
        this._boutName.string = (nameList);
    }
    _updateUI() {
        this._panelAttr.removeAllChildren();
        var count = 1;
        var result = {};
        AttrDataHelper.appendAttr(result, G_UserData.getBout().getAttrSingleInfo());
        for (let k in result) {
            var v = result[k];
            var [attrName, attrValue] = TextHelper.getAttrBasicText(k, v);
            attrName = TextHelper.expandTextByLen(attrName, 4);
            var uiNode = cc.instantiate(this._CommonDesValue).getComponent(CommonDesValue);
            uiNode.updateUI(attrName + ': ', attrValue,null,4);
            var posX = count % 2 == 1 ? -143*1.2:143/2;
            var posY = - Math.ceil(count / 2) * 30;
            uiNode.node.setPosition(cc.v2(posX, posY));
            uiNode.setFontSize(20);
            this._panelAttr.addChild(uiNode.node);
            count = count + 1;
        }
    }
}