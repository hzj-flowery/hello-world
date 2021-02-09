import EquipDetailDynamicModule from "../equipment/EquipDetailDynamicModule";
import EquipConst from "../../../const/EquipConst";
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import { EquipTrainHelper } from "../equipTrain/EquipTrainHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors, G_SceneManager } from "../../../init";
import { handler } from "../../../utils/handler";
import { FunctionCheck } from "../../../utils/logic/FunctionCheck";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailJadeNode extends EquipDetailDynamicModule {
    _equipData: any;
    _rangeType: any;
    _contentHeight: number;

    _listAttrDes: CommonDesValue[] = [];
    _noAttrTips: cc.Node;

    onLoad() {
        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_jade'));

        this._commonButtonLevel2Highlight.setString(Lang.get('equipment_detail_btn_jade'));
        this._commonButtonLevel2Highlight.addClickEventListenerEx(handler(this, this._onButtonJadeClicked));

        this._listAttrDes.push(this._commonDesValue);

    }

    setEquipData(equipData, rangeType) {
        this._equipData = equipData;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;
        this.updateView();
    }
    updateView() {
        this._contentHeight = 0;

        for (var des of this._listAttrDes) {
            des.node.active = false;
        }
        if (this._noAttrTips) {
            this._noAttrTips.active = false;
        }
        this._commonButtonLevel2Highlight.node.active = false;

        this._createTitle();
        this._addAttrDes();
        var offset = 45;
        if (FunctionCheck.funcIsShow(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)) {
            this._createButton();
        } else {
            offset = 10;
        }
        this._contentHeight += offset;
        this._listView.height = this._contentHeight;
    }
    _createTitle() {
        var title = this._commonDetailTitleWithBg;
        this._contentHeight += 50;
        title.node.setPosition(201, -(this._contentHeight - 30));
    }
    _addAttrDes() {
        var attrInfo = EquipTrainHelper.getEquipJadeAttr(this._equipData);
        if (attrInfo.length > 0) {
            var flag = 0;
            var index = 0;
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
            this._noAttrTip(Lang.get('jade_no_inject_jade'));
        }
    }
    _appendAttr(index, data) {
        var k = data.type, v = data.value;
        var name = null;
        if (data.property == 1) {
            name = Lang.get('jade_texing'), value = data.description;
        } else {
            var arr = TextHelper.getAttrBasicText(k, v)
            var name = arr[0], value = arr[1];
        }
        name = TextHelper.expandTextByLen(name, 4);
        if (!this._listAttrDes[index]) {
            var attrDes = cc.instantiate(this._commonDesValue.node).getComponent(CommonDesValue);
            this._listView.addChild(attrDes.node);
            this._listAttrDes[index] = attrDes;
        }
        var node = this._listAttrDes[index];
        node.node.active = true;
        node.setFontSize(20);
        node.updateUI(name + '\uFF1A', value);
        var height = 30;
        if (data.property == 1) {
            var h = node.setValueToRichText(value, 270);
            height = h > height && h || height;

            this._contentHeight += height;
            node.node.setPosition(24, -(this._contentHeight - height + 10));
        } else {
            this._contentHeight += height;
            node.node.setPosition(24, -(this._contentHeight - 20));
        }
    }
    _noAttrTip(text) {
        if (!this._noAttrTips) {
            var label = UIHelper.createLabel({
                text: text,
                fontSize: 20,
                color: Colors.BRIGHT_BG_TWO
            });
            label.setAnchorPoint(cc.v2(0, 0.5));
            this._noAttrTips = label;
            this._listView.addChild(this._noAttrTips);
        }
        this._noAttrTips.active = true;
        this._contentHeight += 26;
        this._noAttrTips.setPosition(24, -this._contentHeight);
    }
    _createButton() {
        var btn = this._commonButtonLevel2Highlight;
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0];
        btn.node.active = (isOpen);
        this._contentHeight += 40;
        btn.node.setPosition(324, -this._contentHeight);
        var redPoint = EquipTrainHelper.needJadeRedPoint(this._equipData.getId());
        btn.showRedPoint(redPoint);
    }
    _onButtonJadeClicked() {
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3) == false) {
            return;
        }
        var equipId = this._equipData.getId();
        G_SceneManager.showScene('equipTrain', equipId, EquipConst.EQUIP_TRAIN_JADE, this._rangeType, true);
    }
}