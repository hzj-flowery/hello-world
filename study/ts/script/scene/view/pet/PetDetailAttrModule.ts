const { ccclass, property } = cc._decorator;

import CommonButtonLevel2Highlight from '../../../ui/component/CommonButtonLevel2Highlight'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDesValue from '../../../ui/component/CommonDesValue'

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { PetTrainHelper } from '../petTrain/PetTrainHelper';
import { Lang } from '../../../lang/Lang';
import AttributeConst from '../../../const/AttributeConst';
import { PetDataHelper } from '../../../utils/data/PetDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { G_UserData, G_Prompt, G_SceneManager, Colors } from '../../../init';
import { FunctionConst } from '../../../const/FunctionConst';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import PetConst from '../../../const/PetConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { handler } from '../../../utils/handler';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class PetDetailAttrModule extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePanel: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel: CommonDesValue = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _nodeAttr4: CommonAttrNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRichDesc: cc.Node = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonUpgrade: CommonButtonLevel2Highlight = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonBreak: CommonButtonLevel2Highlight = null;

    @property({
        type: CommonButtonLevel2Highlight,
        visible: true
    })
    _buttonLimit: CommonButtonLevel2Highlight = null;

    private _petUnitData: any;
    private _rangeType: number;
    private _attrInfo: any;

    private TWO_BUTTON_POSX = [
        116,
        282.93
    ];
    private THREE_BUTTON_POSX = [
        70,
        200.78,
        332
    ];

    ctor(petUnitData, rangeType) {
        this._petUnitData = petUnitData;
        this._rangeType = rangeType;
        this._buttonUpgrade.addClickEventListenerEx(handler(this, this._onButtonUpgradeClicked));
        this._buttonBreak.addClickEventListenerEx(handler(this, this._onButtonBreakClicked));
        this._buttonLimit.addClickEventListenerEx(handler(this, this._onButtonLimitClicked));
        this.node.name = ('PetDetailAttrModule');
        this.init();
    }
    showButton(needShow) {
        if (needShow == null || needShow == false) {
            this._buttonUpgrade.setVisible(false);
            this._buttonBreak.setVisible(false);
            this._buttonLimit.setVisible(false);
        } else {
            this._buttonUpgrade.setVisible(true);
            this._buttonBreak.setVisible(true);
            var isOpen = PetTrainHelper.canShowLimitBtn(this._petUnitData);
            this._buttonLimit.setVisible(isOpen);
            this._reSetButtonPosX(true);
        }
        this._arrangePanel();
    }
    _reSetButtonPosX(isThree) {
        if (isThree) {
            this._buttonUpgrade.node.x = (this.THREE_BUTTON_POSX[0]);
            this._buttonBreak.node.x = (this.THREE_BUTTON_POSX[1]);
            this._buttonLimit.node.x = (this.THREE_BUTTON_POSX[2]);
        } else {
            this._buttonUpgrade.node.x = (this.TWO_BUTTON_POSX[0]);
            this._buttonBreak.node.x = (this.TWO_BUTTON_POSX[1]);
        }
    }
    init() {
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        //this._panelBg.setSwallowTouches(false);
        this._nodeTitle.setFontSize(24);
        this._nodeTitle.setTitle(Lang.get('hero_detail_title_attr'));
        this._nodeLevel.setFontSize(20);
        this._buttonUpgrade.setString(Lang.get('hero_detail_btn_upgrade'));
        this._buttonBreak.setString(Lang.get('pet_detail_btn_star'));
        this._buttonLimit.setString(Lang.get('pet_detail_btn_limit'));
        this.updateUI(this._petUnitData);
        this.showButton(false);
    }
    _creatRichText(content) {
        var label = RichTextExtend.createWithContent(content);
        label.node.setAnchorPoint(cc.v2(0, 1));
        label.maxWidth = 360;
        return label;
    }
    _arrangePanel() {
        this._nodeRichDesc.removeAllChildren();
        if (this._attrInfo == null) {
            return;
        }
        var blessRate = this._attrInfo[AttributeConst.PET_BLESS_RATE] / 1000 * 100;
        if (this._buttonUpgrade.node.active == true) {
            this._nodePanel.y = (60);
            this._panelBg.setContentSize(cc.size(402, 286));
            var percent = UserDataHelper.getParameterValue('pet_huyou_percent') / 10;
            var desc = Lang.get('pet_attr_pend_desc', { num: percent });
            var richContent = PetDataHelper.convertAttrAppendDesc(desc, blessRate);
            var widget = this._creatRichText(richContent);
            this._nodeRichDesc.addChild(widget.node);
        } else {
            this._nodePanel.y = (0);
            this._panelBg.setContentSize(cc.size(402, 226));
            var percent = UserDataHelper.getParameterValue('pet_huyou_percent') / 10;
            var desc = Lang.get('pet_attr_pend_desc', { num: percent });
            var richContent = PetDataHelper.convertAttrAppendDesc(desc, blessRate);
            var widget = this._creatRichText(richContent);
            this._nodeRichDesc.addChild(widget.node);
        }
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
    }
    updateUI(petUnitData) {
        var heroConfig = petUnitData.getConfig();
        var level = petUnitData.getLevel();
        var maxLevel = G_UserData.getBase().getLevel();
        var param = { unitData: petUnitData };
        var attrInfo = UserDataHelper.getPetTotalAttr(param);
        this._attrInfo = attrInfo;
        this._nodeLevel.updateUI(Lang.get('hero_detail_txt_level'), level, maxLevel);
        this._nodeLevel.setMaxValue('/' + maxLevel);
        this._nodeAttr1.updateView(AttributeConst.ATK_FINAL, attrInfo[AttributeConst.ATK_FINAL], null, 4);
        this._nodeAttr2.updateView(AttributeConst.HP_FINAL, attrInfo[AttributeConst.HP_FINAL], null, 4);
        this._nodeAttr3.updateView(AttributeConst.PD_FINAL, attrInfo[AttributeConst.PD_FINAL], null, 4);
        this._nodeAttr4.updateView(AttributeConst.MD_FINAL, attrInfo[AttributeConst.MD_FINAL], null, 4);
        this._checkUpgradeRedPoint(petUnitData);
    }
    _onButtonUpgradeClicked() {
        var [isOpen, des] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE1);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var petId = this._petUnitData.getId();
        G_SceneManager.showScene('petTrain', petId, PetConst.PET_TRAIN_UPGRADE, this._rangeType, true);
    }
    _onButtonBreakClicked() {
        var [isOpen, des] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE2);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var petId = this._petUnitData.getId();
        G_SceneManager.showScene('petTrain', petId, PetConst.PET_TRAIN_STAR, this._rangeType, true);
    }
    _onButtonLimitClicked() {
        var [isOpen, des] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PET_TRAIN_TYPE3);
        if (!isOpen) {
            G_Prompt.showTip(des);
            return;
        }
        var petId = this._petUnitData.getId();
        G_SceneManager.showScene('petTrain', petId, PetConst.PET_TRAIN_LIMIT, this._rangeType, true);
    }
    _checkUpgradeRedPoint(petUnitData) {
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE1, petUnitData);
        this._buttonUpgrade.showRedPoint(reach);
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE2, petUnitData);
        this._buttonBreak.showRedPoint(reach);
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_TRAIN_TYPE3, petUnitData);
        this._buttonLimit.showRedPoint(reach);
    }
}
