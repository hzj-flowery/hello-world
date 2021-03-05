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
import ParameterIDConst from "../../../const/ParameterIDConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipDetailRefineNode extends EquipDetailDynamicModule {

    _equipData: any;
    _rangeType: any;
    _isFromLimitUp: any;

    _contentHeight: number;

    private _levelDes: CommonDesValue;
    _listAttrDes: CommonDesValue[] = [];

    onLoad() {
        this._commonButtonLevel2Highlight.setString(Lang.get('equipment_detail_btn_refine'));
        this._commonButtonLevel2Highlight.addClickEventListenerEx(handler(this, this._onButtonRefineClicked));

        this._commonDetailTitleWithBg.setFontSize(24);
        this._commonDetailTitleWithBg.setTitle(Lang.get('equipment_detail_title_refine'));

        this._levelDes = this._commonDesValue;
        this._levelDes.setFontSize(20);
    }

    setEquipData(equipData, rangeType?, isFromLimitUp?) {
        this._equipData = equipData;
        this._isFromLimitUp = isFromLimitUp || false;
        this._rangeType = rangeType || EquipConst.EQUIP_RANGE_TYPE_1;
        this.updateView();
    }
    updateView() {
        this._contentHeight = 0;
        this._commonMasterInfoNode.node.active = false;
        this._commonButtonLevel2Highlight.node.active = false;
        for (var des of this._listAttrDes) {
            des.node.active = false;
        }

        this._createTitle();
        var offset = 0;
        if (this._equipData.isUserEquip() && !this._isFromLimitUp) {
            this._createButton();
        } else {
            offset = 10;
        }
        this._createLevelDes();
        this._addAttrDes();
        this._createMasterInfo();
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
        var des = Lang.get('equipment_detail_refine_level');
        var value = this._equipData.getR_level();
        var ratio = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.MAX_EQUIPMENT_REFINE_LEVEL).content / 1000;
        var max = Math.floor(G_UserData.getBase().getLevel() * ratio);
        var color = value < max && Colors.BRIGHT_BG_ONE || Colors.BRIGHT_BG_GREEN;

        this._levelDes.updateUI(des, value, max);
        this._levelDes.setValueColor(color);
        this._levelDes.setMaxColor(color);
        this._contentHeight += 30;
        this._levelDes.node.setPosition(24, -(this._contentHeight - 20));
    }
    _addAttrDes() {
        var attrInfo = EquipDataHelper.getEquipRefineAttr(this._equipData);
        var i = 0;
        for (var k in attrInfo) {
            var v = attrInfo[k];
            var arr = TextHelper.getAttrBasicText(k, v)
            var name = arr[0], value = arr[1];
            name = TextHelper.expandTextByLen(name, 4);
            if (!this._listAttrDes[i]) {
                var attrDes = cc.instantiate(this._commonDesValue.node).getComponent(CommonDesValue);
                this._listView.addChild(attrDes.node);
                this._listAttrDes[i] = attrDes;
            }
            var node = this._listAttrDes[i];
            node.node.active = true;
            node.setFontSize(20);
            node.updateUI(name + '\uFF1A', value);
            this._contentHeight += 30;
            node.node.setPosition(24, -(this._contentHeight - 20));
            i++;
        }
    }
    _createMasterInfo() {
        var pos = this._equipData.getPos();
        var info = EquipDataHelper.getMasterEquipRefineInfo(pos);
        var level = info.curMasterLevel;
        if (level <= 0) {
            return null;
        }

        this._commonMasterInfoNode.node.active = true;
        var title = Lang.get('equipment_datail_refine_master', { level: level });
        var attrInfo = info.curAttr;
        var line = this._commonMasterInfoNode.updateUI(title, attrInfo);
        this._contentHeight += this._commonMasterInfoNode._panelBg.height;
        this._commonMasterInfoNode.node.setPosition(0,-this._contentHeight);
    }
    _createButton() {
        this._commonButtonLevel2Highlight.node.active = true;
        var reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, 'slotRP', this._equipData);
        this._commonButtonLevel2Highlight.showRedPoint(reach);
        this._contentHeight += 1;
        this._commonButtonLevel2Highlight.node.setPosition(324, -(this._contentHeight + 27));
    }
    _onButtonRefineClicked() {
        if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false) {
            return;
        }
        var equipId = this._equipData.getId();
        G_SceneManager.showScene('equipTrain', equipId, EquipConst.EQUIP_TRAIN_REFINE, this._rangeType, true);
    }
}