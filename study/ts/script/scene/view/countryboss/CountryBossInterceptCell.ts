const { ccclass, property } = cc._decorator;

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Lang } from '../../../lang/Lang';
import { TextHelper } from '../../../utils/TextHelper';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';

@ccclass
export default class CountryBossInterceptCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButton: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCondition: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _rank: cc.Label = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _playerName: CommonPlayerName = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _scrollView: cc.Node = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero1: CommonHeroIcon = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero2: CommonHeroIcon = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero3: CommonHeroIcon = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero4: CommonHeroIcon = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero5: CommonHeroIcon = null;
    @property({ type: CommonHeroIcon, visible: true })
    Common_hero6: CommonHeroIcon = null;


    _data: any;

    onCreate() {
        this._commonButton.setString(Lang.get('country_boss_intercept_pop_btn_name'));
        this._commonButton.addClickEventListenerEx(handler(this, this._onCommonButton));
    }
    updateUI(index, data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._rank.string = (index + 1).toString();
        this._playerName.updateUI(data.getName(), data.getOffice_level());
        this._textGuildName.string = (data.getGuild_name());
        this._textPoint.string = (TextHelper.getAmountText(data.getPower()));
        var scrollView = this._scrollView;
        var heroList = data.getHero_base_id();
        for (var i = 1; i <= 6; i++) {
            var commHero = this['Common_hero' + i]
            var baseId = heroList[i - 1];
            commHero.node.active = (true);
            if (baseId != undefined) {
                var limitLevel = 0;
                if (index == 1) {
                    var [covertId, param] = UserDataHelper.convertAvatarId(data);
                    baseId = covertId;
                    limitLevel = param.limitLevel;
                }
                commHero.updateUI(baseId, null, limitLevel);
            } else {
                commHero.refreshToEmpty();
            }
        }
    }
    _onCommonButton() {
        if (this._data) {
            this.dispatchCustomCallback(this._data.getUser_id());
        }
    }
}