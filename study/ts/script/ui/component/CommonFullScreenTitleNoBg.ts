const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonFullScreenTitleNoBg extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    setTitle(title: string) {
        if (title) {
            this._textTitle.string = title;
        }
    }

}