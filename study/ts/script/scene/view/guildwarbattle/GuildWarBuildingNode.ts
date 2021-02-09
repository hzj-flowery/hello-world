import ViewBase from "../../ViewBase";
import { G_UserData } from "../../../init";
import { clone } from "../../../utils/GlobleFunc";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarBuildingNode extends ViewBase {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imagePoint: cc.Sprite = null;
    _zorderHelepr: any;
    _cityId: any;
    _config: any;
    _warWatch: any;
    _GuildWarBuildingHpNode: any;

    initData(zorderHelepr, cityId, config) {
        this._zorderHelepr = zorderHelepr;
        this._cityId = cityId;
        this._config = config;
        this._warWatch = clone(G_UserData.getGuildWar().getWarWatchById(this._cityId, this._config.point_id));
        this._GuildWarBuildingHpNode = null;
    }
    onCreate() {
        var x = this._config.x, y = this._config.y;
        this.node.setPosition(x, y);
        this._imagePoint.sizeMode = cc.Sprite.SizeMode.RAW;
        UIHelper.loadTexture(this._imagePoint, Path.getGuildWar(this._config.city_pic));
        this.node.zIndex = (this._zorderHelepr.getZOrder(x, y));
    }
    onEnter() {
    }
    onExit() {
    }
    syn() {
        var nowWarWatch = G_UserData.getGuildWar().getWarWatchById(this._cityId, this._config.point_id);
        var maxHp = this._config.build_hp;
        var hp = maxHp;
        var oldHp = maxHp;
        if (this._warWatch) {
            oldHp = this._warWatch.watch_value_;
        }
        if (nowWarWatch) {
            hp = nowWarWatch.watch_value_;
        }
        if (hp <= 0) {
            UIHelper.loadTexture(this._imagePoint, Path.getGuildWar(this._config.city_pic_break));
        } else {
            UIHelper.loadTexture(this._imagePoint, Path.getGuildWar(this._config.city_pic));
        }
        this._warWatch = nowWarWatch;
    }
    doHitAction() {
    }
    stopHitAction() {
    }
    getPointId() {
        return this._config.point_id;
    }

}