-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local _services = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services")
local ReplicatedFirst = _services.ReplicatedFirst
local Runtime = _services.RunService
local Market = _services.MarketplaceService
local Assets = ReplicatedFirst.Assets
local getPageContents
local function getDevProducts()
	return getPageContents(Market:GetDeveloperProductsAsync())
end
function getPageContents(pages)
	local contents = {}
	while not pages.IsFinished do
		local page = pages:GetCurrentPage()
		for _, item in page do
			table.insert(contents, item)
		end
		pages:AdvanceToNextPageAsync()
	end
	return contents
end
local function getCharacterParts(character)
	local _exp = character:GetDescendants()
	-- ▼ ReadonlyArray.filter ▼
	local _newValue = {}
	local _callback = function(i)
		return i:IsA("BasePart")
	end
	local _length = 0
	for _k, _v in _exp do
		if _callback(_v, _k - 1, _exp) == true then
			_length += 1
			_newValue[_length] = _v
		end
	end
	-- ▲ ReadonlyArray.filter ▲
	return _newValue
end
local getInstancePath = TS.async(function(instance)
	local path = (string.gsub((string.gsub(instance:GetFullName(), "Workspace", "World")), "PlayerGui", "UI"))
	if Runtime:IsClient() then
		local _binding = TS.await(TS.Promise.new(function(resolve)
			resolve(TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "utility", "client"))
		end))
		local Player = _binding.Player
		local _path = path
		local _arg0 = `Players.{Player.Name}.`
		path = (string.gsub(_path, _arg0, ""))
	end
	return path
end)
return {
	getDevProducts = getDevProducts,
	getPageContents = getPageContents,
	getCharacterParts = getCharacterParts,
	getInstancePath = getInstancePath,
	Assets = Assets,
}
