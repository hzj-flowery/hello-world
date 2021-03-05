const { ccclass, property } = cc._decorator;
import ListViewCellBase from "../../../ui/ListViewCellBase";
import CommonListViewLineItem from "../../../ui/component/CommonListViewLineItem";
import { GachaGoldenHeroConst } from "../../../const/GachaGoldenHeroConst";
import { Path } from "../../../utils/Path";
import UIHelper from "../../../utils/UIHelper";
import { G_ConfigLoader } from "../../../init";

@ccclass
export default class CakeAwardPreviewCell extends ListViewCellBase {


    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRankBK: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageRank: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textRank: cc.Label = null;

    @property({
        type: CommonListViewLineItem,
        visible: true
    })
    _awardsListview: CommonListViewLineItem = null;

    _size: cc.Size;

    onCreate() {
        this._size = this._resource.getContentSize();
        this.node.setContentSize(this._size);
        this._resource.active = (false);
        // this._imageBack.setScale9Enabled(false);
    }
    updateUI(data) {
        if (!data || data.length <= 0) {
            return;
        }
        this._resource.active = (true);
        var index = data.index <= 3 ? data.index : data.index % 2 + 4;
        this._updateBackImage(index, data.index <= 3);
        this._updateRankBackImage(data.index);
        this._updateAwardsList(data.cfg);
    }
    _updateBackImage(i, isTop3) {
        var imgPath = isTop3 ? Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANK_BG[i-1]) : Path.getCommonRankUI(GachaGoldenHeroConst.JOYBONUS_RANK_BG[i-1]);
        UIHelper.loadTexture(this._imageBack, imgPath);
        // this._imageBack.setScale9Enabled(i > 3);
        // if (i > 3) {
        //     this._imageBack.setCapInsets(cc.rect(1, 1, 1, 1));
        // }
        this._imageBack.node.setContentSize(this._size);
    }
    _updateRankBackImage(rankIdx) {
        var rankIndex = rankIdx <= 3 ? rankIdx : 4;
        this._imageRankBK.node.active = (rankIdx <= 3);
        UIHelper.loadTexture(this._imageRankBK, Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_BG[rankIndex-1]));
        this._imageRank.node.active = (rankIdx <= 3);
        UIHelper.loadTexture(this._imageRank, Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_IDX[rankIndex-1]));
        this._textRank.node.active = (rankIdx > 3);
    }
    _updateAwardsList(rankData) {
        if (typeof (rankData) != 'object') {
            return;
        }
        this._textRank.string = ((rankData.rank_max).toString() + ('-' + (rankData.rank_min).toString()));
        var itemList = [];
        var dropInfo = G_ConfigLoader.getConfig('drop').get(rankData.drop);
        for (var i = 1; i <= 10; i++) {
            var itemType = dropInfo['type_' + i];
            if (typeof (itemType) && itemType > 0) {
                itemList.push({
                    type: dropInfo['type_' + i],
                    value: dropInfo['value_' + i],
                    size: dropInfo['size_' + i]
                });
            }
        }
        this._awardsListview.setMaxItemSize(7);
        this._awardsListview.setListViewSize(820, 120);
        this._awardsListview.setItemsMargin(5);
        this._awardsListview.updateUI(itemList, 1);
        this._awardsListview._listViewItem.enabled = false;
    }
}