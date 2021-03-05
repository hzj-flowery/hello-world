import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { Lang } from "../../../lang/Lang";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakePlayerIcon extends cc.Component {
    public static readonly RES_INFO = {
        [1]: {
            rankRes: 'img_ranking_01',
            textRes: 'txt_ranking01',
            color: new cc.Color(255, 216, 0),
            scale: 0.6
        },
        [2]: {
            rankRes: 'img_ranking_02',
            textRes: 'txt_ranking02',
            color: new cc.Color(182, 200, 235),
            scale: 0.5
        },
        [3]: {
            rankRes: 'img_ranking_03',
            textRes: 'txt_ranking03',
            color: new cc.Color(237, 143, 80),
            scale: 0.5
        }
    }
    _target: cc.Node;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _nodeIcon: CommonHeroIcon = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageText: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textScore: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    ctor(rank) {
        this._initUI(rank);
    }
    _initUI(rank) {
        var info = CakePlayerIcon.RES_INFO[rank];
        if (info) {
            UIHelper.loadTexture(this._imageRank, Path.getTextSignet(info.rankRes))
            UIHelper.loadTexture(this._imageText, Path.getAnniversaryImg(info.textRes))

            this._textName.node.color = (info.color);
            this._nodeIcon.node.setScale(info.scale);
        }
    }
    updateUI(data) {
        if (data) {
            var coverId = data.getCovertIdAndLimitLevel()[0];
            this._nodeIcon.updateUI(coverId);
            this._nodeIcon.updateHeadFrame(data.getHead_frame_id());
            this._nodeIcon.showHeroUnknow(false);
            this._textScore.string = (data.getPoint());
            var strName = data.getName();
            if (data.getServer_name() != '') {
                var serverName = TextHelper.cutText(data.getServer_name());
                strName = serverName + ('\n' + strName);
            }
            this._textName.string = (strName);
        } else {
            this._nodeIcon.showHeroUnknow(true);
            this._textScore.string = ('');
            this._textName.string = (Lang.get('cake_activity_icon_empty'));
        }
    }

}