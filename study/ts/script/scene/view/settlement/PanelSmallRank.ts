import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PanelSmallRank extends cc.Component {
    @property({ type: cc.Label, visible: true })
    _rankTitle: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _oldRank: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _newRank: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageRes: cc.Sprite = null;

    public updateUI(rankName, oldRank, newRank, imageRes, defaultString) {
        this._rankTitle.string = rankName;
        if (defaultString) {
            this._oldRank.string = defaultString;
        }
        if (oldRank != 0) {
            this._oldRank.string = oldRank.toString();
        }
        this._newRank.string = newRank;

        this._imageRes.node.active = false;
        if (imageRes != null) {
            this._imageRes.node.active = true;
            UIHelper.loadTexture(this._imageRes, imageRes);
            this._rankTitle.node.x = -45;
        }
    }

    setString(str) {
        this._oldRank.string = str;
    }
}