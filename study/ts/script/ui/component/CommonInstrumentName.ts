import UIHelper from "../../utils/UIHelper";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonInstrumentName extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    onLoad(): void {
        this._imageBg.node.active = (false);
    }

    setName(instrumentId, rank, limitLevel) {
        var instrumentParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_INSTRUMENT, instrumentId, null, null, limitLevel);
        var instrumentName = instrumentParam.name;
        if (rank && rank > 0) {
            instrumentName = instrumentName + ('+' + rank);
        }
        this._textName.string = (instrumentName);
        this._textName.node.color = (instrumentParam.icon_color);
        UIHelper.updateTextOutline(this._textName, instrumentParam);
        this._imageBg.node.active = (true);
    }
    setFontSize(size) {
        this._textName.fontSize = (size);
    }
    disableOutline() {
        this._textName.node.removeComponent(cc.LabelOutline)
    }
    showTextBg(bShow) {
        this._imageBg.node.active = (bShow);
    }

}