import { BaseData } from "./BaseData";
import { G_UserData, G_ConfigLoader, G_ServerTime } from "../init";
import { ArraySort } from "../utils/handler";
import { ConfigNameConst } from "../const/ConfigNameConst";
import { MineUserData } from "./MineUserData";
import { table } from "../utils/table";

export interface MineData {
    getId(): number
    setId(data: number): void
    getConfigData(): any
    setConfigData(data: object): void
    getGuildId(): number
    setGuildId(data: number): void
    getGuildName(): string
    setGuildName(data: string): void
    getUserCnt(): number
    setUserCnt(data: number): void
    getUsers(): Array<any>
    setUsers(data: object): void
    isOwn(): boolean
    setOwn(data: boolean): void
    isRequestData(): boolean
    setRequestData(data: boolean): void
    getGuildIcon(): number
    setGuildIcon(data: number): void
    getMultiple(): number
    setMultiple(data: number): void
    getStartTime(): number
    setStartTime(data: number): void
    getEndTime(): number
    setEndTime(data: number): void
}

var schema = {};
schema['id'] = [
    'number',
    0
];
schema['configData'] = [
    'table',
    {}
];
schema['guildId'] = [
    'number',
    0
];
schema['guildName'] = [
    'string',
    ''
];
schema['userCnt'] = [
    'number',
    0
];
schema['users'] = [
    'table',
    {}
];
schema['own'] = [
    'boolean',
    false
];
schema['requestData'] = [
    'boolean',
    false
];
schema['guildIcon'] = [
    'number',
    0
];
schema['multiple'] = [
    'number',
    0
];
schema['startTime'] = [
    'number',
    0
];
schema['endTime'] = [
    'number',
    0
];
export class MineData extends BaseData {
    public static schema = schema;
    _otherGuildList;
    _mineGuildList;
    _otherList;
    _selfGuildList;
    _selfData;
    _userList: Array<MineUserData>;

    private _userIdMap;
    private _oldUsers:Array<any>;
    private _oldUserCount:Array<any>;
    constructor(config) {
        super();
        this.setId(config.pit_id);
        this.setConfigData(config);
        this._otherGuildList = {};
        this._mineGuildList = {};
        this._otherList = {};
        this._selfGuildList = {};
        this._selfData = null;
        this._userList = [];

        this._userIdMap = {};
        this._oldUsers = [];
        this._oldUserCount = [];
    }


    public clear() {
    }
    public reset() {
    }
    public refreshUser() {
        this._otherGuildList = [];
        this._mineGuildList = [];
        this._otherList = [];
        this._selfGuildList = [];
        this._selfData = null;
        if (this._oldUsers.length > 0) {
            var list = [];
            this._userIdMap = {};
            for (var i = this._oldUsers.length + 1; i != this._userList.length; i++) {
                table.insert(list, this._userList[i]);
                this._userIdMap[this._userList[i].getUser_id()] = list.length;
            }
            this._userList = list;
        }
        var count = 0;
        for (let i in this._oldUserCount) {
            var v = this._oldUserCount[i];
            count = count + v;
        }
        if (count < this._oldUsers.length + this._userList.length) {
            table.insert(this._oldUserCount, this._oldUsers.length + this._userList.length - count);
        }

        for (let i in this._userList) {
            let user = this._userList[i];
            this._pushGuildMap(user);
        }
        this._sortUserList();
        this._userList = [];
        this._userIdMap = {};
        this._oldUsers = [];
    }

    resetUserList() {
        var list = this.getUsers();
        this._oldUsers = [];
        for (let i in list) {
            var v = list[i];
            this._oldUsers[i] = v;
            table.insert(this._userList, v);
            this._userIdMap[v.getUser_id()] = this._userList.length;
        }
    }

    public getUserCount(): number {
        let users:any = this.getUsers();
        return users.length;
    }
    public _pushGuildMap(userData) {
        let myGuild = G_UserData.getGuild().getMyGuild();
        let myGuildId = null;
        if (myGuild) {
            myGuildId = myGuild.getId();
        }
        if (userData.getUser_id() == G_UserData.getBase().getId()) {
            this._selfData = userData;
            return;
        }
        if (userData.getGuild_id() == 0) {
            this._otherList.push(userData);
            return;
        }
        if (myGuildId) {
            if (userData.getGuild_id() == myGuildId && userData.getUser_id() != G_UserData.getBase().getId()) {
                this._selfGuildList.push(userData);
                return;
            }
        }
        if (userData.getGuild_id() == this.getGuildId()) {
            this._mineGuildList.push(userData);
            return;
        }
        for (let i in this._otherGuildList) {
            let v = this._otherGuildList[i];
            if (v.id == userData.getGuild_id()) {
                v.users.push(userData);
                return;
            }
        }
        let singleGuild = {
            id: userData.getGuild_id(),
            name: userData.getGuild_name(),
            level: userData.getGuild_level(),
            exp: userData.getGuild_exp(),
            users: [userData]
        };
        this._otherGuildList.push(singleGuild);
    }
    public _sortUserList() {
        var list = this._oldUsers;
        ArraySort(this._selfGuildList, function (a, b) {
            return a.getPower() > b.getPower();
        });
        ArraySort(this._mineGuildList, function (a, b) {
            return a.getPower() > b.getPower();
        });
        ArraySort(this._otherList, function (a, b) {
            return a.getPower() > b.getPower();
        });
        ArraySort(this._otherGuildList, function (a, b) {
            if (a.level == b.level) {
                return a.exp > b.exp;
            }
            return a.level > b.level;
        });
        for (let _ in this._otherGuildList) {
            var data = this._otherGuildList[_];
            ArraySort(data.users, function (a, b) {
                return a.getPower() > b.getPower();
            });
        }
        var count = list.length;
        if (this._selfData) {
            list[count] = this._selfData;
            count = count + 1;
        }
        for (let _ in this._selfGuildList) {
            var user = this._selfGuildList[_];
            list[count] = user;
            count = count + 1;
        }
        for (let _ in this._mineGuildList) {
            var user = this._mineGuildList[_];
            list[count] = user;
            count = count + 1;
        }
        for (let _ in this._otherGuildList) {
            var guild = this._otherGuildList[_];
            for (_ in guild.users) {
                var user = guild.users[_];
                list[count] = user;
                count = count + 1;
            }
        }
        for (let _ in this._otherList) {
            var user = this._otherList[_];
            list[count] = user;
            count = count + 1;
        }
        this.setUsers(list);
    }
    public getMineStateConfig(): Array<any> {
        let userCount = this.getUserCnt();
        if (this.getConfigData().pit_type == 2) {
            userCount = 0;
        }
        let outputId = this.getConfigData().templet_id;
        let outputConfig = null;
        let baseOutput = null;
        let min = -1;
        let MineOutPut = G_ConfigLoader.getConfig(ConfigNameConst.MINE_OUTPUT);
        for (let i = 0; i < MineOutPut.length(); i++) {
            let config = MineOutPut.indexOf(i);
            if (config.templet_id == outputId) {
                if (!baseOutput) {
                    baseOutput = config;
                }
                if (userCount > min && userCount <= config.population) {
                    outputConfig = config;
                    return [
                        outputConfig,
                        baseOutput
                    ];
                } else {
                    min = config.population;
                }
            }
        }
    }
    public getGuildMemberCount(guildId): number {
        let id = guildId || this.getGuildId();
        let userList = this.getUsers();
        let count = 0;
        for (let _ in userList) {
            let user = userList[_];
            if (user.getGuild_id() == id) {
                count = count + 1;
            }
        }
        return count;
    }
    public isSeniorDistrict() {
        let districtId = this.getConfigData().district;
        //ERROR:
        let data = G_UserData.getMineCraftData().getDistrictDataById(districtId);
        return data.isSeniorDistrict();
    }
    public isUserInList(userId): boolean {
        for (let _ in this.getUsers()) {
            let user = this.getUsers()[_];
            if (user.getUser_id() == userId) {
                return true;
            }
        }
        return false;
    }
    public pushUser(userData) {
        var mineUserData = new MineUserData(userData);
        var userId = mineUserData.getUser_id();
        if (this._userIdMap[userId]) {
            var index = this._userIdMap[userId];
            this._userList[index] = mineUserData;
        } else {
            table.insert(this._userList, mineUserData);
            this._userIdMap[userId] = this._userList.length;
        }
    }
    //清空user列表
    public clearUserList() {
        this._userList = [];
        this._userIdMap = {};
        this._oldUsers = [];
        this._oldUserCount = [];
    }
    //获取user
    public getUserById(userId) {
        for (let i in this.getUsers()) {
            let v = this.getUsers()[i];
            if (v.getUser_id() == userId) {
                return v;
            }
        }
    }
    //删除user
    public deleteUser(userId) {
        if (!this.hasUsers()) {
            return;
        }
        var configData = this.getConfigData();
        if (configData.pit_type == 2) {
            return;
        }
        var users = this.getUsers();
        var list = [];
        var indexList = [];
        for (let i in users) {
            var v = users[i];
            if (v.getUser_id() != userId) {
                table.insert(list, v);
            } else {
                table.insert(indexList, i);
            }
        }
        var count = 0;
        var index = 1;
        for (let i in this._oldUserCount) {
            var v = this._oldUserCount[i];
            count = count + v;
            while (index <= indexList.length) {
                if (indexList[index] <= count) {
                    this._oldUserCount[i] = v - 1;
                    index = index + 1;
                } else {
                    break;
                }
            }
        }
        this.setUsers(list);
    }
    public updateUser(mineUser) {
        let user = this.getUserById(mineUser.user_id);
        if (user) {
            user.setProperties(mineUser);
        }
    }
    public newUser(user): void {
        if (!this.hasUsers()) {
            return;
        }
        var configData = this.getConfigData();
        if (configData.pit_type == 2) {
            return;
        }
        this._userList = [];
        this._userIdMap = {};
        var count = 0;
        for (var i = 1; i <= this._oldUserCount.length - 1; i++) {
            count = count + this._oldUserCount[i];
        }
        this._oldUsers = [];
        var userList:Array<any> = this.getUsers();
        for (var i = 1; i <= count; i++) {
            var item = userList[i-1];
            if (!item) {
                break;
            }
            table.insert(this._oldUsers, item);
            table.insert(this._userList, item);
            this._userIdMap[item.getUser_id()] = this._userList.length;
        }
        for (var i = count + 1; i <= userList.length; i++) {
            var item = userList[i-1];
            if (!item) {
                break;
            }
            table.insert(this._userList, item);
            this._userIdMap[item.getUser_id()] = this._userList.length;
        }
        this.pushUser(user);
        this._oldUserCount[this._oldUserCount.length] = this._oldUserCount[this._oldUserCount.length] + 1;
        this.refreshUser();
    }
    public isMyGuildMine(): boolean {
        let myGuildId = G_UserData.getGuild().getMyGuildId();
        if (myGuildId != 0 && this.getGuildId() == myGuildId) {
            return true;
        }
        return false;
    }
    public hasUsers(): boolean {
        let userList:any = this.getUsers();
        return userList.length != 0;
    }
    public clearUsers() {
        this.setUsers([]);
    }
    isPeace():boolean {
        var now = G_ServerTime.getTime();
        return now >= this.getStartTime() && now < this.getEndTime();
    }
}
