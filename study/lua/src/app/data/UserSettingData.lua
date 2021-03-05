
local BaseData = import(".BaseData")
local UserSettingData = class("UserSettingData", BaseData)

UserSettingData.FILE_NAME = "usersettting"

local schema = {}
UserSettingData.schema = schema

function UserSettingData:ctor(properties)
    UserSettingData.super.ctor(self, properties)
    self._data = {}
    self._isInit = false
    self._data = self:_getData()
end

-- 清除
function UserSettingData:clear()
    self._data = self:_getData()
end

-- 重置
function UserSettingData:reset()
    self._isInit = false
    self._data = {}


end



--从本地读取缓存
--前提：登陆并有玩家ID数据
function UserSettingData:_init()
    if self._isInit then
        return
    end
    self._isInit = true
    self._data = self:_getData()
end

function UserSettingData:getData()
    return self._data
end

function UserSettingData:flush()
    self:_saveData(self._data)
end

function UserSettingData:_saveData(data)
    G_StorageManager:save(UserSettingData.FILE_NAME,
        data
    )
    self._data = data
end

function UserSettingData:_getData()
    self._data = G_StorageManager:load(UserSettingData.FILE_NAME) or {}
    return self._data
end


--
function UserSettingData:getSettingValue(key)
    local data = self:getData()
    --dump(data)
    local dataValue = data[key]
    return dataValue
end


--
function UserSettingData:setSettingValue(key,value)
    local data = self:getData() 
    data[key] = value
    self:_saveData(data)
    
end
function UserSettingData:initMusic()
    local data =  self:getData()
    local isChange = false
    if data["musicEnabled"] == nil then
        data["musicEnabled"] = 1
        isChange = true
    end
    if data["soundEnabled"] == nil then
        data["soundEnabled"] = 1
        isChange = true
    end
    if isChange  then
        self:_saveData(data)
    end
    
end
--获取用户设置数据，判定是否播放音效音乐 音量大小
function UserSettingData:updateMusic()
    local data =  self:getData()

    self:initMusic()
    if data["musicEnabled"] == 1 then
        G_AudioManager:setMusicEnabled(true)
        if data["mus_volume"] ~= nil then 
            G_AudioManager:setMusicVolume(data["mus_volume"])
        end
    else
        G_AudioManager:setMusicEnabled(false)
    end
    if data["soundEnabled"] == 1 then
        G_AudioManager:setSoundEnabled(true)
        if data["sou_volume"] ~= nil then 
            G_AudioManager:setSoundVolume(data["sou_volume"])
        end
       -- G_HeroVoiceManager:setSoundEnabled(true)
    else
        G_AudioManager:setSoundEnabled(false)
      --  G_HeroVoiceManager:setSoundEnabled(false)
    end

    if data["gfxEnabled"] == 1 then
        --G_AudioManager:setSoundEnabled(true)
    else
        --G_AudioManager:setSoundEnabled(false)
    end
end

--
function UserSettingData:getHideWearEquip()
    local value = self:getSettingValue("hideWearEquip") or 1
    local hide = value == 1 and true or false
    return hide
end

function UserSettingData:setHideWearEquip(hide)
    local value = hide and 1 or 0
    self:setSettingValue("hideWearEquip", value)
end

function UserSettingData:getHideWearHorseEquip()
    local value = self:getSettingValue("hideWearHorseEquip") or 1
    local hide = value == 1 and true or false
    return hide
end

function UserSettingData:setHideWearHorseEquip(hide)
    local value = hide and 1 or 0
    self:setSettingValue("hideWearHorseEquip", value)
end

function UserSettingData:getHideWearTreasure()
    local value = self:getSettingValue("hideWearTreasure") or 1
    local hide = value == 1 and true or false
    return hide
end

function UserSettingData:setHideWearTreasure(hide)
    local value = hide and 1 or 0
    self:setSettingValue("hideWearTreasure", value)
end

function UserSettingData:getHideWearSilkbag()
    local value = self:getSettingValue("hideWearSilkbag") or 1
    local hide = value == 1 and true or false
    return hide
end

function UserSettingData:setHideWearSilkbag(hide)
    local value = hide and 1 or 0
    self:setSettingValue("hideWearSilkbag", value)
end

function UserSettingData:getHideWearHistoryHero()
    local value = self:getSettingValue("hideWearHistoryHero") or 1
    local hide = value == 1 and true or false
    return hide
end

function UserSettingData:setHideWearHistoryHero(hide)
    local value = hide and 1 or 0
    self:setSettingValue("hideWearHistoryHero", value)
end

return UserSettingData