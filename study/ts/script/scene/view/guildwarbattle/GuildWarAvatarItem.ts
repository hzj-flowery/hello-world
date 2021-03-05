const { ccclass, property } = cc._decorator;

import CommonGuildFlagVertical from '../../../ui/component/CommonGuildFlagVertical'

import CommonHeroAvatar from '../../../ui/component/CommonHeroAvatar'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { TextHelper } from '../../../utils/TextHelper';
import { Colors } from '../../../init';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';

@ccclass
export default class GuildWarAvatarItem extends ViewBase {

    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _commonHeroAvatar: CommonHeroAvatar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName: cc.Label = null;

    @property({
        type: CommonGuildFlagVertical,
        visible: true
    })
    _commonGuildFlag: CommonGuildFlagVertical = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _loadingBarHp: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageProgress: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPowerValue: cc.Label = null;


    public static readonly SCALE = 0.7;
    public static readonly PROGRESS_IMGS = [
        'img_war_member03e',
        'img_war_member03d',
        'img_war_member03c',
        'img_war_member03b',
        'img_war_member03a'
    ];
    _callback: any;
    _warUserData: any;

    onCreate() {
        this._commonHeroAvatar.setCallBack(handler(this, this._onHeroClick));
        // this._imageProgress.ignoreContentAdaptWithSize(true);
    }
    onEnter() {
    }
    onExit() {
    }
    _onHeroClick() {
        if (this._callback) {
            this._callback(this._warUserData);
        }
    }
    setHeroClickCallback(callback) {
        this._callback = callback;
    }
    updateInfo(warUserData) {
        this._warUserData = warUserData;
        this._updateHeroSpine();
        this._updateHeroPower();
        this._updateHeroName();
        this._updateGuildFlag();
        this._updateHp();
    }
    turnBack(value) {
        this._commonHeroAvatar.turnBack(value);
    }
    _updateHeroSpine() {
        this._commonHeroAvatar.updateAvatar(this._warUserData.getPlayerInfo());
        this._commonHeroAvatar.setTouchEnabled(true);
        this._commonHeroAvatar.setScale(GuildWarAvatarItem.SCALE);
        this._commonHeroAvatar.turnBack();
    }
    _updateHeroPower() {
        var sizeText = TextHelper.getAmountText(this._warUserData.getPower());
        this._textPowerValue.string = (sizeText);
    }
    _updateHeroName() {
        this._textName.string = (this._warUserData.getUser_name());
        var officerLevel = this._warUserData.getOfficer_level();
        this._textName.node.color = (Colors.getOfficialColor(officerLevel));
    }
    _updateGuildFlag() {
        var name = this._warUserData.getGuild_name();
        var index = this._warUserData.getGuild_icon();
        this._commonGuildFlag.updateUI(index, name);
    }
    _updateHp() {
        var maxHp = GuildWarDataHelper.getGuildWarHp();
        var hp = this._warUserData.getWar_value();
        if (hp <= 0) {
            this._imageProgress.node.active = (false);
        } else {
            this._imageProgress.node.active = (true);
            UIHelper.loadTexture(this._imageProgress, Path.getGuildWar(GuildWarAvatarItem.PROGRESS_IMGS[hp]));
        }
    }

}