import { RichTextExtend } from "../../extends/RichTextExtend";
import { G_SceneManager } from "../../init";

export default class PromptTextSummary {

    static TEXT_LINE_INTERVAL = 40;

    private _lastIndex;
    private _index;
    private _allOffsetY;
    private _showDuration;
    private _moveDuration;
    private _stayDuration;
    private _outDuration;

    private _startPos = cc.v2(0, 0);
    private _endPos = cc.v2(0, 0);

    private _finishCallback;

    constructor() {
        this._lastIndex = 0;
        this._index = 1;
        this._allOffsetY = 100;
        this._showDuration = 0.3;
        this._moveDuration = 0.3;
        this._stayDuration = 0.5;
        this._outDuration = 0.35;
    }

    _getRichText(params) {
        var richTexts = [];
        for (var i = 0; i < params.length; i++) {
            var param = params[i];
            var richText = null;
            if (param.content) {
                // logWarn('content !!!!!!!');
                richText = RichTextExtend.createWithContent(param.content);
            }
            var group = param.group || 0;
            richTexts.push({
                text: richText,
                group: group,
                id: i
            });
        }
        richTexts.sort((a, b) => {
            if (a.group != b.group) {
                if (a.group < b.group) return 1;
                return a.group > b.group ? -1 : 0;
            }
            if (a.id < b.id) return 1;
            return a.id > b.id ? -1 : 0;
        });
        return richTexts;
    }

    _arrageTexts(richTexts) {
        var groups = [];
        var nums = richTexts.length;
        var conH = nums * 40;
        var tempGroup = null;
        var runningScene = G_SceneManager.getRunningScene();
        var width = 0;
        var height = 0;
        for (var i = 0; i < nums; i++) {
            var index = i - 1 - nums / 2 + 0.5;
            var richText = richTexts[i].text;
            var group = richTexts[i].group;
            runningScene.addTextSummary(richText.node);
            var offsetX = this._startPos.x;
            var offsetY = this._startPos.y;
            var dstPos = cc.v2(width / 2 + offsetX, height / 2 + offsetY - PromptTextSummary.TEXT_LINE_INTERVAL * index);
            dstPos.y = dstPos.y + this._allOffsetY;
            var startPos = cc.v2(dstPos.x, dstPos.y - conH);
            richText.node.setPosition(startPos);
            richText.node.setScale(0.3);
            // richText.node.setOpacity(0);
            richText.node.active = (false);
            if (group != tempGroup) {
                groups.push([]);
                tempGroup = group;
            }
            groups[groups.length-1].push({
                text: richText,
                dstPos: dstPos
            });
        }
        return groups;
    }

    _doTextOutAnimations(richTexts, callback) {
        for (var i = 0; i < richTexts.length; i++) {
            var text = richTexts[i].text;
            var endPos = this._endPos;
            var finishCallback = richTexts[i].finishCallback;
            var spawn = null;
            var action1 = null;
            var action2 = null;
            var action3 = null;
            if (endPos != null) {
                endPos.y = endPos.y - this._index * PromptTextSummary.TEXT_LINE_INTERVAL;
                action1 = cc.scaleTo(this._outDuration, 0.3);
                action2 = cc.moveTo(this._outDuration, endPos);
                action3 = cc.fadeOut(this._outDuration);
                spawn = cc.spawn(action1, action2, action3);
            } else {
                action1 = cc.scaleTo(this._outDuration, 0.3);
                action2 = cc.fadeOut(this._outDuration);
                spawn = cc.spawn(action1, action2);
            }
            var finishCallback = null;
            if (i == richTexts.length) {
                finishCallback = this._finishCallback;
            }
            var seq = cc.sequence(cc.delayTime(this._stayDuration), spawn, cc.callFunc((node, params) => {
                if (callback != null && typeof (callback) == 'function') {
                    callback();
                }
                node.destroy(true);
            }), cc.callFunc(() => {
                finishCallback && finishCallback();
            }));
            text.node.runAction(seq);
        }
    }

    _doTextInAnimations(richTexts, groups) {
        var groupItems = groups[this._index];
        var len = groupItems.length;
        for (var i = 0; i<len; i++) {
            var text = groupItems[i].text;
            var dstPos = groupItems[i].dstPos;
            var action1 = cc.scaleTo(this._showDuration, 1);
            var action2 = cc.fadeTo(this._showDuration, 255);
            var spawn: cc.FiniteTimeAction = cc.spawn(action1.easing(cc.easeExponentialOut()), action2.easing(cc.easeExponentialOut()));
            var move = null;
            if (this._lastIndex > 1) {
                move = cc.moveTo(this._moveDuration, dstPos);
                move.easing(cc.easeExponentialOut());
            } else {
                move = cc.callFunc( () => {
                });
            }
            var seq = cc.sequence(spawn, move, cc.callFunc( () => {
                // if (i == len && this._index < this._lastIndex) {
                //     this._index = this._index + 1;
                //     this._doTextInAnimations(richTexts, groups);
                // } else if (i == len && this._index >= this._lastIndex) {
                //     this._doTextOutAnimations(richTexts);
                // }
                if (this._index < this._lastIndex) {
                    this._index = this._index + 1;
                    this._doTextInAnimations(richTexts, groups);
                } else if (i == len && this._index >= this._lastIndex) {
                    this._doTextOutAnimations(richTexts, null);
                }
            }));
            text.node.active = (true);
            text.node.runAction(seq);
        }
    }

    show(params, extParams) {
        // var height = Math.min(640, display.height);
        var height = 640;
        var endY = height * 0.5;
        if (params == null || params.length == 0) {
            return endY;
        }
        extParams = extParams || {};
        this._allOffsetY = extParams != null && extParams.allOffsetY != null && extParams.allOffsetY || 100;
        this._showDuration = extParams != null && extParams.showDuration != null && extParams.showDuration || 0.3;
        this._moveDuration = extParams != null && extParams.moveDuration != null && extParams.moveDuration || 0.3;
        this._stayDuration = extParams != null && extParams.stayDuration != null && extParams.stayDuration || 0.5;
        this._outDuration = extParams != null && extParams.outDuration != null && extParams.outDuration || 0.35;
        this._startPos = extParams.startPosition || cc.v2(0, 0);
        this._endPos = extParams.dstPosition || null;
        this._finishCallback = extParams.finishCallback || null;
        var richTexts = this._getRichText(params);
        var nums = richTexts.length;
        endY = height * 0.5 + nums * 40 / 2 + this._allOffsetY;
        var groups = this._arrageTexts(richTexts);
        // dump(groups);
        this._lastIndex = groups.length - 1;
        this._doTextInAnimations(richTexts, groups);
        return endY;
    }

}