const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import { G_ConfigLoader, Colors } from '../../../init';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import UIHelper from '../../../utils/UIHelper';
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { ChapterBaseData } from '../../../data/ChapterBaseData';

@ccclass
export default class StageBossNode extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBoss: cc.Node = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _bossIcon: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _bossCome: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageKill: cc.Sprite = null;

    onCreate() {
    }

    public refreshBossInfo(chapterData: ChapterBaseData) {
        var bossid = chapterData.getBossId();
        var bossState = chapterData.getBossState();
        if (bossid != 0) {
            var StoryEssenceBoss = G_ConfigLoader.getConfig(ConfigNameConst.STORY_ESSENCE_BOSS);
            var bossData = StoryEssenceBoss.get(bossid);
            this._refreshBossPanel(bossData);
            if (bossState == 1) {
                this._imageKill.node.active = true;
            } else {
                this._imageKill.node.active = false;
            }
        } else {
            this._panelBoss.active = false;
        }
    }

    private _refreshBossPanel(bossData) {
        this._bossName.string = bossData.name;
        this._bossName.node.color = Colors.getColor(bossData.color);
        UIHelper.enableOutline(this._bossName, Colors.getColorOutline(bossData.color), 2)
        this._bossIcon.updateUI(bossData.res_id);
        this._bossIcon.setQuality(bossData.color);
        this._panelBoss.active = true;
    }

    private _onBossClick(sender) {
        var offsetX = Math.abs(sender.getTouchEndPosition().x - sender.getTouchBeganPosition().x);
        var offsetY = Math.abs(sender.getTouchEndPosition().y - sender.getTouchBeganPosition().y);
        if (offsetX < 20 && offsetY < 20) {
            this.dispatchCustomCallback();
        }
    }
}