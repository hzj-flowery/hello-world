const {ccclass, property} = cc._decorator;

import { CustomActivityConst } from '../../../const/CustomActivityConst';
import { Day7ActivityConst } from '../../../const/Day7ActivityConst';
import { RichTextExtend } from '../../../extends/RichTextExtend';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight';
import CommonRewardListNode from '../../../ui/component/CommonRewardListNode';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';


@ccclass
export default class Day7ActivityItemCell extends ListViewCellBase {

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
    _textItemName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButtonLevel1Normal: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeProgressRichText: cc.Node = null;


    static LINE_ITEM_NUM = 1;
    static IMG_RECEIVE = 'img_receive';
    static ITEM_GAP = 106;
    static ITEM_ADD_GAP = 145;
    static ITEM_OR_GAP = 134;
    static SCROLL_WIDTH = 576;    


    _callback: any;
    _richTextProgress: cc.Component;

    onInit(){
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    onCreate() {

        this._commonButtonLevel1Normal.setSwallowTouches(false);
        UIHelper.addEventListener(this.node, this._commonButtonLevel1Normal._button, 'Day7ActivityItemCell', '_onTouchCallBack');
    }
    _onTouchCallBack(sender, state) {
        // if (state == ccui.TouchEventType.ended || !state) {
        //     var moveOffsetX = math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        //     var moveOffsetY = math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        //     if (moveOffsetX < 20 && moveOffsetY < 20) {
                if (this._callback) {
                    this._callback(this);
                }
                this._onItemClick(this);
        //     }
        // }
    }
    _onItemClick(sender) {
        var curSelectedPos = sender.getTag();
        //logWarn('Day7ActivityItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos+1);
    }
    _updateRewards(actTaskUnitData) {
        var cfg = actTaskUnitData.getConfig();
        var rewards = actTaskUnitData.getRewards();
        var rewardTypes = [];
        for (let k in rewards) {
            var v = rewards[k];
            if (cfg.reward_type == Day7ActivityConst.REWARD_TYPE_SELECT) {
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_SELECT);
            } else {
                rewardTypes.push(CustomActivityConst.REWARD_TYPE_ALL);
            }
        }
        this._commonRewardListNode.setGaps(Day7ActivityItemCell.ITEM_GAP, Day7ActivityItemCell.ITEM_ADD_GAP, Day7ActivityItemCell.ITEM_OR_GAP, Day7ActivityItemCell.SCROLL_WIDTH);
        this._commonRewardListNode.updateInfo(rewards, rewardTypes);
    }
    _createProgressRichText(richText) {
        if (this._richTextProgress) {
            (this._richTextProgress.node as cc.Node).destroy();
        }
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(1, 0.5));
        this._nodeProgressRichText.addChild(widget.node);
        this._richTextProgress = widget;
    }
    updateInfo(actTaskUnitData) {
        var cfg = actTaskUnitData.getConfig();
        this._updateRewards(actTaskUnitData);
        this._textItemName.string = (actTaskUnitData.getDescription());
        var value = actTaskUnitData.getTaskValue();
        var hasReceived = G_UserData.getDay7Activity().isTaskReceivedReward(actTaskUnitData.getId());
        var reachReceiveCondition = actTaskUnitData.isHasReach();
        var canReceive = actTaskUnitData.isCanTaken();
        var showProgress = cfg.show_rate == 1;
        this._nodeProgressRichText.active = (showProgress);
        if (reachReceiveCondition) {
            var richText = Lang.get('days7activity_task_progress_02', {
                curr: TextHelper.getAmountText2(value),
                max: TextHelper.getAmountText2(cfg.task_value_1)
            });
            this._createProgressRichText(richText);
        } else {
            var richText = Lang.get('days7activity_task_progress_01', {
                curr: TextHelper.getAmountText2(value),
                max: TextHelper.getAmountText2(cfg.task_value_1)
            });
            this._createProgressRichText(richText);
        }
        this._commonButtonLevel1Normal.setVisible(true);
        this._commonButtonLevel1Normal.setEnabled(true);
        this._commonButtonLevel1Normal.setString(cfg.button_txt);
        this._imageReceive.node.active = (false);
        if (hasReceived) {
            this._commonButtonLevel1Normal.setVisible(false);
            this._imageReceive.node.active = (true);
        } else if (reachReceiveCondition) {
            if (cfg.function_id != 0) {
                this._commonButtonLevel1Normal.setString(Lang.get('days7activity_btn_receive'));
            }
        } else {
            if (cfg.function_id != 0) {
            } else {
                this._commonButtonLevel1Normal.setEnabled(false);
            }
        }
    }
    setCallBack(callback) {
        if (callback) {
            this._callback = callback;
        }
    }

}
