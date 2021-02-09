import CommonListItem from "../../../ui/component/CommonListItem";
import { Path } from "../../../utils/Path";
import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CampRaceRankCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBG: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    updateUI(index, data) {
        index++;
        if (index % 2 == 1) {
            this._imageBG.node.active = (false);
        } else {
            this._imageBG.node.active = (true);
        }
        if (index >= 1 && index <= 3) {
            var flag = Path.getArenaUI('img_qizhi0' + index);
            UIHelper.loadTexture(this._imageRank, flag);
            this._imageRank.node.active = (true);
            this._textRank.node.active = (false);
        } else if (index >= 4 && index <= 8) {
            var flag = Path.getArenaUI('img_qizhi04');
            UIHelper.loadTexture(this._imageRank, flag);
            this._imageRank.node.active = (true);
            this._textRank.node.active = (true);
            this._textRank.string = (index);
            this._textRank.node.color = (Colors.getCampWhite());
            UIHelper.enableOutline(this._textRank, Colors.getCampBrownOutline());
        } else {
            this._imageRank.node.active = (false);
            this._textRank.node.active = (true);
            this._textRank.string = (index);
            this._textRank.node.color = (Colors.getCampBrown());
            UIHelper.disableOutline(this._textRank);;
        }
        if (data) {
            this._textName.string = data.getName();
            this._textName.node.color = Colors.getOfficialColor(data.getOfficer_level());
            this._textPoint.string = (data.getScore());
        }
    }
}