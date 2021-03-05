import { TypeConvertHelper } from "../../../../utils/TypeConvertHelper";
import { DataConst } from "../../../../const/DataConst";
import UIHelper from "../../../../utils/UIHelper";
import ViewBase from "../../../ViewBase";
import PopupBase from "../../../../ui/PopupBase";
import CommonPromptSilverNode from "../../../../ui/component/CommonPromptSilverNode";

export default class PromptSilverGetHelper{

    static PROMPT_POS = [
        0,
        35,
        76,
        118,
        160
    ];
    static PROMPT_MAX_NUM = 5;
    static PROMPT_NODE_DATA = {
        node: null,
        state: 0
    };
    static STATE_REUSE = 0;
    static STATE_WAIT = 1;
    static STATE_DO_ACTION = 2;
    static STATE_ACTION_FINISH = 3;
    _nodePrompt: any;
    _promptShowNodeList: any;
    _promptWaitRunNodeList: any[];
    _promptAllNodeList: any[];
    _isInRunPrompt: boolean;

    CommonPromptSilverNode:cc.Prefab;


    constructor(promptSilverNode:cc.Prefab) {
        this._nodePrompt = null;
        this._promptShowNodeList = {};
        this._promptWaitRunNodeList = [];
        this._promptAllNodeList = [];
        this._isInRunPrompt = false;
        this.CommonPromptSilverNode = promptSilverNode;
    }
    setPromptRootNode(node) {
        this._nodePrompt = node;
    }
    _runFadeInAction(nodeData, finishCallback) {
        var callAction = cc.callFunc(function () {
            nodeData.state = PromptSilverGetHelper.STATE_ACTION_FINISH;
            if (finishCallback) {
                finishCallback();
            }
            if (nodeData.node) {
                nodeData.node.playCrtEffect();
            }
        },this);
        var action = cc.fadeIn(0.2);
        var runningAction = cc.sequence(cc.delayTime(0.1), action, callAction);
        nodeData.node.node.opacity = (0);
        nodeData.node.node.runAction(runningAction);
    }
    _runFadeOutAction(nodeData, finishCallback) {
        var callAction = cc.callFunc(function () {
            this._recyclePromptNodeData(nodeData);
            if (finishCallback) {
                finishCallback();
            }
        }, this);
        var action = cc.fadeOut(0.1);
        var runningAction = cc.sequence(action, callAction);
        nodeData.node.node.runAction(runningAction);
    }
    _runPopAction(nodeData, posY, finishCallback) {
        var callAction = cc.callFunc(function () {
            nodeData.state = PromptSilverGetHelper.STATE_ACTION_FINISH;
            if (finishCallback) {
                finishCallback();
            }
        },this);
        var action = cc.moveTo(0.2, cc.v2(0, posY));
        var runningAction = cc.sequence(action, callAction);
        nodeData.node.node.runAction(runningAction);
    }
    addPrompt(money, crt) {
        var promptData = this._findPromptNodeData();
        this._addWaitRunPromptNodeData(promptData);
        this._refreshPromptNodeData(promptData, money, crt);
        if (this._isInRunPrompt) {
            return;
        }
        this._popPrompt();
    }
    _popPrompt() {
        var popPromptNodeData = this._popWaitPromptNodeData();
        if (!popPromptNodeData) {
            return;
        }
        this._isInRunPrompt = true;
        //var currPromptNum = this._promptShowNodeList.length;
        var maxPromptNum = PromptSilverGetHelper.PROMPT_MAX_NUM;
        var count = 0;
        var maxCount = 1;
        var finishCallback = function () {
            count = count + 1;
            if (count >= maxCount) {
                this._isInRunPrompt = false;
                this._popPrompt();
            }
        }.bind(this);
        popPromptNodeData.state = PromptSilverGetHelper.STATE_DO_ACTION;
        popPromptNodeData.node.node.active = (true);
        this._runFadeInAction(popPromptNodeData, finishCallback);
        for (var i = 1; i<=maxPromptNum; i++) {
            var nodeData = this._promptShowNodeList[i];
            if (nodeData) {
                if (i < maxPromptNum) {
                    var posY = PromptSilverGetHelper.PROMPT_POS[i];
                    this._runPopAction(nodeData, posY, finishCallback);
                    nodeData.state = PromptSilverGetHelper.STATE_DO_ACTION;
                    maxCount = maxCount + 1;
                } else {
                    this._runFadeOutAction(nodeData, finishCallback);
                    nodeData.state = PromptSilverGetHelper.STATE_DO_ACTION;
                    maxCount = maxCount + 1;
                }
            }
        }
        for (var i = maxPromptNum - 1; i>=1; i--) {
            var nodeData = this._promptShowNodeList[i];
            this._promptShowNodeList[i + 1] = nodeData;
        }
        this._promptShowNodeList[1] = popPromptNodeData;
    }
    _popWaitPromptNodeData() {
        if (this._promptWaitRunNodeList.length <= 0) {
            return null;
        }
        var promptData = this._promptWaitRunNodeList.pop();
        return promptData;
    }
    _addWaitRunPromptNodeData(nodeData) {
        nodeData.state = PromptSilverGetHelper.STATE_WAIT;
        this._promptWaitRunNodeList.push(nodeData);
    }
    _findPromptNodeData() {
        for (let k in this._promptAllNodeList) {
            var v = this._promptAllNodeList[k];
            if (v.state == PromptSilverGetHelper.STATE_REUSE) {
                return v;
            }
        }
        var nodeData = this._createPromptNodeData();
        return nodeData;
    }
    _recyclePromptNodeData(nodeData) {
        nodeData.state = PromptSilverGetHelper.STATE_REUSE;
        nodeData.node.node.active = (false);
        (nodeData.node as cc.Component).node.opacity = (255);
        nodeData.node.node.y = (0);
        nodeData.node.setCrt(0);
    }
    _createPromptNodeData() {
        var node:CommonPromptSilverNode = cc.instantiate(this.CommonPromptSilverNode).getComponent(CommonPromptSilverNode);//UIHelper.loadResourceNode(Path.getCSB('CommonPromptSilverNode', 'common'));
        this._nodePrompt.addChild(node.node);
        node.node.setPosition(cc.v2(0, 0));
        node.node.active = (false);
        var nodeData = {
            node: node,
            state: PromptSilverGetHelper.STATE_REUSE
        };
        this._promptAllNodeList.push(nodeData);
        return nodeData;
    }
    _refreshPromptNodeData(nodeData, money, crt) {
        nodeData.node.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, money);
        nodeData.node.setCrt(crt);
    }
}
