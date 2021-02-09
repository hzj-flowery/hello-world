import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { G_ConfigLoader, Colors } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetailSkillCell extends cc.Component {
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
    @property(cc.Label)
    desText: cc.Label = null;
    _index: any;
    _skillId: any;
    _breakthrough: any;
    _label: any;

    ctor(index, skillId, breakthrough) {
        this._index = index;
        this._skillId = skillId;
        this._breakthrough = breakthrough;
        this._label = null;
        var contentSize = this._panelBg.getContentSize();
        var height = contentSize.height;
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this._skillId);
        if (config) {
            var skillIconRes = config.skill_icon;
            var skillDes = '[' + (config.name + (']' + config.description));
            UIHelper.loadTexture(this._imageSkillIcon, Path.getCommonIcon('skill', skillIconRes));
            if (this._label == null) {
                this._label = this.desText;
                this._label.node.color = (Colors.BRIGHT_BG_TWO);
                this._label.node.setAnchorPoint(cc.v2(0, 1));
            }
            this._label.string = (skillDes);
            UIHelper.updateLabelSize(this._label);
            var desHeight = this._label.node.getContentSize().height + 35;
            height = Math.max(contentSize.height, desHeight);
            this._label.node.setPosition(cc.v2(120, height - 5));
        }
        var size = cc.size(contentSize.width, height);
        this.node.setContentSize(size);
        this._imageSkillBg.node.setPosition(cc.v2(17, height - 1));
        this._imageBg.node.setContentSize(cc.size(contentSize.width, height - 2));
    }
}