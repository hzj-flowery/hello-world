import { HeroConst } from "../../../const/HeroConst";
import { Lang } from "../../../lang/Lang";
import PopupBase from "../../../ui/PopupBase";
import { HeroDataHelper } from "../../../utils/data/HeroDataHelper";
import { clone2 } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import HeroDetailAttrModule from "../heroDetail/HeroDetailAttrModule";
import HeroDetailTalentModule from "../heroDetail/HeroDetailTalentModule";

const {ccclass, property} = cc._decorator;
@ccclass
export default class PopupHeroGoldTrainDetail extends PopupBase {

   @property({
       type: cc.Label,
       visible: true
   })
   _textName1: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName2: cc.Label = null;

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listView: cc.ScrollView = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _buttonClose: cc.Button = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textTitle: cc.Label = null;

   private _unitData:any;

   protected preloadResList = [
       {path:Path.getPrefab("HeroDetailAttrModule","heroDetail"),type:cc.Prefab},
       {path:Path.getPrefab("HeroDetailTalentModule","heroDetail"),type:cc.Prefab}
   ]

   setInitData(unitData) {
    this._unitData = unitData;
}
onCreate() {
    this._buttonClose.node.on(cc.Node.EventType.TOUCH_END,this._onButtonClose,this);
    this._textTitle.string = (Lang.get('gold_limit_title'));
}
onEnter() {
    var baseId = this._unitData.getBase_id();
    var heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId);
    var goldLevel = this._unitData.getRank_lv();
    var name1 = heroParam.name;
    var afterLevel = goldLevel;
    if (goldLevel < HeroConst.HERO_GOLD_MAX_RANK) {
        afterLevel = goldLevel + 1;
    }
    var name2 = heroParam.name + (' ' + (Lang.get('goldenhero_train_text') + afterLevel));
    goldLevel = (goldLevel >= HeroConst.HERO_GOLD_MAX_RANK) ? 0 : goldLevel;
    if (goldLevel > 0) {
        name1 = name1 + (' ' + (Lang.get('goldenhero_train_text') + goldLevel));
    }
    this._textName1.string = (name1);
    this._textName2.string = (name2);
    this._textName1.node.color = (heroParam.icon_color);
    UIHelper.enableOutline(this._textName1,heroParam.icon_color_outline, 2);
    this._textName2.node.color = (heroParam.icon_color);
    UIHelper.enableOutline(this._textName2,heroParam.icon_color_outline, 2);
    this._updateList();
}
onExit() {
}
_updateList() {
    this._listView.content.getChildByName("left").removeAllChildren();
    this._listView.content.getChildByName("right").removeAllChildren();
    this._p1();
    this._p2();
    this._listView.scrollToTop();
    this._listView.content.getChildByName("left").on(cc.Node.EventType.SIZE_CHANGED,this.updateContent,this);
    this._listView.content.getChildByName("right").on(cc.Node.EventType.SIZE_CHANGED,this.updateContent,this);
}
_getNextUnitData(unitData) {
    var unitData2 = clone2(unitData);
    if (unitData.getRank_lv() < HeroConst.HERO_GOLD_MAX_RANK) {
        unitData2.setRank_lv(unitData.getRank_lv() + 1);
    }
    return unitData2;
}

_p1():void{
    var unitData = clone2(this._unitData);
    if (unitData.getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK) {
        unitData.setRank_lv(0);
    }
    var attrModule:HeroDetailAttrModule = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroDetailAttrModule","heroDetail"))) as cc.Node).getComponent(HeroDetailAttrModule);
    this._listView.content.getChildByName("left").addChild(attrModule.node);
    attrModule.setInitData(unitData,null,true);
    attrModule.cellAtIndex(0);
    var attr = HeroDataHelper.getBreakAttr(unitData);
    var param = { heroUnitData: unitData };
    var attrInfo = HeroDataHelper.getTotalBaseAttr(param);
    attrModule.showAttrBottom(attr);
    attrModule.reUpdateAttr(attrInfo);
    attrModule.node.setAnchorPoint(cc.v2(0, 0));
    attrModule.node.x = (7);
    
    var talentModule:HeroDetailTalentModule = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroDetailTalentModule","heroDetail"))) as cc.Node).getComponent(HeroDetailTalentModule)
    talentModule.setInitData(unitData, null, null, true, true);
    talentModule.node.addComponent(cc.Layout);
    talentModule.sectionView().setContentSize(talentModule.sectionView().width,0);
    // talentModule.node.setAnchorPoint(cc.v2(0, 0));
    talentModule.node.x = (7);
    this._listView.content.getChildByName("left").addChild(talentModule.node);
    
    this._curTalent1 = talentModule.numberOfCell()-1;
    this._curHandle1 = handler(this,this.updateTalent1,talentModule,talentModule.numberOfCell());
    this.schedule(this._curHandle1,0.1);
}
private _curHandle1:any;
private _curHandle2:any;
private _curTalent1:number = 0;
private _curTalent2:number = 0;
private updateTalent1(data):void{
    var talentModule:HeroDetailTalentModule = data[0];
    var total:number = data[1];
    if(this._curTalent1<0)
    {
        this.unschedule(this._curHandle1);
        this._curHandle1 = null;
        return;
    }
    var node = talentModule.cellAtIndex(this._curTalent1);
    talentModule.sectionView().addChild(node);
    var content = talentModule.sectionView();
    var childCount = content.children.length;
    var lastPosY = 40;
    if(childCount>1)
    {
       lastPosY = content.children[childCount-2].y+content.children[childCount-2].height;
    }
    node.y = lastPosY;
    var size = content.getContentSize();
    //talentModule.sectionView().height += node.height;
    content.setContentSize(size.width,size.height+node.height);
    talentModule.node.setContentSize(size.width,size.height+node.height);
    this._curTalent1--;
}
private updateLastSectionY() {
    let content = this._listView.content;
    let count = content.childrenCount;
    let children = content.children;
    let section = children[count - 1];

    let lastHeight = 0;
    for (let i = 0; i < count - 1; i++) {
        lastHeight += children[i].height;
    }

    section.y = -lastHeight - section.height * (1 - section.anchorY);
    this._listView.content.height = lastHeight + section.height + 0;
}
private updateTalent2(data):void{
    var talentModule:HeroDetailTalentModule = data[0];
    var total:number = data[1];
    if(this._curTalent2<0)
    {
        this.unschedule(this._curHandle2);
        this._curHandle2 = null;
        return;
    }
    var node = talentModule.cellAtIndex(this._curTalent2);
    talentModule.sectionView().addChild(node);
    var content = talentModule.sectionView();
    var childCount = content.children.length;
    var lastPosY = 40;
    if(childCount>1)
    {
       lastPosY = content.children[childCount-2].y+content.children[childCount-2].height;
    }
    node.y = lastPosY;
    var size = content.getContentSize();
    //talentModule.sectionView().height += node.height;
    talentModule.sectionView().setContentSize(size.width,size.height+node.height);
    talentModule.node.setContentSize(size.width,size.height+node.height);
    this._curTalent2--;
}
_p2():void{

    var unitData2 = this._getNextUnitData(this._unitData);
    var attrModule1:HeroDetailAttrModule = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroDetailAttrModule","heroDetail"))) as cc.Node).getComponent(HeroDetailAttrModule);
    this._listView.content.getChildByName("right").addChild(attrModule1.node);
    attrModule1.setInitData(unitData2,null,true);
    attrModule1.cellAtIndex(0);
    var attr1 = HeroDataHelper.getBreakAttr(unitData2);
    var param1 = { heroUnitData: unitData2 };
    var attrInfo1 = HeroDataHelper.getTotalBaseAttr(param1);
    attrModule1.showAttrBottom(attr1);
    attrModule1.reUpdateAttr(attrInfo1);
    attrModule1.node.setAnchorPoint(cc.v2(0, 0));

    var unitData2 = this._getNextUnitData(this._unitData);
    var talentModule1:HeroDetailTalentModule = (cc.instantiate(cc.resources.get(Path.getPrefab("HeroDetailTalentModule","heroDetail"))) as cc.Node).getComponent(HeroDetailTalentModule)
    talentModule1.setInitData(unitData2, null, null, true);
    talentModule1.node.addComponent(cc.Layout);
    talentModule1.sectionView().setContentSize(talentModule1.sectionView().width,0);
    // talentModule1.node.setAnchorPoint(cc.v2(0, 0));
    this._listView.content.getChildByName("right").addChild(talentModule1.node);
    this._curTalent2 = talentModule1.numberOfCell()-1;
    this._curHandle2 = handler(this,this.updateTalent2,talentModule1,talentModule1.numberOfCell());
    this.schedule(this._curHandle2,0.1);

}

updateContent():void{
    var left  = this._listView.content.getChildByName("left").getContentSize();
    var right  = this._listView.content.getChildByName("right").getContentSize();
    var p = left.height>right.height?left.height:right.height;
    this._listView.content.height = p+100;
    this._listView.scrollToTop();
}

_onButtonClose() {
    this.close();
}

}