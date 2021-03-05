const {ccclass, property} = cc._decorator;

@ccclass
export default class ActiveJointDesNode extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _mageSkillIcon: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeDesPos: cc.Node = null;

     
}