const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { QinTombConst } from '../../../const/QinTombConst';
import FlashPlayer from '../../../flash/FlashPlayer';
import { G_ConfigLoader, G_EffectGfxMgr, G_UserData } from '../../../init';
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { QinTombHelper } from './QinTombHelper';

@ccclass
export default class QinTombAvatar extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _followNode: cc.Node = null;

    @property({ type: CommonHeroAvatar, visible: true })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({ type: cc.Node, visible: true })
    _pkNode: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _avatarGuild: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _avatarName: cc.Label = null;

    private _mapNode: cc.Node;
    private _convertTable;
    private _flashTowards;
    private _playerNameNode;
    private _flashObj:FlashPlayer;
    private _userData;
    private _teamId;

    public init(mapNode: cc.Node) {
        this._mapNode = mapNode;
        this._convertTable = null;
        this._flashTowards = 1;
        this._playerNameNode = null;
        this._commonHeroAvatar.init();
    }

    public onDisable() {
        if (this._flashObj) {
            // console.log("onDisable")
            this._flashObj.finish();
            this._flashObj = null;
        }
    }
    // public update()
    // {
    //     console.log(this.node.name,this._flashObj);
    // }

    public updateUI(teamUser, teamId, teamLead) {
        this._userData = teamUser;
        this._teamId = teamId;
        if (this._flashObj) {
            console.log("updateUI")
            this._flashObj.finish();
            this._flashObj = null;
        }
        var [baseId, userTable] = UserDataHelper.convertAvatarId(teamUser);
        if (this._convertTable) {
            if (this._convertTable.covertId != userTable.covertId) {
                this._commonHeroAvatar.updateAvatar(userTable);
                this._convertTable = userTable;
            }
        } else {
            this._convertTable = userTable;
            this._commonHeroAvatar.updateAvatar(userTable);
        }
        var selfTeamId = G_UserData.getQinTomb().getSelfTeamId();
        if (selfTeamId == teamId) {
            this._followNode.removeAllChildren();
            if (teamUser.user_id != teamLead) {
            }
        }
        this._commonHeroAvatar.setScale(0.7);
        var color = QinTombHelper.getPlayerColor(teamUser.user_id, teamId);
        UIHelper.updateLabel(this._avatarName, {
            text: teamUser.name,
            color: color
        });
        UIHelper.updateLabel(this._avatarGuild, {
            text: teamUser.guild_name,
            color: color
        });
        this._commonHeroAvatar.showTitle(teamUser.title, "QinTombAvatar");
    }

    public updateColor() {
        var color = QinTombHelper.getPlayerColor(this._userData.user_id, this._teamId);
        UIHelper.updateLabel(this._avatarName, {
            text: this._userData.name,
            color: color
        });

        UIHelper.updateLabel(this._avatarGuild, {
            text: this._userData.guild_name,
            color: color
        });
    }

    public setAction(name, loop?) {
        if (this.node.active) {
            // console.log("setAction:", this.node.name, name, loop);
            this._commonHeroAvatar.setAction(name, loop);
        }
    }

    public showShadow(visible) {
        this._commonHeroAvatar.showShadow(visible);
    }

    public setAniTimeScale(timeScale) {
        this._commonHeroAvatar.setAniTimeScale(timeScale);
    }

    public turnBack(needBack) {
        this._commonHeroAvatar.turnBack(needBack);
    }

    public playAttackEffect() {
        G_EffectGfxMgr.createPlayGfx(this.node, 'effect_shuangjian', null, true);
    }

    public playLoopAttackAction() {
        var startDelay = Math.floor(Math.random() * (5 - 1) + 1);
        var endDelay = Math.floor(Math.random() * (10 - 1) + 1);
        var seq = cc.sequence(cc.delayTime(startDelay * 0.1), cc.callFunc(function () {
            if (this._commonHeroAvatar.isAnimExit('skill1')) {
                this.playAniAndSound();
            }
        }.bind(this)));
        this.node.stopAllActions();
        this.node.runAction(seq);
    }

    public stopLoopAttackAction() {
        if (this._flashObj) {
            // console.log("stopLoopAttackAction")
            this._flashObj.finish();
            this._flashObj = null;
        }
        this.node.stopAllActions();
    }

    public showPkEffect(hookPos, pkPos) {
        var offsetPosX = (hookPos.x - pkPos.x) / 2;
        var offsetPosY = (hookPos.y - pkPos.y) / 2;
        this._pkNode.setScale(0.5);
        this._pkNode.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._pkNode, 'effect_shuangjian', null, true);
        this._pkNode.setPosition(offsetPosX, offsetPosY + QinTombConst.TEAM_PK_EFFECT_HEIGHT);
    }

    public setAvatarModelVisible(visible) {
        this._commonHeroAvatar.setVisible(visible);
    }

    public setAvatarScaleX(scale) {
        if (scale == 1) {
            this._commonHeroAvatar.node.scaleX = (1);
            this._flashTowards = 1;
        } else if (scale == -1) {
            this._commonHeroAvatar.turnBack();
            this._flashTowards = -1;
        }
    }

    public syncVisible(visilbe) {
        this.node.active = (visilbe);
    }

    public releaseSelf() {
    }

    public setSoundEnable(visible) {
        if (this._flashObj) {
            this._flashObj.setSoundEnable(visible);
        }
    }

    public playAniAndSound() {
        let getAttackAction = function () {
            if (this._convertTable.limit == 1) {
                var retId = '91' + (this._convertTable.covertId + '001');
                return parseInt(retId);
            } else {
                if (this._convertTable.covertId < 100) {
                    if (this._convertTable.covertId < 10) {
                        return 1001;
                    }
                    if (this._convertTable.covertId > 10) {
                        return 11001;
                    }
                }
                var retId = this._convertTable.covertId + '001';
                return parseInt(retId);
            }
        }.bind(this);
        var [hero, shadow] = this._commonHeroAvatar.getFlashEntity();
        var attackId = getAttackAction();
        var hero_skill_play = G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_PLAY);
        var skillData = hero_skill_play.get(attackId);
        if (skillData) {
            if (this._flashObj) {
                console.log("stopLoopAttackAction")
                this._flashObj.finish();
                this._flashObj = null;
            }
            var ani = Path.getAttackerAction(skillData.atk_action);
            // console.log("playAniAndSound", ani);
            cc.resources.load(ani, cc.JsonAsset, (err, res: cc.JsonAsset) => {
                if (res == null || !hero.node || !hero.node.isValid) {
                    return;
                }
                this._flashObj = new FlashPlayer(hero, shadow, ani, this._flashTowards, this._commonHeroAvatar, true);
                this._flashObj.start();
            })
        }
    }
}