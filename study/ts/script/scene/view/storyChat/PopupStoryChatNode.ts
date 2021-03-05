const { ccclass, property } = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { G_ConfigLoader } from '../../../init';
import CommonStoryAvatar from '../../../ui/component/CommonStoryAvatar';

@ccclass
export default class PopupStoryChatNode extends cc.Component {

    private static ROLE_SCALE = 0.85
    private static MALE_SCALE = 0.72    //男主缩放
    private static FEMALE_SCALE = 0.72   //女主缩放

    private static MOVE_TIME = 0.3

    private static ENTER_POSITION =
        [
            cc.v2(- 668, 0),
            cc.v2(668, 0),
        ]

    private static TALK_POSITION =
        [
            cc.v2(- 284, 0),
            cc.v2(284, 0),
        ]

    private _heroId: number;
    private _stagePos: number;
    private _avatarTalker: CommonStoryAvatar;
    private _myHeroId: number;
    private _towards: number;
    private _posX: number;

    public updateUI(heroId, stagePos, myHeroId) {
        this._heroId = heroId;
        this._stagePos = stagePos;
        if (this._avatarTalker == null) {
            this._avatarTalker = this.node.getChildByName("_avatarTalker").getComponent(CommonStoryAvatar);
        }
        this._myHeroId = myHeroId || 1;
        this._towards = 1;

        if (this._heroId == 0) {
            this.node.active = (false);
            return;
        }
        var scale = PopupStoryChatNode.ROLE_SCALE;
        if (this._heroId == 1) {
            this._avatarTalker.updateUI(this._myHeroId);
            if (this._myHeroId < 10) {
                scale = PopupStoryChatNode.MALE_SCALE;
            } else {
                scale = PopupStoryChatNode.FEMALE_SCALE;
            }
        } else {
            this._avatarTalker.updateUI(this._heroId);
        }
        scale = 1;
        this._avatarTalker.node.setScale(scale);
        if (this._stagePos == 2) {
            this.turnBack();
        }
        this.node.setPosition(PopupStoryChatNode.ENTER_POSITION[this._stagePos - 1]);
        var heroData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(this._heroId);
        var resData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(heroData.res_id);
        this._posX = PopupStoryChatNode.TALK_POSITION[this._stagePos - 1].x + resData.story_res_chat_x * this._towards;
    }

    public getHeroId() {
        return this._heroId;
    }
    public turnBack() {
        this.node.scaleX = (-1);
        this._towards = -1;
    }

    public enterStage(callback) {
        var action1 = cc.moveTo(PopupStoryChatNode.MOVE_TIME, cc.v2(this._posX, PopupStoryChatNode.TALK_POSITION[this._stagePos - 1].y));
        var action2 = cc.callFunc(function () {
            if (callback) {
                callback();
            }
        });
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }
    public leaveStage() {
        this.node.stopAllActions();
        var action1 = cc.moveTo(PopupStoryChatNode.MOVE_TIME, PopupStoryChatNode.ENTER_POSITION[this._stagePos - 1]);
        var action2 = cc.destroySelf();
        var action = cc.sequence(action1, action2);
        this.node.runAction(action);
    }
}