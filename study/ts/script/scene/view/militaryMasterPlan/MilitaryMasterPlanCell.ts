import CommonConst from "../../../const/CommonConst";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import CommonListItem from "../../../ui/component/CommonListItem";
import CommonRewardListNode from "../../../ui/component/CommonRewardListNode";
import { handler } from "../../../utils/handler";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CustomActivityRechargeTaskItemCell extends CommonListItem {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;

    @property({
        type: CommonRewardListNode,
        visible: true
    })
    _commonRewardListNode: CommonRewardListNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _texTime: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButtonLargeNormal: CommonButtonSwitchLevel1 = null;

    private static LINE_ITEM_NUM = 1;
    private static ITEM_GAP = 106;
    private static ITEM_ADD_GAP = 132;
    private static ITEM_OR_GAP = 132;

    private _callback: any;
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButtonLargeNormal.addClickEventListenerEx(handler(this, this.onClickBtn));
        UIHelper.enableOutline(this._textName,cc.color(189,66,24));
    }
    onExit(){
        if(this._handlerTime)
        {
            this.unschedule(this._handlerTime);
            this._handlerTime = null;
        }
    }
    onClickBtn() {
        if (this._callback) {
            this._callback(this);
        }
        this._onItemClick(this);
    }
    _onItemClick(sender) {
        var curSelectedPos = this.itemID;
        cc.warn('CustomActivityRechargeTaskItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    _onTouchCallBack(sender: cc.Touch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            this.onClickBtn();
        }
    }
    protected updateUI(itemId, data) {
        this.updateInfo(data[0],data[1]);
    }
    private _updateRewards(rewards: any[]) {
        var rewardNum = rewards.length;
        var rewardTypes = [];
        for (var i = 1; i <= rewardNum; i += 1) {
            rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
        }
        this._commonRewardListNode.setGaps(CustomActivityRechargeTaskItemCell.ITEM_GAP, CustomActivityRechargeTaskItemCell.ITEM_ADD_GAP, CustomActivityRechargeTaskItemCell.ITEM_OR_GAP);
        this._commonRewardListNode.updateInfo(rewards, rewardTypes);
    }
    private _updateTime(): void {
        if(this._curTime<=0)
        {
            this._texTime.string = "00:00:00";//倒计时结束
            this._curTime=0;
            //停止刷新
            if(this._handlerTime)
            {
                this.unschedule(this._handlerTime);
                this._handlerTime = null;
            }
            G_UserData.getMilitaryMasterPlan().c2sSuperLevelGiftInfor();
            return;
        }
        let hour = Math.floor(this._curTime/(60*60));
        let min = Math.floor((this._curTime - hour*(60*60))/60);
        let sec = this._curTime - hour*(60*60) - min*60;
        let hourStr = hour<10?"0"+hour:hour+"";
        let minStr = min<10?"0"+min:min+"";
        let secStr = sec<10?"0"+sec:sec+"";
        this._texTime.string = hourStr+":"+minStr+":"+secStr;
        this._curTime--;
    }
    private _curTime:number = 0;//当前时间
    private _handlerTime:Function;
    private handleTime():void{
        if(this._handlerTime)
        {
            this.unschedule(this._handlerTime);
            this._handlerTime = null;
        }
        this._handlerTime = this._updateTime.bind(this);
        this._updateTime();
        this.schedule(this._handlerTime,1);
    }
    private updateInfo(data,time) {
        var customActTaskUnitData = data.rewards;
        //金额
        this._curTime = data.time - time;
        this._textName.string = data.title;
        this._updateRewards(customActTaskUnitData);
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._commonButtonLargeNormal.setString(data.cost);
        this.handleTime();
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }


}