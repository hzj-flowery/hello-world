import { BaseData } from './BaseData'
import { G_NetworkManager, G_SignalManager, G_ConfigLoader, G_UserData, G_Prompt, G_ServerTime } from '../init';
import { MessageIDConst } from '../const/MessageIDConst';
import { SignalConst } from '../const/SignalConst';
import { MessageErrorConst } from '../const/MessageErrorConst';
import { HomelandConst } from '../const/HomelandConst';
import { ConfigNameConst } from '../const/ConfigNameConst';
import { ArraySort, handler } from '../utils/handler';
import { HomelandHelp } from '../scene/view/homeland/HomelandHelp';
import { DailyCountData } from './DailyCountData';
import { HomelandBuffData } from './HomelandBuffData';
import { TimeConst } from '../const/TimeConst';
let MAX_TREE_TYPE = 6;
let schema = {};
export class HomelandData extends BaseData {
    public static schema = schema;

    _subTreeInfo;
    _mainTreeInfo;
    _treeManager;
    _friendTreeData;
    _signalRecvUpdateHomeTreeManager;
    _signalRecvHomeTreeUpLevel;
    _signalRecvUpdateHomeTree;
    _signalRecvGetHomeTree;
    _signalRecvHomeTreeHarvest;
    _signalRecvVisitFriendHome;
    _buffDatas: {};
    _buffNotice: {};
    _signalRecvHomeTreeBless: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;
    _signalRecvHomeTreeBuffNotice: import("f:/mingjiangzhuan/main/assets/resources/script/utils/event/Slot").Slot;

    constructor(properties?) {
        super(properties)
        this._subTreeInfo = {};
        this._mainTreeInfo = {};
        this._treeManager = {};
        this._friendTreeData = {};
        this._buffDatas = {};
        this._buffNotice = {};
        this._signalRecvUpdateHomeTreeManager = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateHomeTreeManager, this._s2cUpdateHomeTreeManager.bind(this));
        this._signalRecvHomeTreeUpLevel = G_NetworkManager.add(MessageIDConst.ID_S2C_HomeTreeUpLevel, this._s2cHomeTreeUpLevel.bind(this));
        this._signalRecvUpdateHomeTree = G_NetworkManager.add(MessageIDConst.ID_S2C_UpdateHomeTree, this._s2cUpdateHomeTree.bind(this));
        this._signalRecvGetHomeTree = G_NetworkManager.add(MessageIDConst.ID_S2C_GetHomeTree, this._s2cGetHomeTree.bind(this));
        this._signalRecvHomeTreeHarvest = G_NetworkManager.add(MessageIDConst.ID_S2C_HomeTreeHarvest, this._s2cHomeTreeHarvest.bind(this));
        this._signalRecvVisitFriendHome = G_NetworkManager.add(MessageIDConst.ID_S2C_VisitFriendHome, this._s2cVisitFriendHome.bind(this));
        this._signalRecvHomeTreeBless = G_NetworkManager.add(MessageIDConst.ID_S2C_HomeTreeBless, handler(this, this._s2cHomeTreeBless));
        this._signalRecvHomeTreeBuffNotice = G_NetworkManager.add(MessageIDConst.ID_S2C_HomeTreeBuffNotice, handler(this, this._s2cHomeTreeBuffNotice));
        this._initTreeCfg();
    }
    public _initTreeCfg() {
        for (let i = 1; i <= MAX_TREE_TYPE; i++) {
            let treeTable: any = {};
            treeTable.treeId = i;
            treeTable.treeLevel = 0;
            treeTable.treeExp = 0;
            treeTable.treeCfg = this.getSubTreeCfg(treeTable.treeId, 1);
            this._subTreeInfo['k' + treeTable.treeId] = treeTable;
        }
        let treeTable: any = {};
        treeTable.treeId = 0;
        treeTable.treeLevel = 1;
        treeTable.treeExp = 0;
        treeTable.treeCfg = this.getMainTreeCfg(1);
        this._mainTreeInfo = treeTable;
    }
    public clear() {
        this._signalRecvUpdateHomeTreeManager.remove();
        this._signalRecvUpdateHomeTreeManager = null;
        this._signalRecvHomeTreeUpLevel.remove();
        this._signalRecvHomeTreeUpLevel = null;
        this._signalRecvUpdateHomeTree.remove();
        this._signalRecvUpdateHomeTree = null;
        this._signalRecvGetHomeTree.remove();
        this._signalRecvGetHomeTree = null;
        this._signalRecvHomeTreeHarvest.remove();
        this._signalRecvHomeTreeHarvest = null;
        this._signalRecvVisitFriendHome.remove();
        this._signalRecvVisitFriendHome = null;
        this._signalRecvHomeTreeBless.remove();
        this._signalRecvHomeTreeBless = null;
        this._signalRecvHomeTreeBuffNotice.remove();
        this._signalRecvHomeTreeBuffNotice = null;
    }
    public reset() {
    }
    public getTreeManager() {
        return this._treeManager;
    }
    public _s2cUpdateHomeTreeManager(id, message) {
        let home_tree_manager = message['home_tree_manager'];
        if (home_tree_manager) {
            this._treeManager.lastStartTime = home_tree_manager.last_start_time;
            this._treeManager.lastHarvestTime = home_tree_manager.last_harvest_time;
            this._treeManager.total = home_tree_manager.total;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_HOME_TREE_MANAGER_SUCCESS);
    }
    public c2sHomeTreeUpLevel(id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HomeTreeUpLevel, { id: id });
    }
    public _s2cHomeTreeUpLevel(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HOME_TREE_UP_LEVEL_SUCCESS, message);
    }
    public _s2cUpdateHomeTree(id, message) {
        let home_tree = message['home_tree'];
        if (home_tree) {
            if (home_tree.tree_id == 0) {
                this._updateMainTree(home_tree);
            } else {
                this._updateSubTree(home_tree);
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_UPDATE_HOME_TREE_SUCCESS);
    }
    public c2sGetHomeTree() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_GetHomeTree, {});
    }
    public c2sVisitFriendHome(friend_id) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_VisitFriendHome, { friend_id: friend_id });
    }
    public _s2cVisitFriendHome(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let friend_id = message['friend_id'];
        if (friend_id) {
            this._friendTreeData.id = friend_id;
        }
        let home_trees = message['home_trees'];
        function getTreeData(treeId) {
            for (let i = 0; i < home_trees.length; i++) {
                let value = home_trees[i];
                if (treeId == value.tree_id) {
                    return value;
                }
            }
        }
        if (home_trees) {
            let homeTreeList = [];
            for (let i = 0; i <= HomelandConst.MAX_SUB_TREE; i++) {
                let treeData: any = {};
                treeData.tree_id = i;
                treeData.tree_level = 0;
                treeData.tree_exp = 0;
                let tempData = getTreeData(i);
                treeData = tempData || treeData;
                homeTreeList.push(treeData);
            }
            console.log(this._friendTreeData.homeTrees);
            this._friendTreeData.homeTrees = homeTreeList;
        }
        G_SignalManager.dispatch(SignalConst.EVENT_VISIT_FRIEND_HOME_SUCCESS);
    }

    c2sHomeTreeBless(pos) {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HomeTreeBless, { pos: pos });
    }
    _s2cHomeTreeBless(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        var buffId = (message['buff_id']) || 0;
        var pos = (message['pos']) || 0;
        G_SignalManager.dispatch(SignalConst.EVENT_HOME_TREE_BLESS_SUCCESS, buffId, pos);
    }
    _s2cHomeTreeBuffNotice(id, message) {
        var buffId = (message['buff_id']);
        var buffData = this.getBuffDataWithId(buffId);
        if (buffData) {
            var buffBaseId = buffData.getBaseId();
            var tips = HomelandHelp.getBuffEffectTip(buffBaseId);
            var isDelay = HomelandConst.isDelayShowTip(buffBaseId);
            if (isDelay) {
                this._buffNotice[buffBaseId] = tips;
            } else {
                if (tips != '') {
                    G_Prompt.showTip(tips);
                }
            }
        }
    }
    getBuffNoticeTip(buffBaseId) {
        return this._buffNotice[buffBaseId];
    }
    removeBuffNoticeTip(buffBaseId) {
        this._buffNotice[buffBaseId] = null;
        delete this._buffNotice[buffBaseId];
    }

    public _makeTreeTable(treeInfo) {
        let treeTable: any = {};
        treeTable.treeId = treeInfo.tree_id;
        treeTable.treeLevel = treeInfo.tree_level;
        treeTable.treeExp = treeInfo.tree_exp;
        if (treeTable.treeId == 0) {
            treeTable.treeCfg = this.getMainTreeCfg(treeTable.treeLevel);
        } else if (treeTable.treeId > 0) {
            treeTable.treeCfg = this.getSubTreeCfg(treeTable.treeId, treeTable.treeLevel);
            if (treeTable.treeCfg == null) {
                treeTable.treeCfg = this.getSubTreeCfg(treeTable.treeId, 1);
            }
        }
        return treeTable;
    }
    public _updateMainTree(treeInfo) {
        let treeTable = this._makeTreeTable(treeInfo);
        this._mainTreeInfo = treeTable;
    }
    public _updateSubTree(treeInfo) {
        let treeTable = this._makeTreeTable(treeInfo);
        this._subTreeInfo['k' + treeTable.treeId] = treeTable;
    }
    public _s2cGetHomeTree(idd, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let home_manager = message['home_manager'];
        if (home_manager) {
            this._treeManager.lastStartTime = home_manager.last_start_time;
            this._treeManager.lastHarvestTime = home_manager.last_harvest_time;
            this._treeManager.total = home_manager.total;
        }
        let home_trees = message['home_trees'];
        if (home_trees) {
            for (let i in home_trees) {
                let treeInfo = home_trees[i];
                if (treeInfo.tree_id == 0) {
                    this._updateMainTree(treeInfo);
                } else {
                    this._updateSubTree(treeInfo);
                }
            }
        }
        this._buffDatas = {};
        var homeTreeBuffs = (message['home_tree_buffs']);
        if (homeTreeBuffs) {
            for (var i in homeTreeBuffs) {
                var buff = homeTreeBuffs[i];
                var data = new HomelandBuffData();
                data.updateData(buff);
                var id = data.getId();
                this._buffDatas[id] = data;
            }
        }
        G_SignalManager.dispatch(SignalConst.EVENT_GET_HOME_TREE_SUCCESS);
    }
    public c2sHomeTreeHarvest() {
        G_NetworkManager.send(MessageIDConst.ID_C2S_HomeTreeHarvest, {});
    }
    public _s2cHomeTreeHarvest(id, message) {
        if (message.ret != MessageErrorConst.RET_OK) {
            return;
        }
        let awards = message['awards'];
        if (!awards) {
        }
        G_SignalManager.dispatch(SignalConst.EVENT_HOME_TREE_HARVEST_SUCCESS, message);
    }
    public getSubTreeLevel(subTreeType) {
        let subTreeInfo = this._subTreeInfo['k' + subTreeType];
        //console.log(subTreeInfo);
        return subTreeInfo.treeLevel;
    }
    public isSubTreeLevelMax(subTreeType, inputLevel?) {
        let currLevel = inputLevel || this.getSubTreeLevel(subTreeType);
        let isMax = this.getSubTreeCfg(subTreeType, currLevel + 1) == null;
        return isMax;
    }
    public isMainTreeLevelMax(inputLevel?) {
        let currLevel = inputLevel || this.getMainTreeLevel();
        let isMax = this.getMainTreeCfg(currLevel + 1) == null;
        return isMax;
    }
    public getMainTreeLevel() {
        let mainTree = this._mainTreeInfo;
        return mainTree.treeLevel;
    }
    public getMainTreeCfg(id) {
        if (id > 0) {
            let mainTreeCfg = G_ConfigLoader.getConfig(ConfigNameConst.TREE_INFO).get(id);
            return mainTreeCfg;
        }
        return null;
    }
    public getSubTreeCfg(type, level) {
        if (type > 0 && level > 0) {
            let subTreeCfg = G_ConfigLoader.getConfig(ConfigNameConst.TREE_DECORATE_ADD).get(type, level);
            return subTreeCfg;
        }
        return null;
    }
    public getGuildMemberByFriendId(friendId) {
        let dataList = this.getGuildMemberList();
        for (let i in dataList) {
            let data = dataList[i];
            if (data.getUid() == friendId) {
                return data;
            }
        }
        return null;
    }
    public getGuildMemberList() {
        let isInGuild = G_UserData.getGuild().isInGuild();
        if (isInGuild == false) {
            return {};
        }
        let dataList = G_UserData.getGuild().getGuildMemberListBySort();
        function fitlerSelfUser(dataList) {
            let retList = [];
            for (let i = 0; i < dataList.length; i++) {
                let value = dataList[i];
                if (value.getHome_tree_level() > 0) {
                    retList.push(value);
                }
            }
            return retList;
        }
        function sortFun(a, b) {
            let selfA = a.isSelf() ? 1 : 0;
            let selfB = b.isSelf() ? 1 : 0;
            if (selfA != selfB) {
                return selfA > selfB;
            }
            if (a.getHome_tree_level() != b.getHome_tree_level()) {
                return a.getHome_tree_level() > b.getHome_tree_level();
            }
        }
        let retList = fitlerSelfUser(dataList);
        ArraySort(retList, sortFun);
        return retList;
    }
    public getMainTree() {
        return this._mainTreeInfo;
    }
    public getSubTree(treeId) {
        if (treeId && treeId > 0) {
            let treeData = this._subTreeInfo['k' + treeId];
            return treeData;
        }
        return null;
    }
    public getInviteFriendMainTree(friendId) {
        let homeTree = this._friendTreeData.homeTrees;
        let getMainTree = function (homeTree) {
            for (let i in homeTree) {
                let treeInfo = homeTree[i];
                if (treeInfo.tree_id == 0) {
                    let treeTable = this._makeTreeTable(treeInfo);
                    return treeTable;
                }
            }
            return null;
        }.bind(this);
        if (friendId && friendId == this._friendTreeData.id) {
            return getMainTree(homeTree);
        }
        if (friendId == null) {
            return getMainTree(homeTree);
        }
        return null;
    }
    public getInviteFriendSubTreeTest(subTreeType) {
        let homeTree = this._friendTreeData.homeTrees;
        function getSubTree(homeTree) {
            for (let i in homeTree) {
                let treeInfo = homeTree[i];
                if (treeInfo.tree_id == subTreeType) {
                    let treeTable = this._makeTreeTable(treeInfo);
                    return treeTable;
                }
            }
            return null;
        }
        return getSubTree(homeTree);
    }
    public getInviteFriendSubTree(friendId, subTreeType) {
        let homeTree = this._friendTreeData.homeTrees;
        let getSubTree = function (homeTree) {
            for (let i in homeTree) {
                let treeInfo = homeTree[i];
                if (treeInfo.tree_id == subTreeType) {
                    let treeTable = this._makeTreeTable(treeInfo);
                    return treeTable;
                }
            }
            return null;
        }.bind(this);
        if (friendId && friendId == this._friendTreeData.id) {
            return getSubTree(homeTree);
        }
        if (friendId == null) {
            return getSubTree(homeTree);
        }
        return null;
    }
    public isTreeAwardTake() {
        let count = G_UserData.getDailyCount().getCountById(DailyCountData.DAILY_RECORD_HOME_TREE_AWARD);
        if (count > 0) {
            return true;
        }
        return false;
    }
    public hasRedPoint() {

        if (G_UserData.getHomeland().isTreeAwardTake() == false) {
            return true;
        }
        let redValue1 = HomelandHelp.checkMainTreeUp(this._mainTreeInfo, false);
        if (redValue1 == true) {
            return true;
        }
        for (let i = 1; i <= HomelandConst.MAX_SUB_TREE; i++) {
            let subTree = this.getSubTree(i);
            let redValue = HomelandHelp.checkSubTreeUp(subTree, false);
            if (redValue == true) {
                return true;
            }
        }
        if (this.getPrayRestCount() > 0) {
            return true;
        }
        return false;
    }

    updateBuffData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        for (var i in datas) {
            var data = datas[i];
            this._buffDatas[data.id] = null;
            var buffData = new HomelandBuffData();
            buffData.updateData(data);
            this._buffDatas[data.id] = buffData;
        }
    }
    insertBuffData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        for (var i in datas) {
            var data = datas[i];
            this._buffDatas[data.id] = null;
            var buffData = new HomelandBuffData();
            buffData.updateData(data);
            this._buffDatas[data.id] = buffData;
        }
    }
    deleteBuffData(datas) {
        if (datas == null || typeof (datas) != 'object') {
            return;
        }
        for (var i in datas) {
            var id = datas[i];
            this._buffDatas[id] = null;
        }
        var count = 0;
        for (id in this._buffDatas) {
            var data = this._buffDatas[id];
            count = count + 1;
        }
        if (count == 0) {
            G_SignalManager.dispatch(SignalConst.EVENT_HOME_LAND_BUFF_EMPTY);
        }
    }
    getBuffDatasBySort() {
        var result = [];
        for (var id in this._buffDatas) {
            var data = this._buffDatas[id];
            result.push(data);
        }
        result.sort(function (a, b) {
            if (a.isEffected() != b.isEffected()) {
                return !a.isEffected() ? -1 : 1;
            } else {
                return a.getStartTime() - b.getStartTime();
            }
        });
        return result;
    }
    getBuffDatasToday() {
        var result = {};
        for (var id in this._buffDatas) {
            var data = this._buffDatas[id];
            var startTime = data.getStartTime();
            var tempTime = G_ServerTime.secondsFromZero(null, TimeConst.RESET_TIME_SECOND);
            if (startTime >= tempTime) {
                var pos = data.getPos();
                result[pos] = data;
            }
        }
        return result;
    }
    getBuffDataWithId(id) {
        return this._buffDatas[id];
    }
    getBuffDatasWithBaseId(baseId) {
        var result = [];
        for (var id in this._buffDatas) {
            var buffData = this._buffDatas[id];
            if (buffData.getBaseId() == baseId) {
                result.push(buffData);
            }
        }
        return result;
    }
    getPrayRestCount() {
        var count = G_UserData.getDailyCount().getCountById(DailyCountData.DAILY_RECORD_HOME_TREE_PRAY);
        var level = this.getMainTreeLevel();
        var info = HomelandHelp.getTreeInfoConfig(level);
        var totalCount = info.prayer_times;
        return totalCount - count;
    }
}
