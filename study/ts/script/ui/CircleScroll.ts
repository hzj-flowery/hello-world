import { ArraySort, handler } from "../utils/handler";
import UIHelper from "../utils/UIHelper";
import { G_ResolutionManager } from "../init";

const { ccclass, property } = cc._decorator;
var CCSize = cc.size;
var ccp = cc.v2;
var SCALE_OFFSET = 30;
var SCALE_START = 60;

@ccclass
export default class CircleScroll extends cc.Component {
    _angles: any[];
    _angleOffset: any;
    _startIndex: any;
    _scaleRange: any;
    _showList: any[];
    _enabled: boolean;
    isMove: boolean;
    m_nCenter: cc.Vec2;
    m_longAxis: number;
    m_shortAxis: number;
    _zStart: number;
    YMin: number;
    YMax: number;
    _avatarsLayer: any;
    _midLayer: any;
    _touchBegin: cc.Vec2;
    _touchMove: boolean;
    _touchEnable: boolean;
    _touchNode: cc.Node;
    _touchRect: any;
    _midNode: any;

    _scheduleFunc: Function;

    ctor(size, angles, startIndex, angleOffset, circle, scaleRange) {
        //  this.node.setContentSize(cc.size(1136, 640));
        this.node.setAnchorPoint(cc.v2(0.5, 0.5));
        // this.enableNodeEvents();
        this._angles = angles;
        this._angleOffset = angleOffset || 0;
        this._startIndex = startIndex;
        if (scaleRange) {
            this._scaleRange = scaleRange;
        } else {
            this._scaleRange = cc.v2(40, 40);
        }
        this._showList = [];
        this.node.setContentSize(CCSize(size.width, size.height));
        this._enabled = true;
        this.isMove = false;
        this.m_nCenter = cc.v2(size.width * 0.5, size.height * 0.5);
        this.m_longAxis = size.width * 0.45;
        this.m_shortAxis = this.m_longAxis * 0.85;
        if (circle) {
            this.m_longAxis = circle.height;
            this.m_shortAxis = circle.width;
        }
        this._zStart = 0;
        this.YMin = this.m_nCenter.y - this.m_shortAxis;
        this.YMax = this.m_nCenter.y + this.m_shortAxis;
        this._avatarsLayer = new cc.Node('avatarsLayer');
        this._avatarsLayer.setPosition(-size.width / 2, -size.height / 2);
        this._midLayer = new cc.Node('midLayer');
        this._midLayer.setPosition(-size.width / 2, -size.height / 2);
    
        this._touchBegin = cc.v2(0, 0);
        this._touchMove = false;
        this._touchEnable = true;
        var touchNode = new cc.Node('touchNode');
        touchNode.setContentSize(CCSize(size.width, size.height));
        this.node.addChild(touchNode);
        this._touchNode = touchNode;
        this._touchRect = null;

        this.node.addChild(this._midLayer);
        this.node.addChild(this._avatarsLayer);

       this._touchNode.on(cc.Node.EventType.TOUCH_START,  this._onTouchBegan, this, false);
       this._touchNode.on(cc.Node.EventType.TOUCH_MOVE,this._onTouchMoved, this, false);
       this._touchNode.on(cc.Node.EventType.TOUCH_END,  this._onTouchEnded, this, false);
    }
    setMoveEnable(enable) {
        this._touchEnable = enable;
    }
    _onTouchBegan(touch, event) {
        if (this._touchEnable == false) {
            return;
        }
        if (this._touchRect == null) {
            var worldPos = this._touchNode.convertToWorldSpaceAR(cc.v2(0, 0));
            var size = this._touchNode.getContentSize();
            this._touchRect = cc.rect(worldPos.x, worldPos.y, size.width, size.height);
        }
        if (!this._enabled) {
            return;
        }
        if (this.isMove) {
            return;
        }
        this._touchBegin = touch.getLocation();
    }
    _onTouchMoved(touch, event) {
        if (this._touchEnable == false) {
            return;
        }
        if (this.isMove) {
            return;
        }
        var pt = touch.getLocation();
        var deltaX = pt.x - this._touchBegin.x;
        for (var k in this._showList) {
            var v = this._showList[k];
            var [startAngle, endAngle] = this._calcStartAndEndAngle(v.pos, deltaX > 0 && 1 || -1, 1);
            var percent = Math.abs(deltaX / 360);
            if (percent > 1) {
                percent = 1;
            }
            v.agle = startAngle + (endAngle - startAngle) * percent;
        }
        this._arrange();
        this.onTouchMove();
    }
    _onTouchEnded(touch, event) {
        if (this._touchEnable == false) {
            return;
        }
        var pt = touch.getLocation();
        var fDist = Math.abs(pt.x - this._touchBegin.x);
        if (fDist > 10) {
            var step = 1;
            var dir = (pt.x - this._touchBegin.x) / Math.abs(pt.x - this._touchBegin.x);
            this.judgeNeedMoveBack(dir, step);
            return;
        } else {
            this._refresh();
            this.onMoveStop('refresh');
        }
    }
    judgeNeedMoveBack(dir, step) {
        if (this.isMove == true) {
            return;
        }
        this.isMove = true;
        for (var k in this._showList) {
            var v = this._showList[k];
            [v.speed, v.pos , v.EndAngle] = this._calcAngleSpeed(v, v.pos, dir, step); 
        }
        this._scheduleFunc = handler(this, this._moveBackAnimation);
        this.schedule(this._scheduleFunc, 0);
    }
    addMidLayer(node) {
        node.parent = this._avatarsLayer;
        this._midNode = node;
    }
    addNode(node, pos) {
        node.pos = pos;
        [node.agle] = this._calcStartAndEndAngle(pos, 1);
        node.EndAngle = node.agle;
        node.parent = this._avatarsLayer;
        this._showList.push(node);
        this._arrange();
    }
    _refresh() {
        for (var k in this._showList) {
            var v = this._showList[k];
            [v.agle] = this._calcStartAndEndAngle(v.pos, 1);
        }
        this._arrange();
    }
    getOrderList() {
        var _list = this._orderByY();
        return _list;
    }
    _arrange() {
        this._arrangePosition();
        this._arrangeScale();
        this._arrangeZOrder();
    }
    _arrangePosition() {
        for (var k in this._showList) {
            var v = this._showList[k];
            var fAngle = (v.agle + this._angleOffset) % 360;
            var x = Math.cos(fAngle / 180 * 3.14159) * this.m_longAxis + this.m_nCenter.x;
            var y = Math.sin(fAngle / 180 * 3.14159) * this.m_shortAxis * 0.5 + this.m_nCenter.y;
            v.setPosition(x, y);
        }
    }
    _arrangeZOrder() {
        var ZMax = this._zStart + this._showList.length;
        var _list = this._orderByY();
        for (var k in _list) {
            var v = _list[k];
            v.zIndex = (ZMax);
            ZMax = ZMax + 1;
        }
        if (this._midNode) {
            this._midNode.zIndex = (ZMax - 3);
        }
    }
    _orderByY() {
        var _list = [];
        for (var k in this._showList) {
            var v = this._showList[k];
            _list.push(v);
        }
        ArraySort(_list, function (p1, p2) {
            return p1.y > p2.y;
        });
        return _list;
    }
    _arrangeScale() {
        for (var k in this._showList) {
            var v = this._showList[k];
            var fy = v.y;
            if (fy < 0) {
                fy = 0;
            }
            var offset = (this.m_shortAxis * 2 - fy) / (this.m_shortAxis * 2);
            var fScale = this._scaleRange.x + offset * 100;
            if (fScale > this._scaleRange.y) {
                fScale = this._scaleRange.y;
            }
            v.setScale(fScale * 0.01);
            if (v.updateScale) {
                v.updateScale(fScale * 0.01);
            }
        }
    }
    _moveShow() {
        var finished = true;
        for (var k in this._showList) {
            var v = this._showList[k];
            if (v.speed != 0) {
                if (Math.abs(v.agle - v.EndAngle) <= 0.5 || v.speed < 0 && v.agle <= v.EndAngle || v.speed > 0 && v.agle >= v.EndAngle) {
                    v.agle = v.EndAngle;
                    v.speed = 0;
                } else {
                    v.agle = v.agle + (v.EndAngle - v.agle) / 4;
                    finished = false;
                }
            }
        }
        return finished;
    }
    _calcAngleSpeed(sprite, pos, dir, step) {
        if (step == null) {
            step = 1;
        }
        var temp = pos + dir * step;
        var len = this._angles.length;
        if (temp > len) {
            temp = temp - len;
        }
        if (temp < 1) {
            temp = temp + len;
        }
        var [_startAngle, _endAngle] = this._calcStartAndEndAngle(pos, dir, step);
        var subValue = _endAngle - sprite.agle;
        return [
            subValue / 3,
            temp,
            _endAngle
        ];
    }
    _calcStartAndEndAngle(index, dir, step?) {
        index -=1;
        if (step == null) {
            step = 1;
        }
        var startIndex = this._startIndex + index;
        if (startIndex >= this._angles.length) {
            startIndex = startIndex - this._angles.length;
        }
        var endIndex = startIndex + dir * step;
        if (endIndex >= this._angles.length) {
            endIndex = endIndex - this._angles.length;
        }
        if (endIndex < 0) {
            endIndex = endIndex + this._angles.length;
        }
        var startAngle = this._angles[startIndex];
        var endAngle = this._angles[endIndex];
        if (dir == 1) {
            if (startAngle > endAngle) {
                if (startAngle - 360 < 0) {
                    endAngle = endAngle + 360;
                } else {
                    startAngle = startAngle - 360;
                }
            }
        } else {
            if (startAngle < endAngle) {
                if (endAngle - 360 < 0) {
                    startAngle = startAngle + 360;
                } else {
                    endAngle = endAngle - 360;
                }
            }
        }
        return [
            startAngle,
            endAngle
        ];
    }
    _removeTimer() {
        this.unschedule(this._scheduleFunc);
    }
    onMoveStop(reason) {
    }
    onTouchMove() {
    }
    _moveBackAnimation() {
        if (this._moveShow()) {
            this._removeTimer();
            this.isMove = false;
            this.onMoveStop('back');
        }
        this._arrange();
    }
    onEnable() {
        this._moveBackAnimation();
    }
    onExit() {
    }
    setEnabled(bool) {
        this._enabled = bool;
    }
}