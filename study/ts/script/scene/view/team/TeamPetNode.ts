const { ccclass, property } = cc._decorator;

import CommonHeroPower from '../../../ui/component/CommonHeroPower'

import CommonHeroName from '../../../ui/component/CommonHeroName'

import CommonHeroStar from '../../../ui/component/CommonHeroStar'

import CommonSkillIcon from '../../../ui/component/CommonSkillIcon'

import CommonAttrNode from '../../../ui/component/CommonAttrNode'

import CommonDesValue from '../../../ui/component/CommonDesValue'

import AttributeConst from '../../../const/AttributeConst';
import { G_ResolutionManager, G_UserData, G_SignalManager, G_Prompt, G_SceneManager } from '../../../init';
import ViewBase from '../../ViewBase';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { AttrRecordUnitData } from '../../../data/AttrRecordUnitData';
import { PetUnitData } from '../../../data/PetUnitData';
import { PetDataHelper } from '../../../utils/data/PetDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { RedPointHelper } from '../../../data/RedPointHelper';
import UIHelper from '../../../utils/UIHelper';
import TeamViewHelper from './TeamViewHelper';
import UIConst from '../../../const/UIConst';
import PetConst from '../../../const/PetConst';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import PopupChoosePetHelper from '../../../ui/popup/PopupChoosePetHelper';
import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg';
import { Path } from '../../../utils/Path';
import PopupChoosePet from '../../../ui/popup/PopupChoosePet';


var RECORD_ATTR_LIST = [
    [
        AttributeConst.ATK_FINAL,
        '_fileNodeAttr1'
    ],
    [
        AttributeConst.HP_FINAL,
        '_fileNodeAttr3'
    ],
    [
        AttributeConst.PD_FINAL,
        '_fileNodeAttr2'
    ],
    [
        AttributeConst.MD_FINAL,
        '_fileNodeAttr4'
    ]
];

@ccclass
export default class TeamPetNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelAttr: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBasic: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitle1: CommonDetailTitleWithBg = null;

    @property({
        type: CommonDesValue,
        visible: true
    })
    _nodeLevel: CommonDesValue = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr1: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr2: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr3: CommonAttrNode = null;

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr4: CommonAttrNode = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill1: CommonSkillIcon = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill2: CommonSkillIcon = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _fileNodeSkill3: CommonSkillIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTalent: cc.Node = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _petDesList: cc.ScrollView = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeDetailTitle2: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInTop: cc.Node = null;

    @property({
        type: CommonHeroStar,
        visible: true
    })
    _nodePetStar: CommonHeroStar = null;

    @property({
        type: CommonHeroName,
        visible: true
    })
    _fileNodePetName: CommonHeroName = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInPower: cc.Node = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBtnBg: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonChange: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChangeRP: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonUnload: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUnloadRP: cc.Sprite = null;

    private _signalChangePetFormation:any;
    private _recordAttr:AttrRecordUnitData;
    private _curPetData:PetUnitData;
    private _lastPetLevel:Array<number>;
    private _lastPetRank:Array<number>;
    private _parentView: any;


    public setInitData(pv):void{
         this._parentView = pv;
    }
    onLoad(): void {
        super.onLoad();
        var sp = G_ResolutionManager.getDesignSize();
        this.node.setContentSize(sp[0],sp[1]);
        
    }

    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
        this._lastPetLevel = [];
        this._lastPetRank = [];
        this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst['FUNC_PET_TEAM_SLOT']);
    }
    _initView() {
        this._nodeDetailTitle1.setTitle(Lang.get('team_detail_title_basic'));
        this._nodeDetailTitle2.setTitle(Lang.get('team_detail_title_pet2'));
        this._nodeLevel.setFontSize(20);
    }
    onEnter() {
        this._signalChangePetFormation = G_SignalManager.add(SignalConst.EVENT_PET_ON_TEAM_SUCCESS, handler(this, this._changePetFormation));
        this._updateData();
        this._updateView();
        if (this._checkPetTrainPrompt()) {
            this._playPetTrainPrompt();
        }
    }
    onExit() {
        if(this._signalChangePetFormation)
        this._signalChangePetFormation.remove();
        this._signalChangePetFormation = null;
        if (this._curPetData) {
            this._lastPetLevel = [
                this._curPetData.getId(),
                this._curPetData.getLevel()
            ];
            this._lastPetRank = [
                this._curPetData.getId(),
                this._curPetData.getStar()
            ];
        }
    }
    updateInfo() {
        this._updateData();
        this._updateView();
    }
    _updateData() {
        var petId = G_UserData.getBase().getOn_team_pet_id();
        G_UserData.getPet().setCurPetId(petId);
        this._curPetData = null;
        if (petId > 0) {
            this._curPetData = G_UserData.getPet().getUnitDataWithId(petId);
        }
        this._recordBaseAttr();
        G_UserData.getAttr().recordPower();
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateAttr();
        this._updateSkill();
        this._updatePower();
        this.checkPetTrainRP();
    }
    _updateSkill() {
        if (this._curPetData == null) {
            return;
        }
        var baseId = this._curPetData.getBase_id();
        var starLevel = this._curPetData.getStar();
        var skillIds = PetDataHelper.getPetSkillIds(baseId, starLevel);
        for (var i = 1;i<=3;i++) {
            this['_fileNodeSkill' + i].updateUI(0, true, baseId, starLevel);
        }
        for (var j in skillIds) {
            var skillId = skillIds[j];
            this['_fileNodeSkill' + j].updateUI(skillId, true, baseId, starLevel);
        }
    }
    _updatePower() {
        var power = 0;
        if (this._curPetData) {
            power = PetDataHelper.getPetPower(this._curPetData);
        }
        this._fileNodePower.updateUI(power);
        var width = this._fileNodePower.getWidth();
        var posX = 306 - width / 2;
        this._fileNodePower.node.x = (posX);
    }
    _updateBaseInfo() {
        if (this._curPetData == null) {
            this._nodeLevel.updateUI(Lang.get('team_detail_des_level'), 0, 0);
            this._nodeLevel.setMaxValue('/0');
            this._nodePetStar.setCount(0);
            this._petDesList.content.removeAllChildren();
            return;
        }
        var level = this._curPetData.getLevel();
        var starLevel = this._curPetData.getStar();
        var maxLevel = G_UserData.getBase().getLevel();
        this._nodeLevel.updateUI(Lang.get('team_detail_des_level'), level, maxLevel);
        this._nodeLevel.setMaxValue('/' + maxLevel);
        this._fileNodePetName.setConvertType(TypeConvertHelper.TYPE_PET);
        this._fileNodePetName.setName(this._curPetData.getBase_id());
        this._nodePetStar.setCount(starLevel);
        this._petDesList.content.removeAllChildren();
        var starMax = this._curPetData.getStarMax();
        // for (var i = 1;i<=starMax;i++) {
        //     var des = PetDetailViewHelper.createTalentDes(this._curPetData, i, 300, 14);
        //     this._petDesList.content.addChild(des);
        // }
        //this._petDesList.doLayout();
        var reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_PET_CHANGE, this._curPetData);
        this._imageChangeRP.node.active = (reach);
    }
    _recordBaseAttr() {
        if (this._curPetData) {
            var param = { unitData: this._curPetData };
            var attrInfo = PetDataHelper.getPetTotalAttr(param);
            this._recordAttr.updateData(attrInfo);
        } else {
            this._recordAttr.updateData({});
        }
    }
    _updateAttr() {
        this._fileNodeAttr1.updateView(AttributeConst.ATK_FINAL, this._recordAttr.getCurValue(AttributeConst.ATK_FINAL));
        this._fileNodeAttr2.updateView(AttributeConst.PD_FINAL, this._recordAttr.getCurValue(AttributeConst.PD_FINAL));
        this._fileNodeAttr3.updateView(AttributeConst.HP_FINAL, this._recordAttr.getCurValue(AttributeConst.HP_FINAL));
        this._fileNodeAttr4.updateView(AttributeConst.MD_FINAL, this._recordAttr.getCurValue(AttributeConst.MD_FINAL));
    }
    _onButtonUnloadClicked() {
        G_UserData.getPet().c2sPetOnTeam(0, 1);
    }
    _onButtonChangeClicked() {
        var petId = G_UserData.getBase().getOn_team_pet_id();
        var isEmpty = PopupChoosePetHelper.checkIsEmpty(PopupChoosePetHelper.FROM_TYPE2, [petId]);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('pet_popup_list_empty_tip' + PopupChoosePetHelper.FROM_TYPE2));
        } else {
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupChoosePet"),function(pop:PopupChoosePet){
                var callBack = handler(this, this._changePetCallBack);
                pop.setTitle(Lang.get('pet_replace_title'));
                pop.updateUI(PopupChoosePetHelper.FROM_TYPE2, callBack, petId);
                pop.openWithAction();
            }.bind(this));
        }
    }
    _changePetCallBack(petId) {
        G_UserData.getPet().c2sPetOnTeam(petId, 1);
    }
    _checkPetTrainPrompt() {
        if (this._curPetData == null) {
            return false;
        }
        var curId = this._curPetData.getId();
        var lastId = this._lastPetLevel[1] || 0;
        var lastLevel = this._lastPetLevel[2] || 0;
        var nowLevel = this._curPetData.getLevel();
        if (lastId == curId && nowLevel > lastLevel && lastLevel > 0) {
            return true;
        }
        var lastRank = this._lastPetRank[2] || -1;
        var nowRank = this._curPetData.getStar();
        if (lastId == curId && nowRank > lastRank && lastRank > -1) {
            return true;
        }
        return false;
    }
    checkPetTrainRP() {
        this._parentView.checkPetTrainRP(this._curPetData);
    }
    _playPetTrainPrompt() {
        this._updateSkill();
        this._updatePower();

        var _this = this;
        var summary = [];
        {
            var lastLevel = this._lastPetLevel[2];
            var nowLevel = this._curPetData.getLevel();
            var textLevel = this._nodeLevel.node.getChildByName('TextValue');
            var finishCallback1 = function () {
                if (_this._nodeLevel && _this._curPetData) {
                    textLevel.getComponent(cc.Label).string = String(_this._curPetData.getLevel());
                    _this._updateBaseInfo();
                }
            }
            var dstPosition = UIHelper.convertSpaceFromNodeToNode(textLevel,this.node);
            TeamViewHelper.makeLevelDiffData(summary, this._curPetData, lastLevel, dstPosition, finishCallback1);
        }
        {
            var finishCallback2 = function () {
                if (_this._nodeLevel) {
                    _this._updateBaseInfo();
                }
            }
            var lastRank = _this._lastPetRank[2];
            TeamViewHelper.makeBreakDiffData(summary,_this._curPetData, lastRank, finishCallback2);
        }
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }
    _showPetDetailView() {
        var petId = G_UserData.getBase().getOn_team_pet_id();
        G_SceneManager.showScene('petDetail', petId, PetConst.PET_RANGE_TYPE_2);
    }
    _addBaseAttrPromptSummary(summary) {
        var _this = this;
        for (var i in RECORD_ATTR_LIST) {
            var one = RECORD_ATTR_LIST[i];
            var attrId = one[1];
            var dstNodeName = one[2];
            var diffValue = this._recordAttr.getDiffValue(attrId);
            console.log(diffValue);
            if (diffValue != 0) {
                var param = {
                    content: AttrDataHelper.getPromptContent(attrId, diffValue),
                    anchorPoint: new cc.Vec2(0, 0.5),
                    startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM + UIConst.SUMMARY_OFFSET_X_ATTR },
                    dstPosition: dstNodeName && UIHelper.convertSpaceFromNodeToNode(this[dstNodeName], this.node) || null,
                    finishCallback:function() {
                        if (attrId && dstNodeName) {
                            var curValue = _this._recordAttr.getCurValue(attrId);
                            _this[dstNodeName].node.getChildByName('TextValue').getComponent(cc.Label).string = (curValue);
                        }
                    }
                };
                summary.push(param);
            }
        }
        return summary;
    }
    _changePetFormation(eventName, newPetId) {
        this._updateData();
        this._updateBaseInfo();
        this._updateSkill();
        this._updatePower();
        this._playChangePetSummary(newPetId);
    }
    _onChangePetSummaryFinish() {

        this.node.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP,"TeamPetNode");
        })));
    }
    _playChangePetSummary(newPetId) {
        var summary = [];
        var _this = this;
        var successStr = '';
        if (newPetId > 0) {
            successStr = Lang.get('summary_pet_change');
        } else {
            successStr = Lang.get('summary_pet_level_team');
        }
        var param2 = {
            content: successStr,
            startPosition: { x: UIConst.SUMMARY_OFFSET_X_TEAM },
            finishCallback:function() {
                if (_this._onChangePetSummaryFinish) {
                    _this._onChangePetSummaryFinish();
                }
            }
        };
        summary.push(param2);
        this._addBaseAttrPromptSummary(summary);
        G_Prompt.showSummary(summary);
        G_Prompt.playTotalPowerSummary(UIConst.SUMMARY_OFFSET_X_TEAM, -5);
    }

}