const { ccclass, property } = cc._decorator;

import CommonDetailTitleWithBg from '../../../ui/component/CommonDetailTitleWithBg'
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class TeamSuggestContentCell extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBg: cc.Node = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    })
    _nodeTitle: CommonDetailTitleWithBg = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;

    private _startSize: cc.Size;
    private _startContentPosY: number;
    private _startTitlePosY: number;
    updateUI(title, content) {
        this._startSize = this._panelBg.getContentSize();
        this._startContentPosY = this._content.y;
        this._startTitlePosY = this._nodeTitle.node.y;

        this._content.removeAllChildren();
        this._nodeTitle.setTitle(title);
        var lines = content.split('|');
        var height = 0;
        var heightArr = [];
        for (var k in lines) {
            var line = lines[k];
            var richtext = RichTextExtend.createRichTextByFormatString2(line, Colors.BRIGHT_BG_TWO, 18);
            this._content.addChild(richtext.node);
            // richtext.lineHeight = 4;
            // richtext.ignoreContentAdaptWithSize(false);
            richtext.maxWidth = 330;
            // richtext.formatText();
            var virtualContentSize = richtext.node.getContentSize();
            var richTextWidth = virtualContentSize.width;
            var richtextHeight = virtualContentSize.height;
            richtext.node.setAnchorPoint(cc.v2(0, 1));
            
            richtext.node.setPosition(35, -1 * height);
            heightArr.push(height);
            
            if (k == lines.length) {
                height = height + richtextHeight;
            } else {
                height = height + richtextHeight + 10;
            }
        }
        
        for(var j = 0;j<heightArr.length;j++)
        {
            var signImage = UIHelper.createImage({ texture: Path.getUICommon('img_sign02') });
            signImage.setAnchorPoint(cc.v2(0, 1));
            signImage.setPosition(15, -1 * heightArr[j] - 3);
            this._content.addChild(signImage);
        }

        this._content.y = (this._startContentPosY + height);
        this._nodeTitle.node.y = (this._startTitlePosY + height);
        this._panelBg.setContentSize(cc.size(this._startSize.width, this._startSize.height + height));
        this.node.setContentSize(cc.size(this._startSize.width, this._startSize.height + height));
    }


}