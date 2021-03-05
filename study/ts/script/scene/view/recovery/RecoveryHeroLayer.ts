const { ccclass, property } = cc._decorator;

import RecoveryHeroNode from './RecoveryHeroNode'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SignalManager, G_UserData } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { Path } from '../../../utils/Path';
import PopupCheckHero from './PopupCheckHero';
import { PopupCheckHeroHelper } from './PopupCheckHeroHelper';
import RecoveryLayerBase from './RecoveryLayerBase';
import { RecoveryConst } from '../../../const/RecoveryConst';

@ccclass
export default class RecoveryHeroLayer extends RecoveryLayerBase {

    private _signalHeroRecovery;

    onCreate() {
        this.node.name = "RecoveryHeroLayer";
        this._setIsNotShowLightEffect(true);
        this._initInfo(
            RecoveryConst.RECOVERY_TYPE_1, "PopupCheckHero",
            PopupCheckHeroHelper.FROM_TYPE2, Lang.get('recovery_tip_1')
        );
        super.onCreate();
    }

    public onEnter() {
        this._signalHeroRecovery = G_SignalManager.add(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, handler(this, this._recoverySuccess));
        super.onEnter();

        this.scheduleOnce(()=>{
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "RecoveryHeroLayer");
        },0);
    }

    public onExit() {
        this._signalHeroRecovery.remove();
        this._signalHeroRecovery = null;
        super.onExit();
    }

    public onButtonAutoAddClicked() {
        var list = G_UserData.getHero().getRecoveryAutoList();
        super._autoAddClicked(list, Lang.get('recovery_auto_add_no_hero'));
    }

    public onButtonRecoveryClicked() {
        this._showRecoveryRebornPreview(Lang.get('recovery_no_hero_tip'))
    }

    protected _updateView() {
        for (let i = 0; i < this._recoveryRebornNodes.length; i++) {
            var heroData = this._getDataWithIndex(i);
            if (heroData) {
                var limitLevel = heroData.getLimit_level();
                this._recoveryRebornNodes[i].updateInfo(heroData.getBase_id(), limitLevel);
            } else {
                this._recoveryRebornNodes[i].updateInfo(null);
            }
        }
    }

    protected _doRecoveryReborn() {
        var recoveryId = [];
        for (const k in this._recoveryRebornList) {
            var data = this._recoveryRebornList[k];
            data && recoveryId.push(data.getId());
        }
        G_UserData.getHero().c2sHeroRecycle(recoveryId);
        this._setBtnEnable(false);
    }
}