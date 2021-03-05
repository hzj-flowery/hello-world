import ListViewCellBase from "../../../ui/ListViewCellBase";
import UIHelper from "../../../utils/UIHelper";
import { G_ConfigLoader, Colors, G_UserData } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import { PetDetailViewHelper } from "./PetDetailViewHelper";
import PopupSkillDetail from "../../../ui/PopupSkillDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PetDetailSkillCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillIcon: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnSkill: cc.Button = null;

    @property(cc.Label)
    desText: cc.Label = null;

    private _skillId: number;
    private _label: cc.Label;
    private _showSkillDetail: boolean;
    private _petBaseId: number;
    private _petStar: number;
    private _petUnitData: any;
    private _isLoaded: boolean;

    ctor(skillId, showSkillDetail, petBaseId, petStar, petUnitData) {
        this._skillId = skillId;
        this._showSkillDetail = showSkillDetail;
        this._petBaseId = petBaseId || 0;
        this._petStar = petStar || 0;
        this._petUnitData = petUnitData;
        UIHelper.addEventListener(this.node, this._btnSkill, 'PetDetailSkillCell', '_onButtonSkill');
    }
    onCreate() {
        if (this._isLoaded) {
            return;
        }
        this._isLoaded = true;
        if (this._showSkillDetail == false) {
            this._btnSkill.node.active = (false);
        }
        var contentSize = this._panelBg.getContentSize();
        var height = contentSize.height;
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this._skillId);
        var pendingSkill = '';
        if (this._petBaseId > 0) {
            var petStarCfg = UserDataHelper.getPetStarConfig(this._petBaseId, this._petStar);
            if (petStarCfg.skill2 == this._skillId) {
                pendingSkill = petStarCfg.chance_description;
            }
        }
        if (config) {
            var skillIconRes = config.skill_icon;
            var skillDes = '[' + (config.name + (']' + config.description));
            UIHelper.loadTexture(this._imageSkillIcon, Path.getCommonIcon('skill', skillIconRes));
            if (this._label == null) {
                // this._label = UIHelper.createWithTTF('', Path.getCommonFont(), 20);
                this._label = this.desText;
                this._label.node.color = (Colors.BRIGHT_BG_TWO);
                //this._label.node.width = (260);
                this._label.node.setAnchorPoint(cc.v2(0, 1));
                //this._panelBg.addChild(this._label.node);
            }
            this._label.string = (skillDes + pendingSkill);
            UIHelper.updateLabelSize(this._label);
            var desHeight = this._label.node.getContentSize().height + 35;
            height = Math.max(contentSize.height, desHeight);
            this._label.node.setPosition(cc.v2(120, height - 5));
        } else {
            //logError(string.format('hero_skill_active config can not find id = %d', this._skillId));
        }
        var size = cc.size(contentSize.width, height);
        this.node.setContentSize(size);
        this._imageSkillBg.node.setPosition(cc.v2(17, height - 1));
        this._imageBg.node.setContentSize(cc.size(contentSize.width, height - 2));
        this._btnSkill.node.y = (4);
    }
    _onButtonSkill() {
        var petId = G_UserData.getPet().getCurPetId();
        var skillShowList = PetDetailViewHelper.makeSkillEx(petId, this._skillId, this._petUnitData);
        PopupSkillDetail.getIns(PopupSkillDetail, (p: PopupSkillDetail) => {
            p.ctor(skillShowList);
            p.openWithAction();
        })
    }
}
