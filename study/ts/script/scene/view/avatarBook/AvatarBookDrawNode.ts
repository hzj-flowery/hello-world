import CommonAttrNode from "../../../ui/component/CommonAttrNode";
import CommonAvatarIcon from "../../../ui/component/CommonAvatarIcon";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";
import { G_UserData, Colors, G_SceneManager } from "../../../init";
import { Path } from "../../../utils/Path";
import CommonUI from "../../../ui/component/CommonUI";
import UIHelper from "../../../utils/UIHelper";

const {ccclass, property} = cc._decorator;


var COLOR_KARMA = [
    [
        new cc.Vec3(255, 222, 109),
        new cc.Vec4(212, 77, 8, 255)
    ],
    [
        new cc.Vec3(243, 255, 43),
        new cc.Vec4(100, 189, 13, 255)
    ]
];

@ccclass
export default class AvatarBookDrawNode extends cc.Component {

    
    

    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr1: CommonAttrNode = null;
    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr2: CommonAttrNode = null;
    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr3: CommonAttrNode = null;
    @property({
        type: CommonAttrNode,
        visible: true
    })
    _fileNodeAttr4: CommonAttrNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonActive: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageActivated: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTitle: cc.Label = null;

    @property({
        type: CommonAvatarIcon,
        visible: true
    })
    _fileNodeIcon1: CommonAvatarIcon = null;

    @property({
        type: CommonAvatarIcon,
        visible: true
    })
    _fileNodeIcon2: CommonAvatarIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;

    



    private _callback:any;
    private _bookId:number;
    private _avatarId1:number;
    private _avatarId2:number;

    setInitData(callback) {
        this._callback = callback;
        this._init();
    }
    _init() {
        this._buttonActive.addClickEventListenerEx(handler(this, this._onButtonClicked));
        this._buttonActive.setString(Lang.get('avatar_btn_active'));
        this._fileNodeIcon1.setTouchEnabled(true);
        this._fileNodeIcon2.setTouchEnabled(true);
        this._fileNodeIcon1.setCallBack(handler(this, this._onClickIcon1));
        this._fileNodeIcon2.setCallBack(handler(this, this._onClickIcon2));
    }
    updateUI(bookId) {
        this._bookId = bookId;
        this._updateBaseInfo(bookId);
        for (var i = 1; i <= 2; i++) {
            this._updateIcon(i);
        }
        this._updateAttr(bookId);
    }
    _updateBaseInfo(bookId) {
        var showConfig = AvatarDataHelper.getAvatarShowConfig(bookId);
        var name = showConfig.name;
        this._avatarId1 = showConfig.avatar_id1;
        this._avatarId2 = showConfig.avatar_id2;
        this._textTitle.string = (name);
    }
    _updateIcon(index) {
        var avatarId = this['_avatarId' + index];
        var isHave = G_UserData.getAvatar().isHaveWithBaseId(avatarId);
        var avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId);
        this['_fileNodeIcon' + index].updateUI(avatarId);
        this['_fileNodeIcon' + index].setIconMask(!isHave);
        var count:number = 0;
        for(var j =0;j<avatarConfig.list_name.length;j++)
        {
            if(avatarConfig.list_name[j]!=" ")
            count++;
        }
        if(count<=5)
        {
            (avatarConfig.list_name as string) = (avatarConfig.list_name as string).slice(1)
        }
        this['_textName' + index].string = (avatarConfig.list_name);
        this['_textName' + index].node.color = (Colors.getColor(avatarConfig.color));
    }
    _updateAttr(bookId) {
        var isHave = AvatarDataHelper.isHaveAvatarShow(bookId);
        var isActive = G_UserData.getAvatarPhoto().isActiveWithId(bookId);
        this._buttonActive.setEnabled(isHave);
        this._buttonActive.setVisible(!isActive);
        this._imageActivated.node.active = (isActive);
        var reach = AvatarDataHelper.isCanActiveBookWithId(bookId);
        this._buttonActive.showRedPoint(reach);
        var color = isActive && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_TWO;
        var attrInfo = AvatarDataHelper.getShowAttr(bookId);
        for (var i = 1; i <= 4; i++) {
            var info = attrInfo[i-1];
            if (info) {
                var attrId = info.attrId;
                var attrValue = info.attrValue;
                (this['_fileNodeAttr' + i] as CommonAttrNode).updateView(attrId, attrValue, 0);
                (this['_fileNodeAttr' + i] as CommonAttrNode).setNameColor(color);
                (this['_fileNodeAttr' + i] as CommonAttrNode).setValueColor(color);
                (this['_fileNodeAttr' + i] as CommonAttrNode).setVisible(true);
            } else {
                (this['_fileNodeAttr' + i] as CommonAttrNode).setVisible(false);
            }
        }
        var resName = isActive && Path.getFetterRes('img_namebg_light') || Path.getFetterRes('img_namebg_nml');
        this._imageTitle.node.addComponent(CommonUI).loadTexture(resName);
        var titleColor = isActive && COLOR_KARMA[1][0] || COLOR_KARMA[0][0];
        var titleOutline = isActive && COLOR_KARMA[1][1] || COLOR_KARMA[0][1];
        this._textTitle.node.color = new cc.Color(titleColor.x,titleColor.y,titleColor.z);
        UIHelper.enableOutline(this._textTitle,new cc.Color(titleOutline.x,titleOutline.y,titleOutline.z),2)
    }
    _onClickIcon1(sender:cc.Touch, state) {
        G_UserData.getAvatar().setCurAvatarId(this._avatarId1);
            G_SceneManager.popScene();
    }
    _onClickIcon2(sender:cc.Touch, state) {
        G_UserData.getAvatar().setCurAvatarId(this._avatarId2);
        G_SceneManager.popScene();
    }
    _onButtonClicked() {
        if (this._callback) {
            this._callback();
        }
    }


}