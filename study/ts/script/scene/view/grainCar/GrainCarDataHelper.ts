import { GrainCarConst } from "../../../const/GrainCarConst";
import { G_ServerTime, G_UserData } from "../../../init";
import { table } from "../../../utils/table";

export namespace GrainCarDataHelper {
    export function getGuildListWithMineId(mineId) {
        var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
        var guildList = [];
        var tempGuildHash = [];
        for (let i in mineData.getUsers()) {
            var mineUser = mineData.getUsers()[i];
            var guildId = mineUser.getGuild_id();
            if (!tempGuildHash[guildId]) {
                tempGuildHash[guildId] = 1;
                guildList.push({
                    id: guildId,
                    name: mineUser.getGuild_name(),
                    data: []
                });
            }
        }
        var carList = G_UserData.getGrainCar().getGrainCarList();
        for (let i in carList) {
            var carUnit = carList[i];
            var guildId = carUnit.getGuild_id();
            var isMine = GrainCarDataHelper.isMyGuild(guildId);
            if (!tempGuildHash[guildId]) {
                tempGuildHash[guildId] = 1;
                guildList.push({
                    id: guildId,
                    name: carUnit.getGuild_name(),
                    data: []
                });
            }
        }
        return guildList;
    };
    export function getUserListDividByGuildWithMineId(mineId) {
        var mineData = G_UserData.getMineCraftData().getMineDataById(mineId);
        var guildList = [];
        var tempGuildHash = [];
        if (!mineData) {
            return guildList;
        }
        for (let i in mineData.getUsers()) {
            var mineUser = mineData.getUsers()[i];
            var guildId = mineUser.getGuild_id();
            if (!tempGuildHash[guildId]) {
                var carUnit = G_UserData.getGrainCar().getGrainCarWithGuildId(guildId);
                var haveCar = false;
                var isMine = GrainCarDataHelper.isMyGuild(guildId);
                if (guildId == 0) {
                    var isMe = mineUser.getUser_id() == G_UserData.getBase().getId();
                    guildId = isMe && 1 || 0;
                    isMine = isMe;
                }
                if (carUnit && carUnit.getStamina() > 0) {
                    var isInMine = carUnit.isInMine(mineId);
                    haveCar = isInMine && true || false;
                }
                guildList.push({
                    id: guildId,
                    name: mineUser.getGuild_name(),
                    haveCar: haveCar,
                    car: carUnit,
                    startOffset: 0,
                    endOffset: 0,
                    pos: cc.v2(0, 0),
                    isMine: isMine,
                    isDirty: false,
                    data: []
                });
                tempGuildHash[guildId] = guildList.length;
            }
            var guildIndex = tempGuildHash[guildId];
            var guild = guildList[guildIndex-1];
            guild.data.push({
                id: mineUser.getUser_id(),
                mineUser: mineUser,
                isDirty: false
            });
        }
        var carList = G_UserData.getGrainCar().getGrainCarList();
        for (let i in carList) {
            var carUnit = carList[i];
            if (carUnit.getStamina() > 0) {
                var guildId = carUnit.getGuild_id();
                var isMine = GrainCarDataHelper.isMyGuild(guildId);
                if (carUnit.isInMine(mineId) && !tempGuildHash[guildId]) {
                    guildList.push({
                        id: guildId,
                        name: carUnit.getGuild_name(),
                        haveCar: true,
                        car: carUnit,
                        startOffset: 0,
                        endOffset: 0,
                        pos: cc.v2(0, 0),
                        isMine: isMine,
                        isDirty: false,
                        data: []
                    });
                    tempGuildHash[guildId] = guildList.length;
                }
            }
        }
        return guildList;
    };
    export function getGuildListDividByGuildWithMineId(mineId) {
        var guildList = [];
        var tempGuildHash = [];
        var carList = G_UserData.getGrainCar().getGrainCarList();
        for (let i in carList) {
            var carUnit = carList[i];
            if (carUnit.getStamina() > 0) {
                var guildId = carUnit.getGuild_id();
                var isMine = GrainCarDataHelper.isMyGuild(guildId);
                if (carUnit.isInMine(mineId) && !tempGuildHash[guildId]) {
                    guildList.push({
                        id: guildId,
                        name: carUnit.getGuild_name(),
                        haveCar: true,
                        car: carUnit,
                        startOffset: 0,
                        endOffset: 0,
                        pos: cc.v2(0, 0),
                        isMine: isMine,
                        isDirty: false,
                        data: []
                    });
                    tempGuildHash[guildId] = guildList.length;
                }
            }
        }
        return guildList;
    };
    export function sortGuild(guildList) {
        var sortFunc = function (a, b): number {
            if (a.isMine != b.isMine) {
                return a.isMine;
            } else if (GrainCarDataHelper.isMyGuild(a.id) != GrainCarDataHelper.isMyGuild(b.id)) {
                return GrainCarDataHelper.isMyGuild(a.id) ? 1 : 0;
            } else if (a.haveCar != b.haveCar) {
                return a.haveCar;
            } else if (a.id != 0 && b.id != 0 && a.data.length != b.data.length) {
                return b.data.length - a.data.length;
            } else {
                return b.id - a.id;
            }
            //多余的代码
            // return GrainCarDataHelper.isMyGuild(a.id)?1:0;
        };
        guildList.sort(sortFunc);
        return guildList;
    };
    export function getGuildCarInMineId(mineId) {
        var carList = [];
        var list = G_UserData.getGrainCar().getGrainCarList();
        for (let i in list) {
            var carUnitData = list[i];
            var [pit1, pit2, percent] = carUnitData.getCurCarPos();
            if (mineId == pit1 && carUnitData.isStop()) {
                if (carUnitData.getEnd_time() == 0) {
                    table.insert(carList, carUnitData);
                } else {
                    if (!carUnitData.hasComplete()) {
                        table.insert(carList, carUnitData);
                    }
                }
            }
        }
        var sortFunc = function (a, b) {
            return a.getLeaveTime() - b.getLeaveTime();
        };
        carList.sort(sortFunc);
        return carList;
    };
    export function isMyGuild(guildId) {
        var myGuildId = G_UserData.getGuild().getMyGuildId();
        if (myGuildId != 0 && guildId == myGuildId) {
            return true;
        }
        return false;
    };
    export function haveCarInMineId(mineId) {
        var list = G_UserData.getGrainCar().getGrainCarList();
        for (let i in list) {
            var carUnit = list[i];
            if (carUnit.getStamina() > 0 && carUnit.isInMine(mineId)) {
                return true;
            }
        }
        return false;
    };
    export function canAttackGrainCar() {
        var lastAtkTime = G_UserData.getGrainCar().getAttack_time();
        var attackTime = lastAtkTime + GrainCarConst.ATTACK_CD - 1;
        var curTime = G_ServerTime.getTime();
        if (lastAtkTime == 0 || curTime > attackTime) {
            return [
                true,
                0
            ];
        }
        return [
            false,
            attackTime
        ];
    };
    export function canShowCarCorpse() {
        var showTime = G_UserData.getGrainCar().getCorpseShowTime();
        var curTime = G_ServerTime.getTime();
        return showTime && curTime <= showTime;
    };
}