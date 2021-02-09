import { RichTextExtend } from "../extends/RichTextExtend";
import { Colors, G_ResolutionManager, G_SceneManager, G_TopLevelNode } from "../init";
import UIHelper from "../utils/UIHelper";
import { Util } from "../utils/Util";
import { PromptAction } from "./prompt/PromptAction";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PrompTip extends cc.Component {

    private _callback;

    setCallBack(callback) {
        this._callback = callback;
    }

    _updateRichText(node, content) {

        var richText: cc.RichText = RichTextExtend.createWithContent(content);
        var label = Util.getSubNodeComponent(node, 'Text_tip_content', cc.Label);
        richText.node.setPosition(label.node.getPosition());
        label.node.active = (false);
        // richText.formatText();
        var richTextContentSize = richText.node.getContentSize();
        if (richTextContentSize.width > 420) {
            // richText.ignoreContentAdaptWithSize(false);
            richText.node.setContentSize(440, 60);
            // richText.setVerticalSpace(5);
        }
        var height = richTextContentSize.height;
        if (height) {
            var background = node.getChildByName('Image_tip_background');
            var backContentSize = background.getContentSize();
            background.setContentSize(backContentSize.width, height + 35);
        }
        node.addChild(richText.node);
    }

    _updateText(node: cc.Node, text) {
        var label = Util.getSubNodeComponent(node, 'Text_tip_content', cc.Label);
        label.string = text.toString();
        Util.updatelabelRenderData(label);
        var labelContentSize = label.node.getContentSize();
        if (labelContentSize.width > 420) {
            // label.setTextAreaSize(contentSize || cc.size(420, 60));
            label.node.setContentSize(420, 60);
        }
        // var height = contentSize && contentSize.height || labelContentSize.width > 420 && 60;
        var height = labelContentSize.width > 420 && 60;
        if (height) {
            var background = node.getChildByName('Image_tip_background');
            var backContentSize = background.getContentSize();
            background.setContentSize(backContentSize.width, height + 35);
        }
    }
    _updateRichTextType2(node, params) {
        if (params && params.str) {
            var richText = UIHelper.createMultiAutoCenterRichText(params.str, params.defaultColor || Colors.OBVIOUS_YELLOW, params.fontSize || 22, 5, null, null);
            var label = node.getChildByName('Text_tip_content');
            richText.setPosition(label.getPosition());
            label.active = (false);
            var background = node.getChildByName('Image_tip_background');
            var backContentSize = background.getContentSize();
            var richSize = richText.getContentSize();
            var bgWidth = backContentSize.width > richSize.width + 40 && backContentSize.width || richSize.width + 40;
            var bgHeight = backContentSize.height > richSize.height + 35 && backContentSize.height || richSize.height + 35;
            background.setContentSize(bgWidth, bgHeight);
            var widget =  richText.addComponent(cc.Widget);
            widget.isAlignHorizontalCenter = true;
            widget.isAlignVerticalCenter = true;
            widget.horizontalCenter = 0;
            widget.verticalCenter = 0;
            node.addChild(richText);
        }
    }
    show(params, delayTime) {

        this._loadTipsNode((promptTipNode: cc.Node) => {
            if (typeof (params) == 'object') {
                this._updateRichTextType2(promptTipNode, params);
            } else {
                if (params.indexOf('{') != -1) {
                    var content = JSON.parse(params);
                    this._updateRichText(promptTipNode, params);
                }
                else {
                    this._updateText(promptTipNode, params);
                }
            }
            var width = G_ResolutionManager.getDesignWidth();
            var height = G_ResolutionManager.getDesignHeight();
            var scene = G_SceneManager.getRunningScene();
            scene.addTips(promptTipNode);
            // promptTipNode.setPosition(width / 2, height / 5 * 2.6);
            // promptTipNode.setCascadeOpacityEnabled(true);
            var callBackAction = cc.callFunc(() => {
                this._callback && this._callback();
            });
            if (delayTime && delayTime > 0) {
                var seq1 = cc.sequence(PromptAction.tipAction(), cc.destroySelf());
                var seq2 = cc.sequence(cc.delayTime(delayTime), callBackAction);
                promptTipNode.runAction(cc.sequence(cc.spawn(PromptAction.tipAction(), seq2), cc.destroySelf()));
            } else {
                promptTipNode.runAction(cc.sequence(PromptAction.tipAction(), callBackAction, cc.destroySelf()));
            }
        });
    }

    showOnTop(params, delayTime) {

        this._loadTipsNode((promptTipNode: cc.Node) => {
            // assert(params && (type(params) == 'string' || type(params) == 'table'), 'Invalid params: ' + tostring(params));
            if (typeof (params) == 'object') {
                this._updateRichTextType2(promptTipNode, params);
            } else {
                if (params.indexOf('{') != -1) {
                    var content = JSON.parse(params);
                    this._updateRichText(promptTipNode, params);
                }
                else {
                    this._updateText(promptTipNode, params);
                }
            }
            var width = G_ResolutionManager.getDesignWidth();
            var height = G_ResolutionManager.getDesignHeight();
            G_TopLevelNode.addToTipLevel(promptTipNode);
            // promptTipNode.setPosition(width / 2, height / 5 * 2.6);
            // promptTipNode.setCascadeOpacityEnabled(true);
            var callBackAction = cc.callFunc(() => {
                this._callback && this._callback();
            });
            if (delayTime && delayTime > 0) {
                var seq2 = cc.sequence(cc.delayTime(delayTime), callBackAction);
                promptTipNode.runAction(cc.sequence(cc.spawn(PromptAction.tipAction(), seq2), cc.destroySelf()));
            } else {
                promptTipNode.runAction(cc.sequence(PromptAction.tipAction(), cc.destroySelf(), callBackAction));
            }
        });
    }

    _loadTipsNode(callback: Function): void {
        cc.resources.load('prefab/common/PromptTipNode', (err, resource) => {
            var promptTipNode: cc.Node = Util.getNode('prefab/common/PromptTipNode');
            callback && callback(promptTipNode);
        });
    }
}