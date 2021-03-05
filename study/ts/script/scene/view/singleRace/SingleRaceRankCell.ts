import CommonListItem from "../../../ui/component/CommonListItem";
import { SingleRaceConst } from "../../../const/SingleRaceConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

var RANK2COLOR = {
    [4]: {
        color: cc.color(255, 207, 171),
        outline: cc.color(183, 118, 65, 255)
    },
    [5]: {
        color: cc.color(255, 207, 171),
        outline: cc.color(183, 118, 65, 255)
    },
    [6]: {
        color: cc.color(255, 207, 171),
        outline: cc.color(183, 118, 65, 255)
    },
    [7]: {
        color: cc.color(216, 176, 163),
        outline: cc.color(117, 73, 56, 255)
    },
    [8]: {
        color: cc.color(216, 176, 163),
        outline: cc.color(117, 73, 56, 255)
    }
};

@ccclass
export default class SingleRaceRankCell extends CommonListItem {
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
        if (index % 2 == 1) {
            this._imageBG.node.active = (true);
        } else {
            this._imageBG.node.active = (false);
        }
        var rank = index + 1;
        if (data.type == SingleRaceConst.RANK_DATA_TYPE_1) {
            rank = data.getRank();
        }
        if (rank >= 1 && rank <= 3) {
            var flag = Path.getArenaUI('img_qizhi0' + rank);
            UIHelper.loadTexture(this._imageRank, flag);
            this._imageRank.node.active = (true);
            this._textRank.node.active = (false);
        } else {
            var flag = Path.getArenaUI('img_qizhi04');
            UIHelper.loadTexture(this._imageRank, flag);
            this._imageRank.node.active = (true);
            this._textRank.node.active = (true);
            this._textRank.string = (rank);
            var [color, outline] = this._getRankColorInfo(rank, data.type);
            this._textRank.node.color = (color);
            UIHelper.enableOutline(this._textRank, outline);
        }
        var color = this._getFontColor(rank, data.type);
        var [strDes, fontSize] = this._getStrAndFontSize(data);
        this._textName.fontSize = (fontSize as number);
        this._textPoint.fontSize = (fontSize as number);
        this._textName.string = (strDes as string);
        this._textPoint.string = (data.getSorce());
        this._textName.node.color = (color);
        this._textPoint.node.color = (color);
    }
    _getStrAndFontSize(data) {
        var strDes = '';
        var fontSize = 20;
        if (data.type == SingleRaceConst.RANK_DATA_TYPE_1) {
            strDes = data.getServer_name();
        } else if (data.type == SingleRaceConst.RANK_DATA_TYPE_2) {
            strDes = data.getServer_name() + (' ' + data.getUser_name());
            fontSize = 16;
        } else {
            strDes = data.getUser_name();
        }
        return [
            strDes,
            fontSize
        ];
    }
    _getFontColor(rank, type) {
        if (rank == 1) {
            return cc.color(255, 25, 25);
        } else if (rank == 2) {
            return cc.color(255, 198, 25);
        } else if (rank == 3) {
            return cc.color(255, 0, 255);
        } else if (rank >= 4 && rank <= 6) {
            return cc.color(255, 255, 255);
        } else {
            if (type == SingleRaceConst.RANK_DATA_TYPE_1) {
                return cc.color(151, 100, 83);
            } else {
                return cc.color(255, 255, 255);
            }
        }
    }
    _getRankColorInfo(rank, type) {
        if (rank >= 1 && rank <= 6) {
            return [
                cc.color(255, 207, 171),
                cc.color(183, 118, 65, 255)
            ];
        } else {
            if (type == SingleRaceConst.RANK_DATA_TYPE_1) {
                return [
                    cc.color(216, 176, 163),
                    cc.color(117, 73, 56, 255)
                ];
            } else {
                return [
                    cc.color(255, 207, 171),
                    cc.color(183, 118, 65, 255)
                ];
            }
        }
    }
}