const {ccclass, property} = cc._decorator;

@ccclass
export default class HeroDetailDynamicModule extends cc.Component {

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listView: cc.ScrollView = null;

   public static path:string = 'heroDetail/HeroDetailDynamicModule';

}
