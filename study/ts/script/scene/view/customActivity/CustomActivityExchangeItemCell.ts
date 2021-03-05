const { ccclass, property } = cc._decorator;

import CommonItemListExchangeNode from '../../../ui/component/CommonItemListExchangeNode'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import CommonListItem from '../../../ui/component/CommonListItem';
import { CustomActivityUIHelper } from './CustomActivityUIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { Colors } from '../../../init';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import { handler } from '../../../utils/handler';
import CommonButtonSwitchLevel1 from '../../../ui/component/CommonButtonSwitchLevel1';

@ccclass
export default class CustomActivityExchangeItemCell extends CommonListItem {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTaskDes: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButtonLargeNormal: CommonButtonSwitchLevel1 = null;

    @property({
        type: CommonItemListExchangeNode,
        visible: true
    })
    _commonItemListExchangeNode: CommonItemListExchangeNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageUnReceive: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscount: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textDiscount: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;

    private _callback: any;


    private static LINE_ITEM_NUM = 1;
    private static ITEM_GAP = 106;
    private static ITEM_MID_GAP = 160;
    private static ITEM_ADD_GAP = 132;
    private static ITEM_OR_GAP = 132;
    private static POS_OFFSET_DISCOUNT = 10;
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        // this._commonButtonLargeNormal.setSwallowTouches(false);
        this._commonButtonLargeNormal.addClickEventListenerEx(handler(this, this.onClickBtn))
    }
    onClickBtn() {
        if (this._callback) {
            this._callback(this);
        }
        this._onItemClick(this);
    }
    _onItemClick(sender) {
        var curSelectedPos = this.itemID;
        cc.warn('CustomActivityExchangeItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    onClickItem(sender) {
        var tag = this.getTag();
    }
    _updateRewards(actTaskUnitData) {
        var [consumeItems, consumeItemTypes, rewards, rewardTypes] = CustomActivityUIHelper.makeCustomActItemData(actTaskUnitData);
        this._commonItemListExchangeNode.setGaps(CustomActivityExchangeItemCell.ITEM_GAP, CustomActivityExchangeItemCell.ITEM_ADD_GAP, CustomActivityExchangeItemCell.ITEM_OR_GAP, CustomActivityExchangeItemCell.ITEM_MID_GAP, 629);
        this._commonItemListExchangeNode.updateInfo(consumeItems, consumeItemTypes, rewards, rewardTypes);
    }
    _createProgressRichText(richText) {
        this._nodeProgress.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(new cc.Vec2(0.5, 0.5));
        this._nodeProgress.addChild(widget.node);
    }
    protected updateUI(index, data: Array<any>) {
        this.updateInfo(data[0]);
    }
    private updateInfo(data) {
        var customActTaskUnitData = data.actTaskUnitData;
        var activityUnitData = data.actUnitData;
        var reachReceiveCondition = data.reachReceiveCondition;
        var canReceive = data.canReceive;
        var buttonTxt = activityUnitData.getButtonTxt();
        var taskDes = customActTaskUnitData.getDescription();
        var progressTitle = customActTaskUnitData.getProgressTitle();
        var [value01, value02, onlyShowMax] = customActTaskUnitData.getProgressValue();
        var functionId = activityUnitData.getFunctionId();
        var notShowProgress = false;
        var discount = customActTaskUnitData.getDiscountNum();
        var showDiscount = customActTaskUnitData.isDiscountNeedShow(discount);
        this._updateRewards(customActTaskUnitData);
        this._textTaskDes.string = (taskDes);
        this._nodeProgress.active = (!notShowProgress);
        if (!notShowProgress) {
            if (onlyShowMax) {
                var richText = Lang.get('customactivity_task_progress_04', {
                    title: progressTitle,
                    max: TextHelper.getAmountText2(value02),
                    titleColor: Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
                    maxColor: Colors.colorToNumber(value02 <= 0 && Colors.BRIGHT_BG_RED || Colors.BRIGHT_BG_ONE)
                });
                this._createProgressRichText(richText);
            } else if (value01 > 0) {
                var richText = Lang.get('customactivity_task_progress_02', {
                    title: progressTitle,
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            } else {
                var richText = Lang.get('customactivity_task_progress_01', {
                    title: progressTitle,
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            }
        }
        this._imageDiscount.node.active = (showDiscount);
        if (showDiscount && discount >= 1 && discount <= 9) {
            this._imageDiscount.node.addComponent(CommonUI).loadTexture(Path.getDiscountImg(Math.floor(discount)));
        }
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._imageUnReceive.node.active = (false);
        this._commonButtonLargeNormal.setString(buttonTxt);
        this._imageReceive.node.active = (false);
        if (activityUnitData.isActInPreviewTime()) {
            this._commonButtonLargeNormal.setVisible(false);
            this._imageUnReceive.node.active = (true);
        } else {
            if (reachReceiveCondition) {
                if (canReceive) {
                } else {
                    this._commonButtonLargeNormal.setVisible(false);
                    this._imageReceive.node.active = (true);
                }
            } else {
                if (functionId != 0) {
                } else {
                    this._commonButtonLargeNormal.setEnabled(false);
                }
            }
        }
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }


}