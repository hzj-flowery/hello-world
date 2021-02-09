const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { SeasonSportConst } from '../../../const/SeasonSportConst';
import { SeasonSportHelper } from './SeasonSportHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { Path } from '../../../utils/Path';

@ccclass
export default class RecentReportCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _resourceDetails: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon1: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon2: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon3: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon4: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon5: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _leftIcon6: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon1: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon2: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon3: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon4: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon5: CommonIconTemplate = null;

    @property({ type: CommonIconTemplate, visible: true })
    _rightIcon6: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLose: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageWin: cc.Sprite = null;

    public onLoad() {
        var size = this._resource.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public updateUI(data) {
        if (data == null) {
            this._resource.active = false;
            return;
        }
        var isRookieStage = true;
        this._resource.active = true;
        if (data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS - 1] <= 1) {
            isRookieStage = false;
            this._imageWin.node.active = (data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS - 1] == 0);
            this._imageLose.node.active = (data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS - 1] == 1);
        } else {
            this._imageWin.node.active = (data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS - 1] == 2);
            this._imageLose.node.active = (data.ids[SeasonSportConst.SEASON_RECENRREPORT_IDSNUMS - 1] == 3);
        }
        var idsNum = data.ids.length - 1;
        for (var index = 1; index <= idsNum; index++) {
            var isOrange2Red = false;
            var iconId = data.ids[index - 1];
            if (isRookieStage == false) {
                var [bHero, heroCfg] = SeasonSportHelper.isExistHeroById(iconId);
                if (heroCfg.limit_res_id != 0) {
                    isOrange2Red = true;
                }
            }
            if (index <= 6) {
                (this['_leftIcon' + index] as CommonIconTemplate).unInitUI();
                (this['_leftIcon' + index] as CommonIconTemplate).initUI(TypeConvertHelper.TYPE_HERO, iconId);
                if (isOrange2Red) {
                    var iconBg = Path.getUICommon('frame/img_frame_06');
                    this['_leftIcon' + index].loadColorBg(iconBg);
                }
            } else {
                var idx = index - 6;
                this['_rightIcon' + idx].unInitUI();
                this['_rightIcon' + idx].initUI(TypeConvertHelper.TYPE_HERO, iconId);
                if (isOrange2Red) {
                    var iconBg = Path.getUICommon('frame/img_frame_06');
                    this['_rightIcon' + idx].loadColorBg(iconBg);
                }
            }
        }
    }
}