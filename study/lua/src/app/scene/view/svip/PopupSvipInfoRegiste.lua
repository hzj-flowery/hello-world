
local PopupBase = require("app.ui.PopupBase")
local PopupSvipInfoRegiste = class("PopupSvipInfoRegiste", PopupBase)

function PopupSvipInfoRegiste:ctor()
    self._inputList = {}
	local resource = {
		file = Path.getCSB("PopupSvipInfoRegiste", "svip"),
		binding = {
			_buttonCancel = {
				events = {{event = "touch", method = "_onButtonCancel"}}
			},
            _buttonRegiste = {
				events = {{event = "touch", method = "_onButtonRegiste"}}
			},
            _buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			},
		}
	}
	PopupSvipInfoRegiste.super.ctor(self, resource)
end

function PopupSvipInfoRegiste:onCreate()
--	self._popBase:setTitle(Lang.get("svip_register_title"))
--	self._popBase:addCloseEventListener(handler(self, self._onClickClose))


    self._buttonCancel:setString(Lang.get("common_btn_name_cancel"))
    self._buttonRegiste:setString(Lang.get("svip_register_button"))
    

    self:_createRichText()
    self:_createInput()

    

end

function PopupSvipInfoRegiste:onEnter()
	self._signalSvipRegisteSuccess = G_SignalManager:add(SignalConst.EVENT_SVIP_REGISTE_SUCCESS, handler(self,self._onEventSvipRegisteSuccess))
end

function PopupSvipInfoRegiste:onExit()
    self._signalSvipRegisteSuccess:remove()
	self._signalSvipRegisteSuccess =nil
end

function PopupSvipInfoRegiste:_onEventSvipRegisteSuccess(event)
    G_Prompt:showTip(Lang.get("svip_register_success"))
	self:close()
end


function PopupSvipInfoRegiste:_createInput()
    local InputUtils = require("app.utils.InputUtils")
    for k = 1,4,1 do
        self._inputList[k] = InputUtils.createInputView(
            {
                bgPanel = self["_panelInput"..k],
                fontSize = 22,
                fontColor =  Colors.BRIGHT_BG_TWO,
                maxLength = 11 ,
                textEmpty = self["_textEmpty"..k],
            }
        )
    end

end


function PopupSvipInfoRegiste:_createRichText()
    local richText = ccui.RichText:createRichTextByFormatString(
    Lang.get("svip_register_des"),
    {defaultColor = Colors.BRIGHT_BG_TWO, defaultSize = 20, other ={
        [1] = {fontSize = 18}
    }})
    richText:setAnchorPoint(cc.p(0,1))
    richText:setVerticalSpace(5)
    richText:ignoreContentAdaptWithSize(false)
    richText:setContentSize(cc.size(478,0))--高度0则高度自适应
    self._nodeRichTextParent:addChild(richText)
end

function PopupSvipInfoRegiste:_onButtonCancel()
    self:close()
end

function PopupSvipInfoRegiste:_onButtonRegiste()
    local realName = self._inputList[1]:getText()
    local birthday =  self._inputList[2]:getText()
    local phone =  self._inputList[3]:getText()
    local qq =  self._inputList[4]:getText()

    local NumberCheck = require("app.utils.logic.NumberCheck")
   
    local success = NumberCheck.checkName(realName,true)
    if success then
         success = NumberCheck.checkBirthday(birthday,true)
    end
    if success then
        success = NumberCheck.checkPhone(phone,true)
    end
    if success then
         success = NumberCheck.checkQQ(qq,true)
    end
    if success then
        G_UserData:getSvip():c2sGameAdmit(realName,birthday,phone,qq)
    end
    
end

function PopupSvipInfoRegiste:_onClickClose()
	self:close()
end



return PopupSvipInfoRegiste