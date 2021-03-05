import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_ResolutionManager } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { RichTextHelper } from "../../../utils/RichTextHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarNoticeNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeTipsParent: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text3: cc.Label = null;

    public static readonly ATTACT_NOTICE_IDS = {
        [1]: true,
        [2]: true,
        [7]: true,
        [8]: true,
        [9]: true,
        [10]: true
    };
    _textList: Array<cc.Label>;
    _dataList: any;
    _dataIndex: number;
    _type: any;

    initData(type) {
        this._textList = null;
        this._dataList = null;
        this._dataIndex = 1;
        this._type = type;
    }
    onCreate() {
        this.node.x = -1*G_ResolutionManager.getDesignWidth() / 2;
        this.node.y = -100;
        this._textList = [
            this._text1,
            this._text2,
            this._text3
        ];
        for (var i in this._textList) {
            var value = this._textList[i];
            value.node.opacity = (0);
        }
        this.clear();
    }
    _getNoticeContent() {
        var content = '';
        if (this._type == 2) {
            content = Lang.get('guildcrosswar_notice_msg');
        } else {
            content = Lang.get('guildwar_notice_msg');
        }
        return content;
    }
    _updateText(unit, textNode) {
        var id = unit.getId();
        var values = unit.getMap2();
        var source = this._getNoticeContent()[id];
        var str = Lang.getTxt(source, values);
        if (textNode == null) {
            return;
        }
        textNode.string = (str);
        if (GuildWarNoticeNode.ATTACT_NOTICE_IDS[id]) {
            textNode.node.color = (Colors.GUILD_WAR_NOTICE_ATTACK_COLOR);
            UIHelper.enableOutline(textNode, Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE, 2)

        } else {
            textNode.node.color = (Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR);
            UIHelper.enableOutline(textNode, Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE, 2)
        }
        textNode.node.opacity = (255);
        var tipActionFunc = function () {
            return cc.sequence(cc.delayTime(5), cc.fadeOut(0.5));
        }.bind(this);
        textNode.node.runAction(tipActionFunc());
    }
    _refreshList() {
        for (var k in this._dataList) {
            var unit = this._dataList[k];
            var id = unit.getId();
            var values = unit.getMap2();
            var source = this._getNoticeContent()[id];
            var str = Lang.getTxt(source, values);
            this._textList[k].string = (str);
            if (GuildWarNoticeNode.ATTACT_NOTICE_IDS[id]) {
                this._textList[k].node.color = (Colors.GUILD_WAR_NOTICE_ATTACK_COLOR);
                UIHelper.enableOutline(this._textList[k], Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE, 2)
            } else {
                this._textList[k].node.color = (Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR);
                UIHelper.enableOutline(this._textList[k], Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE, 2)
            }
        }
    }
    showMsg(unit) {
        var getFreeText = function () {
            for (var i in this._textList) {
                var value = this._textList[i];
                if (value.node.opacity == 0) {
                    return value;
                }
            }
            return null;
        }.bind(this);
        var textNode = getFreeText();
        if (textNode) {
            this._updateText(unit, textNode);
        } else {
            this._showTips(unit);
        }
    }
    clear() {
        this._dataList = [];
        for (var k in this._textList) {
            var v = this._textList[k];
            v.string = ('');
        }
        this._nodeTipsParent.removeAllChildren();
    }
    _showTips(unit) {
        var tipActionFunc = function () {
            return cc.spawn(cc.moveBy(0.4, cc.v2(0, 60)), cc.fadeOut(0.4));
        };
        var id = unit.getId();
        var content = unit.getMap();
        var source = this._getNoticeContent()[id];
        var richContent = null;
        if (GuildWarNoticeNode.ATTACT_NOTICE_IDS[id]) {
            richContent = RichTextHelper.convertRichTextByNoticePairs(source, content, 18, Colors.GUILD_WAR_NOTICE_ATTACK_COLOR, Colors.GUILD_WAR_NOTICE_ATTACK_COLOR_OUTLINE, 2);
        } else {
            richContent = RichTextHelper.convertRichTextByNoticePairs(source, content, 18, Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR, Colors.GUILD_WAR_NOTICE_BE_ATTACK_COLOR_OUTLINE, 2);
        }
        let node1 = RichTextExtend.createWithContent(richContent);
        node1.lineHeight = node1.fontSize + 5;
        node1.node.runAction(cc.sequence(tipActionFunc(), cc.destroySelf()));
        this._nodeTipsParent.addChild(node1.node);
    }

    onEnter() {

    }
    onExit() {

    }

}