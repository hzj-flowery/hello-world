const {ccclass, property} = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonItemListExchangeNode from '../../../ui/component/CommonItemListExchangeNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { CustomActivityUIHelper } from '../customActivity/CustomActivityUIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import { Colors } from '../../../init';
import { Path } from '../../../utils/Path';

@ccclass
export default class CarnivalActivityExchangeCell extends ListViewCellBase {

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
        type: CommonItemListExchangeNode,
        visible: true
    })
    _commonItemListExchangeNode: CommonItemListExchangeNode = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButtonLargeNormal: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

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

    
    _callback: any;
    _data: any;


    static LINE_ITEM_NUM = 1;
    static ITEM_GAP = 106;
    static ITEM_MID_GAP = 160;
    static ITEM_ADD_GAP = 132;
    static ITEM_OR_GAP = 132;
    static POS_OFFSET_DISCOUNT = 10;


    onInit() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {
        UIHelper.addEventListener(this.node, this._commonButtonLargeNormal._button, 'CarnivalActivityExchangeCell', '_onTouchCallBack');
        this._commonButtonLargeNormal.setSwallowTouches(false);
    }
    onClickBtn() {
        if (this._callback) {
            this._callback(this);
        }
        this._onItemClick(this);
    }
    _onItemClick(sender) {
        var curSelectedPos = sender.getTag();
        //logWarn('CarnivalActivityExchangeCell:_onIconClicked  ' + curSelectedPos);
        //this.dispatchCustomCallback(curSelectedPos, this._data);
        this.dispatchCustomCallback(curSelectedPos);
    }
    _onTouchCallBack(sender, state) {
        this.onClickBtn();
    }
    onClickItem(sender) {
        var tag = this.getTag();
    }
    _updateRewards(actTaskUnitData) {
        var [consumeItems, consumeItemTypes, rewards, rewardTypes] = CustomActivityUIHelper.makeCustomActItemData(actTaskUnitData);
        this._commonItemListExchangeNode.setGaps(CarnivalActivityExchangeCell.ITEM_GAP, CarnivalActivityExchangeCell.ITEM_ADD_GAP, CarnivalActivityExchangeCell.ITEM_OR_GAP, CarnivalActivityExchangeCell.ITEM_MID_GAP, 470);
        this._commonItemListExchangeNode.updateInfo(consumeItems, consumeItemTypes, rewards, rewardTypes);
    }
    _createProgressRichText(richText) {
        this._nodeProgress.removeAllChildren();
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this._nodeProgress.addChild(widget.node);
    }
    updateInfo(data) {
        this._data = data;
        var customActTaskUnitData = data.actTaskUnitData;
        var activityUnitData = data.actUnitData;
        var reachReceiveCondition = data.reachReceiveCondition;
        var hasReceive = data.hasReceive;
        var canReceive = data.canReceive;
        var hasLimit = data.hasLimit;
        var timeLimit = data.timeLimit;
        var buttonTxt = customActTaskUnitData.getButtonTxt();
        var taskDes = customActTaskUnitData.getDescription();
        var progressTitle = customActTaskUnitData.getProgressTitle();
        var [value01, value02, onlyShowMax] = customActTaskUnitData.getProgressValue();
        var functionId = customActTaskUnitData.getQuestNotFinishJumpFunctionID();
        var notShowProgress = false;
        var discount = customActTaskUnitData.getDiscountNum();
        var showDiscount = customActTaskUnitData.isDiscountNeedShow(discount);
        //logWarn(string.format(' %d ******************** %d', value01, value02));
        //logWarn(string.format(' %s ********** %s ********** %s ********** %s', tostring(canReceive), tostring(reachReceiveCondition), tostring(hasLimit), tostring(hasReceive)));
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
            UIHelper.loadTexture(this._imageDiscount, Path.getDiscountImg(Math.floor(discount)));
        }
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._commonButtonLargeNormal.setString(buttonTxt);
        this._imageReceive.node.active = (false);
        if (canReceive) {
        } else if (hasReceive) {
            this._commonButtonLargeNormal.setVisible(false);
            this._imageReceive.node.active = (true);
        } else if (hasLimit || timeLimit) {
            this._commonButtonLargeNormal.setEnabled(false);
        } else {
            if (functionId != 0) {
            } else {
                this._commonButtonLargeNormal.setEnabled(false);
            }
        }
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }
}
