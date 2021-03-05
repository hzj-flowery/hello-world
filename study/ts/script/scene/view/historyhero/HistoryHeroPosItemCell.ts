const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroPosItemCell extends cc.Component {
    @property({type: cc.Node,visible: true})
    _panelDesign: cc.Node = null;
}