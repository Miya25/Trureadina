module.exports = {
	data: {
		name: "readAllNotifications",
	},
	async execute(client, interaction, database) {
		const user = await database.User.getUser(interaction.user.id);
		const notifications = user.notifications;

		if (notifications.length === 0)
			return interaction.reply({
				embeds: [
					new client.EmbedBuilder()
						.setTitle("Notifications")
						.setColor("Random")
						.setDescription("You don't have any notifications!"),
				],
				ephemeral: true,
			});

		notifications.forEach(async (notification) => {
			notification.read = true;

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

		return interaction.reply({
			embeds: [
				new client.EmbedBuilder()
					.setTitle("Success!")
					.setColor("Random")
					.setDescription("Marked all notifications as Read!"),
			],
			ephemeral: true,
		});
	},
};
