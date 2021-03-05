const { ccclass, property } = cc._decorator;

import { DataConst } from '../../../const/DataConst';
import { SignalConst } from '../../../const/SignalConst';
import { ReportParser } from '../../../fight/report/ReportParser';
import { Colors, G_ConfigLoader, G_Prompt, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import CommonHeroPower from '../../../ui/component/CommonHeroPower';
import CommonResourceInfo from '../../../ui/component/CommonResourceInfo';
import CommonTalkNode from '../../../ui/component/CommonTalkNode';
import PopupBase from '../../../ui/PopupBase';
import { BattleDataHelper } from '../../../utils/data/BattleDataHelper';
import { GuildDungeonDataHelper } from '../../../utils/data/GuildDungeonDataHelper';
import { handler } from '../../../utils/handler';
import { GuildCheck } from '../../../utils/logic/GuildCheck';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import PopupEmbattle from '../team/PopupEmbattle';
import GuildDungeonFightRecordNode from './GuildDungeonFightRecordNode';






@ccclass
export default class PopupGuildDungeonMonsterDetail extends PopupBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnFormation: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonResourceInfo,
        visible: true
    })
    _dropItem: CommonResourceInfo = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _ImageHero: CommonHeroAvatar = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _fightRecordNode1: GuildDungeonFightRecordNode = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _fightRecordNode2: GuildDungeonFightRecordNode = null;

    @property({
        type: GuildDungeonFightRecordNode,
        visible: true
    })
    _fightRecordNode3: GuildDungeonFightRecordNode = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNoRecord1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNoRecord2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNoRecord3: cc.Label = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _fileNodePower: CommonHeroPower = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater4: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater1: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater5: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater2: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater6: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroAvater3: CommonHeroAvatar = null;

    @property({
        type: CommonTalkNode,
        visible: true
    })
    _commonTalk: CommonTalkNode = null;

    _data: any;
    _recordNodeList: GuildDungeonFightRecordNode[];
    _isCreate: any;
    _memberList: any;
    _monsterBattleUser: any;
    _signalGuildDungeonChallenge;
    _signalGuildDungeonRecordSyn;
    _signalGuildDungeonMonsterGet;
    _name: string;
    _recordList: any;
    _rank: any;
    initData(data) {
        this._data = data;
        this._monsterBattleUser = data.monsterBattleUser
        this._rank = data.rank
        this._name = data.name
        this._recordList = data.recordList
        this._memberList = data.memberList
        this._isCreate = true

        this._recordNodeList = [];
    }

    onCreate() {
        this._btnFight.setString(Lang.get('stage_fight'));
        this._recordNodeList = [
            this._fightRecordNode1,
            this._fightRecordNode2,
            this._fightRecordNode3
        ];
    }
    onEnter() {
        this._signalGuildDungeonChallenge = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_CHALLENGE, handler(this, this._onEventGuildDungeonChallenge));
        this._signalGuildDungeonRecordSyn = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(this, this._onEventGuildDungeonRecordSyn));
        this._signalGuildDungeonMonsterGet = G_SignalManager.add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(this, this._onEventGuildDungeonMonsterGet));
        if (!this._isCreate) {
            this._updateData();
        }
        this._refreshStageDetail();
        this._isCreate = false;
        this._createHeroSpine();
    }
    onExit() {
        this._signalGuildDungeonChallenge.remove();
        this._signalGuildDungeonChallenge = null;
        this._signalGuildDungeonRecordSyn.remove();
        this._signalGuildDungeonRecordSyn = null;
        this._signalGuildDungeonMonsterGet.remove();
        this._signalGuildDungeonMonsterGet = null;
    }
    _onEventGuildDungeonChallenge(eventName, message) {
        this.close();
        function enterFightView(message) {
            var battleReport = G_UserData.getFightReport().getReport();
            var reportData = ReportParser.parse(battleReport);
            var battleData = BattleDataHelper.parseGuildDungeon(message);
            G_SceneManager.showScene('fight', reportData, battleData);
        }
        G_SceneManager.registerGetReport(message.battle_report, function () {
            enterFightView(message);
        });
    }
    _onEventGuildDungeonRecordSyn(event) {
        this._updateData();
        this._refreshFightResult();
    }
    _onEventGuildDungeonMonsterGet(event) {
        this._updateData();
        this._refreshStageDetail();
    }
    onCloseClick() {
        this.closeWithAction();
    }
    onFightClick() {
        if (!this._data) {
            G_Prompt.showTip(Lang.get('guilddungeon_monster_not_exit'));
            return;
        }
        var count = GuildDungeonDataHelper.getGuildDungenoFightCount();
        if (count <= 0) {
            G_Prompt.showTip(Lang.get('guilddungeon_not_challenge_count'));
            return;
        }
        if (this._isHasChallenge()) {
            G_Prompt.showTip(Lang.get('guilddungeon_already_challenge'));
            return;
        }
        var success = GuildCheck.checkGuildDungeonInOpenTime(null)[0];
        if (!success) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE);
        var uid = this._monsterBattleUser.getUser().getId();
        G_UserData.getGuildDungeon().c2sGuildDungeonBattle(uid);
    }
    onFormationClick() {
        let res = cc.resources.get("prefab/team/PopupEmbattle");
        let node1 = cc.instantiate(res) as cc.Node;
        let popup = node1.getComponent(PopupEmbattle) as PopupEmbattle;
        popup.openWithAction();
    }
    _updateData() {
        var data = GuildDungeonDataHelper.getGuildDungeonMonsterData(this._rank);
        if (data) {
            this._monsterBattleUser = data.monsterBattleUser;
            this._rank = data.rank;
            this._name = data.name;
            this._recordList = data.recordList;
            this._memberList = data.memberList;
        }
        this._data = data;
    }
    _isHasChallenge() {
        for (var k in this._memberList) {
            var v = this._memberList[k];
            if (v.isSelf()) {
                return true;
            }
        }
        return false;
    }
    _createHeroSpine() {
        this._ImageHero.init();
        this._ImageHero.updateUI(this._monsterBattleUser.getPlayer_info().covertId, null, null, this._monsterBattleUser.getPlayer_info().limitLevel);
    }
    _refreshEnemyFormation() {
        var heros = this._monsterBattleUser.getHeros();
        var embattle = this._monsterBattleUser.getEmbattle();
        // dump(embattle);
        for (var i = 1; i <= 6; i++) {
            this['_heroAvater' + i].node.active = (false);
        }
        for (var i = 1; i <= 6; i++) {
            var hero = heros[i - 1];
            var pos = embattle[i - 1];
            if (hero && pos && pos != 0) {
                this['_heroAvater' + pos].node.active = (true);
                this['_heroAvater' + pos].setScale(0.8);
                if (i == 1) {
                    var playerInfo = this._monsterBattleUser.getPlayer_info();
                    this['_heroAvater' + pos].updateUI(playerInfo.covertId, null, null, playerInfo.limitLevel);
                } else {
                    this['_heroAvater' + pos].updateUI(hero.getBase_id(), null, null, hero.getLimit_level(), null, null, hero.getLimit_rtg());
                }
            }
        }
    }
    _refreshFightResult() {
        var recordList = this._recordList;
        var memberList = this._memberList;
        for (var k = 1; k <= this._recordNodeList.length; k++) {
            var v = this._recordNodeList[k - 1];
            var record = recordList[k - 1];
            var member = memberList[k - 1];
            if (record) {
                this['_textNoRecord' + k].node.active = (false);
                v.node.active = (true);
                var attackName = null;
                if (member) {
                    attackName = ((parseInt(member.getRankPower()) + 1).toString()) + ('.' + record.getPlayer_name());
                } else {
                    attackName = record.getPlayer_name();
                }
                v.updateView(record.isIs_win(), attackName, Colors.getOfficialColor(record.getPlayer_officer()), Colors.getOfficialColorOutlineEx(record.getPlayer_officer()));
            } else {
                this['_textNoRecord' + k].node.active = (true);
                v.node.active = (false);
            }
        }
    }
    _refreshRewardView() {
        var GuildStageAtkReward = G_ConfigLoader.getConfig('guild_stage_atk_reward');
        var stageConfig = GuildStageAtkReward.get(this._rank);
        this._dropItem.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GONGXIAN, stageConfig.win_reward);
    }
    _refreshTalk() {
        var talkStr = GuildDungeonDataHelper.getGuildDungeonTalk(this._monsterBattleUser);
        this._commonTalk.setText(talkStr, 300, this._isCreate);
    }
    _refreshStageDetail() {
        this._refreshMonsterBaseInfo();
        this._refreshEnemyFormation();
        this._refreshFightResult();
        this._refreshRewardView();
        this._refreshTalk();
    }
    _refreshMonsterBaseInfo() {
        this._textName.string = (this._monsterBattleUser.getUser().getName());
        this._fileNodePower.updateUI(this._monsterBattleUser.getUser().getPower());
    }

}