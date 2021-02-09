import { GuildCrossWarConst } from "../../../const/GuildCrossWarConst";
import { G_ConfigLoader, G_UserData, Colors, G_ServerTime } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { stringUtil } from "../../../utils/StringUtil";
import { TextHelper } from "../../../utils/TextHelper";
import ParameterIDConst from "../../../const/ParameterIDConst";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import { AvatarDataHelper } from "../../../utils/data/AvatarDataHelper";

export namespace GuildCrossWarHelper {

    export function getGameTile(titleId) {
        var titleInfo = G_ConfigLoader.getConfig(ConfigNameConst.TITLE);
        if (titleId >= 1 && titleId < titleInfo.length()) {
            return titleInfo.get(titleId).resource;
        }
        return null;
    };
    export function _decodeNums(str: string) {
        var strArr = str.split('|');
        var nums = [];
        for (let k in strArr) {
            var v = strArr[k];
            nums[k] = Number(v);
        }
        return [
            nums,
            cc.v2(nums[0], nums[1])
        ];
    };
    export function getRoadCfg(key1, key2) {
        var guild_cross_war_road = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR_ROAD);
        for (var i = 0; i < guild_cross_war_road.length(); i++) {
            var indexData = guild_cross_war_road.indexOf(i);
            if (indexData.point_1 == key1 && indexData.point_2 == key2) {
                return indexData;
            }
        }
        console.assert(false, 'can not find guild_cross_war_road cfg by point_1[%d] point_2[%d]');
    };
    export function getWarMapCfg(id) {
        var guild_cross_war_map = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR_MAP);
        var indexData = guild_cross_war_map.indexOf(id);
        if (indexData) {
            return indexData;
        }
        console.assert(false, 'can not find guild_cross_war_map cfg by Grid[%d]');
    };
    export function getWarMapCfgByGrid(gridX, gridY) {
        var guild_cross_war_map = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR_MAP);
        for (var i = 0; i < guild_cross_war_map.length(); i++) {
            var indexData = guild_cross_war_map.indexOf(i);
            if (gridX == indexData.axis_x && gridY == indexData.axis_y) {
                return indexData;
            }
        }
        console.assert(false, 'can not find guild_cross_war_map cfg by Grid[%d],[%d]');
    };
    export function getWarMapGridCenter(gridId) {
        var warMapCfg = GuildCrossWarHelper.getWarMapCfg(gridId);
        if (warMapCfg) {
            return cc.v2((warMapCfg.axis_x - 0.5) * GuildCrossWarConst.GRID_SIZE, (warMapCfg.axis_y - 0.5) * GuildCrossWarConst.GRID_SIZE);
        }
    };

    export function getLimitAwards() {
        var items = {};
        // var openServerTime = G_UserData.getBase().getOpenServerDayNum();
        // G_ConfigLoader.getConfig(ConfigNameConst.guild_cross_war_w);
        // var guild_cross_war_award = require('guild_cross_war_award');
        // for (var j = 0; j <= guild_cross_war_award.length(); j++) {
        //     var indexData = guild_cross_war_award.indexOf(i);
        //     if (indexData.day_min <= openServerTime && openServerTime <= indexData.day_max) {
        //         for (var i = 1; i != 13; i++) {
        //             if (indexData['type_' + i] && indexData['type_' + i] != 0) {
        //                 table.insert(items, {
        //                     type: indexData['type_' + i],
        //                     value: indexData['value_' + i],
        //                     size: indexData['size_' + i]
        //                 });
        //             }
        //         }
        //         break;
        //     }
        // }
        return items;
    };

    export function getGridIdByPosition(x, y) {
        var gridX = Math.ceil(x / GuildCrossWarConst.GRID_SIZE);
        var gridY = Math.ceil(y / GuildCrossWarConst.GRID_SIZE);
        var holeCfg = GuildCrossWarHelper.getWarMapCfgByGrid(gridX, gridY);
        return holeCfg.id;
    };
    export function getOffsetPointRange(holeId) {
        var holeData = GuildCrossWarHelper.getWarMapCfg(holeId);
        var holeX = (holeData.axis_x - 1) * GuildCrossWarConst.GRID_SIZE;
        var holeY = (holeData.axis_y - 1) * GuildCrossWarConst.GRID_SIZE;
        var holePos = cc.v2(holeX, holeY);
        var randomOffsetX = Math.randInt(20, GuildCrossWarConst.GRID_SIZE - 20);
        var randomOffsetY = Math.randInt(20, GuildCrossWarConst.GRID_SIZE - 20);
        var resultPoint = holePos.add(cc.v2(randomOffsetX, randomOffsetY));
        return resultPoint;
    };
    export function getMovingLine(slot1, slot2) {
        var starPos = GuildCrossWarHelper.getOffsetPointRange(slot1);
        var endPos = GuildCrossWarHelper.getOffsetPointRange(slot2);
        var linePointList = [];
        linePointList.push(starPos);
        linePointList.push(endPos);
        return linePointList;
    };
    export function getWarCfg(point) {
        var guild_cross_war = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR);
        return guild_cross_war.indexOf(point);
    };
    export function getLastPath(linearPos: cc.Vec2, targetPos: cc.Vec2) {
        var line = [];
        var path: any = {};
        line.push(linearPos);
        line.push(targetPos);
        var distance = cc.pGetDistance(linearPos, targetPos);
        path.curLine = line;
        path.totalTime = Number('%.2f'.format(distance / GuildCrossWarConst.AVATAR_MOVING_RATE));
        return path;
    };
    export function getPointCount() {
        var guild_cross_war = G_ConfigLoader.getConfig(ConfigNameConst.GUILD_CROSS_WAR);
        return guild_cross_war.length();
    };
    export function getCurPointRect(point) {
        if (typeof point != 'number') {
            return null;
        }
        var warCfg = GuildCrossWarHelper.getWarCfg(point);
        if (warCfg == null) {
            return null;
        }
        return [
            cc.rect(warCfg.map_x - warCfg.range_x / 2, warCfg.map_y - warCfg.range_y / 2, warCfg.range_x, warCfg.range_y),
            cc.v2(warCfg.map_x, warCfg.map_y)
        ];
    };
    export function getAttackPoint(selfPoint) {
        var pointData = GuildCrossWarHelper.getWarCfg(selfPoint);
        if (pointData == null) {
            return false;
        }
        var movePoint = pointData.move;
        if (pointData.type == 1) {
            return Number(movePoint);
        } else if (pointData.type == 2) {
            var movePointList = [];
            var [points] = GuildCrossWarHelper._decodeNums(movePoint);
            for (let i in points) {
                var v = points[i];
                movePointList.push(Number(v));
            }
            return movePointList;
        }
        return null;
    };
    export function checkCanMovedPoint(selfPoint, targetGrid) {
        if (selfPoint == null || Object.keys(selfPoint).length < 2) {
            return false;
        }
        var oriPoint = G_UserData.getGuildCrossWar().getSelfOriPoint();
        var warMap = GuildCrossWarHelper.getWarMapCfg(selfPoint.pos);
        if (targetGrid.point_y == 0) {
            if (warMap.axis_x == targetGrid.axis_x && Math.abs(warMap.axis_y - targetGrid.axis_y) == 1) {
                return true;
            } else if (warMap.axis_y == targetGrid.axis_y && Math.abs(warMap.axis_x - targetGrid.axis_x) == 1) {
                return true;
            }
            return false;
        }
        var targetData = GuildCrossWarHelper.getWarCfg(targetGrid.point_y);
        if (warMap.axis_x == targetGrid.axis_x && Math.abs(warMap.axis_y - targetGrid.axis_y) == 1) {
            return !(targetData.type == 1 && targetGrid.point_y != oriPoint);
        } else if (warMap.axis_y == targetGrid.axis_y && Math.abs(warMap.axis_x - targetGrid.axis_x) == 1) {
            return !(targetData.type == 1 && targetGrid.point_y != oriPoint);
        }
        return false;
    };
    export function getParameterContent(constId) {
        return UserDataHelper.getParameter(constId);
    };
    export function isTodayOpen() {
        function canOpenToday(day) {
            var openDay = Number(GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_OPEN_WEEK));
            openDay = openDay + 1;
            openDay = openDay > 7 && openDay - 7 || openDay;
            return openDay == day;
        }
        var date = G_ServerTime.getDateObject(null, 0);
        let day = date.getDay();
        day = day == 0 ? 7 : day;
        return canOpenToday(day);
    };
    export function getConfigTimeRegion() {
        var zeroTime = G_ServerTime.secondsFromZero();
        var startTime = zeroTime + GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_OPEN_TIME);
        var timeLen1 = GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_READY_TIME);
        var timeLen2 = GuildCrossWarHelper.getParameterContent(ParameterIDConst.GUILDCROSS_CONDUCTING_TIME);
        var endTime = startTime + timeLen1 + timeLen2;
        return {
            startTime: startTime,
            readyEndTime: startTime + timeLen1,
            endTime: endTime
        };
    };
    export function getCurCrossWarStage() {
        if (!GuildCrossWarHelper.isTodayOpen()) {
            return [
                GuildCrossWarConst.ACTIVITY_STAGE_3,
                0
            ];
        }
        var curTime = G_ServerTime.getTime();
        var timeData = GuildCrossWarHelper.getConfigTimeRegion();
        if (timeData.startTime <= curTime && timeData.readyEndTime > curTime) {
            return [
                GuildCrossWarConst.ACTIVITY_STAGE_1,
                timeData.readyEndTime
            ];
        } else if (timeData.readyEndTime <= curTime && timeData.endTime > curTime) {
            return [
                GuildCrossWarConst.ACTIVITY_STAGE_2,
                timeData.endTime
            ];
        } else {
            return [
                GuildCrossWarConst.ACTIVITY_STAGE_3,
                0
            ];
        }
    };
    export function convertToSmallMapPos(pos) {
        pos.x = pos.x * GuildCrossWarConst.CAMERA_SCALE_MIN;
        pos.y = pos.y * GuildCrossWarConst.CAMERA_SCALE_MIN;
        return pos;
    };
    export function checkUnitCanMoving(selfUnit, clickPoint) {
        if (selfUnit == null || clickPoint == null) {
            return false;
        }
        var curPointId = selfUnit.getCurPointId();
        var bossUnit = G_UserData.getGuildCrossWar().getBossUnitById(curPointId);
        if (bossUnit == null) {
            return selfUnit.getCurrState() == GuildCrossWarConst.UNIT_STATE_IDLE;
        }
        var bossState = bossUnit.getCurState(), __;
        if (bossState != GuildCrossWarConst.BOSS_STATE_DEATH) {
            return false;
        }
        var curState = selfUnit.getCurrState();
        if (curState != GuildCrossWarConst.UNIT_STATE_IDLE) {
            return false;
        }
        return true;
    };
    export function createFlagInMap() {
        var flagNode = new cc.Node();
        var flagImg = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03a') });
        flagNode.addChild(flagImg);
        return flagNode;
    };
    export function updateSelfNode(rootNode, selfPosX, selfPosY) {
        if (G_UserData.getGuildCrossWar().getSelfUnit() == null) {
            return;
        }
        function createFlagInMap() {
            var flagNode = new cc.Node();
            var flagImg = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03a') });
            flagNode.addChild(flagImg);
            return flagNode;
        }
        var selfNode = rootNode.getChildByName('self_node');
        if (selfNode == null) {
            selfNode = GuildCrossWarHelper.createFlagInMap();
            if (selfNode) {
                selfNode.setName('self_node');
                rootNode.addChild(selfNode, 10000);
            }
        }
        var tempPosition = GuildCrossWarHelper.convertToSmallMapPos(cc.v2(selfPosX, selfPosY));
        selfNode.setPosition(tempPosition);
    };
    export function createGuildNumFlag() {
        var flagNode = new cc.Node();
        var flagImg = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03b') });
        flagNode.addChild(flagImg);
        return flagNode;
    };
    export function updateSelfGuildMemeber(rootNode, users) {
        users = users || {};
        for (let k in users) {
            var v = users[k];
            var guildNumber = rootNode.getChildByName('guildNumber_' + k);
            if (guildNumber == null) {
                guildNumber = GuildCrossWarHelper.createGuildNumFlag();
                guildNumber.setName('guildNumber_' + k);
                rootNode.addChild(guildNumber, 10000);
            }
            var x = v.getPosition(), y;
            var tempPosition = GuildCrossWarHelper.convertToSmallMapPos(cc.v2(x, y));
            guildNumber.setPosition(tempPosition);
        }
    };
    export function updateTargetNode(rootNode) {
        var userUnit = G_UserData.getGuildCrossWar().getSelfUnit();
        if (userUnit == null) {
            return;
        }
        function createTargetFlag() {
            var targetFlag = new cc.Node();
            var qizi = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03d') });
            var kuang = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03e') });
            targetFlag.addChild(kuang);
            targetFlag.addChild(qizi);
            targetFlag.name = 'target_node';
            return targetFlag;
        }
        var targetNode = rootNode.getChildByName('target_node');
        if (targetNode == null) {
            targetNode = createTargetFlag();
            rootNode.addChild(targetNode);
        }
    };
    export function moving(userId, targetPoint) {
        if (userId == null || targetPoint == null) {
            return;
        }
        var userUnit = G_UserData.getGuildCrossWar().getUnitById(userId);
        if (userUnit == null) {
            return;
        }
        if (userUnit.getTo_pos().key_point_id == targetPoint.key_point_id) {
            return;
        }
        if (userUnit.getCurrState() != GuildCrossWarConst.UNIT_STATE_IDLE) {
            return;
        }
    };
    export function updateMiniMapSelf(targetNode) {
    };
    export function getPlayerColor(userId) {
        var unitData = G_UserData.getGuildCrossWar().getUnitById(userId);
        if (unitData == null) {
            return Colors.getColor(6);
        }
        if (unitData.isSelf()) {
            return Colors.getColor(2);
        }
        if (unitData.isSelfGuild()) {
            return Colors.getColor(3);
        }
        return Colors.getColor(6);
    };
    export function updateHeroIcon(node, userUnit) {
        var limit = AvatarDataHelper.getAvatarConfig(userUnit.getAvatar_base_id()).limit == 1 && 3;
        var avatarId = UserDataHelper.convertAvatarId({
            base_id: userUnit.getBase_id(),
            avatar_base_id: userUnit.getAvatar_base_id()
        })[0];
        node.updateUI(avatarId, null, limit);
    };
    export function isExistBossInPoint(pointId) {
        var warKeyMap = G_UserData.getGuildCrossWar().getWarKeyMap();
        for (let i in warKeyMap) {
            var v = warKeyMap[i];
            if (v.cfg && v.cfg.boss_res > 0 && v.cfg.id == pointId) {
                return [
                    true,
                    v.cfg
                ];
            }
        }
        return [
            false,
            null
        ];
    };
    export function isCurPointHole(pointHole1, pointHole2) {
        if (typeof pointHole1 != 'object' || typeof pointHole2 != 'object') {
            return false;
        }
        if (pointHole1.key_point_id == pointHole2.key_point_id && pointHole1.pos == pointHole2.pos) {
            return true;
        }
        return false;
    };
    export function getHoleUserList(pointHole) {
        var userList = G_UserData.getGuildCrossWar().getCurHoleData(pointHole);
        if (userList == null || Object.keys(userList).length <= 0) {
            return {};
        }
        return userList;
    };
    export function getPointUserList(point) {
        var userList = G_UserData.getGuildCrossWar().getCurPointData(point);
        if (userList == null || Object.keys(userList).length <= 0) {
            return null;
        }
        return userList;
    };
    export function isGuildCrossWarEntry() {
        var guildData = G_UserData.getGuild().getMyGuild();
        if (guildData == null) {
            return false;
        }
        return guildData.isEntry();
    };
    export function isSelf(userId) {
        return userId == G_UserData.getBase().getId();
    };
    export function isOriPoint(point) {
        return point == G_UserData.getGuildCrossWar().getSelfOriPoint();
    };
    export function replaceStr(name) {
        var strTable = TextHelper.getStringTable(name);
        return strTable.join('\n');
    };
    export function getGuildNameColor(rank) {
        if (rank <= 3 && rank > 0) {
            return Colors['GUILD_DUNGEON_RANK_COLOR' + rank];
        }
        return Colors['DARK_BG_ONE'];
    };
};
