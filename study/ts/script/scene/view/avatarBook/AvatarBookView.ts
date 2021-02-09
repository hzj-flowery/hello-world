const {ccclass, property} = cc._decorator;

import { AudioConst } from '../../../const/AudioConst';
import { FunctionConst } from '../../../const/FunctionConst';
import { SignalConst } from '../../../const/SignalConst';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_AudioManager, G_EffectGfxMgr, G_Prompt, G_SignalManager, G_UserData } from '../../../init';
import { Lang } from '../../../lang/Lang';
import CommonDlgBackground from '../../../ui/component/CommonDlgBackground';
import CommonFullScreenListView from '../../../ui/component/CommonFullScreenListView';
import CommonHeroIcon from '../../../ui/component/CommonHeroIcon';
import CommonListItem from '../../../ui/component/CommonListItem';
import CommonListView from '../../../ui/component/CommonListView';
import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical';
import CommonTopbarBase from '../../../ui/component/CommonTopbarBase';
import { AttrDataHelper } from '../../../utils/data/AttrDataHelper';
import { AvatarDataHelper } from '../../../utils/data/AvatarDataHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { handler } from '../../../utils/handler';
import { Path } from '../../../utils/Path';
import { TextHelper } from '../../../utils/TextHelper';
import UIHelper from '../../../utils/UIHelper';
import ViewBase from '../../ViewBase';




@ccclass
export default class AvatarBookView extends ViewBase {

   @property({
       type: CommonDlgBackground,
       visible: true
   })
   _commonBackground: CommonDlgBackground = null;

   @property({
       type: CommonFullScreenListView,
       visible: true
   })
   _fileNodeBg: CommonFullScreenListView = null;

   @property({
       type: CommonTabGroupVertical,
       visible: true
   })
   _nodeTabRoot: CommonTabGroupVertical = null;

   @property({
       type: CommonTopbarBase,
       visible: true
   })
   _topbarBase: CommonTopbarBase = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeEffect: cc.Node = null;

    @property({
        type: CommonListView,
        visible: true
    })
    _tabListView: CommonListView = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _avatarBookCell: cc.Node = null;

   


   private _selectTabIndex:number = 0;
   private _signalAvatarPhotoActiveSuccess:any;
   private _allBookIds:any;
   private _curBookIds:any;
   private _recordAttr:any;
   private _commonHeroIcon:any;
setInitData(index) {
    this._selectTabIndex = index || 0;
}
onCreate() {
    this.setSceneSize();
    this._commonHeroIcon = cc.resources.get(Path.getCommonPrefab("CommonHeroIcon"));
   
}
onEnter() {
    this._initData();
    this._initView();
    this._signalAvatarPhotoActiveSuccess = G_SignalManager.add(SignalConst.EVENT_AVATAR_PHOTO_ACTIVE_SUCCESS, handler(this, this._avatarPhotoActiveSuccess));
    this._nodeTabRoot.setTabIndex(this._selectTabIndex);
    this._updateData();
    this._updateView();
    this._refreshRedPoint();
}
onExit() {
    this._signalAvatarPhotoActiveSuccess.remove();
    this._signalAvatarPhotoActiveSuccess = null;
}
_initData() {
    this._allBookIds = AvatarDataHelper.getAllBookIds();
    this._curBookIds = {};
    this._recordAttr = G_UserData.getAttr().createRecordData(FunctionConst.FUNC_TEAM_SLOT1);
}
_initView() {
    this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
    this._topbarBase.setImageTitle('txt_sys_com_tujian');
    this._fileNodeBg.setTitle(Lang.get('avatar_book_title'));
    this._fileNodeBg.showCount(true);
    this._fileNodeBg.showCountPrefix(false);
    this._initTabGroup();
}
_initTabGroup() {
    
    var tabNameList = [];
    for (var i = 1; i <= 4; i++) {
        tabNameList.push(Lang.get('avatar_book_country_tab_' + i));
    }
    var param = {
        callback: handler(this, this._onTabSelect),
        textList: tabNameList
    };
    this._nodeTabRoot.recreateTabs(param);
}
_onTabSelect(index, sender) {
    if (index == this._selectTabIndex) {
        return;
    }
    this._selectTabIndex = index;
    this._updateCurBookIds();
    this._updateView();
}
_updateData() {
    this._updateAttrData();
    this._updateCurBookIds();
}
_updateCurBookIds() {
    var bookIds = this._allBookIds[this._selectTabIndex+1] || {};
    this._curBookIds = AvatarDataHelper.getBookIdsBySort(bookIds);
}
_updateAttrData() {
    var heroId = G_UserData.getTeam().getHeroIdWithPos(1);
    var unitData = G_UserData.getHero().getUnitDataWithId(heroId);
    var param = { heroUnitData: unitData };
    var curAttr = UserDataHelper.getTotalAttr(param);
    this._recordAttr.updateData(curAttr);
    G_UserData.getAttr().recordPower();
}
private _updateCount:number = 0;
_updateView() {
    var count = Math.ceil(this._curBookIds.length / 3);
    var scrollViewParam = {
        template: this._avatarBookCell,
    };
    this._updateCount++;
    if(this._updateCount<=1)
    {
        this._tabListView.spawnCount = 3;
        this._tabListView.init(scrollViewParam.template,handler(this, this._onItemUpdate),handler(this, this._onItemTouch));
        this._tabListView.setData(count);
    }
    else
    {
        this._tabListView.setData(count,0,true,true);
    }
    
    this._updateProcess();
}
_updateProcess() {
    var count = 0;
    for (var i in this._curBookIds) {
        var bookId = this._curBookIds[i];
        var isActive = G_UserData.getAvatarPhoto().isActiveWithId(bookId);
        if (isActive) {
            count = count + 1;
        }
    }
    var total = this._curBookIds.length;
    this._fileNodeBg.setCount(Lang.get('avatar_book_process_' + (this._selectTabIndex+1), {
        count: count,
        total: total
    }));
}
_onItemUpdate(item:CommonListItem, index1:number) {
    var index = index1 * 3;
    var data:Array<any> = [];
    if(this._curBookIds[index])
    data.push(this._curBookIds[index])
    if(this._curBookIds[index+1])
    data.push(this._curBookIds[index+1])
    if(this._curBookIds[index+2])
    data.push(this._curBookIds[index+2])
    item.updateItem(index1,data.length>0?data:null,0);
}
_onItemSelected(item, index) {
}
_onItemTouch(index, t) {
    var index = index * 3 + t;
    var bookId = this._curBookIds[index-1];
    G_UserData.getAvatarPhoto().c2sActiveAvatarPhoto(bookId);
}
_avatarPhotoActiveSuccess(eventName, photoId) {
    this._playEffect(photoId);
    this._updateData();
    this._updateView();
    this._refreshRedPoint();
}
_playPrompt() {
    var summary = [];
    var param = {
        content: Lang.get('summary_avatar_book_active_success'),
        startPosition: { x: 0 }
    };
    summary.push(param);
    this._addBaseAttrPromptSummary(summary);
    G_Prompt.showSummary(summary);
    G_Prompt.playTotalPowerSummary();
}
_addBaseAttrPromptSummary(summary) {
    var attr = this._recordAttr.getAttr();
    var desInfo = TextHelper.getAttrInfoBySort(attr);
    for (var i in desInfo) {
        var info = desInfo[i];
        var attrId = info.id;
        var diffValue = this._recordAttr.getDiffValue(attrId);
        if (diffValue != 0) {
            var param = {
                content: AttrDataHelper.getPromptContent(attrId, diffValue),
                anchorPoint: new cc.Vec2(0, 0.5),
                startPosition: { x: -60 }
            };
            summary.push(param);
        }
    }
    return summary;
}
_refreshRedPoint() {
    for (var i = 1; i <= 4; i++) {
        var bookIds = this._allBookIds[i] || {};
        var redPointShow = AvatarDataHelper.isCanActiveInBookIds(bookIds);
        this._nodeTabRoot.setRedPointByTabIndex(i, redPointShow);
    }
}
_playEffect(bookId) {
    var effectFunction = function (effect) {
        if (effect == 'heidi') {
            return  UIHelper.createLayerColor(cc.color(0, 0, 0, 255 * 0.8));
        }
        return this._createActionNode(effect, bookId);
    }.bind(this)
    var eventFunction = function (event) {
        if (event == 'piaozi') {
            this._playPrompt();
        } else if (event == 'finish') {
        }
    }.bind(this);
    var effect = G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, 'moving_yuanfen_2p', effectFunction, eventFunction, true);
    G_AudioManager.playSoundWithId(AudioConst.SOUND_HERO_KARMA);
}
_createActionNode(effect:string, bookId) {
    var stc = effect.indexOf("moving_yuanfen_icon_");
    var edc = stc + ("moving_yuanfen_icon_").length;
    if (stc>=0) {
        var index = effect.substring(edc);
        var node = this._createIconNode(bookId,parseInt(index));
        return node;
    }
    return new cc.Node();
}
_createIconNode(bookId, index) {
    var effectFunction = function (effect) {
        if (effect == 'icon_2') {
            var icon = (cc.instantiate(this._commonHeroIcon) as cc.Node).getComponent(CommonHeroIcon);
            var showConfig = AvatarDataHelper.getAvatarShowConfig(bookId);
            var avatarId = showConfig['avatar_id' + index];
            var avatarConfig = AvatarDataHelper.getAvatarConfig(avatarId);
            var heroId = avatarConfig.hero_id;
            this.scheduleOnce(()=>{
                icon.node.scale = 0.8;
            })
            icon.updateUI(heroId);
            return icon.node;
        }
        return new cc.Node();
    }.bind(this)
    function eventFunction(event) {
        if (event == 'finish') {
        }
    }
    var node = new cc.Node();
    var resName = 'moving_yuanfen_icon_' + index;
    var effect = G_EffectGfxMgr.createPlayMovingGfx(node, resName, effectFunction, eventFunction, false);
    return node;
}


}