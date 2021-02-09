import ViewBase from "../../ViewBase";
import { G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { Path } from "../../../utils/Path";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarBuildingHpNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHp: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCut: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBarBG: cc.Sprite = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _barGreen: cc.ProgressBar = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPercent: cc.Label = null;
    _cityId: any;
    _config: any;
    _progressRing: any;

    initData(cityId, config) {
        this._cityId = cityId;
        this._config = config;
        this._progressRing = null;
    }
    onCreate() {
        var clickPointX = this._config.clickPos.x;
        var clickPointY = this._config.clickPos.y;
        var x = this._config.x;
        var y = this._config.y;
        var hpX = this._config.hp_x;
        var hpY = this._config.hp_y;
        this.node.setPosition(hpX, hpY);
    }
    onEnter() {
    }
    onExit() {
    }
    syn() {
        var nowWarWatch = G_UserData.getGuildWar().getWarWatchById(this._cityId, this._config.point_id);
        var maxHp = this._config.build_hp;
        var hp = maxHp;
        if (nowWarWatch) {
            hp = nowWarWatch.getWatch_value();
        }
        this.updateInfo(hp, maxHp);
        this.node.active = (hp > 0);
    }
    updateInfo(hp, maxHP) {
        var percent = Math.floor(hp * 100 / maxHP);
        this._barGreen.progress = (percent / 100);
        var strPercent = Lang.get('guildwar_building_hp_percent', { value: percent });
        this._textPercent.string = (strPercent);
    }
    _createProgress() {
        var pic = Path.getGuildWar('img_war_com03b');
        // this._progressRing = new cc.ProgressTimer(new cc.Sprite(pic));
        // this._progressRing.setReverseDirection(false);
        // var size = this._panelCut.getContentSize();
        // this._progressRing.setPosition(size.width * 0.5, 0);
        // this._progressRing.setRotation(90);
        // this._panelCut.addChild(this._progressRing);
    }
    getPointId() {
        return this._config.point_id;
    }

}