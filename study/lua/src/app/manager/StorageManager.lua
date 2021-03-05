local StorageManager = class("StorageManager")
local FileUtils = cc.FileUtils:getInstance()

--
function StorageManager:ctor()
    self._dirStorage = FileUtils:getWritablePath() ..  "/userdata/"

    if not FileUtils:isDirectoryExist(self._dirStorage) then
        FileUtils:createDirectory(self._dirStorage)
    end
end

--
function StorageManager:setUserInfo(serverID, userID)
    self._serverID = serverID
    self._userID = userID
end

--
function StorageManager:load(filename)
    local path = self._dirStorage .. filename
    local str = FileUtils:getStringFromFile(path)
    if str ~= nil then
        return json.decode(str)
    end
    return nil
end

--
function StorageManager:loadUser(filename)
    assert(self._serverID, "StorageManager user server is nil")
    assert(self._userID, "StorageManager user id is nil")

    local path = self._serverID .. "_" .. self._userID .. "_" .. filename
    return self:load(path)
end

--
function StorageManager:save(filename, data)
    self:saveString(filename, json.encode(data))
end

--
function StorageManager:saveString(filename, data)
    local path = self._dirStorage .. filename
    FileUtils:writeStringToFile(data, path)
end

--
function StorageManager:saveWithUser(filename, data)
    assert(self._serverID, "StorageManager user server is nil")
    assert(self._userID, "StorageManager user id is nil")
    
    local path = self._serverID .. "_" .. self._userID .. "_" .. filename
    self:save(path, data)
end


return StorageManager