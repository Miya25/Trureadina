const { SlashCommandBuilder } = require("@discordjs/builders");
const { Pagination } = require("../pagination/dist/index.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("discover")
		.setDescription("Discover bots!"),
	async execute(client, interaction, database) {
		let allBots = await database.Bots.listAll();
		allBots = allBots.filter((bot) => bot.state === "APPROVED");

		const limit = (value) => {
			let max_chars = 130;
			let i;

			const x = value.substr(0, max_chars);

			if (value.length > max_chars)
				i = `${x}... (${value.length - max_chars} characters removed)`;
			else i = value;

			return i;
		};

		generateInvite = (id) => {
			return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=0&scope=bot%20applications.commands`;
		};

		const embeds = allBots.map((page) => {
			return new client.EmbedBuilder().setColor("Random").addFields([
				{
					name: "Username",
					value: String(page.username),
					inline: false,
				},
				{
					name: "Application Identifier",
					value: String(page.bot_id),
					inline: false,
				},
				{
					name: "Short Description",
					value: String(limit(page.description)),
					inline: false,
				},
				{
					name: "Flags",
					value: String(
						`\n\t- ${
							page.flags.join("\n\t- ").replaceAll("_", " ") ||
							"None"
						}`
					),
					inline: false,
				},
				{
					name: "Invite",
					value: page.invite || generateInvite(page.bot_id),
					inline: false,
				},
				{
					name: "Owner(s)",
					value: String(
						`Primary: ${page.owner}\nExtra Owners: \n\t- ${
							page.extra_owners.join("\n\t- ") || "None"
						}`
					),
				},
			]);
		});

		const buttons = [
			new ButtonBuilder()
				.setURL(allBots[0].invite || generateInvite(allBots[0].bot_id))
				.setLabel("Invite")
				.setStyle(ButtonStyle.Link),
		];

		await new Pagination(interaction, embeds, "Page", buttons).paginate();
	},
	async autocomplete(interaction, database) {},
};
