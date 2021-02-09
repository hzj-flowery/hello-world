import RebornLayerBase from './RebornLayerBase';
import { Lang } from '../../../lang/Lang';
import { G_SignalManager, G_UserData, G_Prompt } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import PopupChooseHeroHelper from '../../../ui/popup/PopupChooseHeroHelper';

const { ccclass, property } = cc._decorator;
@ccclass
export default class RebornHeroLayer extends RebornLayerBase {

    private _signalHeroReborn;

    onCreate() {
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_2,
            "PopupChooseHero",
            PopupChooseHeroHelper.FROM_TYPE7,
            Lang.get("recovery_tip_2"));
        super.onCreate();
    }

    public onEnter() {
        this._signalHeroReborn = G_SignalManager.add(SignalConst.EVENT_HERO_REBORN_SUCCESS, handler(this, this._rebornSuccess));
        super.onEnter();
    }

    public onExit() {
        this._signalHeroReborn.remove();
        this._signalHeroReborn = null;
        super.onExit();
    }

    public _updateView() {
        var heroData = this._recoveryRebornList[0];
        if (heroData) {
            var baseId = heroData.getBase_id();
            var limitLevel = heroData.getLimit_level();
            this._recoveryRebornNodes[0].updateInfo(baseId, limitLevel);
        } else {
            this._recoveryRebornNodes[0].updateInfo(null);
        }
    }

    public onButtonRebornClicked() {
        this._showRecoveryRebornPreview(Lang.get('reborn_no_hero_tip'))
    }

    protected _onClickAdd() {
        var isEmpty = PopupChooseHeroHelper.checkIsEmpty(PopupChooseHeroHelper.FROM_TYPE7);
        if (isEmpty) {
            G_Prompt.showTip(Lang.get('hero_popup_list_empty_tip' + PopupChooseHeroHelper.FROM_TYPE7));
        } else {
            this._showAddPopup(Lang.get('recovery_choose_hero_title'));
        }
    }

    protected _doRecoveryReborn() {
        var costCount = RecoveryDataHelper.getRebornCostCount();
        var success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, costCount);
        if (!success) {
            return;
        }
        var recoveryId = this._recoveryRebornList[0].getId();
        G_UserData.getHero().c2sHeroReborn(recoveryId);
        this._buttonReborn.setEnabled(false);
    }

    protected _onChooseItem(heroId) {
        var data = G_UserData.getHero().getUnitDataWithId(heroId);
        super._onChooseItem(data);
    }
}