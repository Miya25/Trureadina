const { SlashCommandBuilder } = require("@discordjs/builders");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("notifications")
		.setDescription("View my Notifications"),
	async execute(client, interaction, database) {
		const user = await database.User.getUser(interaction.user.id);

		if (user) {
			const notifications = user.notifications;

			if (notifications.length === 0)
				return interaction.reply({
					content: "You do not have any notifications!",
				});
			else {
				const embed = new client.embedBuilder()
					.setTitle("Notifications")
					.setColor("Random")
					.setDescription(
						`${notifications
							.map((notification) => {
								return `-\n\tTitle: ${
									notification.title
								}\n\tSummary: ${
									notification.summary
								}\n\tTags: ${notification.tags.join(",")}`;
							})
							.join("\n\n")}`
					);

				return interaction.reply({
					embeds: [embed],
				});
			}
		} else
			return interaction.reply({
				content:
					"Uh oh, it looks like you cannot be found in our database!",
			});
	},
};
