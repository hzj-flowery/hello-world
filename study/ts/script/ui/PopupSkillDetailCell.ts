const { ccclass, property } = cc._decorator;

import CommonDetailTitleWithBg from './component/CommonDetailTitleWithBg'
import { G_ConfigLoader } from '../init';
import { ConfigNameConst } from '../const/ConfigNameConst';
import UIHelper from '../utils/UIHelper';

@ccclass
export default class PopupSkillDetailCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDesc: cc.Label = null;

    updateUI(title, skillId, pendingStr) {
        pendingStr = pendingStr || '';
        var HeroSkillActiveConfig = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE);
        var config = HeroSkillActiveConfig.get(skillId);
        this._nodeTitle.setTitle(title);
        var skillDes = '[' + (config.name + (']' + (config.description + pendingStr)));
        this._textDesc.string = ('');
        // if (this._label == null) {
        //     this._label = cc.Label.createWithTTF('', Path.getCommonFont(), 20);
        //     this._label.setColor(Colors.BRIGHT_BG_TWO);
        //     this._label.setWidth(466);
        //     this._label.setAnchorPoint(cc.v2(0, 0));
        //     this._resourceNode.addChild(this._label);
        // }
        this._textDesc.string = (skillDes);
        UIHelper.updateLabelSize(this._textDesc);
        var desHeight = this._textDesc.node.height + 60;
        //   this._label.setPosition(cc.v2(55, 10));
        var size = cc.size(this._imageBg.node.getContentSize().width, desHeight);
        this._imageBg.node.setContentSize(size);
        //  this._nodeTitle.node.y = (desHeight - 25);
        this._resourceNode.setContentSize(size);
        this.node.setContentSize(size);
    }
    onEnter() {
    }
    onExit() {
    }
}