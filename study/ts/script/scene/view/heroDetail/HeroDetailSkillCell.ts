
import CommonUI from "../../../ui/component/CommonUI";
import { Colors, G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroDetailSkillCell extends ListViewCellBase {

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

    private _skillId: number;
    private _label: cc.Label;

    public static path:string = 'heroDetail/HeroDetailSkillCell';

    constructor() {
        super();
        this._label = null;
    }
    public setInitData(skillId: number): void {
        this._skillId = skillId;
    }

    onCreate() {
        var contentSize = this._panelBg.getContentSize();
        this.node.setContentSize(contentSize);
        var height = contentSize.height;

        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(this._skillId);
        if (config) {
            var skillIconRes = config.skill_icon;
            var skillDes = '[' + (config.name + (']' + config.description));
            this._imageSkillIcon.addComponent(CommonUI).loadTexture(Path.getCommonIcon('skill', skillIconRes));
            if (this._label == null) {
                var node0 = new cc.Node();
                this._label = UIHelper.createWithTTF("",Path.getCommonFont(),20);
                this._label.string = "";
                this._label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                this._label.node.color = (Colors.BRIGHT_BG_TWO);
                this._label.node.width = (260);
                this._label.node.setAnchorPoint(new cc.Vec2(0, 1));
                this._panelBg.addChild(this._label.node);
            }
            this._label.string = (skillDes);
            this._label["_updateRenderData"](true);
            var desHeight = this._label.node.getContentSize().height + 15;
            height = Math.max(contentSize.height, desHeight);
            this._label.node.setPosition(new cc.Vec2(120, height - 5));
        } else {
            cc.error(cc.js.formatStr('hero_skill_active config can not find id = %d', this._skillId));
        }
        var size = cc.size(contentSize.width, height);
        this.node.setContentSize(size);
        this._imageSkillBg.node.setPosition(new cc.Vec2(17, height - 1));
        this._imageBg.node.setContentSize(cc.size(contentSize.width, height - 2));
    }

}