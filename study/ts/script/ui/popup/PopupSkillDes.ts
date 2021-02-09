import PopupBase from "../PopupBase";
import { G_ResolutionManager, G_ConfigManager, G_ConfigLoader, Colors } from "../../init";
import CommonSkillIcon from "../component/CommonSkillIcon";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { assert } from "../../utils/GlobleFunc";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import UIHelper from "../../utils/UIHelper";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupSkillDes extends PopupBase{
    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonSkillIcon,
        visible: true
    })
    _nodeIcon:CommonSkillIcon = null;
    
    @property({
        type: cc.Label,
        visible: true
    })
    _textName:cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _desNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    
    

    
    

    private _fromNode:cc.Node;
    private _skillId:number;
    private _baseId:number;
    private _starLevel:number;
    private _label:cc.Label;

    setInitData(fromNode, skillId, baseId, starLevel) {
        this._fromNode = fromNode;
        this._skillId = skillId;
        this._baseId = baseId;
        this._starLevel = starLevel;
    }
    onCreate() {
        this._label = null;
        this._panelTouch.setContentSize(G_ResolutionManager.getDesignCCSize());
        // this._panelTouch.setSwallowTouches(false);
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,this._onClick,this);
    }
    onEnter() {
        this._updateView();
    }
    onExit() {
    }
    _updateView() {
        this._nodeIcon.updateUI(this._skillId);
        
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this._skillId);
      //assert((config, cc.js.formatStr('hero_skill_active config can not find id = %d', this._skillId));
        this._textName.string = ('\u3010' + (config.name + '\u3011'));
        if (this._label == null) {
            this._label = UIHelper.createLabel().getComponent(cc.Label);
            this._label.fontSize = 22;
            this._label.node.setAnchorPoint(new cc.Vec2(0, 1));
            this._label.node.color = (Colors.DARK_BG_ONE);
            this._label.node.width = (370);
            this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this._desNode.addChild(this._label.node);
        }
        var pendingSkill = '';
        if (this._baseId && this._baseId > 0) {
            var petStarCfg = UserDataHelper.getPetStarConfig(this._baseId, this._starLevel);
            if (petStarCfg.skill2 == this._skillId) {
                pendingSkill = petStarCfg.chance_description;
            }
        }
        this._label.string = (config.description + pendingSkill);
        this._label["_updateRenderData"](true);
        var txtHeight = this._label.node.getContentSize().height;
        var panelHeight = 132;
        if (txtHeight > 132 - 60) {
            panelHeight = 60 + txtHeight;
            this._nodeIcon.node.y = (panelHeight/2 - 55);
            this._textName.node.y = (panelHeight/2 - 14);
            this._desNode.y = (panelHeight/2 - 49);
            var bgSize = this._panelBg.getContentSize();
            this._panelBg.setContentSize(cc.size(bgSize.width, panelHeight));
        }
        var nodePos = this._fromNode.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        var nodeSize = this._fromNode.getContentSize();
        var posX = nodePos.x - nodeSize.width / 2 - this._panelBg.getContentSize().width / 2;
        var posY = nodePos.y - this._panelBg.getContentSize().height / 2;
        var dstPos = this.node.convertToNodeSpace(new cc.Vec2(posX, posY));
        this._panelBg.setPosition(dstPos);
    }
    _onClick() {
        this.close();
    }
}