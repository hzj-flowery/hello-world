const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import { handler } from '../../../utils/handler';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { Colors, G_ServerTime } from '../../../init';
import { SeasonSportHelper } from './SeasonSportHelper';

@ccclass
export default class OwnFightReportCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBack: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textTimeAgo: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageFightResult: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textServerNum: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSword: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageStar: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textOwnName: cc.Label = null;

    @property({ type: CommonButtonLevel1Highlight, visible: true })
    _btnLook: CommonButtonLevel1Highlight = null;

    private _customCallback;
    private _data;

    public onLoad() {
        this._btnLook.addClickEventListenerEx(handler(this, this._btnLookReport));
        this._btnLook.setString(Lang.get('season_own_fight_report_cell_btn_text'));
        this._updateSize();
    }

    private _updateSize() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    private _btnLookReport(sender) {
        if (this._customCallback != null) {
            this._customCallback(this._data);
        }
    }

    private _updateBack(index) {
        var slot = index % 2 + 4;
        UIHelper.loadTexture(this._imageBack, Path.getCustomActivityUI(SeasonSportConst.SEASON_REPORT_OWNBACK[slot - 1]));
    }

    private _updateBaseInfo(sid, name, officialLevel, star) {
        this._textServerNum.string = sid;
        var color = Colors.getOfficialColor(officialLevel);
        this._textOwnName.string = name;
        this._textOwnName.node.color = color;
        UIHelper.updateTextOfficialOutline(this._textOwnName.node, officialLevel);
        var dan = parseInt(SeasonSportHelper.getDanInfoByStar(star).rank_1);
        var danStar = SeasonSportHelper.getDanInfoByStar(star).name_pic;
        UIHelper.loadTexture(this._imageSword, Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[dan - 1]));
        UIHelper.loadTexture(this._imageStar, Path.getSeasonStar(danStar));
    }

    private _updateFightResoult(bWin) {
        var index = bWin && 1 || 2;
        UIHelper.loadTexture(this._imageFightResult, Path.getBattleFont(SeasonSportConst.SEASON_REPORT_RESOULT[index - 1]));
    }

    private _updateFightTimePass(time) {
        if (time == null || time <= 0) {
            return;
        }
        var passTime = G_ServerTime.getPassTime(time);
        this._textTimeAgo.string = passTime;
    }

    public updateUI(data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._updateBack(data.index);
        this._updateBaseInfo(data.sname, data.op_name, data.op_title, data.op_star);
        this._updateFightResoult(data.is_win);
        this._updateFightTimePass(data.report_time);
    }


    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}