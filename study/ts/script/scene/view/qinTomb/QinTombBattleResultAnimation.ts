const { ccclass, property } = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'
import PopupBase from '../../../ui/PopupBase';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { G_EffectGfxMgr } from '../../../init';
import QinTombBattleResultNode from './QinTombBattleResultNode';
import { handler } from '../../../utils/handler';

@ccclass
export default class QinTombBattleResultAnimation extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: CommonContinueNode, visible: true })
    _nodeContinue: CommonContinueNode = null;

    @property({ type: cc.Prefab, visible: true })
    _battleResultNode1Prefab: cc.Prefab = null;

    @property({ type: cc.Prefab, visible: true })
    _battleResultNode2Prefab: cc.Prefab = null;

    private _nodeList: QinTombBattleResultNode[] = [];
    private _reportList: any[];
    private _finishCall;
    private _isWin;

    public onCreate() {
        this._nodeContinue.node.active = (false);
        this._panelTouch.on(cc.Node.EventType.TOUCH_END,handler(this,this._onClickTouch));
    }

    public onEnter() {
        this._createEffectNode(this._panelRoot);
    }

    public onExit() {
    }

    public updateUI(report) {
        var reportList = report.report;
        var is_win = report.is_win;
        var report_type = report.report_type;
        this._reportList = reportList;
        this._isWin = is_win;
    }

    public getAttackUser(index) {
        var reportData = this._reportList[index - 1];
        if (reportData) {
            return [
                reportData.attack,
                reportData.result
            ];
        }
    }

    public getDefenseUser(index) {
        var reportData = this._reportList[index - 1];
        if (reportData) {
            var result = reportData.result;
            var retResult = result;
            if (result == 2) {
                retResult = 1;
            } else if (result == 1) {
                retResult = 2;
            }
            return [
                reportData.defense,
                retResult
            ];
        }
    }

    private _createActionNode(effect) {

        let createAttackEffect = function (index) {
            let [data, result] = this.getAttackUser(index);
            let resultNode = cc.instantiate(this._battleResultNode1Prefab).getComponent(QinTombBattleResultNode);
            resultNode.init(1);
            resultNode.updateUI(data, 'attack', result);
            this._nodeList.push(resultNode);
            return resultNode.node;
        }.bind(this);
        let createDefenseEffect = function (index) {
            let [data, result] = this.getDefenseUser(index);
            let resultNode = cc.instantiate(this._battleResultNode2Prefab).getComponent(QinTombBattleResultNode);
            resultNode.init(2);
            resultNode.updateUI(data, 'defense', result);
            this._nodeList.push(resultNode);
            return resultNode.node;
        }.bind(this);
        if (effect == 'hong1') {
            return createDefenseEffect(1);
        } else if (effect == 'hong2') {
            return createDefenseEffect(2);
        } else if (effect == 'hong3') {
            return createDefenseEffect(3);
        } else if (effect == 'lan1') {
            return createAttackEffect(1);
        } else if (effect == 'lan2') {
            return createAttackEffect(2);
        } else if (effect == 'lan3') {
            return createAttackEffect(3);
        } else if (effect == 'jiesuan') {
            if (this._isWin) {
                return UIHelper.createImage({ texture: Path.getTextBattle('txt_com_battle_v06') });
            } else {
                return UIHelper.createImage({ texture: Path.getTextBattle('txt_com_battle_f06') });
            }
        }
    }

    private _onClickTouch() {
        if (this._nodeContinue.node.active == true) {
            if (this._finishCall) {
                this._finishCall();
            }
            this.close();
        }
    }

    private _createEffectNode(rootNode) {
        function effectFunction(effect) {
            return this._createActionNode(effect);
        }
        function eventFunction(event, frameIndex, movingNode) {
            if (event == 'die') {
                for (let i in this._nodeList) {
                    var value = this._nodeList[i];
                    value.updateNodeState();
                }
            }
            if (event == 'finish') {
                this._nodeContinue.node.active = (true);
            }
        }
       
        var node = G_EffectGfxMgr.createPlayMovingGfx(rootNode, 'moving_xianqinhuangling_zhanbao', effectFunction.bind(this), eventFunction.bind(this), false);
        return node;
    }

    public showResult(finishCall) {
        this._finishCall = finishCall;
        this.open();
    }
}