import CommonCustomListView from "./CommonCustomListView";
import ListViewCellBase from "../ListViewCellBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonDetailDynamicModule extends ListViewCellBase {

   @property({
       type: CommonCustomListView,
       visible: true
   })
   _listView: CommonCustomListView = null;

}
