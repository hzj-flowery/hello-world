import { CrossWorldBossConst } from "../../../const/CrossWorldBossConst";
import CommonListItem from "../../../ui/component/CommonListItem";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
const { ccclass, property } = cc._decorator;

@ccclass

export default class  CrossWorldBossRankCell extends CommonListItem{
    name: 'CrossWorldBossRankCell';
    @property({
        type: cc.Sprite,
        visible: true
    })
    _resourceNode: cc.Sprite = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeGuild: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodePersonal: cc.Node = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_rank_bk: cc.Sprite = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    Image_bk: cc.Sprite = null;
    
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
    _textServerName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildPoint: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _playerName: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textServerName1: cc.Label = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textPoint: cc.Label = null;
    
    
    
    private _cellData:any;
    onCreate() {
        var size = this._resourceNode.node.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    protected updateUI(itemId, data){
        this.updateUIData(itemId,data[0],data[1]);
    }
    updateUIData(index, data, tabIndex) {
        this._cellData = data;
        if (data.rank <= 3 && data.rank > 0) {
            UIHelper.loadTexture(this.Image_rank_bk, Path.getComplexRankUI('img_qizhi0' + data.rank));
            this.Image_rank_bk.node.active = true;
            this._textRank.node.color = (CrossWorldBossConst.RANK_COLOR[data.rank-1]);
            UIHelper.enableOutline(this._textRank,CrossWorldBossConst.RANK_OUTLINE_COLOR[data.rank-1], 2);
        } else {
            this.Image_rank_bk.node.active = true;
            UIHelper.loadTexture(this.Image_rank_bk, Path.getComplexRankUI('img_qizhi04'));
            this._textRank.node.color = (CrossWorldBossConst.RANK_COLOR[3]);
            UIHelper.enableOutline(this._textRank,CrossWorldBossConst.RANK_OUTLINE_COLOR[3], 2);
        }
        this._textRank.string = (data.rank);
        this.Image_bk.node.active = data.rank % 2 == 0 ;
        this._nodeGuild.active = (false);
        this._nodePersonal.active = (false);
        if (tabIndex == CrossWorldBossConst.TAB_INDEX_GUILD) {
            this._nodeGuild.active = (true);
            this._textGuildName.string = (data.name);
            this._textGuildCount.string = (data.num);
            this._textServerName.string = (data.sname);
            this._textGuildPoint.string = (TextHelper.getAmountText(data.point));
        } else {
            this._nodePersonal.active = (true);
            this._playerName.string = (data.name);
            this._textServerName1.string = (data.sname);
            this._textPoint.string = (TextHelper.getAmountText(data.point));
        }
    }
}