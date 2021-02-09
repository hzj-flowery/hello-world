const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Normal from './CommonButtonLevel0Normal'
import { Lang } from '../../lang/Lang';
import { handler } from '../../utils/handler';
import { stringUtil } from '../../utils/StringUtil';
import { UIPopupHelper } from '../../utils/UIPopupHelper';
import { FunctionConst } from '../../const/FunctionConst';
import { WayFuncDataHelper } from '../../utils/data/WayFuncDataHelper';
import { G_ConfigManager } from '../../init';

var TYPE2PARAM = {
    1: {
        str: 'common_empty_tip_1',
        funcId: FunctionConst.FUNC_HERO_SHOP
    },
    2: {
        str: 'common_empty_tip_2',
        funcId: FunctionConst.FUNC_HERO_SHOP
    },
    3: {
        str: 'common_empty_tip_3',
        funcId: FunctionConst.FUNC_EQUIP_SHOP
    },
    4: {
        str: 'common_empty_tip_4',
        funcId: FunctionConst.FUNC_EQUIP_SHOP
    },
    5: {
        str: 'common_empty_tip_5',
        funcId: FunctionConst.FUNC_INSTRUMENT_SHOP
    },
    6: {
        str: 'common_empty_tip_6',
        funcId: FunctionConst.FUNC_INSTRUMENT_SHOP
    },
    7: {
        str: 'common_empty_tip_7',
        funcId: FunctionConst.FUNC_SIEGE_SHOP
    },
    8: {
        str: 'common_empty_tip_8',
        funcId: FunctionConst.FUNC_SIEGE_SHOP
    },
    9: {
        str: 'common_empty_tip_9',
        funcId: FunctionConst.FUNC_SIEGE_SHOP
    },
    10: {
        str: 'common_empty_tip_10',
        funcId: FunctionConst.FUNC_PET_SHOP
    },
    11: {
        str: 'common_empty_tip_11',
        funcId: FunctionConst.FUNC_HORSE_SHOP
    },
    12: {
        str: 'common_empty_tip_12',
        funcId: FunctionConst.FUNC_HORSE_SHOP
    },
    13: {
        str: 'common_empty_tip_13',
        funcId: FunctionConst.FUNC_ARMY_GROUP
    },
    14: {
        str: 'common_empty_tip_14',
        funcId: FunctionConst.FUNC_HISTORY_HERO
    },
    15: {
        str: 'common_empty_tip_15',
        funcId: FunctionConst.FUNC_HISTORY_HERO
    },
    16: {
        str: 'common_empty_tip_16',
        funcId: FunctionConst.FUNC_HISTORY_HERO
    },
    17: {
        str: 'common_empty_tip_17',
        funcId: FunctionConst.FUNC_HISTORY_HERO
    },
    18: {
        str: 'common_empty_tip_18',
        funcId: FunctionConst.FUNC_HORSE_SHOP
    },
    19: {
        str: 'common_empty_tip_19',
        funcId: FunctionConst.FUNC_HORSE_SHOP
    },
    25: {
        str: 'common_empty_tip_20',
        funcId: FunctionConst.FUNC_TACTICS
    }
};

@ccclass
export default class CommonEmptyTipNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;

    @property({
        type: CommonButtonLevel0Normal,
        visible: true
    })
    _buttonGet: CommonButtonLevel0Normal = null;

    _type;

    onLoad() {
        //   super.onLoad();
        if (G_ConfigManager.isDalanVersion()) {
            this._image.node.active = (false);
        }
        if (this._buttonGet) {
            this._buttonGet.setString(Lang.get('common_to_get_btn'));
            this._buttonGet.addClickEventListenerEx(handler(this, this._onButtonClick));
        }
    }
    setButtonString(str) {
        this._buttonGet.setString(str);
    }
    _onButtonClick() {
        var param = TYPE2PARAM[this._type];
        WayFuncDataHelper.gotoModuleByFuncId(param.funcId);
    }
    updateView(type) {
        this._type = type;
        var param = TYPE2PARAM[type];
        console.assert(param, 'CommonEmptyTipNode have not type = %d'.format(type));
        this._textTip.string = (Lang.get(param.str));
    }
    setTipsString(str) {
        if (str) {
            this._textTip.string = (str);
        }
    }
    setButtonGetVisible(isVisible) {
        this._buttonGet.node.active = (isVisible);
    }

}