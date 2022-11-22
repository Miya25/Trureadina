const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Check my Ping!"),
	async execute(client, interaction, database) {
		const message = await interaction.reply({
			content: "Pinging...",
			fetchReply: true,
		});

		const discord = Math.round(client.ws.ping);
		const interactionLatency = Math.round(
			message.createdTimestamp - interaction.createdTimestamp
		);

		const embed = new client.EmbedBuilder()
			.setTitle("Pong!")
			.setColor(0xff0000)
			.setFields(
				{
					name: "Discord Websocket Heartbeat:",
					value: `${discord}ms`,
					inline: true,
				},
				{
					name: "Discord Interaction Roundtrip Latency:",
					value: `${interactionLatency}ms`,
					inline: true,
				}
			)
			.setFooter({
				text: `Executed by ${interaction.user.username}#${interaction.user.discriminator}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		message.edit({
			content: "",
			embeds: [embed],
		});
	},
	async autocomplete(interaction, database) {},
};
