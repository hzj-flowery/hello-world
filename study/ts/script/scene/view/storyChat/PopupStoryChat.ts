import { ConfigNameConst } from "../../../const/ConfigNameConst";
import { SignalConst } from "../../../const/SignalConst";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_AudioManager, G_ConfigLoader, G_ResolutionManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import PopupBase from "../../../ui/PopupBase";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import PopupStoryChatNode from "./PopupStoryChatNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupStoryChat extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelCover: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelChat: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _chatName: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _chatContent: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _imageJump: cc.Node = null;

    @property({ type: cc.Prefab, visible: true })
    _popupStoryChatNodePrefab: cc.Prefab = null;

    //chat类型
    public static TYPE_CHAPTER_START = 1			//第一次进入章节触发
    private static ZORDER_BASE = 0
    private static ZORDER_LINSTER = 1           //听话的人
    private static ZORDER_COVER = 2             //黑色遮罩
    private static ZORDER_TALKER = 3            //说话的人
    private static ZORDER_CONTENT_PANEL = 4     //说话面板
    private static ZORDER_TOUCH = 5				//触摸层
    private static ZORDER_JUMP = 6              //跳过按钮
    private static ROLE_LEFT = 1
    private static ROLE_RIGHT = 2
    private static AUTO_SKIP_TIME = 5
    private static DEFAULT_SOUND_LENGTH = 10

    private _touchId: number;
    private _touchList: any[];
    private _soundList: any[];
    private _idx: number;
    private _startTime: number;
    private _roles: PopupStoryChatNode[];
    private _startPlay: boolean;
    private _callbackHandler;
    private _jumpCallback;
    private _isTutorial: boolean;
    private _nowPlayId;
    private _hasSound: boolean;
    private _signalSpineLoaded;
    private _spineIdList: number[];
    private _myHeroId: number;
    private _soundLength: number;

    public onCreate() {
        this.node.setContentSize(G_ResolutionManager.getDesignCCSize());
        let resolutionSize = G_ResolutionManager.getDesignCCSize();
        this._panelCover.setContentSize(resolutionSize.width * 2, resolutionSize.height * 2);
        this._panelTouch.setContentSize(resolutionSize);
        this._panelTouch.on(cc.Node.EventType.TOUCH_START, handler(this, this.onPanelTouch));
    }

    public updateUI(touchId, callback, isTutorial?) {
        this._touchId = touchId;
        this._callbackHandler = callback;
        this._isTutorial = isTutorial;

        this._initData();

        this._panelCover.zIndex = (PopupStoryChat.ZORDER_COVER);
        this._panelChat.zIndex = (PopupStoryChat.ZORDER_CONTENT_PANEL);
        this._panelTouch.zIndex = (PopupStoryChat.ZORDER_TOUCH);
        this._imageJump.zIndex = (PopupStoryChat.ZORDER_JUMP);

        this._panelChat.active = (false);

        this._cacheSpine();

        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);


        this._playNext();
    }

    private _initData() {
        this._touchList = [];
        this._soundList = [];
        this._idx = -1;
        this._startTime = 0;
        this._roles = [];
        this._startPlay = false;

        this._jumpCallback = null;
        this._nowPlayId = null;
        this._hasSound = false;
        this._signalSpineLoaded = null;
        this._spineIdList = [];
        this._myHeroId = G_UserData.getHero().getRoleBaseId();
        this._soundLength = PopupStoryChat.DEFAULT_SOUND_LENGTH;

        this._setStoryChatData();
    }


    private _setStoryChatData() {
        this._spineIdList = [];
        let StoryChat = G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAT);
        var count = StoryChat.length();
        for (let i = 0; i < count; i++) {
            var touch = StoryChat.indexOf(i);
            if (touch.story_touch == this._touchId) {
                this._touchList.push(touch);
            }
        }
        for (let i = 0; i < this._touchList.length; i++) {
            var touch = this._touchList[i];
            // TODO:G_AudioManager
            // var sound = touch.common_sound;
            // var myHeroId = this._myHeroId;
            // if (myHeroId) {
            //     if (G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(myHeroId).gender == 2) {
            //         sound = touch.common_sound2;
            //     }
            // }
            // var soundPath = Path.getSkillVoice(sound);
            // G_AudioManager.preLoadSound(soundPath);
            // this._soundList.push(soundPath);
            if (touch.story_res1 != 1) {
                this._addSpine(touch.story_res1);
            }
            if (touch.story_res2 != 1) {
                this._addSpine(touch.story_res2);
            }
            if (this._myHeroId != null) {
                this._addSpine(this._myHeroId);
            }
        }
        this._touchList.sort(function (a, b) {
            return a.step - b.step;
        });
    }

    private _addSpine(id) {
        var heroData = G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(id);
        if (!heroData) {
            return;
        }
        var resId = heroData.res_id;
        var resData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(resId);
        var spineId = resData.story_res_spine;
        if (spineId == 0) {
            return;
        }
        if (this._spineIdList.indexOf(spineId) <= -1) {
            this._spineIdList.push(spineId);
        }

    }

    private _cacheSpine() {
        // for (let i = 0; i < this._spineIdList.length; i++) {
        //     G_SpineManager.loadSpine(Path.getStorySpine(this._spineIdList[i]));
        // }
        for (let i = 0; i < this._spineIdList.length; i++) {
            // G_SpineManager.loadSpine(Path.getStorySpine(this._spineIdList[i]));
            cc.resources.load(Path.getStorySpine(this._spineIdList[i]),cc.SpriteFrame);
        }
    }

    public onExit() {
        for (let i = 0; i < this._soundList.length; i++) {
            var v = this._soundList[i];
            G_AudioManager.unLoadSound(v);
        }
        // this._signalSpineLoaded.remove();
        // this._signalSpineLoaded = null;
        // G_SpineManager.removeSpineLoadHandlerByTarget(this);
    }

    public onClose() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        if (this._nowPlayId) {
            G_AudioManager.stopSound(this._nowPlayId);
            this._nowPlayId = null;
        }
        if (this._callbackHandler) {
            this._callbackHandler();
            this._callbackHandler = null;
        }
        for (let i = 0; i < this._roles.length; i++) {
            if (this._roles[i]) {
                this._roles[i].node.destroy();
            }
        }
        this._roles = [];
    }

    private _playNext() {
        // console.log("_playNext:", this._idx);
        this._startPlay = false;
        this._idx = this._idx + 1;
        if (this._idx >= this._touchList.length) {
            this._talkEnd();
            return;
        }
        this._startPlay = true;
        this._startTime = 0;
        this._refreshTalk();
    }

    private _refreshTalk() {
        // console.log("_refreshTalk:", this._idx);
        this._refreshTalker();
        this._refreshListener();
    }

    private _refreshTalker() {
        // console.log("_refreshTalker:", this._idx);
        var talkData = this._touchList[this._idx];
        var speakerPos = talkData.speaker_position;
        var role = this._roles[speakerPos];
        if (role == null) {
            this._setStoryChatNode(talkData.story_res1, speakerPos, PopupStoryChat.ZORDER_TALKER);
        } else if (role && role.getHeroId() != talkData.story_res1) {
            role.leaveStage();
            this._setStoryChatNode(talkData.story_res1, speakerPos, PopupStoryChat.ZORDER_TALKER);
        } else {
            this._refreshTalkContent();
            role.node.zIndex = PopupStoryChat.ZORDER_TALKER;
        }
    }

    private _refreshListener() {
        // console.log("_refreshListener:", this._idx);
        var talkData = this._touchList[this._idx];
        var speakerPos = talkData.speaker_position;
        var listenPos = PopupStoryChat.ROLE_RIGHT;
        if (speakerPos == PopupStoryChat.ROLE_RIGHT) {
            listenPos = PopupStoryChat.ROLE_LEFT;
        }
        var role = this._roles[listenPos];
        if (role) {
            role.node.zIndex = (PopupStoryChat.ZORDER_LINSTER);
        }
        var res2 = talkData.story_res2;
        if (res2 == 0 || res2 == 999) {
            return;
        }
        if (role && role.getHeroId() == res2) {
            return;
        }
        if (role) {
            role.leaveStage();
            this._roles[listenPos] = null;
        }

        this._setStoryChatNode(res2, listenPos, PopupStoryChat.ZORDER_LINSTER);
    }

    private _setStoryChatNode(storyRes, pos: number, zIndex: number) {
        // console.log("_setStoryChatNode:", this._idx);
        let chatNode: PopupStoryChatNode = cc.instantiate(this._popupStoryChatNodePrefab).getComponent(PopupStoryChatNode);
        this.node.addChild(chatNode.node);
        this._roles[pos] = chatNode;
        this._roles[pos].node.zIndex = zIndex;
        chatNode.updateUI(storyRes, pos, this._myHeroId);
        chatNode.enterStage(handler(this, this._refreshTalkContent));
    }

    private _refreshTalkContent() {
        // console.log("_refreshTalkContent:", this._idx);
        this._panelChat.active = (true);
        var talkData = this._touchList[this._idx];
        var showName = talkData.name1;
        if (talkData.name1 == Lang.get('main_role')) {
            showName = G_UserData.getBase().getName();
        }
        this._chatName.string = (showName);
        var substance = talkData.substance;
        var sound = talkData.common_sound;
        var myHeroId = this._myHeroId;
        if (myHeroId) {
            if (G_ConfigLoader.getConfig(ConfigNameConst.HERO).get(myHeroId).gender == 2) {
                sound = talkData.common_sound2;
                substance = talkData.substance2;
            }
        }
        var richText = this._parseDialogueContent(substance, 26,
            Colors.getChatNormalColor(), this._chatContent.getContentSize());

        RichTextExtend.setRichText(this._chatContent.getComponent(cc.RichText), richText);
        this._hasSound = false;
        // TODO:G_AudioManager
        // if (G_AudioManager.isSoundEnable() && sound != '') {
        //     var mp3 = Path.getSkillVoice(sound);
        //     if (this._nowPlayId) {
        //         G_AudioManager.stopSound(this._nowPlayId);
        //         this._nowPlayId = null;
        //     }
        //     this._nowPlayId = G_AudioManager.playSound(mp3);
        //     this._soundLength = Math.ceil(G_ConfigLoader.getConfig(ConfigNameConst.STORY_CHAT_LENGTH).get(sound).length / 1000);
        //     this._hasSound = true;
        // }
    }

    private _talkEnd() {
        // console.log("_talkEnd:", this._idx);
        this._startPlay = false;
        this.close();
    }

    public onPanelTouch() {
        this._playNext();
    }

    public setJumpCallback(callback) {
        this._jumpCallback = callback;
    }

    public onJumpTouch() {
        if (this._jumpCallback) {
            this._jumpCallback();
        }
        this._talkEnd();
    }

    update(f) {
        if (this._startPlay) {
            this._startTime = this._startTime + f;
            if (!this._hasSound) {
                if (this._startTime >= PopupStoryChat.AUTO_SKIP_TIME) {
                    this._playNext();
                }
            } else {
                if (this._soundLength != 0 && this._startTime >= this._soundLength) {
                    this._playNext();
                }
            }
        }
    }

    private _parseDialogueContent(dialogueContent: string, fontSize, fontColor, contentSize): any[] {
        var content = dialogueContent;
        var contents = [];
        var lastIndex = -1;
        while (true) {
            var headIndex = content.indexOf("#", lastIndex + 1);
            var tailIndex;
            if (headIndex > -1) {
                tailIndex = content.indexOf("#", headIndex + 1);
            } else {
                contents.push({
                    content: content.substr(lastIndex + 1),
                    isKeyWord: false
                });
                break;
            }
            if (headIndex > lastIndex + 1) {
                contents.push({
                    content: content.substring(lastIndex + 1, headIndex),
                    isKeyWord: false
                });
            }
            if (headIndex > -1 && tailIndex > -1) {
                if (tailIndex > headIndex + 1) {
                    contents.push({
                        content: content.substring(headIndex + 1, tailIndex),
                        isKeyWord: true
                    });

                }
                lastIndex = tailIndex;
            } else {
                if (headIndex + 1 < dialogueContent.length) {
                    contents.push({
                        content: content.substring(headIndex + 1),
                        isKeyWord: false
                    });
                }
                break;
            }
        }
        var richTextContents = [];
        for (let i = 0; i < contents.length; i++) {
            let con = contents[i];
            richTextContents.push({
                type: 'text',
                msg: con.content,
                color: this._colorToNumber(con.isKeyWord && new cc.Color(255, 0, 0) || fontColor),
                fontSize: fontSize,
                opacity: 255
            });
        }

        return richTextContents;
    }

    private _onEventSoundEnd(eventName, soundId) {
        if (this._nowPlayId == soundId) {
            this._nowPlayId = null;
            this._playNext();
        }
    }

    private _colorToNumber(color: cc.Color) {
        if (color == null) {
            return;
        }
        let num = 0;
        num += color.getR() * 65536;
        num += color.getG() * 256;
        num += color.getB();
        return num;
    }
}