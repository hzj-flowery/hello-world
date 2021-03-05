import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildDungeonFightRecordNode extends cc.Component {


    @property({
        type: cc.Sprite,
        visible: true
    })
    _ImageWin: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _TextName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _NoChanllenge: cc.Label = null;

    updateView(isWin, name, nameColor, colorOutline) {
        this._ImageWin.node.active = (true);
        this._TextName.node.active = (true);
        this._NoChanllenge.node.active = (false);
        UIHelper.loadTexture(this._ImageWin, isWin ? Path.getTextSignet('txt_battle01_win') : Path.getTextSignet('txt_battle01_lose'));
        this._TextName.string = (name);
        this._TextName.node.color = (nameColor);
        if (colorOutline) {
            UIHelper.enableOutline(this._TextName, colorOutline, 2);
        } else {
            UIHelper.disableOutline(this._TextName);
        }
    }

    updateToEmptyRecordView() {
        this._ImageWin.node.active = (false)
        this._TextName.node.active = (false)
        this._NoChanllenge.node.active = (true)
    }


}