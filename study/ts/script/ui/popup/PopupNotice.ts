import PopupBase from "../PopupBase";
import CommonPopupNotice from "../component/CommonPopupNotice";
import CommonButtonLevel0Highlight from "../component/CommonButtonLevel0Highlight";
import { handler } from "../../utils/handler";
import { Lang } from "../../lang/Lang";
import { G_TopLevelNode } from "../../init";
import CommonTabGroupVertical from "../component/CommonTabGroupVertical";
import CommonTabGroupScrollVertical from "../component/CommonTabGroupScrollVertical";
import { ExploreConst } from "../../const/ExploreConst";
import { HttpRequest } from "../../network/HttpRequest";
import { config } from "../../config";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupNotice extends PopupBase {

    @property({ type: CommonPopupNotice, visible: true })
    _popupBG: CommonPopupNotice = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _commonButton: CommonButtonLevel0Highlight = null;

    @property({ type: CommonTabGroupScrollVertical, visible: true })
    _tabGroup: CommonTabGroupScrollVertical = null;

    @property({ type: cc.ScrollView, visible: true })
    _contentScrollView: cc.ScrollView = null;

    @property({ type: cc.Label, visible: true })
    _textPageTitle: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textContent: cc.Label = null;

    private _url;
    private _title;
    private _currSelectIndex;

    private _testNoticeData: any = {
        code: 0,
        data: [
            {
                id: "1",
                tab_title: "页签标签1",
                page_title: "页面标题1",
                type: "activity",
                content: "  正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容\n正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容",
                weight: "1"
            },
            {
                id: "2",
                tab_title: "页签标签2",
                page_title: "页面标题2",
                type: "announcement",
                content: "正文内容",
                weight: "2"
            },
            {
                id: "1",
                tab_title: "页签标签3",
                page_title: "页面标题3",
                type: "announcement",
                content: "正文内容",
                weight: "3"
            },
        ]
    };

    private _noticeTitles: string[];
    private _noticeDataList: { id: string, tabTitle: string, pageTitle: string, type: number, content: string, weight: number }[];

    public static responseNoticeData: string;
    public static waitEnterMsg(callBack) {
        // if (cc.sys.platform != cc.sys.WECHAT_GAME) {
        //     callBack();
        //     return;
        // }
        let httpRequest = new HttpRequest();
        httpRequest.get(config.NOTICE_URL, (response) => {
            // console.log(response);
            PopupNotice.responseNoticeData = response;
            callBack();
        }, () => {
            callBack();
        });
    }

    init(url, title) {
        this._url = url;
        this._title = title;
        this._commonButton.addClickEventListenerEx(handler(this, this._onKnowBtn));

        this._setNoticeData();
    }


    open() {
        G_TopLevelNode.addToNoticeLevel(this.node);
        this._rootNode = this.node;
    }


    onCreate() {
        this.setSceneSize();
        this._popupBG.setTitle(this._title || '公   告');
        this._popupBG.addCloseEventListener(() => {
            this.closeWithAction();
        });
        this._commonButton.setString(Lang.get('login_notice_know'));

        if (this._noticeDataList == null) {
            this._tabGroup.node.active = false;
            this._contentScrollView.node.active = false;
            return;
        }

        var CUSTOM_COLOR = [
            [cc.color(215, 239, 255)],
            [cc.color(255, 249, 235)],
            [cc.color(255, 249, 235)]
        ];
        this._tabGroup.setCustomColor(CUSTOM_COLOR);
        var param = {
            callback: handler(this, this._onTabSelect),
            brightTabItemCallback: handler(this, this._brightTabItem),
            textList: this._noticeTitles
        };
        this._tabGroup.recreateTabs(param);
        this._tabGroup.setTabIndex(0);

        this._setNoticeTabType();
    }

    _brightTabItem(tabItem, bright) {
        var textWidget: cc.Node = tabItem.textWidget;
        var normalImage: cc.Node = tabItem.normalImage;
        var downImage: cc.Node = tabItem.downImage;
        normalImage.active = (!bright);
        downImage.active = (bright);
        textWidget.color = (bright && ExploreConst.TAB_LIGHT_COLOR || ExploreConst.TAB_NORMAL_COLOR);
    }

    _onTabSelect(index, sender) {
        if (this._currSelectIndex == index) {
            return;
        }
        this._currSelectIndex = index;
        let noticeData = this._noticeDataList[this._currSelectIndex];
        this._textPageTitle.string = noticeData.pageTitle;
        this._textContent.string = noticeData.content;
    }

    _setNoticeTabType() {
        for (let i = 0; i < this._tabGroup.getTabCount(); i++) {
            let tabItem = this._tabGroup.getTabItem(i + 1);
            let huodongImg: cc.Node = tabItem.panelWidget.getChildByName('Image_huodong');
            let gonggaoImg: cc.Node = tabItem.panelWidget.getChildByName('Image_gonggao');
            huodongImg.active = this._noticeDataList[i].type == 1;
            gonggaoImg.active = this._noticeDataList[i].type == 2;
        }
    }

    _onKnowBtn(sender) {
        this.close();
    }

    closeWithAction() {
        this.close();
    }

    _setNoticeData() {
        if (PopupNotice.responseNoticeData == null) {
            return;
        }
        PopupNotice.responseNoticeData = PopupNotice.responseNoticeData.replace(/\\r\\n/g, "\\n");
        // console.log(PopupNotice.responseNoticeData);
        let noticeJsonData: any = JSON.parse(PopupNotice.responseNoticeData);
        if (noticeJsonData == null) {
            return;
        }
        this._noticeDataList = [];
        this._noticeTitles = [];
        for (let i = 0; i < noticeJsonData.data.length; i++) {
            let info = noticeJsonData.data[i];
            let noticeData: any = {};
            noticeData.id = info.id;
            noticeData.tabTitle = info.tab_title;
            if (info.type == "activity") {
                noticeData.type = 1;
            }
            if (info.type == "announcement") {
                noticeData.type = 2;
            }
            noticeData.pageTitle = info.page_title;
            noticeData.content = info.content;
            noticeData.weight = parseInt(info.weight);
            this._noticeDataList.push(noticeData);
        }
        this._noticeDataList.sort((a, b) => {
            return b.weight - a.weight;
        });
        for (let i = 0; i < this._noticeDataList.length; i++) {
            this._noticeTitles.push(this._noticeDataList[i].tabTitle);
        }
    }
}