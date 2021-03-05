import EquipDetailDynamicModule from "../equipment/EquipDetailDynamicModule";
import EquipConst from "../../../const/EquipConst";
import { Lang } from "../../../lang/Lang";
import { RedPointHelper } from '../../../data/RedPointHelper';
import { FunctionConst } from "../../../const/FunctionConst";
import { G_ConfigLoader, G_UserData, Colors, G_SceneManager } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import { EquipDataHelper } from "../../../utils/data/EquipDataHelper";
import { TextHelper } from "../../../utils/TextHelper";
import { handler } from "../../../utils/handler";
import { EquipTrainHelper } from "../equipTrain/EquipTrainHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailStrengthenNode extends EquipDetailDynamicModule {
    _equipData: any;
    _rangeType: any;
    _isFromLimit: any;

    _contentHeight: number;

    private _levelDes: CommonDesValue;

    private _attrDes: CommonDesValue;

    onLoad() {
        this.node.name = "EquipDetailStrengthenNode";
        this._commonButtonLevel2Highlight.setButtonName("ButtonStrengthen");
        this._commonButtonLevel2Highlight.setString(Lang.get('equipment_detail_btn_strengthen'));
        this._commonButtonLevel2Highlight.addClickEventListenerEx(handler(this, this._onButtonStrengthenClicked));

        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_strengthen'));

        this._levelDes = this._commonDesValue;

        this._attrDes = cc.instantiate(this._commonDesValue.node).getComponent(CommonDesValue);
        this._listView.addChild(this._attrDes.node);
    }

    setEquipData(equipData, rangeType?, isFromLimit?) {
        this._equipData = equipData;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;
        this._isFromLimit = isFromLimit || false;
        this.updateView();
    }
    updateView() {
        this._commonMasterInfoNode.node.active = false;
        this._commonButtonLevel2Highlight.node.active = false;

        this._contentHeight = 0;
        this._createTitle();
        var offset = 0;
        if (this._equipData.isUserEquip() && !this._isFromLimit) {
            this._createButton();
        } else {

            offset = 10;
        }
        this._createLevelDes();
        this._createAttrDes();
        if (!this._isFromLimit) {
            this._createMasterDes();
        }
        this._contentHeight += offset;
        this._listView.height = this._contentHeight;
        this.node.setContentSize(this._listView.width, this._listView.height);
    }
    _createTitle() {
        var title = this._commonDetailTitleWithBg;
        this._contentHeight += 50;
        title.node.setPosition(201, -(this._contentHeight - 30));
    }
    _createLevelDes() {
        var des = Lang.get('equipment_detail_strengthen_level');
        var value = this._equipData.getLevel();
        var ratio = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(12).content / 1000;
        var max = Math.floor(G_UserData.getBase().getLevel() * ratio);
        var color = value < max && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_GREEN;
        this._levelDes.setFontSize(20);
        this._levelDes.updateUI(des, value, max);
        this._levelDes.setValueColor(color);
        this._levelDes.setMaxColor(color);
        this._contentHeight += 30;
        this._levelDes.node.setPosition(24, -(this._contentHeight - 20));
    }
    _createAttrDes() {
        this._contentHeight += 30;
        var attrInfo = EquipDataHelper.getEquipStrengthenAttr(this._equipData);
        for (var k in attrInfo) {
            var v = attrInfo[k];
            var arr = TextHelper.getAttrBasicText(k, v)
            var name = arr[0], value = arr[1];
            name = TextHelper.expandTextByLen(name, 4);
            this._attrDes.setFontSize(20);
            this._attrDes.updateUI(name + '：', value);
            this._attrDes.node.setPosition(24, -(this._contentHeight - 20));
            break;
        }
    }
    _createMasterDes() {
        var pos = this._equipData.getPos();
        var info = EquipDataHelper.getMasterEquipStrengthenInfo(pos);
        var level = info.curMasterLevel;
        if (level <= 0) {
            return null;
        }

        this._commonMasterInfoNode.node.active = true;
        var title = Lang.get('equipment_datail_strengthen_master', { level: level });
        var attrInfo = info.curAttr;
        var line = this._commonMasterInfoNode.updateUI(title, attrInfo);
        this._contentHeight += this._commonMasterInfoNode._panelBg.height;
        this._commonMasterInfoNode.node.y = -this._contentHeight;
    }
    _createButton() {
        this._commonButtonLevel2Highlight.node.active = true;
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, 'slotRP', this._equipData);
        this._commonButtonLevel2Highlight.showRedPoint(reach);
        this._contentHeight += 1;
        this._commonButtonLevel2Highlight.node.setPosition(324, -(this._contentHeight + 27));
    }
    _onButtonStrengthenClicked() {
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false) {
            return;
        }
        var equipId = this._equipData.getId();
        G_SceneManager.showScene('equipTrain', equipId, EquipConst.EQUIP_TRAIN_STRENGTHEN, this._rangeType, true);
    }
}
