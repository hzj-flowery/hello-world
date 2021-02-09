const {ccclass, property} = cc._decorator;

@ccclass
export default class CarnivalActivityIntroTitleNode extends cc.Component {

   @property({
       type: cc.Sprite,
       visible: true
   })
   _resourceNode: cc.Sprite = null;

   @property(cc.Label)
   text:cc.Label = null;

}

