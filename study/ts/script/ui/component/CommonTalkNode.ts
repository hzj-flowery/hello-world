import { ConfigNameConst } from "../../const/ConfigNameConst";
import { RichTextExtend } from "../../extends/RichTextExtend";
import { Colors, G_ConfigLoader, G_EffectGfxMgr } from "../../init";
import { RichTextHelper } from "../../utils/RichTextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTalkNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTalkBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTalk: cc.Label = null;

    private _maxWidth = 0;
    private _currBubbleIndex = 0;
    private _richText:cc.RichText;

    public getTalkString() {
        return this._textTalk.string;
    }

    public showLoopBubbleList(bubbleList: any[], interval?) {
        this._imageTalkBG.node.stopAllActions();
        interval = interval || 5;
        let getBubbleMsg = function (bubbleId) {
            var data = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE).get(parseInt(bubbleId));
            return data.content;
        }.bind(this);
        let loopFunc = function () {
            this._currBubbleIndex = this._currBubbleIndex + 1;
            if (this._currBubbleIndex > bubbleList.length) {
                this._currBubbleIndex = 1;
            }
            var bubbleId = bubbleList[this._currBubbleIndex - 1];
            var bubbleMsg = getBubbleMsg(bubbleId);
            this.setText(bubbleMsg, null, true);
        }.bind(this);
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(cc.callFunc(loopFunc), delay);
        var action = cc.repeatForever(sequence);
        this._imageTalkBG.node.runAction(action);
    }

    public showLoopBubble(content: string, interval) {
        this._imageTalkBG.node.stopAllActions();
        interval = interval || 5;
        let getBubbleMsg = function (bubbleId) {
            var data = G_ConfigLoader.getConfig(ConfigNameConst.BUBBLE).get(parseInt(bubbleId));
            return data.content;
        }
        let loopFunc = function () {
            var npc1talk = content.split('|');
            this._currBubbleIndex = this._currBubbleIndex + 1;
            if (this._currBubbleIndex > npc1talk.length) {
                this._currBubbleIndex = 1;
            }
            var bubbleId = npc1talk[this._currBubbleIndex - 1];
            var bubbleMsg = getBubbleMsg(bubbleId);
            this.setText(bubbleMsg, null, true);
        }
        var delay = cc.delayTime(interval);
        var sequence = cc.sequence(cc.callFunc(loopFunc), delay);
        var action = cc.repeatForever(sequence);
        this._imageTalkBG.node.runAction(action);
    }

    public setBubbleColor(color) {
        this._textTalk.node.color = (color);
    }

    public setMaxWidth(maxWidth) {
        this._maxWidth = maxWidth;
    }

    public setBubbleScaleX(xScale) {
        this._textTalk.node.scaleX = (xScale);
        var imageBG = this._imageTalkBG.node.getContentSize().width;
        this._textTalk.node.x = (imageBG);
    }

    public setBubblePositionX(xScale) {
        this._textTalk.node.x = (xScale);
    }

    public setText(talkString, maxWidth, needAnim?, towards?) {
        var minWidth = 62;
        var minHeight = 66;
        this._maxWidth = maxWidth || this._maxWidth;
        this._textTalk.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        if (this._maxWidth > 0) {
            this._textTalk.node.width = (this._maxWidth);
        }
        this._textTalk.string = (talkString);
        (this._textTalk as any)._updateRenderData(true);
        var size = this._textTalk.node.getContentSize();
        var bubbleWidth = minWidth;
        if (size.width > minWidth) {
            bubbleWidth = size.width + 20;
        }
        var bubbleHeight = minHeight;
        var changeLine = size.height > this._textTalk.fontSize;
        if (changeLine) {
            bubbleHeight = size.height + 45;
        }
        this._imageTalkBG.node.setScale(1);
        this._imageTalkBG.node.setContentSize(bubbleWidth, bubbleHeight);
        if (needAnim) {
            G_EffectGfxMgr.applySingleGfx(this._imageTalkBG.node, 'smoving_duihuakuang');
        }
        var textY = (bubbleHeight - 20) / 2 + 20;
        this._textTalk.node.setPosition(bubbleWidth / 2, textY);
    }

    public setString(talkString, maxWidth, needAnim, minWidth, minHeight, horizonBlank?, verticalBlank?, isRichText?) {
        minWidth = minWidth || 62;
        minHeight = minHeight || 66;
        horizonBlank = horizonBlank || 40;
        verticalBlank = verticalBlank || 50;
        var arrowHeight = 18;
        this._maxWidth = maxWidth || this._maxWidth;
        var textWidth = Math.max(this._maxWidth - horizonBlank, 10);
        this._maxWidth = textWidth + horizonBlank;
        var size = null;
        var textWidget = null;
        if (isRichText) {
            this._textTalk.node.active = (false);
            var richText = this._createProgressRichText(talkString, textWidth);
            size = richText.getContentSize();
            textWidget = this._richText;
        } else {
            this._textTalk.node.active =(true);
            this._textTalk.string = (talkString);
            (this._textTalk as any)._updateRenderData(true);
            if (this._richText) {
                this._richText.node.destroy();
            }
            var render = this._textTalk.node.width;
            this._textTalk.node.width = (textWidth);
            size = this._textTalk.node.getContentSize();
            textWidget = this._textTalk;
        }
        var bubbleSize = cc.size(size.width, size.height);
        bubbleSize.width = bubbleSize.width + horizonBlank;
        bubbleSize.height = bubbleSize.height + verticalBlank;
        if (bubbleSize.width < minWidth) {
            bubbleSize.width = minWidth;
        }
        if (bubbleSize.height < minHeight) {
            bubbleSize.height = minHeight;
        }
        if (bubbleSize.width > maxWidth) {
            bubbleSize.width = maxWidth;
        }
        var posY = (verticalBlank - arrowHeight) * 0.5 + arrowHeight + (bubbleSize.height - verticalBlank - size.height) * 0.5;
        this._imageTalkBG.node.setScale(1);
        this._imageTalkBG.node.setContentSize(bubbleSize);
        textWidget.node.setAnchorPoint(cc.v2(0, 0));
        textWidget.node.setPosition(horizonBlank * 0.5, posY);
        if (needAnim) {
            G_EffectGfxMgr.applySingleGfx(this._imageTalkBG.node, 'smoving_duihuakuang');
        }
    }

    public doAnim() {
        this._imageTalkBG.node.setScale(1);
        G_EffectGfxMgr.applySingleGfx(this._imageTalkBG.node, 'smoving_duihuakuang');
    }

    private _createProgressRichText(msg, width) {
        if (this._richText) {
            this._richText.node.destroy();
        }
        var richMsg = RichTextHelper.getRichMsgListForHashText(msg, Colors.BRIGHT_BG_RED, Colors.BRIGHT_BG_TWO, 20);
        var widget = RichTextExtend.createWithContent(richMsg);
        widget.node.setAnchorPoint(0, 0);
        widget.maxWidth = width;
        // widget.formatText();
        this._imageTalkBG.node.addChild(widget.node);
        this._richText = widget;
        return widget.node;
    }
}