import { CakeActivityConst } from "../../../const/CakeActivityConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonUI from "../../../ui/component/CommonUI";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import CakeGivePushNode from "./CakeGivePushNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CakeActivityInfoList extends cc.Component {
    public static NOTICE_BG = {
        [CakeActivityConst.NOTICE_TYPE_GET_FRUIT]: 'img_special_02',
        [CakeActivityConst.NOTICE_TYPE_LEVEL_UP]: 'img_special_01'
    };
    _target: cc.Node;
    _doAddMaterical: any;
    _bulletDatas: any[];
    _bulletNodes:CakeGivePushNode[];
    _noticeIndex: number;
    _listTouching: boolean;
    _listScrolling: boolean;
    _panelBullet: cc.Node;

    @property({
        type: cc.ScrollView,
        visible: true
    })
    _listView: cc.ScrollView = null;

    @property({
        type: CakeGivePushNode,
        visible: true
    })
    _panelBullet1: CakeGivePushNode = null;

    @property({
        type: CakeGivePushNode,
        visible: true
    })
    _panelBullet2: CakeGivePushNode = null;

    @property({
        type: CakeGivePushNode,
        visible: true
    })
    _panelBullet3: CakeGivePushNode = null;

    @property({
        type: CakeGivePushNode,
        visible: true
    })
    _panelBullet4: CakeGivePushNode = null;

    @property({
        type: CakeGivePushNode,
        visible: true
    })
    _panelBullet5: CakeGivePushNode = null;



    ctor(doAddMaterical) {
        this._doAddMaterical = doAddMaterical;
        this._bulletDatas = [];
        this._bulletNodes = [];
        this._noticeIndex = 0;
        this._listTouching = false;
        this._listScrolling = false;

        this._panelBullet1.initData(1, handler(this, this._onBulletReset), handler(this, this._onDoGive));
        this._panelBullet2.initData(2, handler(this, this._onBulletReset), handler(this, this._onDoGive));
        this._panelBullet3.initData(3, handler(this, this._onBulletReset), handler(this, this._onDoGive));
        this._panelBullet4.initData(4, handler(this, this._onBulletReset), handler(this, this._onDoGive));
        this._panelBullet5.initData(5, handler(this, this._onBulletReset), handler(this, this._onDoGive));

        for (var i = 1; i <= 5; i++) {
            this._bulletNodes.push(this['_panelBullet' + i]);
        }
    }
    onExit() {
        for (var i = 1; i <= 5; i++) {
            this['_panelBullet' + i].onExit();
        }
        this._stopAddInfo();
        this.unschedule(this.updateQueue.bind(this))
    }

    private curHeight: number = 0;
    initInfoList() {
        G_UserData.getCakeActivity().removeNoticeBeyond();
        var noticeDatas = G_UserData.getCakeActivity().getNoticeDatas();
        this._listView.content.height = 400;
        this._listView.content.removeAllChildren();
        this._noticeIndex = -1;
        for (var i in noticeDatas) {
            var data = noticeDatas[i];
            this._noticeIndex = this._noticeIndex + 1;
            this.addNotice(data);
        }
        this._listView.scrollToBottom();
        this._startAddInfo();
        this.schedule(this.updateQueue.bind(this),0.1)
    }
    _startAddInfo() {
        this._stopAddInfo();
        this.schedule(this._updateAddInfo, 0.1);
    }
    _stopAddInfo() {
        this.unschedule(this._updateAddInfo);
    }
    _updateAddInfo() {
        var nextIndex = this._noticeIndex + 1;
        var noticeData = G_UserData.getCakeActivity().getNoticeDataWithIndex(nextIndex);
        if (noticeData) {
            let a = parseInt(noticeData.getContentDesWithKey('itemnum'));
            if (a <= 0) {
                return;
            }
            this._noticeIndex = nextIndex;
            this.addNotice(noticeData);
            if (this._listTouching == false && this._listScrolling == false) {
                this._listView.scrollToBottom();
            }
        }
    }
    addNotice(data) {
        // this.run(data);
        this._queue.push(data);
    }
    private run(data):void{
        var notice = this._createNotice(data);
        this._listView.content.addChild(notice)
        let height_1 = notice.getContentSize().height;
        notice.x = 20;
        notice.y = -1 * (height_1 + this.curHeight);
        this.curHeight = Math.abs(notice.y);
        if (Math.abs(notice.y) > 400) {
            this._listView.content.height = Math.abs(notice.y);
        }
        if (this._listView.content.childrenCount > CakeActivityConst.INFO_LIST_MAX_COUNT) {
            let height_2 = this._listView.content.children[0].height;
            this._listView.content.children[0].destroy();
            for (let i = 0; i < this._listView.content.children.length; i++) {
                this._listView.content.children[i].y += height_2;
            }
            this.curHeight -= height_2;
            this._listView.content.height -= height_2;
        }
    }
    private _queue:Array<any> = [];
    private updateQueue():void{
         let task = this._queue.shift();
         if(task)
         {
             //说明有任务
             this.run(task);
             if (this._listTouching == false && this._listScrolling == false) {
                this._listView.scrollToBottom();
            }
         }
    }
    _createNotice(data) {
        let Allsp = new cc.Node();
        Allsp.setAnchorPoint(0, 0);
        var noticeId = data.getNotice_id();
        var formatStr = null;
        var params = null;
        var serverName = data.getContentDesWithKey('sname');
        if (noticeId == CakeActivityConst.NOTICE_TYPE_COMMON) {
            var itemId = parseInt(data.getContentDesWithKey('itemid1'));
            var itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId);
            var official = parseInt(data.getContentDesWithKey('uol'));
            formatStr = Lang.get('cake_activity_notice_des_1', {
                guildName1: serverName + ('' + data.getContentDesWithKey('sgname')),
                userName: data.getContentDesWithKey('uname'),
                guildName2: data.getContentDesWithKey('tgname'),
                itemName: itemParam.name,
                count: data.getContentDesWithKey('itemnum')
            });
            params = {
                defaultColor: Colors.CLASS_WHITE,
                defaultSize: 18,
                other: [
                    {},
                    { color: Colors.getOfficialColor(official) },
                    {},
                    { color: itemParam.icon_color }
                ]
            };
        } else if (noticeId == CakeActivityConst.NOTICE_TYPE_LEVEL_UP) {
            formatStr = Lang.get('cake_activity_notice_des_2', {
                guildName: serverName + ('' + data.getContentDesWithKey('sgname')),
                level: data.getContentDesWithKey('clv')
            });
            params = {
                defaultColor: Colors.DARK_BG_THREE,
                defaultSize: 18
            };
        } else if (noticeId == CakeActivityConst.NOTICE_TYPE_GET_FRUIT) {
            var itemId1 = parseInt(data.getContentDesWithKey('itemid1'));
            var itemId2 = parseInt(data.getContentDesWithKey('itemid2'));
            var itemParam1 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId1);
            var itemParam2 = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId2);
            var official = parseInt(data.getContentDesWithKey('uol'));
            formatStr = Lang.get('cake_activity_notice_des_3', {
                name: serverName + ('' + data.getContentDesWithKey('uname')),
                itemName1: itemParam1.name,
                itemName2: itemParam2.name
            });
            params = {
                defaultColor: Colors.DARK_BG_THREE,
                defaultSize: 18,
                other: [
                    { color: Colors.getOfficialColor(official) },
                    { color: itemParam1.icon_color },
                    { color: itemParam2.icon_color }
                ]
            };
        }
        var richText = RichTextExtend.createRichTextByFormatString(formatStr, params);
        richText.node.setAnchorPoint(cc.v2(0, 0));
        richText.node.setPosition(0, 0);
        // richText.ignoreContentAdaptWithSize(false);
        richText.lineHeight = (4) + params.defaultSize;
        richText.maxWidth = 310;
        // richText.formatText();
        var textHeight = richText.node.getContentSize().height + 8;
        // var widgetHeight = textHeight + 8;
        Allsp.setContentSize(cc.size(350, textHeight));
        var bgRes = CakeActivityInfoList.NOTICE_BG[noticeId];
        if (bgRes) {
            // var imageBg = (new cc.Node()).addComponent(cc.Sprite) as cc.Sprite;
            // UIHelper.loadTexture(imageBg, Path.getAnniversaryImg(bgRes));
           
            let imageBgNine =  this.node.getChildByName("_imgNine").getComponent(cc.Sprite);
            let imageBg = cc.instantiate(imageBgNine.node).getComponent(cc.Sprite);
            Allsp.addChild(imageBg.node);
            imageBg.node.active = true;
            imageBg.node.addComponent(CommonUI).loadTexture(Path.getAnniversaryImg(bgRes),function(sf:cc.SpriteFrame){
                sf.insetLeft = 16;
                sf.insetTop = 8;
                sf.insetRight = 16;
                sf.insetBottom = 8;
                
            });
            //cc.resources.get(Path.getAnniversaryImg(bgRes), cc.SpriteFrame);
            imageBg.node.active = true;
            // imageBg.setScale9Enabled(true);
            imageBg.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            imageBg.type == cc.Sprite.Type.SLICED;
            
            // imageBg.setCapInsets(cc.rect(20, 12, 1, 1));
            imageBg.node.setAnchorPoint(cc.v2(0, 0));
            imageBg.node.setContentSize(cc.size(310, richText.node.getContentSize().height));
            imageBg.node.setPosition(cc.v2(0, 0));
            
        }
        // richText.setPosition(cc.v2(20, widgetHeight / 2));
        // widget.addChild(richText);
        // return widget;
        Allsp.addChild(richText.node);
        return Allsp;
    }
    pushBullet (noticeDatas) {
        var formatDatas = this._formatNoticeData(noticeDatas);
        this._pushBulletData(formatDatas);
        this._pushBulletNode();
    }
    _formatNoticeData(noticeDatas) {
        var temp = {};
        for (let i in noticeDatas) {
            var noticeData = noticeDatas[i];
            var uId = noticeData.getContentDesWithKey('uid');
            var itemid1 = noticeData.getContentDesWithKey('itemid1');
            var tgName = noticeData.getContentDesWithKey('tgname');
            var itemNum = noticeData.getContentDesWithKey('itemnum');
            var key = uId + ('_' + (itemid1 + ('_' + tgName)));
            if (temp[key] == null) {
                temp[key] = noticeData;
            } else {
                var num1 = parseInt(temp[key].getContentDesWithKey('itemnum'));
                var num2 = parseInt(itemNum);
                temp[key].setContentDesWithKey('itemnum', ''+(num1 + num2));
            }
        }
        var result = [];
        for (let k in temp) {
            var noticeData = temp[k];
            result.push(noticeData);
        }
        return result;
    }
    _pushBulletData(noticeDatas) {
        for (var i in noticeDatas) {
            var noticeData = noticeDatas[i];
            var exitBullet = this._getExistBullet(noticeData);
            if (exitBullet) {
                exitBullet.addCount(parseInt(noticeData.getContentDesWithKey('itemnum')));
            } else {
                if (noticeData.isFake()) {
                    this._bulletDatas.unshift(noticeData);
                    this._checkBullet();
                } else {
                    this._bulletDatas.push(noticeData);
                }
            }
        }
    }
    _checkBullet() {
        var bullet = null;
        for (let i in this._bulletNodes) {
            var bulletNode = this._bulletNodes[i];
            if (bulletNode.isEmpty()) {
                bullet = bulletNode;
                break;
            }
        }
        if (bullet == null) {
            for (let i in this._bulletNodes) {
                var bulletNode = this._bulletNodes[i];
                if (bulletNode.isFake() == false) {
                    bullet = bulletNode;
                    break;
                }
            }
        }
        if (bullet == null) {
            bullet = this._bulletNodes[1];
        }
        bullet.forceReset();
    }

    _pushBulletNode() {
        for (let i in this._bulletNodes) {
            var bulletNode = this._bulletNodes[i];
            if (bulletNode.isEmpty()) {
                var data = this._bulletDatas[0];
                if (data) {
                    bulletNode.updateUI(data);
                    this._bulletDatas.splice(0,1)
                }
            }
        }
        this._sortBulletNode();
        for (let i in this._bulletNodes) {
            var bulletNode = this._bulletNodes[i];
            if (bulletNode.isPosChange()) {
                bulletNode.moveToPos();
            }
            if (!bulletNode.isEmpty() && !bulletNode.isPlaying()) {
                bulletNode.playStart();
            }
        }
    }
    _sortBulletNode() {
        var sortFunc = function (a, b):number {
            if (a.isEmpty() != b.isEmpty()) {
                return !a.isEmpty()==true?1:0;
            } else if (a.getType() != b.getType()) {
                return b.getType() - a.getType();
            } else if (a.getShowCount() != b.getShowCount()) {
                return b.getShowCount() - a.getShowCount();
            } else {
                return a.getPos() - b.getPos();
            }
        };
        this._bulletNodes.sort(sortFunc);
        for (let i=1;i<=this._bulletNodes.length;i++) {
            var bulletNode = this._bulletNodes[i-1];
            bulletNode.updatePos(i);
        }
    }

    _onBulletReset() {
        this._pushBulletNode();
    }
    _onDoGive(item) {
        if (item && this._doAddMaterical) {
            this._doAddMaterical(item);
        }
    }
    _getExistBullet(data) {
        for (let i in this._bulletNodes) {
            var bulletNode = this._bulletNodes[i];
            if (bulletNode.isEmpty() == false && bulletNode.isSameNode(data)) {
                return bulletNode;
            }
        }
        return null;
    }

    _onTouchList(sender, state) {
        // if (state == ccui.TouchEventType.began) {
        //     this._listTouching = true;
        // } else if (state == ccui.TouchEventType.moved) {
        //     this._listTouching = true;
        // } else if (state == ccui.TouchEventType.ended || state == ccui.TouchEventType.canceled) {
        //     this._listTouching = false;
        // }
    }
    _onScrollEvent(sender, eventType) {
        if (eventType == 10) {
            this._listScrolling = false;
        } else if (eventType != 9) {
            this._listScrolling = true;
        }
    }
}