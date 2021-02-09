import { FunctionConst } from "../../../const/FunctionConst";
import TreasureConst from "../../../const/TreasureConst";
import { Colors, G_SceneManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel2Highlight from "../../../ui/component/CommonButtonLevel2Highlight";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonDetailDynamicModule from "../../../ui/component/CommonDetailDynamicModule";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
import { TreasureTrainHelper } from "../treasureTrain/TreasureTrainHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export class TreasureDetailJadeNode extends CommonDetailDynamicModule {
    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonDetailTitleWithBg: cc.Prefab = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _textDesNode: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonDesValue: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _commonButtonLevel2Highlight: cc.Prefab = null;



    private _treasureData: any;
    private _rangeType: any;

    init(treasureData, rangeType) {
        this._treasureData = treasureData;
        this._rangeType = rangeType || TreasureConst.TREASURE_RANGE_TYPE_1;
    }
    onCreate() {
        var title = this._createTitle();
        this._listView.pushBackCustomItem(title);
        this._addAttrDes();
        var offset = 45;
        if (LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)) {
            var btnWidget = this._createButton();
            this._listView.pushBackCustomItem(btnWidget);
        } else {
            offset = 10;
        }
        this._listView.doLayout();
        var contentSize = this._listView.getInnerContainerSize();
        contentSize.height = contentSize.height + offset;
        this._listView.node.setContentSize(contentSize);
        this.node.setContentSize(contentSize);
        this.scheduleOnce(() => {
            this._listView.content.position = cc.v3(0, contentSize.height, 0);
        }, 0.1)

    }
    _createTitle() {
        var title = cc.instantiate(this._commonDetailTitleWithBg).getComponent(CommonDetailTitleWithBg);
        title.setFontSize(24);
        title.setTitle(Lang.get('equipment_detail_title_jade'));
        var widget = new cc.Node();
        var titleSize = cc.size(402, 50);
        widget.setContentSize(titleSize);
        title.node.setPosition(titleSize.width / 2, 30);
        widget.addComponent(ListViewCellBase);
        widget.addChild(title.node);
        return widget;
    }
    _addAttrDes() {
        var attrInfo = TreasureTrainHelper.getTreasureJadeAttr(this._treasureData);
        if (attrInfo.length > 0) {
            var flag = 0;
            var index = 1;
            for (var i in attrInfo) {
                var data = attrInfo[i];
                if (data.isSuitable) {
                    this._appendAttr(index, data);
                    index = index + 1;
                    flag = 1;
                }
            }
            if (flag == 0) {
                this._noAttrTip(Lang.get('jade_inject_not_effective'));
            }
        } else {
            this._noAttrTip(Lang.get('jade_no_inject_jade_treasure'));
        }
    }
    _appendAttr(index, data) {
        var widget = new cc.Node();
        var k = data.type, value = data.value;
        var name = null;
        if (data.property == 1) {
            [name, value] = [Lang.get('jade_texing'), data.description];
        } else {
            [name, value] = TextHelper.getAttrBasicText(k, value);
        }
        name = TextHelper.expandTextByLen(name, 4);
        var node = cc.instantiate(this._commonDesValue).getComponent(CommonDesValue);
        node.setFontSize(20);
        node.updateUI(name + '\uFF1A', value);
        var height = 30;
        if (data.property == 1) {
            var h = node.setValueToRichText(value, 270);
            height = h > height && h || height;
            node.node.setPosition(24, height - 10);
        } else {
            node.node.setPosition(24, 20);
        }
        widget.addChild(node.node);
        widget.setContentSize(cc.size(402, height));
        this._listView.pushBackCustomItem(widget);
    }
    _noAttrTip(text) {
        var widget = new cc.Node();
        var label = UIHelper.createLabel({
            text: text,
            fontSize: 20,
            color: Colors.BRIGHT_BG_TWO
        });
        widget.addChild(label);
        var size = label.getContentSize();
        label.setAnchorPoint(cc.v2(0, 0.5));
        label.setPosition(24, 0);
        widget.setContentSize(cc.size(402, 26));
        this._listView.pushBackCustomItem(widget);
    }
    _createButton() {
        var widget = new cc.Node();
        var btn = cc.instantiate(this._commonButtonLevel2Highlight).getComponent(CommonButtonLevel2Highlight);
        btn.setString(Lang.get('equipment_detail_btn_jade'));
        btn.addClickEventListenerEx(handler(this, this._onButtonJadeClicked));
        var isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3);
        btn.setEnabled(isOpen);
        widget.addChild(btn.node);
        btn.node.setPosition(324, 0);
        widget.setContentSize(cc.size(402, 40));
        var redPoint = TreasureTrainHelper.needJadeRedPoint(this._treasureData.getId());
        btn.showRedPoint(redPoint);
        return widget;
    }
    _onButtonJadeClicked() {
        if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3) == false) {
            return;
        }
        var treasureId = this._treasureData.getId();
        G_SceneManager.showScene('treasureTrain', treasureId, TreasureConst.TREASURE_TRAIN_JADE, this._rangeType, true);
    }
}