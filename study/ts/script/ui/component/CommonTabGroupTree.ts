import { Colors, G_Prompt } from "../../init";
import { handler } from "../../utils/handler";
import { table } from "../../utils/table";
import UIHelper from "../../utils/UIHelper";
import CommonTabGroup from "./CommonTabGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonTabGroupTree extends CommonTabGroup {
    @property({
        type: cc.Node,
        visible: true
    })
    _scrollViewTab: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _tabGroup: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_tab_sub: cc.Node = null;

    _currSelectIndex: number = 1;
    _groupData: any;
    _templateSub: cc.Node;


    ctor() {
        this._currSelectIndex = 1;
    }
    recreateTabs(param) {
        if (this._tabList) {
            for (var index in this._tabList) {
                var value = this._tabList[index];
                if (value.panelWidget.getName() != 'Panel_tab' || value.panelWidget.getName() != 'Panel_tab_sub') {
                    value.panelWidget.destroy();
                    value.panelWidget = null;
                }
            }
        }
        this._init(param);
        this._closeAll();
    }
    _init(param) {
        this._groupIndex = param.tabIndex || 1;
        this._containerStyle = param.containerStyle || 1;
        this._scrollNode = this._scrollViewTab;
        this._groupData = param.groupData || {};
        this._imageList = [];
        this._nodeOffset = 0;
        this._textList = param.textList || {};
        this._openStateList = param.openStateList || {};
        this._isVertical = 1;
        this._callback = param.callback;
        this._template = this._panel_tab;
        this._template.active = (false);
        this._templateSub = this._panel_tab_sub;
        this._templateSub.active = (false);
        this._brightTabItemCallback = handler(this, this._textImgBrightTabItemCallback);
        this._tabList = [];
        this._initTabList();
        this.setCustomColor([[
            [Colors.TAB_ONE_NORMAL],
            [Colors.TAB_ONE_SELECTED],
            [cc.color(169, 106, 42)]]
        ]);
    }
    _initTabList() {
        this._procTextList();
        this._computeScrollContentSize();
    }
    _computeScrollContentSize() {
        var maxHeight = 0;
        for (var i in this._tabList) {
            var tabItem = this._tabList[i];
            if (tabItem.panelWidget.active == true) {
                tabItem.panelWidget.y = (-maxHeight);
                maxHeight = maxHeight + tabItem.panelWidget.getContentSize().height;
            }
        }
        var rootNodeSize = this._scrollNode.getContentSize();
        var scrollHeight = rootNodeSize.height;
        var scrollHeight = Math.max(maxHeight, rootNodeSize.height);
        this._scrollNode.getComponent(cc.ScrollView).content.setContentSize(cc.size(rootNodeSize.width, scrollHeight));
        //  this._tabGroup.setPositionY(scrollHeight);
    }
    getGroupDataByIndex(index) {
        var textKey = this._textList[index];
        for (var i in this._groupData) {
            var mainData = this._groupData[i];
            if (mainData.tabIndex - 1 == index) {
                return mainData;
            }
            for (var j in mainData.subList) {
                var subData = mainData.subList[j];
                if (subData.tabIndex - 1 == index) {
                    return subData;
                }
            }
        }
      //assert((false, 'can not find groupData by index ' + index);
        return null;
    }
    _inTheSubList(index) {
        var groupData = this.getGroupDataByIndex(index);
        if (groupData) {
            return [
                !groupData.isMain,
                groupData
            ];
        }
    }
    _getMainDataByType(mainType) {
        for (var i in this._groupData) {
            var mainData = this._groupData[i];
            if (mainData.type == mainType) {
                return mainData;
            }
        }
        return null;
    }
    _getWidgetByIndex(tabIndex) {
        tabIndex--;
        if (this._tabList == null) {
            return;
        }
        for (var i in this._tabList) {
            var tableItem = this._tabList[i];
            if (tableItem && tableItem.index == tabIndex) {
                return tableItem;
            }
        }
    }
    _getSubWidgetList(tabIndex) {
        var groupData = this.getGroupDataByIndex(tabIndex);
        var mainData = this._getMainDataByType(groupData.type);
        var widgetList = [];
        for (var i in mainData.subList) {
            var subData = mainData.subList[i];
            var widget = this._getWidgetByIndex(subData.tabIndex);
            if (widget) {
                widgetList.push(widget);
            }
        }
        return widgetList;
    }
    _createCloneNode(index, cloneNode) {
        var instNode = cc.instantiate(cloneNode);
        instNode.setName('Panel_tab' + index);
        return instNode;
    }
    _procTextList() {
        var cloneNode = this._template;
        var cloneSubNode = this._templateSub;
        var loopCount = this._getNeedCreateTabCount();
        for (var i = 0; i < loopCount; i++) {
            var tabNode = null;
            var groupData = this.getGroupDataByIndex(i);
            if (groupData.isMain == false) {
                tabNode = this._createCloneNode(i, cloneSubNode);
            } else {
                tabNode = this._createCloneNode(i, cloneNode);
            }
            var tabItem = this._createTabItem(i, tabNode);
            this._updateTabItem(tabItem);
            this._tabGroup.addChild(tabNode);
            table.insert(this._tabList, tabItem);
        }
    }
    _createTabItem(index, tabNode) {
        var tabItem = this._createTextImgListTabItem(tabNode);
        tabItem.index = index;
        tabItem.panelWidget = tabNode;
        //   tabNode.setTag(index);
        tabNode.active = (true);
        var panelWidget = tabItem.panelWidget;
        UIHelper.addEventListenerToNode(this.node, panelWidget, 'CommonTabGroupTree', 'onTabClick', index);
        // panelWidget.addClickEventListenerEx(handler(this, this._onTouchCallBack), true, null, 0);
        // panelWidget.setSwallowTouches(false);
        return tabItem;
    }
    _getNeedCreateTabCount() {
        var num = this._textList.length;
        return num;
    }
    _updateTabItem(tabItem) {
        this._updateTextImgTab(tabItem);
        this._textImgBrightTabItemCallback(tabItem, this._groupIndex == tabItem.index);
    }
    openTreeTab(tabIndex) {
        this._openTreeTab(tabIndex);
    }
    _procMainTab(tabIndex) {
        let isOpen = function (tabIndex) {
            var list = this._getSubWidgetList(tabIndex);
            for (var i in list) {
                var tabItem = list[i];
                return tabItem.panelWidget.active;
            }
            return false;
        }.bind(this);
        if (isOpen(tabIndex)) {
            this._closeTreeTab(tabIndex);
        } else {
            this._openTreeTab(tabIndex);
        }
    }
    _openTreeTab(tabIndex) {
        this._closeAll();
        var list = this._getSubWidgetList(tabIndex);
        for (var i in list) {
            var tabItem = list[i];
            tabItem.panelWidget.active = (true);
        }
        this._computeScrollContentSize();
    }
    _closeTreeTab(tabIndex) {
        this._closeAll();
        var list = this._getSubWidgetList(tabIndex);
        for (var i in list) {
            var tabItem = list[i];
            tabItem.panelWidget.active = (false);
        }
        this._computeScrollContentSize();
    }
    _closeAll() {
        var index = 0;
        for (var i in this._textList) {
            var keyName = this._textList[i];
            var groupData = this.getGroupDataByIndex(i);
            if (groupData && groupData.isMain == false) {
                var tabItem = this._tabList[i];
                if (tabItem) {
                    tabItem.panelWidget.active = (false);
                }
            }
        }
    }
    setTabIndex(tabIndex) {
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
            var [isSubIndex, groupData] = this._inTheSubList(tabIndex);
            if (this._callback && typeof (this._callback) == 'function') {
                isSuccess = this._callback(tabIndex, select.panelWidget, groupData);
                isSuccess = isSuccess == null || isSuccess;
            }
            if (isSuccess) {
                for (var i in this._tabList) {
                    var tabItem = this._tabList[i];
                    this._textImgBrightTabItemCallback(tabItem, false);
                }
                this._textImgBrightTabItemCallback(select, true);
                if (isSubIndex) {
                    var mainData = this._getMainDataByType(groupData.type);
                    var widget = this._getWidgetByIndex(mainData.tabIndex);
                    this._textImgBrightTabItemCallback(widget, true);
                } else {
                    this._procMainTab(tabIndex);
                }
            }
            return isSuccess;
        }
        return false;
    }
}