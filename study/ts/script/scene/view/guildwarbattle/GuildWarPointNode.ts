const { ccclass, property } = cc._decorator;

import GuildWarPointNameNode from './GuildWarPointNameNode'

import GuildWarPopulationNode from './GuildWarPopulationNode'
import ViewBase from '../../ViewBase';
import { G_UserData } from '../../../init';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { GuildWarDataHelper } from '../../../utils/data/GuildWarDataHelper';
import { Util } from '../../../utils/Util';

@ccclass
export default class GuildWarPointNode extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouchRegion: cc.Node = null;

    @property({
        type: GuildWarPopulationNode,
        visible: true
    })
    _populationNode: GuildWarPopulationNode = null;

    @property({
        type: GuildWarPointNameNode,
        visible: true
    })
    _nameNode: GuildWarPointNameNode = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageState: cc.Sprite = null;
    _cityId: any;
    _config: any;
    _listener: any;
    _guildWarAttackNode: any;
    _guildWarPopulationNode: GuildWarPopulationNode;
    _guildWarPointNameNode: GuildWarPointNameNode;

    initData(cityId, config) {
        this._cityId = cityId;
        this._config = config;
    }
    onCreate() {
        let res = this._config.click_point.split("|");
        var x = res[0];
        var y = res[1];
        this.node.setPosition(x, y);
        this._setTouchSize();
        // this._panelTouchRegion.setSwallowTouches(false);
        this._guildWarPointNameNode = Util.getNode("prefab/guildwarbattle/GuildWarPointNameNode", GuildWarPointNameNode) as GuildWarPointNameNode;
        this._guildWarPointNameNode.initData(this._nameNode.node);
        this._guildWarPopulationNode = Util.getNode("prefab/guildwarbattle/GuildWarPopulationNode", GuildWarPopulationNode) as GuildWarPopulationNode;
        this._guildWarPopulationNode.initData(this._populationNode.node);
        // if (this._isBuilding()) {
        // }
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
    onPointClick(sender, state) {
        if (this._listener) {
            this._listener(this._cityId, this._config.point_id);
        }
    }
    setOnPointClickListener(listener) {
        this._listener = listener;
        if (this._guildWarAttackNode) {
            this._guildWarAttackNode.setOnPointClickListener(listener);
        }
    }
    onEnter() {
    }
    onExit() {
    }
    updateInfo() {
        var guildWarUser = G_UserData.getGuildWar().getMyWarUser(this._cityId);
        var isSelfInPoint = guildWarUser.getCurrPoint() == this._config.point_id;
        if (isSelfInPoint) {
            this._imageState.node.active = (false);
            UIHelper.loadTexture(this._imageState, Path.getGuildWar('img_war_com02c'));
        } else {
            this._imageState.node.active = (false);
        }
        if (this._guildWarAttackNode) {
            if (isSelfInPoint) {
                var isDefender = GuildWarDataHelper.selfIsDefender(this._cityId);
                var canAttack = this._isLivingBuilding() && !isDefender;
                this._guildWarAttackNode.setVisible(canAttack);
            } else {
                this._guildWarAttackNode.setVisible(false);
            }
        }
        this._guildWarPopulationNode.updateInfo(this._cityId, this._config.point_id);
        this._guildWarPointNameNode.updateInfo(this._cityId, this._config);
    }
    getPointId() {
        return this._config.point_id;
    }
    _isBuilding() {
        return this._config.build_hp > 0;
    }
    _isLivingBuilding() {
        if (this._config.build_hp > 0) {
            var nowWarWatch = G_UserData.getGuildWar().getWarWatchById(this._cityId, this._config.point_id);
            var maxHp = this._config.build_hp;
            var hp = maxHp;
            if (nowWarWatch) {
                hp = nowWarWatch.getWatch_value();
            }
            return hp > 0;
        }
        return false;
    }

}