const { ccclass, property } = cc._decorator;

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import CommonListItem from '../../../ui/component/CommonListItem';
import UIHelper from '../../../utils/UIHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { Util } from '../../../utils/Util';
import { Path } from '../../../utils/Path';
import { Lang } from '../../../lang/Lang';

@ccclass
export default class ActivityGuildSprintItemCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textGuildName: cc.Label = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item01: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item02: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _item03: CommonIconTemplate = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_bk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_rank_bk: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _image_Rank_num: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _text_rank_num: cc.Label = null;
    private _itemWidgets: Array<Array<CommonIconTemplate>>;
    private _items: any;
    private _data: any;

    onCreate() {
        this._items = {};
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._itemWidgets = [
            [this._item01],
            [this._item02],
            [this._item03]
        ];
    }
    updateUI(index, dataFrom) {
        this._data = dataFrom[0];
        var rank = this._data.rank_min;
        var rankData = this._data.rankData;
        if (rank <= 3 && rank > 0) {
            Util.updateImageView(this._image_bk, {
                visible: true,
                texture: Path.getCustomActivityUI('img_rank0' + rank)
            });
            Util.updateImageView(this._image_rank_bk, Path.getComplexRankUI('icon_ranking0' + rank));
            Util.updateImageView(this._image_Rank_num, {
                visible: true,
                texture: Path.getComplexRankUI('txt_ranking0' + rank)
            });
            Util.updateLabel(this._text_rank_num, { visible: false })
        } else {
            Util.updateImageView(this._image_Rank_num, { visible: false });
            Util.updateLabel(this._text_rank_num, {
                visible: true,
                text: rank
            });
            Util.updateImageView(this._image_rank_bk, Path.getComplexRankUI('icon_ranking04'));
            if (index >= 4 && index % 2 == 1) {
                Util.updateImageView(this._image_bk, {
                    visible: true,
                    texture: Path.getCustomActivityUI('img_rank05')
                });
            } else if (index >= 4 && index % 2 == 0) {
                Util.updateImageView(this._image_bk, {
                    visible: true,
                    texture: Path.getCustomActivityUI('img_rank04')
                });
            }
        }
        for (var i =1;i<=this._itemWidgets.length;i++) {
            var items = this._itemWidgets[i-1];
            var config = this._data['config' + (i)];
            var itemList = {};
            if (config) {
                itemList = UserDataHelper.makeRewards(config, 3, 'award_');
            }
            for (var k in items) {
                var item = items[k];
                var itemData = itemList[k];
                if (itemData) {
                    item.node.active = (true);
                    item.unInitUI();
                    item.initUI(itemData.type, itemData.value, itemData.size);
                    // item.setTouchEnabled(true);
                    item.showIconEffect(null,null);
                } else {
                    item.node.active = (false);
                }
            }
        }
        if (rankData) {
            this._textGuildName.string = (rankData.getGuild_name());
        } else {
            this._textGuildName.string = ('');
        }
        if (this._data.rank_min == this._data.rank_max) {
            this._textGuildName.node.active = (true);
            this._textRank.node.active = (false);
            Util.updateImageView(this._image_rank_bk, { visible: true });
        } else {
            this._textGuildName.node.active = (false);
            this._textRank.node.active = (true);
            Util.updateImageView(this._image_rank_bk, { visible: false });
            var txt = Lang.get('activity_guild_sprint_rank', {
                minRank: this._data.rank_min,
                maxRank: this._data.rank_max
            });
            this._textRank.string = (txt);
        }
    }


}