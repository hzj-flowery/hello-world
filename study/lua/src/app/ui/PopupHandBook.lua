--弹出界面
--图鉴系统
local PopupBase = require("app.ui.PopupBase")
local PopupHandBook = class("PopupHandBook", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupHandBookCell = require("app.ui.PopupHandBookCell")

local START_COLOR = 6
--等服务器回包后，创建对话框并弹出UI
function PopupHandBook:waitEnterMsg(callBack)
	local function onMsgCallBack(id,message)
		if type(message) ~= "table" then return end
		self._heroGettedIds = {}
		local heroList = rawget(message, "hero_id") or {}
		for key, value in ipairs(heroList) do
			local heroId = value
			self._heroGettedIds[heroId] = true
		end
		callBack()
	end
	local msgReg = G_NetworkManager:add(MessageIDConst.ID_S2C_GetHeroPhoto, onMsgCallBack)
	G_NetworkManager:send(MessageIDConst.ID_C2S_GetHeroPhoto, {})
	return msgReg
end

function PopupHandBook:_onGetHeroPhoto(id,message)



end

function PopupHandBook:ctor(title, callback )
	--
	self._title = title or Lang.get("handbook_title")
	self._callback = callback
	self._buyItemId = nil

	--control init
	self._listItemSource =nil
	self._iconTemplate = nil
	self._commonNodeBk = nil
	self._nodeTabRoot = nil

	--Data


	self._heroInfos  = {}
	self._heroOwnerCount = {}
	for i=1, 4 do -- 1魏2蜀3吴4群
		self._heroInfos[i] = {}
		self._heroOwnerCount[i] = {}
	end
	self._selectTabIndex = 0
	--
	local resource = {
		file = Path.getCSB("PopupHandBook", "common"),
		binding = {

		}
	}
	PopupHandBook.super.ctor(self, resource, true)
end

--
function PopupHandBook:onCreate()

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)


	local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = { Lang.get("handbook_country_tab1"),
		Lang.get("handbook_country_tab2"),
		Lang.get("handbook_country_tab3"),
		Lang.get("handbook_country_tab4")}
	}

	self._nodeTabRoot:recreateTabs(param)
	self:_initHeroInfos()
	self._nodeTabRoot:setTabIndex(1)
end

--
function PopupHandBook:_onTabSelect(index, sender)
	if self._selectTabIndex == index then
		return
	end
	self._selectTabIndex = index

	if self._heroInfos[index] == nil then
		return
	end
	self._listView:clearAll()

	self:_updateSelectTab(index)
	for color = START_COLOR, 2, -1 do
		local heroArray = self._heroInfos[index][color]

		local heroOwnerCount = self._heroOwnerCount[index][color]
		dump(heroOwnerCount)

		if heroArray and type(heroArray) == "table" then
			local cell = PopupHandBookCell.new()
			cell:updateUI(color, heroArray, heroOwnerCount)
			self._listView:pushBackCustomItem(cell)
		end
	end
	self._listView:jumpToTop()
end

function PopupHandBook:_updateSelectTab(index)
	local country =  self._heroOwnerCount[index]
	country.totalNum = country.totalNum or 0
	if country and country.ownNum and  country.totalNum then
		local percent = math.floor(country.ownNum / country.totalNum * 100)
		self._loadingBarExp:setPercent(percent)
	end

	if country.ownNum == country.totalNum then
		--self._textCountryNum1:setColor(Colors.getColor(2))
		--self._textCountryNum2:setColor(Colors.getColor(2))
		self._textCountryNum1:setColor(Colors.DARK_BG_ONE)
		self._textCountryNum2:setColor(Colors.DARK_BG_ONE )
	else
		--self._textCountryNum1:setColor(Colors.getColor(6))
		--self._textCountryNum2:setColor(Colors.getColor(1))
		self._textCountryNum1:setColor(Colors.DARK_BG_RED)
		self._textCountryNum2:setColor(Colors.DARK_BG_ONE )

	end

	self._textCountryNum1:setString(country.ownNum)

	local num2Pos = self._textCountryNum1:getPositionX() + self._textCountryNum1:getContentSize().width
	self._textCountryNum2:setString("/"..country.totalNum)
	self._textCountryNum2:setPositionX(num2Pos+2)

	self._textCountryProcess:setString(Lang.get("handbook_country"..index))
end
function PopupHandBook:updateUI(itemType, itemValue)
	local listView = self._listView
end



function PopupHandBook:_onItemTouch(index)
	dump(index)
end


function PopupHandBook:_getHandBookList(selectIndex)

end


function PopupHandBook:_onInit()

end


function PopupHandBook:onEnter()



	--self._getHeroPhoto 	= G_NetworkManager:add(MessageIDConst.ID_S2C_GetHeroPhoto, handler(self, self._onGetHeroPhoto))

	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetHeroPhoto, {})
end

function PopupHandBook:onShowFinish()

end


function PopupHandBook:onExit()
   -- self._getHeroPhoto:remove()
--	self._getHeroPhoto = nil

end




--发送拉去商店信息请求
function PopupHandBook:sendGetHeroPhoto()

end


--
function PopupHandBook:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._buyItemId)
	end
	if not isBreak then
		self:close()
	end
end


function PopupHandBook:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

--数据结构
--[[
	heroInfo = {
		[1] = { --国家拥有 colorList
			[1] = { hero1， hero2,},
			[2] = { hero1， hero2}
		}
	}
]]

function PopupHandBook:_initHeroInfos()
	local heroInfo = require("app.config.hero")

    for loopi = 1, heroInfo.length()  do
        local heroData = heroInfo.indexOf(loopi)
		local heroCountry = heroData.country
		local heroColor = heroData.color
		if heroColor ~= 1 and heroData.is_show == 1  then --过滤白将
			self._heroInfos[heroCountry] =  self._heroInfos[heroCountry] or {}
			self._heroOwnerCount[heroCountry] =  self._heroOwnerCount[heroCountry] or {}
			self._heroOwnerCount[heroCountry][heroColor] = self._heroOwnerCount[heroCountry][heroColor] or {}

			if self._heroInfos[heroCountry][heroColor] == nil then
				self._heroInfos[heroCountry][heroColor] = {}
			end
			local handData = {
				cfg = heroData,
				isHave = self._heroGettedIds[heroData.id],
			}
			table.insert(self._heroInfos[heroCountry][heroColor], handData)


			if handData.isHave == true then
				self._heroOwnerCount[heroCountry][heroColor].ownNum = self._heroOwnerCount[heroCountry][heroColor].ownNum  or 0
				self._heroOwnerCount[heroCountry][heroColor].ownNum = self._heroOwnerCount[heroCountry][heroColor].ownNum + 1
			end
			self._heroOwnerCount[heroCountry][heroColor].totalNum = self._heroOwnerCount[heroCountry][heroColor].totalNum  or 0
			self._heroOwnerCount[heroCountry][heroColor].totalNum = self._heroOwnerCount[heroCountry][heroColor].totalNum + 1
		end

    end

    for i, country in ipairs(self._heroOwnerCount) do
        local countryOwn = 0
        local countryTotal = 0
        for j, color in pairs(country) do
			if type(color) == "table" then
				if color.ownNum == nil then
					color.ownNum = 0
				end
				if color.totalNum == nil then
					color.totalNum = 0
				end
				countryOwn = countryOwn + color.ownNum
				countryTotal = countryTotal + color.totalNum
			end
        end
        self._heroOwnerCount[i].ownNum = countryOwn
        self._heroOwnerCount[i].totalNum = countryTotal
    end

end



function PopupHandBook:_updateGroup( group )


    self._updatingGroup = group
    self._updatingColor = 6
    self._updatingIndex = 1
    self._updatingImage = 1

    self:_addHandler()

    local groupOwn = self._heroInfos[group].ownNum
    local totalNum = self._heroInfos[group].totalNum

     --更新进度

    local percent = math.ceil(groupOwn/totalNum*100)
    --更新进度条信息
    self._csbNode:updateLabel("Text_progress",{
        text= groupOwn.."/"..totalNum,
        color = G_Colors.COLOR_POPUP_PROG_NUM,
        fontSize = 24})

    local progressPanel = self._csbNode:getSubNodeByName("LoadingBar_progress")
    progressPanel:setPercent(percent)
end


function PopupHandBook:_updateFunc( dt )
    if self._updatingColor < 1 then
        self:_removeHandler()
        return
    end

    local curGroup = self._heroInfos[self._updatingGroup]
    local curColor = curGroup[self._updatingColor]
    if curColor == nil then
        self._updatingColor = self._updatingColor - 1
        curColor = curGroup[self._updatingColor]
        return
    end

    local panel = self._imageList[self._updatingImage]
    if self._updatingIndex == 1 then
        if panel == nil then
            panel = self:_createImagePanel()
            self._scrollView:addChild(panel)
            table.insert(self._imageList,panel)
            table.insert(self._iconList,{})
        end
        self:_updateImagePanel(panel,self._updatingColor,curColor)
        self:_resizeScroll()

        for i,icon in ipairs(self._iconList[self._updatingImage]) do
            icon:setVisible(false)
        end
    end

    local MaxCount = 5
    local currentCount = 0

    while self._updatingIndex <= #curColor do
        local icon = self._iconList[self._updatingImage][self._updatingIndex]
        if icon == nil then
            icon = self:_createKnightIcon()
            panel:addChild(icon)
            table.insert(self._iconList[self._updatingImage],icon)
        end
        icon:setVisible(true)
        self:_updateKnightIcon(icon, self._updatingIndex,curColor[self._updatingIndex].knight_id, panel:getContentSize().height)
        self._updatingIndex = self._updatingIndex + 1
        currentCount = currentCount + 1
        if currentCount >= MaxCount then
            break
        end
    end

    if self._updatingIndex > #curColor then
        self._updatingColor = self._updatingColor - 1
        self._updatingImage = self._updatingImage + 1
        self._updatingIndex = 1
    end
end

return PopupHandBook
