const {ccclass, property} = cc._decorator;

import CommonActivityTopBarItem from './CommonActivityTopBarItem';

@ccclass
export default class CommonActivityTopbarItemList extends cc.Component {

   @property({
       type: CommonActivityTopBarItem,
       visible: true
   })
   _resNode4: CommonActivityTopBarItem = null;

   @property({
       type: CommonActivityTopBarItem,
       visible: true
   })
   _resNode3: CommonActivityTopBarItem = null;

   @property({
       type: CommonActivityTopBarItem,
       visible: true
   })
   _resNode2: CommonActivityTopBarItem = null;

   @property({
       type: CommonActivityTopBarItem,
       visible: true
   })
   _resNode1: CommonActivityTopBarItem = null;

}