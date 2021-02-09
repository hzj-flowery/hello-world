import CommonListItem from "../../../ui/component/CommonListItem";
import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import CommonResourceInfoList from "../../../ui/component/CommonResourceInfoList";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { ShopActiveDataHelper } from "../../../utils/data/ShopActiveDataHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { handler } from "../../../utils/handler";
const { ccclass, property } = cc._decorator;
@ccclass
export default class PetActiveShopCell extends CommonListItem{
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
        type: CommonIconTemplate,
        visible: true
    })
    _icon1: CommonIconTemplate = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFragment1: cc.Node = null;
 
    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _cost1_1: CommonResourceInfoList = null;
 
    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _cost1_2: CommonResourceInfoList = null;
 
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button1: CommonButtonLevel1Highlight = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textDes1: cc.Label = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscount1: cc.Sprite = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _item2: cc.Node = null;
 
    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon2: CommonIconTemplate = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;
 
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFragment2: cc.Node = null;
 
    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _cost2_1: CommonResourceInfoList = null;
 
    @property({
        type: CommonResourceInfoList,
        visible: true
    })
    _cost2_2: CommonResourceInfoList = null;
 
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _button2: CommonButtonLevel1Highlight = null;
 
    @property({
        type: cc.Label,
        visible: true
    })
    _textDes2: cc.Label = null;
 
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscount2: cc.Sprite = null;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._button1.addTouchEventListenerEx(handler(this,this._onClickButton1),false);
        this._button2.addTouchEventListenerEx(handler(this,this._onClickButton2),false)
    }
    protected updateUI(index,data){
        this.updateData(data[0],data[1])
    }
    private updateData(goodId1, goodId2) {
        var updateNode = function (index, goodId) {
            if (goodId) {
                (this['_item' + index] as cc.Node).active = (true);
                var data = G_UserData.getShopActive().getUnitDataWithId(goodId);
                var info = data.getConfig();
                var param = TypeConvertHelper.convert(info.type, info.value);
                var costInfo = ShopActiveDataHelper.getCostInfo(goodId);
                var isBought = data.isBought();
                var strButton = isBought && Lang.get('shop_btn_buyed') || Lang.get('shop_btn_buy');
                (this['_icon' + index] as CommonIconTemplate).unInitUI();
                (this['_icon' + index] as CommonIconTemplate).initUI(info.type, info.value, info.size);
                (this['_icon' + index] as CommonIconTemplate).setTouchEnabled(true);
                (this['_textName' + index] as cc.Label).string = (param.name);
                (this['_textName' + index] as cc.Label).node.color = (param.icon_color);
                if (info.type == TypeConvertHelper.TYPE_FRAGMENT) {
                    this._showFragmentNum(info.type, info.value, index);
                }
                for (var i = 1; i <= 2; i++) {
                    var cost = costInfo[i-1];
                    if (cost) {
                        (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).setVisible(true);
                        (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).updateUI(cost.type, cost.value, cost.size);
                    } else {
                        (this['_cost' + (index + ('_' + i))] as CommonResourceInfoList).setVisible(false);
                    }
                }
                (this['_button' + index] as CommonButtonLevel1Highlight).setString(strButton);
                (this['_button' + index] as CommonButtonLevel1Highlight).setEnabled(!isBought);
            } else {
                (this['_item' + index] as cc.Node).active = (false);
            }
        }.bind(this)
        updateNode(1, goodId1);
        updateNode(2, goodId2);
    }
    _showFragmentNum(type, value, index) {
        (this['_nodeFragment' + index] as cc.Node).removeAllChildren();
        var textFragment = (new cc.Node).addComponent(cc.RichText) as cc.RichText;
        (this['_nodeFragment' + index] as cc.Node).addChild(textFragment.node);
        textFragment.node.setAnchorPoint(new cc.Vec2(0, 0.5));
        var itemParams = TypeConvertHelper.convert(type, value);
        var num = UserDataHelper.getNumByTypeAndValue(type, value);
        (this['_textName' + index] as cc.Label)["_updateRenderData"](true);
        var textContent = (this['_textName' + index] as cc.Label).node.getContentSize();
        var txtX = (this['_textName' + index] as cc.Label).node.x;
        var txtY = (this['_textName' + index] as cc.Label).node.y;
        (this['_nodeFragment' + index] as cc.Node).active = (true);
        var richTextColor = Colors.BRIGHT_BG_TWO;
        if (num >= itemParams.cfg.fragment_num) {
            richTextColor = Colors.BRIGHT_BG_GREEN;
        } else {
            richTextColor = Colors.BRIGHT_BG_RED;
        }
        var richText = Lang.get('shop_fragment_limit', {
            num: num,
            color: richTextColor,
            max: itemParams.cfg.fragment_num
        });
        RichTextExtend.setRichTextWithJson(textFragment,richText);
        (this['_nodeFragment' + index] as cc.Node).setPosition(txtX + textContent.width + 4, txtY);
    }
    _onClickButton1() {
        this.dispatchCustomCallback(1);
    }
    _onClickButton2() {
        this.dispatchCustomCallback(2);
    }

}