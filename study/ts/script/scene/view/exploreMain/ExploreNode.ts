
import { ChapterBaseData } from '../../../data/ChapterBaseData';
import { ExploreBaseData } from '../../../data/ExploreBaseData';
import { ExploreData } from '../../../data/ExploreData';
import EffectGfxNode from '../../../effect/EffectGfxNode';
import { Colors, G_EffectGfxMgr, G_Prompt, G_SceneManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonIconTemplate from '../../../ui/component/CommonIconTemplate';
import { Path } from '../../../utils/Path';

const { ccclass, property } = cc._decorator;
@ccclass
export default class ExploreNode extends cc.Component {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnCity: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _btnCitySprite: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeSword: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _textProgressBg: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textProgress: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFlag: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCityName: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _itemReward: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _filreNode: cc.Node = null;

    private _data: ExploreBaseData;
    private _configData;
    private _chapterData: ChapterBaseData;

    private _closeTip = '';
    private _isOpen: boolean;
    private _hasShowSword:boolean = false;

    public setUp(value: ExploreBaseData) {
        this._data = value;
        this._configData = this._data.getConfigData();
        this._chapterData = G_UserData.getChapter().getGlobalChapterById(this._configData.chapter_id);

        this._isOpen = false;
        this.node.setPosition(this._configData.city_x, this._configData.city_y);
        this._btnCity.interactable = false;
        this._textCityName.string = this._configData.name;
        var cityIconPath = Path.getExploreCityRes(this._configData.city);
        var frame: cc.SpriteFrame = cc.resources.get(cityIconPath, cc.SpriteFrame);
        let rect = frame.getRect();
        this._btnCity.node.setContentSize(rect.width, rect.height);
        this._btnCitySprite.spriteFrame = frame;

        this._itemReward.initUI(this._configData.produce_type, this._configData.produce_id, null);
        this._itemReward.setTouchEnabled(true);
    }

    onDestroy(){ }

    public refreshCity() {
        var exploreData: ExploreData = G_UserData.getExplore();
        this.node.active = exploreData.isLastPass(this._configData.id, 3);
        if (!this.node.active) return;

        if (exploreData.isLastPass(this._configData.id, 1)) {
            if (this._chapterData.isLastStagePass()) {
                this._open();
            } else {
                var chapteConfig = this._chapterData.getConfigData();
                this._closeTip = Lang.get('explore_main_close_title', {
                    chapter: chapteConfig.chapter,
                    name: chapteConfig.name
                });
                this._close();
            }
        } else if (exploreData.isLastPass(this._configData.id, 2)) {
            if (this._chapterData.isLastStagePass()) {
                var lastExploreId = this._configData.ago_chapter;
                var passExploreData = exploreData.getExploreById(lastExploreId);
                this._closeTip = Lang.get('explore_city_close_title', { name: passExploreData.getConfigData().name });
                this._close();
            } else {
                var chapteConfig = this._chapterData.getConfigData();
                this._closeTip = Lang.get('explore_main_close_title', {
                    chapter: chapteConfig.chapter,
                    name: chapteConfig.name
                });
                this._close();
            }
        }
        else {
            this._disable();
        }
    }

    _close() {
        this._btnCity.interactable = true;
        this._textProgress.node.active = true;
        this._textProgressBg.node.active = true;
        this._textProgress.node.color = Colors.OBVIOUS_YELLOW;
        this.updateTextProgress(this._closeTip);
        this._imageLock.node.active = true;
        this._isOpen = false;
    }

    _disable() {
        this._btnCity.interactable = false;
        this._imageLock.node.active = true;
        this._textProgressBg.node.active = false;
        this._textProgress.node.active = false;
        this._isOpen = false;
    }

    _open() {
        this._btnCity.interactable = true;
        this._imageLock.node.active = false;
        var footIndex = Math.min(this._data.getFoot_index(), this._configData.size);
        var progress = 0;
        if (footIndex > 0) {
            progress = Math.floor((footIndex + 1) / this._configData.size * 100);
            this._textProgressBg.node.active = true;
            this._textProgress.node.active = true;
            this._textProgress.node.color = Colors.OBVIOUS_GREEN;
            this.updateTextProgress(Lang.get('explore_city_progress', { count: progress }));
        }
        else {
            this._textProgress.node.active = false;
            this._textProgressBg.node.active = false;
        }
        this._isOpen = true;
    }

    private updateTextProgress(value: string): void {
        this._textProgress.string = value;
        if (this._textProgress['_updateRenderData']) this._textProgress['_updateRenderData'](true);
        var oldSize = this._textProgress.node.getContentSize();
        this._textProgressBg.node.setContentSize(oldSize.width + 60, oldSize.height + 5);
    }

    goToCity() {
        if (this._isOpen) {
            if (this._data.getMap_id() == 0) {
                G_UserData.getExplore().c2sEnterExplore(this._configData.id);
            } else {
                G_SceneManager.showScene('exploreMap', this._configData.id);
            }
        } else {
            G_Prompt.showTip(this._closeTip);
        }
    }

    isOpen() {
        return this._isOpen;
    }

    getNodePositionX() {
        return this._configData.city_x;
    }

    getNodePositionY() {
        return this._configData.city_y;
    }

    getConfigId() {
        return this._configData.id;
    }

    showSword(s) {
        if (!s) {
            this._nodeSword.removeAllChildren();
            this._hasShowSword = false;
        } else {
            !this._hasShowSword && this.createSwordEft();
        }
    }
    createSwordEft() {
        function effectFunction(effect) {
            if (effect == 'effect_shuangjian') {
                let node = new cc.Node();
                var subEffect = node.addComponent(EffectGfxNode);
                subEffect.effectName = 'effect_shuangjian';
                subEffect.play();
                return node;
            }
        }
        this._hasShowSword = true;
        return G_EffectGfxMgr.createPlayMovingGfx(this._nodeSword, 'moving_shuangjian', effectFunction, null, false);
    }
    playFireWorksEffect () {
        this._filreNode.removeAllChildren();
        G_EffectGfxMgr.createPlayGfx(this._filreNode, 'effect_fudaokaiqi_lihua', null, true);
    }
}