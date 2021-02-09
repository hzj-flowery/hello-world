import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { UTF8 } from "../../../utils/UTF8";
import { Lang } from "../../../lang/Lang";
import { CakeActivityDataHelper } from "../../../utils/data/CakeActivityDataHelper";
import { TextHelper } from "../../../utils/TextHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeGuildIcon extends cc.Component {


    public static readonly RES_INFO = {
        [1]: {
            bgRes: 'img_guild_ranking01',
            rankRes: 'img_ranking_01',
            textRes: 'txt_ranking01',
            color: new cc.Color(255, 252, 177),
            outlineColor: new cc.Color(255, 152, 4, 255),
            color2: new cc.Color(255, 216, 0),
            scale: 1
        },
        [2]: {
            bgRes: 'img_guild_ranking02',
            rankRes: 'img_ranking_02',
            textRes: 'txt_ranking02',
            color: new cc.Color(214, 228, 255),
            outlineColor: new cc.Color(98, 110, 159, 255),
            color2: new cc.Color(182, 200, 235),
            scale: 0.9
        },
        [3]: {
            bgRes: 'img_guild_ranking03',
            rankRes: 'img_ranking_03',
            textRes: 'txt_ranking03',
            color: new cc.Color(255, 215, 182),
            outlineColor: new cc.Color(185, 88, 58, 255),
            color2: new cc.Color(237, 143, 80),
            scale: 0.9
        }
    };

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageIcon: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

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

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    initData(rank) {
        this._initUI(rank);
    }
    _initUI(rank) {
        var info = CakeGuildIcon.RES_INFO[rank];
        if (info) {
            UIHelper.loadTexture(this._imageIcon, Path.getAnniversaryImg(info.bgRes))
            UIHelper.loadTexture(this._imageText, Path.getAnniversaryImg(info.textRes))
            UIHelper.loadTexture(this._imageRank, Path.getTextSignet(info.rankRes))
            this._textGuildName.node.color = (info.color);
            UIHelper.enableOutline(this._textGuildName, info.outlineColor, 2)
            this._textName.node.color = (info.color2);
            this._imageIcon.node.setScale(info.scale);
        }
    }
    updateUI(data) {
        if (data) {
            var guildName = UTF8.utf8sub(data.getGuild_name(), 1, 2);
            this._textGuildName.string = (guildName);
            this._textScore.string = (Lang.get('cake_activity_cake_level', { level: data.getCake_level() }));
            var strName = data.getGuild_name();
            if (data.getServer_name() != '') {
                
                var serverName = TextHelper.cutText(data.getServer_name());
                strName = serverName + ('\n' + strName);
            }
            this._textName.string = (strName);
        } else {
            this._textGuildName.string = ('');
            this._textScore.string = ('');
            this._textName.string = (Lang.get('cake_activity_icon_empty'));
        }
    }
}