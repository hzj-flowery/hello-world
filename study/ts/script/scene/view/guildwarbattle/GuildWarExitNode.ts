import ViewBase from "../../ViewBase";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import { GuildWarConst } from "../../../const/GuildWarConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { GuildWarCheck } from "../../../utils/logic/GuildWarCheck";
import { SignalConst } from "../../../const/SignalConst";
import { G_SignalManager } from "../../../init";
import UIActionHelper from "../../../utils/UIActionHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarExitNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLight: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouchRegion: cc.Node = null;
    _cityId: any;
    _pointId: any;
    _config: any;

    ctor(cityId, poindId) {
        this._cityId = cityId;
        this._pointId = poindId;
        this._config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(cityId, poindId);
    }
    onCreate() {
        let res = this._config.click_point.split("|");
        var x = res[0];
        var y = res[1]
        this._setTouchSize();
        // this._panelTouchRegion.setSwallowTouches(false);
        var campType = GuildWarDataHelper.getSelfCampType(this._cityId);
        var goAttack = campType == GuildWarConst.CAMP_TYPE_DEFENDER;
        if (goAttack) {
            this._visibleSign(true);
            UIHelper.loadTexture(this._imageLight, Path.getTextSignet('img_guild_war01'));
        } else {
            this._visibleSign(true);
            UIHelper.loadTexture(this._imageLight, Path.getTextSignet('img_guild_war02b'));
        }
    }
    onEnter() {
    }
    _setTouchSize() {
        let res = this._config.click_point.split("|");
        var clickPointX = res[0];
        var clickPointY = res[1];
        var x = clickPointX;
        var y = clickPointY;
        var clickRadius = this._config.click_radius;
        clickPointX = clickPointX - x;
        clickPointY = clickPointY - y;
        this._panelTouchRegion.setPosition(clickPointX, clickPointY);
        this._panelTouchRegion.setContentSize(cc.size(clickRadius * 2, clickRadius * 2));
    }
    onExit() {
    }
    _onExitClick(sender, state) {
        var success = GuildWarCheck.guildWarCanExit(this._cityId, null);
        if (success) {
            G_SignalManager.dispatch(SignalConst.EVENT_GUILD_WAR_BATTLE_CHANGE_CITY, this._pointId);
        }
    }
    _visibleSign(show) {
        this._imageLight.node.active = (show);
        if (show) {
            UIActionHelper.playFloatXEffect(this._imageLight.node);
        } else {
            this._imageLight.node.stopAllActions();
        }
    }

}