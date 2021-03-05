import ListViewCellBase from "../../../ui/ListViewCellBase";
import { G_ConfigLoader } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import { RichTextExtend } from "../../../extends/RichTextExtend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AvatarDetailSkillCell extends ListViewCellBase{
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

    private _label: cc.RichText;
    private _data:any;

    public static path:string = 'avatar/AvatarDetailSkillCell';

    ctor(data) {
        this._data = data;
    }
    onCreate() {
        var contentSize = this._panelBg.getContentSize();
        var height = contentSize.height;
        var skillId = this._data.id;
        var unlock = this._data.unlock;
        var isActiveJoint = this._data.isActiveJoint;
        var isShowJointTip = unlock && !isActiveJoint;
        var config = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(skillId);//HeroSkillActiveConfig.get(skillId);
        if (config) {
            var skillIconRes = config.skill_icon;
            var unlockDes = isShowJointTip && Lang.get('avatar_detail_skill_unlock', { level: unlock }) || '';
            var skillDes = '[' + (config.name + ('] ' + config.description));
            this._imageSkillIcon.node.addComponent(CommonUI).loadTexture(Path.getCommonIcon('skill', skillIconRes))
            if (this._label == null) {
                var node = new cc.Node();
                this._label = node.addComponent(cc.RichText);
                this._label.node.setAnchorPoint(cc.v2(0, 1));
                this._label.maxWidth = 262;
                this._panelBg.addChild(this._label.node);
            }
            var content = Lang.get('avatar_detail_skill_des', {
                des: skillDes,
                unlock: unlockDes
            });
            //this._label.setRichTextWithJson(content);
            // this._label.formatText();
            RichTextExtend.setRichTextWithJson(this._label,content)
            var desHeight = this._label.node.getContentSize().height + 15;
            height = Math.max(contentSize.height, desHeight);
            this._label.node.setPosition(cc.v2(120, height - 5));
        } else {
            //logError(string.format('hero_skill_active config can not find id = %d', this._skillId));
        }
        var size = cc.size(contentSize.width, height);
        this.node.setContentSize(size);
        this._imageSkillBg.node.setPosition(cc.v2(17, height - 1));
        this._imageBg.node.setContentSize(cc.size(contentSize.width, height - 2));
    }
}
