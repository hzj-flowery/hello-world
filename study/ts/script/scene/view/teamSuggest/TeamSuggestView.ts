const {ccclass, property} = cc._decorator;

import { ConfigNameConst } from '../../../const/ConfigNameConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_ConfigLoader } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreen from '../../../ui/component/CommonFullScreen';
import CommonPageViewIndicator2 from '../../../ui/component/CommonPageViewIndicator2';
import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import CommonUI from '../../../ui/component/CommonUI';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { table } from '../../../utils/table';
import ViewBase from '../../ViewBase';
import TeamSuggestContentCell from './TeamSuggestContentCell';
import TeamSuggestPageViewItem from './TeamSuggestPageViewItem';








@ccclass
export default class TeamSuggestView extends ViewBase {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreen,
       visible: true
   })
   _fileNodeBg: CommonFullScreen = null;

   @property({
       type: CommonTabGroupVertical,
       visible: true
   })
   _nodeTabRoot: CommonTabGroupVertical = null;

   @property({
       type: cc.PageView,
       visible: true
   })
   _pageView: cc.PageView = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _leftBtn: cc.Button = null;

   @property({
       type: cc.Button,
       visible: true
   })
   _rightBtn: cc.Button = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _country: cc.Sprite = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _title: cc.Label = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _title2: cc.Label = null;

   @property({
       type: cc.ScrollView,
       visible: true
   })
   _listView: cc.ScrollView = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _titleName: cc.Label = null;

   @property({
       type: CommonPageViewIndicator2,
       visible: true
   })
   _commonPageViewIndicator: CommonPageViewIndicator2 = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

   private static CountryImage = {
    [1]: 'img_com_camp04',
    [2]: 'img_com_camp01',
    [3]: 'img_com_camp03',
    [4]: 'img_com_camp02'
};

private _heroProperty:any;
private _tabNames:Array<string>;
private _curSelectTabIndex:number;
private _curPageIndex:number;//下标从0走
private _allDatas:any;
private _curTabData:Array<any>;
private _curData:any;

protected preloadResList = [
    {path:Path.getPrefab("TeamSuggestPageViewItem","teamSuggest"),type:cc.Prefab},
    {path:Path.getPrefab("TeamSuggestContentCell","teamSuggest"),type:cc.Prefab}
]

onCreate() {
    this.setSceneSize();
    this._initData();
    this._topbarBase.setImageTitle('txt_sys_com_zhengrongtuijian');
    this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    this._tabNames = [
        Lang.get('lang_team_suggest_tab1_name'),
        Lang.get('lang_team_suggest_tab2_name'),
        Lang.get('lang_team_suggest_tab3_name'),
        Lang.get('lang_team_suggest_tab4_name')
    ];
    this._curSelectTabIndex = 0;
    this._fileNodeBg.setTitle(this._tabNames[this._curSelectTabIndex]);
    // this._pageView.setSwallowTouches(false);
    // this._pageView.setScrollDuration(0.3);
    var param = {
        callback: handler(this, this._onTabSelect),
        textList: this._tabNames
    };
    this._nodeTabRoot.recreateTabs(param);
    this._nodeTabRoot.setTabIndex(0);
   
}
onEnter() {
    this._updateTabContent();
}
onExit() {
}
private onLeftBtn() {
    if (this._curPageIndex >= 1) {
        this._curPageIndex--;
        this._commonPageViewIndicator.setPageViewIndex(this._curPageIndex);
    }
    //this.updatePageViewItemActive();
}
private updatePageViewItemActive():void{
    var children = this._pageView.getPages();
    var curIndex:number = this._pageView.getCurrentPageIndex();
    for(var j =0;j<children.length;j++)
    {
        if(curIndex!=j)
        children[j].active = false;
        else
        children[j].active = true;
    }
}
private onRightBtn() {
    if (this._curPageIndex < this._curTabData.length) {
        this._curPageIndex++;
        this._commonPageViewIndicator.setPageViewIndex(this._curPageIndex);
    }
    //this.updatePageViewItemActive();
}
_initData() {
    var TeamRecommend = G_ConfigLoader.getConfig(ConfigNameConst.TEAM_RECOMMEND);
    var indexs = TeamRecommend.index();
    var datas = {};
    for (var j in indexs) {
        var v = indexs[j];
        var config = TeamRecommend.indexOf(v);
        if (!datas[config.country]) {
            datas[config.country] = [];
        }
        table.insert(datas[config.country], config);
    }
    this._allDatas = datas;
}
_onTabSelect(index, sender) {
    if (this._curSelectTabIndex == index) {
        return;
    }
    this._curSelectTabIndex = index;
    this._fileNodeBg.setTitle(this._tabNames[this._curSelectTabIndex]);
    this._updateTabContent();
}
private onPageViewEvent(sender, event) {
    if (event == cc.PageView.EventType.PAGE_TURNING) {
        this._curPageIndex = this._pageView.getCurrentPageIndex();
        this._curData = this._curTabData[this._curPageIndex];
        this._updatePanelInfo();
        this.updatePageViewItemActive();
    }
}
_updatePanelInfo() {
    if (!this._curData) {
        return;
    }
    this._title.string = (this._curData.name);
    this._title2.string = (this._curData.name);
    if (this._curPageIndex == 0) {
        this._leftBtn.node.active = (false);
    } else {
        this._leftBtn.node.active = (true);
    }
    if (this._curPageIndex == this._curTabData.length-1) {
        this._rightBtn.node.active = (false);
    } else {
        this._rightBtn.node.active = (true);
    }
    this._listView.content.height = 0;
    this._listView.content.removeAllChildren();
    this.scheduleOnce(this._waitUpdatePanelInfo.bind(this,3))
    
}

_waitUpdatePanelInfo(i):void{
    if(i<1)
    {
        this._listView.scrollToTop();
        this._commonPageViewIndicator.setCurrentPageIndex(this._curPageIndex)
        return;
    }
    if (this._curData['title' + i] && this._curData['title' + i] != '') {
        var cell = (cc.instantiate(cc.resources.get(Path.getPrefab("TeamSuggestContentCell","teamSuggest"))) as cc.Node).getComponent(TeamSuggestContentCell) as TeamSuggestContentCell;
        this._listView.content.addChild(cell.node);
        cell.updateUI(this._curData['title' + i], this._curData['description' + i]);
    }
    var p = i - 1;
    this.scheduleOnce(this._waitUpdatePanelInfo.bind(this,p))
}
_updateTabContent() {
    this._curTabData = this._allDatas[this._curSelectTabIndex+1] || {};
    this._curPageIndex = 0;
    this._curData = this._curTabData[this._curPageIndex];
    this._pageView.removeAllPages();
    for (var k in this._curTabData) {
        var v = this._curTabData[k];
        var page = (cc.instantiate(cc.resources.get(Path.getPrefab("TeamSuggestPageViewItem","teamSuggest"))) as cc.Node).getComponent(TeamSuggestPageViewItem);
        this._pageView.addPage(page.node);
        page.updateUI(v);
    }
    this._country.node.addComponent(CommonUI).loadTexture(Path.getTextSignet(TeamSuggestView.CountryImage[this._curData.country]));
    this._commonPageViewIndicator.refreshPageData(this._pageView, this._curTabData.length, 0, 20, handler(this, this.onPageViewEvent));
    this._updatePanelInfo();

    this.updatePageViewItemActive();
}



}