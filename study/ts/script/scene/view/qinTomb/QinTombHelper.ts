import { QinTombConst } from "../../../const/QinTombConst";
import { G_ConfigLoader, G_ServerTime, G_UserData, G_Prompt, G_EffectGfxMgr, Colors } from "../../../init";
import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { Lang } from "../../../lang/Lang";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";

export namespace QinTombHelper {
    export function getMoveSignKeyList() {
        let retList = [];
        let qin_point = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT);
        for (let i = 0; i < qin_point.length(); i++) {
            let data = qin_point.indexOf(i);
            if (data.point_type <= 3) {
                retList.push(data);
            }
        }
        return retList;
    };
    export function getMoveSignKey(keyPoint) {
        let qin_point_time = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT_TIME);
        let keyList = [];
        for (let loop = 0; loop < qin_point_time.length(); loop++) {
            let cfgData = qin_point_time.indexOf(loop);
            if (cfgData.point_id_1 == keyPoint) {
                let data = getPointCfg(cfgData.point_id_2);
                keyList.push(data);
            }
        }
        return keyList;
    };
    export function getQinInfo(key) {
        let qin_info = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO);
        let infoData = qin_info.get(1);
        return infoData[key];
    };
    export function _decodeNums(str: string): any[] {
        let strArr = str.split('|');
        let nums: number[] = [];
        for (let k = 0; k < strArr.length; k++) {
            let v = strArr[k];
            nums[k] = Number(v);
        }
        return [
            nums,
            cc.v2(nums[0], nums[1])
        ];
    };
    export function getPointCfg(pointId) {
        let pointData = G_ConfigLoader.getConfig(ConfigNameConst.QIN_POINT).get(pointId);
        console.assert(pointData, 'can not find qin_point cfg by id ' + pointId);
        return pointData;
    };
    export function getOffsetPoint(pointId, index):cc.Vec2 {
        let pointData = getPointCfg(pointId);
        let [offsetArray, offsetPoint] = _decodeNums(pointData['offset_mid' + (index + 1)]);
        let [midPoint] = getMidPoint(pointId);
        midPoint = cc.v2(offsetPoint.x, offsetPoint.y);
        return midPoint;
    };
    export function getRandomRangePoint(midPoint, rangeSize):cc.Vec2 {
        let rangeRect = cc.rect(midPoint.x - rangeSize.width * 0.5, midPoint.y - rangeSize.height * 0.5, rangeSize.width, rangeSize.height);
        let clickX = rangeRect.x + Math.randInt(0, rangeRect.width);
        let clickY = rangeRect.y + Math.randInt(0, rangeRect.height);
        return cc.v2(clickX, clickY);
    };
    export function getOffsetPointRange(pointId, index) {
        let pointData = getPointCfg(pointId);
        let offsetPoint = getOffsetPoint(pointId, index);
        let [b, range] = _decodeNums(pointData['range']);
        return getRandomRangePoint(offsetPoint, cc.size(range.x, range.y));
    };
    export function getMidPoint(pointId) {
        let pointData = getPointCfg(pointId);
        let pointValue = pointData['mid_point'];
        let [offsetArray, offsetPoint] = _decodeNums(pointValue);
        return [
            offsetPoint,
            pointValue
        ];
    };
    export function getClickRect(pointId) {
        let pointData = getPointCfg(pointId);
        let clickRect = cc.rect(0, 0, 0, 0);
        if (pointData.mid_point != '' && pointData.click_region != '') {
            let [pos] = _decodeNums(pointData.mid_point);
            let [range] = _decodeNums(pointData.click_region);
            clickRect = cc.rect(pos[0] - range[0] * 0.5, pos[1] - range[1] * 0.5, range[0], range[1]);
        }
        return clickRect;
    };
    export function getRangePoint(pointId) {
        let pointData = getPointCfg(pointId);
        let [a, midPoint] = _decodeNums(pointData['mid_point']);
        if (pointData['range'] != '') {
            let [b, range] = _decodeNums(pointData['range']);
            return getRandomRangePoint(midPoint, cc.size(range.x, range.y));
        }
        return cc.v2(0, 0);
    };
    export function convertToSmallMapPos(pos) {
        pos.x = pos.x * QinTombConst.CAMERA_SCALE_MIN;
        pos.y = pos.y * QinTombConst.CAMERA_SCALE_MIN;
        return pos;
    };
    export function isMonsterPoint(pointId) {
        // cc.warn('QinTombHelper.isMonsterPoint ');
        let qin_monster = G_ConfigLoader.getConfig(ConfigNameConst.QIN_MONSTER);
        for (let i = 0; i < qin_monster.length(); i++) {
            let qinMonster = qin_monster.indexOf(i);
            if (qinMonster.point_id_1 == pointId || qinMonster.point_id_3 == pointId || qinMonster.point_id_4 == pointId) {
                return true;
            }
        }
        return false;
    };
    export function checkTeamCanMoving(team, clickPoint) {
        if (team == null) {
            return false;
        }
        if (clickPoint == null) {
            return false;
        }
        if (isMonsterPoint(clickPoint)) {
            return false;
        }
        if (team.isSelfTeamLead() == false) {
            G_Prompt.showTip(Lang.get('qin_tomb_error3'));
            return false;
        }
        if (team.getCurrState() == QinTombConst.TEAM_STATE_MOVING) {
            G_UserData.getQinTomb().cacheNextKey(clickPoint);
            return false;
        }
        if (team.getCurrState() == QinTombConst.TEAM_STATE_IDLE || team.getCurrState() == QinTombConst.TEAM_STATE_HOOK || team.getCurrState() == QinTombConst.TEAM_STATE_PK) {
            return true;
        }
        return false;
    };
    export function checkTeamLeaveBattle(selfTeam, clickPoint) {
        if (selfTeam == null) {
            return false;
        }
        if (clickPoint == null) {
            return false;
        }
        if (selfTeam.isSelfTeamLead() == false) {
            G_Prompt.showTip(Lang.get('qin_tomb_error3'));
            return true;
        }
        if (selfTeam.getCurrState() == QinTombConst.TEAM_STATE_HOOK || selfTeam.getCurrState() == QinTombConst.TEAM_STATE_PK) {
            let pathList = selfTeam.getPath();
            let currKey = pathList[pathList.length - 1];
            if (currKey == clickPoint) {
                G_UserData.getQinTomb().c2sGraveLeaveBattle();
                return true;
            }
        }
        return false;
    };
    export function updateSelfNode(rootNode: cc.Node, selfPosX, selfPosY) {
        if (rootNode == null) {
            return;
        }
        let selfNode = rootNode.getChildByName('self_node');
        if (selfNode == null) {
            selfNode = makeMiniMapSelfTeam();
            if (selfNode) {
                selfNode.name = ('self_node');
                // rootNode.addChild(selfNode, 100000);
                rootNode.addChild(selfNode, 1000);
            }
        }
        if (selfNode) {
            updateMiniMapSelfTeam(selfNode);
            let selfTeam = G_UserData.getQinTomb().getSelfTeam();
            if (selfTeam == null) {
                return;
            }
            let selfMidPos = selfTeam.getCurrPointKeyMidPos();
            let teamPos = convertToSmallMapPos(cc.v2(selfPosX, selfPosY));
            if (selfTeam.getCurrState() == QinTombConst.TEAM_STATE_IDLE || selfTeam.getCurrState() == QinTombConst.TEAM_STATE_MOVING) {
                selfNode.active = (true);
            } else {
                selfNode.active = (false);
            }
            selfNode.setPosition(teamPos);
        }
    };
    export function updateTargetNode(rootNode: cc.Node) {
        let selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam) {
            let targetNode = rootNode.getChildByName('target_node');
            if (targetNode == null) {
                targetNode = new cc.Node();
                let qizi = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03d') });
                let kuang = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03e') });
                targetNode.addChild(kuang);
                targetNode.addChild(qizi);
                targetNode.name = ('target_node');
                rootNode.addChild(targetNode);
            }
            let targetPos = selfTeam.getTargetPointPos();
            if (targetPos) {
                targetNode.setPosition(convertToSmallMapPos(targetPos));
                targetNode.active = (true);
            } else {
                targetNode.active = (false);
            }
        }
    };
    export function movingTeam(teamId, targetPoint) {
        let teamUnit = G_UserData.getQinTomb().getTeamById(teamId);
        function getPathTime(path) {
            let totalTime = 0;
            for (let i in path) {
                let value = path[i];
                totalTime = value.time + totalTime;
            }
            return totalTime;
        }
        if (teamUnit) {
            let currKey = teamUnit.getCurrPointKey();
            if (currKey == targetPoint) {
                return;
            }
            // console.log(currKey);
            // console.log(targetPoint);
            let [keyList, needTime] = G_UserData.getQinTomb().getMovingKeyList(currKey, targetPoint);
            if (keyList && keyList.length > 0) {
                // console.log(needTime);
                G_UserData.getQinTomb().c2sGraveMove(keyList, needTime);
            }
        }
    };
    export function makeMiniMapSelfTeam() {
        let targetNode = new cc.Node();
        for (let i = 1; i <= 3; i++) {
            let tempNode = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03a') });
            tempNode.name = 'teamNode' + i;
            targetNode.addChild(tempNode);
        }
        return targetNode;
    };
    export function updateMiniMapSelfTeam(targetNode: cc.Node) {
        let teamUnit = G_UserData.getQinTomb().getSelfTeam();
        if (teamUnit == null) {
            return null;
        }
        if (targetNode == null) {
            return;
        }
        for (let i = 1; i <= 3; i++) {
            let tempNode = targetNode.getChildByName('teamNode' + i);
            if (tempNode) {
                tempNode.active = (false);
            }
        }
        function isUserSelf(teamUserId) {
            return teamUserId == G_UserData.getBase().getId();
        }
        let teamUsers = teamUnit.getTeamUsers();
        for (let i in teamUsers) {
            let value = teamUsers[i];
            if (isUserSelf(value.user_id) == true) {
                let tempNode = targetNode.getChildByName('teamNode' + i);
                UIHelper.loadTexture(tempNode.getComponent(cc.Sprite), Path.getQinTomb('img_qintomb_map03a'));
                tempNode.active = (true);
            }
        }
        return targetNode;
    };
    export function makeMiniMapRape() {
        //TOODO:???
        // let tempNode = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03F') });
    };
    export function updateMiniMapMonsterFight(rootNode: cc.Node) {
        function updateMonsterFight(rootNode, monsterUnit) {
            let monsterKey = monsterUnit.getPoint_id();
            let monsterNode: cc.Node = rootNode.getChildByName('monster_pk' + monsterKey);
            if (monsterNode == null) {
                monsterNode = new cc.Node();
                monsterNode.active = (false);
                monsterNode.name = ('monster_pk' + monsterKey);
                let miniMapPos = convertToSmallMapPos(monsterUnit.getPosition());
                monsterNode.setPosition(miniMapPos);
                rootNode.addChild(monsterNode, 0);
                G_EffectGfxMgr.createPlayGfx(monsterNode, 'effect_xianqinhuangling_zhengduofaguang', null, true);
            }
            monsterNode.active = (true);
        }
        let monsterList = G_UserData.getQinTomb().getMonsterList();
        for (let i in monsterList) {
            let value = monsterList[i];
            if (value) {
                updateMonsterFight(rootNode, value);
            }
        }
    };
    export function updateMiniMapAttackTeam(rootNode: cc.Node, monsterKey) {
        if (monsterKey == null) {
            return;
        }
        function isUserSelf(teamUserId) {
            return teamUserId == G_UserData.getBase().getId();
        }
        let selfTeamId = G_UserData.getQinTomb().getSelfTeamId();
        let teamUnit = G_UserData.getQinTomb().getTeamById(selfTeamId);
        let monsterUnit = G_UserData.getQinTomb().getMonster(monsterKey);
        if (monsterUnit == null) {
            return;
        }
        let monsterNode = rootNode.getChildByName('monster_node' + monsterKey);
        if (monsterNode == null) {
            monsterNode = new cc.Node();
            monsterNode.active = (false);
            monsterNode.name = ('monster_node' + monsterKey);
            // rootNode.addChild(monsterNode, 100000);
            rootNode.addChild(monsterNode, 1000);
            for (let i = 1; i <= 3; i++) {
                let tempNode = UIHelper.createImage({ texture: Path.getQinTomb('img_qintomb_map03c') });
                tempNode.name = ('monsterOwner' + i);
                tempNode.active = (false);
                monsterNode.addChild(tempNode);
            }
        }
        monsterNode.active = (false);
        if (monsterUnit.getOwn_team_id() > 0 || monsterUnit.getBattle_team_id() > 0) {
            monsterNode.active = (true);
            for (let i = 1; i <= 3; i++) {
                let tempNode = monsterNode.getChildByName('monsterOwner' + i);
                tempNode.active = (false);
            }
        }
        function updateNode(index, imageName) {
            let tempNode = monsterNode.getChildByName('monsterOwner' + index);
            UIHelper.loadTexture(tempNode.getComponent(cc.Sprite), Path.getQinTomb(imageName));
            tempNode.setPosition(convertToSmallMapPos(monsterUnit.getPosition()));
            tempNode.active = (true);
        }
        if (monsterUnit.getOwn_team_id() > 0) {
            let ownUnit = G_UserData.getQinTomb().getTeamById(monsterUnit.getOwn_team_id());
            if (monsterUnit.getOwn_team_id() == selfTeamId) {
                for (let i in ownUnit.getTeamUsers()) {
                    let value = ownUnit.getTeamUsers()[i];
                    if (isUserSelf(value.user_id) == true) {
                        updateNode(i, 'img_qintomb_map03a');
                    }
                }
            }
        }
    };
    export function checkMyTeamInBossPoint(bossId) {
        let selfTeamId = G_UserData.getQinTomb().getSelfTeamId();
        let teamUnit = G_UserData.getQinTomb().getTeamById(selfTeamId);
        if (teamUnit == null) {
            return false;
        }
        let currKey = teamUnit.getCurrPointKey();
        let monsterUnit = G_UserData.getQinTomb().getMonster(bossId);
        if (currKey && monsterUnit.getConfig().point_id_2 == currKey) {
            return true;
        }
        return false;
    };
    export function getPlayerColor(userId, teamId) {
        let selfTeam = G_UserData.getQinTomb().getSelfTeam();
        if (selfTeam == null) {
            return Colors.getColor(6);
        }
        let selfTeamId = selfTeam.getTeamId();
        if (userId == G_UserData.getBase().getId()) {
            return Colors.getColor(2);
        }
        if (selfTeamId == teamId) {
            return Colors.getColor(3);
        }
        let battelTeamId = selfTeam.getBatteTeamId();
        if (battelTeamId > 0 && battelTeamId == teamId) {
            return Colors.getColor(6);
        }
        return Colors.getColor(6);
    };
    export function checkAttackMonster(pointKey): any[] {
        let retFunc = function () {
            G_Prompt.showTip(Lang.get('qin_tomb_error1'));
        };
        let selfTeamId = G_UserData.getQinTomb().getSelfTeamId();
        let teamUnit = G_UserData.getQinTomb().getTeamById(selfTeamId);
        if (teamUnit == null) {
            return [false, null];
        }
        let monsterUnit = G_UserData.getQinTomb().getMonster(pointKey);
        if (teamUnit.isSelfTeamLead() == false) {
            retFunc = function () {
                G_Prompt.showTip(Lang.get('qin_tomb_error3'));
            };
            return [
                false,
                retFunc
            ];
        }
        if (checkMyTeamInBossPoint(pointKey)) {
            if (monsterUnit.getOwn_team_id() == 0 || monsterUnit.getBattle_team_id() == 0) {
                return [true, null];
            }
            retFunc = function () {
                G_Prompt.showTip(Lang.get('qin_tomb_error2'));
            };
        }
        return [
            false,
            retFunc
        ];
    };
    export function getOpenTime(openTime) {
        let hour = Math.floor(openTime / 3600);
        let min: any = Math.floor((openTime - hour * 3600) / 60);
        if (min == 0) {
            min = '00';
        }
        return [
            hour,
            min
        ];
    };
    export function getOpeningTable() {
        let retTable: any = {
            show: false,
            showEffect: false,
            countDown: null,
            labelStr: '',
            isFighting: false,
            isInTeam: false
        };
        let qinCfg = G_ConfigLoader.getConfig(ConfigNameConst.QIN_INFO).get(1);
        let openTime = Number(qinCfg.open_time);
        let closeTime = Number(qinCfg.close_time);
        let time = G_ServerTime.getTodaySeconds();
        if (time > closeTime) {
            let hour = getOpenTime(openTime)[0];
            retTable.show = true;
            retTable.labelStr = Lang.get('season_maintime_tomorrow', { time: hour });
            return retTable;
        }
        retTable.show = true;
        if (time < openTime) {
            let leftTime = openTime - time;
            retTable.refreshTime = leftTime + G_ServerTime.getTime();
            if (leftTime <= 900) {
                retTable.countDown = leftTime + G_ServerTime.getTime();
                return retTable;
            }
            let hour = Math.floor(openTime / 3600);
            let min: any = Math.floor((openTime - hour * 3600) / 60);
            if (min == 0) {
                min = '00';
            }
            let timeStr = Lang.get('hour_min', {
                hour: hour,
                min: min
            });
            retTable.labelStr = Lang.get('qin_tomb_open', { time: timeStr });
            return retTable;
        }
        if (G_UserData.getQinTomb().isQinOpen()) {
            let leftTime = closeTime - time;
            retTable.refreshTime = leftTime + G_ServerTime.getTime();
            retTable.showEffect = true;
            if (G_UserData.getGroups().getMyGroupData()) {
                retTable.labelStr = '';
                retTable.isInTeam = true;
                return retTable;
            } else {
                retTable.labelStr = '';
                retTable.isFighting = true;
                return retTable;
            }
        }
        return retTable;
    };

}