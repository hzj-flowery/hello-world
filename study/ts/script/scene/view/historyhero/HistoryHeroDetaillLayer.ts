const { ccclass, property } = cc._decorator;


@ccclass
export default class HistoryHeroDetaillLayer extends cc.Component {
    @property({type: cc.Node,visible: true})
    _panelDesign: cc.Node = null;
}