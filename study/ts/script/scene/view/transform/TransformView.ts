const { ccclass, property } = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonHelpBig from '../../../ui/component/CommonHelpBig'

import CommonTabIcon from '../../../ui/component/CommonTabIcon'
import { TransformConst } from '../../../const/TransformConst';
import { G_SignalManager, G_SceneManager, G_ResolutionManager } from '../../../init';
import { SignalConst } from '../../../const/SignalConst';
import { handler } from '../../../utils/handler';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { Lang } from '../../../lang/Lang';
import { LogicCheckHelper } from '../../../utils/LogicCheckHelper';
import HeroTransformView from '../heroTransform/HeroTransformView';
import TreasureTransformView from './treasure/TreasureTransformView';
import InstrumentTransformView from './instrument/InstrumentTransformView';
import ViewBase from '../../ViewBase';

@ccclass
export default class TransformView extends ViewBase {

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
    _imageLine1: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLine2: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLine3: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTail: cc.Sprite = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon1: CommonTabIcon = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon2: CommonTabIcon = null;

    @property({
        type: CommonTabIcon,
        visible: true
    })
    _nodeTabIcon3: CommonTabIcon = null;

    @property({
        type: CommonHelpBig,
        visible: true
    })
    _buttonHelp: CommonHelpBig = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    @property(cc.Prefab)
    heroTransformView: cc.Prefab = null;
    @property(cc.Prefab)
    treasureTransformView: cc.Prefab = null;
    @property(cc.Prefab)
    instrumentTransformView: cc.Prefab = null;

    _selectTabIndex: any;
    _curHeroQuality: number;
    _signalHeroTransformChoose: any;
    _subLayers: {};

    ctor(transformType) {
        this._selectTabIndex = transformType || TransformConst.HERO;
        this._curHeroQuality = 0;
    }
    onCreate() {
        var params = G_SceneManager.getViewArgs('transform');
        this.ctor(params[0]);
        this.setSceneSize();
        this._initData();
        this._initView();
    }
    onEnter() {
        this._signalHeroTransformChoose = G_SignalManager.add(SignalConst.EVENT_HERO_TRANSFORM_CHOOSE, handler(this, this._heroTransformChoose));
        this._updateData();
        this._updateView();
    }
    onExit() {
        this._signalHeroTransformChoose.remove();
        this._signalHeroTransformChoose = null;
    }

    start() {
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO);
        this._topbarBase.setImageTitle('txt_sys_com_zhihuan');
    }
    _initData() {
    }
    _initView() {

        this._buttonHelp.updateUI(FunctionConst.FUNC_CONVERT);
        this._subLayers = {};
        var showTabCount = 0;
        for (var i = 1; i <= 3; i++) {
            var txt = Lang.get('transform_tab_icon_' + i);
            var isOpen = true;
            if (i == 3) {
                [isOpen] = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_CONVERT_INSTRUMENT);
            }
            this['_nodeTabIcon' + i].updateUI(txt, isOpen, i);
            this['_nodeTabIcon' + i].setCallback(handler(this, this._onClickTabIcon));
            this['_nodeTabIcon' + i].setVisible(isOpen);
            this['_imageLine' + i].setVisible(isOpen);
            if (isOpen) {
                showTabCount = showTabCount + 1;
            }
        }
        this._imageTail.node.y = (-315 + 135 * (3 - showTabCount));
    }
    _onClickTabIcon(index) {
        if (index == this._selectTabIndex) {
            return;
        }
        if (index == TransformConst.HERO) {
            if (this._curHeroQuality == 6) {
                this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_RED);
            } else if (this._curHeroQuality == 7) {
                this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD);
            } else {
                this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO);
            }
        } else if (index == TransformConst.TREASURE) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_TREASURE);
        } else if (index == TransformConst.INSTRUMENT) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_INSTRUMENT);
        }
        this._selectTabIndex = index;
        this._updateView();
    }
    _updateTabIcons() {
        for (var i = 1; i <= 3; i++) {
            this['_nodeTabIcon' + i].setSelected(i == this._selectTabIndex);
        }
    }
    _updateData() {
    }
    _updateView() {
        this._updateTabIcons();
        var layer = this._subLayers[this._selectTabIndex];
        if (layer == null) {
            if (this._selectTabIndex == TransformConst.HERO) {
                layer = cc.instantiate(this.heroTransformView);
            } else if (this._selectTabIndex == TransformConst.TREASURE) {
                layer = cc.instantiate(this.treasureTransformView);
            } else if (this._selectTabIndex == TransformConst.INSTRUMENT) {
                layer = cc.instantiate(this.instrumentTransformView);
            }
            if (layer) {
                this._panelContent.addChild(layer);
                this._subLayers[this._selectTabIndex] = layer;
            }
        }
        for (var k in this._subLayers) {
            var subLayer = this._subLayers[k];
            subLayer.active = (false);
        }
        layer.active = (true);
    }
    _heroTransformChoose(eventName, color) {
        this._curHeroQuality = color;
        if (color == 5) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO);
        } else if (color == 6) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_RED);
        } else if (color == 7) {
            this._topbarBase.updateUI(TopBarStyleConst.STYLE_TRANSFORM_HERO_GOLD);
        }
    }
}