const {ccclass, property} = cc._decorator;

import { ActivityConst } from '../../../../const/ActivityConst';
import { RichTextExtend } from '../../../../extends/RichTextExtend';
import { Colors, G_UserData } from '../../../../init';
import { Lang } from '../../../../lang/Lang';
import CommonButtonSwitchLevel1 from '../../../../ui/component/CommonButtonSwitchLevel1';
import CommonIconTemplate from '../../../../ui/component/CommonIconTemplate';
import CommonListViewLineItem from '../../../../ui/component/CommonListViewLineItem';
import ListViewCellBase from '../../../../ui/ListViewCellBase';
import { UserDataHelper } from '../../../../utils/data/UserDataHelper';
import { LogicCheckHelper } from '../../../../utils/LogicCheckHelper';
import { Path } from '../../../../utils/Path';
import UIHelper from '../../../../utils/UIHelper';



var GIFT_PKG_TITLE_IMG = [
    'img_onechaozhilibao',
    'img_sanchaozhilibao',
    'img_liuchaozhilibao'
];

@ccclass
export default class LuxuryGiftPkgItemCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeIcon: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate3: CommonIconTemplate = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _commonListViewItem: CommonListViewLineItem = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _commonButtonMediumNormal: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textItemName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageItemName: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCondition1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCondition2: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageReceive: cc.Sprite = null;


    _conditionRichTextArr: any;

    static REWARD_RMB_SCALE = 10;


    ctor() {
        this._conditionRichTextArr = {};
        UIHelper.addEventListener(this.node, this._commonButtonMediumNormal._button, 'LuxuryGiftPkgItemCell', '_onClickBuyBtn');
    }
    onCreate() {
        this.ctor();
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._imageReceive.node.active = (false);
    }
    _onClickBuyBtn() {
        var curSelectedPos = this.getTag();
        //logWarn('LuxuryGiftPkgItemCell:_onIconClicked  ' + curSelectedPos);
        this.dispatchCustomCallback(curSelectedPos);
    }
    _createConditionRichText(richText, index) {
        if (this._conditionRichTextArr[index]) {
            (this._conditionRichTextArr[index] as cc.Node).destroy();
        }
        var widget = RichTextExtend.createWithContent(richText);
        widget.node.setAnchorPoint(cc.v2(0.5, 0.5));
        this['_nodeCondition' + index].addChild(widget.node);
        this._conditionRichTextArr[index] = widget.node;
    }
    updateUI(vipPayCfg, index) {
        //logWarn(' HHH---------  ' + index);
        var unitDataList = G_UserData.getActivityLuxuryGiftPkg().getUnitDatasByPayType(index+1);
        var actLuxuryGiftPkgUnitData = unitDataList[0];
        var cfg = actLuxuryGiftPkgUnitData.getConfig();
        var vipConfig = actLuxuryGiftPkgUnitData.getVipConfig();
        var remainBuyTime = actLuxuryGiftPkgUnitData.getRemainBuyTime();
        var enabled = remainBuyTime > 0;
        var rewards = UserDataHelper.makeRewards(cfg, 3);
        var showRewards = UserDataHelper.makeRewards(cfg, 3, 'show_');
        var canReceive = G_UserData.getActivityLuxuryGiftPkg().isCanReceiveGiftPkg();
        var commonIconTemplateList = this._nodeIcon.children;
        for (let k in commonIconTemplateList) {
            var v = commonIconTemplateList[k];
            if (rewards[k]) {
                v.active = (true);
                var comp = v.getComponent(CommonIconTemplate);
                comp.unInitUI();
                comp.initUI(rewards[k].type, rewards[k].value, rewards[k].size);
                comp.setTouchEnabled(true);
            } else {
                v.active = (false);
            }
        }
        this._commonListViewItem.setItemSpacing(4);
        this._commonListViewItem.updateUI(showRewards, null, true);
        this._commonListViewItem._listViewItem.enabled = false;
        //this._commonListViewItem.alignCenter();
        this._textItemName.string = (vipConfig.name);
        UIHelper.loadTexture(this._imageItemName, Path.getActivityTextRes(GIFT_PKG_TITLE_IMG[index]));
        this._commonButtonMediumNormal.setVisible(true);
        var richText = Lang.get('lang_activity_luxurygiftpkg_intro_01', { value: vipConfig.gold });
        if (LogicCheckHelper.enoughOpenDay(ActivityConst.ACT_DAILY_LIMIT_OPEN_DAY) == false) {
            this._createConditionRichText(richText, 1);
            var richText2 = Lang.get('lang_activity_luxurygiftpkg_intro_02', { value: vipConfig.rmb * LuxuryGiftPkgItemCell.REWARD_RMB_SCALE });
            this._createConditionRichText(richText2, 2);
        } else {
            this._createRichItems(index+1);
        }
        if (!enabled) {
            this._commonButtonMediumNormal.setString(Lang.get('common_already_buy'));
            this._commonButtonMediumNormal.switchToHightLight();
        } else if (canReceive) {
            this._commonButtonMediumNormal.setString(Lang.get('common_receive'));
            this._commonButtonMediumNormal.switchToHightLight();
        } else {
            this._commonButtonMediumNormal.setString(Lang.get('lang_activity_luxurygiftpkg_buy', { value: vipConfig.rmb }));
            this._commonButtonMediumNormal.switchToNormal();
        }
        this._commonButtonMediumNormal.setEnabled(enabled);
    }
    _createRichItems(index) {
        var unitDataList = G_UserData.getActivityLuxuryGiftPkg().getUnitDatasByPayType(index);
        var actLuxuryGiftPkgUnitData = unitDataList[0];
        var cfg = actLuxuryGiftPkgUnitData.getConfig();
        var paramList = {
            1: {
                type: 'label',
                name: 'desText',
                text: Lang.get('lang_activity_luxurygiftpkg_intro_02_1'),
                fontSize: 18,
                color: Colors.NORMAL_BG_ONE,
                anchorPoint: cc.v2(0, 0.5)
            },
            2: {
                type: 'image',
                name: 'gold',
                texture: Path.getResourceMiniIcon(cfg.value_4),
                anchorPoint: cc.v2(0, 0.5)
            },
            3: {
                type: 'label',
                name: 'value',
                text: cfg.size_4,
                fontSize: 18,
                color: Colors.BRIGHT_BG_GREEN,
                anchorPoint: cc.v2(0, 0.5)
            }
        };
        if (this._conditionRichTextArr[index]) {
            this._conditionRichTextArr[index].destroy();
        }
        var node = UIHelper.createRichItems(paramList, false);
        //node.setPosition(cc.v2(-60, -2));
        node.setAnchorPoint(0,0.5);
        var widget = node.addComponent(cc.Widget);
        widget.isAlignHorizontalCenter = true;
        widget.horizontalCenter = 0;
        var totalWidth = 0;
        var desText = node.getChildByName('desText').getComponent(cc.Label);
        desText['_updateRenderData'](true);
        totalWidth += desText.node.width+4;
        var gold = node.getChildByName('gold');
        //gold.ignoreContentAdaptWithSize(false);
        gold.setContentSize(cc.size(25, 25));
      //  gold.x = totalWidth;
        totalWidth += gold.width+4;
        //gold.setScale(0.5,0.5);
        //gold.y = (gold.y - 3);

        var value = node.getChildByName('value');
        value.x = totalWidth;
        var comp = value.getComponent(cc.Label);
        comp['_updateRenderData'](true);
        totalWidth += value.width;
        node.setContentSize(totalWidth, this._nodeCondition2.height);
        node.x = this._nodeCondition2.width/2 - node.width / 2;
        node.y = 0;
        this._nodeCondition2.addChild(node);
        this._conditionRichTextArr[index] = node;
    }   

}
