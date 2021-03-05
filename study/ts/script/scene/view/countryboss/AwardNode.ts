const { ccclass, property } = cc._decorator;

import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem'
import { CountryBossHelper } from './CountryBossHelper';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class AwardNode extends cc.Component {

    @property({
        type: cc.Label,
        visible: true
    })
    _awardText: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _rankRewardListViewItem: CommonListViewLineItem = null;
    _bossId: any;

    ctor(bossId) {
        this._bossId = bossId;
        this.onCreate();
    }
    onCreate() {
        var awards = CountryBossHelper.getPreviewRankRewards(this._bossId);
        this._rankRewardListViewItem.updateUI(awards);
        this._rankRewardListViewItem.setMaxItemSize(5);
        this._rankRewardListViewItem.setListViewSize(400, 100);
        this._rankRewardListViewItem.setItemsMargin(2);
        var cfg = CountryBossHelper.getBossConfigById(this._bossId);
        if (cfg.type == 1) {
            this._awardText.string = (Lang.get('country_boss_award_lable1'));
        } else {
            this._awardText.string = (Lang.get('country_boss_award_lable2'));
        }
    }
}