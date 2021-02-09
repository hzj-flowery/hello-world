import { G_ResolutionManager } from "../../init";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { FightConfig } from "../FightConfig";
import { FightSignalManager } from "../FightSignalManager";
import { FightSignalConst } from "../FightSignConst";

export default class Gameground extends cc.Component {

    private _debugLayer: cc.Node;
    private _unitLayer: cc.Node;
    private _tipLayer: cc.Node;
    private _layerBlack: cc.Node;

    public init() {
        if (FightConfig.drawRefLine) {
            this._debugLayer = this.createDebugLayer();
            this.node.addChild(this._debugLayer);
        }
        this._unitLayer = new cc.Node("_unitLayer");
        this.node.addChild(this._unitLayer);
        this._tipLayer = new cc.Node("_tipLayer");
        this.node.addChild(this._tipLayer);
        this._layerBlack = null;
    }

    public addActor(actor: cc.Node) {
        this._unitLayer.addChild(actor);
    }

    public removeActor(actor: cc.Node) {
        actor.destroy();
    }

    public removeActorByName(name: string) {
        let child = this._unitLayer.getChildByName(name);
        child && child.destroy();
    }

    public addTipView(view: cc.Node) {
        this._tipLayer.addChild(view);
    }

    public addDrop(stageId: number, awards: any[]) {
        // TODO:
        console.error("[Gameground] addDrop");
        // for (let i = 0; i < awards.length; i++) {
        //     var v = awards[i];
        //     var dropIcon = require('ComponentIconHelper').createIcon(v.type, v.value, v.size);
        //     dropIcon.setTouchEnabled(false);
        //     var camp = Math.floor(stageId / 100);
        //     var cell = stageId % 100;
        //     let pos: number[] = FightConfig.getIdlePosition(camp, cell);
        //     var position = new cc.Vec2(pos[0], pos[1]);
        //     position.y = position.y + FightConfig.GAME_GROUND_FIX;
        //     dropIcon.setLocalZOrder(-Math.round(position.y));
        //     var fix = (i - 1) * 55;
        //     position.x = position.x + fix;
        //     dropIcon.setPosition(position);
        //     dropIcon.setScale(0.8);
        //     this._unitLayer.addChild(dropIcon);

        //     G_EffectGfxMgr.applySingleGfx(dropIcon, 'smoving_wupindiaoluo', function () {
        //         var action1 = cc.spawn(cc.moveTo(0.4, cc.v2(-520, 360)), cc.scaleTo(0.6, 0.2));
        //         var action2 = cc.destroySelf();
        //         var action3 = cc.callFunc(function () {
        //             this._itemMoveFinish();
        //         });
        //         var action = cc.sequence(action1, action3, action2);
        //         dropIcon.runAction(action);
        //     }.bind(this), null, null);
        // }
    }

    private _itemMoveFinish() {
        FightSignalManager.getFightSignalManager().dispatchSignal(FightSignalConst.SIGNAL_DROP_ITEM);
    }

    public createDebugLayer() {
        return null;
        // var layer = new cc.Node();
        // var drawNode = layer.addComponent(cc.Graphics);
        // drawNode.drawLine(cc.v2(FightConfig.cells[1][4][1], FightConfig.cells[1][4][2]), cc.v2(FightConfig.cells[2][4][1], FightConfig.cells[2][4][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[1][5][1], FightConfig.cells[1][5][2]), cc.v2(FightConfig.cells[2][5][1], FightConfig.cells[2][5][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[1][6][1], FightConfig.cells[1][6][2]), cc.v2(FightConfig.cells[2][6][1], FightConfig.cells[2][6][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[1][3][1], FightConfig.cells[1][3][2]), cc.v2(FightConfig.cells[1][1][1], FightConfig.cells[1][1][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[1][6][1], FightConfig.cells[1][6][2]), cc.v2(FightConfig.cells[1][4][1], FightConfig.cells[1][4][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(0, FightConfig.cells[1][1][2]), cc.v2(0, FightConfig.cells[1][3][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[2][3][1], FightConfig.cells[2][3][2]), cc.v2(FightConfig.cells[2][1][1], FightConfig.cells[2][1][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawLine(cc.v2(FightConfig.cells[2][6][1], FightConfig.cells[2][6][2]), cc.v2(FightConfig.cells[2][4][1], FightConfig.cells[2][4][2]), cc.c4f(1, 0, 0, 1));
        // drawNode.drawPoint(cc.v2(0, 0), 20, cc.c4f(0, 0, 1, 1));
        // for (ci in FightConfig.cells) {
        //     var cv = FightConfig.cells[ci];
        //     for (i in cv) {
        //         var v = cv[i];
        //         if (i <= 6) {
        //             var p = [
        //                 {
        //                     x: v[1] - FightConfig.cellWidth,
        //                     y: v[2] + FightConfig.cellWidth
        //                 },                   {
        //                     x: v[1] + FightConfig.cellWidth,
        //                     y: v[2] + FightConfig.cellWidth
        //                 },                   {
        //                     x: v[1] + FightConfig.cellWidth,
        //                     y: v[2] - FightConfig.cellWidth
        //                 },                  {
        //                     x: v[1] - FightConfig.cellWidth,
        //                     y: v[2] - FightConfig.cellWidth
        //                 }
        //             ];
        //             drawNode.drawPolygon(p, 4, cc.c4f(1, 0, 1, 0), 1, cc.c4f(0, 1, 0, 1));
        //             drawNode.drawPoint(cc.v2(v[1], v[2]), 20, cc.c4f(0, 0, 1, 1));
        //         }
        //     }
        // }
        // layer.addChild(drawNode);
        // return layer;
    }

    public showLayerBlack(s: boolean) {
        // console.log("[Gameground] showLayerBlack:", s);
        if (!this._layerBlack) {
            this._layerBlack = UIHelper.newSprite(Path.getUICommon("img_com_line01")).node;
            this._layerBlack.color = new cc.Color(0, 0, 0);
            this._layerBlack.opacity = 255 * FightConfig.BLACK_LAYER_ALPHA;
            this._layerBlack.setAnchorPoint(0.5, 0.5);
            this._layerBlack.setContentSize(G_ResolutionManager.getDesignCCSize());
            this._layerBlack.y += FightConfig.GAME_GROUND_FIX;
            this._unitLayer.addChild(this._layerBlack, FightConfig.ZORDER_BLACK_LAYER);
        }
        this._layerBlack.active = s;
    }
}