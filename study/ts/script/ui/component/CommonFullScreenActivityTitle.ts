const {ccclass, property} = cc._decorator;

import CommonFullScreenTitleNoBg from './CommonFullScreenTitleNoBg'

@ccclass
export default class CommonFullScreenActivityTitle extends cc.Component {

   @property({
       type: CommonFullScreenTitleNoBg,
       visible: true
   })
   _fileNode_1: CommonFullScreenTitleNoBg = null;

   setTitle(title:string){
       this._fileNode_1._textTitle.string = title;
   }
}
