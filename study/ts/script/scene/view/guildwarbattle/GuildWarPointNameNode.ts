import { GuildWarConst } from "../../../const/GuildWarConst";
import { Lang } from "../../../lang/Lang";
import { G_UserData, Colors } from "../../../init";
import { GuildWarDataHelper } from "../../../utils/data/GuildWarDataHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildWarPointNameNode extends cc.Component {
    _target: cc.Node;
    _textName: cc.Label;
    _textGuild: cc.Label;
    initData(target) {
        this._target = target;
        this._textName = this._target.getChildByName('TextName').getComponent(cc.Label) as cc.Label;
        this._textGuild = this._target.getChildByName('TextGuild').getComponent(cc.Label) as cc.Label;
    }
    updateInfo(cityId, config) {
        if (config.point_type == GuildWarConst.POINT_TYPE_CRYSTAL) {
            var user = this._getDefenderName(cityId);
            if (user) {
                this._textName.string = (config.name);
                this._textGuild.node.active = (true);
                this._textGuild.string = (Lang.get('guildwar_crystal_name', { user: user }));
                this._textGuild.node.setPosition(config.hp_x - config.clickPos.x, config.hp_y - config.clickPos.y + 20);
                this._refreshColor(cityId);
                // dump(user);
            } else {
                // print('-------------------- aaa');
                this._textGuild.node.active = (false);
                this._textName.string = (config.name);
            }
        } else {
            this._textGuild.node.active = (false);
            this._textName.string = (config.name);
        }
    }
    _getDefenderName(cityId) {
        var guildId = G_UserData.getGuildWar().getBattleDefenderGuildId(cityId);
        var guildInfo = G_UserData.getGuildWar().getBattleDefenderGuildInfo(cityId);
        var showDefender = guildId && guildId != 0;
        if (showDefender) {
            return guildInfo.guildName;
        }
        return null;
    }
    _refreshColor(cityId) {
        var isDefender = GuildWarDataHelper.selfIsDefender(cityId);
        if (isDefender) {
            this._textGuild.node.color = (Colors.GUILD_WAR_SAME_GUILD_COLOR);
            UIHelper.enableOutline(this._textGuild, Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE, 2);
        } else {
            this._textGuild.node.color = (Colors.GUILD_WAR_ENEMY_COLOR);
            UIHelper.enableOutline(this._textGuild, Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE, 2);
        }
    }
}