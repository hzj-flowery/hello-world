import EffectHelper from "../../../effect/EffectHelper";
import { G_EffectGfxMgr, G_Prompt } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import HeroGoldCostPanel from "./HeroGoldCostPanel";
const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonLimitBaseView extends ViewBase{
    
    @property({
        type: cc.Node,
        visible: true
    })
    _nodePopup: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHetiMoving: cc.Node = null;

    

    private _popupPanel:HeroGoldCostPanel;
    private _popupPanelSignal:any;
    private _materialFakeCount:number;
    private _materialFakeCurSize:number;
    private _materialFakeCostCount:number;
    private _lvUpCallback:any;
    protected _materialMaxSize:any;
    protected _costMaterials:any;

    protected  onCreate(){
        this._updateMaterialMaxSize();
    };
    protected  onEnter(){

    };
    protected  onExit(){

    };

    _newCostNode(costKey) {
    }
    _onClickCostAdd(costKey) {
        cc.warn('CommonLimitBaseView:_onClickCostAdd');
        this._openPopupPanel(costKey, this._getLimitLevel());
    }
    _openPopupPanel(costKey, level) {
        if (this._popupPanel != null) {
            return;
        }
        this._popupPanel = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroGoldCostPanel","heroGoldTrain"))) as cc.Node).getComponent(HeroGoldCostPanel) as HeroGoldCostPanel;
        this._popupPanel.setInitData(costKey, handler(this, this._onClickCostPanelItem), handler(this, this._onClickCostPanelStep), handler(this, this._onClickCostPanelStart), handler(this, this._onClickCostPanelStop), level, this['_costNode' + costKey].node);
        this._popupPanelSignal = this._popupPanel.signal.add(handler(this, this._onPopupPanelClose));
        this._nodePopup.addChild(this._popupPanel.node);
        this._popupPanel.updateUI();
    }
    _onPopupPanelClose(event) {
        if (event == 'close') {
            this._popupPanel = null;
            if (this._popupPanelSignal) {
                this._popupPanelSignal.remove();
                this._popupPanelSignal = null;
            }
        }
    }
    _onClickCostPanelItem(costKey, materials) {
        if (this._checkIsMaterialFull(costKey) == true) {
            return;
        }
        this._doPutRes(costKey, materials);
    }
    _onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime):Array<any> {
        if (this._materialFakeCount <= 0) {
            return [false,null,false];
        }
        if (this._materialFakeCurSize >= this._materialMaxSize[costKey]) {
            G_Prompt.showTip(Lang.get('hero_limit_material_full'));
            return [
                false,
                null,
                true
            ];
        }
        var realCostCount = Math.min(this._materialFakeCount, costCountEveryTime);
        this._materialFakeCount = this._materialFakeCount - realCostCount;
        this._materialFakeCostCount = this._materialFakeCostCount + realCostCount;
        var costSizeEveryTime = this._getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime);
        this._materialFakeCurSize = this._materialFakeCurSize + costSizeEveryTime;
        if (this._popupPanel) {
            var emitter = this._createEmitter(costKey);
            var startNode = this._popupPanel.findNodeWithItemId(itemId);
            var endNode = this['_costNode' + costKey];
            this._playEmitterEffect(emitter.node, startNode.node, endNode.node, costKey, this._materialFakeCurSize);
            startNode.setCount(this._materialFakeCount);
        }
        return [
            true,
            realCostCount
        ];
    }
    _onClickCostPanelStart(costKey, itemId, count) {
        this._materialFakeCount = count;
        this._materialFakeCostCount = 0;
        this._materialFakeCurSize = this._getFakeCurSize(costKey);
    }
    _onClickCostPanelStop() {
        
    }
    _createEmitter(costKey):cc.ParticleSystem {
        var names = this._getEmitterNames();
        var emitter = (new cc.Node()).addComponent(cc.ParticleSystem) as cc.ParticleSystem;
        EffectHelper.loadEffectRes('particle/' + (names[costKey] + '.plist'),cc.ParticleAsset,function(res:any){
        emitter.file = res;
        emitter.resetSystem();
    }.bind(this));

        return emitter;
    }
    _playEmitterEffect(emitter:cc.Node, startNode:cc.Node, endNode:cc.Node, costKey:number, curCount:number) {
        var getRandomPos = function (startPos, endPos) {
            var pos11 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 3 / 4);
            var pos12 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos21 = cc.v2(startPos.x + (endPos.x - startPos.x) * 3 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2);
            var pos22 = cc.v2(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 1 / 4);
            var tbPos = {
                [1]: [
                    pos11,
                    pos12
                ],
                [2]: [
                    pos21,
                    pos22
                ]
            };
            var index = 1;
            if(Math.random()>0.5)
            index = 2;
            return [
                tbPos[index][0],
                tbPos[index][1]
            ];
        }
        var startPos = UIHelper.convertSpaceFromNodeToNode(startNode, this.node);
        emitter.setPosition(startPos);
        this.node.addChild(emitter);
        var endPos = UIHelper.convertSpaceFromNodeToNode(endNode, this.node);
        var [pointPos1, pointPos2] = getRandomPos(startPos, endPos);
        var bezier = [
            pointPos1,
            pointPos2,
            endPos
        ];
        var action1 = cc.bezierTo(0.7, bezier);
        var action2 = action1.easing(cc.easeSineIn());
        emitter.runAction(cc.sequence(action2,cc.callFunc(function () {
            var realCount = this._getFakeCurSize(costKey);
            var isFull = realCount >= this._materialMaxSize[costKey];
            curCount = isFull && realCount || curCount;
            this['_costNode' + costKey].playRippleMoveEffect(1, curCount);
            this['_costDetail' + costKey].playRippleMoveEffect(1, curCount);
        }.bind(this)), cc.destroySelf()));
    }
    _getEmitterNames() {
        var names = {
            [1]: 'tujiegreen',
            [2]: 'tujieblue',
            [3]: 'tujiepurple',
            [4]: 'tujieorange'
        };
        return names;
    }
    _playLvUpEffect() {
        var effectFunction = function (effect) {
            return new cc.Node();
        }
        var eventFunction = function (event) {
            if (event == 'faguang') {
            } else if (event == 'finish') {
                var delay =cc.delayTime(0.5);
                var sequence =cc.sequence(delay,cc.callFunc(function () {
                    if (this._lvUpCallback) {
                        this._lvUpCallback();
                    }
                }.bind(this)));
                this.node.runAction(sequence);
            }
        }.bind(this)
        this._updateMaterialMaxSize();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeHetiMoving, 'moving_tujieheti', effectFunction, eventFunction, true);
        this._playCostNodeSMoving();
    }
    _putResEffect(costKey) {
        if (this._popupPanel == null) {
            this._updateCost();
            return;
        }
        if (this._materialFakeCostCount && this._materialFakeCostCount > 0) {
            this._materialFakeCostCount = null;
            this._updateCost();
        } else {
            var curCount = this._getFakeCurSize(costKey);
            for (var i in this._costMaterials) {
                var material = this._costMaterials[i];
                var itemId = material.id;
                var emitter = this._createEmitter(costKey);
                var startNode = this._popupPanel.findNodeWithItemId(itemId);
                var endNode = this['_costNode' + costKey];
                this['_costNode' + costKey].lock();
                this._playEmitterEffect(emitter.node, startNode.node, endNode.node, costKey, curCount);
            }
        }
        this._popupPanel.updateUI();
        if (this._checkIsMaterialFull(costKey) == true) {
            this._popupPanel.close();
        }
    }
    _updateMaterialMaxSize() {
        this._materialMaxSize = this._getMaterialMaxSize();
    }
    _getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime) {
        return costCountEveryTime;
    }
    _getFakeCurSize(costKey) {
        return 0;
    }
    _checkIsMaterialFull(costKey) {
        return false;
    }
    _getMaterialMaxSize() {
    }
    _doPutRes(costKey, materials) {
    }
    _updateCost() {
        cc.warn('CommonLimitBaseView:_updateCost');
    }
    _getLimitLevel() {
        return 0;
    }
    setLvUpCallback(callback) {
        this._lvUpCallback = callback;
    }
    _playCostNodeSMoving() {
    }
}