import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

var CAMP2RES = {
    [1]: 'img_com_camp08',
    [2]: 'img_com_camp05',
    [3]: 'img_com_camp07',
    [4]: 'img_com_camp06'
};

@ccclass
export default class CampRaceCountryNode extends cc.Component {
    @property({ type: cc.Sprite, visible: true })
    _imageCamp: cc.Sprite = null;
    @property({ type: cc.Sprite, visible: true })
    _imageHighLight: cc.Sprite = null;

    _camp: any;
    _callback: any;

    ctor(camp, callback) {
        this._camp = camp;
        this._callback = callback;
        var res = Path.getTextSignet(CAMP2RES[camp]);
        UIHelper.loadTexture(this._imageCamp, res);
        this._imageHighLight.node.active = (false);
    }
    setSelected(selected) {
        this._imageHighLight.node.active = (selected);
    }
    onClick() {
        if (this._callback) {
            this._callback(this._camp);
        }
    }
}