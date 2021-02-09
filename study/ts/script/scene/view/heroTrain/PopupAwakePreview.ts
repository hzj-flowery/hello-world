const {ccclass, property} = cc._decorator;

import { HeroUnitData } from '../../../data/HeroUnitData';
import { Lang } from '../../../lang/Lang';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonNormalMidPop from '../../../ui/component/CommonNormalMidPop';
import PopupBase from '../../../ui/PopupBase';
import { HeroDataHelper } from '../../../utils/data/HeroDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';

@ccclass
export default class PopupAwakePreview extends PopupBase {

   @property({
       type: CommonNormalMidPop,
       visible: true
   })
   _panelBg: CommonNormalMidPop = null;

   @property({
       type: CommonListView,
       visible: true
   })
   _listView: CommonListView = null;

   protected preloadResList = [
       {path:Path.getPrefab("PopupAwakePreviewCell","heroTrain"),type:cc.Prefab}
   ];
   
   private _heroUnitData:HeroUnitData;
   private _previewData:Array<any>;
   public setInitData(heroUnitData):void{
      this._heroUnitData = heroUnitData;
   }

   onCreate() {
    this._panelBg.setTitle(Lang.get('hero_awake_preview_title'));
    this._panelBg.addCloseEventListener(handler(this, this._onButtonClose));
    
}
onEnter() {
    this._updateView();
}
onExit() {
}
_updateView() {
    this._previewData = HeroDataHelper.getAwakeGemstonePreviewInfo(this._heroUnitData);
    this._listView.spawnCount = this._previewData.length + 6;
    this._listView.init(cc.instantiate(cc.resources.get(Path.getPrefab("PopupAwakePreviewCell","heroTrain"))),handler(this, this._onItemUpdate), handler(this, this._onItemSelected),handler(this, this._onItemTouch));
    this._listView.resize(this._previewData.length);
}
_onButtonClose() {
    this.close();
}
_onItemUpdate(item:CommonListItem, index) {
    var index = index;
    var data = this._previewData[index];
    item.updateItem(index,data!=null?[data]:null);
}
_onItemSelected(item, index) {
}
_onItemTouch(index, t) {
}

}