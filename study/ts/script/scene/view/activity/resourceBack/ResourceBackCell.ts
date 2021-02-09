const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import { Lang } from '../../../../lang/Lang';
import { handler } from '../../../../utils/handler';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import { DataConst } from '../../../../const/DataConst';
import { ComponentIconHelper } from '../../../../ui/component/ComponentIconHelper';
import { Colors } from '../../../../init';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import UIHelper from '../../../../utils/UIHelper';
import CommonIconBase from '../../../../ui/component/CommonIconBase';

@ccclass
export default class ResourceBackCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _iconParent1: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy1: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _title1: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richTipNode1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _item2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _iconParent2: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnBuy2: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _title2: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _richTipNode2: cc.Node = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _resCount1:cc.Label = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _resCount2:cc.Label = null;

    @property({
        type:cc.Sprite,
        visible:true
    })
    _resIcon1:cc.Sprite = null;

    @property({
        type:cc.Sprite,
        visible:true
    })
    _resIcon2:cc.Sprite = null;    
    
    _data1: any;
    _data2: any;


    onInit(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        this._btnBuy1.setString(Lang.get('common_btn_name_confirm'));
        this._btnBuy2.setString(Lang.get('common_btn_name_confirm'));
        // this._btnBuy1.addClickEventListenerExDelay(handler(this, this._onBtnBuy1), 100);
        // this._btnBuy2.addClickEventListenerExDelay(handler(this, this._onBtnBuy2), 100);
        UIHelper.addEventListener(this.node, this._btnBuy1._button, 'ResourceBackCell', '_onBtnBuy1');
        UIHelper.addEventListener(this.node, this._btnBuy2._button, 'ResourceBackCell', '_onBtnBuy2');
    }
    updateUI(data1, data2, isPerfect) {
        this._data1 = data1;
        this._data2 = data2;
        this._updateSingle(1, data1, isPerfect);
        this._updateSingle(2, data2, isPerfect);
    }
    _updateSingle(index, data, isPerfect) {
        if (!data) {
            this['_item' + index].active = (false);
            return;
        }
        var itemParams;
        var percent = 1;
        if (isPerfect) {
            itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND);
            this['_resCount' + index].string = (data.getGold());
        } else {
            itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD);
            this['_resCount' + index].string = (data.getCoin());
            percent = data.getPercent();
        }
        if (itemParams.res_mini) {
            UIHelper.loadTexture(this['_resIcon' + index],itemParams.res_mini);
        }
        this['_item' + index].active = (true);
        this._updateAwards(this['_iconParent' + index], data.getAwards(), percent);
        var yesterdayValue = data.getValue();
        if (yesterdayValue != 0) {
            this['_richTipNode' + index].active = (true);
            this._updateRichTip(this['_richTipNode' + index], yesterdayValue);
        } else {
            this['_richTipNode' + index].active = (false);
        }
        this['_title' + index].string = (data.getDescrible());
        if (data.isAlreadyBuy()) {
            this['_btnBuy' + index].setString(Lang.get('lang_activity_resource_back_btn_buyed'));
            this['_btnBuy' + index].setEnabled(false);
            this['_resCount' + index].active = (false);
            this['_resIcon' + index].active = (false);
        } else {
            this['_btnBuy' + index].setEnabled(true);
            this['_btnBuy' + index].setString('');
            this['_resCount' + index].active = (true);
            this['_resIcon' + index].active = (true);
        }
    }
    _updateAwards(parentNode, awards, present) {
        parentNode.removeAllChildren();
        var iconWidth = 86;
        var curWidth = 0;
        for (let k in awards) {
            var v = awards[k];
            var iconNode:cc.Node = ComponentIconHelper.createIcon(v.type, v.value, Math.floor(present * v.size));
            var icon = iconNode.getComponent(CommonIconBase);
            icon.setTouchEnabled(true);
            icon.node.setScale(0.8);
            parentNode.addChild(icon.node);
            icon.node.x = (curWidth);
            curWidth = curWidth + iconWidth;
        }
    }
    _updateRichTip(parentNode, num) {
        var tipStr = Lang.get('lang_activity_resource_back_not_finish', { num: num });
        var richtext = RichTextExtend.createRichTextByFormatString2(tipStr, Colors.BRIGHT_BG_TWO, 18);
        richtext.node.setAnchorPoint(0.5, 0.5);
        parentNode.removeAllChildren();
        parentNode.addChild(richtext.node);
    }
    _onBtnBuy1() {
        this.dispatchCustomCallback(this._data1);
    }
    _onBtnBuy2() {
        this.dispatchCustomCallback(this._data2);
    }

}