import { ExploreConst } from "../../../const/ExploreConst";
import { ExploreEventData } from "../../../data/ExploreEventData";
import { G_SceneManager, G_ServerTime, G_UserData } from "../../../init";
import { handler } from "../../../utils/handler";
import { Util } from "../../../utils/Util";
import ExploreMapView from "./ExploreMapView";
import ExploreMapViewEventIcon from "./ExploreMapViewEventIcon";
import PopupEventBase from "./PopupEventBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExploreMapViewIcons extends cc.Component {

    private static readonly UpdateMilSec = 500;

    static EVENT_ICONS_START_GAP = 60
    static EVENT_ICONS_GAP_Y = 120
    static EVENT_ICONS_END_GAP = 60
    static LAYOUT_TYPE_COUNT = 0      //count 发生变化
    static LAYOUT_TYPE_APPEAR = 1     //事件icon出现 发生变化
    static LAYOUT_TYPE_DISAPPEAR = 2  //事件icon消失 发生变化
    static ICONS_POS_OFFSETX = -10;

    private _parentView: ExploreMapView;
    private _scrollMap: cc.ScrollView;

    private _iconsData: any[];
    private _doLayoutType;
    private _scrollViewSize;

    setUp(parentView: ExploreMapView, _scrollMap: cc.ScrollView): void {
        this._parentView = parentView;
        this._scrollMap = _scrollMap;
        this._scrollMap.content.addChild(this.node);

        this.node.setAnchorPoint(0.5, 1);
        var size = this._scrollMap.content.getContentSize();
        this.node.setContentSize(size);
        this.node.setPosition(size.width / 2, size.height);

        this._scrollViewSize = this._scrollMap.content.getContentSize();
        this.schedule(handler(this, this._onTimer), 0.5, cc.macro.REPEAT_FOREVER);
    }

    onDestroy(): void {
        this.unschedule(this._onTimer);
    }

    private _onTimer(): void {
        if (!this._iconsData) return;
        var currTime = G_ServerTime.getTime();
        for (var _ in this._iconsData) {
            var v = this._iconsData[_];
            if (v.count > 0 && v.time) {
                if (currTime <= v.time) {
                    v.eventIcon.updateLeftTime(G_ServerTime.getLeftSecondsString(v.time, '00:00:00'));
                } else {
                    this._onEventIconsChange(v.eventType);
                }
            }
        }
    }

    public initDataAndUI() {
        var iconsData = [
            {
                eventType: ExploreConst.EVENT_TYPE_ANSWER,
                count: 0,
                posIndex: 0,
                node: null,
                time: 0,
                isHaveTime: true
            },
            {
                eventType: ExploreConst.EVENT_TYPE_HALP_PRICE,
                count: 0,
                posIndex: 0,
                node: null,
                time: 0,
                isHaveTime: true
            },
            {
                eventType: ExploreConst.EVENT_TYPE_REBEL,
                count: 0,
                posIndex: 0,
                node: null,
                time: 0,
                isHaveTime: true
            },
            {
                eventType: ExploreConst.EVENT_TYPE_HERO,
                count: 0,
                posIndex: 0,
                node: null,
                time: 0,
                isHaveTime: true
            },
            {
                eventType: ExploreConst.EVENT_TYPE_REBEL_BOSS,
                count: 0,
                posIndex: 0,
                node: null,
                time: 0,
                isHaveTime: true
            }
        ];

        var tempPosIndex = 0;
        this._scrollMap.stopAutoScroll();
        this.node.stopAllActions();
        this.node.removeAllChildren();

        var events: ExploreEventData[] = G_UserData.getExplore().getEvents();
        for (var k in iconsData) {
            var v: any = iconsData[k];

            var eventIcon: ExploreMapViewEventIcon = Util.getNode('prefab/exploreMap/ExploreMapViewEventIcon', ExploreMapViewEventIcon);
            this.node.addChild(eventIcon.node);

            v.node = eventIcon.node;
            v.eventIcon = eventIcon;
            eventIcon.setUp(v.eventType, handler(this, this._openEventPanel));
            v.count = G_UserData.getExplore().getUnFinishEventCountByType(v.eventType);
            if (v.count != 0) {
                v.posIndex = tempPosIndex;
                eventIcon.node.setPosition(this._getPosByIndex(tempPosIndex));
                eventIcon.setCount(v.count);
                if (v.isHaveTime) {
                    var endTime = this._getEventMinTimeByType(v.eventType);
                    if (endTime) {
                        v.time = endTime;
                        eventIcon.updateLeftTime(G_ServerTime.getLeftSecondsString(v.time, '00:00:00'));
                    }
                }
                eventIcon.node.active = true;
                tempPosIndex = tempPosIndex + 1;
            } else {
                eventIcon.node.active = false;
            }
        }
        this._iconsData = iconsData;
        // this._updateScrollViewPos();
    }
    //获取当前可见事件icon 数目
    getCurVisibelIconsNum() {
        var num = 0;
        for (var k in this._iconsData) {
            var v = this._iconsData[k];
            if (v.count != 0) {
                num = num + 1;
            }
        }
        return num;
    }
    runFirstOnEnterAction(callback) {
        var totalCount = this._iconsData.length;
        for (var k in this._iconsData) {
            var v = this._iconsData[k];
            if (v.count != 0) {
                v.eventIcon.runOnEnterAction(() => {
                    totalCount--;
                    if (totalCount <= 0) callback && callback();
                });
            } else {
                totalCount--;
                if (totalCount <= 0) callback && callback();
            }
        }
    }
    updateEventIconsDataByType(eventType) {
        var tempPosIndex = 0;
        var newCount = G_UserData.getExplore().getUnFinishEventCountByType(eventType);
        for (var k in this._iconsData) {
            var v = this._iconsData[k];
            if (v.eventType == eventType) {
                if (v.count == 0 && newCount > 0) {
                    this._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_APPEAR;
                } else if (v.count > 0 && newCount == 0) {
                    this._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR;
                } else if (v.count != newCount) {
                    this._doLayoutType = ExploreMapViewIcons.LAYOUT_TYPE_COUNT;
                } else {
                    this._doLayoutType = null;
                }
                v.count = newCount;
                if (v.isHaveTime) {
                    v.time = this._getEventMinTimeByType(eventType);
                }
            }
            if (v.count != 0) {
                v.posIndex = tempPosIndex;
                tempPosIndex = tempPosIndex + 1;
            }
        }
    }
    _getIconDataByType(eventType) {
        for (var k in this._iconsData) {
            var v = this._iconsData[k];
            if (v.eventType == eventType) return v;
        }
    }
    _getPosByIndex(posIndex) {
        // return cc.v2(0, -1 * (ExploreMapViewIcons.EVENT_ICONS_START_GAP + posIndex * ExploreMapViewIcons.EVENT_ICONS_GAP_Y));
        return cc.v2(0, -70 - 100 * posIndex);
    }
    _getScollViewHeight() {
        var num = this.getCurVisibelIconsNum();
        // var totalHeight = ExploreMapViewIcons.EVENT_ICONS_START_GAP + ExploreMapViewIcons.EVENT_ICONS_END_GAP + ExploreMapViewIcons.EVENT_ICONS_GAP_Y * (num - 1);
        var totalHeight = num * 100;
        if (totalHeight < this._scrollViewSize.height) {
            return this._scrollViewSize.height;
        }
        return totalHeight;
    }
    // _updateScrollViewPos() {
    //     var height = this._getScollViewHeight();
    //     this._updateSelfPostion(height);
    //     this._scrollMap.content.setContentSize(this._scrollViewSize.width, height);
    // }
    // _updateSelfPostion(height) {
    //     this.node.setPosition(this._scrollViewSize.width / 2 + ExploreMapViewIcons.ICONS_POS_OFFSETX, height);
    // }
    // 保证 icon 在可见区域
    checkIconInVisibleViewPort(eventType, callback) {
        var tempPosIndex = 0;
        var findIndex = null;
        for (var k in this._iconsData) {
            var v = this._iconsData[k];
            if (v.eventType == eventType) {
                findIndex = tempPosIndex;
                break;
            }
            if (v.count != 0) {
                tempPosIndex = tempPosIndex + 1;
            }
        }
        if (findIndex == null) {
            callback();
            return;
        }
        var innerHeight = this._getScollViewHeight();
        this._scrollMap.stopAutoScroll();
        this._setTouchEnable(false);

        var oldInnerPos = this._scrollMap.content.position;
        var oldInnerSize = this._scrollMap.content.getContentSize();
        var targetPos = this._getPosByIndex(findIndex);
        if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_COUNT) {
            this._moveToVisibleViewPort(oldInnerPos, targetPos, callback);
        } else if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_APPEAR) {
            this._scrollMap.content.setContentSize(this._scrollViewSize.width, innerHeight);
            var posy = oldInnerPos.y - (innerHeight - oldInnerSize.height);
            var newInnerPos = cc.v2(oldInnerPos.x, posy);
            this._moveToVisibleViewPort(newInnerPos, targetPos, callback);
        } else if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR) {
            this._scrollMap.content.setContentSize(this._scrollViewSize.width, innerHeight);
            var posy = oldInnerPos.y - (innerHeight - oldInnerSize.height);
            if (posy > 0) {
                posy = 0;
            }
            callback();
        } else {
            this._moveToVisibleViewPort(oldInnerPos, targetPos, callback);
        }
    }

    _moveToVisibleViewPort(innerPos, targetPos, endCallBack) {
        if (innerHeight <= this._scrollViewSize.height) {
            endCallBack();
            return;
        }
        var topPos = targetPos.y + ExploreMapViewIcons.EVENT_ICONS_GAP_Y / 2;
        var bottomPos = targetPos.y - ExploreMapViewIcons.EVENT_ICONS_GAP_Y / 2;
        var topLimit = -1 * (innerHeight + innerPos.y - this._scrollViewSize.height);
        var bottomLimit = -1 * (innerHeight + innerPos.y);
        if (topPos < topLimit && bottomPos > bottomLimit) {
            endCallBack();
            return;
        } else {
            var targetScrollPosY = 0;
            if (topPos > topLimit) {
                targetScrollPosY = topPos + innerHeight - this._scrollViewSize.height;
            } else {
                targetScrollPosY = bottomPos + innerHeight;
            }
            targetScrollPosY = -1 * targetScrollPosY;
            if (targetScrollPosY > 0) {
                targetScrollPosY = 0;
            } else if (targetScrollPosY < this._scrollViewSize.height - innerHeight) {
                targetScrollPosY = this._scrollViewSize.height - innerHeight;
            }
            var time = Math.abs((targetScrollPosY - innerPos.y) / 800);
            if (time > 1) {
                time = 1;
            }
            var percent = Math.abs(100 * (1 - -1 * targetScrollPosY / (innerHeight - this._scrollViewSize.height)));
            this._scrollMap.scrollToPercentVertical(percent, time, false);
            var delayAction = cc.delayTime(time);
            var callFunc = cc.callFunc(() => {
                endCallBack();
            });
            var seqAction = cc.sequence(delayAction, callFunc);
            this.node.stopAllActions();
            this.node.runAction(seqAction);
        }
    }

    //获取icon 的世界坐标
    getIconWorldPosByType(eventType) {
        var iconData = this._getIconDataByType(eventType);
        var targetPos = this._getPosByIndex(iconData.posIndex);
        return this.node.convertToWorldSpaceAR(targetPos);
    }
    doLayout(eventType, callback) {
        if (this._doLayoutType == null) {
            this._setTouchEnable(true);
            if (callback) callback();
            return;
        }
        var index = 0;
        var totalCount = this._iconsData.length;
        if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_COUNT) {
            var iconData = this._getIconDataByType(eventType);
            iconData.eventIcon.runCountChangeAction(iconData.count);
            this._setTouchEnable(true);
            if (callback) callback();
        } else if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_APPEAR) {
            for (var k in this._iconsData) {
                var v = this._iconsData[k];
                var targetPos = this._getPosByIndex(v.posIndex);
                if (v.eventType == eventType) {
                    v.node.active = true;
                    v.eventIcon.setCount(v.count);
                    v.node.setPosition(targetPos);
                    v.eventIcon.runAppearAction(() => {
                        index++;
                        if (index >= totalCount) {
                            this._setTouchEnable(true);
                            callback && callback();
                        }
                    });
                } else {
                    if (v.node.active) {
                        v.eventIcon.runMoveAction(targetPos, () => {
                            index++;
                            if (index >= totalCount) {
                                this._setTouchEnable(true);
                                callback && callback();
                            }
                        });
                    }
                    else {
                        v.node.setPosition(targetPos);
                        index++;
                        if (index >= totalCount) {
                            this._setTouchEnable(true);
                            callback && callback();
                        }
                    }
                }
            }
        } else if (this._doLayoutType == ExploreMapViewIcons.LAYOUT_TYPE_DISAPPEAR) {
            var iconData = this._getIconDataByType(eventType);
            iconData.eventIcon.runDisAppearAction(() => {
                for (k in this._iconsData) {
                    var v = this._iconsData[k];
                    var targetPos = this._getPosByIndex(v.posIndex);
                    var icon: ExploreMapViewEventIcon = v.eventIcon;
                    icon.runMoveAction(targetPos, () => {
                        index++;
                        if (index >= totalCount) {
                            this._setTouchEnable(true);
                            callback && callback();
                        }
                    });
                }
            });
        }
        this._doLayoutType = null;
    }

    _setTouchEnable(value: boolean): void {
        this._scrollMap.vertical = value;
    }

    //count 可能发生变化
    _onEventIconsChange(eventType) {
        this._parentView.pushAction(() => {
            this.updateEventIconsDataByType(eventType);
            this.checkIconInVisibleViewPort(eventType, () => {
                this.doLayout(eventType, () => {
                    this._parentView.nextAction();
                });
            });
        });
    }

    //打开事件界面
    _openEventPanel(eventType) {

        // var count = G_UserData.getExplore().getUnFinishEventCountByType(eventType);
        // if (count == 0) {
        //     console.warn('============explore event count == 0 eventType = ' + eventType);
        //     return;
        // }

        // var popupEventBase: PopupEventBase = Util.getNode('prefab/exploreMap/PopupEventBase', PopupEventBase);
        // popupEventBase.setUp(this._onEventIconsChange.bind(this), eventType);
        // popupEventBase.node.setPosition(G_ResolutionManager.getDesignWidth() / 2, G_ResolutionManager.getDesignHeight() / 2);
        // popupEventBase.openWithAction();

        G_SceneManager.openPopup('prefab/exploreMap/PopupEventBase', (popup: PopupEventBase) => {
            popup.setUp(this._onEventIconsChange.bind(this), eventType)
            popup.openWithAction();
        },  eventType);
        // ExploreFacade.showEventPanel(eventType, this._onEventIconsChange.bind(this));
    }

    // //获取半价 或 慕名而来最小的剩余时间
    _getEventMinTimeByType(type) {
        var events = G_UserData.getExplore().getUnFinishEvents();
        var minTime = null;
        for (var i in events) {
            var v = events[i];
            if (type == v.getEvent_type()) {
                var endTime = v.getEndTime();
                if (endTime != 0) {
                    if (!minTime) {
                        minTime = endTime;
                    } else if (endTime < minTime) {
                        minTime = endTime;
                    }
                } else {
                    return minTime;
                }
            }
        }
        return minTime;
    }

}