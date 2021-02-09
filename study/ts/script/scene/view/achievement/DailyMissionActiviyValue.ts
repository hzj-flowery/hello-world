import { ConfigNameConst } from "../../../const/ConfigNameConst";
import EffectGfxMoving from "../../../effect/EffectGfxMoving";
import { G_ConfigLoader, G_EffectGfxMgr, G_SceneManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonNodeTag from "../../../ui/component/CommonNodeTag";
import CommonUI from "../../../ui/component/CommonUI";
import PopupReward from "../../../ui/popup/PopupReward";
import { UserCheck } from "../../../utils/logic/UserCheck";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import ViewBase from "../../ViewBase";

var LINE_ICON_HEIGHT = 120;
var LINE_ICON_WIDTH = 590;

const { ccclass, property } = cc._decorator;

@ccclass
export default class DailyMissionActiviyValue extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelCon: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textCurActivity: cc.Label = null;

    @property({
        type: cc.ProgressBar,
        visible: true
    })
    _loadingBar_vip_progress: cc.ProgressBar = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _node_Activity1: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _node_Activity2: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _node_Activity3: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _node_Activity4: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _node_Activity5: cc.Node = null;






    private static MAX_VALUE = 161;
    private static MAX_ITEM_VALUE = 100;
    private static PERCENT_POS = {
        [1]: {
            curr: 30,
            per: 17
        },
        [2]: {
            curr: 60,
            per: 36
        },
        [3]: {
            curr: 90,
            per: 55
        },
        [4]: {
            curr: 120,
            per: 74
        },
        [5]: {
            curr: 150,
            per: 93
        }
    };
    public static BOX_PNG = [
        [
            'baoxiangtong_guan',
            'baoxiangtong_kai',
            'baoxiangtong_kong'
        ],
        [
            'baoxianglv_guan',
            'baoxianglv_kai',
            'baoxianglv_kong'
        ],
        [
            'baoxiangyin_guan',
            'baoxiangyin_kai',
            'baoxiangyin_kong'
        ],
        [
            'baoxiang_jubaopeng_guan',
            'baoxiang_jubaopeng_kai',
            'baoxiang_jubaopeng_kong'
        ],
        [
            'baoxiangjin_guan',
            'baoxiangjin_kai',
            'baoxiangjin_kong'
        ]
    ];
    private static NODE_STATUS_DEFAULT = 1;
    private static NODE_STATUS_REACHED = 2;
    private static NODE_STATUS_CURRENT = 3;

    private _activityItemList: Array<any> = [];
    private _iconList: Array<any> = [];
    private _boxRedpoint: Array<cc.Sprite> = [];
    private _boxEffect: Array<EffectGfxMoving> = [];
    private _activityServerData: any;

    onEnter() {

    }
    onExit() {

    }
    onCreate() {
        for (var i = 1; i <= 5; i++) {
            this._updateNodeActivity(i);
        }
    }
    getActivityItemList() {
        return this._activityItemList;
    }
    updateUI() {
        this._activityItemList = G_UserData.getDailyMission().getDailyMissionDatas(true);
        this._activityServerData = G_UserData.getDailyMission().getActivityDatas();
        for (var i = 1; i <= this._activityItemList.length; i++) {
            var value = this._activityItemList[i - 1];
            this._updateNodeActivity(i, value);
        }
        if (this._activityServerData) {
            this._textCurActivity.string = (this._activityServerData.value);
            this.setPercentValue(this._activityServerData.value, DailyMissionActiviyValue.MAX_VALUE);
        } else {
            this._textCurActivity.string = (0) + "";
            this.setPercentValue(0, DailyMissionActiviyValue.MAX_VALUE);
        }
    }
    _updateNodeActivity(index: number, cfg?) {
        var nodeActivity = this['_node_Activity' + index] as cc.Node;
        if (nodeActivity == null || cfg == null) {
            return;
        }
        var iconNode = nodeActivity.getChildByName('_boxImage') as cc.Node;
        iconNode.addComponent(CommonNodeTag).tag = index;
        var currValue = 0;
        if (this._activityServerData) {
            currValue = this._activityServerData.value;
        }
        Util.updateLabel((nodeActivity.getChildByName('Text_activity') as cc.Node).getComponent(cc.Label), { text: Lang.get('lang_daily_mission_activity', { num: cfg.require_value }) });
        if (currValue >= cfg.require_value) {
            if (cfg.getAward == true) {
                iconNode.addComponent(CommonUI).loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index - 1][2]));
                this._removeBoxFlash(index);
                this._setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_REACHED);
            } else {
                iconNode.addComponent(CommonUI).loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index - 1][1]));
                this._createBoxEffect(index);
                this._setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_CURRENT);
            }
        } else {
            iconNode.addComponent(CommonUI).loadTexture(Path.getChapterBox(DailyMissionActiviyValue.BOX_PNG[index - 1][0]));
            this._setNodeType(nodeActivity, DailyMissionActiviyValue.NODE_STATUS_DEFAULT);
        }
        var onIconClick = function (sender: any, iconParams) {
            var tag = sender.currentTarget.getComponent(CommonNodeTag).tag;
            if (tag > G_UserData.getDailyMission().getDailyMissionDatas(true).length || tag <= 0) {
                return;
            }
            let currValue = 0;
            if (this._activityServerData) {
                currValue = this._activityServerData.value;
            }
            var [cfg, rewards] = this._getCurProgressConfig(tag - 1);
            if (currValue >= cfg.require_value) {
                if (cfg.getAward == false) {
                    G_UserData.getDailyMission().c2sGetDailyTaskAward(cfg.id);
                    return;
                }
            }
            G_SceneManager.openPopup(Path.getCommonPrefab("PopupReward"), function (popup: PopupReward) {
                popup.setClickOtherClose(true);
                popup.setInitData(Lang.get('daily_task_box'), false, true);
                popup.updateUI(rewards);
                popup.setDetailText(Lang.get('daily_task_rewardstips', { count: cfg.require_value }));
                popup.openWithTarget(sender.currentTarget);
                //    popup.openWithAction();
            })
        }.bind(this)
        if (!iconNode.hasEventListener(cc.Node.EventType.TOUCH_END)) {
            iconNode.on(cc.Node.EventType.TOUCH_END, onIconClick);
        }
    }
    _getCurProgressConfig(tag) {
        var cfg = G_UserData.getDailyMission().getDailyMissionDatas(true)[tag];
        var rewards = [];
        var item = {
            type: cfg.reward_type1,
            value: cfg.reward_value1,
            size: cfg.reward_size1
        };
        table.insert(rewards, item);
        if (cfg.open_day && cfg.open_day > 0) {
            var FunctionLevelConfig = G_ConfigLoader.getConfig(ConfigNameConst.FUNCTION_LEVEL);
            var functionConfig = FunctionLevelConfig.get(cfg.open_day);
            if (functionConfig && UserCheck.enoughOpenDay(functionConfig.day)) {
                var item = {
                    type: cfg.reward_type2,
                    value: cfg.reward_value2,
                    size: cfg.reward_size2
                };
                table.insert(rewards, item);
                if (cfg.reward_value3 != 0) {
                    item = {
                        type: cfg.reward_type3,
                        value: cfg.reward_value3,
                        size: cfg.reward_size3
                    }
                    table.insert(rewards, item);
                }
            }
        }
        return [
            cfg,
            rewards
        ];
    }
    setPercentValue(curr, max) {
        var percentList = [
            [
                0,
                0,
                20
            ],
            [
                30,
                29,
                35
            ],
            [
                60,
                45,
                51
            ],
            [
                90,
                60,
                66
            ],
            [
                120,
                76,
                82
            ],
            [
                150,
                91,
                100
            ]
        ];
        max = max || DailyMissionActiviyValue.MAX_VALUE;
        var progress = this._loadingBar_vip_progress;
        var step = percentList.length;
        while (step >= 0) {
            if (curr >= percentList[step - 1][0]) {
                var offset = curr - percentList[step - 1][0];
                var diff = step < percentList.length && 30 || max - percentList[step - 1][0];
                var realPercent = percentList[step - 1][1] + (percentList[step - 1][2] - percentList[step - 1][1]) * offset / diff;
                progress.progress = (realPercent / 100);
                break;
            }
            step = step - 1;
        }
    }
    _setNodeType(nodeActivity: cc.Node, type) {
        if (!nodeActivity) {
            return;
        }
        var imgReached = nodeActivity.getChildByName('imgReached');
        var imgNotReached = nodeActivity.getChildByName('imgNotReached');
        var imgNotReach = nodeActivity.getChildByName('imgNotReach');
        if (type == DailyMissionActiviyValue.NODE_STATUS_DEFAULT) {
            imgNotReach.active = (true);
            imgReached.active = (false);
            imgNotReached.active = (false);
        } else if (type == DailyMissionActiviyValue.NODE_STATUS_REACHED) {
            imgNotReached.active = (true);
            imgReached.active = (false);
            imgNotReach.active = (false);
        } else if (type == DailyMissionActiviyValue.NODE_STATUS_CURRENT) {
            imgReached.active = (true);
            imgNotReached.active = (false);
            imgNotReach.active = (false);
        }
    }
    _createBoxEffect(index) {
        if (this._boxEffect[index] || this._boxRedpoint[index]) {
            return;
        }
        var nodeActivity = this['_node_Activity' + index] as cc.Node;
        var baseNode = nodeActivity.getChildByName('_boxImage');
        if (!baseNode) {
            return;
        }
        var effect = G_EffectGfxMgr.createPlayMovingGfx(baseNode, 'moving_boxflash', null, null, false);
        this._boxEffect[index] = effect;
        var redPoint = UIHelper.newSprite(Path.getUICommon('img_redpoint'));
        baseNode.addChild(redPoint.node);
        redPoint.node.setPosition(cc.v2(80 / 2, 66 / 2));
        this._boxRedpoint[index] = redPoint;
    }
    _removeBoxFlash(index) {
        if (this._boxEffect[index]) {
            this._boxEffect[index].node.destroy();
            this._boxEffect[index] = null;
        }
        if (this._boxRedpoint[index]) {
            this._boxRedpoint[index].node.destroy();
            this._boxRedpoint[index] = null;
        }
    }
}