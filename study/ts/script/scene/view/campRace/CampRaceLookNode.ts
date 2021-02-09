import { handler } from "../../../utils/handler";

import { CampRaceConst } from "../../../const/CampRaceConst";

import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRaceLookNode extends cc.Component {
    _pos1: any;
    _pos2: any;
    _callback: any;
    _state: number;
    _imageBg: any;
    _imageSign: any;
    ctor(pos1, pos2, callback) {
        this._pos1 = pos1;
        this._pos2 = pos2;
        this._callback = callback;
        this._state = 0;
        this._imageBg = this.node.getChildByName('ImageBg');
        UIHelper.addEventListenerToNode(this.node, this._imageBg, 'CampRaceLookNode', '_onClick');
        this._imageSign = this.node.getChildByName('ImageSign').getComponent(cc.Sprite);
    }
    updateUI(state) {
        this._state = state;
        if (state == CampRaceConst.MATCH_STATE_BEFORE) {
            UIHelper.loadTexture(this._imageSign, Path.getCampImg('img_camp_player03c2'));
            UIHelper.setNodeTouchEnabled(this._imageBg, false);
        } else if (state == CampRaceConst.MATCH_STATE_ING) {
            UIHelper.loadTexture(this._imageSign, Path.getCampImg('img_camp_player03c1'));
            UIHelper.setNodeTouchEnabled(this._imageBg, true);
        } else if (state == CampRaceConst.MATCH_STATE_AFTER) {
            UIHelper.loadTexture(this._imageSign, Path.getCampImg('img_camp_player03c'));
            UIHelper.setNodeTouchEnabled(this._imageBg, true);
        }
    }
    _onClick() {
        if (this._callback) {
            this._callback(this._pos1, this._pos2, this._state);
        }
    }
}