const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildLogTimeTitle extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text: cc.Label = null;


    updateLabel(str: string) {
        this._text.string = str;
    }

    getSize() {
        return new cc.Size(this._resourceNode.width, this._resourceNode.height);
    }


}