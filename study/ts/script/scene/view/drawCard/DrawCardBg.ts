
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import DrawCardCashTenCell from './DrawCardCashTenCell'

import DrawCardCashCell from './DrawCardCashCell'

import DrawCardMoneyCell from './DrawCardMoneyCell'

import DrawCardPointBox from './DrawCardPointBox'

import CommonHelpBig from '../../../ui/component/CommonHelpBig'

import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import ParameterIDConst from '../../../const/ParameterIDConst';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { G_ConfigLoader, G_ResolutionManager, G_UserData, G_SignalManager, G_ServerTime, G_Prompt, G_AudioManager } from '../../../init';
import { Path } from '../../../utils/Path';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { DataConst } from '../../../const/DataConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { RecruitData } from '../../../data/RecruitData';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import DrawEffectLayer from './DrawEffectLayer';
import { AudioConst } from '../../../const/AudioConst';
import { PopupGetRewards } from '../../../ui/PopupGetRewards';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import { PopupItemInfo } from '../../../ui/PopupItemInfo';
import { UserCheck } from '../../../utils/logic/UserCheck';
import PopupSystemAlert from '../../../ui/PopupSystemAlert';
import { UIPopupHelper } from '../../../utils/UIPopupHelper';
import DrawOneEffect from './DrawOneEffect';
import DrawTenEffect from './DrawTenEffect';
import PopupDrawEffect from './PopupDrawEffect';
import DrawCardScoreIntroLayer from './DrawCardScoreIntroLayer';
import DrawNormalEffect from './DrawNormalEffect';
import { EffectGfxManager } from '../../../manager/EffectGfxManager';
import { SceneIdConst } from '../../../const/SceneIdConst'

export default class DrawCardBg extends ViewBase {

    onLoad() {
        super.onLoad();
    }

    onDestroy() {
        super.onDestroy();
    }

    onCreate() {
        this.updateSceneId(SceneIdConst.SCENE_ID_DRAW_CARD);
        this.setSceneSize();
    }
    onEnter() {
    }
    onExit() {

    }

}