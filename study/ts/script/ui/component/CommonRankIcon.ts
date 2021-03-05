import UIHelper from "../../utils/UIHelper";
import { Path } from "../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonRankIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    public setRank(rank) {
        this._textRank.node.active = false;
        UIHelper.loadTexture(this._imageRankBG, Path.getArenaUI('img_qizhi0' + rank));
        UIHelper.loadTexture(this._imageRank,Path.getComplexRankUI('txt_ranking0' + rank));
    }

    public setRankType2(rank) {
        if (rank <= 3 && rank > 0) {
            this._textRank.node.active = false;
            UIHelper.loadTexture(this._imageRankBG, Path.getArenaUI('img_qizhi0' + rank));
        } else {
            UIHelper.loadTexture(this._imageRankBG, Path.getArenaUI('img_qizhi04'));
            this._imageRank.node.active = false;
            this._textRank.node.active = true;
            this._textRank.string = (rank);
        }
    }

    public setRankType4(rank) {
        if (rank <= 3 && rank > 0) {
            this._textRank.node.active = false;
            this._imageRankBG.node.active = true;
            UIHelper.loadTexture(this._imageRankBG, Path.getArenaUI('img_qizhi0' + rank));
        } else {
            this._imageRankBG.node.active = false;
            this._imageRank.node.active = false;
            this._textRank.node.active = true;
            this._textRank.string = (rank);
        }
    }

    public setRankType3(rank) {
        this._imageRankBG.node.active = false;
        this._imageRank.node.active = false;
        this._textRank.node.active = true;
        this._textRank.string = (rank);
    }
}