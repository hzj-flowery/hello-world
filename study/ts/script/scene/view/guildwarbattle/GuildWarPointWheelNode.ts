import ViewBase from "../../ViewBase";
import { GuildWarCheck } from "../../../utils/logic/GuildWarCheck";
import { G_UserData } from "../../../init";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarPointWheelNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAttack: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonMove: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonSeek: cc.Button = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonClose: cc.Button = null;
    _data: any;
    _listener: any;

    onCreate() {
    }
    onEnter() {
    }
    onExit() {
    }
    onButtonAttack() {
        var success = GuildWarCheck.guildWarCanAttackPoint(this._data.cityId, this._data.pointId, false, true);
        if (success[0]) {
            var pointId = this._data.pointId;
            G_UserData.getGuildWar().c2sGuildWarBattleWatch(pointId);
        }
    }
    onButtonMove() {
        var success = GuildWarCheck.guildWarCanMove(this._data.cityId, this._data.pointId, false, true);
        if (success) {
            var pointId = this._data.pointId;
            G_UserData.getGuildWar().c2sMoveGuildWarPoint(pointId);
        }
    }
    onButtonSeek() {
        // var PopupGuildWarPointDetail = require('PopupGuildWarPointDetail');
        // var popup = new PopupGuildWarPointDetail(this._data.cityId, this._data.pointId);
        // popup.setName('PopupGuildWarPointDetail');
        // popup.openWithAction();
    }
    _onButtonClose() {
        if (this._listener) {
            this._listener();
        }
    }
    _onImageSign() {
        var pointId = this._data.pointId;
        G_UserData.getGuildWar().c2sMoveGuildWarPoint(pointId);
    }
    updateInfo(data) {
        this._data = data;
        this._showBtn(true);
        var config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(data.cityId, data.pointId);
        var clickPointX = GuildWarDataHelper.decodePoint(config.click_point)[0];
        var clickPointY = GuildWarDataHelper.decodePoint(config.click_point)[1];
        this.node.setPosition(clickPointX, clickPointY - 87);
        var canMove = GuildWarCheck.guildWarCanMove(data.cityId, data.pointId, true, false)[0];
        var canAttack = GuildWarCheck.guildWarCanAttackPoint(data.cityId, data.pointId, true, false)[0];
        var canSeek = GuildWarCheck.guildWarCanSeek(data.cityId, data.pointId, false)[0];
        this._buttonAttack.node.active = (canAttack);
        this._buttonMove.node.active = (canMove);
        this._buttonSeek.node.active = (canSeek);
    }
    refreshView() {
        if (this._data) {
            this.updateInfo(this._data);
        }
    }
    _showBtn(visible) {
        this._imageBg.node.active = (visible);
        this._buttonAttack.node.active = (visible);
        this._buttonMove.node.active = (visible);
        this._buttonSeek.node.active = (visible);
    }
    setCloseListener(listener) {
        this._listener = listener;
    }

}