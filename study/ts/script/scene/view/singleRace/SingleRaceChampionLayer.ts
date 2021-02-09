import ViewBase from "../../ViewBase";
import UIHelper from "../../../utils/UIHelper";
import { G_SignalManager, G_UserData, G_EffectGfxMgr, Colors } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { Lang } from "../../../lang/Lang";
import { SingleRaceConst } from "../../../const/SingleRaceConst";
import { stringUtil } from "../../../utils/StringUtil";
import CommonHeroIcon from "../../../ui/component/CommonHeroIcon";
import CommonHeroPower from "../../../ui/component/CommonHeroPower";
import CommonStoryAvatar from "../../../ui/component/CommonStoryAvatar";
import { UIPopupHelper } from "../../../utils/UIPopupHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleRaceChampionLayer extends ViewBase {
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeMoving: cc.Node = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _buttonGoMap: cc.Button = null;

    @property(cc.Prefab)
    commonHeroIcon: cc.Prefab = null;
    @property(cc.Prefab)
    commonHeroPower: cc.Prefab = null;
    @property(cc.Prefab)
    commonStoryAvatar: cc.Prefab = null;
    _userData: any;
    _userDetailData: any;
    _signalGetSingleRacePositionInfo: any;

    onCreate() {
        this.setSceneSize();
        UIHelper.addEventListener(this.node, this._buttonGoMap, 'SingleRaceChampionLayer', '_onClickGo');
        this._userData = null;
        this._userDetailData = null;
    }
    onEnter() {
        this._signalGetSingleRacePositionInfo = G_SignalManager.add(SignalConst.EVENT_SINGLE_RACE_GET_POSITION_INFO, handler(this, this._onEventGetSingleRacePositionInfo));
    }
    onExit() {
        this._signalGetSingleRacePositionInfo.remove();
        this._signalGetSingleRacePositionInfo = null;
    }
    onShow() {
    }
    onHide() {
    }
    updateInfo() {
        var matchData = G_UserData.getSingleRace().getMatchDataWithPosition(63);
        if (matchData) {
            var userId = matchData.getUser_id();
            var championUser = G_UserData.getSingleRace().getUserDataWithId(userId);
            var championDetail = G_UserData.getSingleRace().getUserDetailInfoWithId(userId);
            if (championUser && championDetail) {
                this._userData = championUser;
                this._userDetailData = championDetail;
                this._updateView();
                return;
            }
        }
        G_UserData.getSingleRace().c2sGetSingleRacePositionInfo(63);
    }
    _updateView() {
        var heroList = this._userData.getHeroList();
        let effectFunction = function (effect: string) {
            var stc = stringUtil.find(effect, 'icon_tianxiawus_no');
            if (stc != -1) {
                var index = effect.charAt(effect.length - 1);
                var icon = cc.instantiate(this.commonHeroIcon).getComponent(CommonHeroIcon);
                var heroData = heroList[Number(index) -1];
                if (heroData) {
                    var coverId = heroData.getCoverId();
                    var limitLevel = heroData.getLimitLevel();
                    var limitRedLevel = heroData.getLimitRedLevel()
                    icon.updateUI(coverId, null, limitLevel, limitRedLevel);
                }
                return icon.node;
            } else if (effect == 'moving_tianxiawus_name') {
                var moving = this._createNameMoving();
                return moving;
            } else if (effect == 'routine_word_tianxiawus_zhanli') {
                var power = cc.instantiate(this.commonHeroPower).getComponent(CommonHeroPower);
                power.updateUI(this._userData.getPower());
                return power.node;
            } else if (effect == 'smoving_fdj') {
                var sp = UIHelper.newSprite( Path.getCampImg('img_camp_player03c'));
                UIHelper.addEventListenerToNode(this.node, sp.node, 'SingleRaceChampionLayer', '_onButtonLookClicked');
                G_EffectGfxMgr.applySingleGfx(sp.node, 'smoving_fdj', null, null, null);
                return sp.node;
            } else if (effect == 'routine_word_zhengrong_zi') {
                var params = {
                    fontSize: 26,
                    fontName: Path.getFontW8(),
                    color: cc.color(255, 198, 0),
                    outlineColor: cc.color(134, 57, 1, 255),
                    text: Lang.get('single_race_champion_text')
                };
                var label = UIHelper.createLabel(params);
                return label;
            } else if (effect == 'tianxiawus_spine') {
                var spine = cc.instantiate(this.commonStoryAvatar).getComponent(CommonStoryAvatar);
                var [covertId, limitLevel, limitRedLevel] = this._userData.getCovertIdAndLimitLevel();
                spine.updateUI(covertId, limitLevel, limitRedLevel);
                return spine.node;
            }
            return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeMoving, 'moving_tianxiawus_dam', effectFunction, eventFunction, false);
    }
    _createNameMoving() {
        var effectFunction = function (effect) {
            if (effect == 'routine_word_name_who') {
                var params = {
                    fontSize: 24,
                    fontName: Path.getCommonFont(),
                    color: Colors.COLOR_QUALITY[6],
                    text: this._userData.getUser_name()
                };
                var label = UIHelper.createLabel(params);
                return label;
            } else if (effect == 'routine_word_name_fuwuqi') {
                var params1 = {
                    fontSize: 22,
                    color: cc.color(255, 255, 255),
                    outlineColor: cc.color(0, 0, 0, 255),
                    text: this._userData.getServer_name()
                };
                var label = UIHelper.createLabel(params1);
                return label;
            }
            return new cc.Node();
        }.bind(this);
        function eventFunction(event) {
            if (event == 'finish') {
            }
        }
        var node = new cc.Node();
        var effect = G_EffectGfxMgr.createPlayMovingGfx(node, 'moving_tianxiawus_name', effectFunction, eventFunction, false);
        return node;
    }
    _onButtonLookClicked() {
        if (this._userDetailData == null) {
            return;
        }
        UIPopupHelper.popupUserDetailInfor(this._userDetailData, this._userData.getPower());
    }
    _onClickGo() {
        G_SignalManager.dispatch(SignalConst.EVENT_SINGLE_RACE_SWITCH_LAYER, SingleRaceConst.LAYER_STATE_MAP);
    }
    _onEventGetSingleRacePositionInfo(eventName, userData, userDetailData) {
        this._userData = userData;
        this._userDetailData = userDetailData;
        this._updateView();
    }
}