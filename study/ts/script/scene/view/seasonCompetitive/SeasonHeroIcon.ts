const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { SeasonSportHelper } from '../seasonSport/SeasonSportHelper';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { Colors, G_UserData, G_Prompt } from '../../../init';
import { Path } from '../../../utils/Path';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class SeasonHeroIcon extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _item1: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNodeCommon1: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBan1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTop1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch1: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textHeroName1: cc.Label = null;

    private _data;
    private _customCallback;

    public onLoad() {
        this.node.setContentSize(this._resource.getContentSize());
        this._panelTouch1.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelTouch));
    }

    private _updateEnable(data) {
        if (data.isInBanView) {
            this._panelTouch1.active = data.isInBanView;
        } else {
            if (data.isBaned) {
                this._panelTouch1.active = false;
            } else {
                this._panelTouch1.active = !data.isMask;
            }
        }
    }

    private _updateColor(data) {
        var heroParam = this._fileNodeCommon1.getItemParams();
        var iconColor = heroParam.icon_color;
        var iconColor_outline = heroParam.icon_color_outline;
        var redLimit = SeasonSportHelper.getLimitBreak();
        if (data.color == SeasonSportConst.HERO_SCOP_LOWERLIMIT && data.limit == SeasonSportConst.HERO_SCOP_LIMIT) {
            if (redLimit == SeasonSportConst.HERO_RED_LINEBREAK) {
                iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT);
                iconColor_outline = Colors.getColorOutline(SeasonSportConst.HERO_SCOP_REDIMIT);
                var iconBg = Path.getUICommon('frame/img_frame_06');
                this._fileNodeCommon1.loadColorBg(iconBg);
            }
        }
        return [
            iconColor,
            iconColor_outline
        ];
    }

    private _onPanelTouch(sender: cc.Event.EventTouch, state) {
        var moveOffsetX = Math.abs(sender.getStartLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getStartLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (sender.target.active == false) {
                G_Prompt.showTip(Lang.get('season_squad_selectotherhero'));
            } else {
                var ownSign = G_UserData.getSeasonSport().getPrior();
                var curRound = G_UserData.getSeasonSport().getCurrentRound();
                var stageInfo = SeasonSportHelper.getSquadStageInfo(curRound);
                if (ownSign != parseInt(stageInfo.first) && curRound > 0) {
                    G_Prompt.showTip(Lang.get('season_squad_otherround'));
                    return;
                } else {
                    var baseId = this._data.id;
                    if (this._customCallback) {
                        this._customCallback(baseId);
                    }
                }
            }
        }
    }

    public updateUI(tabIndex, cellData) {
        this._item1.active = false;
        this._imageSelected1.node.active = false;
        this._data = cellData;
        if (cellData == null) {
            return;
        }
        this._item1.active = true;
        this._fileNodeCommon1.node.active = true;
        this._fileNodeCommon1.unInitUI();
        var addStrngth = '';
        var curStage = G_UserData.getSeasonSport().getSeason_Stage();
        if (curStage == SeasonSportConst.SEASON_STAGE_ROOKIE) {
            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content;
        } else if (curStage == SeasonSportConst.SEASON_STAGE_ADVANCED) {
            addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content;
        } else if (curStage == SeasonSportConst.SEASON_STAGE_HIGHT) {
            if (SeasonSportHelper._isGoldenHero(this._data.id)) {
                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content;
            } else {
                addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content;
            }
        }
        var iconId = cellData.id;
        var nameStr = cellData.name + ('+' + addStrngth);
        if (tabIndex == 5) {
            nameStr = cellData.name;
            iconId = SeasonSportHelper.getTransformCardsHeroId(cellData.id);
        }
        this._fileNodeCommon1.initUI(TypeConvertHelper.TYPE_HERO, iconId);
        this._fileNodeCommon1.setIconMask(cellData.isMask);
        this._imageBan1.node.active = (cellData.isBaned);
        this._imageTop1.node.active = false;
        if (cellData.isBaned) {
            this._fileNodeCommon1.setIconMask(true);
        }
        var [iconColor, iconColor_outline] = this._updateColor(cellData);
        this._updateEnable(cellData);
        if (tabIndex == 5) {
            iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT);
            var iconBg = Path.getUICommon('frame/img_frame_06');
            if (cellData.color == 5 && cellData.limit == 0) {
                iconBg = Path.getUICommon('frame/img_frame_05');
                iconColor = Colors.getColor(SeasonSportConst.HERO_SCOP_LOWERLIMIT);
            }
            this._fileNodeCommon1.loadColorBg(iconBg);
        }
        this._textHeroName1.string = nameStr;
        this._textHeroName1.node.color = iconColor;
        UIHelper.enableOutline(this._textHeroName1, iconColor_outline, 2);

    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}