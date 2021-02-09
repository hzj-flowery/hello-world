const {ccclass, property} = cc._decorator;

import { ActivityOpenServerFundConst } from '../../../../const/ActivityOpenServerFundConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { G_UserData } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import CommonButtonLevel1Highlight from '../../../../ui/component/CommonButtonLevel1Highlight';
import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate';
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import UIHelper from '../../../../utils/UIHelper';


@ccclass
export default class OpenServerFundItemCell extends ListViewCellBase {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _resourceNode: cc.Sprite = null;

   @property({
       type: CommonIconTemplate,
       visible: true
   })
   _commonIconTemplate: CommonIconTemplate = null;

   @property({
       type: CommonButtonLevel1Highlight,
       visible: true
   })
   _commonButtonMediumNormal: CommonButtonLevel1Highlight = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textItemName: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageConditionBg: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeCondition: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageReceive: cc.Sprite = null;


    _conditionRichText: any;

    onInit() {
        UIHelper.addEventListener(this.node, this._commonButtonMediumNormal._button, 'OpenServerFundItemCell', '_onItemClick');
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButtonMediumNormal.setString(Lang.get('lang_activity_fund_receive'));
        this._commonButtonMediumNormal.setSwallowTouches(false);
    }
    _onItemClick(sender, state) {

        var curSelectedPos = this.getTag();
        //logWarn('OpenServerFundItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    _createConditionRichText(richText) {
        if (this._conditionRichText) {
            this._conditionRichText.destroy();
        }
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeCondition.addChild(widget.node);
        this._conditionRichText = widget.node;
        //(widget as any)._updateRenderData(true);
        //widget.formatText();
        var labelSize = widget.node.getContentSize();
        var size = this._imageConditionBg.node.getContentSize();
        this._imageConditionBg.node.setContentSize(cc.size(labelSize.width + 11, size.height));
    }
    updateUI(actOpenServerFundUnitData) {
        var cfg = actOpenServerFundUnitData.getConfig();
        var vipLevel = G_UserData.getActivityOpenServerFund().getGrowFundNeedVipLevel();
        this._commonIconTemplate.unInitUI();
        this._commonIconTemplate.initUI(cfg.reward_type, cfg.reward_value, cfg.reward_size);
        this._commonIconTemplate.setTouchEnabled(true);
        var itemParams = this._commonIconTemplate.getItemParams();
        this._textItemName.string = ((cfg.reward_size).toString() + itemParams.name);
        var isCanReceive = actOpenServerFundUnitData.canReceive();
        var isReceive = actOpenServerFundUnitData.isHasReceive();
        if (isReceive) {
            this._commonButtonMediumNormal.setVisible(false);
            this._imageReceive.node.active = (true);
        } else {
            this._commonButtonMediumNormal.setVisible(true);
            this._imageReceive.node.active = (false);
            this._commonButtonMediumNormal.setEnabled(isCanReceive);
        }
        if (cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_GROW) {
            var richText = null;
            if (cfg.fund_value != 0) {
                richText = Lang.get('lang_activity_fund_condition_01', { level: cfg.fund_value });
            } else {
                richText = Lang.get('lang_activity_fund_condition_03');
            }
            this._createConditionRichText(richText);
        } else if (cfg.fund_type == ActivityOpenServerFundConst.FUND_TYPE_SERVER_REWARD) {
            var richText1 = Lang.get('lang_activity_fund_condition_02', { people: cfg.fund_value });
            this._createConditionRichText(richText1);
        }
    }

}