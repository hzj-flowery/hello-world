import CommonIconTemplate from "./CommonIconTemplate";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { UserDataHelper } from "../../utils/data/UserDataHelper";
import UIHelper from "../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonListViewLineItem extends cc.Component {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listViewItem: cc.ScrollView = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _iconTemplatePrefab: cc.Prefab = null;

    private _maxItemSize = 4;
    private _itemSpacing = 0;
    private _itemContentSize: cc.Size;
    private _items: CommonIconTemplate[];
    private _itemsMargin: number = 0;

    public setMaxItemSize(itemSize) {
        this._maxItemSize = itemSize;
    }

    public setListViewSize(width, height) {
        width = width || 350;
        height = height || 90;
        this._listViewItem.node.setContentSize(width, height);
    }

    public getListViewItem() {
        return this._listViewItem;
    }

    public updateUI_V(awardList, scale:number,hCount:number) {
        scale = scale || 0.8;
        this._listViewItem.content.removeAllChildren();
        this._listViewItem.content.height = 0;
        var addIconToPanel = function (node: cc.Node, count: number, awardList: Array<any>, start: number,isLast:boolean=false) {
            if(isLast==false)
            {
                for (let i = 0; i < count; i++) {   //数据
                    let award = awardList[start + i];
                    let icon: CommonIconTemplate = this._createItemIcon(award, 0.8);
                    node.addChild(icon.node);
                    icon.node.x = icon.node.width * (0.5 + i);
                    node.height = icon.node.height;
                }
            }
            else
            {
                var lastNode:Array<cc.Node> = [];
                for (let i = 0; i < count; i++) {   //数据
                    let award = awardList[start + i];
                    let icon: CommonIconTemplate = this._createItemIcon(award, 0.8);
                    node.addChild(icon.node);
                    icon.node.x = icon.node.width * (0.5 + i);
                    lastNode.push(icon.node);
                    node.height = icon.node.height;
                }
                var totalLen = lastNode[0].width*4;
                //表示最后
                if(count==3)
                {
                    lastNode[0].x = totalLen/2-lastNode[0].width;
                    lastNode[1].x = totalLen/2;
                    lastNode[2].x = totalLen/2+lastNode[0].width;
                }
                else if(count==2)
                {
                    lastNode[0].x = totalLen/2-lastNode[0].width/2;
                    lastNode[1].x = totalLen/2+lastNode[0].width/2;
                }
                else if(count==1)
                {
                    lastNode[0].x = totalLen/2;
                }
            }

        }.bind(this);
        var nextStart = 0;
        for (let i = 0; i <= awardList.length - hCount; i = i + hCount) {
            nextStart = i + hCount;
            var fatherNode = new cc.Node();
            this._listViewItem.content.addChild(fatherNode);
            addIconToPanel(fatherNode, hCount, awardList, i);
            this._listViewItem.content.height = this._listViewItem.content.height + fatherNode.height;
        }
        if (awardList.length % hCount > 0) {
            var fatherNode = new cc.Node();
            this._listViewItem.content.addChild(fatherNode);
            addIconToPanel(fatherNode, awardList.length - nextStart, awardList, nextStart,awardList.length<=3?true:false);
            this._listViewItem.content.height = this._listViewItem.content.height + fatherNode.height;
        }
        if(awardList.length/hCount>2)
        {
            this._listViewItem.scrollToTop();
        }
    }


    public updateUI(awardList, scale?, adaptWithContainerSize?, showTopImage?, isDouble?) {
        scale = scale || 0.8;
        this._listViewItem.content.removeAllChildren();
        var totalW = 0;
        var totalH = 0;
        for (let i = 0; i < awardList.length; i++) {
            var award = awardList[i];
            var uiNode = this._createItemIcon(award, scale);
            if (uiNode) {
                var size = uiNode.node.getContentSize();
                this._itemContentSize = size;
                this._listViewItem.content.addChild(uiNode.node);
                if (showTopImage) {
                    this._showHeroTopImage(uiNode);
                }
                uiNode.node.x = size.width / 2 + totalW;
                // uiNode.node.y = size.height / 2;
                totalW = totalW + size.width + this._itemsMargin + this._itemSpacing;
                totalH = size.height;
                let widget = uiNode.addComponent(cc.Widget);
                widget.isAlignVerticalCenter = true;
                uiNode.showDoubleTips(isDouble || false);
                // widget.verticalCenter = 0.5;
            }
        }

        if (adaptWithContainerSize) {
            this._listViewItem.node.setContentSize(totalW, totalH);
        }
        this._listViewItem.content.setContentSize(totalW, totalH);
    }

    public setItemsMargin(margin) {
        this._itemsMargin = margin;
    }

    private _createItemIcon(award, scale): CommonIconTemplate {
        let iconTemplate: CommonIconTemplate = cc.instantiate(this._iconTemplatePrefab).getComponent(CommonIconTemplate);
        iconTemplate.initUI(award.type, award.value, award.size);
        iconTemplate.node.setScale(scale);
        iconTemplate.setTouchEnabled(true);
        var panelSize = iconTemplate.getPanelSize();
        if (award.type == TypeConvertHelper.TYPE_TITLE) {
            iconTemplate.node.setScale(0.8);
            panelSize.width = panelSize.width * 0.9;
            panelSize.height = panelSize.height * 0.9;
        } else {
            panelSize.width = panelSize.width * scale;
            panelSize.height = panelSize.height * scale;
        }
        iconTemplate.node.setContentSize(panelSize);
        return iconTemplate;
    }

    public setItemSpacing(space) {
        this._itemSpacing = space || 0;
    }

    public alignCenter() {
        this._listViewItem.node.setPosition(0, 0);
        this._listViewItem.node.setAnchorPoint(0.5, 0.5);
    }

    private _showHeroTopImage(iconTemplate: CommonIconTemplate) {
        var itemParams = iconTemplate.getItemParams();
        if (itemParams.type == TypeConvertHelper.TYPE_HERO) {
            this._setTopImage(iconTemplate, itemParams.value);
        } else if (itemParams.type == TypeConvertHelper.TYPE_FRAGMENT) {
            if (itemParams.cfg.comp_type == 1) {
                this._setTopImage(iconTemplate, itemParams.cfg.comp_value);
            }
        }
    }

    private _setTopImage = function (templateIcon: CommonIconTemplate, heroId) {
        var res = UserDataHelper.getHeroTopImage(heroId)[0];
        if (res) {
            templateIcon.showTopImage(true);
            templateIcon.setTopImage(res);
            return true;
        }
        templateIcon.showTopImage(false);
        return false;
    }

    public setIconMask(mask) {
        let children = this._listViewItem.content.children;
        for(let i = 0 ; i < children.length; i++){
            children[i].getComponent(CommonIconTemplate).setIconMask(mask);
            children[i].getComponent(CommonIconTemplate).setIconSelect(mask);
        }
    }

    public setScrollDuration(time) {
        this._listViewItem.bounceDuration = (time);
    }

    public setMagneticType(type) {
        // this._listViewItem.setMagneticType(type);
    }

    public setGravity(type) {
        // this._listViewItem.setGravity(type);
    }

    public jumpToPercentHorizontal(percent) {
        this._listViewItem.scrollToPercentHorizontal(percent);
    }

    public getItemContentSize() {
        return this._itemContentSize;
    }
}