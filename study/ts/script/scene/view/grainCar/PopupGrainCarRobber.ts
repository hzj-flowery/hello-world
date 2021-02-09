import { Colors, G_SceneManager, G_ServerTime, G_UserData } from "../../../init";
import CommonGuildFlagVertical from "../../../ui/component/CommonGuildFlagVertical";
import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import MineBarNode from "../mineCraft/MineBarNode";
import PopupMineUser from "../mineCraft/PopupMineUser";


const { ccclass, property } = cc._decorator;
@ccclass
export default class  PopupGrainCarRobber extends ViewBase {
    
    @property({
        type: MineBarNode,
        visible: true
    })
    _barArmy: MineBarNode = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchPanel: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeFlag: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textUserName: cc.Label = null;

    

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: CommonGuildFlagVertical,
        visible: true
    })
    _guildFlag: CommonGuildFlagVertical = null;

    

    @property({ type: cc.Prefab, visible: true })
    _avatarPrefab: cc.Prefab = null;

    
    static SCALE_AVATAR = 0.5;
    static SCALE_TOTAL = 0.9;
    private _data;
    private _heroAvatar:CommonHeroAvatar;
    private _mineUser;
    private _lastAvatarId;
    ctor(data) {
        this._data = data;
    }
    onCreate() {
        // this._touchPanel.setSwallowTouches(false);
        this._heroAvatar =  cc.instantiate(this._avatarPrefab).getComponent(CommonHeroAvatar);
        this._nodeAvatar.addChild(this._heroAvatar.node);
    }
    onEnter() {
        this.node.setScale(PopupGrainCarRobber.SCALE_TOTAL);
    }
    onExit() {
    }
    faceLeft() {
        this._heroAvatar.turnBack();
    }
    faceRight() {
        this._heroAvatar.turnBack(false);
    }
    updateAvatar(mineUser) {
        this._mineUser = mineUser;
        var id = mineUser.getAvatar_base_id();
        var limit = AvatarDataHelper.getAvatarConfig(id).limit == 1 && 3;
        var avatarId =UserDataHelper.convertToBaseIdByAvatarBaseId(mineUser.getAvatar_base_id(), mineUser.getBase_id())[0];
        this._lastAvatarId = avatarId;
        this._heroAvatar.updateUI(avatarId, null, null, limit);
        this._heroAvatar.setScale(PopupGrainCarRobber.SCALE_AVATAR);
        this._textUserName.string = (mineUser.getUser_name());
        var officerLevel = mineUser.getOfficer_level();
        this._textUserName.node.color = (Colors.getOfficialColor(officerLevel));
         UIHelper.updateTextOfficialOutlineForceShow(this._textUserName, officerLevel);
        this._barArmy.setPercent(mineUser.getArmy_value(), true, G_ServerTime.getLeftSeconds(mineUser.getPrivilege_time()) > 0);
        if (mineUser.getGuild_id() > 0) {
            this._nodeFlag.active = (true);
            this._guildFlag.updateUI(mineUser.getGuild_icon(), mineUser.getGuild_name());
        } else {
            this._nodeFlag.active = (false);
        }
    }
    _onPanelClick(sender) {
        if (!this._mineUser) {
            return;
        }
        var moveOffsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var moveOffsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            if (this._mineUser.getUser_id() != G_UserData.getBase().getId()) {
                G_SceneManager.openPopup(Path.getPrefab("PopupMineUser","mineCraft"),function(pop:PopupMineUser){
                    pop.setInitData(this._mineUser.getUser_id(), this._data);
                    pop.openWithAction();
                }.bind(this));
            }
        }
    }
}
