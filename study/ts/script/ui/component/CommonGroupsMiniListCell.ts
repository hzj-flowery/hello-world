import CommonHeroIcon from "./CommonHeroIcon";
import CommonHeadFrame from "./CommonHeadFrame";
import { Path } from "../../utils/Path";
import UIHelper from "../../utils/UIHelper";
import { Colors } from "../../init";
import { Lang } from "../../lang/Lang";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CommonGroupsMiniListCell extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resourceNode: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _buttonAdd: cc.Button = null;

    @property({ type: CommonHeroIcon, visible: true })
    _icon: CommonHeroIcon = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLeader: cc.Sprite = null;

    @property({ type: CommonHeadFrame, visible: true })
    _commonHeadFrame: CommonHeadFrame = null;

    @property({ type: cc.Sprite, visible: true })
    _imageLocation: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textName: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textState: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    private RES_NAME = {
        1: 'txt_qintomb_jia01',
        2: 'txt_qintomb_yi02',
        3: 'txt_qintomb_bing03'
    };
    private _callback;
    private _userData;

    public init(callback) {
        this._callback = callback;
    }

    public onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    public _initUI() {
        this._buttonAdd.node.active = (false);
        this._icon.node.active = (false);
        this._textState.node.active = (false);
    }

    public updateUI(userData, location) {
        this._userData = userData;
        this._initUI();
        var locationRes = Path.getTextQinTomb(this.RES_NAME[location]);
        UIHelper.loadTexture(this._imageLocation, locationRes);
        if (userData) {
            this._icon.node.active = (true);
            this._icon.updateUI(userData.getCovertId(), null, userData.getLimitLevel());
            this._commonHeadFrame.updateUI(userData.getHead_frame_id(), this._icon.node.scale);
            this._commonHeadFrame.setLevel(userData.getLevel());
            this._imageLeader.node.active = (userData.isLeader());
            this._textName.string = (userData.getName());
            this._textName.node.color = (Colors.getOfficialColor(userData.getOffice_level()));
        } else {
            this._buttonAdd.node.active = (true);
            this._textName.string = (Lang.get('groups_mini_list_add_user_tip'));
            this._textName.node.color =(Colors.BRIGHT_BG_TWO);
        }
    }

    public onClick() {
        if (this._callback) {
            this._callback(this._userData);
        }
    }
}