const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonEditBox extends cc.Component {
    @property({
        type: cc.EditBox,
        visible: true
    })
    _editBox: cc.EditBox = null;

    singleLineEditBoxDidBeginEditing(sender) {
        //cc.log(sender.node.name + " single line editBoxDidBeginEditing");
    }

    singleLineEditBoxDidChanged(text, sender) {
        //cc.log(sender.node.name + " single line editBoxDidChanged: " + text);
    }

    singleLineEditBoxDidEndEditing(sender) {
        //cc.log(sender.node.name + " single line editBoxDidEndEditing: " + this._editBox.string);
    }

}
