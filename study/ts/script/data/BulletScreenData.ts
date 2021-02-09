import { BaseData } from './BaseData';
import { G_SignalManager, G_NetworkManager, G_ConfigLoader, G_UserData, Colors } from '../init';
import { SignalConst } from '../const/SignalConst';
import { MessageIDConst } from '../const/MessageIDConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { BullectScreenConst } from '../const/BullectScreenConst';
import { RichTextHelper } from '../utils/RichTextHelper';
export class BulletScreenData extends BaseData {

    public static SN_TYPE_GUILD_WAR = 4;
    public static SN_TYPE_GOLDGACHA = 5;
    public static SN_TYPE_GUILDCROSWAR = 6;
    public static SN_TYPE_GRAIN_CAR = 7;
    public static SN_TYPE_CROSS_BOSS_NORMAL_ATTACK = 8;
    public static SN_TYPE_CROSS_BOSS_CHARGE_ATTACK = 9;
    public static SN_TYPE_UNIVERSE_RACE = 10;

    public _getBulletNotice;
    public _bulletType;
    public _matchList;

    public _s2cBulletNotice(id, message) {
        G_SignalManager.dispatch(SignalConst.EVENT_BULLET_SCREEN_NOTICE, message);
    }
    constructor() {
        super()
        this._getBulletNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_BulletNotice, this._s2cBulletNotice.bind(this));
        this._bulletType = {};
        this._bulletType[1] = true;
        this._bulletType[2] = true;
        this._bulletType[4] = true;
        this._bulletType[5] = true;
        this._bulletType[6] = true;
        this._initCfg();
    }
    public _makeKey(snType, color) {
        return snType + ('k' + color);
    }
    public _initCfg() {
        this._matchList = {};
        let bullet_screen = G_ConfigLoader.getConfig(ConfigNameConst.BULLET_SCREEN);
        for (let i = 0; i < bullet_screen.length(); i += 1) {
            let config = bullet_screen.indexOf(i);
            let keyName = this._makeKey(config.type, config.color);
            this._matchList[keyName] = this._matchList[keyName] || [];
            this._matchList[keyName].push(config);
        }
    }
    public _getMatchList(snType, color) {
        let keyName = this._makeKey(snType, color);
        return this._matchList[keyName] || {};
    }
    public setBulletScreenOpen(bulletType, open) {
        this._bulletType[bulletType] = open;
    }
    public isBulletScreenOpen(bulletType) {
        return this._bulletType[bulletType];
    }
    public clear() {
        this._getBulletNotice.remove();
        this._getBulletNotice = null;
    }
    public reset() {
    }
    public parseBulletNotice(message, fontSize) {
        let snType = message.sn_type;
        return this._parseNotice(message, fontSize);
    }
    public _parseNotice(message, fontSize) {
        fontSize = fontSize || 20;
        function getRandomInfo(contentList) {
            let index = Math.randInt(1, contentList.length);
            return contentList[index-1];
        }
        let contentConfig = null;
        let msgColor = message.color;
        let msgWay = 0;
        let bullet_screen = G_ConfigLoader.getConfig(ConfigNameConst.BULLET_SCREEN);
        if (message.sn_type == BulletScreenData.SN_TYPE_GUILD_WAR || 
            message.sn_type == BulletScreenData.SN_TYPE_GOLDGACHA || 
            message.sn_type == BulletScreenData.SN_TYPE_GUILDCROSWAR || 
            message.sn_type == BulletScreenData.SN_TYPE_CROSS_BOSS_CHARGE_ATTACK || 
            message.sn_type == BulletScreenData.SN_TYPE_GRAIN_CAR || 
            message.sn_type == BulletScreenData.SN_TYPE_UNIVERSE_RACE) {
            contentConfig = bullet_screen.get(message.color);
            msgColor = 1;
            msgWay = 0;
            if (contentConfig) {
                msgColor = contentConfig.color;
                msgWay = contentConfig.way;
            }
        } else {
            let contentList = this._getMatchList(message.sn_type, message.color);
            if (contentList.length == 0) {
                return [];
            }
            let config = bullet_screen.get(message.color);
            contentConfig = getRandomInfo(contentList);
            msgColor = message.color;
            msgWay = config.way;
        }
        if (contentConfig == null) {
            return [''];
        }
        let serverContentList = message['content'] || {};
        let richContent = null;
        if (message.sn_type == BullectScreenConst.GUILD_WAR_TYPE && (message.color != BullectScreenConst.BULLET_ID_GUILD_WAR_GATE_DEMOLISH && message.color != BullectScreenConst.BULLET_ID_GUILD_WAR_CRYSTAL_DEMOLISH)) {
            let getGuildId = function (value) {
                let pairsList = value['content'] || {};
                for (let k in pairsList) {
                    let v = pairsList[k];
                    if (v.key == 'guildid') {
                        return [Number(v.value)];
                    }
                }
            };
            let guildId = G_UserData.getGuild().getMyGuildId();
            if (getGuildId(message) == guildId) {
                richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text, serverContentList, fontSize, Colors.GUILD_WAR_SAME_GUILD_COLOR, Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE, 1);
            } else {
                richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text, serverContentList, fontSize, Colors.GUILD_WAR_ENEMY_COLOR, Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE, 1);
            }
        } else {
            richContent = RichTextHelper.convertRichTextByNoticePairs(contentConfig.text, serverContentList, fontSize, Colors.getBulletColor(msgColor), Colors.getBulletColorOutline(msgColor), 1);
        }
        return [
            richContent,
            msgColor,
            msgWay
        ];
    }
}