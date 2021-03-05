import { Colors } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelCampPlayers extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _playerLeft: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _playerRight: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLeft: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageRight: cc.Sprite = null;

    public updateUI(battleData) {
        this._playerLeft.string = (battleData.leftName);
        this._playerLeft.node.color = (Colors.getOfficialColor(battleData.leftOfficer));
        this._playerRight.string = (battleData.rightName);
        this._playerRight.node.color = (Colors.getOfficialColor(battleData.rightOfficer));
        if (battleData.winPos == 1) {
            UIHelper.loadTexture( this._imageLeft,Path.getTextSignet('txt_shengli01'));
            UIHelper.loadTexture( this._imageRight,Path.getTextSignet('txt_lose01'));
        } else {
            UIHelper.loadTexture( this._imageLeft,Path.getTextSignet('txt_lose01'));
            UIHelper.loadTexture( this._imageRight,Path.getTextSignet('txt_shengli01'));
        }
    }
}