import CommonListItem from "../../../ui/component/CommonListItem";

import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";

import CommonButtonSwitchLevel1 from "../../../ui/component/CommonButtonSwitchLevel1";

import { Lang } from "../../../lang/Lang";

import { G_UserData } from "../../../init";

import { Path } from "../../../utils/Path";

import { CountryBossHelper } from "./CountryBossHelper";

import { CountryBossConst } from "../../../const/CountryBossConst";
import UIHelper from "../../../utils/UIHelper";
import { handler } from "../../../utils/handler";

const { ccclass, property } = cc._decorator;



@ccclass
export default class CountryBossMeetingCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _heroName: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _rankRewardListViewItem: CommonListViewLineItem = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _canVote: cc.Node = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _progress: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _voteNum: cc.Label = null;

    @property({
        type: CommonButtonSwitchLevel1,
        visible: true
    })
    _btnVote: CommonButtonSwitchLevel1 = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _alreadyVote: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _canNotVoteLable: cc.Label = null;
    _capInsetsRect: any;
    _data: any;

    onCreate() { 
        // this._capInsetsRect = this._imageBg.getCapInsets();
        this._btnVote.setString(Lang.get('country_boss_meeting_btn_vote'));
        this._btnVote.addClickEventListenerEx(handler(this, this._onBtnVote));
    }
    updateUI(index, data) {
        if (!data) {
            return;
        }
        this._data = data;
        this._heroName.string = (data.name);
        var selfVote = G_UserData.getCountryBoss().getSelf_vote();
        if (data.isUnLock) {
            this._canVote.active = (true);
            this._canNotVoteLable.node.active = (false);
            if (selfVote && selfVote != 0) {
                this._btnVote.setEnabled(false);
                this._alreadyVote.node.active = (data.id == selfVote);
                this._btnVote.node.active = (data.id != selfVote);
                if (data.id == selfVote) {
                    UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04c'));
                }
            } else {
                if (CountryBossHelper.getStage() == CountryBossConst.STAGE2) {
                    this._btnVote.setEnabled(true);
                } else {
                    this._btnVote.setEnabled(false);
                }
                this._alreadyVote.node.active = (false);
                this._btnVote.node.active = (true);
                UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04'));
            }
            var member_num = 1;
            var myGuild = G_UserData.getGuild().getMyGuild();
            if (myGuild) {
                member_num = myGuild.getMember_num();
            }
            var progress = data.vote  / member_num;
            if (progress > 1) {
                progress = 1;
            }
            this._voteNum.string = (Lang.get('country_boss_meeting_vote_num', { num: data.vote }));
            this._progress.progress = (progress);
        } else {
            UIHelper.loadTexture(this._imageBg, Path.getCommonImage('img_com_board04'));
            this._canVote.active = (false);
            this._canNotVoteLable.node.active = (true);
            this._canNotVoteLable.string = (data.lockStr || '');
        }
        //   this._imageBg.setCapInsets(this._capInsetsRect);
        this._updateAwards();
    }
    _onBtnVote() {
        if (this._data) {
            G_UserData.getCountryBoss().c2sCountryBossVote(this._data.id);
        }
    }
    _updateAwards() {
        if (this._data) {
            var awards = CountryBossHelper.getPreviewRankRewards(this._data.id);
            this._rankRewardListViewItem.updateUI(awards, 1);
            this._rankRewardListViewItem.setMaxItemSize(3);
            this._rankRewardListViewItem.setListViewSize(300, 100);
            this._rankRewardListViewItem.setItemsMargin(2);
        }
    }
}