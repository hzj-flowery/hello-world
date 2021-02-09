const { ccclass, property } = cc._decorator;


var DEFAULT_PARAM = {
    maxWidth: 300,
    gapExchange: 110,
    gap: 90,
    gapAdd: 95,
    gapOr: 95
};

import { CustomActivityConst } from '../../const/CustomActivityConst';
import CommonIconTemplate from './CommonIconTemplate';

@ccclass
export default class CommonItemListExchangeNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeExchange: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollViewSrc: cc.ScrollView = null;


    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _nodeOr: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeAdd: cc.Sprite = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _hScrollBar: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _bar: cc.Sprite = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollViewDst: cc.ScrollView = null;

    private _gapParams: any;
    private _scrollViewList: Array<cc.ScrollView>;
    private _commonIconTemplateList: Array<any>;
    private _nodeOrList: any;
    private _nodeAddList: any;
    private _templateSize: cc.Size;

    onLoad() {
        this._gapParams = DEFAULT_PARAM;
        this._init();
    }
    _init() {
        this._scrollViewList = [
            this._scrollViewSrc,
            this._scrollViewDst
        ];
        this._commonIconTemplateList = [
            [this._commonIconTemplate],
            {}
        ];
        this._nodeOrList = {};
        this._nodeAddList = {};
        this._nodeOrList[2] = {};
        this._nodeOrList[2][1] = this._nodeOr;
        this._nodeAddList[2] = {};
        this._nodeAddList[2][1] = this._nodeAdd;
        this._scrollViewDst.enabled = true;
        this._scrollViewSrc.enabled = true;
        var size = this._scrollViewSrc.node.getContentSize();
        this._templateSize = cc.size(size.width, size.height);
    }
    _visibleAllRewards(visible) {
        for (var k1 in this._commonIconTemplateList) {
            var v1 = this._commonIconTemplateList[k1];
            for (var k in v1) {
                var v = v1[k] as CommonIconTemplate;
                v.node.active = (visible);
            }
        }
        for (k1 in this._nodeOrList) {
            var vb = this._nodeOrList[k1];
            if (vb) {
                for (k in vb) {
                    var v2 = vb[k] as cc.Sprite;
                    v2.node.active = (visible);
                }
            }
        }
        for (k1 in this._nodeAddList) {
            var va = this._nodeAddList[k1];
            if (va) {
                for (k in va) {
                    var v3 = va[k] as cc.Sprite;
                    v3.node.active = (visible);
                }
            }
        }
    }
    _getCommonIconTemplate(type, index): CommonIconTemplate {
        var commonIconTemplate = this._commonIconTemplateList[type][index];
        if (!commonIconTemplate) {
            commonIconTemplate = (cc.instantiate(this._commonIconTemplate.node) as cc.Node).getComponent(CommonIconTemplate);
            this._scrollViewList[type].content.addChild(commonIconTemplate.node);
            this._commonIconTemplateList[type][index] = commonIconTemplate;
        }
        return commonIconTemplate;
    }
    _getNodeOr(type, index): cc.Node {
        if (this._nodeOrList[type] == null)
            this._nodeOrList[type] = {};
        var node = this._nodeOrList[type][index];
        if (!node) {
            node = (cc.instantiate(this._nodeOr.node) as cc.Node).getComponent(cc.Label);
            this._scrollViewList[type - 1].content.addChild(node.node);
            node.node.active = (false);
            this._nodeOrList[type][index] = node;
        }
        return node.node;
    }
    _getNodeAdd(type, index): cc.Node {
        if (this._nodeAddList[type] == null)
            this._nodeAddList[type] = {};

        var node = this._nodeAddList[type][index];
        if (!node) {
            node = (cc.instantiate(this._nodeAdd.node) as cc.Node).getComponent(cc.Sprite);
            this._scrollViewList[type - 1].content.addChild(node.node);
            node.node.active = (false);
            this._nodeAddList[type][index] = node;
        }
        return node.node;
    }
    _updateRewards(srcRewards, srcRewardsTypes, rewards, rewardsTypes) {
        this._visibleAllRewards(false);
        this._updateSubRewards(1, srcRewards, srcRewardsTypes);
        this._updateSubRewards(2, rewards, rewardsTypes);
        var srcScrollView = this._scrollViewList[0];
        var srcScrollViewSize = srcScrollView.content.getContentSize();
        var dstScrollView = this._scrollViewList[1];
        var dstScrollViewSize = dstScrollView.content.getContentSize();
        var templateSize = this._templateSize;
        var templateWidth = templateSize.width;
        var totalWidth = srcScrollViewSize.width + dstScrollViewSize.width + this._gapParams.gapExchange - templateWidth;
        if (totalWidth > this._gapParams.maxWidth) {
            cc.warn('-------------');
            cc.log(dstScrollViewSize);
            var tempSize = cc.size(dstScrollViewSize.width, dstScrollViewSize.height);
            dstScrollViewSize.width = this._gapParams.maxWidth - (srcScrollViewSize.width + this._gapParams.gapExchange - templateWidth);
            cc.log(dstScrollViewSize);
            cc.warn('-------------');
            dstScrollView.node.setContentSize(dstScrollViewSize);
            dstScrollView.content.setContentSize(tempSize);
            srcScrollView.content.setContentSize(srcScrollViewSize);
            totalWidth = this._gapParams.maxWidth;
        } else {
            dstScrollView.node.setContentSize(dstScrollViewSize);
            dstScrollView.content.setContentSize(dstScrollViewSize);
            srcScrollView.content.setContentSize(srcScrollViewSize);
        }
        srcScrollView.node.setAnchorPoint(new cc.Vec2(1, 0.5));
        srcScrollView.node.setPosition(totalWidth - templateWidth * 0.5, 0);
        dstScrollView.node.setAnchorPoint(new cc.Vec2(0, 0.5));
        dstScrollView.node.setPosition(-templateWidth * 0.5, 0);
        this._nodeExchange.node.x = (totalWidth - templateWidth * 0.5 - srcScrollViewSize.width + templateWidth * 0.5 - this._gapParams.gapExchange * 0.5);

        this._scrollViewDst.enabled = false;
        this._scrollViewSrc.enabled = false;
    }
    _updateSubRewards(type, rewards, rewardsTypes) {
        var startPositionX = 0;
        var lastRewardType = null;
        var nodeOrCount = 0;
        var nodeAddCount = 0;
        var rewardNum = Math.min(rewards.length, rewardsTypes.length);
        var size = this._scrollViewList[type - 1].node.getContentSize();
        var templateSize = this._templateSize;
        var halfTemplateWidth = templateSize.width * 0.5;
        startPositionX = halfTemplateWidth;
        size.width = 0;
        for (var i = 1; i <= rewardNum; i += 1) {
            var reward = rewards[i - 1];
            var rewardType = rewardsTypes[i - 1];
            var commonIconTemplate = this._getCommonIconTemplate(type - 1, i);
            commonIconTemplate.node.active = (true);
            commonIconTemplate.unInitUI();
            commonIconTemplate.initUI(reward.type, reward.value, reward.size);
            commonIconTemplate.setTouchEnabled(true);
            commonIconTemplate.showCount(true);
            commonIconTemplate.node.y = -(templateSize.height * 0.5);
            if (lastRewardType) {
                var gap = 0;
                var node = null;
                if (rewardType != lastRewardType) {
                    nodeAddCount = nodeAddCount + 1;
                    node = this._getNodeAdd(type, nodeAddCount);
                    gap = this._gapParams.gapAdd;
                } else if (lastRewardType == CustomActivityConst.REWARD_TYPE_SELECT) {
                    nodeOrCount = nodeOrCount + 1;
                    node = this._getNodeOr(type, nodeOrCount);
                    gap = this._gapParams.gapOr;
                } else if (rewardType == CustomActivityConst.REWARD_TYPE_ALL) {
                    gap = this._gapParams.gap;
                }
                var positionX = startPositionX + gap;
                if (node) {
                    node.active = (true);
                    node.x = ((startPositionX + positionX) / 2);
                    node.zIndex = 1000;
                }
                commonIconTemplate.node.x = (positionX);
                startPositionX = positionX;
            } else {
                commonIconTemplate.node.x = (startPositionX);
            }
            lastRewardType = rewardType;
        }
        size.width = startPositionX + halfTemplateWidth;
        this._scrollViewList[type - 1].content.setContentSize(size);
    }
    updateInfo(srcRewards, srcRewardsTypes, dstRewards, dstRewardTypes) {
        this._updateRewards(srcRewards, srcRewardsTypes, dstRewards, dstRewardTypes);
    }
    setGaps(gap, gapAdd, gapOr, gapExchange, maxWidth) {
        this._gapParams.maxWidth = maxWidth;
        this._gapParams.gap = gap;
        this._gapParams.gapAdd = gapAdd;
        this._gapParams.gapOr = gapOr;
        this._gapParams.gapExchange = gapExchange;
    }


}