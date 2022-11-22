const { SlashCommandBuilder } = require("@discordjs/builders");
const { Pagination } = require("../pagination/dist/index.js");
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
				const data = notifications.filter(
					(notification) => notification.read === false
				);

				if (data.length === 0)
					return interaction.reply({
						embeds: [
							new client.EmbedBuilder()
								.setTitle("Notifications")
								.setColor("Random")
								.setDescription(
									"You do not have any unread notifications!"
								),
						],
						components: [
							new ActionRowBuilder({
								components: [
									new ButtonBuilder()
										.setCustomId("unreadAllNotifications")
										.setLabel("Mark all as Unread")
										.setStyle(ButtonStyle.Danger),
								],
							}),
						],
					});

				const embeds = data.map((page) => {
					let tags = page.tags.join(", ");
					if (tags === "") tags = "None";

					return new client.EmbedBuilder()
						.setColor("Random")
						.addFields([
							{
								name: "Title",
								value: String(page.title),
								inline: false,
							},
							{
								name: "Summary",
								value: String(page.summary),
								inline: false,
							},
							{
								name: "Tags",
								value: tags,
								inline: false,
							},
						]);
				});

				const buttons = [
					new ButtonBuilder()
						.setCustomId("readAllNotifications")
						.setLabel("Mark all as Read")
						.setStyle(ButtonStyle.Danger),
				];

				await new Pagination(
					interaction,
					embeds,
					"Notification",
					buttons
				).paginate();
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
	async autocomplete(interaction, database) {},
};
