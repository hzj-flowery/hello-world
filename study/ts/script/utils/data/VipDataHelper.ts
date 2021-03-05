import { G_UserData } from "../../init";

export namespace VipDataHelper {
    export function getVipValueByType  (vipType) {
        let vipCfg = getVipCfgByType(vipType);
        if (vipCfg) {
            return vipCfg.value;
        }
        return 0;
    };
    export function getVipCfgByTypeLevel  (vipType, vipLevel) {
        let vipMgr = G_UserData.getVip();
        let vipCfg = vipMgr.getVipFunctionDataByTypeLevel(vipType, vipLevel);
        return vipCfg;
    };
    export function getVipCfgByType  (vipType) {
        let vipMgr = G_UserData.getVip();
        let vipCfg = vipMgr.getVipFunctionDataByType(vipType);
        return vipCfg;
    };
    export function getVipGiftPkgList  () {
        let currentVipLv = G_UserData.getVip().getLevel();
        let list = G_UserData.getVip().getVipList();
        let vipGiftPkgList = [];
        for (let k in list) {
            let v = list[k];
            if (currentVipLv >= v.getInfo().show_lv) {
                vipGiftPkgList.push(v);
            }
        }
        return vipGiftPkgList;
    };
    export function findFirstCanReceiveGiftPkgIndex  (listData:any[]) {
        let playerVipLevel = G_UserData.getVip().getLevel();
        for (let k=1; k<=listData.length; k++) {
            let v = listData[k-1];
            let currVipLevel = v.getId();
            if (currVipLevel > playerVipLevel) {
            } else if (G_UserData.getVip().isVipRewardTake(currVipLevel)) {
            } else {
                return k;
            }
        }
        return null;
    };
    export function findFirstUnReceiveGiftPkgIndex  (listData) {
        let playerVipLevel = G_UserData.getVip().getLevel();
        for (let k=1; k<=listData.length; k++) {
            let v = listData[k-1];
            let currVipLevel = v.getId();
            if (currVipLevel > playerVipLevel) {
                return k;
            } else if (G_UserData.getVip().isVipRewardTake(currVipLevel)) {
            } else {
            }
        }
        return null;
    };
    export function isShowEnterIcon  () {
        let list = getVipGiftPkgList();
        let playerVipLevel = G_UserData.getVip().getLevel();
        for (let k in list) {
            let v = list[k];
            let currVipLevel = v.getId();
            if (currVipLevel > playerVipLevel) {
                return true;
            } else if (G_UserData.getVip().isVipRewardTake(currVipLevel)) {
            } else {
                return true;
            }
        }
        return false;
    };
};