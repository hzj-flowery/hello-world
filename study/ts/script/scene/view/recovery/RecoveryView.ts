import { FunctionConst } from '../../../const/FunctionConst';
import { RecoveryConst } from '../../../const/RecoveryConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { RedPointHelper } from '../../../data/RedPointHelper';
import { G_SceneManager, G_SignalManager } from '../../../init';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { RecoveryDataHelper } from '../../../utils/data/RecoveryDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { ResourceData } from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import ListCellTabIcon from './ListCellTabIcon';
import RebornEquipLayer from './RebornEquipLayer';
import RebornHeroLayer from './RebornHeroLayer';
import RebornHistoryHeroLayer from './RebornHistoryHeroLayer';
import RebornHorseLayer from './RebornHorseLayer';
import RebornInstrumentLayer from './RebornInstrumentLayer';
import RebornPetLayer from './RebornPetLayer';
import RebornTreasureLayer from './RebornTreasureLayer';
import RecoveryEquipLayer from './RecoveryEquipLayer';
import RecoveryHeroLayer from './RecoveryHeroLayer';
import RecoveryHorseEquipLayer from './RecoveryHorseEquipLayer';
import RecoveryHorseLayer from './RecoveryHorseLayer';
import RecoveryInstrumentLayer from './RecoveryInstrumentLayer';
import RecoveryPetLayer from './RecoveryPetLayer';
import RecoveryRebornLayerBase from './RecoveryRebornLayerBase';
import RecoveryShopButton from './RecoveryShopButton';
import RecoveryTreasureLayer from './RecoveryTreasureLayer';


const { ccclass, property } = cc._decorator;
@ccclass
export default class RecoveryView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelView: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _scrollViewTab: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _scrollViewContent: cc.Node = null;

    @property({ type: RecoveryShopButton, visible: true })
    _buttonShop: RecoveryShopButton = null;

    @property({ type: CommonTopbarBase, visible: true })
    _topbarBase: CommonTopbarBase = null;

    @property({ type: cc.Prefab, visible: true })
    _nodeTabIconPrefab: cc.Prefab = null;

    private _selectTabIndex: number;
    private _subLayers: { [key: number]: RecoveryRebornLayerBase };

    private _signalHeroRecovery;
    private _signalHeroReborn;
    private _signalEquipRecovery;
    private _signalEquipReborn;
    private _signalTreasureRecovery;
    private _signalTreasureReborn;
    private _signalInstrumentRecovery;
    private _signalInstrumentReborn;
    private _signalPetRecovery;
    private _signalPetReborn;
    private _signalHorseRecovery;
    private _signalHorseReborn;
    private _signalHistoricalHeroReborn;
    private _signalHorseEquipRecovery;

    private _nodeTabIcons: ListCellTabIcon[];

    public preloadRes(callback: Function, params?) {
        this.preloadResList = [];
        for (const key in RecoveryView.recoveryRebornList) {
            let resData: ResourceData = { path: Path.getPrefab(RecoveryView.recoveryRebornList[key].name, "recovery"), type: cc.Prefab };
            this.preloadResList.push(resData);
        }
        super.preloadRes(callback, params);
    }

    onCreate() {
        this.setSceneSize();

        let args: any[] = G_SceneManager.getViewArgs();
        if (args == null || args.length <= 0) {
            this._selectTabIndex = RecoveryConst.RECOVERY_TYPE_1;
        }
        else {
            this._selectTabIndex = args[0];
        }

        this._subLayers = {};
        this._topbarBase.setImageTitle('txt_sys_com_hiishou');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._initTab();
    }

    shopBtnClick() {
        this._buttonShop._onButtonShopClicked();
    }
    onEnter() {
        this._signalHeroRecovery = G_SignalManager.add(SignalConst.EVENT_HERO_RECOVERY_SUCCESS, handler(this, this._onEventSuccess));
        this._signalHeroReborn = G_SignalManager.add(SignalConst.EVENT_HERO_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalEquipRecovery = G_SignalManager.add(SignalConst.EVENT_EQUIP_RECOVERY_SUCCESS, handler(this, this._onEventSuccess));
        this._signalEquipReborn = G_SignalManager.add(SignalConst.EVENT_EQUIP_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalTreasureRecovery = G_SignalManager.add(SignalConst.EVENT_TREASURE_RECOVERY_SUCCESS, handler(this, this._onEventSuccess));
        this._signalTreasureReborn = G_SignalManager.add(SignalConst.EVENT_TREASURE_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalInstrumentRecovery = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_RECYCLE_SUCCESS, handler(this, this._onEventSuccess));
        this._signalInstrumentReborn = G_SignalManager.add(SignalConst.EVENT_INSTRUMENT_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalPetRecovery = G_SignalManager.add(SignalConst.EVENT_PET_RECOVERY_SUCCESS, handler(this, this._onEventSuccess));
        this._signalPetReborn = G_SignalManager.add(SignalConst.EVENT_PET_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalHorseRecovery = G_SignalManager.add(SignalConst.EVENT_HORSE_RECYCLE_SUCCESS, handler(this, this._onEventSuccess));
        this._signalHorseReborn = G_SignalManager.add(SignalConst.EVENT_HORSE_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalHistoricalHeroReborn = G_SignalManager.add(SignalConst.EVENT_HISTORY_HERO_REBORN_SUCCESS, handler(this, this._onEventSuccess));
        this._signalHorseEquipRecovery = G_SignalManager.add(SignalConst.EVENT_HORSE_EQUIP_RECOVERY_SUCCESS, handler(this, this._onEventSuccess));
        this._updateTabIcons();
        this._updateView();
    }
    onExit() {
        this._signalHeroRecovery.remove();
        this._signalHeroRecovery = null;
        this._signalHeroReborn.remove();
        this._signalHeroReborn = null;
        this._signalEquipRecovery.remove();
        this._signalEquipRecovery = null;
        this._signalEquipReborn.remove();
        this._signalEquipReborn = null;
        this._signalTreasureRecovery.remove();
        this._signalTreasureRecovery = null;
        this._signalTreasureReborn.remove();
        this._signalTreasureReborn = null;
        this._signalInstrumentRecovery.remove();
        this._signalInstrumentRecovery = null;
        this._signalInstrumentReborn.remove();
        this._signalInstrumentReborn = null;
        this._signalPetRecovery.remove();
        this._signalPetRecovery = null;
        this._signalPetReborn.remove();
        this._signalPetReborn = null;
        this._signalHorseRecovery.remove();
        this._signalHorseRecovery = null;
        this._signalHorseReborn.remove();
        this._signalHorseReborn = null;
        this._signalHistoricalHeroReborn.remove();
        this._signalHistoricalHeroReborn = null;
        this._signalHorseEquipRecovery.remove();
        this._signalHorseEquipRecovery = null;
    }
    private _initTab() {
        var recoveryData = RecoveryDataHelper.getShowFuncRecovery();
        if (recoveryData.length <= 1) {
            return;
        }
        this._scrollViewContent.removeAllChildren();
        this._nodeTabIcons = [];
        for (let i = 0; i < recoveryData.length; i++) {
            let nodeTabIcon = cc.instantiate(this._nodeTabIconPrefab).getComponent(ListCellTabIcon);
            this._nodeTabIcons.push(nodeTabIcon);
            this._scrollViewContent.addChild(nodeTabIcon.node);
            nodeTabIcon.init(this._onClickTabIcon.bind(this));
            nodeTabIcon.updateUI((i + 1) == recoveryData.length, i, recoveryData[i], recoveryData.length - 1);
        }
    }
    private _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        this._selectTabIndex = index;
        this._updateTabIcons();
        this._updateView();
    }
    private _updateTabIcons() {
        var recoveryData = RecoveryDataHelper.getShowFuncRecovery();
        if (recoveryData.length <= 1) {
            return;
        }
        for (let i = 0; i < recoveryData.length; i++) {
            this._nodeTabIcons[i].setSelected(recoveryData[i] == this._selectTabIndex);

        }
    }
    private _updateView() {
        var index = this._selectTabIndex;
        this._updateBtnShop();
        var layer: RecoveryRebornLayerBase = this._subLayers[index];
        if (layer == null) {
            let prefab: cc.Prefab = cc.resources.get(Path.getPrefab(RecoveryView.recoveryRebornList[index].name, "recovery"))
            if (prefab == null) {
                return;
            }
            layer = cc.instantiate(prefab).getComponent(RecoveryRebornLayerBase);
            if (layer) {
                this._panelView.addChild(layer.node);
                layer.updateScene(RecoveryView.recoveryRebornList[index].sceneId);
                this._subLayers[index] = layer;
            }
        }
        else {
            layer.node.active = (true);
        }
        for (const k in this._subLayers) {
            if (index.toString() != k) {
                var subLayer = this._subLayers[k];
                subLayer.node.active = (false);
            }
        }
        this._setRedPoint();
        this._updateRedPoint();
    }
    private _updateBtnShop() {
        if (this._selectTabIndex == RecoveryConst.RECOVERY_TYPE_13) {
            this._buttonShop.node.active = (false);
        } else {
            this._buttonShop.node.active = (true);
            this._buttonShop.updateView(this._selectTabIndex);
        }
    }
    private _onEventSuccess() {
        this._updateBtnShop();
        this._setRedPoint();
    }
    private _setRedPoint() {
        if (this._selectTabIndex == RecoveryConst.RECOVERY_TYPE_1) {
            var redValue = RedPointHelper.isModuleReach(FunctionConst.FUNC_RECOVERY_TYPE1);
            (this._subLayers[this._selectTabIndex] as any).setRedPoint(redValue);
            this._nodeTabIcons[this._selectTabIndex - 1].showRedPoint(redValue);
        }
    }

    private _updateRedPoint() {
        if (this._selectTabIndex == RecoveryConst.RECOVERY_TYPE_1) {
            (this._subLayers[this._selectTabIndex] as any).updateRedPoint(null);
        }
    }

    private static recoveryRebornList: { [type: number]: { class, name: string, sceneId: number } } = {
        [RecoveryConst.RECOVERY_TYPE_1]: {
            class: RecoveryHeroLayer,
            name: "RecoveryHeroLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },

        [RecoveryConst.RECOVERY_TYPE_2]: {
            class: RebornHeroLayer,
            name: "RebornHeroLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },

        [RecoveryConst.RECOVERY_TYPE_3]: {
            class: RecoveryEquipLayer,
            name: "RecoveryEquipLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },

        [RecoveryConst.RECOVERY_TYPE_4]: {
            class: RebornEquipLayer,
            name: "RebornEquipLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
        [RecoveryConst.RECOVERY_TYPE_5]: {
            class: RecoveryTreasureLayer,
            name: "RecoveryTreasureLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
        [RecoveryConst.RECOVERY_TYPE_6]: {
            class: RebornTreasureLayer,
            name: "RebornTreasureLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
        [RecoveryConst.RECOVERY_TYPE_7]: {
            class: RecoveryInstrumentLayer,
            name: "RecoveryInstrumentLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
        [RecoveryConst.RECOVERY_TYPE_8]: {
            class: RebornInstrumentLayer,
            name: "RebornInstrumentLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
        [RecoveryConst.RECOVERY_TYPE_9]: {
            class: RecoveryPetLayer,
            name: "RecoveryPetLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },
        [RecoveryConst.RECOVERY_TYPE_10]: {
            class: RebornPetLayer,
            name: "RebornPetLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },
        [RecoveryConst.RECOVERY_TYPE_11]: {
            class: RecoveryHorseLayer,
            name: "RecoveryHorseLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },
        [RecoveryConst.RECOVERY_TYPE_12]: {
            class: RebornHorseLayer,
            name: "RebornHorseLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },
        [RecoveryConst.RECOVERY_TYPE_13]: {
            class: RebornHistoryHeroLayer,
            name: "RebornHistoryHeroLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_2
        },
        [RecoveryConst.RECOVERY_TYPE_14]: {
            class: RecoveryHorseEquipLayer,
            name: "RecoveryHorseEquipLayer", sceneId: RecoveryConst.RECOVERY_SCENE_ID_1
        },
    };
}