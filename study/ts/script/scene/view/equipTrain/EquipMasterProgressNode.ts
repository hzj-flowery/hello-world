import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Colors, G_SceneManager } from "../../../init";
import MasterConst from "../../../const/MasterConst";
import { EquipTrainHelper } from "../equipTrain/EquipTrainHelper";
import { FunctionConst } from "../../../const/FunctionConst";
import EquipConst from "../../../const/EquipConst";
import { TreasureTrainHelper } from "../treasureTrain/TreasureTrainHelper";
import TreasureConst from "../../../const/TreasureConst";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EquipMasterProgressNode extends cc.Component {
    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _fileNodeIcon: CommonIconTemplate = null;
    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBarProgress: cc.ProgressBar = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonStrengthen: CommonButtonLevel1Highlight = null;
    _equipId: any;
    _setGetTabIndexFunc: Function;

    onLoad() {
        this._fileNodeIcon.setImageTemplateVisible(true);
        this._buttonStrengthen.setString(Lang.get('equipment_master_btn_strengthen'));
        this._buttonStrengthen.addClickEventListenerEx(handler(this, this._onClickButton));
    }
    updateView(info, totalLevel, type) {
        this._equipId = null;
        if (info) {
            this._equipId = info.equipId;
            this.node.active = (true);
            if (this._equipId) {
                var param = info.equipParam;
                var curLevel = info.curLevel;

                this._fileNodeIcon.unInitUI();
                this._fileNodeIcon.initUI(type, param.cfg.id);
                this._fileNodeIcon.setIconVisible(true);
                this._fileNodeIcon.setTouchEnabled(true);
                this._buttonStrengthen.setEnabled(true);
                this._textName.string = (param.name);
                this._textName.node.color = (param.icon_color);
                if (param.cfg.color == 7) {
                    UIHelper.enableOutline(this._textName, param.icon_color_outline, 2);
                }
                var percent = curLevel / totalLevel;
                this._loadingBarProgress.progress = (percent);
                this._textProgress.string = (curLevel + (' / ' + totalLevel));
            } else {
                this._fileNodeIcon.unInitUI();
                this._fileNodeIcon.initUI(TypeConvertHelper.TYPE_EQUIPMENT);
                this._fileNodeIcon.setIconVisible(false);
                this._fileNodeIcon.setImageTemplateVisible(true);
                this._buttonStrengthen.setEnabled(false);
                this._textName.string = (Lang.get('equipment_master_no_wear'));
                this._textName.node.color = (Colors.COLOR_MAIN_TEXT);
                UIHelper.disableOutline(this._textName);
                this._loadingBarProgress.progress = (0);
                this._textProgress.string = ('');
            }
        } else {
            this.node.active = (false);
        }
    }

    setGetTabIndexFunc(func: Function) {
        this._setGetTabIndexFunc = func;
    }

    _onClickButton() {
        if (this._equipId == null) {
            return;
        }
        var masterType = this._setGetTabIndexFunc();
        if (masterType == MasterConst.MASTER_TYPE_1) {
            if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1) == false) {
                return;
            }
            G_SceneManager.showScene('equipTrain', this._equipId, EquipConst.EQUIP_TRAIN_STRENGTHEN, EquipConst.EQUIP_RANGE_TYPE_2);
        } else if (masterType == MasterConst.MASTER_TYPE_2) {
            if (EquipTrainHelper.isOpen(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2) == false) {
                return;
            }
            G_SceneManager.showScene('equipTrain', this._equipId, EquipConst.EQUIP_TRAIN_REFINE, EquipConst.EQUIP_RANGE_TYPE_2);
        } else if (masterType == MasterConst.MASTER_TYPE_3) {
            if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1) == false) {
                return;
            }
            G_SceneManager.showScene('treasureTrain', this._equipId, TreasureConst.TREASURE_TRAIN_STRENGTHEN, TreasureConst.TREASURE_RANGE_TYPE_2);
        } else if (masterType == MasterConst.MASTER_TYPE_4) {
            if (TreasureTrainHelper.isOpen(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2) == false) {
                return;
            }
            G_SceneManager.showScene('treasureTrain', this._equipId, TreasureConst.TREASURE_TRAIN_REFINE, TreasureConst.TREASURE_RANGE_TYPE_2);
        }
    }
}