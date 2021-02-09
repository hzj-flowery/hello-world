import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonRewardListNode from "../../../ui/component/CommonRewardListNode";
import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";
import { CustomActivityConst } from "../../../const/CustomActivityConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";
import { Colors } from "../../../init";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;







@ccclass
export default class CarnivalActivityYuBiExchangeCell extends ListViewCellBase {
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
    _textTaskDes: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButtonLargeNormal: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgress: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageDiscount: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPrice: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgCost: cc.Sprite = null;

    static LINE_ITEM_NUM = 1;
    static ITEM_GAP = 106;
    static ITEM_MID_GAP = 160;
    static ITEM_ADD_GAP = 132;
    static ITEM_OR_GAP = 132;
    static POS_OFFSET_DISCOUNT = 10;
    static SCROLL_WIDTH = 582;
    private _callback: any;
    private _data: any;
    
    ctor() {
        
    }
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
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
        this.dispatchCustomCallback(curSelectedPos, this._data);
    }
    _onTouchCallBack(sender, state) {
        if (state == cc.Node.EventType.TOUCH_END || !state) {
            var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
            var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
            if (moveOffsetX < 20 && moveOffsetY < 20) {
                this.onClickBtn();
            }
        }
    }
    onClickItem(sender) {
        var tag = this.getTag();
    }
    _updateRewards(actTaskUnitData) {
        var fixRewards = actTaskUnitData.getRewardItems();
        var selectRewards = actTaskUnitData.getSelectRewardItems();
        var rewardNum = fixRewards.length + selectRewards.length;
        var rewards = [];
        var rewardTypes = [];
        for (var i = 1; i<=rewardNum; i++) {
            if (i <= fixRewards.length) {
                rewards.push(fixRewards[i-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
            } else {
                rewards.push(selectRewards[i - fixRewards.length-1]);
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_SELECT);
            }
        }
        this._commonRewardListNode.setGaps(CarnivalActivityYuBiExchangeCell.ITEM_GAP, CarnivalActivityYuBiExchangeCell.ITEM_ADD_GAP, CarnivalActivityYuBiExchangeCell.ITEM_OR_GAP, CarnivalActivityYuBiExchangeCell.SCROLL_WIDTH);
        this._commonRewardListNode.updateInfo(rewards, rewardTypes);
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
        this._updateRewards(customActTaskUnitData);
        this._nodeProgress.active = (!notShowProgress);
        if (!notShowProgress) {
            if (onlyShowMax) {
                var richText = Lang.get('customactivity_task_progress_04', {
                    title: "",
                    max: TextHelper.getAmountText2(value02),
                    titleColor: Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
                    maxColor: Colors.colorToNumber(value02 <= 0 && Colors.BRIGHT_BG_RED || Colors.BRIGHT_BG_ONE)
                });
                this._createProgressRichText(richText);
            } else if (value01 > 0) {
                var richText = Lang.get('customactivity_task_progress_02', {
                    title: "",
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            } else {
                var richText = Lang.get('customactivity_task_progress_01', {
                    title: "",
                    curr: TextHelper.getAmountText2(value01),
                    max: TextHelper.getAmountText2(value02)
                });
                this._createProgressRichText(richText);
            }
        }
        this._imageDiscount.node.active = (showDiscount);
        if (showDiscount && discount >= 1 && discount <= 9) {
            UIHelper.loadTexture(this._imageDiscount,Path.getDiscountImg(Math.floor(discount)));
        }
        this._commonButtonLargeNormal.setVisible(true);
        this._commonButtonLargeNormal.setEnabled(true);
        this._commonButtonLargeNormal.setString('');
        this._textPrice.string = (buttonTxt);
        this._imageReceive.node.active = (false);
        //this._imgCost.node.active = (true);
        this._textPrice.node.active = (true);
        if (canReceive) {
        } else if (hasReceive) {
            this._commonButtonLargeNormal.setVisible(false);
            this._imageReceive.node.active = (true);
            //this._imgCost.node.active = (false);
            this._textPrice.node.active = (false);
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