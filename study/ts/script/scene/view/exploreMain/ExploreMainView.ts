
import { AudioConst } from '../../../const/AudioConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { ExploreBaseData } from '../../../data/ExploreBaseData';
import { G_AudioManager, G_EffectGfxMgr, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from '../../../init';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import BigImagesNode from '../../../utils/BigImagesNode';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import ResourceLoader from '../../../utils/resource/ResourceLoader';
import ViewBase from '../../ViewBase';
import ExploreNode from './ExploreNode';
import { ExploreResCfg } from './ExploreResCfg';

const { ccclass, property } = cc._decorator;
@ccclass
export default class ExploreMainView extends ViewBase {

    public static waitEnterMsg(callback: Function) {
        //moving_shuangjian
        //effect_fudaokaiqi_lihua
        ResourceLoader.loadResArrayWithType(ExploreResCfg.getMainResArr(), (err, resoure) => {
            var arr: string[] = BigImagesNode.getImages(Path.getExploreMainBG());
            cc.resources.load(arr, cc.SpriteFrame, (err1, resoure1) => {
                G_UserData.getExplore().c2sGetExplore();
                callback && callback();
            });
        });
    }

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollMap: cc.ScrollView = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    static NODE_WIDTH = 300;

    private _citys: ExploreNode[];
    private _passCityEffectNode: cc.Node;
    private _signalEnterExplore;


    private _lastWidth;

    protected onCreate() {
        this.setSceneSize();
        this.node.name = 'ExploreMainView';
        this._topBar.setImageTitle('txt_sys_com_youli');
        this._topBar.updateUI(TopBarStyleConst.STYLE_EXPLORE);
        this._topBar.setCallBackOnBack(this._onClickBack.bind(this));
        this._topBar.resumeUpdate();
        this._scrollMap.content.setContentSize(0, G_ResolutionManager.getDesignHeight());

        // this._addMap();

        this._citys = [];
        var explores: any[] = G_UserData.getExplore().getExplores();
        for (var index in explores) {
            var data: ExploreBaseData = explores[index];
            this._addNode(data, 2);
        }
        this._passCityEffectNode = new cc.Node();
        this._scrollMap.content.addChild(this._passCityEffectNode, 3);
    }

    protected onEnter() {
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_EXPLORE);
        this._signalEnterExplore = G_SignalManager.add(SignalConst.EVENT_EXPLORE_ENTER, handler(this, this._onEventEnterExplore));
        this._refreshNodes();
        this.scheduleOnce(() => {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, this.node.name);
        }, 0);
        this.playPassMapEffect();
    }

    protected onExit() {
        this._signalEnterExplore.remove();
        this._signalEnterExplore = null;
    }

    _onClickBack() {
        G_SceneManager.popScene();
    }

    onDestroy() {
        // this._signalEnterExplore.remove();
        // this._signalEnterExplore = null;
    }

    playPassMapEffect() {
        var passCityId = G_UserData.getExplore().getFirstPassCity();
        var curCity: ExploreNode = null;
        var nextCity: ExploreNode = null;
        if (passCityId != 0) {
            for (var _ in this._citys) {
                var city = this._citys[_];
                if (curCity) {
                    if (city.isOpen()) {
                        nextCity = city;
                    }
                    break;
                }
                if (city.getConfigId() == passCityId) {
                    curCity = city;
                }
            }
        }
        if (curCity && nextCity) {
            nextCity.showSword(true);
            if (-1 * this._scrollMap.content.x + 200 > curCity.node.x) {
                var posx = 200 - curCity.node.x;
                if (posx > 0) posx = 0;
                this._scrollMap.content.x = posx;
            }
            var curCityID = curCity.getConfigId();
            var nextCityID = nextCity.getConfigId();
            G_UserData.getExplore().setFirstPassCity(0);
            var movingEffectId = curCity.getConfigId() % 8;
            if (movingEffectId == 0) {
                movingEffectId = 8;
            }
            var movingName = 'moving_youlimache' + movingEffectId;
            var effectNodePosX = Math.floor((curCity.getConfigId() - 1) / 8) * 1136 * 2 + 1136;
            this._passCityEffectNode.setPosition(effectNodePosX, this._scrollMap.content.getContentSize().height / 2);
            G_EffectGfxMgr.createPlayMovingGfx(this._passCityEffectNode, movingName, null, (event) => {
                if (event == 'lihua') {
                    var city = this.getCityById(curCityID);
                    if (city) {
                        city.playFireWorksEffect();
                    }
                } else if (event == 'shuangjian') {
                    var city = this.getCityById(nextCityID);
                    if (city) {
                        nextCity.showSword(true);
                    }
                }
            }, true);
            // moving.play();
        }
    }

    _refreshNodes() {
        var lastCity: ExploreNode = null;
        var lastWidth = 0;
        for (var i in this._citys) {
            var v = this._citys[i];
            v.refreshCity();
            v.showSword(false);
            if (v.isOpen()) {
                lastCity = v;
            }
            if (v.node.active) {
                lastWidth = v.getNodePositionX() + ExploreMainView.NODE_WIDTH;
                if (v.node.x > this._scrollMap.content.getContentSize().width) {
                    this._addMap();
                }
            }
        }
        if (!lastCity) {
            lastCity = this._citys[0];
            lastWidth = G_ResolutionManager.getDesignWidth();
        }
        lastCity.showSword(true);
        if (lastWidth != this._lastWidth) {
            var lastPosition = lastCity.getNodePositionX();
            var minWidth = G_ResolutionManager.getDesignWidth();
            this._scrollMap.content.setContentSize(lastWidth, 640);

            var x = minWidth * 0.5 - lastPosition;
            if (x > 0) {
                x = 0;
            } else if (minWidth - lastWidth >= x) {
                x = minWidth - lastWidth;
            }
            this._scrollMap.content.setPosition(x, 0);
            this._lastWidth = lastWidth;
        }
    }

    _addNode(data, zorder) {
        var prefab = cc.resources.get('prefab/exploreMain/ExploreNode');
        var exploreNode: cc.Node = cc.instantiate(prefab);
        this._scrollMap.content.addChild(exploreNode, zorder);
        var exploreNodeComponent: ExploreNode = exploreNode.getComponent(ExploreNode);
        exploreNodeComponent.setUp(data);
        this._citys.push(exploreNodeComponent);
    }

    _addMap() {
        var innerSize = this._scrollMap.content.getContentSize();
        var node: cc.Node = new cc.Node();
        var spriteMap: BigImagesNode = node.addComponent(BigImagesNode);
        spriteMap.setUp(Path.getExploreMainBG());
        spriteMap.node.setAnchorPoint(0, 0);
        spriteMap.node.setPosition(innerSize.width, 0);
        this._scrollMap.content.addChild(spriteMap.node);
        var spriteSize = spriteMap.node.getContentSize();
        innerSize.width = innerSize.width + spriteSize.width;
        this._scrollMap.content.setContentSize(innerSize);
    }

    _onEventEnterExplore(eventName, exploreId) {
        G_SceneManager.showScene('exploreMap', exploreId);
        // ExploreFacade.showMap(exploreId);
    }

    getCityById(cityId) {
        for (var i in this._citys) {
            var value: ExploreNode = this._citys[i];
            if (value.getConfigId() == cityId) {
                return value;
            }
        }
        return null;
    }

}