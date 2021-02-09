const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHomelandUpAttrNode extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    Text_name: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    Text_value: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    Node_next: cc.Node = null;  
    @property({
        type: cc.Node,
        visible: true
    })
    Node_up: cc.Node = null;  
    @property({
        type: cc.Label,
        visible: true
    })
    TextAddValue: cc.Label = null;

    updateLabel(name, param) {
        if (param.text) {
            this[name].string = param.text;
        }
        if (param.color) {
            this[name].node.color = param.color;
        }
       
    }
}