const { ccclass, property } = cc._decorator;

import { Colors, G_ConfigLoader } from '../../../init';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { GuildDungeonDataHelper } from '../../../utils/data/GuildDungeonDataHelper';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';
import PopupGuildDungeonMonsterDetail from './PopupGuildDungeonMonsterDetail';

@ccclass
export default class GuildDungeonMonsterNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBoat: cc.Sprite = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _panelAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNameBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _stageName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starPanel3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starPanel2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _starPanel1: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPowerValue: cc.Label = null;

    public static readonly SCALE = 0.8;
    _starPanel: cc.Node[];
    _data: any;
    _monsterBattleUser: any;
    _rank: any;
    _name: any;
    _recordList: any;
    _memberList: any;

    onCreate() {
        this._starPanel = [
            this._starPanel1,
            this._starPanel2,
            this._starPanel3
        ];
        // this._panelTouch.setSwallowTouches(false);
        // this._imageBoat.ignoreContentAdaptWithSize(true);
    }
    onEnter() {
    }
    updateUI(data) {
        this._data = data;
        this._monsterBattleUser = data.monsterBattleUser;
        this._rank = data.rank;
        this._name = data.name;
        this._recordList = data.recordList;
        this._memberList = data.memberList;
        this._createHeroSpine();
        this._updateBaseInfo();
        this.refreshUI();
    }
    refreshUI() {
        var data = GuildDungeonDataHelper.getGuildDungeonMonsterData(this._rank);
        if (data) {
            this._data = data;
            this._monsterBattleUser = data.monsterBattleUser;
            this._rank = data.rank;
            this._name = data.name;
            this._recordList = data.recordList;
            this._memberList = data.memberList;
            this._refreshStarView();
        }
    }

    onExit() {

    }
    _refreshStarView() {
        for (var k in this._starPanel) {
            var v = this._starPanel[k];
            var record = this._recordList[k];
            if (record) {
                v.active = (true);
                let bg = v.getChildByName("background") as cc.Node;
                UIHelper.loadTexture(bg.getComponent(cc.Sprite), record.isIs_win() ? Path.getGuildRes('img_juntuanfuben_win01') : Path.getGuildRes('img_juntuanfuben_los02'));
            } else {
                v.active = (false);
            }
        }
    }
    _updateBaseInfo() {
        this._stageName.string = (this._rank + ('.' + this._monsterBattleUser.getUser().getName()));
        this._stageName.node.color = (Colors.getOfficialColor(this._monsterBattleUser.getUser().getOfficer_level()));
        var nameWidth = this._stageName.node.getContentSize().width;
        var config = this.getConfig();
        UIHelper.loadTexture(this._imageBoat, Path.getGuildDungeonUI('boat_' + config.boat));
        this._imageBoat.node.setPosition(config.boat_x_position - config.x_position, config.boat_y_position - config.y_position);
        var sizeText = TextHelper.getAmountText(this._monsterBattleUser.getUser().getPower());
        this._textPowerValue.string = (sizeText);
    }
    getConfig() {
        var GuildStageAtkReward = G_ConfigLoader.getConfig('guild_stage_atk_reward');
        var config = GuildStageAtkReward.get(this._rank);
        // assert(config, 'guild_stage_atk_reward cannot find id ' + tostring(this._rank));
        return config;
    }
    _createHeroSpine() {
        this._panelAvatar.init();
        var palyerInfo = this._monsterBattleUser.getPlayer_info();
        this._panelAvatar.updateUI(palyerInfo.covertId, null, null, palyerInfo.limitLevel);
        this._panelAvatar.setTouchEnabled(false);
        this._panelAvatar.setScale(GuildDungeonMonsterNode.SCALE);
        this._panelAvatar.turnBack();
        this._panelAvatar.moveTalkToTop();
        var height = this._panelAvatar.getHeight();
        this._nodeInfo.y = (height * GuildDungeonMonsterNode.SCALE);
    }
    onPanelClick(sender) {
        this.showStageDetail();

    }
    showStageDetail() {
        let res = cc.resources.get("prefab/guildDungeon/PopupGuildDungeonMonsterDetail");
        let node1 = cc.instantiate(res) as cc.Node;
        let popupFamous = node1.getComponent(PopupGuildDungeonMonsterDetail) as PopupGuildDungeonMonsterDetail;
        popupFamous.initData(this._data);
        popupFamous.open();  
    }
    getPanelTouch() {
        return this._panelTouch;
    }
}