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
					embeds: [
						new client.EmbedBuilder()
							.setTitle("Notifications")
							.setColor("Random")
							.setDescription(
								"You don't have any notifications!"
							),
					],
					ephemeral: true,
				});
			else {
				let count = 0;
				let data = "";

				notifications.forEach((notification) => {
					if (notification.read) return;

					count = count + 1;

					data =
						data +
						`${count}.\n\tTitle: ${
							notification.title
						}\n\tSummary: ${
							notification.summary
						}\n\tTags: ${notification.tags.join(",")}\n\n`;
				});

				if (data === "")
					return interaction.reply({
						embeds: [
							new client.EmbedBuilder()
								.setTitle("Notifications")
								.setColor("Random")
								.setDescription(
									"You do not have any unread notifications!"
								),
						],
						ephemeral: true,
					});

				const embed = new client.EmbedBuilder()
					.setTitle("Notifications")
					.setColor("Random")
					.setDescription(data);

				const buttons = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId("readAllNotifications")
						.setLabel("Mark all as Read")
						.setStyle(ButtonStyle.Danger)
				);

				return interaction.reply({
					embeds: [embed],
					components: [buttons],
					ephemeral: true,
				});
			}
		} else
			return interaction.reply({
				embeds: [
					new client.EmbedBuilder()
						.setTitle("Notifications")
						.setColor("Random")
						.setDescription(
							"Uh oh, it looks like you cannot be found in our database!"
						),
				],
				ephemeral: true,
			});
	},
};
