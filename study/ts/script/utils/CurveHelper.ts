import { G_ServerTime } from "../init";
import UIActionHelper from "./UIActionHelper";

export namespace CurveHelper {
    export function bezier3func(uu, controlP: cc.Vec2[]) {
        var part1 = controlP[0].mul((1 - uu) * (1 - uu) * (1 - uu));
        var part2 = cc.pMul(controlP[1], 3 * uu * (1 - uu) * (1 - uu));
        var part3 = cc.pMul(controlP[2], 3 * uu * uu * (1 - uu));
        var part4 = cc.pMul(controlP[3], uu * uu * uu);
        return part1.add(part2).add(part3.add(part4));
    };
    export function lineFunc(uu, startPoint: cc.Vec2, endPoint: cc.Vec2) {
        var positionDelta = endPoint.sub(startPoint);
        return startPoint.add(cc.pMul(positionDelta, uu));
    };
    export function bezier3Length(controlP: cc.Vec2[]) {
        return controlP[3].sub(controlP[0]).mag();
    };
    export function stopCurveMove(component: cc.Component) {
        component.unscheduleAllCallbacks();
    };
    export function doCurveMove(component: cc.Component, endCallback: Function, rotateCallback: Function, moveCallback: Function, curveConfigList: any[], totalTime: number, endTime: number) {
        let node = component.node;
        // node.stopAllActions();
        var curveData = CurveHelper.computeCurveData(curveConfigList, totalTime);
        var startTime = endTime - totalTime;
        var startUU = Math.max(0, Math.min((G_ServerTime.getMSTime() - startTime) / totalTime, 1));
        var [pos, lineStartPos, lineEndPos] = CurveHelper.getCurvePosition(node, curveData, curveConfigList, startUU);
        node.setPosition(pos);
        if (moveCallback) {
            moveCallback(pos);
        }
        if (rotateCallback) {
            rotateCallback(0, lineStartPos, lineEndPos);
        }
        var updateFunc = function () {
            var time = G_ServerTime.getMSTime();
            var uu = (time - startTime) / totalTime;
            uu = Math.max(0, Math.min(uu, 1));
            var [pos, lineStartPos, lineEndPos] = CurveHelper.getCurvePosition(node, curveData, curveConfigList, uu);
            var oldPos = cc.v2(node.getPosition());
            node.setPosition(pos);
            if (moveCallback) {
                moveCallback(pos, oldPos);
            }
            if (rotateCallback) {
                rotateCallback(0, lineStartPos, lineEndPos);
            }
            if (uu >= 1) {
                CurveHelper.stopCurveMove(component);
                if (endCallback) {
                    endCallback();
                }
                return;
            }
        };
        component.schedule(updateFunc, 0);
    };
    export function computeCurveData(curveConfigList: any[], totalTime: number) {
        var s = 0;
        var curveData = {
            s: 0,
            list: []
        };
        for (let k in curveConfigList) {
            var curveConfig: cc.Vec2[] = curveConfigList[k];
            var len = CurveHelper.bezier3Length(curveConfig);
            s = s + len;
            curveData.list.push({
                len: len,
                time: null
            });
        }
        curveData.s = s;
        for (let k in curveData.list) {
            var v = curveData.list[k];
            var time = v.len * totalTime / s;
            v.time = time;
        }
        return curveData;
    };
    export function getCurvePosition(node: cc.Node, curveData: any, curveConfigList: any[], uu): cc.Vec2[] {
        var currS = curveData.s * uu;
        var currCurveIndex = -1;
        var currCurveUU = 0;
        var tempS = 0;
        var lastS = 0;
        for (let k = 0; k < curveData.list.length; k++) {
            var v = curveData.list[k];
            tempS = tempS + v.len;
            if (currS <= tempS) {
                currCurveIndex = k;
                currCurveUU = (currS - lastS) / v.len;
                break;
            }
            lastS = tempS;
        }
        if (currCurveIndex < 0) {
            return [node.getPosition(), null, null];
        }
        var controlP: cc.Vec2[] = curveConfigList[currCurveIndex];
        var pos = CurveHelper.lineFunc(currCurveUU, controlP[0], controlP[3]);
        return [
            pos,
            controlP[0],
            controlP[3]
        ];
    };
}
