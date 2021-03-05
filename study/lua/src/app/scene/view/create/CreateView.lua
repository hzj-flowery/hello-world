local ViewBase = require("app.ui.ViewBase")
local CreateView = class("CreateView", ViewBase)
local AudioConst = require("app.const.AudioConst")
CreateView.MAN_SPINE_RES_ID = 1
CreateView.FEMALE_SPINE_RES_ID = 11

function CreateView:ctor()
    self._defaultName = nil
    self._sex = 1
    self._nameText = nil
    self._editBox = nil

    self._nodeTitle = nil
    self._nodeTitle2 = nil

    self:_seekActivateCodeName()

    local resource = {
        file = Path.getCSB("CreateView", "create"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _btnCreate = {
                events = {{event = "touch", method = "_onCreateRole"}}
            },
            _btnRandom = {
                events = {{event = "touch", method = "_onPlaceRandomName"}}
            },
            _btnMale = {
                events = {{event = "touch", method = "_onTouchMale"}}
            },
            _btnFemale = {
                events = {{event = "touch", method = "_onTouchFemale"}}
            }
        }
    }
    CreateView.super.ctor(self, resource, 9999)
end

function CreateView:isRootScene()
    return true
end

function CreateView:onCreate()
    local InputUtils = require("app.utils.InputUtils")
    self._editBox =
        InputUtils.createInputView(
        {
            bgPanel = self._panelInput,
            fontSize = 26,
            fontColor = Colors.INPUT_CREATE_ROLE,
            placeholder = Lang.get("lang_input_name_tip"),
            textLabel = self._nameText,
            inputEvent = function(eventevent, edit)
                if event == "return" then
                    local name = self._nameText:getString()
                    if not name or name == "" then
                        self:_onPlaceRandomName()
                    end
                end
            end,
            maxLength = 7
        }
    )

    if self._defaultName then
        self:_setName(self._defaultName)
    else
        self:_onPlaceRandomName()
    end

    self:_updateView()

    local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgEffect, "moving_xuanjue_back", nil, nil, false)
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeFrontEffect, "moving_xuanjue_front", nil, nil, false)
end

function CreateView:_updateView()
    G_HeroVoiceManager:playRoleVoiceWithSex(self._sex)
    G_AudioManager:playSoundWithId(
        self._sex == 1 and AudioConst.SOUND_CREATE_ROLE_MAN or AudioConst.SOUND_CREATE_ROLE_WOMEN
    )
    self._btnMale:setEnabled(self._sex ~= 1)
    self._btnFemale:setEnabled(self._sex == 1)
    --self._imageMaleLight:setVisible(self._sex == 1)
    --self._imageFemaleLight:setVisible(self._sex ~= 1)

    ---切换按钮显示状态
    --[[
	if self._sex == 1 then
		self._nodeMale:setScale(1.2)
		self._nodeFemale:setScale(1.0)
		self._nodeFemale:setColor(cc.c3b(255*0.4, 255*0.4, 255*0.4))
		self._nodeMale:setColor(cc.c3b(255, 255, 255))
	else
		self._nodeMale:setScale(1.0)
		self._nodeFemale:setScale(1.2)
		self._nodeFemale:setColor(cc.c3b(255, 255, 255))
		self._nodeMale:setColor(cc.c3b(255*0.4, 255*0.4, 255*0.4))
	end
	]]
    local isMale = self._sex == 1
    local isFemale = not isMale
    self._nodeTitle:setVisible(isMale)
    self._nodeTitle2:setVisible(isFemale)

    self._nodeHeroSpine:updateUI(
        self._sex == 1 and CreateView.MAN_SPINE_RES_ID or CreateView.FEMALE_SPINE_RES_ID,
        "_come"
    )
    self._nodeHeroSpine:showShadow(false)
    self._nodeHeroSpine:setScale(2)
    self._nodeHeroSpine:playAnimationOnce("skill_come")

    self._nodeHeroSpine2:updateUI(
        self._sex == 1 and CreateView.MAN_SPINE_RES_ID or CreateView.FEMALE_SPINE_RES_ID,
        "_come_fore_effect",
        true
    )
    self._nodeHeroSpine2:showShadow(false)
    self._nodeHeroSpine2:setScale(2)
    self._nodeHeroSpine2:playEffectOnce("skill_come")

    self._nodePreEffect:removeAllChildren()

    local effect =
        G_EffectGfxMgr:createPlayMovingGfx(
        self._nodePreEffect,
        self._sex == 1 and "moving_xuanjue_middle_nan" or "moving_xuanjue_middle_nv",
        nil,
        nil,
        false
    )
end

--[[
function CreateView:_onInputName(strEventName, pSender)
	local edit = pSender
	local strFmt 
	if strEventName == "began" then
	elseif strEventName == "ended" then
			
	elseif strEventName == "return" then
		local text = edit:getText()
		if self:_hasSpecial(text) then
			self._nameText:setText("")
		end
	elseif strEventName == "changed" then
		
	end
end
]]
function CreateView:_onTouchMale()
    if self._sex ~= 1 then
        self._sex = 1
        self:_updateView()
        if self._defaultName == nil then
            self:_onPlaceRandomName()
        end
    end
end

function CreateView:_onTouchFemale()
    if self._sex ~= 2 then
        self._sex = 2
        self:_updateView()
        if self._defaultName == nil then
            self:_onPlaceRandomName()
        end
    end
end

function CreateView:_onCreateRole()
    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON_START_GAME)
    logWarn("onButtonEnter")
    local nameTxt = self._nameText:getString()
    nameTxt = string.trim(nameTxt)

    local TextHelper = require("app.utils.TextHelper")
    if TextHelper.isNameLegal(nameTxt, 2, 7) then
        G_GameAgent:checkContent(
            nameTxt,
            function()
                G_GameAgent:createRole(nameTxt, self._sex)
            end
        )
    -- G_GameAgent:createRole(nameTxt, self._sex)
    end
end

function CreateView:_onPlaceRandomName()
    local randomName = nil
    local count = 10
    while (count > 0) do
        randomName = self:_getRandomName()
        local BlackList = require("app.utils.BlackList")
        if not BlackList.isMatchText(randomName) then
            break
        end
        count = count - 1
    end
    self:_setName(randomName)
end

function CreateView:_setName(name)
    self._nameText:setString(name)
    self._editBox:setText(name)
end

function CreateView:_getRandomName()
    local Name1Place = require("app.config.name1_place")
    local Name2Surname = require("app.config.name2_surname")
    local Name3Name = require("app.config.name3_name")

    --math.randomseed(tostring(timer:getms()):reverse():sub(1, 6))
    local index01 = math.random(Name1Place.length())
    local index02 = math.random(Name2Surname.length())
    local index03 = math.random(Name3Name.length())
    local name01 = Name1Place.indexOf(index01)
    local name02 = Name2Surname.indexOf(index02)
    local name03 = Name3Name.indexOf(index03)

    assert(name01, "name1_place config not find id " .. index01)
    assert(name02, "name2_surname config not find id " .. index02)
    assert(name03, "name3_name config not find id " .. index03)

    local name = name01.place .. name02.surname
    logWarn("create name :" .. index01 .. " " .. index02 .. " " .. index03)

    if self._sex == 1 then
        name = name .. name03.name_boy
    else
        name = name .. name03.name_girl
    end

    return name --tostring(timer:getms()):reverse():sub(1, 6)
end

function CreateView:onEnter()
    logWarn("CreateView onEnter")
    -- G_AudioManager:playMusicWithId(AudioConst.MUSIC_LOGIN_CREATE)
end

function CreateView:onExit()
end

--_come_fore_effect

function CreateView:_seekActivateCodeName()
    local config = G_UserData:getCreateRole():getActivationCodeConfig()
    if not config then
        return
    end
    self._defaultName = config.name
    self._sex = config.gender
end

return CreateView
