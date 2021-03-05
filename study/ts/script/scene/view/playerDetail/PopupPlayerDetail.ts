const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'
import CommonButtonLevel0Normal from '../../../ui/component/CommonButtonLevel0Normal'
import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import CommonLargeVipNode from '../../../ui/component/CommonLargeVipNode'
import PopupPlayerSoundSlider from './PopupPlayerSoundSlider'
import PopupPlayerDetailItem from './PopupPlayerDetailItem'
import CommonDetailTitle from '../../../ui/component/CommonDetailTitle'
import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import { G_SceneManager, G_UserData, G_AudioManager, G_ConfigLoader, Colors, G_RecoverMgr, G_ServerTime, G_SignalManager, G_ConfigManager, G_GameAgent } from '../../../init';
import { Path } from '../../../utils/Path';
import { FunctionCheck } from '../../../utils/logic/FunctionCheck';
import { FunctionConst } from '../../../const/FunctionConst';
import { PopupHonorTitleHelper } from './PopupHonorTitleHelper';
import { UserDataHelper } from '../../../utils/data/UserDataHelper';
import { config } from '../../../config';
import { ConfigNameConst } from '../../../const/ConfigNameConst';
import ParameterIDConst from '../../../const/ParameterIDConst';
import { UserCheck } from '../../../utils/logic/UserCheck';
import UIHelper from '../../../utils/UIHelper';
import { SignalConst } from '../../../const/SignalConst';
import PopupBase from '../../../ui/PopupBase';
import PopupPlayerModifyName from './PopupPlayerModifyName';
import PopupNotice from '../../../ui/popup/PopupNotice';

@ccclass
export default class PopupPlayerDetail extends PopupBase {

    @property({ type: CommonNormalLargePop, visible: true })
    _commonNodeBk: CommonNormalLargePop = null;

    @property({ type: cc.Sprite, visible: true })
    _imagePlayerTitle: cc.Sprite = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerLevel: cc.Label = null;

    @property({ type: CommonDetailTitle, visible: true })
    _settingTitle: CommonDetailTitle = null;

    @property({ type: PopupPlayerDetailItem, visible: true })
    _resRecover1: PopupPlayerDetailItem = null;

    @property({ type: PopupPlayerDetailItem, visible: true })
    _resRecover2: PopupPlayerDetailItem = null;

    @property({ type: PopupPlayerDetailItem, visible: true })
    _resRecover3: PopupPlayerDetailItem = null;

    @property({ type: cc.Node, visible: true })
    _checkBox1: cc.Node = null;

    @property({ type: PopupPlayerSoundSlider, visible: true })
    _bgSlider: PopupPlayerSoundSlider = null;

    @property({ type: cc.Node, visible: true })
    _checkBox2: cc.Node = null;

    @property({ type: PopupPlayerSoundSlider, visible: true })
    _effectSlider: PopupPlayerSoundSlider = null;

    @property({ type: cc.Node, visible: true })
    _checkBox3: cc.Node = null;

    @property({ type: cc.Slider, visible: true })
    _sliderMic: cc.Slider = null;

    @property({ type: cc.Label, visible: true })
    _textMic: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textSpeaker: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textMicValue: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textSpeakerValue: cc.Label = null;

    @property({ type: cc.Slider, visible: true })
    _sliderSpeaker: cc.Slider = null;

    @property({ type: CommonLargeVipNode, visible: true })
    _commonVipNode: CommonLargeVipNode = null;

    @property({ type: CommonButtonLevel0Highlight, visible: true })
    _btnSwitchAccount: CommonButtonLevel0Highlight = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnGameAnnounce: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnGameMaker: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnGameReward: CommonButtonLevel0Normal = null;

    @property({ type: CommonButtonLevel0Normal, visible: true })
    _btnBind: CommonButtonLevel0Normal = null;

    @property({ type: cc.ProgressBar, visible: true })
    _loadingbarProcess: cc.ProgressBar = null;

    @property({ type: cc.Label, visible: true })
    _textExp: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerId: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textServerName: cc.Label = null;

    @property({ type: CommonHeroIcon, visible: true })
    _commonHeroIcon: CommonHeroIcon = null;

    @property({ type: cc.Label, visible: true })
    _textPlayerName: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnModifyName: cc.Button = null;

    @property({ type: cc.Node, visible: true })
    _nodeLevelLimit: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _levelLimit: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _levelLimitDesc: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeTitle: cc.Node = null;

    @property({ type: cc.Button, visible: true })
    _btnChangeTitle: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _texBtnChangeTitle: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _redPoint: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _titleImage: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _titleTipText: cc.Label = null;

    @property({ type: cc.Button, visible: true })
    _btnFrame: cc.Button = null;

    @property({ type: cc.Label, visible: true })
    _texBtnFrame: cc.Label = null;

    @property({ type: cc.Sprite, visible: true })
    _redPointFrame: cc.Sprite = null;

    private _title;
    private _callback;
    private _imageMidBk;
    private _vitCountKey;
    private _spirteCountKey;
    private _intervalTime;
    private _restoreTime: number[];
    private _refreshHandler;

    private _signalUserDataUpdate;
    private _signalEquipTitle;
    private _signalUnloadTitle;
    private _signalRedPoint;
    private _signalUpdateTitleInfo;

    private _init(title?, callback?) {
        this._title = title || Lang.get('player_detail_title');

        this._vitCountKey = null;
        this._spirteCountKey = null;
        this._intervalTime = 0;
        this._restoreTime = [0, 0, 0];
        this._refreshHandler = null;

        this._btnGameReward.addClickEventListenerEx(handler(this, this._onBtnGiftCode));
        this._btnSwitchAccount.addClickEventListenerEx(handler(this, this._onSwidthAccount));
        this._btnGameAnnounce.addClickEventListenerEx(handler(this, this._onGameAnnounce));
        this._btnGameMaker.addClickEventListenerEx(handler(this, this._onGameMaker));
        this._btnBind.addClickEventListenerEx(handler(this, this._onClickBtnBind));
        this._btnGameAnnounce.node.active = G_ConfigManager.checkCanRecharge();
    }

    public onCreate() {
        this._init();
        this._initSound();
        this._commonNodeBk.addCloseEventListener(handler(this, this.onBtnCancel));
        this._commonNodeBk.setTitle(this._title);
        this._settingTitle.setFontSize(30);
        this._settingTitle.setTitleAndAdjustBgSize(Lang.get('system_setting_title'));
        this._settingTitle.showTextBg(false);
        this._onLoadSetting();
        this._updatePlayerInfo();
        this._texBtnFrame.string = (Lang.get('change_role_frame'));
        this._initMicTest();
        this._initTitle();
    }

    public onClickBtnFrame() {
        G_SceneManager.openPopup(Path.getPrefab("PopUpPlayerFrame", "playerDetail"))
    }

    private _initSound() {
        let updateSound = (_control: PopupPlayerSoundSlider, _name) => {
            var soundControl = _control;
            var volume = G_UserData.getUserSetting().getSettingValue(_name);
            volume = volume == null ? 1 : volume;
            soundControl.updateUI(volume);
            G_UserData.getUserSetting().updateMusic();
            soundControl.setCallBack((_value, _event) => {
                if (_event == 'on') {
                    if (_name == 'mus_volume') {
                        if (_value > 0) {
                            G_AudioManager.setMusicEnabled(true);
                        }
                        G_AudioManager.setMusicVolume(_value);
                    } else if (_name == 'sou_volume') {
                        if (_value > 0) {
                            G_AudioManager.setSoundEnabled(true);
                        }
                        G_AudioManager.setSoundVolume(_value);
                    }
                } else if (_event == 'up') {
                    var index = _value > 0 && 1 || 0;
                    if (_name == 'mus_volume') {
                        G_UserData.getUserSetting().setSettingValue('musicEnabled', index);
                    } else if (_name == 'sou_volume') {
                        G_UserData.getUserSetting().setSettingValue('soundEnabled', index);
                    }
                    G_UserData.getUserSetting().setSettingValue(_name, _value);
                    G_UserData.getUserSetting().updateMusic();
                }
            });
        }
        updateSound(this._bgSlider, 'mus_volume');
        updateSound(this._effectSlider, 'sou_volume');
    }

    private _initTitle() {
        this._texBtnChangeTitle.string = (Lang.get('honor_title_title_btn'));
        this._changeTitle();
        var isOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_TITLE)[0];
        this._btnChangeTitle.node.active = (isOpen);
        if (!isOpen) {
            this._titleImage.active = (false);
            this._titleTipText.node.active = (false);
        }
    }

    private _changeTitle() {
        var titleItem = PopupHonorTitleHelper.getEquipedTitle();
        var titleId = titleItem && titleItem.getId() || 0;
        UserDataHelper.appendNodeTitle(this._titleImage, titleId, "PopupPlayerDetail");
        this._titleTipText.node.active = (titleId == 0);
    }

    private _initMicTest() {
        if (config.APP_DEVELOP_MODE) {
            // this._sliderMic.addEventListener(handler(this, this.onMicSlider));
            // this._sliderSpeaker.addEventListener(handler(this, this.onSpeakerSlider));
            var mic_volume = G_UserData.getUserSetting().getSettingValue('mic_volume') || 0;
            var speaker_volume = G_UserData.getUserSetting().getSettingValue('speaker_volume') || 0;
            this._sliderMic.progress = (mic_volume / 8) / 100;
            this._textMicValue.string = (mic_volume);
            this._sliderSpeaker.progress = (speaker_volume / 8) / 100;
            this._textSpeakerValue.string = (speaker_volume);
        } else {
            this._sliderMic.node.active = (false);
            this._sliderSpeaker.node.active = (false);
            this._textMic.node.active = (false);
            this._textSpeaker.node.active = (false);
            this._textMicValue.node.active = (false);
            this._textSpeakerValue.node.active = (false);
        }
    }

    public onMicSlider(sender, event) {
        var value = this._sliderMic.progress * 8 * 100;
        this._textMicValue.string = (value).toString();
    }

    public onMicSliderEnd(sender, event) {
        var value = this._sliderMic.progress * 8;
        // TODO:G_VoiceAgent
        // G_VoiceAgent.setMicVolume(value);
        G_UserData.getUserSetting().setSettingValue('mic_volume', value);
    }

    public onSpeakerSlider(sender, event) {
        var value = this._sliderSpeaker.progress * 8 * 100;
        this._textSpeakerValue.string = (value).toString();
    }

    public onSpeakerSliderEnd(sender, event) {
        var value = this._sliderSpeaker.progress * 8 * 100;
        // TODO:G_VoiceAgent
        // G_VoiceAgent.setSpeakerVolume(value);
        G_UserData.getUserSetting().setSettingValue('speaker_volume', value);
    }

    private _onLoadSetting() {
        // var checkList = {};
        // checkList[1] = G_UserData.getUserSetting().getSettingValue('musicEnabled');
        // checkList[2] = G_UserData.getUserSetting().getSettingValue('soundEnabled');
        // checkList[3] = G_UserData.getUserSetting().getSettingValue('gfxEnabled');
        // for (var i = 1; 3; null) {
        //     var checkWidget = this['_checkBox' + i];
        //     var checkValue = checkList[i] || 0;
        //     if (checkValue == 1) {
        //         checkWidget.setSelected(true);
        //     } else {
        //         checkWidget.setSelected(false);
        //     }
        // }
    }

    public prcoLimitLevel() {
        var nowDay = G_UserData.getBase().getOpenServerDayNum();
        var paramMax = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.PLAYER_DETAIL_LEVEL_MAX).content;
        var nextPendStr = ' ';
        var currLevelStar = ' ';
        if (nowDay < parseInt(paramMax)) {
            this._levelLimit.string = (currLevelStar);
            this._levelLimitDesc.string = (nextPendStr);
            this._nodeLevelLimit.active = (false);
            return;
        }
        this._nodeLevelLimit.active = (true);
        var paramContent: string = G_ConfigLoader.getConfig(ConfigNameConst.PARAMETER).get(ParameterIDConst.PLAYER_DETAIL_LEVEL_LIMIT).content;
        var valueList = paramContent.split(',');
        for (let i in valueList) {
            var value = valueList[i];
            var [day, level] = value.split('|');
            var currLevel = parseInt(level);
            var currDay = parseInt(day);
            if (UserCheck.enoughOpenDay(currDay)) {
                currLevelStar = Lang.get('common_player_detail_level_limit', { num: currLevel });
            } else {
                nextPendStr = Lang.get('common_player_detail_level_limit1', {
                    level: currLevel,
                    day: currDay - nowDay
                });
            }
        }
        this._levelLimit.string = (currLevelStar);
        this._levelLimitDesc.string = (nextPendStr);
    }

    private _updatePlayerInfo() {
        var baseData = G_UserData.getBase();
        this._textPlayerLevel.string = baseData.getLevel().toString();
        this._textPlayerName.string = (baseData.getName());
        var hexstr = '%x'.format(baseData.getId());
        this._textPlayerId.string = (hexstr);
        var currExp = G_UserData.getBase().getExp();
        var level = G_UserData.getBase().getLevel();
        if (level == 0) {
            return;
        }
        var roleConfig = G_ConfigLoader.getConfig(ConfigNameConst.ROLE).get(level);
        var levelUpExp = roleConfig.exp;
        this._textExp.string = (currExp + ('/' + levelUpExp));
        var percent = Math.ceil(currExp / levelUpExp * 100);
        if (percent > 100) {
            percent = 100;
        }
        this.prcoLimitLevel();
        this._loadingbarProcess.progress = (percent) / 100;
        var vipLevel = G_UserData.getVip().getLevel();
        this._commonVipNode.setVip(vipLevel);
        var serverName = G_UserData.getBase().getServer_name();
        this._textServerName.string = (serverName);
        this._btnSwitchAccount.setString(Lang.get('system_setting_switch_acount'));
        this._btnGameAnnounce.setString(Lang.get('system_setting_game_announce'));
        this._btnGameMaker.setString(Lang.get('system_setting_game_marker'));
        this._btnGameReward.setString(Lang.get('system_setting_game_reward'));
        this._btnBind.setString(Lang.get('system_setting_bind'));
        this._updateRecoverInfo(1);
        this._updateRecoverInfo(2);
        this._updateRecoverInfo(3);
        var [officialInfo, officialLevel] = G_UserData.getBase().getOfficialInfo();
        if (officialLevel == 0) {
            this._imagePlayerTitle.node.active = false;
        } else {
            UIHelper.loadTexture(this._imagePlayerTitle, Path.getTextHero(officialInfo.picture));
            this._imagePlayerTitle.node.active = true;
        }
        this._commonHeroIcon.updateIcon(G_UserData.getBase().getPlayerShowInfo(), null, G_UserData.getHeadFrame().getCurrentFrame().getId());
        this._textPlayerName.node.color = (Colors.getOfficialColor(officialLevel));
        UIHelper.updateTextOfficialOutline(this._textPlayerName.node, officialLevel);
        // for (var i = 1; 3; null) {
        //     var checkBox = this['_checkBox' + i];
        //     checkBox.setTag(i);
        //     checkBox.addEventListener(handler(this, this._onCheckBoxClick));
        // }
    }

    private _onCheckBoxClick(sender) {
        var index = sender.isSelected() && 1 || 0;
        if (sender.getName() == '_checkBox1') {
            var index = sender.isSelected() && 1 || 0;
            G_UserData.getUserSetting().setSettingValue('musicEnabled', index);
        }
        if (sender.getName() == '_checkBox2') {
            var index = sender.isSelected() && 1 || 0;
            G_UserData.getUserSetting().setSettingValue('soundEnabled', index);
        }
        if (sender.getName() == '_checkBox3') {
            var index = sender.isSelected() && 1 || 0;
            G_UserData.getUserSetting().setSettingValue('gfxEnabled', index);
        }
        G_UserData.getUserSetting().updateMusic();
    }

    private _updateRecoverInfo(index) {
        var unitIds = [
            1,
            2,
            4
        ];
        var unitInfo = G_RecoverMgr.getRecoverUnit(unitIds[index - 1]);
        this['_resRecover' + index].updateUI(unitInfo);
        this._updateRecoverTime(index);
    }

    private _updateRecoverTime(index) {
        var unitIds = [
            1,
            2,
            4
        ];
        var unitInfo = G_RecoverMgr.getRecoverUnit(unitIds[index - 1]);
        this['_resRecover' + index].updateUI(unitInfo);
    }
    public onEnter() {
        this._signalUserDataUpdate = G_SignalManager.add(SignalConst.EVENT_RECV_ROLE_INFO, handler(this, this._onUserDataUpdate));
        this._signalEquipTitle = G_SignalManager.add(SignalConst.EVENT_EQUIP_TITLE, handler(this, this._onEventTitleChange));
        this._signalUnloadTitle = G_SignalManager.add(SignalConst.EVENT_UNLOAD_TITLE, handler(this, this._onEventTitleChange));
        this._signalRedPoint = G_SignalManager.add(SignalConst.EVENT_RED_POINT_UPDATE, handler(this, this._onEventRedUpdate));
        this._signalUpdateTitleInfo = G_SignalManager.add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(this, this._onEventTitleChange));
        this._formatBtns();
        if (G_ConfigManager.isGiftcode() == false) {
            this._btnGameReward.setVisible(false);
        }
        if (G_ConfigManager.isAppstore()) {
            this._btnBind.setVisible(false);
            this._btnGameReward.setVisible(false);
            this._btnGameMaker.setVisible(false);
        }
        this._btnGameMaker.setVisible(false);
        this._resetRedPoint();
        this._resetHeadFramePoint();
    }

    public onExit() {
        this._signalUserDataUpdate.remove();
        this._signalUserDataUpdate = null;
        this._signalEquipTitle.remove();
        this._signalEquipTitle = null;
        this._signalUnloadTitle.remove();
        this._signalUnloadTitle = null;
        this._signalRedPoint.remove();
        this._signalRedPoint = null;
        this._signalUpdateTitleInfo.remove();
        this._signalUpdateTitleInfo = null;
    }

    public update(dt) {
        this._intervalTime = this._intervalTime + dt;
        if (this._intervalTime >= 1) {
            this._updateRecoverTime(1);
            this._updateRecoverTime(2);
            this._updateRecoverTime(3);
            this._intervalTime = 0;
        }
    }

    private _onEventRedUpdate() {
        this._resetRedPoint();
        this._resetHeadFramePoint();
    }

    private _resetRedPoint() {
        var hasRed = G_UserData.getTitles().isHasRedPoint();
        this._redPoint.node.active = (hasRed);
    }

    private _resetHeadFramePoint() {
        var frameRed = G_UserData.getHeadFrame().hasRedPoint();
        this._redPointFrame.node.active = (frameRed);
    }

    public onBtnCancel() {
        this.close();
    }

    public onBtnModifyName(sender) {
        G_SceneManager.openPopup(Path.getPrefab("PopupPlayerModifyName", "playerDetail"), (popupPlayerModifyName: PopupPlayerModifyName) => {
            popupPlayerModifyName.initData(null, null);
            popupPlayerModifyName.openWithAction();
        });
    }

    private _onUserDataUpdate(_, param) {
        this._updatePlayerInfo();
    }

    private _onEventTitleChange() {
        this._changeTitle();
    }

    private _onBtnGiftCode(sender) {
        G_SceneManager.openPopup('prefab/common/PopupGiftCode', (popup) => {
            popup.openWithAction();
        });
    }

    private _onSwidthAccount(sender) {
        G_GameAgent.logoutPlatform();
    }

    private _onGameAnnounce(sender) {
        G_SceneManager.openPopup(Path.getCommonPrefab("PopupNotice"), (popupNotice: PopupNotice) => {
            popupNotice.init(null, null);
            popupNotice.openWithAction();
        });
    }

    private _onGameMaker() {
    }

    private _onClickBtnBind() {
        // TODO:
        // var popup = new (require('PopupBindPublicAccount'))();
        // popup.openWithAction();
    }

    public onClickChangeTitle() {
        G_SceneManager.openPopup(Path.getPrefab("PopupPlayerHonorTitle", "playerDetail"));
        var hasRed = G_UserData.getTitles().isHasRedPoint();
        if (hasRed) {
            G_UserData.getTitles().c2sClearTitles();
        }
    }

    private _formatBtns() {
        var type2Pos = {
            1: [
                [233, 80],
                [455, 80],
                [679, 80],
                [901, 80]
            ],
            2: [
                [198, 80],
                [383, 80],
                [568, 80],
                [753, 80],
                [938, 80]
            ]
        };
        this._btnGameMaker.setVisible(false);
        this._btnBind.setVisible(false);
        var btns = [
            this._btnSwitchAccount,
            this._btnGameAnnounce,
            this._btnGameReward,
            this._btnBind
        ];
        var isShowBindWeChat = G_ConfigManager.isShowBindWeChat();
        var isBinded = G_UserData.getBase().isBindedWeChat();
        if (isShowBindWeChat && isBinded == false) {
            this._btnBind.setVisible(true);
        }
        var type = 1;
        var posList = type2Pos[type];
        for (let i in btns) {
            var btn = btns[i];
            var pos = posList[i];
            if (pos) {
                btn.node.setPosition(pos[0] - 1136 / 2, pos[1] - 640 / 2);
            }
        }
    }
}