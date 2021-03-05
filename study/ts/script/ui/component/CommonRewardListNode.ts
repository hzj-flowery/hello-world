const { ccclass, property } = cc._decorator;


var DEFAULT_PARAM = {
    gap: 90,
    gapAdd: 95,
    gapOr: 95,
    scrollWidth: 626
};
import { CustomActivityConst } from '../../const/CustomActivityConst';
import CommonIconTemplate from './CommonIconTemplate';


@ccclass
export default class CommonRewardListNode extends cc.Component {

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _commonIconTemplate: CommonIconTemplate = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeAdd: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _nodeOr: cc.Label = null;

    private _gapParams: any;
    private _commonIconTemplateList: Array<CommonIconTemplate>;
    private _nodeOrList: Array<cc.Label>;
    private _nodeAddList: Array<cc.Sprite>;

    onLoad() {
        this._gapParams = DEFAULT_PARAM;
        this._init();
    }
    private _init() {
        this._scrollView.enabled = false;
        this._commonIconTemplateList = [this._commonIconTemplate];
        this._nodeOrList = [this._nodeOr];
        this._nodeAddList = [this._nodeAdd];
    }
    _visibleAllRewards(visible) {
        for (var k in this._commonIconTemplateList) {
            var v = this._commonIconTemplateList[k];
            v.node.active = (visible);
        }
        for (k in this._nodeOrList) {
            this._nodeOrList[k].node.active = (visible);
        }
        for (k in this._nodeAddList) {
            this._nodeAddList[k].node.active = (visible);
        }
    }
    _getCommonIconTemplate(index) {
        var commonIconTemplate = this._commonIconTemplateList[index - 1];
        if (!commonIconTemplate) {
            commonIconTemplate = (cc.instantiate(this._commonIconTemplate.node) as cc.Node).getComponent(CommonIconTemplate);
            this._commonIconTemplate.node.parent.addChild(commonIconTemplate.node);
            this._commonIconTemplateList[index - 1] = commonIconTemplate;
        }
        return commonIconTemplate;
    }
    _getNodeOr(index): cc.Label {
        var node = this._nodeOrList[index - 1];
        if (!node) {
            node = (cc.instantiate(this._nodeOr.node) as cc.Node).getComponent(cc.Label);
            this._nodeOr.node.parent.addChild(node.node);
            node.node.active = (false);
            this._nodeOrList[index - 1] = node;
        }
        return node;
    }
    _getNodeAdd(index): cc.Sprite {
        var node = this._nodeAddList[index - 1] as cc.Sprite;
        if (!node) {
            node = (cc.instantiate(this._nodeAdd.node) as cc.Node).getComponent(cc.Sprite);
            this._nodeAdd.node.addChild(node.node);
            node.node.active = (false);
            this._nodeAddList[index - 1] = node;
        }
        return node;
    }
    _updateRewards(rewards: Array<any>, rewardsTypes: Array<any>) {
        this._visibleAllRewards(false);
        var startPositionX = this._commonIconTemplate.node.x;
        var lastRewardType = null;
        var nodeOrCount = 0;
        var nodeAddCount = 0;
        var rewardNum = Math.min(rewards.length, rewardsTypes.length);
        for (var i = 1; i <= rewardNum; i += 1) {
            var reward = rewards[i - 1];
            var rewardType = rewardsTypes[i - 1];
            var commonIconTemplate = this._getCommonIconTemplate(i);
            commonIconTemplate.node.active = (true);
            commonIconTemplate.unInitUI();
            commonIconTemplate.initUI(reward.type, reward.value, reward.size);
            commonIconTemplate.setTouchEnabled(true);
            commonIconTemplate.showCount(true);
            if (lastRewardType) {
                var gap = 0;
                var node: cc.Node = null;
                if (rewardType != lastRewardType) {
                    nodeAddCount = nodeAddCount + 1;
                    node = this._getNodeAdd(nodeAddCount).node;
                    gap = this._gapParams.gapAdd;
                } else if (lastRewardType == CustomActivityConst.REWARD_TYPE_SELECT) {
                    nodeOrCount = nodeOrCount + 1;
                    node = this._getNodeOr(nodeOrCount).node;
                    gap = this._gapParams.gapOr;
                } else if (rewardType == CustomActivityConst.REWARD_TYPE_ALL) {
                    gap = this._gapParams.gap;
                }
                var positionX = startPositionX + gap;
                if (node) {
                    node.active = (true);
                    node.x = ((startPositionX + positionX) / 2);
                }
                commonIconTemplate.node.x = (positionX);

                startPositionX = positionX;
            }
            lastRewardType = rewardType;
        }
        var templateSize = this._commonIconTemplate.node.getContentSize();
        var size = this._scrollView.content.getContentSize();
        this._scrollView.content.x = (0);
        this._scrollView.content.setContentSize(cc.size(startPositionX + size.width, size.height));
        this._scrollView.node.setContentSize(cc.size(Math.min(this._gapParams.scrollWidth, startPositionX + size.width), size.height));
    }
    updateInfo(rewards: Array<any>, rewardTypes: Array<any>) {
        this._updateRewards(rewards, rewardTypes);
    }
    setGaps(gap, gapAdd, gapOr, scrollWidth?) {
        if (this._gapParams.gap) {
            this._gapParams.gap = gap;
        }
        this._gapParams.gapAdd = gapAdd;
        this._gapParams.gapOr = gapOr;
        if (scrollWidth) {
            this._gapParams.scrollWidth = scrollWidth;
        }
    }


}