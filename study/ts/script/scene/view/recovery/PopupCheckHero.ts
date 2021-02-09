import PopupCheckBase from "./PopupCheckBase";
import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";
import { G_SignalManager, G_Prompt, Colors } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { PopupCheckHeroHelper } from "./PopupCheckHeroHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupCheckHero extends PopupCheckBase {

    private TITLE = {
        [1]: "hero_check_title_1",
        [2]: "hero_check_title_2",
    }

    private helpFuncs = {
        [2]: PopupCheckHeroHelper._FROM_TYPE2,
        [3]: PopupCheckHeroHelper._FROM_TYPE3
    }

    public onShowFinish() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupCheckHero");
    }

    public updateUI(fromType, clickOk) {
        super.updateUI(fromType, clickOk);
        super._updateInfo(this.helpFuncs[fromType](),
            PopupCheckHeroHelper.getMaxCount(fromType),
            Lang.get(this.TITLE[fromType]));
    }

    protected _onItemUpdate(item: cc.Node, index: number) {
        if (this._listData[index] != null) {
            super._onItemUpdate(item, index, PopupCheckHeroHelper.addHeroDataDesc(this._listData[index], this._fromType));
        }
    }
}