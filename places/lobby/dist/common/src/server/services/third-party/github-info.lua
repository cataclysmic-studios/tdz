-- Compiled with roblox-ts v2.3.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
local Reflect = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Reflect
local Service = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@flamework", "core", "out").Service
local HTTP = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").HttpService
local CommonFunctions = TS.import(script, game:GetService("ReplicatedStorage"), "common", "server", "network").CommonFunctions
local Log = TS.import(script, game:GetService("ReplicatedStorage"), "common", "shared", "logger").default
local GitHubFetchException
do
	local super = Log.Exception
	GitHubFetchException = setmetatable({}, {
		__tostring = function()
			return "GitHubFetchException"
		end,
		__index = super,
	})
	GitHubFetchException.__index = GitHubFetchException
	function GitHubFetchException.new(...)
		local self = setmetatable({}, GitHubFetchException)
		return self:constructor(...) or self
	end
	function GitHubFetchException:constructor(message)
		super.constructor(self, "GitHubFetch", message)
	end
end
local repository_1 = {
	type = "git",
	url = "git+https://github.com/R-unic/flamework-template.git",
}
local GitHubInfoService
do
	GitHubInfoService = setmetatable({}, {
		__tostring = function()
			return "GitHubInfoService"
		end,
	})
	GitHubInfoService.__index = GitHubInfoService
	function GitHubInfoService.new(...)
		local self = setmetatable({}, GitHubInfoService)
		return self:constructor(...) or self
	end
	function GitHubInfoService:constructor()
		self.baseURL = "https://api.github.com/repos"
		local pieces = string.split(repository_1.url, "/")
		-- ▼ Array.pop ▼
		local _length = #pieces
		local _result = pieces[_length]
		pieces[_length] = nil
		-- ▲ Array.pop ▲
		local _result_1 = _result
		if _result_1 ~= nil then
			_result_1 = (string.gsub(_result_1, ".git", ""))
		end
		local name = _result_1
		-- ▼ Array.pop ▼
		local _length_1 = #pieces
		local _result_2 = pieces[_length_1]
		pieces[_length_1] = nil
		-- ▲ Array.pop ▲
		local author = _result_2
		self.repository = `{author}/{name}`
	end
	function GitHubInfoService:onInit()
		if self.repository == nil then
			error(GitHubFetchException.new("No repository URL was provided in package.json"))
		end
		local repeatTryGet
		repeatTryGet = function()
			local success, info = pcall(function()
				return self:retrieve()
			end)
			if not success then
				task.wait(0.5)
				return repeatTryGet()
			end
			return info
		end
		CommonFunctions.github.getInfo:setCallback(repeatTryGet)
	end
	function GitHubInfoService:retrieve()
		local tags = self:request("tags")
		local _exp = self:request("commits")
		-- ▼ ReadonlyArray.map ▼
		local _newValue = table.create(#_exp)
		local _callback = function(res)
			res.commit.tree.sha = res.sha
			return res.commit
		end
		for _k, _v in _exp do
			_newValue[_k] = _callback(_v, _k - 1, _exp)
		end
		-- ▲ ReadonlyArray.map ▲
		local commits = _newValue
		return {
			tags = tags,
			commits = commits,
		}
	end
	function GitHubInfoService:request(path)
		return HTTP:JSONDecode(HTTP:GetAsync(`{self.baseURL}/{self.repository}/{path}`))
	end
	do
		-- (Flamework) GitHubInfoService metadata
		Reflect.defineMetadata(GitHubInfoService, "identifier", "common/src/server/services/third-party/github-info@GitHubInfoService")
		Reflect.defineMetadata(GitHubInfoService, "flamework:implements", { "$:flamework@OnInit", "common/src/shared/hooks@LogStart" })
	end
end
-- (Flamework) GitHubInfoService decorators
Reflect.decorate(GitHubInfoService, "$:flamework@Service", Service, {})
return {
	GitHubInfoService = GitHubInfoService,
}
