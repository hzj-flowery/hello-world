const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupHomelandBreakUpAttrNode extends cc.Component {
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
    Node_up: cc.Node = null;  

    @property({
        type: cc.Label,
        visible: true
    })
    Text_next_value: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    Text_add_value: cc.Label = null; 
    
    updateLabel(name, param) {
        if (param.text != undefined) {
            this[name].string = param.text;
        }
        if (param.color != undefined) {
            this[name].node.color = param.color;
        }
        if (param.visible != undefined) {
            this[name].node.active = param.visible;
        }
       
    }
}