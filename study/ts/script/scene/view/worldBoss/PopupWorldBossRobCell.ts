const { ccclass, property } = cc._decorator;

import CommonPlayerName from '../../../ui/component/CommonPlayerName'

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';

@ccclass
export default class PopupWorldBossRobCell extends ListViewCellBase {

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
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;
    _cellValue: any;


    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButton.addClickEventListenerEx(handler(this, this._onButtonClick));
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(index, data) {
        this._cellValue = data;
        this._playerName.updateUI(data.name, data.official);
        let img_top_rank = this._resourceNode.getChildByName("Node_rank").getChildByName("Image_top_rank").getComponent(cc.Sprite) as cc.Sprite;
        let img_rank_bk = this._resourceNode.getChildByName("Image_rank_bk").getComponent(cc.Sprite) as cc.Sprite;
        let text_rank = this._resourceNode.getChildByName("Node_rank").getChildByName("Text_rank").getComponent(cc.Label) as cc.Label;
        if (data.rank <= 3 && data.rank >= 1) {
            img_top_rank.node.active = true;
            UIHelper.loadTexture(img_top_rank, Path.getArenaUI('img_qizhi0' + data.rank));

            img_rank_bk.node.active = true;
            UIHelper.loadTexture(img_rank_bk, Path.getArenaUI('img_midsize_ranking0' + data.rank));
            text_rank.node.active = false;
        } else {
            img_top_rank.node.active = false;
            img_rank_bk.node.active = true;
            UIHelper.loadTexture(img_rank_bk, Path.getComplexRankUI('img_midsize_ranking04'));

            text_rank.node.active = true;
            text_rank.string = data.rank + "";
        }
        this._textPoint.string = (TextHelper.getAmountText(data.point));
        if (data.userId == G_UserData.getBase().getId()) {
            this._commonButton.setString(Lang.get('worldboss_grob_self_btn'));
            this._commonButton.setEnabled(false);
        } else {
            this._commonButton.setString(Lang.get('worldboss_grob_btn'));
            this._commonButton.setEnabled(true);
        }
        if (data.guildName == null || data.guildName == '') {
            this._textGuildName.string = (' ');
        } else {
            this._textGuildName.string = ('(' + (data.guildName + ')'));
        }
        var commonHeroArr = this._scrollView.content.children;
        for (var i in commonHeroArr) {
            var commHero = commonHeroArr[i];
            var baseId = data.heroList[i][0];
            var limit = data.heroList[i][1];
            commHero.active = (true);
            if (baseId && baseId > 0) {
                commHero.getComponent(CommonHeroIcon).updateUI(baseId, null, limit);
            } else {
                commHero.getComponent(CommonHeroIcon).refreshToEmpty();
            }
        }
    }
    _onButtonClick(sender) {
        this.dispatchCustomCallback(this._cellValue.userId);
    }

}