
import { Lang } from "../../../lang/Lang"
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper"
import { FunctionConst } from "../../../const/FunctionConst"
import { LogicCheckHelper } from "../../../utils/LogicCheckHelper"
import { UserCheck } from "../../../utils/logic/UserCheck"
import { FunctionCheck } from "../../../utils/logic/FunctionCheck"
export default class HandBookHelper {
    public static TBA_HERO = 1
    public static TBA_EQUIP = 2
    public static TBA_TREASURE = 3
    public static TBA_SILKBAG = 4
    public static TBA_HORSE = 5
    public static TBA_JADE_STONE = 6

    //  含有子tab的图鉴子tab数量
    public static TAB_LIST = {
        [HandBookHelper.TBA_HERO]: [
            Lang.get("handbook_country_tab1"),
            Lang.get("handbook_country_tab2"),
            Lang.get("handbook_country_tab3"),
            Lang.get("handbook_country_tab4")
        ],
        [HandBookHelper.TBA_JADE_STONE]: [
            Lang.get("handbook_jade_tab1"),
            Lang.get("handbook_jade_tab2"),
            Lang.get("handbook_jade_tab3"),
            Lang.get("handbook_jade_tab4")
        ]
    }

    //  图鉴品质色走向
    public static COLOR_GO_TO = {
        [HandBookHelper.TBA_HERO]: { begin: 7, ended: 2 },
        [HandBookHelper.TBA_EQUIP]: { begin: 7, ended: 2 },
        [HandBookHelper.TBA_TREASURE]: { begin: 6, ended: 2 },
        [HandBookHelper.TBA_SILKBAG]: { begin: 7, ended: 2 },
        [HandBookHelper.TBA_HORSE]: { begin: 6, ended: 2 },
        [HandBookHelper.TBA_JADE_STONE]: { begin: 6, ended: 4 }
    }

    //  含有子tab图鉴view右上角文字前缀
    public static TITLE_PREFIX = {
        [HandBookHelper.TBA_HERO]: "handbook_country",
        [HandBookHelper.TBA_JADE_STONE]: "handbook_jade"
    }

    public static SUB_TAB_VIEW = 1 //  含有子tab的图鉴view
    public static SUB_OTHER_VIEW = 2 //  不含子tab

    //  图鉴view映射
    public static SUB_VIEW_MAPS = {
        [HandBookHelper.TBA_HERO]: HandBookHelper.SUB_TAB_VIEW,
        [HandBookHelper.TBA_EQUIP]: HandBookHelper.SUB_OTHER_VIEW,
        [HandBookHelper.TBA_TREASURE]: HandBookHelper.SUB_OTHER_VIEW,
        [HandBookHelper.TBA_SILKBAG]: HandBookHelper.SUB_OTHER_VIEW,
        [HandBookHelper.TBA_HORSE]: HandBookHelper.SUB_OTHER_VIEW,
        [HandBookHelper.TBA_JADE_STONE]: HandBookHelper.SUB_TAB_VIEW
    }

    //  图鉴类型转道具类型
    public static TAB_TYPE_TO_ITEM_TYPE = {
        [HandBookHelper.TBA_HERO]: TypeConvertHelper.TYPE_HERO,
        [HandBookHelper.TBA_EQUIP]: TypeConvertHelper.TYPE_EQUIPMENT,
        [HandBookHelper.TBA_TREASURE]: TypeConvertHelper.TYPE_TREASURE,
        [HandBookHelper.TBA_SILKBAG]: TypeConvertHelper.TYPE_SILKBAG,
        [HandBookHelper.TBA_HORSE]: TypeConvertHelper.TYPE_HORSE,
        [HandBookHelper.TBA_JADE_STONE]: TypeConvertHelper.TYPE_JADE_STONE
    }
    static TBA_HISTORY_HERO: any

    public static getHandBookTabList(forceShowFunctionId) {
        var tabNameList = [
            Lang.get('handbook_tab1'),
            Lang.get('handbook_tab2'),
            Lang.get('handbook_tab3')
        ];
        var funcList = [
            HandBookHelper.TBA_HERO,
            HandBookHelper.TBA_EQUIP,
            HandBookHelper.TBA_TREASURE
        ];
        if (FunctionConst.FUNC_SILKBAG == forceShowFunctionId || FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG)[0]) {
            tabNameList.push(Lang.get('handbook_tab4'));
            funcList.push(HandBookHelper.TBA_SILKBAG);
        }
        if (FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 == forceShowFunctionId || FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)[0]) {
            tabNameList.push(Lang.get('handbook_tab6'));
            funcList.push(HandBookHelper.TBA_JADE_STONE);
        }
        if (FunctionConst.FUNC_HORSE_BOOK == forceShowFunctionId || FunctionCheck.funcIsOpened(FunctionConst.FUNC_HORSE_BOOK)[0]) {
            tabNameList.push(Lang.get('handbook_tab5'));
            funcList.push(HandBookHelper.TBA_HORSE);
        }
        return [
            tabNameList,
            funcList
        ];
    };
    public static getHandBookTypeByIndex(index, forceShowFunctionId) {
        var _res= HandBookHelper.getHandBookTabList(forceShowFunctionId);
        return _res[1][index];
    };
    public static getHandBookTabViewTabs(tabType) {
        return HandBookHelper.TAB_LIST[tabType];
    };

    public static fitBookTextContent(label:cc.Label) {
        label._forceUpdateRenderData();
    };
}