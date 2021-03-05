const { ccclass, property } = cc._decorator;

import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonTabIcon from '../../../ui/component/CommonTabIcon';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ViewBase from '../../ViewBase';
import HeroGoldTrainLayer from './HeroGoldTrainLayer';

var HERO_GOLD_LAYER = 1;
@ccclass
export default class HeroGoldTrainView extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelContent: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRope1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRopeTail: cc.Sprite = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon1: CommonTabIcon = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    private _subLayers: any;

    protected preloadResList = [
        { path: Path.getPrefab("HeroGoldLevelNode","heroGoldTrain"), type: cc.Prefab },
        { path: Path.getPrefab("HeroGoldMidNode","heroGoldTrain"), type: cc.Prefab },
        { path: Path.getPrefab("HeroGoldTrainLayer","heroGoldTrain"), type: cc.Prefab },
        { path: Path.getCommonPrefab("CommonMaterialIcon"), type: cc.Prefab },
        { path: Path.getPrefab("HeroGoldCostPanel","heroGoldTrain"), type: cc.Prefab },
        
        
    ];

    setInitData(heroId) {
        G_UserData.getHero().setCurHeroId(heroId);
        
    }
    onCreate() {
        this.setSceneSize(null,true);
        this._subLayers = {};
        this._initTab();
        this._initUI();
        
    }
    onEnter() {
    }
    onExit() {
    }
    _initUI() {
        this._subLayers[HERO_GOLD_LAYER] = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroGoldTrainLayer","heroGoldTrain"))) as cc.Node).getComponent(HeroGoldTrainLayer) as HeroGoldTrainLayer;
        this._subLayers[HERO_GOLD_LAYER].setInitData(this);
        this._panelContent.addChild(this._subLayers[HERO_GOLD_LAYER].node);
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    }
    _initTab() {
        var txt = Lang.get('goldenhero_train_button_text');
        this._nodeTabIcon1.updateUI(txt, true, 1);
        this._nodeTabIcon1.setSelected(true);
        this._nodeTabIcon1.setCallback(handler(this, this._onClickTabIcon));
    }
    _onClickTabIcon(index) {
    }

}