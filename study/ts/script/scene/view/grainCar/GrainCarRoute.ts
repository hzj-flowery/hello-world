import { G_UserData } from "../../../init";
import LinkedList from "../../../utils/dataStruct/LinkedList";
import { assert } from "../../../utils/GlobleFunc";
import ViewBase from "../../ViewBase";
import { MineCraftHelper } from "../mineCraft/MineCraftHelper";
import GrainCarArrow from "./GrainCarArrow";
import { GrainCarDataHelper } from "./GrainCarDataHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRoute extends ViewBase{
    
    @property({
        type: cc.Prefab,
        visible: true
    })
    _GrainCarArrow: cc.Prefab = null;
    

    private _guildNode;
    private _guildArrow;
    public static ARROW_WIDTH = 30;
    ctor() {
       
    }
    onCreate() {
        this._initMember();
        this.node.name = ('GrainCarRoute');
    }
    onEnter() {
        this._updateData();
    }
    onExit() {
    }
    onShowFinish() {
    }
    _initMember() {
        this._guildNode = {};
        this._guildArrow = {};
    }
    _updateData() {
    }
    createRoute(carUnit) {
        var guildId = carUnit.getGuild_id();
        var node = this._getNodeWithGuildId(guildId);
        if (!this._hasCreatedRoute(guildId)) {
            this._createRouteWithCarUnit(node, carUnit);
        }
        if (!carUnit.hasLaunched()) {
            node.active = (false);
        }
    }
    updateArrow(carUnit, percent) {
        if (carUnit.hasLaunched()) {
            var node = this._getNodeWithGuildId(carUnit.getGuild_id());
            node.active = (true);
        }
        var guildId = carUnit.getGuild_id();
        var minPit = carUnit.getCurPit();
        var arrowMineList = this._guildArrow[guildId];
        if (!arrowMineList) {
            return;
        }
        var arrowList = arrowMineList[minPit];
        if (!arrowList) {
            return;
        }
        var firstNode = arrowList.getFirst();
        while (firstNode) {
            var arrow = firstNode.data;
            if (percent > arrow.getPercent()) {
                arrow.node.removeFromParent(true);
                arrowList.remove(firstNode);
                firstNode = arrowList.getFirst();
            } else {
                break;
            }
        }
    }
    removeRoute(carUnit) {
        var guildId = carUnit.getGuild_id();
        if (this._guildNode[guildId]) {
            this._guildNode[guildId].removeFromParent(true);
            this._guildNode[guildId] = null;
            this._guildArrow[guildId] = null;
        }
    }
    removePassed(carUnit) {
        var guildId = carUnit.getGuild_id();
        var arrowMineList = this._guildArrow[guildId];
        if (!arrowMineList) {
            return;
        }
        var passedMineIdList = carUnit.getRoute_passed();
        for (var index = 0; index < passedMineIdList.length - 1; index++) {
            var arrowList = arrowMineList[passedMineIdList[index]];
            if (arrowList) {
                var walk = function (node, arrow) {
                    arrow.node.removeFromParent(true);
                }
                arrowList.walkThrough(walk);
                this._guildArrow[guildId][passedMineIdList[index]] = null;
            }
        }
    }
    _getNodeWithGuildId(guildId):cc.Node {
        var isMyGuild = GrainCarDataHelper.isMyGuild(guildId);
        var zOrder = isMyGuild && 1 || 0;
        if (!this._guildNode[guildId]) {
            var node = new cc.Node();
            this.node.addChild(node, zOrder);
            node.setPosition(cc.v2(0, 0));
            this._guildNode[guildId] = node;
        }
        return this._guildNode[guildId];
    }
    _hasCreatedRoute(guildId):boolean {
        var node = this._getNodeWithGuildId(guildId);
        return node.children.length > 0;
    }
    _createRouteWithCarUnit(node:cc.Node, carUnit) {
        var guildId = carUnit.getGuild_id();
        var route = carUnit.getNextRouteList();
        for (var i = 0; i < route.length - 1; i++) {
            var pit1 = route[i];
            var pit2 = route[i + 1];
            this._createRouteWith2Mine(node, pit1, pit2, guildId);
        }
    }
    _createRouteWith2Mine(node:cc.Node, minPit1, minPit2, guildId) {
        var key = guildId;
        if (!this._guildArrow[guildId]) {
            this._guildArrow[guildId] = [];
        }
        if (!this._guildArrow[guildId][minPit1]) {
            this._guildArrow[guildId][minPit1] = new LinkedList();
        }
        var arrowList = this._guildArrow[guildId][minPit1];
        var midPoints = G_UserData.getMineCraftData().getMidPoints();
        var midPoint = midPoints[minPit1 +""+minPit2];
        if (!midPoint) {
            midPoint = midPoints[minPit2 +""+minPit1];
        }
        assert(midPoint, 'not midPoint between ' + (minPit1 + ('and' + minPit2)));
        var startData = G_UserData.getMineCraftData().getMineDataById(minPit1).getConfigData();
        var startPos = cc.v2(startData.x, startData.y);
        var endData = G_UserData.getMineCraftData().getMineDataById(minPit2).getConfigData();
        var endPos = cc.v2(endData.x, endData.y);
        var bezier = [
            cc.v2(0, 0),
            midPoint.sub(startPos),
            endPos.sub(startPos)
        ];
        var isMyGuild = GrainCarDataHelper.isMyGuild(guildId);
        this._createRouteWith2Point(bezier, node, startPos, endPos, arrowList, isMyGuild);
    }
    _createRouteWith2Point(bezier, node:cc.Node, startPos, endPos, arrowList, isMyGuild) {
        var diffY = Math.abs(endPos.y - startPos.y);
        var diffX = Math.abs(endPos.x - startPos.x);
        var distance = Math.sqrt(diffX * diffX + diffY * diffY);
        var loop = Math.ceil(distance / GrainCarRoute.ARROW_WIDTH);
        if (isMyGuild) {
            loop = loop + 1;
        }
        for (var i = 1; i <= loop; i++) {
            var percent = i / loop;
            var [posx, posy, angle] = MineCraftHelper.getBezierPosition(bezier, percent);
            var arrowNode = cc.instantiate(this._GrainCarArrow)as cc.Node;
            var arrow = arrowNode.getComponent(GrainCarArrow);
            arrow.ctor(isMyGuild);
            node.addChild(arrow.node);
            var pos = startPos.add(cc.v2(posx, posy));
            arrow.node.setPosition(pos);
            arrow.node.setRotation(angle);
            arrow.setPercent(percent);
            let node1 = LinkedList.node(arrow);
            arrowList.addAtTail(node1);
        }
    }
}