local PopupBase = require("app.ui.PopupBase")
local PopupSvipContact2 = class("PopupSvipContact2", PopupBase)

function PopupSvipContact2:ctor()
	local resource = {
		file = Path.getCSB("PopupSvipContact", "svip"),
		binding = {
			_buttonAddQQ = {
				events = {{event = "touch", method = "_onButtonContact"}}
			},
            _buttonCopy = {
				events = {{event = "touch", method = "_onButtonCopy"}}
			},
		}
	}
	PopupSvipContact2.super.ctor(self, resource)
end

function PopupSvipContact2:onCreate()
	local nameImage = G_ConfigManager:getSvipImage2()
	self._url = "https://mjzipa.sanguosha.com/images/"..nameImage..".jpg"
	self._fullFileName = cc.FileUtils:getInstance():getWritablePath().."userdata/"..nameImage..".jpg"

	self._popupBG:setTitle(Lang.get("svip_title_2"))
	self._popupBG:addCloseEventListener(handler(self, self._onClickClose))

	self._imageBanner:loadTexture(Path.getSvip("service_biaoti3", ".png"))
	self._textIntroTitle:setString(Lang.get("svip_intro_title_2"))
    self._textIntro:setString(Lang.get("svip_text_2"))
    self._textNumTitle:setString(Lang.get("svip_num_title_2"))
    self._buttonAddQQ:setString(Lang.get("svip_button_add_qq_2"))

    self._textQQ:setString(G_ConfigManager:getSvipQQ2())

    self:_updateImage()
end

function PopupSvipContact2:onEnter()
	
end

function PopupSvipContact2:onExit()

end

function PopupSvipContact2:_updateImage()
	local file, err = io.open(self._fullFileName)
	if file then
		self._sprite:setTexture(self._fullFileName)
	else
		self:_loadImage()
	end
end

function PopupSvipContact2:_loadImage()
	local xhr = cc.XMLHttpRequest:new()
    xhr.responseType = cc.XMLHTTPREQUEST_RESPONSE_STRING
    xhr.fullFileName = self._fullFileName
    xhr:open("GET", self._url)

    local function onReadyStateChanged()
        if xhr.readyState == 4 and (xhr.status >= 200 and xhr.status < 207) then
            print(" ---> img net load get statusText : " , xhr.response )
            local fileData = xhr.response
            local fullFileName = xhr.fullFileName
        	local file = io.open(fullFileName,"wb")
	        file:write(fileData)
        	file:close()
        	local texture2d = cc.Director:getInstance():getTextureCache():addImage(fullFileName)
	        if texture2d and self._sprite then
	            self._sprite:setTexture(fullFileName)
	        end
        else
            print(" --- > error xhr.readyState is:", xhr.readyState, "xhr.status is: ",xhr.status)
        end
        xhr:unregisterScriptHandler()
    end

    xhr:registerScriptHandler(onReadyStateChanged)
    xhr:send()
end

function PopupSvipContact2:_onButtonContact()
	local number = self._textQQ:getString()
	G_NativeAgent:clipboard(number)
	G_Prompt:showTip(Lang.get("svip_copy_success"))
end

function PopupSvipContact2:_onButtonCopy()
	local number = self._textQQ:getString()
	G_NativeAgent:clipboard(number)
	G_Prompt:showTip(Lang.get("svip_copy_success"))
end

function PopupSvipContact2:_onClickClose()
	self:close()
end


return PopupSvipContact2