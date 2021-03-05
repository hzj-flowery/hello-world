import { Colors, G_EffectGfxMgr, G_Prompt } from "../../init";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import ShaderHelper from "../../utils/ShaderHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;


var CTOR_PARAM = {
    tabIndex: 1,
    containerStyle: 1,
    isVertical: 1,
    rootNode: null,
    offset: 0,
    textList: [
        'tab1',
        'tab2',
        'tab3'
    ],
    openStateList: [],
    imageList: [],
    callback: null,
    createTabItemCallback: null,
    brightTabItemCallback: null,
    updateTabItemCallback: null,
    getTabCountCallback: null,
    cloneCallback: null
};


@ccclass
export default class CommonTabGroupVertical extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _panel_tab: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_normal: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_select: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_down: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_desc: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_RedPoint: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_DoubleTips: cc.Sprite = null;

    private _tabList;
    private _groupIndex;
    private _scrollNode;
    private _nodeOffset;
    private _textList;
    private _imageList;
    private _openStateList;
    private _containerStyle;
    private _isVertical;
    private _callback;
    private _isSwallow;
    private _brightTabItemCallback;
    private _createTabItemCallback;
    private _updateTabItemCallback;
    private _getTabCountCallback;
    private _cloneCallback;
    private _customColor;

    public  BUTTON_STATE_NORMAL = 1;
    public  BUTTON_STATE_SELECT = 2;
    public  BUTTON_STATE_DISABLE = 3;

    start(): void {
        //this._tabList = [];
    }

    _init(param) {
        this._groupIndex = param.tabIndex || CTOR_PARAM.tabIndex;
        this._scrollNode = param.rootNode || this.node;
        this._nodeOffset = param.offset || CTOR_PARAM.offset;
        this._textList = param.textList || CTOR_PARAM.textList;
        this._imageList = param.imageList || CTOR_PARAM.imageList;
        this._openStateList = param.openStateList || CTOR_PARAM.openStateList;
        this._containerStyle = param.containerStyle || CTOR_PARAM.containerStyle;
        this._isVertical = param.isVertical || CTOR_PARAM.isVertical;
        this._callback = param.callback;
        this._isSwallow = param.isSwallow;
        this._brightTabItemCallback = param.brightTabItemCallback;
        if (this._brightTabItemCallback == null) {
            this._brightTabItemCallback = handler(this, this._textImgBrightTabItemCallback);
        }
        this._createTabItemCallback = param.createTabItemCallback;
        if (this._createTabItemCallback == null) {
            this._createTabItemCallback = handler(this, this._createTextImgListTabItem);
        }
        this._updateTabItemCallback = param.updateTabItemCallback;
        if (this._updateTabItemCallback == null) {
            this._updateTabItemCallback = handler(this, this._updateTextImgTab);
        }
        this._getTabCountCallback = param.getTabCountCallback;
        this._cloneCallback = param.cloneCallback;
        if (this._cloneCallback == null) {
            this._cloneCallback = handler(this, this._createCloneNode);
        }
        this._panel_tab.active = false;
        this._tabList = [];
        this._initTabList();
    }
    recreateTabs(param) {
        if (this._tabList) {
            for (var index in this._tabList) {
                var value = this._tabList[index];
                this.removeCustomTag(index);
                if (value.panelWidget.getName() != 'Panel_tab') {
                    value.panelWidget.destroy();
                }
            }
        }
        this._init(param);
    }
    getTabCount() {
        return this._tabList.length;
    }
    _getNeedCreateTabCount() {
        if (this._getTabCountCallback) {
            return this._getTabCountCallback();
        }
        var num = Math.max(this._textList.length, this._imageList.length);
        return num;
    }
    _initTabList() {
        if (this._containerStyle == 2) {
            this._scrollNode.setScrollBarEnabled(false);
            var templateNodeSize = this._panel_tab.getContentSize();
            var rootNodeSize = this._scrollNode.getContentSize();
            var scrollWidth = 0;
            var scrollHeight = 0;
            if (this._isVertical == 2) {
                var loopCount = this._getNeedCreateTabCount();
                var needWidth = loopCount * (templateNodeSize.width + this._nodeOffset) - this._nodeOffset;
                scrollWidth = Math.max(needWidth, rootNodeSize.width);
                scrollHeight = rootNodeSize.height;
                this._scrollNode.setInnerContainerSize(cc.size(scrollWidth, scrollHeight));
                this.node.y = 0;
            } else {
                var loopCount = this._getNeedCreateTabCount();
                var needHeight = loopCount * (templateNodeSize.height + this._nodeOffset) - this._nodeOffset;
                scrollHeight = Math.max(needHeight, rootNodeSize.height);
                scrollWidth = rootNodeSize.width;
                this._scrollNode.setInnerContainerSize(cc.size(scrollWidth, scrollHeight));
                this.node.y = scrollHeight;
            }
        }
        this._procTextList();
    }
    _procTextList() {
        var cloneNode = this._panel_tab;
        var loopCount = this._getNeedCreateTabCount();
        for (var i = 0; i < loopCount; i++) {
            if (i > 0) {
                var tabNode = this._cloneCallback(i, cloneNode);
                var tabItem = this._createTabItem(i, tabNode);
                this._updateTabItem(tabItem);
                this.node.addChild(tabNode);
                this._tabList.push(tabItem);
            } else {
                var tabItem = this._createTabItem(i, cloneNode);
                this._updateTabItem(tabItem);
                this._tabList.push(tabItem);
            }
        }
    }
    _createTabItem(index, tabNode) {
        var tabItem = this._createTabItemCallback(tabNode);
        tabItem.index = index;
        tabItem.panelWidget = tabNode;
        //tabNode.setTag(index);
        tabNode.name = ""+index;
        //tabNode.setVisible(true);
        tabNode.active = true;
        var panelWidget = tabItem.panelWidget as cc.Node;
        panelWidget.on(cc.Node.EventType.TOUCH_END, handler(this, this._onTouchCallBack),this._isSwallow || false);
        return tabItem;
    }
    _createCloneNode(index, cloneNode) {
        //var instNode = cloneNode.clone();
        var instNode = cc.instantiate(cloneNode);
        instNode.setName('Panel_tab' + index);
        return instNode;
    }
    _createTextImgListTabItem(tabNode) {
        var tabItem: any = {};
        var instNode = tabNode;
        tabItem.panelWidget = instNode;
        tabItem.textWidget = instNode.getChildByName('Text_desc');
        tabItem.imageWidget = instNode.getChildByName('Image_desc');
        tabItem.normalImage = instNode.getChildByName('Image_normal');
        tabItem.downImage = instNode.getChildByName('Image_down');
        tabItem.imageSelect = instNode.getChildByName('Image_select');
        tabItem.redPoint = instNode.getChildByName('Image_RedPoint');
        return tabItem;
    }
    getTabItem(tabIndex) {
        if (tabIndex &&this._tabList&&tabIndex <= this._tabList.length) {
            return this._tabList[tabIndex-1];
        }
        return null;
    }
    setRedPointByTabIndex(tabIndex, show, posPercent?) {
        var item = this.getTabItem(tabIndex);
        if (!item) {
            return;
        }
        if (item.redPoint) {
            item.redPoint.active = (show);
        } else {
            if (this._isVertical == 2) {
                this._showRedPoint(item.panelWidget, show, posPercent || new cc.Vec2(0.92, 0.8));
            } else {
                this._showRedPoint(item.panelWidget, show, posPercent || new cc.Vec2(0.15, 0.8));
            }
        }
    }
    setImageTipByTabIndex(tabIndex, show, posPercent, texture) {
        var item = this.getTabItem(tabIndex);
        if (!item) {
            return;
        }
        if (this._isVertical == 2) {
            this._showImageTip(item.panelWidget, show, posPercent || new cc.Vec2(0.88, 0.62), texture);
        } else {
            this._showImageTip(item.panelWidget, show, posPercent || new cc.Vec2(0.15, 0.8), texture);
        }
    }
    _showRedPoint(node: cc.Node, show: boolean, posPercent: cc.Vec2) {
        if (show) {
            var redImg = node.getChildByName('redPoint');
            if (!redImg) {
                redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
                redImg.name = ('redPoint');
                node.addChild(redImg);
                if (posPercent) {
                    UIHelper.setPosByPercent(redImg, posPercent);
                }
            }
            redImg.active = (true);
        } else {
            var redImg = node.getChildByName('redPoint');
            if (redImg) {
                redImg.active = (false);
            }
        }
    }
    _showImageTip(node: cc.Node, show: boolean, posPercent: cc.Vec2, texture) {
        if (show) {
            var imgTip = node.getChildByName('image_tip');
            if (!imgTip) {
                imgTip = UIHelper.createImage({ texture: texture });
                imgTip.name = ('image_tip');
                node.addChild(imgTip);
                if (posPercent) {
                    UIHelper.setPosByPercent(imgTip, posPercent);
                }
            }
            imgTip.active = (true);
        } else {
            var imgTip = node.getChildByName('image_tip');
            if (imgTip) {
                imgTip.active = (false);
            }
        }
    }
    _updateTabItem(tabItem) {
        this._updateTabItemCallback(tabItem);
        this._updateTabItemPostion(tabItem);
        if (this._brightTabItemCallback) {
            this._brightTabItemCallback(tabItem, this._groupIndex == tabItem.index);
        }
    }
    _updateTextImgTab(tabItem) {
        var index = tabItem.index;
        var text = this._textList[index];
        var image = this._imageList[index];
        var textWidget = tabItem.textWidget;
        var imageWidget = tabItem.imageWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        var panelWidget = tabItem.panelWidget;
        //normalImage.setVisible(true);
        normalImage.active = true;
        //downImage.setVisible(false);
        downImage.active = false;
        if (textWidget && text) {
            //textWidget.setString(text);
            textWidget.getComponent(cc.Label).string = text;
        }
        if (imageWidget && image) {
            imageWidget.loadTexture(image);
            //imageWidget.setVisible(true);
            imageWidget.active = true;
        }
    }
    _updateTabItemPostion(tabItem) {
        var index = tabItem.index;
        var panelWidget = tabItem.panelWidget;
        var contentSize = panelWidget.getContentSize();
        var offsetX = 0, offsetY = 0;
        if (this._isVertical == 2) {
            offsetX = (index) * (contentSize.width + this._nodeOffset);
        } else {
            offsetY = -(index) * (contentSize.height + this._nodeOffset);
        }
        //panelWidget.setPositionX(offsetX);
        panelWidget.x = offsetX;
        //panelWidget.setPositionY(offsetY);
        panelWidget.y = offsetY;
    }
    _isTabInVisibleArea(tabItem, isJump, isIncludeHalf?) {
        var panelWidget = tabItem.panelWidget;
        var panelSize = panelWidget.getContentSize();
        var size = this._scrollNode.getInnerContainerSize();
        var rootNodeSize = this._scrollNode.getContentSize();
        var itemMinPos = 0, itemMaxPos = 0;
        var [scrollSize, screenSize] = [0,0];
        if (this._isVertical == 2) {
            itemMinPos = panelWidget.getPositionX();
            itemMaxPos = itemMinPos + panelSize.width;
            screenSize = rootNodeSize.width;
            scrollSize = size.width;
        } else {
            itemMinPos = -panelWidget.getPositionY();
            itemMaxPos = itemMinPos + panelSize.height;
            screenSize = rootNodeSize.height;
            scrollSize = size.height;
        }
        var visibleMaxPos = 0;
        var visibleMinPos = 0;
        if (this._isVertical == 2) {
            var x = this._scrollNode.getInnerContainer().getPositionX();
            visibleMinPos = -x;
            visibleMaxPos = visibleMinPos + rootNodeSize.width;
        } else {
            var y = this._scrollNode.getInnerContainer().getPositionY();
            visibleMaxPos = size.height + y;
            visibleMinPos = visibleMaxPos - rootNodeSize.height;
        }
        if (isIncludeHalf) {
            if ((itemMinPos > visibleMinPos || itemMinPos < visibleMaxPos) && (itemMaxPos < visibleMaxPos || itemMaxPos > visibleMinPos)) {
                return true;
            }
        } else {
            if (itemMinPos > visibleMinPos && itemMinPos < visibleMaxPos && (itemMaxPos < visibleMaxPos && itemMaxPos > visibleMinPos)) {
                return true;
            }
        }
        if (isJump) {
            var scrollValue = 0;
            if (this._isVertical == 2) {
                scrollValue = -itemMinPos;
            } else {
                scrollValue = -scrollSize + (itemMinPos + screenSize);
            }
            var maxScrollValue = 0;
            var minScrollValue = -(scrollSize - screenSize);
            scrollValue = Math.min(scrollValue, maxScrollValue);
            scrollValue = Math.max(scrollValue, minScrollValue);
            if (this._isVertical == 2) {
                this._scrollNode.getInnerContainer().setPositionX(scrollValue);
            } else {
                this._scrollNode.getInnerContainer().setPositionY(scrollValue);
            }
        }
        return false;
    }
    _onTouchCallBack(sender, state) {
        //var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        //var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        //if (moveOffsetX < 20 && moveOffsetY < 20) {
            var clickIndex = parseInt(sender.target.name);
            this.setTabIndex(clickIndex, false);
        //}
    }
    setCustomColor(customColorArray) {
        this._customColor = customColorArray;
    }
    _getTextTabColors(state):Array<cc.Color> {
        if (this._customColor) {
            if (this._customColor[state]) {
                return [
                    this._customColor[state][1],
                    this._customColor[state][2]
                ];
            }
        }
        if (this._isVertical == 2) {
            if (state == this.BUTTON_STATE_NORMAL) {
                return [Colors.TAB_TWO_NORMAL,null];
            } else if (state == this.BUTTON_STATE_SELECT) {
                return [
                    Colors.TAB_TWO_SELECTED,
                    Colors.TAB_TWO_SELECTED_OUTLINE
                ];
            } else {
                return [
                    Colors.TAB_TWO_DISABLE,
                    Colors.TAB_TWO_DISABLE_OUTLINE
                ];
            }
        } else {
            if (state == this.BUTTON_STATE_NORMAL) {
                return [Colors.TAB_ONE_NORMAL,null];
            } else if (state == this.BUTTON_STATE_SELECT) {
                return [Colors.TAB_TWO_SELECTED,null];
            } else {
                return [Colors.TAB_ONE_DISABLE,null];
            }
        }
    }
    _textImgBrightTabItemCallback(tabItem, bright) {
        var disable = false;
        var openState = this._openStateList[tabItem.index];
        if (openState && openState.noOpen == true) {
            disable = true;
        }
        var buttonState = this.BUTTON_STATE_NORMAL;
        ShaderHelper.filterNode(tabItem.normalImage, '', true);
        if (disable) {
            buttonState = this.BUTTON_STATE_DISABLE;
            //tabItem.normalImage.setVisible(true);
            tabItem.normalImage.active = true;
            //tabItem.downImage.setVisible(false);
            tabItem.downImage.active = false;
            ShaderHelper.filterNode(tabItem.normalImage, 'gray');
        } else if (bright) {
            buttonState = this.BUTTON_STATE_SELECT;
            tabItem.normalImage.active = false;
            tabItem.downImage.active = true;
        } else {
            //tabItem.normalImage.setVisible(true);
            tabItem.normalImage.active = true;
            //tabItem.downImage.setVisible(false);
            tabItem.downImage.active = false;
        }
        if (tabItem.imageSelect) {
            //tabItem.imageSelect.setVisible(false);
            tabItem.imageSelect.active = false;
        }

        var textWidget = tabItem.textWidget as cc.Node;
        var ret = this._getTextTabColors(buttonState);
        var color = ret[0];
        var outlineColor = ret[1];
        textWidget.color = color;
        if (outlineColor) {
            UIHelper.enableOutline(textWidget.getComponent(cc.Label),outlineColor,2);
        } else {
            textWidget.removeComponent(cc.LabelOutline);
        }
    }

    setTabIndex(tabIndex, isJump?) {
        if (tabIndex < this._tabList.length) {
            var isSuccess = true;
            var select = this._tabList[tabIndex];
            var openState = this._openStateList[tabIndex];
            if (openState && openState.noOpen == true) {
                if (openState.noOpenTips) {
                    G_Prompt.showTip(openState.noOpenTips);
                }
                return false;
            }
            if (this._callback && typeof(this._callback) == 'function') {
                isSuccess = this._callback(tabIndex, select.panelWidget);
                isSuccess = isSuccess == null || isSuccess;
            }
            //console.log(isSuccess);
            if (isSuccess) {
                if (isJump == null) {
                    isJump = true;
                }
                if (isJump && this._containerStyle == 2) {
                    this._isTabInVisibleArea(select, isJump);
                }
                for (var i in this._tabList) {
                    var tabItem = this._tabList[i];
                    if (this._brightTabItemCallback) {
                        this._brightTabItemCallback(tabItem, false);
                    }
                }
                if (this._brightTabItemCallback) {
                    this._brightTabItemCallback(select, true);
                }
            }
            return isSuccess;
        }
        return false;
    }
    getRootNode() {
        return this.node;
    }
    playEnterEffect(movingName, interval) {
        if (!movingName || !interval) {
            return;
        }
        var loopCount = this._getNeedCreateTabCount();
        var firstIndex = null;
        var isNotScoll = this._scrollNode.getInnerContainerSize == null;
        var _this = this;
        for (var i = 1;i<=loopCount;i++) {
            var item = this.getTabItem(i);
            if (item) {
                if (isNotScoll || this._isTabInVisibleArea(item, null, true)) {
                    if (!firstIndex) {
                        firstIndex = i;
                    }
                    var widget = item.panelWidget;
                    widget.node.active = false;
                    var delayAction = cc.delayTime(interval * (i - firstIndex));
                    var curIndex = i;
                    var callFunc = cc.callFunc(function () {
                        var tabItem = _this.getTabItem(curIndex);
                        if (item) {
                            var widget = item.panelWidget;
                            widget.node.active = true;
                            var effectSingle = G_EffectGfxMgr.applySingleGfx(widget, movingName, null, null, null);
                        }
                    });
                    var action = cc.sequence(delayAction, callFunc);
                    widget.runAction(action);
                }
            }
        }
    }
    addCustomTag(tabIndex, params) {
        var tabItem = this.getTabItem(tabIndex);
        if (!tabItem || !params) {
            return;
        }
        if (tabItem.customTag) {
            return;
        }
        tabItem.customTag = UIHelper.createImage(params);
        tabItem.panelWidget.addChild(tabItem.customTag);
    }
    removeCustomTag(tabIndex) {
        var tabItem = this.getTabItem(tabIndex);
        if (tabItem && tabItem.customTag) {
            tabItem.customTag.destroy();
            tabItem.customTag = null;
        }
    }

}