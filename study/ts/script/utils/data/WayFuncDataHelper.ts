import { G_Prompt, G_ConfigLoader, G_UserData, G_SceneManager, G_ConfigManager } from "../../init";
import { FunctionCheck } from "../logic/FunctionCheck";
import { WayFuncConvert } from "./WayFuncConvert";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { StageData } from "../../data/StageData";
import { Lang } from "../../lang/Lang";
import { LogicCheckHelper } from "../LogicCheckHelper";
import { ShopConst } from "../../const/ShopConst";
import { Path } from "../Path";
import PopupStageDetail from "../../scene/view/stage/PopupStageDetail";

export class WayFuncDataHelper {
    public static MAX_WAY_ID_SIZE = 15;
    public static sortGuiderList = function (list: any[]) {
        list.sort(function (a, b) {
            if (a.type != b.type) {
                return b.type - a.type;
            }
            if (a.open != b.open) {
                return b.open - a.open;
            }
            if (a.open == 1) {
                if (a.value != b.value) {
                    return b.value - a.value;
                }
            } else {
                if (a.value != b.value) {
                    return a.value - b.value;
                }
            }
            return a.cfg.id - b.cfg.id;
        });
        // let t: any[] = [];
        // for (let i = 0; i < list.length; i++) {
        //     t[t.length] = list[i].cfg;
        // }
        // return t;
        return list;
    };
    public static getGuiderList = function (itemType, itemValue) {
        var info = G_ConfigLoader.getConfig(ConfigNameConst.WAY_TYPE).get(itemType, itemValue);
        //assert(info, string.format('way_type can\'t find type = %d and value = %d', itemType, itemValue));
        if(info==null)
        {
            console.error("'getGuiderList --- way_type can\'t find type = %d and value = %d', itemType, itemValue")
            return [];
        }
        function _makeChapterData(list, itemInfo) {
            var sd: StageData = G_UserData.getStage();
            var stageData = G_UserData.getStage().getStageById(itemInfo.value);
            var stageInfo = stageData.getConfigData();
            var isOpen = sd.isStageOpen(itemInfo.value) && 1 || 0;
            list.push({
                cfg: itemInfo,
                itemType: itemType,
                itemValue: itemValue,
                open: isOpen,
                count: 5,
                value: itemInfo.value,
                type: 1,
                stageData: stageData,
                stageCfgInfo: stageInfo
            });
        }
        function _makeShopData(list, itemInfo) {
            var shopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP).get(itemInfo.value);
            console.assert(shopInfo, 'shop_info can\'t find id = ' + itemInfo.value);
            list.push({
                cfg: itemInfo,
                itemType: itemType,
                itemValue: itemValue,
                open: LogicCheckHelper.funcIsOpened(shopInfo.function_id)[0] && 1 || 0,
                value: 0,
                count: 0,
                type: 3
            });
        }
        function _makeItemData(list, itemInfo) {
            list.push({
                cfg: itemInfo,
                itemType: itemType,
                itemValue: itemValue,
                // open: FunctionCheck.funcIsOpened(itemInfo.value) && 1 || 0,
                open: 1,
                value: 0,
                count: 0,
                type: 2
            });
        }
        var list = [];
        var way_function = G_ConfigLoader.getConfig(ConfigNameConst.WAY_FUNCTION);
        for (var i = 1; i <= WayFuncDataHelper.MAX_WAY_ID_SIZE; i++) {
            var id = info['way_id' + i];
            if (id && id > 0) {
                var itemInfo = way_function.get(id);
                // assert(itemInfo, 'way_function_info can\'t find id = ' + tostring(id));
                if (itemInfo.type == 1) {
                    _makeChapterData(list, itemInfo);
                } else if (itemInfo.type == 2) {
                    _makeShopData(list, itemInfo);
                } else if (itemInfo.type == 3) {
                    _makeItemData(list, itemInfo);
                }
            }
        }
        var t = WayFuncDataHelper.sortGuiderList(list);
        return t;
    };


    public static gotoModule = function (cellValue) {
        if (cellValue == null) {
            return;
        }
        var data = null;
        var sceneName = null;
        console.log('--------------PopupItemGuilder:_onGoHandler cellValue.type=' + cellValue.type);
        function gotoChapter(cellValue) {
            var chapterId = cellValue.chapter_id;
            var stageId = cellValue.value;
            var isOpen = G_UserData.getStage().isStageOpen(cellValue.value);
            if (isOpen == true) {
                G_SceneManager.showScene('stage', chapterId, stageId);
                // G_SceneManager.openPopup(Path.getPrefab("PopupStageDetail", "stage"), (popStageDetail: PopupStageDetail) => {
                //     popStageDetail.init(stageId);
                //     popStageDetail.openWithAction();
                //  });
            } else {
                G_Prompt.showTip(Lang.get('stage_no_open'));
            }
        }
        function gotoShop(cellValue) {
            var shopId = cellValue.value || 1;
            var shopInfo = G_ConfigLoader.getConfig(ConfigNameConst.SHOP).get(shopId);
            // assert(shopInfo, 'shop_info can\'t find shop_id == ' + (shopId));
            var functionId = shopInfo.function_id;
            var tabIndex = 2;
            if (cellValue.chapter_id && cellValue.chapter_id > 0) {
                tabIndex = cellValue.chapter_id;
            }
            // print(functionId, 'FFFFFFFFFFFFFFFFFFFFFFFFFF');
            var [isOpened, errMsg] = FunctionCheck.funcIsOpened(functionId);
            if (isOpened == false) {
                if (errMsg) {
                    G_Prompt.showTip(errMsg);
                }
                return;
            }
            if (shopId == ShopConst.GUILD_SHOP) {
                var isInGuild = G_UserData.getGuild().isInGuild();
                if (isInGuild == false) {
                    G_Prompt.showTip(Lang.get('lang_guild_shop_no_open'));
                    return;
                }
            }
            G_SceneManager.showScene('shop', shopId, tabIndex);
        }
        function gotoFunctionId(cellValue) {
            var functionId = cellValue.value;
            var gotoFuncArr = WayFuncDataHelper.getGotoFuncByFuncId(functionId, null);
            var goToFunc = gotoFuncArr[0];
            if (goToFunc == null) {
                return;
            }
            if (gotoFuncArr[1] == false && (goToFunc != null && typeof (goToFunc) == 'function')) {
                goToFunc();
            }
        }
        if (cellValue.type == 1) {
            gotoChapter(cellValue);
        } else if (cellValue.type == 2) {
            gotoShop(cellValue);
        } else if (cellValue.type == 3) {
            gotoFunctionId(cellValue);
        }
    };
    public static gotoModuleByFuncId = function (funcId, params?) {
        var ret = WayFuncDataHelper.getGotoFuncByFuncId(funcId);
        var goToFunc = ret[0];
        var isLayer = ret[1];
        var isPop = ret[2];
        if (goToFunc == false) {
            return;
        }
        if (isLayer == false && typeof (goToFunc) == 'function') {
            // cc.warn('WayFuncDataHelper.gotoModuleByFuncId ' + funcId);
            if (params && typeof (params) == 'object') {
                goToFunc.apply(this, params);
                //goToFunc(unpack(params));
            } else {
                goToFunc(params);
            }
        }
    };

    public static getGotoFuncByFuncId = function (funcId, params?) {
        let ret = FunctionCheck.funcIsOpened(funcId);
        let isOpened = ret[0];
        let errMsg = ret[1];
        let isLayer = false;
        let isPop = false;
        let returnFunc = null;
        if (isOpened == false) {
            if (errMsg) {
                G_Prompt.showTip(errMsg);
            }
            return [false, false, false];
        }
        let func = WayFuncConvert.getReturnFunc(funcId);
        // if (func) {
        //     if (typeof (params) == 'object') {
        //         returnFunc = func.apply(this, params)
        //         //returnFunc = func();
        //     } else {
        //         returnFunc = func(params);
        //     }
        // }
        return [
            func,
            isLayer,
            isPop
        ];
    };
    public static _inTheTeam = function () {
    };
    public static _retGoScene = function () {
    };
}