const {ccclass, property} = cc._decorator;

@ccclass
export default class BreakResultTalentDesNode extends cc.Component {
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    ImageButtomLine: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    TextTalentDes: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    TextTalentName: cc.Label = null;

}