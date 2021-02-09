const { ccclass, property } = cc._decorator;

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'

import HeroTransformPreviewCommon from './HeroTransformPreviewCommon'

import CommonTabGroupSmallHorizon from '../../../ui/component/CommonTabGroupSmallHorizon'

import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop'
import { handler } from '../../../utils/handler';
import { G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import { HeroConst } from '../../../const/HeroConst';
import HeroTransformCommonLevel from './HeroTransformCommonLevel';
import HeroTransformCommonBreak from './HeroTransformCommonBreak';
import HeroTransformCommonAwake from './HeroTransformCommonAwake';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class PopupHeroTransformPreview extends PopupBase {
    public static path = 'heroTransform/PopupHeroTransformPreview';

    @property({
        type: CommonNormalMidPop,
        visible: true
    })
    _nodeBg: CommonNormalMidPop = null;

    @property({
        type: CommonTabGroupSmallHorizon,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupSmallHorizon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeInfo2: cc.Node = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _buttonClose: CommonButtonLevel0Highlight = null;

    @property(HeroTransformPreviewCommon)
    srcCommon: HeroTransformPreviewCommon = null;
    @property(HeroTransformPreviewCommon)
    tarCommon: HeroTransformPreviewCommon = null;
    @property(cc.Prefab)
    heroTransformCommonLevel: cc.Prefab = null;
    @property(cc.Prefab)
    heroTransformCommonBreak: cc.Prefab = null;
    @property(cc.Prefab)
    heroTransformCommonAwake: cc.Prefab = null;


    _parentView: any;
    _srcHeroId: any;
    _tarHeroBaseId: any;
    _selectTabIndex: number;
    _subNodes: {};
    _srcHeroData: import("f:/mingjiangzhuan/main/assets/script/data/HeroUnitData").HeroUnitData;

    ctor(parentView, srcHeroId, tarHeroBaseId) {
        this._parentView = parentView;
        this._srcHeroId = srcHeroId;
        this._tarHeroBaseId = tarHeroBaseId;
        this._buttonClose.addClickEventListenerEx(handler(this, this._onButtonClose));
    }
    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
        this._selectTabIndex = 0;
        this._subNodes = {};
        this._srcHeroData = G_UserData.getHero().getUnitDataWithId(this._srcHeroId);
    }
    _initView() {
        this._nodeBg.setTitle(Lang.get('hero_transform_preview_title'));
        this._nodeBg.addCloseEventListener(handler(this, this._onButtonClose));
        this._buttonClose.setString(Lang.get('hero_transform_preview_btn_close'));
        this._initTab();
        var srcHeroBaseId = this._srcHeroData.getBase_id();
        var tarHeroBaseId = this._tarHeroBaseId;
        var limitLevel = this._srcHeroData.getLimit_level();
        this.srcCommon.updateUI(1, srcHeroBaseId, limitLevel, this._srcHeroData.getRank_lv());
        this.tarCommon.updateUI(2, tarHeroBaseId, limitLevel, this._srcHeroData.getRank_lv());
    }

    start() {
        this._nodeTabRoot.setTabIndex(0);
    }
    _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            textList: [
                Lang.get('hero_transform_preview_tab1'),
                Lang.get('hero_transform_preview_tab2'),
                Lang.get('hero_transform_preview_tab3')
            ]
        };
        if (this._isChooseGoldHero()) {
            param = {
                callback: handler(this, this._onTabSelect),
                isVertical: 2,
                textList: [Lang.get('hero_transform_preview_tab4')]
            };
        }
        this._nodeTabRoot.recreateTabs(param);
    }
    onEnter() {
        this._updateData();
        this._nodeTabRoot.setTabIndex(1);
    }
    onExit() {
    }
    _onTabSelect(index, sender) {
        index++;
        if (this._selectTabIndex == index) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateView();
        return true;
    }
    _updateData() {
    }
    _updateView() {
        var nodes = this._subNodes[this._selectTabIndex];
        if (nodes == null) {
            nodes = {};
            var srcHeroBaseId = this._srcHeroData.getBase_id();
            var tarHeroBaseId = this._tarHeroBaseId;
            if (this._selectTabIndex == HeroConst.HERO_TRAIN_UPGRADE) {
                var heroLevel = this._srcHeroData.getLevel();
                nodes[1] = cc.instantiate(this.heroTransformCommonLevel).getComponent(HeroTransformCommonLevel);
                nodes[2] = cc.instantiate(this.heroTransformCommonLevel).getComponent(HeroTransformCommonLevel);
                nodes[1].updateUI(srcHeroBaseId, heroLevel);
                nodes[2].updateUI(tarHeroBaseId, heroLevel);
            } else if (this._selectTabIndex == HeroConst.HERO_TRAIN_BREAK) {
                var heroRank = this._srcHeroData.getRank_lv();
                nodes[1] = cc.instantiate(this.heroTransformCommonBreak).getComponent(HeroTransformCommonBreak);
                nodes[2] = cc.instantiate(this.heroTransformCommonBreak).getComponent(HeroTransformCommonBreak);
                nodes[1].updateUI(srcHeroBaseId, heroRank);
                nodes[2].updateUI(tarHeroBaseId, heroRank);
            } else if (this._selectTabIndex == HeroConst.HERO_TRAIN_AWAKE) {
                var awakeLevel = this._srcHeroData.getAwaken_level();
                var gemstones = this._srcHeroData.getAwaken_slots();
                nodes[1] = cc.instantiate(this.heroTransformCommonAwake).getComponent(HeroTransformCommonAwake);
                nodes[2] = cc.instantiate(this.heroTransformCommonAwake).getComponent(HeroTransformCommonAwake);;
                nodes[1].updateUI(srcHeroBaseId, awakeLevel, gemstones);
                nodes[2].updateUI(tarHeroBaseId, awakeLevel, gemstones);
            }
            if (nodes[1] && nodes[2]) {
                this._nodeInfo1.addChild(nodes[1].node);
                this._nodeInfo2.addChild(nodes[2].node);
                this._subNodes[this._selectTabIndex] = nodes;
            }
        }
        for (var k in this._subNodes) {
            var subs = this._subNodes[k];
            subs[1].node.active = (false);
            subs[2].node.active = (false);
        }
        nodes[1].node.active = (true);
        nodes[2].node.active = (true);
    }
    _onButtonClose() {
        this.close();
    }
    _isChooseGoldHero() {
        if (this._srcHeroData) {
            var color = this._srcHeroData.getConfig().color;
            if (color == 7) {
                return true;
            }
        }
        return false;
    }

}