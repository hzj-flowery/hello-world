import { Colors } from "../../init";
import { handler } from "../../utils/handler";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

var CTOR_PARAM = {
    // tabIndex: 1,
    tabIndex: 0,
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
export default class CommonTabGroup extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_tab: cc.Node = null;

    _image_DoubleTips: cc.Sprite = null;

    _groupIndex: number;
    _scrollNode: cc.Node;
    _nodeOffset: number;
    _textList: string[];
    _imageList: any[];
    _openStateList: any[];
    _containerStyle: number;
    _isVertical: number;
    _callback: (index, sender, data?) => boolean;
    _isSwallow: number;
    _brightTabItemCallback: Function;
    _createTabItemCallback: Function;
    _updateTabItemCallback: Function;
    _getTabCountCallback: Function;
    _cloneCallback: Function;
    _template: cc.Node;
    _tabList = [];
    _customColor;
    _playEnterEffectNodes;

    public static BUTTON_STATE_NORMAL = 1;
    public static BUTTON_STATE_SELECT = 2;
    public static BUTTON_STATE_DISABLE = 3;


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
        this._template = this._panel_tab;
        this._template.active = false;
        this._tabList = [];
        this._initTabList();
    }

    recreateTabs(param) {
        if (this._tabList && this._tabList.length > 0) {
            for (var index in this._tabList) {
                var value = this._tabList[index];
                this.removeCustomTag(index);
                if (value.panelWidget.getName() != 'Panel_tab') {
                    value.panelWidget.destroy();
                    value.panelWidget = null;
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
            this._scrollNode.getComponent(cc.ScrollView).verticalScrollBar = null;
            var templateNodeSize = this._template.getContentSize();
            var rootNodeSize = this._scrollNode.getContentSize();
            if (this._isVertical == 2) {
                var loopCount = this._getNeedCreateTabCount();
                var needWidth = loopCount * (templateNodeSize.width + this._nodeOffset) - this._nodeOffset;
                var scrollWidth = Math.max(needWidth, rootNodeSize.width);
                var scrollHeight = rootNodeSize.height;
                this._scrollNode.getComponent(cc.ScrollView).content.setContentSize(cc.size(scrollWidth, scrollHeight));
                this.node.y = 0;
            } else {
                var loopCount = this._getNeedCreateTabCount();
                var needHeight = loopCount * (templateNodeSize.height + this._nodeOffset) - this._nodeOffset;
                var scrollHeight = Math.max(needHeight, rootNodeSize.height);
                var scrollWidth = rootNodeSize.width;
                this._scrollNode.getComponent(cc.ScrollView).content.setContentSize(cc.size(scrollWidth, scrollHeight));
                this.node.y = 0;//scrollHeight;
            }
        }
        this._procTextList();
    }
    _procTextList() {
        var cloneNode = this._template;
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
        // tabNode.name = index;
        tabNode.active = true;
        var panelWidget = tabItem.panelWidget;
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = "CommonTabGroup";// 这个是代码文件名
        clickEventHandler.handler = "onTabClick";
        clickEventHandler.customEventData = index;
        var btn = panelWidget.getComponent(cc.Button);
        if (!btn) {
            btn = panelWidget.addComponent(cc.Button);
        }
        btn.clickEvents = [];
        btn.clickEvents.push(clickEventHandler)
        // panelWidget.addClickEventListenerEx(handler(this, this._onTouchCallBack), true, null, 0);
        // panelWidget.setSwallowTouches(this._isSwallow || false);
        return tabItem;
    }
    _createCloneNode(index, cloneNode) {
        var instNode = cc.instantiate(cloneNode);
        instNode.name = ('Panel_tab' + (index + 1));
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
        if (tabIndex && tabIndex <= this._tabList.length) {
            return this._tabList[tabIndex - 1];
        }
        return null;
    }
    setRedPointByTabIndex(tabIndex, show, posPercent?) {
        var item = this.getTabItem(tabIndex);
        if (!item) {
            return;
        }
        if (item.panelWidget.redPoint) {
            item.panelWidget.redPoint.node.active = show;
        } else {
            if (this._isVertical == 2) {
                this._showRedPoint(item.panelWidget, show, posPercent || cc.v2(0.92, 0.8));
            } else {
                this._showRedPoint(item.panelWidget, show, posPercent || cc.v2(0.15, 0.8));
            }
        }
    }
    setImageTipByTabIndex(tabIndex, show, posPercent, texture) {
        var item = this.getTabItem(tabIndex);
        if (!item) {
            return;
        }
        if (this._isVertical == 2) {
            this._showImageTip(item.panelWidget, show, posPercent || cc.v2(0.88, 0.62), texture);
        } else {
            this._showImageTip(item.panelWidget, show, posPercent || cc.v2(0.15, 0.8), texture);
        }
    }
    _showRedPoint(node, show, posPercent) {
        if (show) {
            var redImg = node.redPoint!=null?node.redPoint:node.getChildByName("Image_RedPoint");
            if (!redImg) {
                redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
                (redImg as cc.Node).name = ('Image_RedPoint');
                node.addChild(redImg);
                node.redPoint = redImg.getComponent(cc.Sprite);
            }
            if (posPercent) {
                // UIHelper.setPosByPercent(redImg, posPercent);
            }
            redImg.active = true;
        } else {
            var redImg = node.redPoint!=null?node.redPoint:node.getChildByName("Image_RedPoint");
            if (redImg) {
                redImg.active = false;
            }
        }
    }
    _showImageTip(node, show, posPercent, texture) {
        if (show) {
            var imgTip = node.getChildByName('image_tip');
            if (!imgTip) {
                // var UIHelper = require('UIHelper');
                // imgTip = UIHelper.createImage({ texture: texture });
                // imgTip.setName('image_tip');
                // node.addChild(imgTip);
                // if (posPercent) {
                //     UIHelper.setPosByPercent(imgTip, posPercent);
                // }
            }
            imgTip.active = true;
        } else {
            var imgTip = node.getChildByName('image_tip');
            if (imgTip) {
                imgTip.active = false;
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
        normalImage.active = true;
        downImage.active = false;
        if (textWidget && text) {
            textWidget.getComponent(cc.Label).string = text;
        }
        if (imageWidget && image) {
            imageWidget.loadTexture(image);
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
        panelWidget.x = offsetX;
        panelWidget.y = offsetY;
    }
    _isTabInVisibleArea(tabItem, isJump, isIncludeHalf) {
        var panelWidget = tabItem.panelWidget;
        var panelSize = panelWidget.getContentSize();
        var size = this._scrollNode.getComponent(cc.ScrollView).content.getContentSize();
        var rootNodeSize = this._scrollNode.getContentSize();
        var itemMinPos = 0, itemMaxPos = 0;
        var [scrollSize, screenSize] = [0, 0];
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
            var x = this._scrollNode.getComponent(cc.ScrollView).content.x;
            visibleMinPos = -x;
            visibleMaxPos = visibleMinPos + rootNodeSize.width;
        } else {
            var y = this._scrollNode.getComponent(cc.ScrollView).content.y;
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
                this._scrollNode.getComponent(cc.ScrollView).content.x = scrollValue;
            } else {
                this._scrollNode.getComponent(cc.ScrollView).content.y = scrollValue;
            }
        }
        return false;
    }

    onTabClick(event, customEventData) {
        // 这里 event 是一个 Event 对象，你可以通过 event.target 取到事件的发送节点
        var node = event.target;
        this.setTabIndex(customEventData);
        // 这里的 customEventData 参数就等于你之前设置的 "foobar"
    }
    _onTouchCallBack(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     return true;
        // } else if (state == ccui.TouchEventType.ended || !state) {
        //     var moveOffsetX = math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        //     var moveOffsetY = math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        //     if (moveOffsetX < 20 && moveOffsetY < 20) {
        //         var clickIndex = sender.getTag();
        //         this.setTabIndex(clickIndex, false);
        //     }
        // }
    }
    setCustomColor(customColorArray) {
        this._customColor = customColorArray;
    }
    _getTextTabColors(state) {
        if (this._customColor) {
            if (this._customColor[state - 1]) {
                return [
                    this._customColor[state - 1][0],
                    this._customColor[state - 1][1]
                ];
            }
        }
        if (this._isVertical == 2) {
            if (state == CommonTabGroup.BUTTON_STATE_NORMAL) {
                return Colors.TAB_TWO_NORMAL;
            } else if (state == CommonTabGroup.BUTTON_STATE_SELECT) {
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
            if (state == CommonTabGroup.BUTTON_STATE_NORMAL) {
                return Colors.TAB_ONE_NORMAL;
            } else if (state == CommonTabGroup.BUTTON_STATE_SELECT) {
                return Colors.TAB_ONE_SELECTED;
            } else {
                return Colors.TAB_ONE_DISABLE;
            }
        }
    }
    _textImgBrightTabItemCallback(tabItem, bright) {
        var disable = false;
        var openState = this._openStateList[tabItem.index];
        if (openState && openState.noOpen == true) {
            disable = true;
        }
        var buttonState = CommonTabGroup.BUTTON_STATE_NORMAL;
        // var ShaderHalper = require('ShaderHelper');
        //  ShaderHalper.filterNode(tabItem.normalImage, '', true);
        if (disable) {
            buttonState = CommonTabGroup.BUTTON_STATE_DISABLE;
            tabItem.normalImage.active = true;
            tabItem.downImage.active = false;
            //  ShaderHalper.filterNode(tabItem.normalImage, 'gray');
        } else if (bright) {
            buttonState = CommonTabGroup.BUTTON_STATE_SELECT;
            tabItem.normalImage.active = false;
            tabItem.downImage.active = true;
        } else {
            tabItem.normalImage.active = true;
            tabItem.downImage.active = false;
        }
        if (tabItem.imageSelect) {
            tabItem.imageSelect.active = false;
        }
        var textWidget = tabItem.textWidget;
        var color = this._getTextTabColors(buttonState);
        if ((color as any).length != undefined) {
            textWidget.color = color[0];
        } else {
            textWidget.color = color;
        }

        // if (outlineColor) {
        //     textWidget.enableOutline(outlineColor, 2);
        // } else {
        //     textWidget.disableEffect(cc.LabelEffect.OUTLINE);
        // }
    }

    setTabIndex(tabIndex, isJump?: boolean) {
        if (tabIndex < this._tabList.length) {
            var isSuccess = true;
            var select = this._tabList[tabIndex];
            var openState = this._openStateList[tabIndex];
            if (openState && openState.noOpen == true) {
                if (openState.noOpenTips) {
                    //   G_Prompt.showTip(openState.noOpenTips);
                }
                return false;
            }
            if (this._callback && typeof (this._callback) == 'function') {
                isSuccess = this._callback(tabIndex, select.panelWidget);
                isSuccess = isSuccess == null || isSuccess;
            }
            //  dump(isSuccess);
            if (isSuccess) {
                if (isJump == null) {
                    isJump = true;
                }
                if (isJump && this._containerStyle == 2) {
                    //   this._isTabInVisibleArea(select, isJump);
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
        // if (!movingName || !interval) {
        //     return;
        // }
        // var loopCount = this._getNeedCreateTabCount();
        // var firstIndex = null;
        // this._playEnterEffectNodes = {};
        // var isNotScoll = this._scrollNode.getInnerContainerSize == null;
        // for (var i = 1; loopCount; null) {
        //     var item = this.getTabItem(i);
        //     if (item) {
        //         if (isNotScoll || this._isTabInVisibleArea(item, null, true)) {
        //             if (!firstIndex) {
        //                 firstIndex = i;
        //             }
        //             var widget = item.panelWidget;
        //             widget.active = false;
        //             var delayAction = cc.DelayTime.create(interval * (i - firstIndex));
        //             var curIndex = i;
        //             var callFunc = cc.CallFunc.create(function () {
        //                 var tabItem = this.getTabItem(curIndex);
        //                 if (item) {
        //                     var widget = item.panelWidget;
        //                     widget.active = true;
        //                     var effectSingle = G_EffectGfxMgr.applySingleGfx(widget, movingName, null, null, null);
        //                 }
        //             });
        //             var action = cc.Sequence.create(delayAction, callFunc);
        //             widget.runAction(action);
        //         }
        //     }
        // }
    }
    addCustomTag(tabIndex, params) {
        var tabItem = this.getTabItem(tabIndex);
        if (!tabItem || !params) {
            return;
        }
        if (tabItem.customTag) {
            return;
        }
        // var UIHelper = require('UIHelper');
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