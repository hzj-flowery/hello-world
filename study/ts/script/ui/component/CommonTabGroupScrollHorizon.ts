const { ccclass, property } = cc._decorator;

import CommonTabGroupHorizon from './CommonTabGroupHorizon'

@ccclass
export default class CommonTabGroupScrollHorizon extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _scrollViewTab: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;

    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _commonTabGroup: CommonTabGroupHorizon = null;

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


}