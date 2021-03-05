const {ccclass, property} = cc._decorator;

@ccclass
export default class CommoRedPointNumBig extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRedPoint: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    showNum(value:number){
        this._textNum.string = value.toString();
    }

}
