const { ccclass, property } = cc._decorator;

import CommonButtonLevel1Highlight from '../../../ui/component/CommonButtonLevel1Highlight'

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { Lang } from '../../../lang/Lang';
import { G_SceneManager, G_ConfigLoader } from '../../../init';
import { handler } from '../../../utils/handler';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { Color } from '../../../utils/Color';

@ccclass
export default class PopupBossNode extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageLock: cc.Sprite = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _iconBossImg: CommonHeroIcon = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeUI: cc.Node = null;

    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _btnFight: CommonButtonLevel1Highlight = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKill: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBossBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _txtChapterName: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageChapterBG: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _txtChapter: cc.Label = null;

    private _chapterData;

    public init(chapterData) {
        this._chapterData = chapterData;

    }

    public onLoad() {
        this._btnFight.setString(Lang.get('elite_challenge'));
        this._btnFight.addClickEventListenerEx(handler(this, this._onFightClick));
    }

    public onEnable() {
        this._nodeUI.active = (false);
        this._imageLock.node.active = (true);
        this._iconBossImg.node.active = (false);
        this.refreshData(this._chapterData);
    }

    public onDisable() {
    }

    public refreshData(chapterData) {
        this._chapterData = chapterData;
        if (!this._chapterData) {
            this._nodeUI.active = (false);
            this._imageLock.node.active = (true);
            this._iconBossImg.node.active = (false);
            return;
        }
        var config = this._chapterData.getConfigData();
        this._txtChapter.string = (config.chapter);
        this._txtChapterName.string = (config.name);
        var data = G_ConfigLoader.getConfig(ConfigNameConst.STORY_ESSENCE_BOSS).get(this._chapterData.getBossId());
        this._iconBossImg.updateUI(data.res_id);
        this._iconBossImg.setQuality(data.color);
        this._iconBossImg.node.active = (true);
        this._imageLock.node.active = (false);
        this._bossName.string = (data.name);
        this._bossName.node.color = (Color.getColor(data.color));
        var state = this._chapterData.getBossState();
        if (state == 0) {
            this._imageKill.node.active = (false);
            this._btnFight.setVisible(true);
        } else {
            this._imageKill.node.active = (true);
            this._btnFight.setVisible(false);
        }
        this._nodeUI.active = (true);
    }

    private _onFightClick() {
        var state = this._chapterData.getBossState();
        if (state == 1) {
            return;
        }
        G_SceneManager.showScene('stage', this._chapterData.getId(), 0, true, true);
    }
}