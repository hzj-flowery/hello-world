import { Lang } from "../../../../lang/Lang";
import PopupCheckHeroTransform from "../../heroTransform/PopupCheckHeroTransform";
import { PopupCheckHeroHelper } from "../../recovery/PopupCheckHeroHelper";
import { PopupCheckInstrumentHelper } from "../../recovery/PopupCheckInstrumentHelper";
import { G_UserData, G_Prompt } from "../../../../init";

const { ccclass, property } = cc._decorator;


@ccclass
export default class PopupCheckInstrumentTransform extends PopupCheckHeroTransform {
    public static path = 'transform/instrument/PopupCheckInstrumentTransform';

    initTitle() {
        this._commonNodeBk.setTitle(Lang.get('transform_choose_tip1', { name: Lang.get('transform_tab_icon_3') }));
        this._buttonOk.setString(Lang.get('transform_choose_btn_ok'));
    }

    getHelpFunc() {
        return PopupCheckInstrumentHelper['_FROM_TYPE' + this._fromType];
    }

    convertData(data) {
        return PopupCheckInstrumentHelper.addInstrumentDataDesc(data, this._fromType);
    }

    _checkIsMeetCondition(data) {
        var heroCount = this._selectedIds.length;
        if (heroCount == 0) {
            return true;
        }
        var instrumentTrained = data.isDidTrain();
        var instrumentColor = data.getConfig().color;
        var firstHeroId = this._selectedIds[0];
        var firstInstrumentData = G_UserData.getInstrument().getInstrumentDataWithId(firstHeroId);
        var trained = firstInstrumentData.isDidTrain();
        var color = firstInstrumentData.getConfig().color;
        if (instrumentColor != color) {
            G_Prompt.showTip(Lang.get('instrument_transform_condition_tip6'));
            return false;
        }
        if (trained == false) {
            if (instrumentTrained == true) {
                G_Prompt.showTip(Lang.get('instrument_transform_condition_tip2'));
                return false;
            }
        } else {
            if (instrumentTrained == true) {
                G_Prompt.showTip(Lang.get('instrument_transform_condition_tip3'));
                return false;
            } else {
                G_Prompt.showTip(Lang.get('instrument_transform_condition_tip2'));
                return false;
            }
        }
        return true;
    }
}