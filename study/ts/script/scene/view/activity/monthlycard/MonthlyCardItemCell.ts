import CommonListViewLineItem from "../../../../ui/component/CommonListViewLineItem";
import CommonButtonSwitchLevel0 from "../../../../ui/component/CommonButtonSwitchLevel0";
import { handler } from "../../../../utils/handler";
import { G_UserData, Colors } from "../../../../init";
import { RichTextExtend } from "../../../../extends/RichTextExtend";
import UIHelper from "../../../../utils/UIHelper";
import { Lang } from "../../../../lang/Lang";
import { Path } from "../../../../utils/Path";
import { MonthCardHelper } from "./MonthCardHelper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MonthlyCardItemCell extends cc.Component {

    @property({
        type:cc.Sprite,
        visible:true
    })
    _imageTitle:cc.Sprite = null;

    @property({
        type:CommonListViewLineItem,
        visible:true
    })
    _dropListView:CommonListViewLineItem = null;

    @property({
        type:cc.Sprite,
        visible:true
    })
    _imageYuanbaoBg:cc.Sprite = null;
    @property({
        type:cc.Sprite,
        visible:true
    })
    _imageHintBg:cc.Sprite = null;
    @property({
        type:cc.Sprite,
        visible:true
    })
    _imageSend:cc.Sprite = null;
    @property({
        type:cc.Sprite,
        visible:true
    })
    _imageReceive:cc.Sprite = null;

    @property({
        type:cc.Label,
        visible:true
    })
    _atlasLabel02:cc.Label = null;
    @property({
        type:cc.Label,
        visible:true
    })
    _atlasLabel03:cc.Label = null;
    @property({
        type:cc.Label,
        visible:true
    })
    _textTitle:cc.Label = null;
    @property({
        type:cc.Label,
        visible:true
    })
    _text03:cc.Label = null;
    @property({
        type:cc.Label,
        visible:true
    })
    _textDes:cc.Label = null;

    @property({
        type:CommonButtonSwitchLevel0,
        visible:true
    })
    _commonButton1:CommonButtonSwitchLevel0 = null;
    
    _index: any;
    _callBack: any;
    _data: any;

    static CARD_PNGS = [
        {
            title: 'img_yueka_haohuayueka',
            type: 'img_yueka_zi1',
            goldBg: 'img_yueka_zi'
        },
        {
            title: 'img_yueka_zhizunyueka',
            type: 'img_yueka_cheng1',
            goldBg: 'img_yueka_cheng'
        }
    ];

    ctor(index, callBack) {
        this._index = index;
        this._callBack = callBack;
        this._commonButton1.addClickEventListenerEx(handler(this, this._onBtnClick));
        this._commonButton1.setButtonTag(index);
        var pngData = MonthlyCardItemCell.CARD_PNGS[this._index-1];
        UIHelper.loadTexture(this._imageTitle, Path.getMonthlyCardRes(pngData.title));
        UIHelper.loadTexture(this._imageYuanbaoBg, Path.getMonthlyCardRes(pngData.goldBg));
        if (index == 1) {
            this._atlasLabel02.node.color = (Colors.COLOR_QUALITY[4-1]);
            this._atlasLabel03.node.color = (Colors.COLOR_QUALITY[4-1]);
            this._textDes.node.color = (Colors.COLOR_QUALITY[4-1]);
            this._textDes.string = (Lang.get('lang_activity_monthly_card_des1'));
        } else {
            this._atlasLabel02.node.color = (Colors.COLOR_QUALITY[5-1]);
            this._atlasLabel03.node.color = (Colors.COLOR_QUALITY[5-1]);
            this._textDes.node.color = (Colors.COLOR_QUALITY[5-1]);
            this._textDes.string = (Lang.get('lang_activity_monthly_card_des2'));
        }
        this._updateDropAwards();
    }
    onLoad(){
        
    }
    _updateDropAwards() {
        var dropList:any[] = MonthCardHelper.getCurCanDropAwrads();
        if (dropList.length <= 0) {
            return;
        }
        this._dropListView.setMaxItemSize(3);
        this._dropListView.setListViewSize(320, 120);
        this._dropListView.setItemsMargin(1);
        this._dropListView.updateUI(dropList, 1);
        //var num = (dropList.length);
        // if (num < 3) {
        //     this._dropListView.node.x = ((300 - this._dropListView.getItemContentSize().width * num) / 2);
        // } else if (num == 3) {
        //     this._dropListView.node.x = ((328 - this._dropListView.getItemContentSize().width * num) / 2);
        // }
        var listView = this._dropListView._listViewItem;
        listView.node.width = Math.min(350,listView.content.width);
        
    }
    _onBtnClick(sender) {
        if (this._callBack) {
            this._callBack(sender, this._data);
        }
    }
    _refreshBthStateToReceive(cardData) {
        this._commonButton1.switchToHightLight();
        var remainDay = cardData.getRemainDay();
        this._commonButton1.setString(Lang.get('lang_activity_monthly_card_btn_2'));
        this._commonButton1.setEnabled(true);
        this._imageHintBg.node.active = (true);
        this._createConditionRichText(Lang.get('lang_activity_monthly_card_remain_day', { day: remainDay }));
    }
    _refreshBthStateToAlreadyReceive(cardData) {
        this._commonButton1.node.active = (false);
        this._imageReceive.node.active = (true);
        var remainDay = cardData.getRemainDay();
        this._imageHintBg.node.active = (true);
        this._createConditionRichText(Lang.get('lang_activity_monthly_card_remain_day', { day: remainDay }));
    }
    _refreshBthStateToBuy(data) {
        this._commonButton1.switchToNormal();
        var price = data.rmb;
        this._commonButton1.setString(Lang.get('lang_activity_monthly_card_btn_1', { value: price }));
        this._commonButton1.setEnabled(true);
        this._imageSend.node.active = (true);
    }
    _refreshBthStateToRenew(cardData) {
        this._commonButton1.switchToNormal();
        var remainDay = cardData.getRemainDay();
        var price = cardData.getConfig().rmb;
        this._commonButton1.setString(Lang.get('lang_activity_monthly_card_renew', { value: price }));
        this._commonButton1.setEnabled(true);
        this._imageHintBg.node.active = (true);
        this._createConditionRichText(Lang.get('lang_activity_monthly_card_remain_day', { day: remainDay }));
    }
    refreshUI(data) {
        if (!data) {
            this.node.active = (false);
            return;
        }
        this._data = data;
        this.node.active = (true);
        this._imageHintBg.node.active = (false);
        this._imageSend.node.active = (false);
        var monthlyCardData = G_UserData.getActivityMonthCard();
        var cardData = monthlyCardData.getMonthCardDataById(data.id);
        var totalGold = data.last_day * data.size + data.gold;
        var dailyGold:number = data.size;
        var firstGold = data.gold;
        this._atlasLabel02.string = dailyGold.toString();
        this._atlasLabel03.string = ((firstGold).toString());
        this._imageReceive.node.active = (false);
        this._commonButton1.node.active = (true);
        if (cardData && cardData.isCanReceive()) {
            this._refreshBthStateToReceive(cardData);
        } else {
            if (!cardData) {
                this._refreshBthStateToBuy(data);
            } else if (cardData.getRemainDay() <= 0) {
                this._refreshBthStateToBuy(data);
            } else if (cardData.getRemainDay() <= cardData.getConfig().renew_day) {
                this._refreshBthStateToRenew(cardData);
            } else {
                this._refreshBthStateToAlreadyReceive(cardData);
            }
        }
    }
    _createConditionRichText(richText) {
        this._imageHintBg.node.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5,0.5));
        widget.maxWidth = 194;
        this._imageHintBg.node.addChild(widget.node);
        widget.node.y = this._imageHintBg.node.height / 2;
    }

}
