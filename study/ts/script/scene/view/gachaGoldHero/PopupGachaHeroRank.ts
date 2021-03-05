const {ccclass, property} = cc._decorator;

import CommonEmptyListNode from '../../../ui/component/CommonEmptyListNode'

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupGachaHeroRank extends cc.Component {

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({
        type: CommonEmptyListNode,
        visible: true
    })
    _nodeEmpty: CommonEmptyListNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _scrollView: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _ownRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textOwnPoint: cc.Label = null;

}
