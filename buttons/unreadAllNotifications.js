const { Pagination } = require("../pagination/dist/index.js");
const { ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: {
		name: "unreadAllNotifications",
	},
	async execute(client, interaction, database) {
		const user = await database.User.getUser(interaction.user.id);
		const notifications = user.notifications;

		notifications.forEach(async (notification) => {
			notification.read = false;

			await database.User.updateUser(
				user.user_id,
				user.username,
				user.bio,
				user.avatar,
				user.roles,
				user.flags,
				user.badges,
				user.onboarding,
				notifications
			);
		});

		return await interaction.update({
			content: "All notifications have been set to unread!",
			embeds: [],
			components: [],
		});
	},
};
