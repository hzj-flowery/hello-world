import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SiegeNameNode extends cc.Component {
    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textLevel: cc.Label = null;

    public updateUI(data, level) {
        this._textName.string = (data.name);
        var quality = data.color;
        this._textName.node.color = (Colors.getColor(quality));
        UIHelper.enableOutline(this._textName, Colors.getColorOutline(quality), 2);
        this._textLevel.string = (Lang.get('siege_come_level', { count: level }));
    }
}