const {ccclass, property} = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'

@ccclass
export default class PopupInspireView extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: CommonNormalLargePop,
       visible: true
   })
   _commonBk: CommonNormalLargePop = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _scrollView: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInspireAtk: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeInspireDef: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtCurAtk: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtNextAtk: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtCurDef: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtNextDef: cc.Label = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnInspire2: cc.Button = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _btnInspire1: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgAtkConsume: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtAtkConsume: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtAtkEnough: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgDefConsume: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtDefConsume: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _txtDefEnough: cc.Label = null;

}