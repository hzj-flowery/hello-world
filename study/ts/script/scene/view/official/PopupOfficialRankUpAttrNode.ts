const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupOfficialRankUpAttrNode extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textValue: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;
    
    updateLabel(subName: string, value: string) {

    }
    updateImageView(subName: string, value: string) {
    }
}