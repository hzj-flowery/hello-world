import CommonMiniChat from "../../../ui/component/CommonMiniChat";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonChatMiniNode extends cc.Component {
    @property({
        type:cc.Node,
        visible:true
    })
    _panelDanmu:cc.Node = null;

    getPanelDanmu():cc.Node{
        return this._panelDanmu;
    }
}
