const { ccclass, property } = cc._decorator;

import CommonMainMenu from '../../../ui/component/CommonMainMenu'
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'
import { FunctionConst } from '../../../const/FunctionConst';
import PetConst from '../../../const/PetConst';
import { Path } from '../../../utils/Path';
import { G_ResolutionManager, G_UserData } from '../../../init';
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import ViewBase from '../../ViewBase';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { WayFuncDataHelper } from '../../../utils/data/WayFuncDataHelper';
import PetMainAvatorsNode from './PetMainAvatorsNode';

var FUNC_ID_LIST = [
    FunctionConst.FUNC_PET_LIST,
    FunctionConst.FUNC_PET_SHOP,
    FunctionConst.FUNC_PET_HAND_BOOK,
    FunctionConst.FUNC_PET_HELP
];
@ccclass
export default class PetMainView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _avatarNodes: cc.Node = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _funcIcon1: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _funcIcon2: CommonMainMenu = null;

    @property({
        type: CommonMainMenu,
        visible: true
    })
    _funcIcon3: CommonMainMenu = null;
    @property({
        type: CommonMainMenu,
        visible: true
    })
    _funcIcon4: CommonMainMenu = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    petMainAvatorsNode: cc.Prefab = null;
    _selectTabIndex: any;

    public preloadRes(callBack: Function, params) {
        this.addPreloadSceneRes(109);
        super.preloadRes(callBack, params);
    }


    ctor(index) {
        this._selectTabIndex = index || PetConst.PET_LIST_TYPE1;
    }
    onCreate() {
        this.setSceneSize();
        this.updateSceneId(109);
        for (var i = 1; i <= 4; i++) {
            this['_funcIcon' + i].updateUI(FUNC_ID_LIST[i-1]);
            this['_funcIcon' + i].addClickEventListenerEx(handler(this, this._onButtonClick));
        }
        var [showNum] = G_UserData.getPet().getShowPetNum();
        var mainAvatorsNode: PetMainAvatorsNode = cc.instantiate(this.petMainAvatorsNode).getComponent(PetMainAvatorsNode);;
        if (showNum <= PetConst.SCROLL_AVATART_NUM) {
            mainAvatorsNode.ctorSlef(PetConst.SCROLL_SIZE, PetConst.ANGLE_CONTENT, PetConst.START_INDEX, this, PetConst.ANGLE_OFFSET, PetConst.CIRCLE, PetConst.SCALE_RANGE);
            mainAvatorsNode.node.setPosition(PetConst.SCROLL_POSITION);
        } else {
            var petInfo = PetConst['PET_INFO' + showNum];
            mainAvatorsNode.ctorSlef(G_ResolutionManager.getDesignCCSize(), petInfo.ANGLE_CONTENT, petInfo.START_INDEX, this, petInfo.ANGLE_OFFSET, petInfo.CIRCLE, petInfo.SCALE_RANGE);
            mainAvatorsNode.node.setPosition(petInfo.SCROLL_POSITION);
        }
        mainAvatorsNode.node.name = ('PetMainAvatorsNode');
        var groundNode = this.getGroundNode();
        groundNode.addChild(mainAvatorsNode.node);
    }
    onEnter() {
        this._topbarBase.setImageTitle('txt_sys_com_shenshou');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._onEventRedPointUpdate();
    }
    _onEventRedPointUpdate() {
        this._refreshRedPoint();
    }
    _refreshRedPoint() {
        function checkShopRedPoint(funcNode) {
            if (funcNode.getFuncId() == FunctionConst.FUNC_PET_SHOP) {
                var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_SHOP_SCENE, 'petShop');
                funcNode.showRedPoint(redValue);
            }
            if (funcNode.getFuncId() == FunctionConst.FUNC_PET_LIST) {
                redValue = G_UserData.getFragments().hasRedPoint({ fragType: TypeConvertHelper.TYPE_PET });
                funcNode.showRedPoint(redValue);
            }
            if (funcNode.getFuncId() == FunctionConst.FUNC_PET_HAND_BOOK) {
                var redValue = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_PET_HOME, 'petMapRP');
                funcNode.showRedPoint(redValue);
            }
        }
        for (var i = 1; i <= 4; i++) {
            var funcNode = this['_funcIcon' + i];
            checkShopRedPoint(funcNode);
        }
    }
    onExit() {
    }
    _onButtonClick(sender, funcId) {
        if (funcId > 0) {
            WayFuncDataHelper.gotoModuleByFuncId(funcId);
        }
    }
}