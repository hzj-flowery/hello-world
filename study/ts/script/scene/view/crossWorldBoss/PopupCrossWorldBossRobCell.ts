import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonButtonLevel1Highlight from "../../../ui/component/CommonButtonLevel1Highlight";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonListItem from "../../../ui/component/CommonListItem";
import { unpack } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
const {ccclass, property} = cc._decorator;

@ccclass
export default class  PopupCrossWorldBossRobCell extends CommonListItem{
    name: 'PopupCrossWorldBossRobCell';
    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _playerName: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_top_rank: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_rank_bk: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    Text_rank: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _playerSid: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _scrollView: cc.ScrollView = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon1: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon2: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon3: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon4: CommonHeroIcon = null;
    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon5: CommonHeroIcon = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _commonHeroIcon6: CommonHeroIcon = null;
    
    
    
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _commonButton: CommonButtonLevel1Highlight = null;

    
    private _cellValue:any;
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._commonButton.addClickEventListenerEx(handler(this, this._onButtonClick));
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(index, data) {
        this._cellValue = data;
        this._playerName.string = (data.name);
        this._playerName.node.color = (Colors.getOfficialColor(data.official));
        UIHelper.updateTextOfficialOutline(this._playerName.node, data.official);
        this._playerSid.string = (data.sname);
        this.scheduleOnce(()=>{
            //重新修改玩家名字位置
            this._playerName.node.x = this._playerSid.node.x+this._playerSid.node.width;
        })
        if (data.rank <= 3 && data.rank >= 1) {
            UIHelper.loadTexture(this.Image_top_rank,Path.getArenaUI('img_qizhi0' + data.rank));
            this.Image_top_rank.node.active = true;
            UIHelper.loadTexture(this.Image_rank_bk,Path.getComplexRankUI('img_midsize_ranking0' + data.rank));
            this.Image_rank_bk.node.active = true;
            this.Text_rank.node.active = false;
        } else {
            this.Image_top_rank.node.active = false;
            this.Image_rank_bk.node.active = true;
            UIHelper.loadTexture(this.Image_rank_bk,Path.getComplexRankUI('img_midsize_ranking04' + data.rank));
            this.Text_rank.node.active = true;
            this.Text_rank.string = data.rank;
        }
        this._textPoint.string = (TextHelper.getAmountText(data.point));
        if (data.userId == G_UserData.getBase().getId()) {
            this._commonButton.setString(Lang.get('worldboss_grob_self_btn'));
            this._commonButton.setEnabled(false);
        } else {
            this._commonButton.setString(Lang.get('worldboss_grob_btn'));
            this._commonButton.setEnabled(true);
        }
        if (data.guildName == null || data.guildName == '') {
            this._textGuildName.string  =(' ');
        } else {
            this._textGuildName.string = ('(' + (data.guildName + ')'));
        }
        for (let i = 1;i<=6;i++) {
            var commHero:CommonHeroIcon = this["_commonHeroIcon"+i];
            commHero.node.active  = (false);
            var heroData = data.heroList[i-1];
            if (heroData) {
                var [baseId,limit] = unpack(heroData);
                if (baseId && baseId > 0) {
                    commHero.node.active = (true);
                    commHero.updateUI(baseId, null, limit);
                }
            }
        }
    }
    _onButtonClick(sender) {
        var userId = sender.getTag();
        this.dispatchCustomCallback(this._cellValue.userId, this._cellValue.sid);
    }
}