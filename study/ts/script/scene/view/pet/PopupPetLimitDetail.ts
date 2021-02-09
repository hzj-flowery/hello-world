import PopupBase from "../../../ui/PopupBase";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { Colors, G_ConfigLoader } from "../../../init";
import { clone, clone2 } from "../../../utils/GlobleFunc";
import PetDetailAttrModule from "./PetDetailAttrModule";
import PetDetailSkillModule from "./PetDetailSkillModule";
import PetDetailTalentModule from "./PetDetailTalentModule";
import PetDetailBriefModule from "./PetDetailBriefModule";
import CommonCustomListView from "../../../ui/component/CommonCustomListView";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { PetTrainHelper } from "../petTrain/PetTrainHelper";
import { PetDataHelper } from "../../../utils/data/PetDataHelper";
import PetConst from "../../../const/PetConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupPetLimitDetail extends PopupBase {
    public static path = 'pet/PopupPetLimitDetail';
    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    @property({
        type: CommonCustomListView,
        visible: true
    })
    _listView: CommonCustomListView = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    petDetailAttrModule: cc.Prefab = null;

    @property({
        type: cc.Node,
        visible: true
    })
    petDetailSkillModule: cc.Node = null;
    @property(cc.Node)
    talentModule: cc.Node = null;

    @property(cc.Node)
    briefModule: cc.Node = null;


    _petUnitData: any;
    _skillHeightDiffRight: number;
    _skillHeightDiffLeft: number;

    ctor(petUnitData) {
        this._petUnitData = petUnitData;
        UIHelper.addEventListener(this.node, this._buttonClose, 'PopupPetLimitDetail', '_onButtonClose');
    }
    onCreate() {
        this._textTitle.string = (Lang.get('limit_break_title'));
    }
    onEnter() {
        var config = this._getCurPetData(this._petUnitData).getConfig();
        var configAfter = this._getNextUnitData(this._petUnitData).getConfig();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, config.id);
        var paramAfter = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, configAfter.id);
        this._textName1.string = (config.name);
        this._textName2.string = (configAfter.name);
        this._textName1.node.color = (Colors.getColor(config.color));
        this._textName2.node.color = (Colors.getColor(configAfter.color));
        this._textTitle.string = (Lang.get('limit_break_title'));
        UIHelper.updateTextOutline(this._textName1, param);
        UIHelper.updateTextOutline(this._textName2, paramAfter);
        this._updateList();
    }
    onExit() {
    }
    _updateList() {
        this._listView.removeAllChildren();
        var module1 = this._buildAttrModule();
        var module2 = this._buildSkillModule();
        var module3 = this._buildTalentModule();
        this._listView.pushBackCustomItem(module1);
        this._listView.pushBackCustomItem(module2);
        this._listView.pushBackCustomItem(module3);
       // this._listView.doLayout();
    }
    _getNextUnitData(unitData) {
        var unitData2 = clone2(unitData);
        if (unitData2.getConfig().color < 6) {
            var newConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(unitData2.getConfig().potential_after);
            var afterLevel = PetTrainHelper.limitAfterLevel(unitData);
            var afterStar = PetTrainHelper.limitReduceStar(unitData.getStar());
            unitData2.setLevel(afterLevel);
            unitData2.setStar(afterStar);
            unitData2.setBase_id(newConfig.id);
            if (newConfig) {
                unitData2.setConfig(newConfig);
            }
        }
        return unitData2;
    }
    _buildAttrModule() {
        var unitData = this._getCurPetData(this._petUnitData);
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var attrModule = cc.instantiate(this.petDetailAttrModule).getComponent(PetDetailAttrModule);
        attrModule.ctor(unitData, 1);
        attrModule.node.setAnchorPoint(cc.v2(0, 0));
        widget.addChild(attrModule.node);
        var unitData2 = this._getNextUnitData(this._petUnitData);
        var attrModule1 = cc.instantiate(this.petDetailAttrModule).getComponent(PetDetailAttrModule);
        attrModule1.ctor(unitData2, 1);
        attrModule1.node.setAnchorPoint(cc.v2(0, 0));
        widget.addChild(attrModule1.node);
        var size = attrModule.node.getContentSize();
        attrModule1.node.x = (size.width + 132);
        widget.setContentSize(cc.size(858, size.height));
        return widget;
    }
    _buildSkillModule() {
        var unitData = this._getCurPetData(this._petUnitData);
        var rank = unitData.getStar();
        var showSkillIds = PetDataHelper.getPetSkillIds(unitData.getBase_id(), rank);
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var skillModule = cc.instantiate(this.petDetailSkillModule).getComponent(PetDetailSkillModule);
        skillModule.ctor(showSkillIds, true, unitData.getBase_id(), rank, unitData);
        skillModule.onCreate();
        skillModule.node.setAnchorPoint(cc.v2(0, 0));
        skillModule.node.active = true;
        widget.addChild(skillModule.node);
        var unitData2 = this._getNextUnitData(this._petUnitData);
        var rank2 = unitData2.getStar();
        var showSkillIds2 = PetDataHelper.getPetSkillIds(unitData2.getBase_id(), rank2);
        var skillModule2 = cc.instantiate(this.petDetailSkillModule).getComponent(PetDetailSkillModule);
        skillModule2.ctor(showSkillIds2, true, unitData2.getBase_id(), rank2, unitData2);
        skillModule2.onCreate();
        skillModule2.node.setAnchorPoint(cc.v2(0, 0));
        skillModule2.node.active = true;
        widget.addChild(skillModule2.node);
        var size = skillModule.node.getContentSize();
        var size2 = skillModule2.node.getContentSize();
        var height = size.height > size2.height && size.height || size2.height;
        if (size.height > size2.height) {
            skillModule2.node.y = (size.height - size2.height);
            this._skillHeightDiffRight = size.height - size2.height;
            this._skillHeightDiffLeft = 0;
        } else {
            skillModule.node.y = (size2.height - size.height);
            this._skillHeightDiffLeft = size2.height - size.height;
            this._skillHeightDiffRight = 0;
        }
        skillModule2.node.x = (size.width + 132);
        widget.setContentSize(cc.size(858, height));
        return widget;
    }
    _buildTalentModule() {
        var unitData = this._getCurPetData(this._petUnitData);
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var talentModule = cc.instantiate(this.talentModule).getComponent(PetDetailTalentModule);
        talentModule.ctor(unitData);
        talentModule.node.setAnchorPoint(cc.v2(0, 0));
        talentModule.node.active = true;
        widget.addChild(talentModule.node);
        var unitData2 = this._getNextUnitData(this._petUnitData);
        var talentModule1 = cc.instantiate(this.talentModule).getComponent(PetDetailTalentModule);
        talentModule1.ctor(unitData2);
        talentModule1.node.setAnchorPoint(cc.v2(0, 0));
        talentModule1.node.active = true;
        widget.addChild(talentModule1.node);
        var size = talentModule.node.getContentSize();
        var size2 = talentModule1.node.getContentSize();
        talentModule1.node.x = (size.width + 132);
        var height = size.height > size2.height && size.height || size2.height;
        if (size.height > size2.height) {
            talentModule.node.y = (this._skillHeightDiffLeft);
            talentModule1.node.y = (size.height - size2.height + this._skillHeightDiffRight);
        } else {
            talentModule.node.y = (size2.height - size.height + this._skillHeightDiffLeft);
            talentModule1.node.y = (this._skillHeightDiffRight);
        }
        widget.setContentSize(cc.size(858, height));
        return widget;
    }
    _buildBreifModule() {
        var unitData = this._getCurPetData(this._petUnitData);
        var widget = new cc.Node();
        widget.setAnchorPoint(cc.v2(0, 0));
        var breifModule =cc.instantiate(this.briefModule).getComponent(PetDetailBriefModule); 
        breifModule.ctor(unitData);
        breifModule.node.setAnchorPoint(cc.v2(0, 0));
        widget.addChild(breifModule.node);
        var unitData2 = this._getNextUnitData(this._petUnitData);
        var breifModule1 = cc.instantiate(this.briefModule).getComponent(PetDetailBriefModule); 
        breifModule1.ctor(unitData2);
        breifModule1.node.setAnchorPoint(cc.v2(0, 0));
        widget.addChild(breifModule1.node);
        var size = breifModule.node.getContentSize();
        var size1 = breifModule1.node.getContentSize();
        var height = 0;
        if (size.height > size1.height) {
            height = size.height;
            breifModule.node.y = (Math.abs(size.height - size1.height));
        } else {
            height = size1.height;
            breifModule1.node.y = (Math.abs(size1.height - size.height));
        }
        breifModule1.node.x = (size.width + 132);
        widget.setContentSize(cc.size(858, height));
        return widget;
    }
    _onButtonClose() {
        this.close();
    }
    _getCurPetData(petUnitData) {
        var unitData2 = clone2(petUnitData);
        if (unitData2.getQuality() == PetConst.QUALITY_RED) {
            var beforeId = unitData2.getConfig().potential_before;
            if (beforeId > 0) {
                var newConfig = G_ConfigLoader.getConfig(ConfigNameConst.PET).get(beforeId);
                unitData2.setLevel(petUnitData.getLevel());
                unitData2.setStar(0);
                unitData2.setBase_id(newConfig.id);
                if (newConfig) {
                    unitData2.setConfig(newConfig);
                }
            }
        }
        return unitData2;
    }

}