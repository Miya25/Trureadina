const { EmbedBuilder } = require("discord.js");
const logger = require("./logger");

class Panel_Logging {
	/**
	 * @param {JSON} Client
	 * @param {Interaction} Interaction
	 * @param {JSON} Bot
	 * @param {String} Action
	 * @param {String} Reason
	 */
	constructor(client, interaction, bot, action, reason) {
		this.client = client;
		this.interaction = interaction;
		this.bot = bot;
		this.action = action;
		this.reason = reason;
	}

	/* Render Message */
	async render() {
		let action;

		switch (this.action) {
			case 0:
				action = "Claimed";
				break;

			case 1:
				action = "Unclaimed";
				break;

			case 2:
				action = "Approved";
				break;

			case 3:
				action = "Denied";
				break;

			default:
				action = "Unknown";
				break;
		}

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTitle(`Select List Panel`)
			.addFields(
				{
					name: "Application/Bot",
					value: `${this.bot.username} (<@${this.bot.bot_id}>)`,
					inline: false,
				},
				{
					name: "Action",
					value: action,
					inline: false,
				},
				{
					name: "Reason/Notes",
					value: this.reason,
					inline: false,
				},
				{
					name: "Moderator",
					value: `<@${this.interaction.user.id}>`,
					inline: false,
				}
			);

		const channels = this.client.channels.cache.filter(
			(channel) => channel.name === "panel-logs"
		);

		channels.map(async (channel) => {
			await channel
				.send({
					embeds: [embed],
				})
				.catch((err) => {
					return logger.error(
						"Panel Logs",
						`Failed to send message!\nError: ${err}`
					);
				});
		});
	}
}

module.exports = Panel_Logging;
