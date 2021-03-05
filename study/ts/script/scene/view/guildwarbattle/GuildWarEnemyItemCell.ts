const { ccclass, property } = cc._decorator;

import CommonColorProgress from '../../../ui/component/CommonColorProgress'

import CommonGuildFlagVertical from '../../../ui/component/CommonGuildFlagVertical'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { TextHelper } from '../../../utils/TextHelper';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { G_EffectGfxMgr, G_UserData } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class GuildWarEnemyItemCell extends ListViewCellBase {

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
    _textName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPower: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeBuff: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _barGreen: cc.Sprite = null;

    @property({
        type: CommonGuildFlagVertical,
        visible: true
    })
    _commonGuildFlag: CommonGuildFlagVertical = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    @property({
        type: CommonColorProgress,
        visible: true
    })
    _colorProgress: CommonColorProgress = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuildingName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuildingHpTitle: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textBuildingHp: cc.Label = null;

    public static readonly HP_IMGS = [
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03e',
        'img_war_member03d',
        'img_war_member03c',
        'img_war_member03b',
        'img_war_member03a'
    ];
    _warUserData: any;
    _swordEffect: import("f:/mjz/code/mingjiangzhuan/main/assets/script/effect/EffectGfxMoving").default;
    _cityId: any;
    _config: any;

    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height + 3);
        // this._panelTouch.setSwallowTouches(false);
        this.showSword(true);

        this._commonGuildFlag.setTextGuidName([this._commonGuildFlag._textGuildName1, this._commonGuildFlag._textGuildName2]);
    }
    onItemClick(sender) {
        // var curSelectedPos = sender.getTag();
        this.dispatchCustomCallback(this._warUserData);
    }
    _onTouchCallBack(sender, state) {
        this.onItemClick(sender);
    }
    updateUI(warUserData) {
        this._warUserData = warUserData;
        this._updateHeroPower();
        this._updateHeroName();
        this._updateGuildFlag();
        this._updateHp();
        this._visibleBuilding(false);
    }
    _updateHeroPower() {
        var sizeText = TextHelper.getAmountText(this._warUserData.getPower());
        this._textPower.string = (sizeText);
    }
    _updateHeroName() {
        this._textName.string = (this._warUserData.getUser_name());
    }
    _updateGuildName() {
        var name = this._warUserData.getGuild_name();
        this._textGuildName.string = (name);
    }
    _updateGuildFlag() {
        var name = this._warUserData.getGuild_name();
        var index = this._warUserData.getGuild_icon();
        if (index == 0) {
            index = 1;
        }
        this._commonGuildFlag.setTextGuidName([this._commonGuildFlag._textGuildName1, this._commonGuildFlag._textGuildName2]);
        this._commonGuildFlag.updateUI(index, name);
    }
    _updateHp() {
        var maxHp = GuildWarDataHelper.getGuildWarHp();
        var hp = this._warUserData.getWar_value();
        this._colorProgress.setPercent((hp / maxHp), false, null);
    }
    playAttackEffect() {
        G_EffectGfxMgr.createPlayGfx(this._panelTouch, 'effect_zhandou_duijue', null, true);
    }
    _createSwordEft() {
        function effectFunction(effect) {
        }
        this._swordEffect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', effectFunction.bind(this), null, false);
        this._swordEffect.node.setPosition(0, 0);
        this._swordEffect.node.setAnchorPoint(cc.v2(0.5, 0.5));
    }
    showSword(s) {
        if (!this._swordEffect) {
            this._createSwordEft();
        }
        this._swordEffect.node.active = (s);
    }
    _visibleBuilding(show) {
        this._commonGuildFlag.node.active = (!show);
        this._textPower.node.active = (!show);
        this._textName.node.active = (!show);
        this._textBuildingName.node.active = (show);
        this._textBuildingHpTitle.node.active = (show);
        this._textBuildingHp.node.active = (show);
        UIHelper.loadTexture(this._imageBg, Path.getGuildWar(show ? 'img_ranking_war01a' : 'img_ranking_war01'));
        this._colorProgress.node.scaleX = (show ? 1 : 0.8);
        this._colorProgress.node.x = (show ? 90 : 114);
    }
    updateBuildingUI(cityId, config) {
        this._visibleBuilding(true);
        this._cityId = cityId;
        this._config = config;
        this._textBuildingName.string = (config.name);
        this._updateBuildingHp();
    }
    _updateBuildingHp() {
        var nowWarWatch = G_UserData.getGuildWar().getWarWatchById(this._cityId, this._config.point_id);
        var maxHp = this._config.build_hp;
        var hp = maxHp;
        if (nowWarWatch) {
            hp = nowWarWatch.getWatch_value();
        }
        var percent = hp / maxHp;
        this._textBuildingHp.string = (Lang.get('guildwar_rank_list_hurt_percent', { value: Math.floor(percent*100) }));
        this._colorProgress.setPercent(percent, false, null);
    }

}