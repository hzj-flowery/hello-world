const { ccclass, property } = cc._decorator;

import CommonBox from '../../../ui/component/CommonBox'
import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import { Path } from '../../../utils/Path';
import { handler } from '../../../utils/handler';
import { G_UserData, G_ConfigLoader, Colors, G_Prompt, G_SceneManager } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import UIHelper from '../../../utils/UIHelper';
import { Lang } from '../../../lang/Lang';
import PopupSiegeChallenge from './PopupSiegeChallenge';

@ccclass
export default class SiegeNode extends cc.Component {

    @property({ type: CommonHeroAvatar, visible: true })
    _nodeAvatar: CommonHeroAvatar = null;

    @property({ type: cc.Sprite, visible: true })
    _imageKill: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageShared: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _nodeInfo: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageHpBg: cc.Sprite = null;

    @property({ type: cc.ProgressBar, visible: true })
    _hpBar: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _stageName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeDiscover: cc.Node = null;

    @property({ type: CommonBox, visible: true })
    _btnBox: CommonBox = null;

    private _siegeUid;
    private _siegeId;
    private _siegeData;
    private _isKilled;
    private _siegeInfo;

    public init(uid, id) {
        this._siegeUid = uid;
        this._siegeId = id;
        this._siegeData = G_ConfigLoader.getConfig(ConfigNameConst.REBEL_BASE).get(id);
        this._isKilled = false;
        this._nodeAvatar.init();
    }

    public onLoad() {
        var boxParams = {
            picNormal: Path.getCommonIcon('common', 'img_mapbox_guan'),
            picEmpty: Path.getCommonIcon('common', 'img_mapbox_kong'),
            effect: 'effect_boxjump'
        };
        this._btnBox.setParams(boxParams);
        this._btnBox.addClickEventListenerEx(handler(this, this._onBoxClick));
        this._refreshStage();
        this._nodeAvatar.setTouchEnabled(true);
        this._nodeAvatar.setScale(0.8);
        this._nodeAvatar.turnBack();
    }

    public _refreshStage() {
        this._siegeInfo = G_UserData.getSiegeData().getSiegeEnemyData(this._siegeUid, this._siegeId);
        if (!this._siegeInfo || this._siegeInfo.isNotExist()) {
            this._isKilled = true;
        } else {
            this._nodeAvatar.setBubbleVisible(false);
            this._nodeAvatar.updateUI(this._siegeData.res);
            this._nodeAvatar.setCallBack(handler(this, this._onAvatarClick));
            this._stageName.string = (this._siegeData.name);
            this._stageName.node.color = (Colors.getColor(this._siegeData.color));
            UIHelper.enableOutline(this._stageName, Colors.getColorOutline(this._siegeData.color), 2);
            var officerLevel = this._siegeInfo.getOfficer_level();
            var disCoverName = this._siegeInfo.getUser_name();
            var fontBaseColor = Colors.getOfficialColor(officerLevel);
            var outLineColor = Colors.getOfficialColorOutline(officerLevel);
            // TODO:RichText
            // var discoverLabel = ccui.RichText.createWithContent(Lang.get('siege_discover', {
            //     name: disCoverName,
            //     fontColor: Colors.colorToNumber(fontBaseColor),
            //     outColor: Colors.colorToNumber(outLineColor)
            // }));
            // discoverLabel.setAnchorPoint(cc.v2(0.5, 0.5));
            // this._nodeDiscover.removeAllChildren();
            // this._nodeDiscover.addChild(discoverLabel);
            var height = this._nodeAvatar.getHeight() * 0.8;
            this._nodeInfo.y = (height);
            if (this._siegeInfo.getKiller_id() != 0) {
                this._isKilled = true;
            } else {
                this._isKilled = false;
            }
            this.refreshBoxState();
            this._imageShared.node.active = (this._siegeInfo.isPublic());
        }
        this._imageKill.node.active = (this._isKilled);
        if (this._isKilled) {
            this._imageShared.node.active = (false);
        }
        this.refreshHpBar();
    }

    public refreshHpBar() {
        this._imageHpBg.node.active = (!this._isKilled);
        if (this._isKilled) {
            return;
        }
        var nowHp = this._siegeInfo.getHp_now();
        var maxHp = this._siegeInfo.getHp_max();
        var hpPercent = nowHp / maxHp;
        this._hpBar.progress = (hpPercent);
    }

    public refreshBoxState() {
        if (!this._isKilled) {
            this._btnBox.node.active = (false);
            return;
        }
        this._btnBox.node.active = (true);
        if (this._siegeInfo.isBoxEmpty()) {
            this._btnBox.setState('empty');
        } else {
            this._btnBox.playBoxJump();
        }
    }

    public refreshSiege() {
        this._refreshStage();
    }

    public _onAvatarClick() {
        if (!this._isKilled) {
            G_SceneManager.openPopup(Path.getPrefab("PopupSiegeChallenge","siege"),(popupSiegeChallenge:PopupSiegeChallenge)=>{
                popupSiegeChallenge.init(this._siegeData, this._siegeUid, this._siegeId);
                popupSiegeChallenge.open();
            })
        }
    }

    public _onBoxClick() {
        if (!this._siegeInfo.isBoxEmpty()) {
            G_UserData.getSiegeData().c2sRebArmyKillReward(this._siegeUid, this._siegeId);
        } else {
            G_Prompt.showTip(Lang.get('siege_already_get_box'));
        }
    }

}