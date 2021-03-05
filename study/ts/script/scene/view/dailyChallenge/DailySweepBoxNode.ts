import { ComponentIconHelper } from "../../../ui/component/ComponentIconHelper";
import CommonIconBase from "../../../ui/component/CommonIconBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DailySweepBoxNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _nodeBG2: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeItem: cc.Node = null;

    private static HEIGHT_FIX = 0;
    private static ITEM_GAP = 30;
    private _rewards;
    private _title;
    public init(rewards, title) {
        this._rewards = rewards;
        this._title = title;
    }
    onLoad() {
        var size = this._nodeBG2.node.getContentSize();
        this.node.setContentSize(size.width, size.height + DailySweepBoxNode.HEIGHT_FIX);
        this._textTitle.string = (this._title);
        this._nodeBG2.node.active = (true);
        var rewardsNode = new cc.Node();
        var itemWidgets = this._updateAwards(rewardsNode, this._rewards, DailySweepBoxNode.ITEM_GAP);
        this._nodeItem.addChild(rewardsNode);
    }
    _updateAwards(rewardParentNodes, awards: any[], gap) {
        var itemScale = 0.8;
        var itemWidgets = {};
        var maxCol = awards.length;
        var commonTemSize = new cc.Size(0, 0);
        for (let i = 0; i < awards.length; i++) {
            var award = awards[i];
            var itemNode: cc.Node = ComponentIconHelper.createIcon(award.type, award.value, award.size);
            let iconBase: CommonIconBase = itemNode.getComponent(CommonIconBase);
            var itemSize = iconBase.getPanelSize();
            iconBase.showName(false);
            itemNode.setScale(itemScale);
            rewardParentNodes.addChild(itemNode);
            var x = (i) * itemSize.width * itemScale + (i) * gap;
            // itemNode.x = (x + itemSize.width * itemScale * 0.5);
            // itemNode.y = (itemSize.height * itemScale * 0.5);
            itemNode.x = x;
            itemNode.y = 0;
            itemWidgets[i] = itemNode;
            commonTemSize = itemSize;
        }
        var totalW = maxCol * commonTemSize.width * itemScale + Math.max(maxCol - 1, 0) * gap;
        var totalH = commonTemSize.height;
        rewardParentNodes.setContentSize(totalW, totalH);
        rewardParentNodes.setAnchorPoint(0.5, 0.5);
        rewardParentNodes.x = -totalW / 2 + commonTemSize.width / 2
        return itemWidgets;
    }
}