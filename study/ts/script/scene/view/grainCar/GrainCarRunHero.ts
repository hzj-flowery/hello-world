import { G_SceneManager } from "../../../init";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import { SceneManager } from "../../SceneManager";
import ViewBase from "../../ViewBase";


const { ccclass, property } = cc._decorator;
@ccclass
export default class GrainCarRunHero  extends ViewBase {

    static SCALE_AVATAR = 0.8;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _CommonHeroAvatar: cc.Prefab = null;
    private _heroAvatar:CommonHeroAvatar;
    ctor() {
        
    }
    onCreate() {
        this._nodeAvatar.removeAllChildren();
        var resource = cc.resources.get("prefab/common/CommonHeroAvatar");
        let node1 = cc.instantiate(resource) as cc.Node;
        this._heroAvatar = node1.getComponent(CommonHeroAvatar) as CommonHeroAvatar;
        this._heroAvatar.init();
        this._heroAvatar.node.name = "CommonHeroAvatar";
        this._nodeAvatar.addChild(this._heroAvatar.node);
    }
    onEnter() {
        this.node.setScale(GrainCarRunHero.SCALE_AVATAR);
    }
    onExit() {
    }
    faceLeft() {
        this._heroAvatar.turnBack();
    }
    faceRight() {
        this._heroAvatar.turnBack(false);
    }
    playRun() {
        this._heroAvatar.setAction('run', true);
    }
    playIdle() {
        this._heroAvatar.setAction('idle', true);
    }
    playWin() {
        this._heroAvatar.setAction('win', true);
    }
    updateAvatar(simpleUserData) {
        var avatarBaseId = simpleUserData.getAvatar_base_id();
        var baseId = simpleUserData.getLeader();
        var limit = AvatarDataHelper.getAvatarConfig(avatarBaseId).limit == 1 && 3;
        var avatarId = UserDataHelper.convertToBaseIdByAvatarBaseId(avatarBaseId, baseId)[0];
        this._heroAvatar.updateUI(avatarId, null, null, limit);
    }
};
