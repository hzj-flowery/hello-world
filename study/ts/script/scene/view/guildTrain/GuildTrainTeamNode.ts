import FlashPlayer from "../../../flash/FlashPlayer";
import { G_ConfigLoader, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import { Util } from "../../../utils/Util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildTrainTeamNode extends cc.Component {
    srcName: string = "GuildTrainTeamNode";

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroNode1: CommonHeroAvatar = null;

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _heroNode2: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _expGap1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _expGap2: cc.Label = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _timeLabel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroName1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _heroName2: cc.Node = null;

    _target: any;
    _constNodePosX1: any;
    _constNamePoxX1: any;
    _expGap1PosX1: any;
    _constGapPosX1: any;
    _trainInfo: any;
    _flashObj2: any;
    _expGapPos1: cc.Vec2;
    _expGapPos2: cc.Vec2;
    _flashObj1: any;
    ctor(target, data?) {
        this._target = target;
        this._init();
    }
    _init() {
        this._constNodePosX1 = this._heroNode1.node.x;
        this._constNamePoxX1 = this._heroName1.x;
        this._expGap1PosX1 = this._expGap1.node.x;
        this._constGapPosX1 = this._expGap1PosX1;
        this.setTeamNodeVisible(1, false);
        this.setTeamNodeVisible(2, false);
        this._heroNode1.init();
        this._heroNode2.init();
    }
    updateUI(data) {
        this._trainInfo = data;
        var trainNum = this._getTeamNodeNum();
        this.setTeamNodeVisible(1, false);
        this.setTeamNodeVisible(2, false);
        if (trainNum == 1) {
            this._heroNode1.node.x = (0);
            this._heroName1.x = (0);
            this._expGap1.node.x = (0);
        } else {
            this._heroNode1.node.x = (this._constNodePosX1);
            this._heroName1.x = (this._constNamePoxX1);
            this._expGap1.node.x = (this._constGapPosX1);
        }
        var posX1 = this._expGap1.node.x;
        var posY1 = this._expGap1.node.y;
        this._expGapPos1 = cc.v2(posX1, posY1);
        var posX2 = this._expGap2.node.x;
        var posY2 = this._expGap2.node.y;
        this._expGapPos2 = cc.v2(posX2, posY2);
        this._updateUI();
    }
    _getTeamNodeNum() {
        if (this._trainInfo.first == null || this._trainInfo.second == null) {
            return 1;
        } else if (this._trainInfo.first != null && this._trainInfo.second != null) {
            return 2;
        }
        return 0;
    }
    _updateUI() {
        this._updateHeroNode(1);
        var trainNum = this._getTeamNodeNum();
        var updateHeroFun = function () {
            this._updateHeroNode(2);
        }.bind(this)
        this._performWithDelay(updateHeroFun, 0.5);
        var trainType = G_UserData.getGuild().getGuildTrainType();
        if (trainType == 1) {
            this._timeLabel.getChildByName('text1').getComponent(cc.Label).string = (Lang.get('guild_training_type_mm'));
        } else if (trainType == 2) {
            this._timeLabel.getChildByName('text1').getComponent(cc.Label).string = (Lang.get('guild_training_type_mo'));
        } else if (trainType == 3) {
            this._timeLabel.getChildByName('text1').getComponent(cc.Label).string = (Lang.get('guild_training_type_om'));
        }
    }
    _updateHeroNode(index) {
        var heroInfo = null;
        var isTurn = true;
        var heroNode = this['_heroNode' + index];
        var nameControl = this['_heroName' + index];
        if (index == 1) {
            heroInfo = this._trainInfo.first;
            isTurn = false;
        } else if (index == 2) {
            heroInfo = this._trainInfo.second;
            isTurn = true;
        }
        if (heroInfo != null) {
            if (heroInfo.getLevel() != null) {
                var percentExp = G_UserData.getGuild().getGuildPercentExp(heroInfo.getLevel(), index);
                this['_expGap' + index].string = (Util.format(Lang.get('guild_prompt_exp'), percentExp));
            }
            heroNode.node.active = (true);
            nameControl.active = (true);
            heroNode.showTitle(heroInfo.getTitle(), this.srcName);
            nameControl.getChildByName('text').getComponent(cc.Label).string = (heroInfo.getName());
            var limit = AvatarDataHelper.getAvatarConfig(heroInfo.getAvatar_base_id()).limit == 1 && 3;
            var avatarId = UserDataHelper.convertAvatarId({
                base_id: heroInfo.getLeader(),
                avatar_base_id: heroInfo.getAvatar_base_id()
            })[0];
            heroNode.updateUI(avatarId, null, null, limit);
            heroNode.setScale(0.6);
            heroNode.turnBack(isTurn);
            this.playAniAndSound(heroNode, index);
            this._updateHeroName(nameControl, heroInfo);
        } else {
            this.setTeamNodeVisible(index, false);
        }
    }
    _updateHeroName(nameControl, heroInfo) {
        var official = heroInfo.getOfficer_level();
        var [officialName, officialColor, officialInfo] = GuildDataHelper.getOfficialInfo(official);
        nameControl.getChildByName('text').color = (officialColor);
    }
    playExpAnimation() {
        this._playNodeExpAnimation(1);
        var trainNum = this._getTeamNodeNum();
        if (trainNum == 2) {
            this._playNodeExpAnimation(2);
        }
    }
    _playNodeExpAnimation(index) {
        var flyTime = 0.9;
        this['_expGap' + index].node.active = (true);
        this['_expGap' + index].node.opacity = (255);
        var action1 = cc.moveBy(flyTime, cc.v2(0, 100));
        var action2 = cc.fadeOut(flyTime);
        var actionSpawn = cc.spawn(action1, action2);
        var expfun = function () {
            this['_expGap' + index].node.setPosition(this['_expGapPos' + index]);
        }.bind(this);
        var callFunc = cc.callFunc(expfun);
        var action = cc.sequence(actionSpawn, callFunc);
        this['_expGap' + index].node.runAction(action);
    }
    stopAniAndSound() {
        this.stopFlash(this._flashObj1);
        this._heroNode1.node.stopAllActions();
        var trainNum = this._getTeamNodeNum();
        if (trainNum == 2) {
            this.stopFlash(this._flashObj2);
            this._heroNode2.node.stopAllActions();
        }
    }
    myTeamExit(index) {
        this.stopFlash(this['_flashObj' + index]);
        this['_heroNode' + index].node.stopAllActions();
        this['_heroNode' + index].node.active = (false);
        this['_heroName' + index].active = (false);
    }
    playAniAndSound(heroNode, index) {
        var [hero, shadow] = heroNode.getFlashEntity();
        var attackId = 11001;
        var hero_skill_play = G_ConfigLoader.getConfig('hero_skill_play');
        var skillData = hero_skill_play.get(attackId);
        if (skillData) {
            if (this['_flashObj' + index]) {
                this['_flashObj' + index].finish();
                this['_flashObj' + index] = null;
            }
            var ani = Path.getAttackerAction(skillData.atk_action);

            cc.resources.load(ani, cc.JsonAsset, (err, res: cc.JsonAsset) => {
                if (res == null) {
                    return;
                }
                this['_flashObj' + index] = new FlashPlayer(hero, shadow, ani, index == 1 ? 1 : -1, heroNode, true);
                this['_flashObj' + index].start();
                this['_heroNode' + index].showShadow(false);
            })


        }
    }
    setTimeLabelVisible(visible) {
        this._timeLabel.active = (visible);
    }
    setTimeLabelString(string) {
        this._timeLabel.getChildByName('text2').getComponent(cc.Label).string = (string);
    }
    stopFlash(flashObj) {
        if (flashObj) {
            flashObj.finish();
            flashObj = null;
        }
    }
    _performWithDelay(callback, delay) {
        var delay1: any = cc.delayTime(delay);
        var sequence = cc.sequence(delay1, cc.callFunc(callback));
        this._target.node.runAction(sequence);
        return sequence;
    }
    setVisible(visible) {
        this.setTeamNodeVisible(1, visible);
        this.setTeamNodeVisible(2, visible);
        if (!visible) {
            this.stopFlash(this._flashObj1);
            this.stopFlash(this._flashObj2);
        }
    }
    setTeamNodeVisible(index, visible) {
        this['_heroNode' + index].node.active = (visible);
        this['_heroName' + index].active = (visible);
    }
}