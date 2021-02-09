const {ccclass, property} = cc._decorator;

import CommonResourceInfo from '../../../ui/component/CommonResourceInfo'
import CommonListItem from '../../../ui/component/CommonListItem';
import { Path } from '../../../utils/Path';
import CommonUI from '../../../ui/component/CommonUI';
import CommonListCellBase from '../../../ui/component/CommonListCellBase';
import PopupBase from '../../../ui/PopupBase';

@ccclass
export default class PopupArenaSweepCell extends CommonListItem {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelNormal: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _commonInfo1: CommonResourceInfo = null;

   @property({
       type: CommonResourceInfo,
       visible: true
   })
   _commonInfo2: CommonResourceInfo = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageResult: cc.Sprite = null;
   
   private _title:string;
   private _rewardRes:any;
   private _rewardItem:any;
onCreate() {
    var size = this._resourceNode.getContentSize();
    this.node.setContentSize(size.width, size.height);
}
updateInitData(title, rewardRes, rewardItem, isWin, addRewards) {
    this._rewardRes = rewardRes;
    this._rewardItem = rewardItem;
    this._textTitle.string = (title);
    if (isWin == true) {
        this._imageResult.node.addComponent(CommonUI).loadTexture(Path.getRanking('img_ranking_win01'));
    } else {
        this._imageResult.node.addComponent(CommonUI).loadTexture(Path.getRanking('img_ranking_lose01'));
    }
    var critRewards = {};
    if (addRewards) {
        for (var k in addRewards) {
            var v = addRewards[k];
            if (v.award && v.award.type && v.award.value) {
                var key = cc.js.formatStr('%s_%s', v.award.type, v.award.value);
                critRewards[key] = v;
            }
        }
    }
    for (var i = 1;i<=rewardRes.length;i++) {
        var value = rewardRes[i-1];
        this['_commonInfo' + i].updateUI(value.type, value.value, value.size);
        this['_commonInfo' + i].showResName(false);
        var key = cc.js.formatStr('%s_%s', value.type, value.value);
        var critReward = critRewards[key];
        if (critReward) {
            this['_commonInfo' + i].updateCrit(critReward.index, critReward.award.size);
        } else {
            this['_commonInfo' + i].setCritVisible(false);
        }
    }
}


}