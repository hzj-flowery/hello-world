import CommonCustomListView from "../../../ui/component/CommonCustomListView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class InstrumentDetailDynamicModule extends cc.Component {

   @property({
       type: CommonCustomListView,
       visible: true
   })
   _listView: CommonCustomListView = null;

}
