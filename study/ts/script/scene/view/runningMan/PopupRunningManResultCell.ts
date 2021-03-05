const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { G_EffectGfxMgr, Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';

@ccclass
export default class PopupRunningManResultCell extends cc.Component {

    @property({ type: cc.Sprite, visible: true })
    _resourceNode: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBk: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _text_rank_num: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _image_rank_bk: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _image_Rank_num: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerName: cc.Label = null;

    @property({ type: CommonHeroIcon, visible: true })
    _commonIcon: CommonHeroIcon = null;

    @property({ type: cc.Label, visible: true })
    _textDesc1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textDesc2: cc.Label = null;

    private static RANK_IMAGE_BK = [
        'img_runway_concord_red',
        'img_runway_concord_orange',
        'img_runway_concord_purple'
    ];
    private static RANK_OUTLINE_COLOR = [
        cc.color(190, 0, 0),
        cc.color(190, 89, 0),
        cc.color(167, 0, 209),
        cc.color(0, 0, 0),
        cc.color(0, 0, 0)
    ];

    private _cellRank;
    public init(rank) {
        this._cellRank = rank;
    }

    public onLoad() {
        this._updateRank(this._cellRank);
    }

    public playAnimation() {
        G_EffectGfxMgr.applySingleGfx(this.node, 'smoving_saipao_jifenban', null, null, null);
    }

    public getCellHeight() {
        return this._resourceNode.node.getContentSize().height - 3;
    }

    private _updateRank(rank) {
        rank = rank || 0;
        if (rank <= 3 && rank > 0) {
            this._imageBk.node.active = true;
            UIHelper.loadTexture(this._imageBk, Path.getRunningMan(PopupRunningManResultCell.RANK_IMAGE_BK[this._cellRank - 1]));

            UIHelper.loadTexture(this._image_rank_bk, Path.getComplexRankUI('icon_ranking0' + rank));

            this._image_Rank_num.node.active = true;
            UIHelper.loadTexture(this._image_Rank_num, Path.getComplexRankUI('txt_ranking0' + rank));

            this._text_rank_num.node.active = false;
            // UIHelper.enableOutline(this._textPlayerName, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 2);
            UIHelper.enableOutline(this._textDesc1, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 2);
            UIHelper.enableOutline(this._textDesc2, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 2);
        } else {
            this._image_rank_bk.node.active = false;

            this._text_rank_num.node.active = true;
            this._text_rank_num.string = rank;
            this._imageBk.node.active = false;
            // UIHelper.enableOutline(this._textPlayerName, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 1);
            UIHelper.enableOutline(this._textDesc1, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 1);
            UIHelper.enableOutline(this._textDesc2, PopupRunningManResultCell.RANK_OUTLINE_COLOR[this._cellRank - 1], 1);
        }
    }

    private _procPlayerIcon(heroData) {
        var isPlayer = heroData.isPlayer;
        if (isPlayer == null || isPlayer == 0) {
            return;
        }
        var simpleUser = heroData.user;
        this._textPlayerName.string = simpleUser.name;
        this._textPlayerName.node.color = Colors.getOfficialColor(simpleUser.office_level);
        UIHelper.enableOutline(this._textPlayerName, Colors.getOfficialColorOutline(simpleUser.office_level));
        var [baseId, avatarTable] = UserDataHelper.convertAvatarId(simpleUser);
        this._commonIcon.updateIcon(avatarTable, null, simpleUser.head_frame_id);
    }

    private _procHeroIcon(heroData) {
        var typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroData.heroId);
        this._commonIcon.updateUI(heroData.heroId);
        this._textPlayerName.string = typeHeroInfo.name;
        this._textPlayerName.node.color = typeHeroInfo.icon_color;
        UIHelper.enableOutline(this._textPlayerName, typeHeroInfo.icon_color_outline);
    }

    public updateUI(rankData) {
        var heroId = rankData.heroId;
        var time:number = rankData.time;
        var heroOdds = rankData.heroOdds;
        if (rankData.isPlayer == 1) {
            this._procPlayerIcon(rankData);
        } else {
            this._procHeroIcon(rankData);
        }
        this._textDesc1.string = (time).toFixed(1);
        if (Math.floor(heroOdds) >= heroOdds) {
            this._textDesc2.string = (heroOdds + '');
        } else {
            this._textDesc2.string = (heroOdds);
        }
    }
}