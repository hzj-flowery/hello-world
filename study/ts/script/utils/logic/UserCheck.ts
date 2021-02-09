import { ConfigNameConst } from "../../const/ConfigNameConst";
import { DataConst } from "../../const/DataConst";
import { FunctionConst } from "../../const/FunctionConst";
import { G_ConfigLoader, G_Prompt, G_RecoverMgr, G_SceneManager, G_UserData, G_ConfigManager } from "../../init";
import { Lang } from "../../lang/Lang";
import PopupAlert from "../../ui/PopupAlert";
import PopupBase from "../../ui/PopupBase";
import PopupItemGuider from "../../ui/PopupItemGuider";
import PopupPlayerLevelUp from "../../ui/PopupPlayerLevelUp";
import PopupSystemAlert from "../../ui/PopupSystemAlert";
import { UserDataHelper } from "../data/UserDataHelper";
import { WayFuncDataHelper } from "../data/WayFuncDataHelper";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { Path } from "../Path";
import { TypeConvertHelper } from "../TypeConvertHelper";
import { UIPopupHelper } from "../UIPopupHelper";

export namespace UserCheck {
    export function init() {
    }

    export function isLevelUp(callback?): [boolean, number] {
        let isLevelUp = G_UserData.getBase().isLevelUp()[0];
        G_UserData.getBase().clearLevelUpFlag();
        let levelRange = G_UserData.getBase().getLevel() - G_UserData.getBase().getOldPlayerLevel();
        if (isLevelUp) {
            PopupBase.loadCommonPrefab('PopupPlayerLevelUp', (popupLevelUpLayer: PopupPlayerLevelUp) => {
                popupLevelUpLayer.setCloseCallback(callback);
                popupLevelUpLayer.defaultUI();
                popupLevelUpLayer.open();
            });
        } else {
            if (callback) {
                callback(false);
            }
        }
        return [
            isLevelUp,
            levelRange
        ];
    };
    export function enoughLevel(currLv): boolean {
        if (currLv <= G_UserData.getBase().getLevel()) {
            return true;
        }
        return false;
    };
    export function enoughOpenDay(openDay, resetTime?): boolean {
        let nowDay = G_UserData.getBase().getOpenServerDayNum(resetTime);
        if (openDay <= nowDay) {
            return true;
        }
        return false;
    };
    export function enoughLastLevel(funcLevel): boolean {
        let lastLevel = G_UserData.getBase().getOldPlayerLevel();
        if (funcLevel <= lastLevel) {
            return true;
        }
        return false;
    };
    export function enoughVip(vip): (boolean | Function)[] {
        if (vip <= G_UserData.getVip().getLevel()) {
            return [true];
        }
        function popFunc() {
            function callBackOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE);
            }
            G_SceneManager.openPopup(Path.getPrefab("PopupAlert", "common"), (popupAlert: PopupAlert) => {
                popupAlert.init(Lang.get('common_vip_not_enough_title'), Lang.get('common_vip_not_enough'), callBackOk);
                popupAlert.setOKBtn(Lang.get('common_goto_recharge'));
                popupAlert.openWithAction();
            });
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughMoney(needMoney, popupDlg?): (boolean | Function)[] {
        if (needMoney <= G_UserData.getBase().getResValue(DataConst.RES_GOLD)) {
            return [true];
        }
        function popFunc() {
            G_Prompt.showTip('银币不足');
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughSoul(needSoul, popupDlg): (boolean | Function)[] {
        if (needSoul <= G_UserData.getBase().getResValue(DataConst.RES_SOUL)) {
            return [true];
        }
        function popFunc() {
            G_Prompt.showTip('将魂不足');
            UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                popupItemGuider.setTitle(Lang.get('way_type_get'));
                popupItemGuider.updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_SOUL);
                popupItemGuider.openWithAction();
            }.bind(this));
        }
        return [
            false,
            popFunc
        ];
    };

    export function enoughJade(needValue, popupDlg): (boolean | Function)[] {
        if (needValue <= G_UserData.getBase().getResValue(DataConst.RES_JADE)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughManna(needValue, popupDlg): (boolean | Function)[] {
        if (needValue <= G_UserData.getBase().getResValue(DataConst.RES_MANNA)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_MANNA);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughBaowuzhihun(needValue, popupDlg): (boolean | Function)[] {
        if (needValue <= G_UserData.getBase().getResValue(DataConst.RES_BAOWUZHIHUN)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_BAOWUZHIHUN);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughEquipStone(needValue, popupDlg): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_EQUIP_STONE);
        if (needValue <= currNum) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_EQUIP_STONE);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughHoner(needValue, popupDlg): (boolean | Function)[] {
        if (needValue <= G_UserData.getBase().getResValue(DataConst.RES_HONOR)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_HONOR);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughGongXian(needValue, popupDlg): (boolean | Function)[] {
        if (needValue <= G_UserData.getBase().getResValue(DataConst.RES_GONGXIAN)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GONGXIAN);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughSupportTicket(needValue, popupDlg): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_SUPPORT_TICKET);
        if (needValue <= currNum) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_SUPPORT_TICKET);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughHorseWhistle(needValue, popupDlg): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE);
        if (needValue <= currNum) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughHorseWhistleFragment(needValue, popupDlg): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE_FRAGMENT);
        if (needValue <= currNum) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_HORSE_WHISTLE_FRAGMENT);
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughCash(needCash, popupDlg?): [boolean, Function] {
        if (needCash <= G_UserData.getBase().getResValue(DataConst.RES_DIAMOND)) {
            return [true, null];
        }
        function popFunc() {
          G_SceneManager.showDialog("prefab/vip/PopupCurrencyExchangeView");
        }
        if (popupDlg == true) {
            popFunc();
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughRecruitToken(needToken): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN);
        if (needToken <= currNum) {
            return [true, null];
        }
        function popFunc() {
            G_Prompt.showTip(Lang.get('recruit_choose_no_token'));
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughAvatarActivityToken(needToken): (boolean | Function)[] {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_AVATAR_ACTIVITY_TOKEN);
        if (needToken <= currNum) {
            return [true, null];
        }
        function popFunc() {
            G_Prompt.showTip(Lang.get('customactivity_avatar_token_not_enough'));
        }
        return [
            false,
            popFunc
        ];
    };
    export function getNormalFailDialog(type, value) {
        function popFunc() {
            UIPopupHelper.popupItemGuider(function (popupItemGuider: PopupItemGuider) {
                popupItemGuider.setTitle(Lang.get('way_type_get'));
                popupItemGuider.updateUI(type, value);
                popupItemGuider.openWithAction();
            }.bind(this));
        }
        return popFunc;
    };

    export function enoughGoldKey(needValue, popupDlg) {
        var currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_KEY);
        if (needValue <= currNum) {
            return [true,null];
        }
        
        function popFunc() {
            UIPopupHelper.popupItemGuider(function(pop:PopupItemGuider){
                pop.setTitle(Lang.get('way_type_get'));
                pop.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_KEY);
                pop.openWithAction();
              })
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughGoldBox(needValue, popupDlg) {
        var currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_BOX);
        if (needValue <= currNum) {
            return [true,null];
        }
        function popFunc() {
            UIPopupHelper.popupItemGuider(function(pop:PopupItemGuider){
                pop.setTitle(Lang.get('way_type_get'));
                pop.updateUI(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_GOLD_BOX);
                pop.openWithAction();
              })

        }
        return [
            false,
            popFunc
        ];
    };

    export function enoughVit(needVit): (boolean | Function)[] {
        if (needVit <= G_UserData.getBase().getResValue(DataConst.RES_VIT)) {
            return [true, null];
        }
        function popFunc() {
            let itemValue = DataConst.RES_VIT;
            let [success, popDialog] = UserCheck.resCheck(itemValue, -1, true);
            if (!popDialog) {
                G_Prompt.showTip(Lang.get('common_not_develop'));
            }
            return;
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughArmyFood(needFood): (boolean | Function)[] {
        if (needFood <= G_UserData.getBase().getResValue(DataConst.RES_ARMY_FOOD)) {
            return [true, null];
        }
        function popFunc() {
            let itemValue = DataConst.RES_ARMY_FOOD;
            let arr = UserCheck.resCheck(itemValue, -1, true);
            if (!arr[1]) {
                G_Prompt.showTip(Lang.get('common_not_develop'));
            }
            return;
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughArmyToken(needCount): (boolean | Function)[] {
        if (needCount <= G_UserData.getBase().getResValue(DataConst.RES_MINE_TOKEN)) {
            return [true, null];
        }
        function popFunc() {
            let itemValue = DataConst.RES_MINE_TOKEN;
            let arr = UserCheck.resCheck(itemValue, -1, true);
            if (!arr[1]) {
                G_Prompt.showTip(Lang.get('common_not_develop'));
            }
            return;
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughSiegeToken(needCount): (boolean | Function)[] {
        if (needCount <= G_UserData.getBase().getResValue(DataConst.RES_TOKEN)) {
            return [true, null];
        }
        function popFunc() {
            let itemValue = DataConst.RES_TOKEN;
            let arr = UserCheck.resCheck(itemValue, -1, true);
            if (!arr[1]) {
                G_Prompt.showTip(Lang.get('common_not_develop'));
            }
            return;
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughSpirit(needSprite): (boolean | Function)[] {
        if (needSprite <= G_UserData.getBase().getResValue(DataConst.RES_SPIRIT)) {
            return [true, null];
        }
        function popFunc() {
            let itemValue = DataConst.RES_SPIRIT;
            let arr = UserCheck.resCheck(itemValue, -1, true);
            if (!arr[1]) {
                G_Prompt.showTip(Lang.get('common_not_develop'));
            }
            return;
        }
        return [
            false,
            popFunc
        ];
    };
    export function enoughTowerCount(needCount): (boolean | Function)[] {
        if (needCount <= G_UserData.getBase().getResValue(DataConst.RES_TOWER_COUNT)) {
            return [true, null];
        }
        function popFunc() {
            G_Prompt.showTip(Lang.get('challenge_tower_no_count'));
        }
        return [
            false,
            popFunc
        ];
    };
    export function timeExpire(checkTime) {
    };
    export function isPackageFull(type, value, size) {
        if (type == TypeConvertHelper.TYPE_ITEM) {
        }
    };
    export function isHeroFull(): any[] {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let data = Role.get(G_UserData.getBase().getLevel());
        if (!data) {
            return [
                true,
                0,
                null
            ];
        }
        let vipExtraNum = 0;
        let maxNum = data.hero_limit + vipExtraNum;
        let ownNum = G_UserData.getHero().getHeroTotalCount();
        let isFull = ownNum >= maxNum;
        function fullPopup() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE1);
            }
            function onBtnCancel() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HERO_LIST);
            }
            PopupBase.loadCommonPrefab('PopupSystemAlert',(popup:PopupSystemAlert)=>{
                popup.setup(null, Lang.get('common_pack_full_desc1'), onBtnOk);
                popup.setCheckBoxVisible(false);
                popup.showGoButton(Lang.get('common_pack_full_hero_btn1'));
                popup.openWithAction();
            });


        }
        return [
            isFull,
            isFull ? 0 : maxNum - ownNum,
            fullPopup
        ];
    };
    export function isEquipmentFull(): any[] {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let data = Role.get(G_UserData.getBase().getLevel());
        if (!data) {
            return [
                true,
                0,
                null
            ];
        }
        let vipExtraNum = 0;
        let maxNum = data.equipment_limit;
        let ownNum = G_UserData.getEquipment().getEquipTotalCount();
        let isFull = ownNum >= maxNum;
        function fullPopup() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE3);
            }
            function onBtnCancel() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_EQUIP_LIST);
            }
            PopupBase.loadCommonPrefab('PopupSystemAlert',(popup:PopupSystemAlert)=>{
                popup.setup(null, Lang.get('common_pack_full_desc2'), onBtnOk, onBtnCancel);
                popup.setCheckBoxVisible(false);
                popup.setBtnOk(Lang.get('common_pack_full_equip_btn1'));
                popup.setBtnCancel(Lang.get('common_pack_full_equip_btn2'));
                popup.openWithAction();
            });

        }
        return [
            isFull,
            isFull && 0 || maxNum - ownNum,
            fullPopup
        ];
    };
    export function isTreasureFull(): any[] {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let data = Role.get(G_UserData.getBase().getLevel());
        if (!data) {
            return [
                true,
                0,
                null
            ];
        }
        let vipExtraNum = 0;
        let maxNum = data.treasure_limit;
        let ownNum = G_UserData.getTreasure().getTreasureTotalCount();
        let isFull = ownNum >= maxNum;
        function fullPopup() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_TREASURE_LIST);
            }
            PopupBase.loadCommonPrefab('PopupSystemAlert',(popup:PopupSystemAlert)=>{
                popup.setup(null, Lang.get('common_pack_full_desc3'), onBtnOk);
                popup.setCheckBoxVisible(false);
                popup.showGoButton(Lang.get('common_pack_full_treasure_btn1'));
                popup.openWithAction();
            });

        }
        return [
            isFull,
            isFull && 0 || maxNum - ownNum,
            fullPopup
        ];
    };
    export function isInstrumentFull(): any[] {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let data = Role.get(G_UserData.getBase().getLevel());
        if (!data) {
            return [
                true,
                0,
                null
            ];
        }
        let maxNum = data.instrument_limit;
        let ownNum = G_UserData.getInstrument().getInstrumentTotalCount();
        let isFull = ownNum >= maxNum;
        function fullPopup() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE7);
            }
            function onBtnCancel() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_INSTRUMENT_LIST);
            }
            PopupBase.loadCommonPrefab('PopupSystemAlert',(popup:PopupSystemAlert)=>{
                popup.setup(null, Lang.get('common_pack_full_desc4'), onBtnOk, onBtnCancel);
                popup.setCheckBoxVisible(false);
                popup.setBtnOk(Lang.get('common_pack_full_instrument_btn1'));
                popup.setBtnCancel(Lang.get('common_pack_full_instrument_btn2'));
                popup.openWithAction();
            });

        }
        return [
            isFull,
            isFull && 0 || maxNum - ownNum,
            fullPopup
        ];
    };
    export function isHorseFull() {
        let Role = G_ConfigLoader.getConfig(ConfigNameConst.ROLE);
        let data = Role.get(G_UserData.getBase().getLevel());
        if (!data) {
            return [
                true,
                0
            ];
        }
        let vipExtraNum = 0;
        let maxNum = data.horse_limit + vipExtraNum;
        let ownNum = G_UserData.getHorse().getHorseTotalCount();
        let isFull = ownNum >= maxNum;
        function fullPopup() {
            function onBtnOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECOVERY_TYPE11);
            }
            function onBtnCancel() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HORSE_LIST);
            }
            G_SceneManager.openPopup(Path.getPrefab("PopupSystemAlert", "common"), (popupSystemAlert: PopupSystemAlert) => {
                popupSystemAlert.setup(null, Lang.get('common_pack_full_desc5'), onBtnOk);
                popupSystemAlert.setCheckBoxVisible(false);
                popupSystemAlert.showGoButton(Lang.get('common_pack_full_horse_btn1'));
                popupSystemAlert.openWithAction();
            });
        }
        return [
            isFull,
            isFull && 0 || maxNum - ownNum,
            fullPopup
        ];
    };
    export function isPackFull(itemType, itemValue?): any[] {
        if (typeof (itemType) != 'number') {
            cc.error('传入类型不对');
            return [
                true,
                null
            ];
        }
        let isFull = false, leftCapacity = 9999, popupDlg = null;
        let needPopWindow = true;
        if (itemType == TypeConvertHelper.TYPE_HERO || itemType == TypeConvertHelper.TYPE_EQUIPMENT || itemType == TypeConvertHelper.TYPE_TREASURE || itemType == TypeConvertHelper.TYPE_INSTRUMENT || itemType == TypeConvertHelper.TYPE_HORSE) {
            [isFull, leftCapacity, popupDlg] = UserCheck.getLeftPackCapacity(itemType);
        } else if (itemType == TypeConvertHelper.TYPE_ITEM) {
            if (typeof (itemValue) != 'number') {
                return [
                    true,
                    0
                ];
            }
            [isFull, leftCapacity] = UserCheck.checkBeforeUseItem(itemValue);
            if (isFull) {
                return [
                    true,
                    0
                ];
            }
        } else {
        }
        if (isFull && needPopWindow) {
            if (popupDlg) {
                popupDlg();
            }
        }
        return [
            isFull,
            leftCapacity
        ];
    };
    export function checkBeforeUseItem(itemId) {
        if (!itemId || typeof (itemId) != 'number') {
            return [
                false,
                0
            ];
        }

        let ItemInfo = G_ConfigLoader.getConfig(ConfigNameConst.ITEM);
        let item = ItemInfo.get(itemId);
        if (!item) {
            return [
                false,
                0
            ];
        }
        if (item.item_type == 1) {
            let [isFull, leftCapacity] = UserCheck.checkPackFullByDropId(item.item_value);
            return [
                isFull,
                leftCapacity
            ];
        } else if (item.item_type == 2) {
            let ret = UserCheck.checkPackFullByBoxId(item.item_value, itemId);
            return ret;
        }
        return [
            false,
            9999
        ];
    };
    export function checkPackFullByBoxId(boxId, itemId): any {
        if (!boxId || typeof (boxId) != 'number') {
            return [
                false,
                0
            ];
        }
        let [itemList] = UIPopupHelper.getBoxItemList(boxId, itemId);
        let leftCapacity = 9999;
        for (let k in itemList) {
            let v = itemList[k];
            for (let j in v) {
                let itemData = v[j];
                let [isFull, tempLeft] = UserCheck.isPackFull(itemData.type, itemData.value);
                if (isFull) {
                    return [
                        true,
                        0
                    ];
                }
                leftCapacity = Math.min(tempLeft, leftCapacity);
            }
        }
        console.log(leftCapacity);
        return [
            false,
            leftCapacity
        ];
    };
    export function checkPackFullByDropId(dropId) {
        if (!dropId || typeof (dropId) != 'number') {
            return [
                false,
                0
            ];
        }
        // console.log(dropId);

        let DropInfo = G_ConfigLoader.getConfig(ConfigNameConst.DROP);
        let drop = DropInfo.get(dropId);
        if (!drop) {
            return [
                false,
                0
            ];
        }
        let index = 1;
        let typeKey = 'type_%d'.format(index);
        let typeList = [];
        while (DropInfo.hasKey(typeKey)) {
            if (drop[typeKey] > 0 && drop[typeKey] != TypeConvertHelper.TYPE_ITEM) {
                typeList.push(drop[typeKey]);
            }
            index = index + 1;
            typeKey = 'type_%d'.format(index);
        }
        let leftCapacity = 9999;
        for (let k in typeList) {
            let v = typeList[k];
            let [isFull, tempLeft] = UserCheck.isPackFull(v);
            if (isFull) {
                return [
                    true,
                    0
                ];
            }
            leftCapacity = Math.min(tempLeft, leftCapacity);
        }
        // console.log(leftCapacity);
        return [
            false,
            leftCapacity
        ];
    };
    export function checkPackFullByAwards(awards: any[]) {
        // if (!awards || type(awards) != 'table') {
        //     return false;
        // }
        if (awards == null) {
            return false;
        }
        let typeList = [];
        for (let i = 0; i < awards.length; i++) {
            if (awards[i].type && awards[i].type != TypeConvertHelper.TYPE_ITEM) {
                typeList.push(awards[i].type);
            }
        }
        for (let k in typeList) {
            let v = typeList[k];
            let isFull = UserCheck.isPackFull(v)[0];
            if (isFull) {
                return true;
            }
        }
        return false;
    };
    export function getLeftPackCapacity(itemType): any {
        if (typeof (itemType) != 'number')
            cc.error('UserCheck.getLeftPackCapacity itemType error');
        let isFull: any = false, leftCapacity: any = 0, popupDlg = null;
        if (itemType == TypeConvertHelper.TYPE_HERO) {
            [isFull, leftCapacity, popupDlg] = UserCheck.isHeroFull();
        } else if (itemType == TypeConvertHelper.TYPE_EQUIPMENT) {
            [isFull, leftCapacity, popupDlg] = UserCheck.isEquipmentFull();
        } else if (itemType == TypeConvertHelper.TYPE_TREASURE) {
            [isFull, leftCapacity, popupDlg] = UserCheck.isTreasureFull();
        } else if (itemType == TypeConvertHelper.TYPE_INSTRUMENT) {
            [isFull, leftCapacity, popupDlg] = UserCheck.isInstrumentFull();
        } else if (itemType == TypeConvertHelper.TYPE_HORSE) {
            [isFull, leftCapacity, popupDlg] = UserCheck.isHorseFull();
        } else {
            leftCapacity = 9999;
        }
        return [
            isFull,
            leftCapacity,
            popupDlg
        ];
    };
    export function checkOfficialLevelUp() {
        let officialInfo = G_UserData.getBase().getOfficialInfo()[0];
        function checkBattleInfo() {
            let power = G_UserData.getBase().getPower();
            if (power >= officialInfo.combat_demand) {
                return [true, null];
            }
            return [
                false,
                () => {
                    G_Prompt.showTip('战力不足');
                }
            ];
        }
        if (officialInfo) {
            let prompt = null;
            if (officialInfo.type_1 <= 0 && officialInfo.type_2 <= 0) {
                return [false, null];
            }
            let checkReturn;
            checkReturn = checkBattleInfo();
            if (checkReturn[0] == false) {
                return checkReturn;
            }
            if (officialInfo.type_1 > 0) {
                checkReturn = UserCheck.enoughValue(officialInfo.type_1, officialInfo.value_1, officialInfo.size_1);
                if (checkReturn == false) {
                    let prompt1 = function () {
                        UIPopupHelper.popupItemGuider((guider: PopupItemGuider) => {
                            guider.setTitle(Lang.get("way_type_get"));
                            guider.updateUI(officialInfo.type_1, officialInfo.value_1)
                            guider.openWithAction()
                        });
                    }
                    return [
                        false,
                        prompt1
                    ];
                }
                checkReturn = [checkReturn, null];
            }
            if (officialInfo.type_2 > 0) {
                checkReturn = UserCheck.enoughValue(officialInfo.type_2, officialInfo.value_2, officialInfo.size_2);
                if (checkReturn == false) {
                    let prompt2 = function () {
                        UIPopupHelper.popupItemGuider((guider: PopupItemGuider) => {
                            guider.setTitle(Lang.get('way_type_get'));
                            guider.updateUI(officialInfo.type_2, officialInfo.value_2);
                        });
                    }
                    return [
                        false,
                        prompt2
                    ];
                }
                checkReturn = [checkReturn, null];
            }
            return checkReturn;
        }
        return [false, null];
    };
    export function commonEnoughResValue(checkSize, resId) {
        if (checkSize <= G_UserData.getBase().getResValue(resId)) {
            return [true, null];
        }
        function popFunc() {
            UserCheck._showPopupItem(TypeConvertHelper.TYPE_RESOURCE, resId);
        }
        return [
            false,
            popFunc
        ];
    };
    export function _getResourceFailDlg(checkType, checkValue, checkSize) {
        var failed = null, popFunc = null;
        if (checkValue == DataConst.RES_GOLD) {
            [failed, popFunc] = UserCheck.enoughMoney(checkSize);
        } else if (checkValue == DataConst.RES_DIAMOND) {
            [failed, popFunc] = UserCheck.enoughCash(checkSize);
        } else if (checkValue == DataConst.RES_VIT) {
            [failed, popFunc] = UserCheck.enoughVit(checkSize);
        } else if (checkValue == DataConst.RES_SPIRIT) {
            [failed, popFunc] = UserCheck.enoughSpirit(checkSize);
        } else if (checkValue == DataConst.RES_TOKEN) {
            [failed, popFunc] = UserCheck.enoughSiegeToken(checkSize);
        } else if (checkValue == DataConst.RES_TOWER_COUNT) {
            [failed, popFunc] = UserCheck.enoughTowerCount(checkSize);
        } else if (checkValue == DataConst.RES_ARMY_FOOD) {
            [failed, popFunc] = UserCheck.enoughArmyFood(checkSize);
        } else if (checkValue == DataConst.RES_MINE_TOKEN) {
            [failed, popFunc] = UserCheck.enoughArmyToken(checkSize);
        } else {
            [failed, popFunc] = UserCheck.commonEnoughResValue(checkSize, checkValue);
        }
        return [
            failed,
            popFunc
        ];
    };
    export function enoughValue(checkType, checkValue, checkSize, popupDlg?) {
        if (popupDlg == null) {
            popupDlg = true;
        }
        if (checkType == null || checkType == 0) {
            return true;
        }
        if (checkValue == 0) {
            return true;
        }
        // console.log(checkType, checkValue);

        let currNum = UserDataHelper.getNumByTypeAndValue(checkType, checkValue);
        if (currNum >= checkSize) {
            return true;
        }

        let failed, popFunc;
        if (checkType == TypeConvertHelper.TYPE_RESOURCE) {
            [failed, popFunc] = UserCheck._getResourceFailDlg(checkType, checkValue, checkSize);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_REFRESH_TOKEN) {
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_RECRUIT_TOKEN) {
            [failed, popFunc] = UserCheck.enoughRecruitToken(checkSize);
        }

        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_PET_JINGHUA) {
            popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_RED_PET_JINGHUA) {
            popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_GOLD_KEY) {
            [failed,popFunc] = UserCheck.enoughGoldKey(checkSize, popupDlg);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_GOLD_BOX) {
            [failed,popFunc] = UserCheck.enoughGoldBox(checkSize, popupDlg);
        }

        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_EQUIP_STONE) {
            [failed, popFunc] = UserCheck.enoughEquipStone(checkSize, popupDlg);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_AVATAR_ACTIVITY_TOKEN) {
            [failed, popFunc] = UserCheck.enoughAvatarActivityToken(checkSize);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && (checkValue == DataConst.ITEM_AVATAR_ACTIVITY_ITEM1 || checkValue == DataConst.ITEM_AVATAR_ACTIVITY_ITEM2)) {
            popFunc = UserCheck.getNormalFailDialog(TypeConvertHelper.TYPE_ITEM, checkValue);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_SUPPORT_TICKET) {
            [failed, popFunc] = UserCheck.enoughSupportTicket(checkSize, popupDlg);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_HORSE_WHISTLE) {
            [failed, popFunc] = UserCheck.enoughHorseWhistle(checkSize, popupDlg);
        }
        if (checkType == TypeConvertHelper.TYPE_ITEM && checkValue == DataConst.ITEM_HORSE_WHISTLE_FRAGMENT) {
            [failed, popFunc] = UserCheck.enoughHorseWhistleFragment(checkSize, popupDlg);
        }
        if (popupDlg && popFunc != null) {
            popFunc();
        }
        return false;
    };
    export function vipFuncIsOpened(funcType, callback) {
        if (!funcType) {
            if (callback) {
                callback();
            }
            return [
                true,
                ''
            ];
        }
        let vipData = G_UserData.getVip().getVipFunctionDataByType(funcType);
        let errMsg = vipData && vipData.hint1 || 'VIP等级不足';
        if (!vipData) {
            return [
                false,
                errMsg
            ];
        }
        if (callback) {
            callback();
        }
        return [
            true,
            errMsg
        ];
    };
    export function _getVipFuncDlg(funcType, vipLevel) {
    };
    export function vipTimesOutCheck(funcType, times, shopTip, notShowVipDialog?) {
        let usedTimes = times;
        let vipCfg = G_UserData.getVip().getVipFunctionDataByType(funcType, null);
        let tips = shopTip;

        let args: any[] = G_UserData.getVip().getVipTimesByFuncId(funcType);
        let currentValue = args[0];
        let maxValue = args[1];
        if (currentValue == usedTimes) {
            if (currentValue < maxValue) {
                if (notShowVipDialog) {
                    G_Prompt.showTip(vipCfg.hint3);
                } else {
                    UIPopupHelper.popupResetTimesNoEnough(funcType);
                }
            } else {
                G_Prompt.showTip(tips || vipCfg.hint3);
            }
        }
        return currentValue == usedTimes;
    };
    export function resCheck(resValue, checkSize, popupDlg) {
        let currNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, resValue);
        if (checkSize >= 0 && currNum >= checkSize) {
            return [
                true,
                null
            ];
        }
        popupDlg = popupDlg == null ? true : popupDlg;
        let itemType = TypeConvertHelper.TYPE_ITEM;
        let itemValue = DataConst.getItemIdByResId(resValue);
        let popFunc: any;
        if (itemType && itemValue) {
            let maxValue = UserDataHelper.getResItemMaxUseNum(itemValue);
            if (maxValue == 0) {
                popFunc = function () {
                    UIPopupHelper.popupItemBuyAndUse(itemType, itemValue);
                };
            }
            else if (maxValue == -1) //--不能使用
            {
                popFunc = function () {
                    UIPopupHelper.popupItemBuyAndUse(itemType, itemValue);
                }
            }
            else {
                popFunc = function () {
                    UIPopupHelper.popupItemBuyAndUse(itemType, itemValue);
                };
            }
        } else {
            popFunc = function () {
                UIPopupHelper.popupShopBuyRes(TypeConvertHelper.TYPE_RESOURCE, resValue);
            };
        }
        if (popupDlg && popFunc) {
            popFunc();
        }
        return [
            false,
            popFunc
        ];
    };
    export function isResReachTimeLimit(resValue) {
        let size = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, resValue);
        let maxValue = G_RecoverMgr.getRecoverLimitByResId(resValue);
        if (size && maxValue && size >= maxValue) {
            return true;
        }
        return false;
    };
    export function isResReachMaxLimit(resValue) {
        let size = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, resValue);

        let recoverConfig = G_ConfigLoader.getConfig(ConfigNameConst.RECOVER);
        let config = recoverConfig.get(resValue);
        if (config) {
            let maxValue = config.max_limit;
            if (size && maxValue && size >= maxValue) {
                return true;
            }
        }
        return false;
    };
    export function enoughValueList(resValueList, popupDlg) {
        let canBuy = true;
        for (let k in resValueList) {
            let v = resValueList[k];
            canBuy = LogicCheckHelper.enoughValue(v.type, v.value, v.size, popupDlg);
            if (!canBuy) {
                break;
            }
        }
        return canBuy;
    };

    export function _showPopupItem(itemType, itemValue, title: string = null) {
        UIPopupHelper.popupItemGuider((popupItemGuider: PopupItemGuider) => {
            if (!title) title = Lang.get('way_type_get');
            popupItemGuider.setTitle(title);
            popupItemGuider.updateUI(itemType, itemValue);
        });
    }

    export function enoughJade2(needCash, popupDlg?) {
        if (needCash <= G_UserData.getBase().getResValue(DataConst.RES_JADE2)) {
            return [true,null];
        }
        function popFunc() {
            function callBackOk() {
                WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2);
            }
            G_SceneManager.openPopup(Path.getPrefab("PopupAlert", "common"), (popupAlert: PopupAlert) => {
                popupAlert.init(Lang.get('common_jade2_title'), Lang.get('common_jade2_not_enough'), callBackOk);
                popupAlert.setOKBtn(Lang.get('common_vip_func_btn2'));
                popupAlert.openWithAction();
            });
        }
        if (popupDlg == true) {
            popFunc();
        }
        return [
            false,
            popFunc
        ];
    };
}