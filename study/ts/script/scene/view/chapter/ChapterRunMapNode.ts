import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { HeroConst } from "../../../const/HeroConst";
import { G_ConfigLoader, G_UserData } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { Path } from "../../../utils/Path";

export default class ChapterRunMapNode extends cc.Component {
    private _actor: CommonHeroAvatar;
    private static SCALE_AVATAR = 0.5;

    private _startPos: cc.Vec2;
    private _endPos: cc.Vec2;

    public run(startPos, endPos) {
        this._startPos = startPos;
        this._endPos = endPos;
        this._createActor(this._runAction.bind(this));
    }

    private _createActor(loadCallback: Function) {
        if (this._actor) {
            this._actor.node.stopAllActions();
            this._actor.node.destroy();
            this._actor = null;
        }
        var myHeroId = G_UserData.getHero().getRoleBaseId();
        var playerBaseId = G_UserData.getBase().getPlayerBaseId();
        var avatarId = G_UserData.getBase().getAvatar_base_id();
        var limit = 0;
        if (avatarId > 0) {
            limit = parseInt(G_ConfigLoader.getConfig(ConfigNameConst.AVATAR).get(avatarId).limit) > 0 && HeroConst.HERO_LIMIT_MAX_LEVEL || 0;
        }
        myHeroId = playerBaseId > 0 && playerBaseId || myHeroId;

        cc.resources.load(Path.getPrefab("CommonHeroAvatar", "common"), cc.Prefab, function (err, res: any) {
            this._actor = cc.instantiate(res).getComponent(CommonHeroAvatar);
            this.node.addChild(this._actor.node);
            this._actor.init();
            this._actor.updateUI(myHeroId, '', false, limit);
            this._actor.setScale(ChapterRunMapNode.SCALE_AVATAR);
            this._actor.setAction('idle', true);
            loadCallback();
        }.bind(this));
    }

    private _runAction() {
        this._actor.node.setPosition(this._startPos.x, this._startPos.y);
        this._actor.node.active = false;
        var interval = 1 / 30;
        var delayAction = cc.delayTime(0 * interval);
        var delayAction01 = cc.delayTime(1 * interval);
        var delayAction02 = cc.delayTime(11 * interval);
        var delayAction03 = cc.delayTime(70 * interval);
        var delayAction04 = cc.delayTime(88 * interval);
        var delayAction05 = cc.delayTime(95 * interval);

        var idleAction = cc.callFunc(function () {
            this._actor.node.active = (true);
            this._onPlayActor('idle');
        }.bind(this));
        var winAction = cc.callFunc(function () {
            this._onPlayActor('win');
        }.bind(this));
        var runAction = cc.callFunc(function () {
            this._onRun(this._endPos);
        }.bind(this));
        var fadeAction = cc.callFunc(function () {
            this._actor.node.runAction(cc.fadeOut(7 * interval));
        }.bind(this));
        var finishAction = cc.callFunc(function () {
            this._onFinish();
        }.bind(this));
        var action = cc.sequence(delayAction, cc.spawn(
            cc.sequence(delayAction01, idleAction),
            cc.sequence(delayAction02, winAction),
            cc.sequence(delayAction03, runAction),
            cc.sequence(delayAction04, fadeAction),
            cc.sequence(delayAction05, finishAction)));
        this.node.runAction(action);
    }

    private _onPlayActor(actorName) {
        this._actor.setAction(actorName, true);
    }

    private _onRun(endPos) {
        this._actor.setAction('run', true);
        var interval = 1 / 30;
        var action = cc.moveTo((95 - 70) * interval, endPos);
        this._actor.node.runAction(action);
    }

    private _onFinish() {
        this.node.destroy();
    }
}