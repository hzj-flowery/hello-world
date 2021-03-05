import { G_ServerListManager, G_ServerTime, G_RoleListManager } from "../../../init";
import { ArraySort } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";

export namespace ServerListDataHelper {
    export let sortFunc = function (a, b) {
        if (a.subNum != b.subNum) {
            return a.subNum > b.subNum;
        }
        return a.server.getServer() > b.server.getServer();
    };
    export let sortMyServerListFunc = function (a, b) {
        var aTime = parseInt(a.server.getOpentime());
        var bTime = parseInt(b.server.getOpentime());
        if (aTime != bTime) {
            return aTime > bTime;
        }
        return a.server.getServer() > b.server.getServer();
    };
    export let sortRegionListFunc = function (a, b) {
        if (a.minTime != b.minTime) {
            return a.minTime > b.minTime;
        }
        if (a.regionName != b.regionName) {
            return a.regionName > b.regionName;
        }
        return a.minNo > b.minNo;
    };
    export let removeEmptyRegion = function (regionList: any[]) {
        for (var k = regionList.length - 1; k <= 0; k--) {
            var v = regionList[k];
            if (!v.list || v.list.length <= 0) {
                regionList.splice(k, 1);
            }
        }
    };
    export let getServerDataList = function () {
        var serverlist = G_ServerListManager.getList();
        var roleList = G_RoleListManager.getList();
        var newList = [];
        var newMap = {};
        var myServerList = [];
        for (let k in serverlist) {
            let v = serverlist[k];
            let data = {
                server: v,
                role: null,
                subNum: 0,
                regionName: null,
                regionNameHead: null,
                regionNameTail: null
            };
            let serverName = data.server.getName();
            let reg = serverName.match(/^(\D*)(\d+).*/)
            // string.match(serverName, '^([%a]*)([%d]+).*');
            if (reg == null) {
                reg = serverName.match(/(\D*)(\d*)(\D*)/);
                let a = reg[1];
                let b = reg[2];
                let c = reg[3];
                // let a = string.match(serverName, '([^%d]*)([%d]*)([^%d]*)'), b, c;
                data.regionName = a + c;
                data.subNum = b == '' && 1 || parseInt(b);
                data.regionNameHead = a;
                data.regionNameTail = c;
            } else {
                let group1 = reg[1];
                let group2 = reg[2];
                data.regionName = group1;
                data.subNum = parseInt(group2);
            }
            newList.push(data);
            if (!newMap[data.regionName]) {
                newMap[data.regionName] = [];
            }
            newMap[data.regionName].push(data);
            for (let k2 in roleList) {
                var v2 = roleList[k2];
                if (v.getServer() == v2.getServer_id()) {
                    if (!data.role) {
                        data.role = v2;
                    } else if (v2.getRole_lv() > data.role.getRole_lv()) {
                        data.role = v2;
                    }
                }
            }
            if (data.role) {
                myServerList.push(data);
            }
        }
        ArraySort(myServerList, ServerListDataHelper.sortMyServerListFunc);
        for (let k in newMap) {
            let v = newMap[k];
            ArraySort(v, ServerListDataHelper.sortFunc);
        }
        var maxCount = 10;
        var regionList = {};
        var currLen = 0;
        for (let k in newMap) {
            let v: any[] = newMap[k];
            var count = v.length;
            var endSubNum = v[1 - 1].subNum;
            var startSubNum = v[v.length - 1].subNum;
            var subRegionNum = Math.ceil((endSubNum - startSubNum + 1) / maxCount);
            for (var i = 0; i < v.length; i++) {
                var data = v[i];
                var index = Math.floor((data.subNum - startSubNum) / maxCount) + 1;
                var regionData = regionList[currLen + index];
                if (!regionData) {
                    regionData = {
                        minTime: 0,
                        minNo: startSubNum + (index - 1) * maxCount,
                        regionName: v[1 - 1].regionName,
                        list: [],
                        regionNameHead: v[1 - 1].regionNameHead,
                        regionNameTail: v[1 - 1].regionNameTail,
                        showNo: true
                    };
                    regionList[currLen + index] = regionData;
                }
                if (data.server.getServer() == 10060000) {
                    regionData.showNo = false;
                }
                if (regionData.minTime && regionData.minTime != 0) {
                    regionData.minTime = Math.min(regionData.minTime, parseInt(data.server.getOpentime()));
                } else {
                    regionData.minTime = parseInt(data.server.getOpentime());
                }
                regionData.list.push(data);
            }
            currLen = currLen + subRegionNum;
        }
        var newRegionList = [];
        for (let k in regionList) {
            let v = regionList[k];
            newRegionList.push(v);
        }
        ArraySort(newRegionList, ServerListDataHelper.sortRegionListFunc);
        if (myServerList.length > 0) {
            var regionData = {
                minTime: -1,
                minNo: 0,
                regionName: '',
                list: myServerList
            };
            newRegionList.unshift(regionData);
        }
        var pageDataList = [];
        var titles = [];
        for (let k in newRegionList) {
            var v = newRegionList[k];
            if (v.minTime == -1) {
                titles.push(Lang.get('login_select_server_first_page_title'));
            } else {
                if (v.showNo == false) {
                    if (v.regionNameHead) {
                        titles.push((v.regionNameHead).toString() + (v.regionNameTail).toString());
                    } else {
                        titles.push(v.regionName);
                    }
                } else if (v.regionNameHead) {
                    titles.push(Lang.get('login_select_server_page_title2', {
                        name1: v.regionNameHead,
                        name2: v.regionNameTail,
                        min: v.minNo,
                        max: v.minNo + maxCount - 1
                    }));
                } else {
                    titles.push(Lang.get('login_select_server_page_title', {
                        region: v.regionName,
                        min: v.minNo,
                        max: v.minNo + maxCount - 1
                    }));
                }
            }
            pageDataList.push(v.list);
        }
        return [
            pageDataList,
            titles
        ];
    };
    export let _makeGroupUnit = function (groupData) {
        var unit = {
            groupId: groupData.getGroupid(),
            groupName: groupData.getGroupname(),
            openTime: 0,
            list: {}
        };
        var serverIds = groupData.getServerIds();
        for (let i in serverIds) {
            var strServerId = serverIds[i];
            var serverId = parseInt(strServerId);
            unit.list[serverId] = true;
        }
        return unit;
    };
    export let _checkNeedInGroup = function (serverData) {
        var serverId = serverData.getServer();
        var status = serverData.getStatus();
        var openTime = parseInt(serverData.getOpentime());
        var curTime = G_ServerTime.getTime();
        if (status == 7 || curTime < openTime) {
            return false;
        } else {
            return true;
        }
    };
    export let _formatGroupData = function (groupList, serverData) {
        var isIn = false;
        var needIn = ServerListDataHelper._checkNeedInGroup(serverData);
        var serverId = serverData.getServer();
        for (let groupId in groupList) {
            var unit = groupList[groupId];
            if (unit.list[serverId] == true) {
                if (needIn) {
                    unit.list[serverId] = {};
                    unit.list[serverId].server = serverData;
                    unit.list[serverId].role = G_RoleListManager.getMaxLevelRoleInServer(serverId);
                    var openTime = parseInt(serverData.getOpentime());
                    if (openTime > unit.openTime) {
                        unit.openTime = openTime;
                    }
                    isIn = true;
                } else {
                    unit.list[serverId] = null;
                    isIn = false;
                }
            }
        }
        return isIn;
    };
    export let _makeDefaultUnit = function () {
        var unit = {
            groupId: 'default',
            groupName: Lang.get('login_select_server_default_page_title'),
            openTime: 0,
            list: {}
        };
        return unit;
    };
    export let _formatDefaultData = function (defaultUnit, serverData) {
        var serverId = serverData.getServer();
        var openTime = parseInt(serverData.getOpentime());
        if (openTime > defaultUnit.openTime) {
            defaultUnit.openTime = openTime;
        }
        defaultUnit.list[serverId] = {};
        defaultUnit.list[serverId].server = serverData;
        defaultUnit.list[serverId].role = G_RoleListManager.getMaxLevelRoleInServer(serverId);
    };
    export let _makeMyUnit = function () {
        var unit = {
            groupId: 'my',
            groupName: Lang.get('login_select_server_first_page_title'),
            openTime: 0,
            list: {}
        };
        return unit;
    };
    export let _formatMyData = function (myUnit, serverData) {
        var serverId = serverData.getServer();
        var role = G_RoleListManager.getMaxLevelRoleInServer(serverId);
        if (role == null) {
            return;
        }
        var openTime = parseInt(serverData.getOpentime());
        if (openTime > myUnit.openTime) {
            myUnit.openTime = openTime;
        }
        myUnit.list[serverId] = {};
        myUnit.list[serverId].server = serverData;
        myUnit.list[serverId].role = role;
    };
    export let _removeUselessServerIdInGroup = function (groupList) {
        for (let groupId in groupList) {
            var unit = groupList[groupId];
            for (let serverId in unit.list) {
                var v = unit.list[serverId];
                if (v == true) {
                    unit.list[serverId] = null;
                }
            }
        }
    };
    export let getServerDataListForGroup = function () {
        var groupList = {};
        var serverGroup = G_ServerListManager.getServerGroup();
        for (let i in serverGroup) {
            var groupData = serverGroup[i];
            var unit = ServerListDataHelper._makeGroupUnit(groupData);
            groupList[unit.groupId] = unit;
        }
        var myUnit = ServerListDataHelper._makeMyUnit();
        var defaultUnit = ServerListDataHelper._makeDefaultUnit();
        var serverlist = G_ServerListManager.getList();
        for (let i in serverlist) {
            var serverData = serverlist[i];
            var isIn = ServerListDataHelper._formatGroupData(groupList, serverData);
            if (isIn == false) {
                ServerListDataHelper._formatDefaultData(defaultUnit, serverData);
            }
            ServerListDataHelper._formatMyData(myUnit, serverData);
        }
        ServerListDataHelper._removeUselessServerIdInGroup(groupList);
        var sortData = [];
        for (let groupId in groupList) {
            var unit = groupList[groupId];
            sortData.push(unit);
        }
        ArraySort(sortData, function (a, b) {
            return a.openTime > b.openTime;
        });
        var listData = [];
        if (G_RoleListManager.isNewPlayer()) {
            if (sortData[0]) {
                listData.push(sortData[1 - 1]);
            }
        } else {
            var serverId = G_RoleListManager.getEarliestServerId();
            var serverData = G_ServerListManager.getServerById(serverId);
            var openTime = parseInt(serverData.getOpentime());
            for (let i in sortData) {
                let unit = sortData[i];
                if (unit.openTime >= openTime) {
                    listData.push(unit);
                }
            }
        }
        listData.unshift(myUnit);
        var defaultServerCount = 0;
        for (let k in defaultUnit.list) {
            var v = defaultUnit.list[k];
            defaultServerCount = defaultServerCount + 1;
        }
        if (defaultServerCount > 0) {
            listData.push(defaultUnit);
        }
        var pageDataList = [];
        var titles = [];
        for (let i in listData) {
            let unit = listData[i];
            var list = [];
            for (serverId in unit.list) {
                var data = unit.list[serverId];
                list.push(data);
            }
            ArraySort(list, ServerListDataHelper.sortMyServerListFunc);
            pageDataList.push(list);
            titles.push(unit.groupName);
        }
        return [
            pageDataList,
            titles
        ];
    };
}