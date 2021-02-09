// import { G_ResolutionManager, G_SceneManager, G_TopLevelNode, Colors } from "../../init";
// import { assert } from "../../utils/GlobleFunc";
// import UIHelper from "../../utils/UIHelper";
// import { Path } from "../../utils/Path";

// export default class prompt{

//     private _callback;
//     constructor(callback) {
//         this._callback = callback;
//     }
//     // _loadCsb() {
//     //     return node;
//     // }
//     _updateRichText(node, content) {
//         var node1 = new cc.Node();
//         var richText = node1.addComponent(cc.RichText) as cc.RichText;
//         richText.string = (content);
//         var label = node.getSubNodeByName('Text_tip_content');
//         richText.node.setPosition(label.getPosition());
//         label.setVisible(false);
//         //richText.formatText();
//         var richTextContentSize = richText.getVirtualRendererSize();
//         if (richTextContentSize.width > 420) {
//             richText.ignoreContentAdaptWithSize(false);
//             richText.setContentSize(cc.size(440, 60));
//             richText.setVerticalSpace(5);
//         }
//         var height = richTextContentSize.width > 420 && 60;
//         if (height) {
//             var background = node.getSubNodeByName('Image_tip_background');
//             var backContentSize = background.getContentSize();
//             background.setContentSize(cc.size(backContentSize.width, height + 35));
//         }
//         node.addChild(richText);
//     }
//     _updateText(node:, text) {
//         var label = node.updateLabel('Text_tip_content',(text));
//         var labelContentSize = label.getVirtualRendererSize();
//         if (labelContentSize.width > 420) {
//             label.setTextAreaSize(cc.size(420, 60));
//         }
//         var height = labelContentSize.width > 420 && 60;
//         if (height) {
//             var background = node.getSubNodeByName('Image_tip_background');
//             var backContentSize = background.getContentSize();
//             background.setContentSize(cc.size(backContentSize.width, height + 35));
//         }
//     }
//     _updateRichTextType2(node, params) {
//         if (params && params.str) {
//             var richText = UIHelper.createMultiAutoCenterRichText(params.str, params.defaultColor || Colors.OBVIOUS_YELLOW, params.fontSize || 22, 5);
//             var label = node.getSubNodeByName('Text_tip_content');
//             richText.setPosition(label.getPosition());
//             label.setVisible(false);
//             var background = node.getSubNodeByName('Image_tip_background');
//             var backContentSize = background.getContentSize();
//             var richSize = richText.getContentSize();
//             var bgWidth = backContentSize.width > richSize.width + 40 && backContentSize.width || richSize.width + 40;
//             var bgHeight = backContentSize.height > richSize.height + 35 && backContentSize.height || richSize.height + 35;
//             background.setContentSize(cc.size(bgWidth, bgHeight));
//             node.addChild(richText);
//         }
//     }
//     show(params, delayTime) {
//       //assert((params && (typeof(params) == 'string' || typeof(params) == 'object'), 'Invalid params: '+(params));
//         var node = CSHelper.loadResourceNode(Path.getCSB('PromptTipNode', 'common'));
//         if (typeof(params) == 'object') {
//             this._updateRichTextType2(node, params);
//         } else {
//             var content = JSON.parse(params);
//             if (typeof(content) == 'object') {
//                 this._updateRichText(node, params);
//             } else {
//                 this._updateText(node, params);
//             }
//         }
//         var width = G_ResolutionManager.getDesignWidth();
//         var height = G_ResolutionManager.getDesignHeight();
//         var scene = G_SceneManager.getRunningScene();
//         scene.addTips(node);
//         node.setPosition(new cc.Vec2(width / 2, height / 5 * 2.6));
//         node.setCascadeOpacityEnabled(true);
//         var callBackAction = cc.callFunc(function () {
//             if (this._callback) {
//                 this._callback();
//             }
//         }.bind(this));
//         if (delayTime && delayTime > 0) {
//             var seq1 = cc.sequence(PromptAction.tipAction(), cc.destroySelf());
//             var seq2 = cc.sequence(cc.delayTime(delayTime), callBackAction);
//             node.runAction(cc.spawn(seq1, seq2));
//         } else {
//             node.runAction(cc.sequence(PromptAction.tipAction(), cc.destroySelf(), callBackAction));
//         }
//         return node;
//     }
//     showOnTop(params, delayTime) {
//       //assert((params && (typeof(params) == 'string' || typeof(params) == 'object'), 'Invalid params: ' +(params));
//         var node = CSHelper.loadResourceNode(Path.getCSB('PromptTipNode', 'common'));
//         if (typeof(params) == 'object') {
//             this._updateRichTextType2(node, params);
//         } else {
//             var content = JSON.parse(params);
//             if (typeof(content) == 'object') {
//                 this._updateRichText(node, params);
//             } else {
//                 this._updateText(node, params);
//             }
//         }
//         var width = G_ResolutionManager.getDesignWidth();
//         var height = G_ResolutionManager.getDesignHeight();
//         G_TopLevelNode.addToTipLevel(node);
//         node.setPosition(new cc.Vec2(width / 2, height / 5 * 2.6));
//         node.setCascadeOpacityEnabled(true);
//         var callBackAction = cc.callFunc(function () {
//             if (this._callback) {
//                 this._callback();
//             }
//         });
//         if (delayTime && delayTime > 0) {
//             var seq1 = cc.sequence(PromptAction.tipAction(), cc.destroySelf());
//             var seq2 = cc.sequence(cc.delayTime(delayTime), callBackAction);
//             node.runAction(cc.spawn(seq1, seq2));
//         } else {
//             node.runAction(cc.sequence(PromptAction.tipAction(), cc.destroySelf(), callBackAction));
//         }
//         return node;
//     }
// }