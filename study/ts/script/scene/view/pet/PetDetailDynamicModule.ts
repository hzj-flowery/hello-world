const {ccclass, property} = cc._decorator;

@ccclass
export default class PetDetailDynamicModule extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _listView: cc.Node = null;

}