local ViewBase = require("app.ui.ViewBase")
local UIControlView = class("UIControlView", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UIHelper = require("yoka.utils.UIHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
--演示UI基础控件， 演示界面
--基础控件测试用例

local QinTombAvatar = require("app.scene.view.qinTomb.QinTombAvatar")

-- local avatar = QinTombAvatar.new(self._mapNode)
-- avatar:syncVisible(false)
-- avatar:setPosition(QinTombConst.TEAM_AVATAR_IDLE_POS[i])
-- self._nodeRole:addChild(avatar)
-- avatar:setName("_commonHeroAvatar"..i)

function UIControlView:ctor()
    --
    local resource = {
        file = Path.getCSB("UIControlView", "uicontrol"),
        size = {1136, 640},
        binding = {
			_btnPopUpOnce = {
				events = {{event = "touch", method = "onBtnOnceClick"}}
			},
           _btnPopUpItemUse = {
				events = {{event = "touch", method = "onBtnItemUse"}}
			},
           _btnPopupReward1 = {
                events = {{event = "touch", method = "onBtnPopReward1"}}
           },
           _btnPopupReward2 = {
                events = {{event = "touch", method = "onBtnPopReward2"}}
           },
           _btnPopupAdvance = {
                events = {{event = "touch", method = "onBtnAdvance"}}
           },
           _btnPopupPlayerLevel = {
                events = {{event = "touch", method = "onBtnLevelUp"}}
           },
           _btnPopupPackage = {
                events = {{event = "touch", method = "onBtnPackage"}}
           },
           _btnPopupHelp = {
                events = {{event = "touch", method = "onBtnHelp"}}
           },
           _btnPromptTip = {
                events = {{event = "touch", method = "onBtnPromptTip"}}
           },
          _btnChooseReward = {
                events = {{event = "touch", method = "onBtnChooseReward"}}
           },
           _btnBoxReward = {
                events = {{event = "touch", method = "onBtnBoxReward"}}
           },
           _btnLogicCheck = {
                events = {{event = "touch", method = "onBtnLogicCheck"}}
           },
           _btnSystemAlert = {
                events = {{event = "touch", method = "onBtnSystemAlert"}}
           },
           _btnEffectTest = {
                events = {{event = "touch", method = "onEffectTest"}}
           },
           _btnItemGuiderPop = {
               events = {{event = "touch", method = "onBtnItemGuiderPop"}}
           },
           _btnFilpCard = {
               events = {{event = "touch", method = "onBtnFlipCard"}}
           },
           _btnMovingEffect = {
               events = {{event = "touch", method = "onMovingEffectTest"}}
           },
           _btnCountdownEffect = {
            events = {{event = "touch", method = "onCountdownEffect"}}
           },
           _commonButtonSwitchLevel1 = {
               events = {{event = "touch", method = "onSwitchBtnLevel1"}}
           },
           _commonButtonSwitchLevel2 = {
               events = {{event = "touch", method = "onSwitchBtnLevel2"}}
           },
           _level0Btn = {
                 events = {{event = "touch", method = "onLevel0Btn"}}
           },
		}
    }

    self:controlInit()
    UIControlView.super.ctor(self, resource)
    self._promptIndex  =1
end


function UIControlView:controlInit()
     self._commonItemIcon = nil -- 通用UI的Icon
end
--
function UIControlView:isRootScene()
    return true
end

--
function UIControlView:onCreate()
   
end

--
function UIControlView:onLevel0Btn( ... )
    -- body
    self._commonStar:setCount(1,5)
    self._commonStar:playStar(1)
end

function UIControlView:onEnter()
    self:initUI()
   
    --local RichTextHelper = require("app.utils.RichTextHelper")
    --RichTextHelper.parse2SubTitleExtend("#110#恭喜#name#从#0xffffff黄金宝箱中#获得#equipment#！")

    local RollNoticeHelper = require("app.scene.view.rollnotice.RollNoticeHelper")
    local richText = RollNoticeHelper.makeRichMsgFromServerRollMsg(
        {
            msg = "恭喜#name#将#hero#成功突破到#level#，战力大涨！",
            noticeType = 2,
            param = "何景|1|2,曹操|2|4,2"
        }
    )

    local widget = ccui.RichText:createWithContent(richText)
    widget:setPosition(800,300)
    self:addChild(widget)

    local avatar = QinTombAvatar.new()
    avatar:syncVisible(true)
    avatar:setPosition(cc.p(500, 200))
    self:addChild(avatar)
    avatar._commonHeroAvatar:updateUI(211)

    avatar:turnBack()

    local FlashPlayer = require("app.flash.FlashPlayer")
    local hero, shadow = avatar._commonHeroAvatar:getFlashEntity()
	-- local attackId = getAttackAction()
	-- local hero_skill_play = require("app.config.hero_skill_play")
	-- local skillData = hero_skill_play.get(attackId)
	-- if skillData then
	-- 	if self._flashObj then
	-- 		self._flashObj:finish()
	-- 		self._flashObj = nil
	-- 	end
		local ani = Path.getAttackerAction(211001)
		self._flashObj = FlashPlayer.new(hero, shadow, ani, 1, avatar._commonHeroAvatar, true )
		self._flashObj:start()
	-- end
end

--
function UIControlView:onExit()

end


local function seekSpAndFilter(p_node,p_state)

    if( p_node == nil ) then return end
    local children=p_node:getChildren()
    if(#children>0)then
        for i=1,#children do
            seekSpAndFilter(children[i],p_state)
        end
    else
        local render =nil
        if(tolua.type(p_node)=="ccui.ImageView")then
            render = p_node:getVirtualRenderer():getSprite()
        elseif(tolua.type(p_node)=="cc.Sprite")then
            render = p_node
        elseif(tolua.type(p_node)=="cc.Scale9Sprite")then
            render = p_node:getSprite()
        end

        if(render~=nil)then
            render:setGLProgramState(p_state)
        end
    end
end

--
function UIControlView:initUI()
    --uicomponent 绑定icon
    self._commonItemIcon:updateUI(1)
    --self._commonItemIcon:setCount(100)
    self._commonItemIcon:setIconMask(true)
    self._commonItemIcon:showName(true)
    
    seekSpAndFilter(self._commonItemIcon, cc.GLProgramState:getOrCreateWithGLProgramName("ShaderUIGrayScale"))
    
    local richText = Lang.get("lang_arena_battle_desc", 
    {
        player1 = "action1", 
        playerColor1 =  Colors.colorToNumber( Colors.getOfficialColor(1) ),
        playerOutColor1 = Colors.colorToNumber( Colors.getOfficialColorOutline(1) ),
		player2 = "action2", 
        playerColor2 =  Colors.colorToNumber( Colors.getOfficialColor(2) ),
        playerOutColor2 =Colors.colorToNumber( Colors.getOfficialColorOutline(2) ),
    })
    local widget = ccui.RichText:createWithContent(richText)
    self:addChild(widget)
    widget:setAnchorPoint(cc.p(0,0))
    widget:setPosition(620,600)


    self._commonHeroIcon:updateUI(205)
    self._commonHeroIcon:setCount(1)


    self._commonEquipIcon:updateUI(101)
    self._commonEquipIcon:setCount(10)
    self._commonEquipIcon:setTopNum(100)



    self._commonFragmentIcon1:updateUI(1205)
    self._commonFragmentIcon1:setCount(10)
   -- self._commonFragmentIcon2:updateUI(2101)
  --  self._commonFragmentIcon2:setCount(100)


    self._commonResIcon:updateUI(1)
    self._commonResIcon:setCount(10)


    --动态创建Icon
    local createIcon1 = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_HERO, 205)
    createIcon1:setPosition(100,250)
    createIcon1:setScale(0.8)
    self:getResourceNode():addChild(createIcon1)

    local createIcon2 = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_EQUIPMENT, 101)
    createIcon2:setPosition(200,250)
    createIcon2:setScale(0.8)
    self:getResourceNode():addChild(createIcon2)


    local createIcon3 = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_ITEM, 101)
    createIcon3:showName(true)
    createIcon3:setPosition(300,250)
    createIcon3:setScale(0.8)
    self:getResourceNode():addChild(createIcon3)

    local createIcon4 = ComponentIconHelper.createIcon(TypeConvertHelper.TYPE_FRAGMENT, 1205)
    createIcon4:setPosition(400,250)
    createIcon4:setScale(0.8)
    self:getResourceNode():addChild(createIcon4)


    --按钮回调
    self._btnPopUpOnce:setString("买一次弹框")

    self._btnPopUpItemUse:setString("使用弹框")

    self._btnPopupReward1:setString("奖励3个")
    self._btnPopupReward2:setString("奖励11个")

    self._btnPopupAdvance:setString("进阶成功")
    self._btnPopupPlayerLevel:setString("玩家升级")

    self._btnPopupPackage:setString("背包满了")
    self._btnPopupHelp:setString("帮助")
    self._btnPromptTip:setString("4种提示")

    local function resetIcon()
        self._commonIconTemplate:unInitUI()
        self._commonIconTemplate:initUI(TypeConvertHelper.TYPE_FRAGMENT, 1205,100)
        self._commonIconTemplate:setName("模板Icon碎片")
        self._commonIconTemplate:setCallBack(resetIcon)
        logWarn("resetIcon")
    end

    self._commonIconTemplate:initUI(TypeConvertHelper.TYPE_ITEM, 101,100)
    self._commonIconTemplate:setName("模板Icon物品")
    self._commonIconTemplate:setCallBack(resetIcon)


    self._btnChooseReward:setString("选择奖励")

    self._btnBoxReward:setString("章节奖励弹框")
    


    self._btnLogicCheck:setString("逻辑检查")

    local function clickTest()
        logWarn("click@@@@xxxxxxxxxxxxxxxxxxxx")
    end
    self._commonHeroAvatar:setCallBack(clickTest)

    self._btnSystemAlert:setString("系统弹框")

    self._btnEffectTest:setString("测试特效")

    self._btnItemGuiderPop:setString("物品获得")
    self._btnFilpCard:setString("翻卡弹框")

    self._btnMovingEffect:setString("Moving特效")

    self._commonButtonSwitchLevel1:setString("按钮切换")
    self._commonButtonSwitchLevel2:setString("按钮切换")
    self._btnCountdownEffect:setString("倒计时")


    self._commonHeroAvatar:updateUI(403)
    self._commonHeroAvatar:setBubble("哈哈哈嘿嘿", nil, 2)

    --动画测试
    -- local FlashHelper = require("app.utils.FlashHelper")
    -- local hero, shadow = self._commonHeroAvatar:getFlashEntity()
    -- local ani = Path.getAttackerAction("403003")
    -- local ani = Path.getAttackerAction("hitfly")
    -- local ani = Path.getTargetAction("dying")
    -- local flash = FlashHelper.new(hero, shadow, ani, -1, self._commonHeroAvatar, true)
    -- flash:start()
    -- _commonHeroAvatar

end

function UIControlView:onBtnOnceClick()
    local function callBackFunction(buyItemId)
        logWarn("confirm PopupBuyOnce item id is id: "..buyItemId)
        return false
    end

    local PopupBuyOnce = require("app.ui.PopupBuyOnce").new("aa",callBackFunction)
    PopupBuyOnce:updateUI(TypeConvertHelper.TYPE_ITEM,2)
    PopupBuyOnce:setCostInfo(TypeConvertHelper.TYPE_RESOURCE,3,100)
    PopupBuyOnce:openWithAction()
end


--物品使用弹窗
function UIControlView:onBtnItemUse()
    local function callBackFunction(itemId,count)
        logWarn("confirm PopupBuyOnce item id is id: "..itemId.."  count: "..count)
        return false
    end

    local BlackList = require("app.utils.BlackList")
    for k,v in ipairs(100000) do
        local src = ""
        logWarn(src)
        local content = BlackList.filterBlack(src) --过滤禁词
        logWarn(content)
    end

    local PopupItemUse = require("app.ui.PopupItemUse").new("aa",callBackFunction)
    PopupItemUse:updateUI(TypeConvertHelper.TYPE_ITEM, 2)
    PopupItemUse:setMaxLimit(10)
    PopupItemUse:setTextTips("嘿嘿")
    PopupItemUse:setOwnerCount(100)
    PopupItemUse:openWithAction()
end

--奖励弹窗
function UIControlView:onBtnPopReward2()

   local awards11 = {
        [1] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [4] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [5] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [6] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [7] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [8] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [9] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [10] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
        [11] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 2409, size = 10},
    }

    local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    PopupGetRewards:showRewards(awards11)
     
end


--奖励弹窗
function UIControlView:onBtnPopReward1()

    local awards3 = {
        [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
    }
    local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    PopupGetRewards:showRewards(awards3)
   --  
end


--进阶成功
function UIControlView:onBtnAdvance()

 

end


--进阶成功
function UIControlView:onBtnLevelUp()

 
    local PopupPlayerLevelUp = require("app.ui.PopupPlayerLevelUp").new()
    local attrList = {
        [1] = {desc = "等  级：", oldValue = 9, newValue = 10},
        [2] = {desc = "等  级：", oldValue = 18, newValue = 20},
        [3] = {desc = "等  级：", oldValue = 127, newValue = 137},
    }
    PopupPlayerLevelUp:updateUI(attrList)
    PopupPlayerLevelUp:open()
end


--包裹已满
function UIControlView:onBtnPackage()


end


--帮助界面
function UIControlView:onBtnHelp()

 
    local PopupHelp = require("app.ui.PopupHelp").new()
    local helpList = {
        [1] = {title = "帮助标题1", content = Lang.get("lianbao_activity_txt_help")},
        [2] = {title = "帮助标题2", content = Lang.get("lianbao_activity_txt_help")},
    }
    PopupHelp:updateUI(helpList)
    PopupHelp:openWithAction()
end


--提示信息
function UIControlView:onBtnPromptTip()

    local randomIndex = self._promptIndex 

    if randomIndex == 1 then
        G_Prompt:showTip("提示文字")
    end

    
    if randomIndex == 2 then
        local awards3 = {
            [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
            [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
            [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
        }
        G_Prompt:showAwards(awards3)
    end


    if randomIndex == 3 then
        local summary = {}
        local dst = cc.p(display.cx, display.cy +100)

        table.insert(summary,  {content = Lang.get("equip_master_new_level",{name=Lang.get("equip_master_tab_3"), level=1})} )
        table.insert(summary,  {content = Lang.get("equip_master_new_level",{ name=Lang.get("equip_master_tab_3"), level=1})} )
        G_Prompt:showSummary(summary)
    end

    if randomIndex == 4 then
        local summary = {}
        local dst = cc.p(display.cx, display.cy +200)

        table.insert(summary,  { content = Lang.get("equip_master_new_level",{name=Lang.get("equip_master_tab_3"), level=1}) , group = 1})
        table.insert(summary,  { content = Lang.get("equip_master_new_level",{name=Lang.get("equip_master_tab_3"), level=1}) , group = 2}) 
        G_Prompt:showTextSummary(summary)
    end
    self._promptIndex = self._promptIndex + 1

    if self._promptIndex > 4 then
        self._promptIndex = 1
    end
end


--选择奖励
function UIControlView:onBtnChooseReward()

 
    local PopupSelectReward = require("app.ui.PopupSelectReward").new()
    local awards3 = {
        [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
         [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
    }
    PopupSelectReward:updateUI(awards3)
    PopupSelectReward:openWithAction()
end

--章节奖励弹窗
function UIControlView:onBtnBoxReward()
    local PopupBoxReward = require("app.ui.PopupBoxReward").new()
    local awards3 = {
        [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
        [4] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
        [5] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
    }
    PopupBoxReward:updateUI(awards3)
    PopupBoxReward:openWithAction()
end


--逻辑检查
function UIControlView:onBtnLogicCheck()
    --check ok
    local checkParams = {
        [1] = { funcName = "enoughLevel",param = 1, errorMsg = "level not enough"},  --检查玩家等级
        [2] = { funcName = "enoughMoney", param = 1, errorMsg = "money not enough"},  --检查玩家银币
        [3] = { funcName = "enoughCash",param = 1, errorMsg = "cash not enough"},  --检查玩家元宝
    }
    --执行成功后回调
    LogicCheckHelper.doCheckList(checkParams, function()
        logDebug("LogicCheckHelper.doCheckList check ok")
        G_Prompt:showTip("LogicCheckHelper.doCheckList check ok")
    end)

    -----------------------------------------------------
    --check error
    local checkParams2 = {
        [1] = { funcName = "enoughLevel",param = 1, errorMsg = "level not enough"},  --检查玩家等级
        [2] = { funcName = "enoughMoney", param = 100, errorMsg = "money not enough"},  --检查玩家银币
        [3] = { funcName = "enoughCash",param = 99999999, errorMsg = "cash not enough"},  --检查玩家元宝
    }
    
    local success, errorMsg = LogicCheckHelper.doCheckList(checkParams2, function()
        logDebug("check ok")
    end)

    --元宝不通过，做弹出提示
    if success == false and errorMsg then
        G_Prompt:showTip(errorMsg)
    end


    -----------------------------------------------------
    --check one
    local success, errorMsg = LogicCheckHelper.doCheck("enoughCash", 99, function()
         logDebug("LogicCheckHelper.doCheck check ok")
    end)

    if success == false  then
        G_Prompt:showTip(" LogicCheckHelper.doCheck enoughCash not enough")
    end

end

function UIControlView:onBtnSystemAlert()
    local itemParams = TypeConvertHelper.convert(6, 10, 20)
    if itemParams == nil then
        return
    end

    local moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND)
    local richList = {}
    local richText1 = Lang.get("auction_add_price1", 
    {
        resIcon = Path.getResourceMiniIcon(1), 
        resNum =  18888,
		resName = moneyParams.name,
    })
    local richText2 = Lang.get("auciton_buy_item", 
    {
        itemName = itemParams.name,
		itemColor = Colors.colorToNumber(itemParams.icon_color), 
        outColor =  Colors.colorToNumber(itemParams.icon_color_outline ),
        itemNum = itemParams.size,
        outSize = 2,
    })
    table.insert( richList, richText1)
    table.insert( richList, richText2)
   -- local widget = ccui.RichText:createWithContent(richText)

    --local buyHeroAlert = Lang.get("shop_buy_hero_alert")
    
    local PopupAlert = require("app.ui.PopupAlert").new("系统提示","")
    --local contentSize = PopupSystemAlert:getTextSize()
   -- local node = UIHelper.createRichTextFrame(richList)
   -- dump(node)
    --node:setPosition(cc.p(contentSize.width*0.5, contentSize.height*0.5))
    PopupAlert:addRichTextList(richList)
    PopupAlert:openWithAction()
end
--测试闭包函数
function UIControlView:onTestCloserFunc()
    local node = cc.Node:create()
    self:getResourceNode():addChild(node)

    local function closerFunc()
        node:setVisible(true)
    end
    local action1 = cc.DelayTime:create(0.3)
    local action2 = cc.RemoveSelf:create()
    local action3 = cc.CallFunc:create(closerFunc)
    
    local seq =  cc.Sequence:create(action1, action2, action3)
    node:runAciton(seq)
end

--测试特效
function UIControlView:onEffectTest()
    -- 法宝抽卡动画
    local function onShineEvent(event, ...)
        if event == "shine" then
			 print("onShineEvent")
		end
    end

    G_EffectGfxMgr:createPlayGfx(self, "effect_chouka_huode", onShineEvent, false,cc.p(display.cx, display.cy)  )
end

function UIControlView:onMovingEffectTest()
    local awards = {
        [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
        [4] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
    }
end

function UIControlView:onCountdownEffect()
    local textureList = {
        "img_runway_star.png",
        "img_runway_star1.png",
        "img_runway_star2.png",
        "img_runway_star3.png",
    }

    self._countdownAnimation:setTextureList(textureList)
    self._countdownAnimation:playAnimation(4, 1, function()
        print("onCountdownEffect callback")
    end)
end

function UIControlView:onBtnItemGuiderPop()
   
    local PopupItemGuider = require("app.ui.PopupItemGuider").new("物品获得")
    PopupItemGuider:updateUI(5,2)
    PopupItemGuider:openWithAction()


   local PopupNewFunction = require("app.ui.PopupNewFunction").new(FunctionConst.FUNC_DRAW_HERO)
    PopupNewFunction:openWithAction()


    local UIPopupHelper = require("app.utils.UIPopupHelper")
    UIPopupHelper.showOfflineDialog(Lang.get("sdk_platform_mantain"), true)
end



function UIControlView:onBtnFlipCard()
 
     local awards3 = {
        [1] = {type = TypeConvertHelper.TYPE_HERO, value = 205, size = 10},
        [2] = {type = TypeConvertHelper.TYPE_ITEM, value = 1, size = 10},
        [3] = {type = TypeConvertHelper.TYPE_FRAGMENT, value = 1205, size = 10},
    }

    local function onCloseClick()
        logWarn("啊啊啊啊啊啊啊")
    end
    local PopupFlipCard = require("app.ui.PopupFlipCard").new(onCloseClick)
    PopupFlipCard:updateUI(awards3)
    PopupFlipCard:openWithAction()


end

function UIControlView:onSwitchBtnLevel1()
    self._commonButtonSwitchLevel1:reverseUI()

  --  local PopupNewFunction = require("app.ui.PopupNewFunction").new(FunctionConst.FUNC_DRAW_HERO)
  --  PopupNewFunction:open()

  --  local PopupComboHeroGift = require("app.ui.PopupComboHeroGift").new()
  --  PopupComboHeroGift:open()

    --local PopupOfficialRankupResult = require("app.scene.view.official.PopupOfficialRankupResult").new()
---PopupOfficialRankupResult:updateUI(2)
    --PopupOfficialRankupResult:open()


    require("app.scene.view.petMerge.PetMerge").create(8, 1)
   --[[
    local rankUpInfo ={
        award = {type=5, value=1, size = 1000},
        newRank = 4093,
        oldRank = 5011,
    }
    local PopupRankUpReward = require("app.scene.view.arena.PopupRankUpReward").new(rankUpInfo)
    PopupRankUpReward:showUI()
    ]]
end

UIControlView.CLICK_NUM = 4
function UIControlView:onSwitchBtnLevel2()
    self._commonButtonSwitchLevel2:reverseUI()
    --[[
    local MovieConst = require("app.const.MovieConst")
    local PopupMovieText = require("app.ui.PopupMovieText").new(UIControlView.CLICK_NUM)
    PopupMovieText:showUI("一","英雄出师",Lang.get("chapter_content"))
    UIControlView.CLICK_NUM = UIControlView.CLICK_NUM + 1
    if UIControlView.CLICK_NUM > MovieConst.TYPE_CHAPTER_END then
         UIControlView.CLICK_NUM = MovieConst.TYPE_LOGIN_START
    end
    ]]

       --[[
    local BattleDataHelper = require("app.utils.BattleDataHelper")
    local battleData = {
        battleType = BattleDataHelper.BATTLE_TYPE_ARENA,
        attackBaseId = 1,
        defenseBaseId = 2,
        attackName = "xx",
        defenseName = "bb",
        defenseOffLevel = 4,
        attackOffLevel = 1,
        firstOrder = 2,
        attackPower = 11111111112222,
        defensePower = 22222222222,
    }
    local fightStart = require("app.scene.view.fight.FightStart").new(battleData)
	self:addChild(fightStart)
    ]]

    local BattleDataHelper = require("app.utils.BattleDataHelper")
    local battleData = {
        battleType = BattleDataHelper.BATTLE_TYPE_TERRITORY,
        money = 0,--message.territory_money
        exp =100,-- message.territory_exp
    }
    battleData.awards = {}
    local award = {
        type = 5,
        value = 1,
        size = 10,
    }
    table.insert(battleData.awards, award)
    battleData.addAwards = {}

   -- local Settlement = require("app.scene.view.settlement.Settlement")
   -- Settlement._BATTLE_TYPE_TERRITORY(battleData, function() end)
  

	local itemParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, 205, 5)
    if itemParams == nil then
        return
    end
    local moneyParams = TypeConvertHelper.convert(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND)
    local richText1 = Lang.get("auction_buyer_replace", 
    {
        itemName = itemParams.name,
		itemColor = Colors.colorToNumber(itemParams.icon_color), 
        outlineColor =  Colors.colorToNumber(itemParams.icon_color_outline ),
        itemNum = 5,
        resName = moneyParams.name,
    })
	
    G_Prompt:showTip(richText1)
    
end


return UIControlView


