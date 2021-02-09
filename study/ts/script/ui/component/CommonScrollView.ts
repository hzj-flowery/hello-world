import { G_EffectGfxMgr } from "../../init";
import { handler } from "../../utils/handler";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonScrollView extends cc.ScrollView {
    constructor() {
        super();
    }


    private _spawnCount;
    private _cellsUsed: Array<any>;
    private _cellsFreed: Array<any>;
    private _dataSource;
    private _isUsedCellsDirty;
    private _items;
    private _spacing;
    private _listViewHeight;
    private _listViewWidth;
    private _direction;
    private _totalRange = 0;
    private _isInitTouch;
    private _cellPosition;



    private _updateItemCallback;
    private _selectedCallback;
    private _scrollEvent;
    private _eventListener;
    private _customCallback;

    private _template;
    private _templateWidth;
    private _templateHeight;
    private _lastContentPos;
    private _bufferZone;
    private _updateTimer;
    private _totalCount;
    private _indices;

    _init() {
        this._spawnCount = 0;
        this._cellsUsed = [];
        this._cellsFreed = [];
        this._dataSource = {};
        this._isUsedCellsDirty = false;
        this._items = {};
        this._spacing = 0;
        var size = this.node.getContentSize();
        this._listViewHeight = size.height;
        this._listViewWidth = size.width;
        if (this.vertical) {
            this._direction = cc.Scrollbar.Direction.VERTICAL;
        }
        else if (this.horizontal) {
            this._direction = cc.Scrollbar.Direction.HORIZONTAL;
        }
        this._totalRange = size.height;
        this._isInitTouch = false;
    }

    onEnable(): void {
        this._init();

        //关闭滑动
        if (this.vertical) {
            this.vertical = false;
        }
        else if (this.horizontal) {
            this.horizontal = false;
        }

    }
    _initTouchEvent(...vars) {
        if (this._isInitTouch == true) {
            return;
        }
        this.node.on(cc.Node.EventType.TOUCH_END, handler(this, this.onTouchEnded));

        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "CommonScrollView";
        eventHandler.handler = "onEventListener";
        this.scrollEvents.push(eventHandler);
        this._isInitTouch = true;
    }

    onEventListener(sender, eventType): void {
        if (this._scrollEvent) {
            this._scrollEvent(sender, eventType);
        }
        if (eventType == cc.ScrollView.EventType.SCROLLING) {
            this._onUpdate(0);
        }
        if (this._eventListener) {
            this._eventListener(sender, eventType);
        }
    }

    onTouchEnded(sender): void {
        if (this._selectedCallback) {
            var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
            var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
            if (moveOffsetX < 20 && moveOffsetY < 20) {
                var endPosition = sender.getLocation();
                var point = this.content.convertToNodeSpace(endPosition);
                var index = this._indexFromOffset(point);
                if (index == -1) {
                    return;
                }
                var item = this.cellAtIndex(index);
                if (item) {
                    this._selectedCallback(item, item.getIdx() - 1, cc.Node.EventType.TOUCH_END);
                }
            }
        }
    }
    setCallback(update, selected, scrollEvent, eventListener?) {
        this._updateItemCallback = update;
        this._selectedCallback = selected;
        this._scrollEvent = scrollEvent;
        this._eventListener = eventListener;
    }
    setCustomCallback(callback) {
        this._customCallback = callback;
    }
    setTemplate(template, itemWidth?, itemHeight?) {
        this._template = template;
        var widget =  cc.instantiate(template);
        var size =  widget.getContentSize();
        this._templateWidth = itemWidth || size.width;
        this._templateHeight = itemHeight || size.height;
        if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            this._bufferZone = this._templateHeight + this._spacing;
        } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            this._bufferZone = this._templateWidth + this._spacing;
        }
        this._updateTimer = 0;
        this._lastContentPos = 0;
    }
    updateCellList(cellNum) {
        if (this._totalCount == cellNum) {
            var oldPos = this.getContentPosition();
            this.reloadData();
            this.setContentPosition(oldPos);
            return;
        }
        if (this._totalCount != cellNum) {
            this._totalCount = cellNum;
        }
        var oldPos = this._getNewOffset();
        this.reloadData();
        this.setContentPosition(oldPos);
    }
    _getNewOffset(...vars) {
        var minScollRange = this._direction != cc.Scrollbar.Direction.HORIZONTAL && this._listViewHeight || this._listViewWidth;
        if (minScollRange > this._totalCount * this._templateHeight) {
            return new cc.Vec2(0, 0);
        }
        var minY = Math.min(0, this._listViewHeight - this._totalCount * this._templateHeight);
        var minX = Math.min(0, this._listViewWidth - this._totalCount * this._templateWidth);
        var offset = this.getContentPosition();
        if (this._direction != cc.Scrollbar.Direction.HORIZONTAL) {
            if (minY > offset.y) {
                offset.y = minY;
            }
        } else {
            if (minX > offset.x) {
                offset.x = minX;
            }
        }
        return offset;
    }
    resize(size) {
        if (this._totalCount && this._totalCount > 0) {
            this.updateCellList(size);
            return;
        }
        this._totalCount = size;
        this.reloadData();
        this._initTouchEvent();
    }
    _respawn() {
        if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
        } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
        }
    }
    _getItemPositionYInView(item) {
        var worldPos = item.getParent().convertToWorldSpaceAR(new cc.Vec2(item.getPosition()));
        var viewPos = this.node.convertToNodeSpaceAR(new cc.Vec2(worldPos));
        return viewPos.y;
    }
    _getItemPositionXInView(item) {
        var worldPos = item.getParent().convertToWorldSpaceAR(new cc.Vec2(item.getPosition()));
        var viewPos = this.node.convertToNodeSpaceAR(new cc.Vec2(worldPos));
        return viewPos.x;
    }
    getStartEndIndex() {
        var [startIdx, endIdx] = this._getStartEndIndex();
        return [
            startIdx,
            endIdx
        ];
    }
    _onUpdate(f) {
        this._updateTimer = this._updateTimer + f;
        this._updateTimer = 0;
        if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            this.scrollViewDidScroll();
            this._lastContentPos = this.getContentPosition().y;
        } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            this.scrollViewDidScroll();
            this._lastContentPos = this.getContentPosition().x;
        }
    }
    clearAll() {
    }
    _updateCellPositions() {
        var totalCount = this._totalCount;
        var tempList = {};
        if (totalCount > 0) {
            var currPos = 0;
            var cellSize = cc.size(this._templateWidth + this._spacing, this._templateHeight + this._spacing);
            for (var i = 1;i<=totalCount;i++) {
                tempList[i] = currPos;
                if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
                    currPos = currPos + cellSize.height;
                } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
                    currPos = currPos + cellSize.width;
                }
            }
            tempList[totalCount + 1] = currPos;
        }
        this._cellPosition = tempList;
    }
    tableCellAtIndex(index) {
        var widget = this.dequeueCell();
        if (widget == null) {
            widget = this._template.new();
            this.content.addChild(widget);
        }
        widget.setVisible(true);
        widget.setCustomCallback(this._customCallback);
        this._setIndexForCell(index, widget);
        if (this._updateItemCallback) {
            this._updateItemCallback(widget, index - 1);
        }
        return widget;
    }
    _updateContentSize() {
        var innerContainerSize = this.content.getContentSize();
        if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            this._totalRange = this._templateHeight * this._totalCount + (this._totalCount - 1) * this._spacing;
            if (this._totalRange < this._listViewHeight) {
                this._totalRange = this._listViewHeight;
            }
            innerContainerSize.height = this._totalRange;
        } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            this._totalRange = this._templateWidth * this._totalCount + (this._totalCount - 1) * this._spacing;
            if (this._totalRange < this._templateWidth) {
                this._totalRange = this._templateWidth;
            }
            innerContainerSize.width = this._totalRange;
        }
        this.content.setContentSize(innerContainerSize);
    }
    _indexFromOffset(offset) {
        var index = null;
        var maxIdx = this._totalCount;
        offset.y = this._totalRange - offset.y;
        function indexFromOffset(offsetPos) {
            var low = 1;
            var high = this._totalCount;
            var search = offsetPos.y || 0;
            if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
                search = offsetPos.x || 0;
            }
            while (high >= low) {
                var index = Math.floor(low + (high - low) / 2);
                var cellStart = this._cellPosition[index];
                var cellEnd = this._cellPosition[index + 1];
                if (search >= cellStart && search <= cellEnd) {
                    return index;
                } else {
                    low = index + 1;
                }
            }
            if (low <= 1) {
                return 1;
            }
            return -1;
        }
        index = indexFromOffset(offset);
        if (index != -1) {
            index = Math.max(1, index);
            if (index > maxIdx) {
                index = -1;
            }
        }
        return index;
    }
    _offsetFromIndex(index) {
        function offsetFromIndex(index) {
            var offset = new cc.Vec2(0, 0);
            offset = new cc.Vec2(0, this._cellPosition[index]);
            if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
                offset = new cc.Vec2(this._cellPosition[index], 0);
            }
            return offset;
        }
        var offsetPos = offsetFromIndex(index);
        if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            offsetPos.y = this._totalRange - offsetPos.y - this._templateHeight - this._spacing;
        } else if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            offsetPos.x = this._totalRange - offsetPos.x - this._templateWidth - this._spacing;
        }
        return offsetPos;
    }
    reloadData(...vars) {
        this.node.removeAllChildren();

        //开启触摸
        if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            this.horizontal = true;
        }
        else if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            this.vertical = true;
        }

        this._cellsFreed = [];
        this._indices = {};
        this._cellsUsed = [];
        this._isUsedCellsDirty = false;
        this._updateCellPositions();
        this._updateContentSize();
        if (this._totalCount > 0) {
            this.scrollViewDidScroll();
        }
    }
    _getStartEndIndex(...vars) {
        var countOfItems = this._totalCount;
        var startIdx = 0;
        var endIdx = 0;
        var offset = this.getContentPosition();
        offset.y = offset.y * -1;
        offset.x = offset.x * -1;
        offset.y = offset.y + this._listViewHeight;
        var templateRange = this._templateHeight * 2;
        startIdx = this._indexFromOffset(new cc.Vec2(offset.x, offset.y));
        if (startIdx == -1) {
            startIdx = countOfItems;
        }
        offset.y = offset.y - this._listViewHeight;
        endIdx = this._indexFromOffset(new cc.Vec2(offset.x, offset.y));
        if (endIdx == -1) {
            endIdx = countOfItems;
        }
        return [
            startIdx,
            endIdx
        ];
    }
    playEnterEffect(endCallBack) {
        if (this.horizontal == false && this.vertical == false) {
            return;
        }
        var movingName = 'smoving_shangdian_icon';
        var movingFrameTime = 8 * 0.025;
        var interval = 0.06;
        var ret = this._getStartEndIndex();
        var startIdx = ret[0];
        var endIdx = ret[1];
        //开启触摸
        if (this._direction == cc.Scrollbar.Direction.HORIZONTAL) {
            this.horizontal = false;
        }
        else if (this._direction == cc.Scrollbar.Direction.VERTICAL) {
            this.vertical = false;
        }

        this.node.stopAllActions();
        function createCallFunc(curIndex) {
            function effectFinishCallback(eventName) {
            }
            var callFunc = cc.callFunc(function () {
                var cellItem = this.cellAtIndex(curIndex);
                if (cellItem) {
                    cellItem.setVisible(true);
                    G_EffectGfxMgr.applySingleGfx(cellItem, movingName, effectFinishCallback);
                }
            });
            return callFunc;
        }
        var totalDelayTime = 0;
        for (var i = startIdx;i<=endIdx;i++) {
            var cell = this.cellAtIndex(i);
            if (cell) {
                cell.setCascadeOpacityEnabled(true);
                cell.setVisible(false);
                cell.stopAllActions();
                cell.unscheduleUpdate();
                var offsetPos = this._offsetFromIndex(i);
                cell.setPosition(offsetPos);
                totalDelayTime = interval * (i - startIdx);
                var delayAction = cc.delayTime(totalDelayTime);
                var action = cc.sequence(delayAction, createCallFunc(i));
                cell.runAction(action);
            }
        }
        var delayAction = cc.delayTime(totalDelayTime + movingFrameTime);
        var targetAction = cc.sequence(delayAction, cc.callFunc(function (...vars) {
            if (this._target) {
                this._target.setTouchEnabled(true);
            }
            if (endCallBack) {
                endCallBack();
            }
        }));
        this.node.runAction(targetAction);
    }
    scrollViewDidScroll() {
        var countOfItems = this._totalCount;
        if (0 == countOfItems) {
            return;
        }
        if (this._isUsedCellsDirty) {
            this._isUsedCellsDirty = false;
            this._cellsUsed.sort(function (cell1, cell2) {
                return cell1.getIdx() - cell2.getIdx();
            });
        }
        var startIdx = 0;
        var endIdx = 0;
        var idx = 0;
        var maxIdx = Math.max(countOfItems, 0);
        var offset = this.getContentPosition();
        offset.y = offset.y * -1;
        offset.x = offset.x * -1;
        offset.y = offset.y + this._listViewHeight;
        var templateRange = this._templateHeight * 2;
        startIdx = this._indexFromOffset(new cc.Vec2(offset.x, offset.y));
        if (startIdx == -1) {
            startIdx = countOfItems;
        }
        offset.y = offset.y - this._listViewHeight;
        endIdx = this._indexFromOffset(new cc.Vec2(offset.x, offset.y));
        if (endIdx == -1) {
            endIdx = countOfItems;
        }
        function procCellUsedBegin(...vars) {
            if (this._cellsUsed.length == 0) {
                return;
            }
            var cell = this._cellsUsed[1];
            if (cell == null) {
                return;
            }
            var idx = cell.getIdx();
            while (idx < startIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[1];
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }
        function procCellUsedEnd(...vars) {
            if (this._cellsUsed.length == 0) {
                return;
            }
            var cell = this._cellsUsed[this._cellsUsed.length];
            if (cell == null) {
                return;
            }
            var idx = cell.getIdx();
            while (idx <= maxIdx && idx > endIdx) {
                this._moveCellOutOfSight(cell);
                if (this._cellsUsed.length > 0) {
                    cell = this._cellsUsed[this._cellsUsed.length];
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }
        procCellUsedBegin();
        procCellUsedEnd();
        for (var i = startIdx;i<=endIdx;i++) {
            if (this._indices[i] == null) {
                this.updateCellAtIndex(i);
            }
        }
    }
    updateCellAtIndex(idx) {
        if (idx == -1) {
            return;
        }
        var countOfItems = this._totalCount;
        if (0 == countOfItems && idx > countOfItems) {
            return;
        }
        var cellWidget = this.cellAtIndex(idx);
        if (cellWidget) {
            this._moveCellOutOfSight(cellWidget);
        }
        var cellWidget1 = this.tableCellAtIndex(idx);
        this._addCellIfNecessary(cellWidget1);
    }
    cellAtIndex(idx) {
        if (this._indices[idx] != null) {
            for (var i in this._cellsUsed) {
                var cell = this._cellsUsed[i];
                if (cell.getIdx() == idx) {
                    return cell;
                }
            }
        }
        return null;
    }
    _moveCellOutOfSight(cell) {
        this._cellsFreed.push(cell);
        for (var i = 0; i < this._cellsUsed.length; i++) {
            var usedCell = this._cellsUsed[i];
            if (usedCell.getIdx() == cell.getIdx()) {
                this._cellsUsed.splice(i, 1);
                break;
            }
        }
        this._isUsedCellsDirty = true;
        this._indices[cell.getIdx()] = null;
        cell.reset();
        cell.setVisible(false);
    }
    _setIndexForCell(index, cell) {
        cell.setAnchorPoint(new cc.Vec2(0, 0));
        var offsetPos = this._offsetFromIndex(index);
        cell.setPosition(offsetPos);
        cell.setIdx(index);
        cell.setTag(index - 1);
    }
    _addCellIfNecessary(cell) {
        this._cellsUsed.push(cell);
        this._indices[cell.getIdx()] = true;
        this._isUsedCellsDirty = true;
        cell.setVisible(true);
    }
    dequeueCell() {
        var cell = null;
        if (this._cellsFreed.length == 0) {
            cell = null;
        } else {
            cell = this._cellsFreed[1];
            this._cellsFreed.splice(1);
        }
        return cell;
    }
    setLocation(index, customOffset) {
        customOffset = customOffset || 0;
        this.stopAutoScroll();
        var offset = this._offsetFromIndex(index);
        offset.y = offset.y - (this._listViewHeight - this._templateHeight);
        offset.y = offset.y * -1;
        offset.y = offset.y - customOffset;
        offset.y = Math.max(offset.y, Math.min(this._listViewHeight - this._totalCount * this._templateHeight, 0));
        offset.y = Math.min(offset.y, 0);
        var innerSize = this.content.getContentSize();
        this.setContentPosition(offset);
        var pos = this.getContentPosition();
        this.scrollViewDidScroll();
    }
    setLocationByPos(pos) {
        this.stopAutoScroll();
        pos.y = Math.max(pos.y, Math.min(this._listViewHeight - this._totalCount * this._templateHeight, 0));
        pos.y = Math.min(pos.y, 0);
        this.setContentPosition(pos);
        this.scrollViewDidScroll();
    }
    getItemBottomLocation(index) {
        var offset = this._offsetFromIndex(index);
        var location = offset.y;
        return location + this._spacing;
    }
    isInVisibleRegion(index) {
        var buttomPos = this.getItemBottomLocation(index);
        var topPos = buttomPos + this._templateHeight;
        var y = this.getContentPosition().y;
        var visibleMinPos = -y;
        var visibleMaxPos = visibleMinPos + this._listViewHeight;
        cc.warn('PopupMailReward  isInVisibleRegion ??? ' + (buttomPos));
        cc.warn('PopupMailReward  isInVisibleRegion ??? ' + (topPos));
        cc.warn('PopupMailReward  isInVisibleRegion ??? ' + (visibleMinPos));
        cc.warn('PopupMailReward  isInVisibleRegion ??? ' + (visibleMaxPos));
        if (buttomPos >= visibleMinPos && topPos <= visibleMaxPos) {
            return true;
        }
        return false;
    }
    getItems(...vars) {
        return this.content.children;
    }
    getItem(index) {
        index = index + 1;
        var childList = this.content.children;
        return childList[index];
    }
    getItemByTag(index) {
        if (!index) {
            return null;
        }
        return this.cellAtIndex(index + 1);
    }
    setSpacing(spacing) {
        this._spacing = spacing;
    }
}