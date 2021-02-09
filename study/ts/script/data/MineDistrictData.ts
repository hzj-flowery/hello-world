import { BaseData } from "./BaseData";
import { G_UserData, G_ServerTime, G_ConfigLoader } from "../init";
import { ConfigNameConst } from "../const/ConfigNameConst";

export interface MineDistrictData {  
    getId():number
    setId(data:number):void
    getConfigData():any
    setConfigData(data:object):void
    getMineIdList():object
    setMineIdList(data:object):void
    getMineImageList():object
    setMineImageList(data:object):void
    getGuildId():number
    setGuildId(data:number):void
    getGuildName():object
    setGuildName(data:object):void
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
   schema['mineIdList'] = [
       'table',
       {}
   ];
   schema['mineImageList'] = [
       'table',
       {}
   ];
   schema['guildId'] = [
       'number',
       0
   ];
   schema['guildName'] = [
       'string',
       {}
   ];
export class MineDistrictData extends BaseData {
    public static schema = schema;
    public static DISTRICT_TYPE_SENIOR = 2;
    public static TYPE_REBOEN = 2;

    constructor(config) {
        super();
        this.setConfigData(config);
        this.setId(config.district_id);
    }
    public clear() {
    }
    public reset() {
    }
    public pushMineId(mineId) {
        let list:any = this.getMineIdList();
        list.push(mineId);
        this.setMineIdList(list);
    }
    public pushImage(imageId, imagePosX, imagePosY) {
        let list:any = this.getMineImageList();
        let image = {
            id: imageId,
            position: cc.v2(imagePosX, imagePosY)
        };
        list.push(image);
        this.setMineImageList(list);
    }
    public getGuildData() {
        if (this.getConfigData().occupy_pit == 0) {
            return null;
        }
        let guildList = {};
        let maxCount = 0;
        let retGuildId = 0;
        let retGuildName = '';
        for (let _ in this.getMineIdList()) {
            let id = this.getMineIdList()[_];
            let mineData = G_UserData.getMineCraftData().getMineDataById(id);
            let guildId = mineData.getGuildId();
            let guildName = mineData.getGuildName();
            if (guildId != 0) {
                if (guildList[guildId]) {
                    guildList[guildId].count = guildList[guildId].count + 1;
                } else {
                    guildList[guildId] = { count: 1 };
                }
                if (guildList[guildId].count > maxCount) {
                    retGuildId = guildId;
                    retGuildName = guildName;
                    maxCount = guildList[guildId].count;
                }
            }
        }
        if (maxCount >= this.getConfigData().occupy_pit) {
            //ERROR:
            let guildDetail:any = {
                id: retGuildId,
                name: retGuildName,
                count: maxCount
            };
            return guildDetail;
        }
    }
    public isSeniorDistrict():boolean {
        let config:any = this.getConfigData();
        return config.district_type <= MineDistrictData.DISTRICT_TYPE_SENIOR;
    }
    public isDistrictCanReborn():boolean {
        if (!this.isSeniorDistrict()) {
            return true;
        }
        let myGuild = G_UserData.getGuild().getMyGuild();
        if (!myGuild) {
            return false;
        }
        let guildId = myGuild.getId();
        if (this.getGuildId() == guildId) {
            return true;
        }
        return false;
    }
    public getRebornMine() {
        let idList = this.getMineIdList();
        for (let _ in idList) {
            let id = idList[_];
            let mineData = G_UserData.getMineCraftData().getMineDataById(id);
            let pitType = mineData.getConfigData().pit_type;
            if (pitType == MineDistrictData.TYPE_REBOEN) {
                return mineData;
            }
        }
    }
    public isOpen():boolean {
        let config = this.getConfigData();
        let unlockType = config.unlock_event;
        let mineOpenTime = G_UserData.getMineCraftData().getOpenTime();
        let MineEvent = G_ConfigLoader.getConfig(ConfigNameConst.MINE_EVENT);
        let openTime = MineEvent.get(unlockType).start_time;
        return G_ServerTime.getTime() - mineOpenTime > openTime;
    }
}
