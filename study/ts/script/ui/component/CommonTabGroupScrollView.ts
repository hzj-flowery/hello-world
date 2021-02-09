const { ccclass, property } = cc._decorator;

import CommonTabGroup from './CommonTabGroup';
import { handler } from '../../utils/handler';
import UIHelper from '../../utils/UIHelper';
import { Path } from '../../utils/Path';
import { Colors } from '../../init';
import CommonCustomListViewEx from './CommonCustomListViewEx';
import ListViewCellBase from '../ListViewCellBase';

@ccclass
export default class CommonTabGroupScrollView extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_tab: cc.Node = null;

    @property(CommonCustomListViewEx)
    scrollView: CommonCustomListViewEx = null;

    _textList: string[] = [];
    _imageList: string[] = [];
    _tabList: any = {};
    _callback: any;
    _customCheckClick:any;
    _isVertical: number = 1;
    _selectIndex: number = 0;
    _redPointList: any = {};
    _onePageTab:number = 0;


    recreateTabs(param) {
        this._textList = param.textList || [];
        this._tabList = {};
        this._callback = param.callback;
        this._isVertical = param.isVertical || 1;
        this._customCheckClick = param.customCheckClick;
        this.scrollView.enableUpdate(false);
        if (this._isVertical == 2) {
            this.scrollView.setTouchEnabled(false);
            this.scrollView.node.width = this._textList.length * this._panel_tab.width;
        }

        this.scrollView.setCallback(handler(this, this.updateItem));
        this.scrollView.setTemplate(this._panel_tab);
        //this.scrollView.setCustomCallback(handler(this,this.onTabClick));
        this.scrollView.resize(this._textList.length, this._textList.length);
        this._onePageTab = Math.floor(this.scrollView._listViewHeight / this.scrollView._templateHeight);
    }
    updateItem(item, index) {
        var tabItem: any = {};
        var instNode = item.node;
        instNode.name = "Panel_tab" + (index + 1).toString();
        tabItem.panelWidget = instNode;
        tabItem.textWidget = instNode.getChildByName('Text_desc');
        tabItem.imageWidget = instNode.getChildByName('Image_desc');
        tabItem.normalImage = instNode.getChildByName('Image_normal');
        tabItem.downImage = instNode.getChildByName('Image_down');
        //tabItem.imageSelect = instNode.getChildByName('Image_select');
        tabItem.index = index;
        //tabItem.redPoint = instNode.getChildByName('Image_RedPoint');
        if (!this._tabList[index]) {
            var panelWidget = tabItem.panelWidget;
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
            clickEventHandler.component = "CommonTabGroupScrollView";// 这个是代码文件名
            clickEventHandler.handler = "onTabClick";
            clickEventHandler.customEventData = item;
            var btn = panelWidget.getComponent(cc.Button);
            if (!btn) {
                btn = panelWidget.addComponent(cc.Button);
            }
            btn.clickEvents = [];
            btn.clickEvents.push(clickEventHandler)
            this._tabList[index] = true;
        }
        this._updateTextImgTab(tabItem);
        this.setRedPointByTabIndex(index, this._redPointList[index] || false);
    }
    _updateTextImgTab(tabItem) {
        var index = tabItem.index;
        var text = this._textList[index];
        var image = this._imageList[index];
        var textWidget = tabItem.textWidget;
        var imageWidget = tabItem.imageWidget;
        var normalImage = tabItem.normalImage;
        var downImage = tabItem.downImage;
        normalImage.active = true;
        downImage.active = false;
        if (textWidget && text) {
            textWidget.getComponent(cc.Label).string = text;
        }
        if (imageWidget && image) {
            var sp = imageWidget.getComponent(cc.Sprite);
            UIHelper.loadTexture(sp, image);
            imageWidget.active = true;
        }
        if (index == this._selectIndex) {
            this._textImgBrightTabItemCallback(tabItem, true);
        } else {
            var buttonState = CommonTabGroup.BUTTON_STATE_NORMAL;
            var color = this._getTextTabColors(buttonState);
            textWidget.color = color[0];
        }

    }
    onTabClick(event, customEventData) {
        var target = (event as cc.Event).target.getComponent(ListViewCellBase);
        var index = target.getIdx();
        if(this._customCheckClick&&this._customCheckClick(index)==false)return;
        this.updateItemState(index);
        if (this._callback) {
            this._callback(index, this.node);
        }
        this._selectIndex = index;
    }
    setTabIndex(tabIndex):boolean {
        if(this._textList.length <= 0 || tabIndex >= this._textList.length){
            return false;
        }
        this._selectIndex = tabIndex;
        var maxOffset = this.scrollView.getMaxScrollOffset();
        var maxHeight = this.scrollView.getInnerContainerSize().height;
        var offset = 0;
        if(tabIndex+1 > this._onePageTab){
            offset = ((tabIndex+1)-Math.ceil(this._onePageTab/2)) * this.scrollView._templateHeight;
        }
        // if(offset <= this.scrollView.node.height){
        //     offset = 0;
        // }
        //offset -= this.scrollView.node.height;
        if (offset > maxOffset.y) {
            offset = maxOffset.y;
        }
        this.scrollView.scrollToOffset(cc.v2(0, offset), 0);
        this.updateItemState(tabIndex);
        if (this._callback) {
            this._callback(tabIndex, this.node);
        }
        return true;
    }
    updateItemState(tabIndex) {
        var items = this.scrollView.getItems();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var tabItem: any = {};
            var instNode = item.node;
            tabItem.panelWidget = instNode;
            tabItem.textWidget = instNode.getChildByName('Text_desc');
            tabItem.imageWidget = instNode.getChildByName('Image_desc');
            tabItem.normalImage = instNode.getChildByName('Image_normal');
            tabItem.downImage = instNode.getChildByName('Image_down');
            //tabItem.imageSelect = instNode.getChildByName('Image_select');
            tabItem.index = item.getIdx();
            this._textImgBrightTabItemCallback(tabItem, tabItem.index == tabIndex);
        }
    }
    _textImgBrightTabItemCallback(tabItem, bright) {
        var disable = false;
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
        textWidget.color = color[0];


        // if (outlineColor) {
        //     textWidget.enableOutline(outlineColor, 2);
        // } else {
        //     textWidget.disableEffect(cc.LabelEffect.OUTLINE);
        // }
    }
    _getTextTabColors(state) {
        // if (this._customColor) {
        //     if (this._customColor[state - 1]) {
        //         return [
        //             this._customColor[state - 1][0],
        //             this._customColor[state - 1][1]
        //         ];
        //     }
        // }
        if (this._isVertical == 2) {
            if (state == CommonTabGroup.BUTTON_STATE_NORMAL) {
                return [Colors.TAB_TWO_NORMAL];
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
                return [Colors.TAB_ONE_NORMAL];
            } else if (state == CommonTabGroup.BUTTON_STATE_SELECT) {
                return [Colors.TAB_ONE_SELECTED];
            } else {
                return [Colors.TAB_ONE_DISABLE];
            }
        }
    }
    getTabItem(tabIndex) {
        var itemList = this.scrollView.getItems();
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i] as ListViewCellBase;
            if (item.getIdx() == tabIndex) {
                var tabItem: any = {};
                var instNode = item.node;
                tabItem.panelWidget = instNode;
                tabItem.textWidget = instNode.getChildByName('Text_desc');
                tabItem.imageWidget = instNode.getChildByName('Image_desc');
                tabItem.normalImage = instNode.getChildByName('Image_normal');
                tabItem.downImage = instNode.getChildByName('Image_down');
                tabItem.redPoint = instNode.getChildByName('Image_RedPoint');
                //tabItem.imageSelect = instNode.getChildByName('Image_select');
                tabItem.index = item.getIdx();
                return tabItem;
            }
        }
        return null;
    }
    setRedPointByTabIndex(tabIndex, show) {
        var item = this.getTabItem(tabIndex);
        this._redPointList[tabIndex] = show;
        if (!item) {
            return;
        }
        if (item.redPoint) {
            item.redPoint.active = show;
        } else {
            if (this._isVertical == 2) {
                this._showRedPoint(item, show);
            } else {
                this._showRedPoint(item, show);
            }
        }
    }
    _showRedPoint(node, show) {
        if (show) {
            var redImg = node.redPoint;
            if (!redImg) {
                redImg = UIHelper.createImage({ texture: Path.getUICommon('img_redpoint') });
                (redImg as cc.Node).name = ('Image_RedPoint');
                node.panelWidget.addChild(redImg);

                var widget = redImg.addComponent(cc.Widget) as cc.Widget;
                widget.isAlignTop = true;
                widget.top = 0;
                widget.isAlignRight = true;
                widget.right = 0;
            }
            redImg.active = true;
        } else {
            var redImg = node.redPoint;
            if (redImg) {
                redImg.active = false;
            }
        }
    }
}
