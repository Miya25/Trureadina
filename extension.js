module.exports = (client) => {
	client.sendMessage = (channel, message) => {
		const channelObj = client.channels.cache.get(channel);

		if (channelObj) return channelObj.send(message);
		else return false;
	};

	client.getChannel = (id) => {
		return client.channels.cache.get(id);
	};

	client.getUser = async (id) => {
		let data = client.users.cache.get(id);

		if (!data) return null;
		else return data;
	};

	client.getGuild = (id) => {
		return client.guilds.cache.get(id);
	};

	client.getMessage = (channel, message) => {
		const channelObj = client.channels.cache.get(channel);
		const messageObj = channelObj.messages.cache.get(message);

		return messageObj;
	};

	client.listGuilds = () => {
		return client.guilds.cache.map((guild) => guild.name);
	};

	client.whitelistedGuilds = ["[PRIVATE] Select List", "Staff Center"];
	client.bannedUsers = [];
};
