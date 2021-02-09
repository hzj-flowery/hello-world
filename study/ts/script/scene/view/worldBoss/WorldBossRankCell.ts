const { ccclass, property } = cc._decorator;

import CommonPlayerName from '../../../ui/component/CommonPlayerName'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import UIHelper from '../../../utils/UIHelper';
import { Path } from '../../../utils/Path';
import { Colors } from '../../../init';
import WorldBossConst from '../../../const/WorldBossConst';
import { TextHelper } from '../../../utils/TextHelper';
import CommonListViewLineItem from '../../../ui/component/CommonListViewLineItem';
import CommonListItem from '../../../ui/component/CommonListItem';

@ccclass
export default class WorldBossRankCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodePersonal: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;

    @property({
        type: CommonPlayerName,
        visible: true
    })
    _fileNodePlayerName: CommonPlayerName = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeGuild: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildCount: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildPoint: cc.Label = null;


    _cellData: any;



    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    updateUI(tabIndex, data) {
        this._cellData = data;
        if (data.rank <= 3 && data.rank > 0) {
            this._resourceNode.getChildByName("Image_rank_bk").active = true;
            UIHelper.loadTexture(this._resourceNode.getChildByName("Image_rank_bk").getComponent(cc.Sprite), Path.getArenaUI('img_qizhi0' + data.rank));
            this._resourceNode.getChildByName("Text_rank_num").active = false;
        } else {
            this._resourceNode.getChildByName("Image_rank_bk").active = true;
            UIHelper.loadTexture(this._resourceNode.getChildByName("Image_rank_bk").getComponent(cc.Sprite), Path.getArenaUI('img_qizhi04'));
            this._resourceNode.getChildByName("Text_rank_num").active = true;
            this._resourceNode.getChildByName("Text_rank_num").getComponent(cc.Label).string = data.rank;

        }
        var getRankColor = function (rank) {
            if (rank <= 3 && rank > 0) {
                return Colors['WORLD_BOSS_RANK_COLOR' + rank];
            }
            return Colors['WORLD_BOSS_RANK_COLOR4'];
        }.bind(this);
        this._nodeGuild.active = (false);
        this._nodePersonal.active = (false);
        if (tabIndex == WorldBossConst.TAB_INDEX_GUILD - 1) {
            this._nodeGuild.active = (true);
            this._textGuildName.string = (data.name);
            this._textGuildCount.string = (data.num);
            this._textGuildPoint.string = (TextHelper.getAmountText(data.point));
        } else {
            this._nodePersonal.active = (true);
            this._fileNodePlayerName.updateUI(data.name, data.official);
            this._fileNodePlayerName.setFontSize(18);
            this._textPoint.string = (TextHelper.getAmountText(data.point));
        }
    }

}