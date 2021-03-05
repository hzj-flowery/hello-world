const {ccclass, property} = cc._decorator;

import { AudioConst } from '../../../../const/AudioConst';
import CommonConst from '../../../../const/CommonConst';
import { DataConst } from '../../../../const/DataConst';
import { SignalConst } from '../../../../const/SignalConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { Colors, G_AudioManager, G_Prompt, G_SignalManager, G_UserData } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../../ui/component/CommonButtonLevel0Highlight';
import CommonHeroAvatar from '../../../../ui/component/CommonHeroAvatar';
import CommonPromptSilverNode from '../../../../ui/component/CommonPromptSilverNode';
import CommonResourceInfo from '../../../../ui/component/CommonResourceInfo';
import { SpineNode } from '../../../../ui/node/SpineNode';
import { ActivityDataHelper } from '../../../../utils/data/ActivityDataHelper';
import { handler } from '../../../../utils/handler';
import { LogicCheckHelper } from '../../../../utils/LogicCheckHelper';
import { Path } from '../../../../utils/Path';
import { TypeConvertHelper } from '../../../../utils/TypeConvertHelper';
import UIHelper from '../../../../utils/UIHelper';
import ActivitySubView from '../ActivitySubView';
import PromptSilverGetHelper from './PromptSilverGetHelper';





@ccclass
export default class MoneyTreeView extends ActivitySubView {

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeContent: cc.Node = null;

   @property({
       type: CommonHeroAvatar,
       visible: true
   })
   _commonHeroAvatar: CommonHeroAvatar = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _effectSpine: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeBox: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTimes: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodePrompt: cc.Node = null;

   @property({
       type: CommonPromptSilverNode,
       visible: true
   })
   _commonPromptSilverNode: CommonPromptSilverNode = null;


   @property({
       type: cc.Label,
       visible: true
   })
   _freeCount: cc.Label = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeSilverOnce: cc.Node = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _commonResourceInfoOnce: CommonResourceInfo = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _commonButtonOnce: CommonButtonLevel0Highlight = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeSilver10Times: cc.Node = null;

   @property({
       type: CommonButtonLevel0Highlight,
       visible: true
   })
   _commonButton10Times: CommonButtonLevel0Highlight = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _commonResourceInfo10Times: CommonResourceInfo = null;

   @property(cc.Prefab)
   CommonPromptSilverNode:cc.Prefab = null;

    static BOX_IMG = {
        close: 'baoxiangjin_guan',
        open: 'baoxiangjin_kai',
        received: 'baoxiangjin_kong'
    };

    static SHAKE_ONCE = 1;
    static SHAKE_10TIMES = 2;

    _activityId: any;
    _totalFreeCount: any;
    _effectSpineSkillNode: SpineNode;
    _signalWelfareMoneyTreeGetInfo: any;
    _signalWelfareMoneyTreeShake: any;
    _signalWelfareMoneyTreeOpenBox: any;
    _scheduleShowPrompt: any;
    _baseSilverRichText: cc.RichText;
    _base10TimesSilverRichText: cc.RichText;
    _promptSilverGetHelper: PromptSilverGetHelper;

    
    ctor(mainView, activityId) {
        this._activityId = activityId;
        this._totalFreeCount = G_UserData.getActivityMoneyTree().getFreeCount();
        this._promptSilverGetHelper = new PromptSilverGetHelper(this.CommonPromptSilverNode);
        UIHelper.addEventListener(this.node, this._commonButtonOnce._button, 'MoneyTreeView', '_onShakeOnceClick');
        UIHelper.addEventListener(this.node, this._commonButton10Times._button, 'MoneyTreeView', '_onShake10TimesClick');
    }
    _pullData() {
        var hasActivityServerData = G_UserData.getActivity().hasActivityData(this._activityId);
        if (!hasActivityServerData) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        return hasActivityServerData;
    }
    onCreate() {
        this._commonButtonOnce.setString(Lang.get('lang_activity_moneytree_shakeOnce'));
        this._commonButton10Times.setString(Lang.get('lang_activity_moneytree_shake10Times'));
        this._commonResourceInfoOnce.setTextColor(Colors.uiColors.THIN_YELLOW);
        this._commonResourceInfo10Times.setTextColor(Colors.uiColors.THIN_YELLOW);
        this._effectSpineSkillNode = SpineNode.create(0.5);
        this._effectSpineSkillNode.setAsset(Path.getSpine('312_fore_effect'));
        this._effectSpineSkillNode.node.active = (false);
        this._effectSpine.addChild(this._effectSpineSkillNode.node);
        this._promptSilverGetHelper.setPromptRootNode(this._nodePrompt);
        this._nodeBox.active = (false);
        this._initBoxView();
    }
    onEnter() {
        this._commonHeroAvatar.updateUI(312);
        this._signalWelfareMoneyTreeGetInfo = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONEY_TREE_GET_INFO, handler(this, this._onEventWelfareMoneyTreeGetInfo));
        this._signalWelfareMoneyTreeShake = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONEY_TREE_SHAKE, handler(this, this._onEventWelfareMoneyTreeShake));
        this._signalWelfareMoneyTreeOpenBox = G_SignalManager.add(SignalConst.EVENT_WELFARE_MONEY_TREE_OPEN_BOX, handler(this, this._onEventWelfareMoneyTreeOpenBox));
        var hasServerData = this._pullData();
        if (hasServerData && G_UserData.getActivityMoneyTree().isExpired()) {
            G_UserData.getActivity().pullActivityData(this._activityId);
        }
        if (hasServerData) {
            this.refreshData();
        }
    }
    onExit() {
        this._signalWelfareMoneyTreeGetInfo.remove();
        this._signalWelfareMoneyTreeGetInfo = null;
        this._signalWelfareMoneyTreeShake.remove();
        this._signalWelfareMoneyTreeShake = null;
        this._signalWelfareMoneyTreeOpenBox.remove();
        this._signalWelfareMoneyTreeOpenBox = null;
        if (this._scheduleShowPrompt) {
            this.unschedule(this._scheduleShowPrompt);
        }
    }
    enterModule() {
    }
    _onEventWelfareMoneyTreeGetInfo(event, id, message) {
        this.refreshData();
    }
    _onEventWelfareMoneyTreeShake(event, id, message) {
        this.refreshData();
        this._commonHeroAvatar.playAnimationOnce('skill2');
        this._effectSpineSkillNode.node.active = (true);
        this._effectSpineSkillNode.setAnimation('skill2', false);
        var node = this._effectSpineSkillNode.node;
        this._effectSpineSkillNode.signalComplet.addOnce(function () {
            node.active = (false);
        });
        G_AudioManager.playSoundWithId(AudioConst.SOUND_ACTIVITY_MONEYTREE);
        var results = (message['money_tree']);
        this._showPromptSilver(results);
    }
    _showPromptSilver(data) {
        if (!data || data.length == 0) {
            this._commonButtonOnce.setEnabled(true);
            this._commonButton10Times.setEnabled(true);
            return;
        }
        var count = 1;
        if (this._scheduleShowPrompt) {
            this.unschedule(this._scheduleShowPrompt);
            this._scheduleShowPrompt = null;
        }
        for (let k in data) {
            var v = data[k];
            this._promptSilverGetHelper.addPrompt(v.money, v.crit);
        }
        if (data.length > 1) {
            this._scheduleShowPrompt = function () {
                this._commonButtonOnce.setEnabled(true);
                this._commonButton10Times.setEnabled(true);
                this.unschedule(this._scheduleShowPrompt);
                this._scheduleShowPrompt = null;
            };
            this.schedule(this._scheduleShowPrompt, 3.3);
        }
    }
    _onEventWelfareMoneyTreeOpenBox(event, id, message) {
        this.refreshData();
        this._showRewards(message);
    }
    _showRewards(message) {
        var awards = (message['awards']);
        if (awards) {
            G_Prompt.showAwards(awards);
        }
    }
    _onShakeOnceClick(sender) {
        var cost = G_UserData.getActivityMoneyTree().getShakeOnceCost();
        var [success] = LogicCheckHelper.enoughCash(cost, true);
        if (success) {
            G_UserData.getActivityMoneyTree().c2sActMoneyTree(MoneyTreeView.SHAKE_ONCE);
        }
    }
    _onShake10TimesClick(sender) {
        var cost = G_UserData.getActivityMoneyTree().getShake10TimesCost();
        var [success] = LogicCheckHelper.enoughCash(cost, true);
        if (success) {
            G_UserData.getActivityMoneyTree().c2sActMoneyTree(MoneyTreeView.SHAKE_10TIMES);
            this._commonButtonOnce.setEnabled(false);
            this._commonButton10Times.setEnabled(false);
        }
    }
    _onClickBox(sender) {
        var id = sender.getTag();
        var data = G_UserData.getActivityMoneyTree().getMoneyTreeBoxDataById(id);
        var status = G_UserData.getActivityMoneyTree().isBoxCanReceived(id);
        if (status == CommonConst.BOX_STATUS_NOT_GET || status == CommonConst.BOX_STATUS_ALREADY_GET) {
            // var popupBoxReward = new (require('PopupBoxReward'))(Lang.get('lang_activity_moneytree_box_title'), null);
            // popupBoxReward.updateUI(data.getRewards());
            // popupBoxReward.setBtnText(status == CommonConst.BOX_STATUS_NOT_GET && Lang.get('get_box_reward') || Lang.get('got_star_box'));
            // popupBoxReward.setBtnEnable(false);
            // popupBoxReward.setDetailText('');
            // popupBoxReward.openWithAction();
            return;
        }
        if (ActivityDataHelper.checkPackBeforeGetActReward(data)) {
            G_UserData.getActivityMoneyTree().c2sActMoneyTreeBox(id);
        }
    }
    _refreshOnceBaseSilverView(silver) {
        if (this._baseSilverRichText) {
            this._baseSilverRichText.node.destroy();
        }
        var richText = Lang.get('lang_activity_moneytree_base_silver', { silver: silver });
        var widget = RichTextExtend.createWithContent(richText);
        this._nodeSilverOnce.addChild(widget.node);
        this._baseSilverRichText = widget;
    }
    _refresh10TimesBaseSilverView(silver) {
        if (this._base10TimesSilverRichText) {
            this._base10TimesSilverRichText.node.destroy();
        }
        var richText = Lang.get('lang_activity_moneytree_base_silver', { silver: silver });
        var widget = RichTextExtend.createWithContent(richText);
        this._nodeSilver10Times.addChild(widget.node);
        this._base10TimesSilverRichText = widget;
    }
    _refreshTimesView() {
    }
    refreshData() {
        var times = G_UserData.getActivityMoneyTree().getNum();
        var freeTimes = G_UserData.getActivityMoneyTree().getFree_num();
        if (freeTimes >= this._totalFreeCount) {
            this._commonResourceInfoOnce.setVisible(true);
            this._freeCount.node.active = (false);
            var cfg = G_UserData.getActivityMoneyTree().getActSilverCfgByTime(times + 1);
            if (cfg) {
                var roleParam = G_UserData.getActivityMoneyTree().getRoleParam();
                var silver = cfg.basic_silver * roleParam / 1000;
                this._refreshOnceBaseSilverView(silver);
                this._commonResourceInfoOnce.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cfg.cost);
                this._commonResourceInfoOnce.setTextColor(Colors.uiColors.THIN_YELLOW);
                this._commonResourceInfoOnce.showResName(false);
            }
        } else {
            this._commonResourceInfoOnce.setVisible(false);
            this._freeCount.node.active = (true);
            this._freeCount.string = (this._totalFreeCount - freeTimes).toString();
        }
        this._commonResourceInfo10Times.setVisible(true);
        var cfg = G_UserData.getActivityMoneyTree().getActSilverCfgByTime(times + 1);
        if (cfg) {
            var roleParam = G_UserData.getActivityMoneyTree().getRoleParam();
            var silver = cfg.basic_silver * roleParam / 1000 * 10;
            this._refresh10TimesBaseSilverView(silver);
            this._commonResourceInfo10Times.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, cfg.cost * 10);
            this._commonResourceInfo10Times.setTextColor(Colors.uiColors.THIN_YELLOW);
            this._commonResourceInfo10Times.showResName(false);
        }
    }
    _refreshBoxItemView(node, data) {
        // var text = ccui.Helper.seekNodeByName(node, 'Text');
        // text.setString(Lang.get('lang_activity_moneytree_box_time', { time: data.getConfig().count }));
        // node.ignoreContentAdaptWithSize(true);
        // node.setTouchEnabled(true);
        // node.removeChildByName('EffectGfxNode');
        // var times = G_UserData.getActivityMoneyTree().getNum();
        // if (data.isReceived()) {
        //     var img = Path.getCommonIcon('common', MoneyTreeView.BOX_IMG.received);
        //     node.loadTexture(img);
        // } else if (data.getConfig().count <= times) {
        //     var img = Path.getCommonIcon('common', MoneyTreeView.BOX_IMG.open);
        //     node.loadTexture(img);
        //     var EffectGfxNode = require('EffectGfxNode');
        //     var subEffect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_boxflash', null, null, false);
        //     subEffect.setName('EffectGfxNode');
        // } else {
        //     var img = Path.getCommonIcon('common', MoneyTreeView.BOX_IMG.close);
        //     node.loadTexture(img);
        // }
    }
    _initBoxView() {
        var boxDataArr = G_UserData.getActivityMoneyTree().getAllMoneyTreeBoxDatas();
        for (let k in boxDataArr) {
            var boxData = boxDataArr[k];
            // var Image_box = ccui.Helper.seekNodeByName(this._nodeBox, 'Image_box_' + (k));
            // if (Image_box) {
            //     Image_box.setTag(boxData.getId());
            //     this._refreshBoxItemView(Image_box, boxData);
            //     Image_box.addClickEventListenerEx(handler(this, this._onClickBox));
            // }
        }
    }
    _refreshBoxView() {
        var boxDataArr = G_UserData.getActivityMoneyTree().getAllMoneyTreeBoxDatas();
        for (let k in boxDataArr) {
            // var boxData = boxDataArr[k];
            // var Image_box = ccui.Helper.seekNodeByName(this._nodeBox, 'Image_box_' + tostring(k));
            // var Image_line = ccui.Helper.seekNodeByName(Image_box, 'Image_line');
            // if (Image_box) {
            //     this._refreshBoxItemView(Image_box, boxData);
            // }
            // var times = G_UserData.getActivityMoneyTree().getNum();
            // var showLine = boxData.getConfig().count <= times;
            // if (Image_line) {
            //     Image_line.setVisible(showLine);
            // }
        }
    }
    _refreshBoxAndProgress() {
        // var textTimes = ccui.Helper.seekNodeByName(this._nodeBox, 'Text_times');
        // var loadingBar = ccui.Helper.seekNodeByName(this._nodeBox, 'LoadingBar');
        // var times = G_UserData.getActivityMoneyTree().getNum();
        // var maxTimes = G_UserData.getActivityMoneyTree().getMaxCount();
        // textTimes.setString(tostring(times));
        // loadingBar.setPercent(math.ceil(times * 100 / maxTimes));
        // this._refreshBoxView();
    }

}