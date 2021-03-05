const {ccclass, property} = cc._decorator;

import CommonTopbarBase from '../../../ui/component/CommonTopbarBase'

import CommonTalkNode1 from '../../../ui/component/CommonTalkNode1'

import CommonHeroPower from '../../../ui/component/CommonHeroPower'

import CommonTabGroupVertical from '../../../ui/component/CommonTabGroupVertical'

import CommonFullScreen from '../../../ui/component/CommonFullScreen'

import CommonDlgBackground from '../../../ui/component/CommonDlgBackground'
import ViewBase from '../../ViewBase';
import { handler } from '../../../utils/handler';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import { Lang } from '../../../lang/Lang';
import { TopBarStyleConst } from '../../../const/TopBarStyleConst';
import { G_UserData } from '../../../init';
import { StrongerHelper } from './StrongerHelper';
import WorldBossAvatar from '../worldBoss/WorldBossAvatar';

@ccclass
export default class StrongerView extends ViewBase {

    @property({
        type: CommonDlgBackground,
        visible: true
    })
    _commonBackground: CommonDlgBackground = null;

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _commonFullScreen: CommonFullScreen = null;

    @property({
        type: CommonTabGroupVertical,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupVertical = null;

    @property({
        type: CommonHeroPower,
        visible: true
    })
    _commonPower: CommonHeroPower = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: CommonTalkNode1,
        visible: true
    })
    _commonTalk: CommonTalkNode1 = null;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    })
    _listViewTab1: CommonCustomListViewEx = null;

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;

    @property(cc.Prefab)
    StrongerItemCell:cc.Prefab = null;

    @property(cc.Prefab)
    WorldBossAvatar:cc.Prefab = null;
    
    _selectTabIndex: number = 0;
    _initTabIndex: number = 1;
    _fullScreenTitles: string[];
    _dataList: any;


    ctor(selectTab?) {
        this._selectTabIndex = 0;
        this._initTabIndex = selectTab || 1;
    }
    onCreate() {
        var scrollViewParam = {
            template: this.StrongerItemCell,
            updateFunc: handler(this, this._onItemUpdate),
            selectFunc: handler(this, this._onItemSelected),
            touchFunc: handler(this, this._onItemTouch)
        };
        this.setSceneSize();
        this._listViewTab1.setTemplate(this.StrongerItemCell);
        this._listViewTab1.setCallback(scrollViewParam.updateFunc, scrollViewParam.selectFunc, scrollViewParam.touchFunc);
        this._fullScreenTitles = [
            Lang.get('lang_stronger_tab1'),
            Lang.get('lang_stronger_tab2')
        ];
        var param = {
            containerStyle: 1,
            callback: handler(this, this._onTabSelect),
            textList: this._fullScreenTitles
        };
        this._topbarBase.setImageTitle('txt_sys_com_bianqiang');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_COMMON);
        this._nodeTabRoot.recreateTabs(param);

        this.create();
    }
    _onTabSelect(index, sender) {
        if (this._selectTabIndex == index+1) {
            return;
        }
        this._commonFullScreen.setTitle(this._fullScreenTitles[index]);
        this._selectTabIndex = index+1;
        this._listViewTab1.scrollToTop(0);
        this._updateListView(this._selectTabIndex);
    }
    _updateListView(tabIndex) {
        tabIndex = tabIndex || 1;
        this._commonPower.updateUI(G_UserData.getBase().getPower());
        if (tabIndex == 1) {
            this._dataList = StrongerHelper.getRecommendUpgradeList();
        } else {
            this._dataList = StrongerHelper.getFuncLevelList();
        }
        //this._tabListView.updateListView(tabIndex, this._dataList.length);
        this._listViewTab1.resize(this._dataList.length);
    }

    onEnter() {

    }

    create() {
        this.setSceneSize();
        if (this._selectTabIndex > 0) {
            this._nodeTabRoot.setTabIndex(this._selectTabIndex-1);
            this._updateListView(this._selectTabIndex);
        } else {
            this._nodeTabRoot.setTabIndex(this._initTabIndex-1);
        }
        this._nodeAvatar.removeAllChildren();
        var avatarNode = cc.instantiate(this.WorldBossAvatar).getComponent(WorldBossAvatar);
        var avatarData = {
            titleId: 0,
            baseId: G_UserData.getBase().getPlayerBaseId(),
            name: G_UserData.getBase().getName(),
            officialLevel: G_UserData.getBase().getOfficer_level(),
            userId: G_UserData.getBase().getId(),
            playerInfo: G_UserData.getBase().getPlayerShowInfo()
        };
        avatarNode.node.name = ('avatar');
        this._nodeAvatar.addChild(avatarNode.node);
        avatarNode.updatePlayerInfo(avatarData);
        avatarNode.node.setScale(1.2);

        var talkList = StrongerHelper.getBubbleList();
        this._commonTalk.showLoopBubbleList(talkList);
        this._commonTalk.setMaxWidth(224);
    }
    onExit() {
    }
    _onItemUpdate(item, index) {
        var data = this._dataList[index];
        if (data) {
            item.updateUI(index+1, data, this._selectTabIndex);
        }
    }
    _onItemSelected(item, index) {
    }
    _onItemTouch(index, params) {
    }

}
