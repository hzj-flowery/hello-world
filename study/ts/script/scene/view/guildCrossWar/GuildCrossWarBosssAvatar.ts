const { ccclass, property } = cc._decorator;

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { G_UserData, Colors, G_EffectGfxMgr } from '../../../init';
import { GuildCrossWarHelper } from './GuildCrossWarHelper';
import { GuildCrossWarConst } from '../../../const/GuildCrossWarConst';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class GuildCrossWarBosssAvatar extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeRole: cc.Node = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonBossAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatarInfo: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossState: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossGuildName: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _monsterBlood1: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _percentText: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;
    _pointId: number;
    _monsterBlood: any;


    initData(pointId) {
        this._pointId = pointId;
    }
    onCreate() {
        this._nodeEffect.active = (false);
        this._touchPanel.active = (false);
        // this._touchPanel.addClickEventListenerEx(handler(this, this.onClickBoss));
    }
    onEnter() {
    }
    onExit() {
    }
    onClickBoss(sender) {
        var bExistBoss = this._isExistBoss(), bossUnit;
        if (!bExistBoss) {
            return;
        }
        var selfUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (selfUnit == null || selfUnit.getCurrPointKeyPos() == null) {
            return;
        }
        var selfPointHole = selfUnit.getCurPointHole();
        var bossGridData = GuildCrossWarHelper.getWarMapCfg(bossUnit.getConfig().boss_place);
        if (GuildCrossWarHelper.checkCanMovedPoint(selfPointHole, bossGridData)) {
            G_UserData.getGuildCrossWar().c2sBrawlGuildsFight(0);
        }
    }
    getCurState() {
        var bExistBoss = this._isExistBoss(), curBossUnit;
        if (!bExistBoss) {
            return GuildCrossWarConst.BOSS_STATE_DEATH;
        }
        var bossState = curBossUnit.getCurState()[0];
        return bossState;
    }
    _isExistBoss() {
        var bossMap = G_UserData.getGuildCrossWar().getBossMap();
        // dump(bossMap);
        if (typeof (bossMap) != 'object') {
            return [
                false,
                null
            ];
        }
        var curBossUnit = bossMap[this._pointId];
        if (curBossUnit == null || curBossUnit.getConfig().boss_res == null) {
            return [
                false,
                null
            ];
        }
        if (curBossUnit.getConfig().boss_res <= 0) {
            return [
                false,
                null
            ];
        }
        return [
            true,
            curBossUnit
        ];
    }
    _updateBase() {
        var bExistBoss = this._isExistBoss(), curBossUnit;
        if (!bExistBoss) {
            return;
        }
        var data = curBossUnit.getConfig();
        this._commonBossAvatar.setBaseId(data.boss_res);
        this._commonBossAvatar.setAsset(data.boss_res, null);
        this._commonBossAvatar.setAction('idle', true);
        this._commonBossAvatar.node.zIndex = (0);
        this._commonBossAvatar.setScale(0.7);
        this._bossName.string = ('' + data.name);
        this._bossName.node.color = (Colors.getColor(data.color));
        UIHelper.enableOutline(this._bossName, Colors.getColorOutline(data.color), 2)
        this.node.setContentSize(GuildCrossWarHelper.getWarMapGridCenter(data.boss_place).x, GuildCrossWarHelper.getWarMapGridCenter(data.boss_place).y);
        this._nodeAvatarInfo.setPosition(GuildCrossWarConst.BOSS_AVATAR_INFO_POS);
    }
    _updateHP() {
        var [bExistBoss, curBossUnit] = this._isExistBoss();
        if (!bExistBoss) {
            return;
        }
        if (curBossUnit == null || curBossUnit.getMax_hp() == 0) {
            this._playDieAction();
            return;
        }
        var percent = (100 * curBossUnit.getHp() / curBossUnit.getMax_hp()).toFixed(2);
        if (curBossUnit.getHp() > 0) {
            this._touchPanel.active = (true);
            this._percentText.string = (percent + '%');
        } else {
            this._percentText.string = (' ');
            this.node.active = (false);
        }
        this._monsterBlood.setPercent(parseFloat(percent));
    }
    _updateState() {
        var bExistBoss = this._isExistBoss(), curBossUnit;
        if (!bExistBoss) {
            return;
        }
        var bossState = curBossUnit.getCurState(), stateStr;
        this._bossState.string = (stateStr);
        var bAttacking = GuildCrossWarConst.BOSS_STATE_PK == bossState;
        this._playAttackEffect(bAttacking);
        this._playAttackAction(bAttacking);
    }
    updateUI() {
        var bExistBoss = this._isExistBoss(), __;
        if (!bExistBoss) {
            return;
        }
        this._updateBase();
        this._updateState();
        this._updateHP();
    }
    setAvatarModelVisible(visible) {
        visible = visible == null && false;
    }
    isAvatarModelVisible() {
        return this.node.active;
    }
    _playDieAction() {
        function playBossDieAction() {
            this._commonBossAvatar.setAction('die', false);
        }
        function dieFinishCallBack() {
            this.setVisible(false);
            G_UserData.getGuildCrossWar().setBossUnitById(this._pointId);
        }
        this._nodeRole.stopAllActions();
        this.node.stopAllActions();
        this._nodeRole.runAction(cc.sequence(cc.callFunc(playBossDieAction), cc.fadeOut(0.2), cc.callFunc(dieFinishCallBack)));
    }
    _playAttackEffect(bAttacking) {
        if (bAttacking) {
            this._nodeEffect.active = (true);
            this._nodeEffect.removeAllChildren();
            G_EffectGfxMgr.createPlayGfx(this._nodeEffect, 'effect_xianqinhuangling_shuangjian', null, true);
        } else {
            this._nodeEffect.active = (false);
        }
    }
    _playAttackAction(bAttacking) {
        var bExistBoss = this._isExistBoss(), curBossUnit;
        if (!bExistBoss) {
            return;
        }
        if (!bAttacking) {
            return;
        }
        var seq = cc.sequence(cc.delayTime(0.8), cc.callFunc(function () {
            var dirIndex = Math.floor(Math.random() * (2 - 1)) + 1;;
            var dir = 1;
            if (dirIndex == 2) {
                dir = -1;
            }
            this._commonBossAvatar.setAction('skill1', false);
            this._commonBossAvatar.setScaleX(dir);
        }), cc.delayTime(1.8), cc.callFunc(function () {
            this._commonBossAvatar.setAction('idle', true);
        }), cc.delayTime(1), cc.callFunc(function () {
        }));
        var rep = cc.repeatForever(seq);
        this.node.stopAllActions();
        this.node.runAction(rep);
    }

}