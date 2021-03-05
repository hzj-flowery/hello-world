const {ccclass, property} = cc._decorator;

import CommonRankIcon from '../../../ui/component/CommonRankIcon'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Colors } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import ListViewCellBase from '../../../ui/ListViewCellBase';

@ccclass
export default class GuildSprintRankItemCell extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBG: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageBGLight: cc.Sprite = null;

   @property({
       type: CommonRankIcon,
       visible: true
   })
   _rank: CommonRankIcon = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textRank: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textGuildName: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textGuildLeader: cc.Label = null;
   private _data:any;

onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
}

updateUI(index,guildSprintRankUnitData) {
    this._data = guildSprintRankUnitData;
    var rank = guildSprintRankUnitData.getRank();
    this._setNodeBG(rank);
    this._textRank.string = (rank);
    this._textGuildName.string = (guildSprintRankUnitData.getGuild_name());
    this._textGuildLeader.string = (guildSprintRankUnitData.getGuild_leader_name());
    this._textGuildLeader.node.color = (Colors.getOfficialColor(guildSprintRankUnitData.getGuild_leader_office_level()));
    UIHelper.updateTextOfficialOutline(this._textGuildLeader.node, guildSprintRankUnitData.getGuild_leader_office_level());
}
_setNodeBG(rank) {
    if (rank < 4) {
        var pic = Path.getComplexRankUI('img_com_ranking0' + rank);
        this._imageBG.node.addComponent(CommonUI).loadTexture(pic);
        this._textRank.node.active = (false);
        this._imageBGLight.node.active = (true);
        var icon = Path.getRankIcon(rank);
        this._rank.setRank(rank);
        this._rank.node.active = (true);
    } else {
        this._textRank.node.active = (true);
        this._rank.node.active = (false);
        this._imageBGLight.node.active = (false);
    }
    if (rank >= 4 && rank % 2 == 1) {
        var pic = Path.getComplexRankUI('img_com_ranking04');
        this._imageBG.node.addComponent(CommonUI).loadTexture(pic);
    } else if (rank >= 4 && rank % 2 == 0) {
        var pic = Path.getComplexRankUI('img_com_ranking05');
        this._imageBG.node.addComponent(CommonUI).loadTexture(pic);
    }
}


}