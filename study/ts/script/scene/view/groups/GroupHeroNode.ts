import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import CommonHeroPower from "../../../ui/component/CommonHeroPower";
import { handler } from "../../../utils/handler";
import GroupsButton3 from "./GroupsButton3";
import { Lang } from "../../../lang/Lang";
import { G_UserData, Colors, G_SceneManager } from "../../../init";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import PopupUserBaseInfo from "../../../ui/popup/PopupUserBaseInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GroupHeroNode extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _panel: cc.Node = null;
    @property({ type: cc.Button, visible: true })
    _buttonAdd: cc.Button = null;
    @property({ type: CommonHeroAvatar, visible: true })
    _nodeHeroAvatar: CommonHeroAvatar = null;
    @property({ type: cc.Label, visible: true })
    _textGuildName: cc.Label = null;
    @property({ type: cc.Label, visible: true })
    _textPlayerName: cc.Label = null;
    @property({ type: cc.Sprite, visible: true })
    _imageLeaderFlag: cc.Sprite = null;
    @property({ type: GroupsButton3, visible: true })
    _buttonOut: GroupsButton3 = null;
    @property({ type: cc.Node, visible: true })
    _imagePower: cc.Node = null;
    @property({ type: CommonHeroPower, visible: true })
    _nodePower: CommonHeroPower = null;

    private _onAddCallback;
    private _onOutCallback;
    private _userData;

    public init(onAddCallback, onOutCallback) {
        this._onAddCallback = onAddCallback;
        this._onOutCallback = onOutCallback;
        this._nodeHeroAvatar.init();
        this._nodeHeroAvatar.setCallBack(handler(this, this._onClickHero));
        this._buttonOut.setString(Lang.get('groups_btn_kick_out'));
        this._buttonOut.addClickEventListenerEx(handler(this, this._onClickOut));
        this.node.setContentSize(this._panel.getContentSize());
    }

    private _initUI() {
        this._buttonAdd.node.active = false;
        this._nodeHeroAvatar.node.active = false;
        this._textGuildName.node.active = false;
        this._textPlayerName.node.active = false;
        this._imageLeaderFlag.node.active = false;
        this._buttonOut.node.active = false;
        this._imagePower.active = false;
    }

    public updataUI(userData) {
        this._userData = userData;
        this._initUI();
        if (userData) {
            this._nodeHeroAvatar.node.active = true;
            this._textGuildName.node.active = true;
            this._textPlayerName.node.active = true;
            this._imagePower.active = true;
            var isSelfLeader = G_UserData.getGroups().isSelfLeader();
            if (isSelfLeader && !userData.isSelf()) {
                this._buttonOut.node.active = true;
            }
            this._nodeHeroAvatar.updateUI(userData.getCovertId(), null, null, userData.getLimitLevel());
            this._nodeHeroAvatar.setTouchEnabled(true);
            this._imageLeaderFlag.node.active = (userData.isLeader());
            var guildName = userData.getGuild_name();
            if (guildName == '') {
                guildName = Lang.get('groups_hero_no_guild');
            }
            this._textGuildName.string = (guildName);
            this._textPlayerName.string = (userData.getName());
            this._textPlayerName.node.color = (Colors.getOfficialColor(userData.getOffice_level()));
            UIHelper.enableOutline(this._textPlayerName, Colors.getOfficialColorOutline(userData.getOffice_level()), 2);
            this._nodePower.updateUI(userData.getPower());
            this._nodeHeroAvatar.showTitle(userData.getTitle(), "GroupHeroNode");
        } else {
            this._buttonAdd.node.active = true;
        }
    }

    public onClickAdd() {
        if (this._onAddCallback) {
            this._onAddCallback();
        }
    }

    private _onClickOut() {
        if (this._onOutCallback) {
            this._onOutCallback(this._userData);
        }
    }

    private _onClickHero() {
        if (this._userData.isSelf()) {
            return;
        }
        G_SceneManager.openPopup(Path.getPrefab("PopupUserBaseInfo", "common"), (popup:PopupUserBaseInfo) => {
            popup.updateUI(this._userData);
            popup.openWithAction();
        });
    }

    public isEmpty() {
        if (this._userData) {
            return false;
        } else {
            return true;
        }
    }

    public getHeroAvatar() {
        return this._nodeHeroAvatar;
    }
}