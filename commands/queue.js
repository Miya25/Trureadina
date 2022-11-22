const { SlashCommandBuilder } = require("@discordjs/builders");
const { Pagination } = require("../pagination/dist/index.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("View the Select List queue"),
	async execute(client, interaction, database) {
		let bots = await database.Bots.listAll();

		bots = bots.filter(
			(bot) => bot.state === "AWAITING_REVIEW" || bot.state === "CLAIMED"
		);

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

		const embeds = bots.map((page) => {
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
					name: "State",
					value: String(page.state.replaceAll("_", " ")),
					inline: false,
				},
                {
                    name: "Invite",
                    value: page.invite || generateInvite(page.bot_id),
                    inline: false
                },
				{
					name: "Primary Owner",
					value: `<@${page.owner}>`,
					inline: false,
				},
			]);
		});

		const buttons = [
			new ButtonBuilder()
				.setCustomId(`claim-${bots[0].bot_id}`)
				.setLabel(`Claim`)
				.setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setURL(bots[0].invite || generateInvite(bots[0].bot_id))
                .setLabel("Invite")
                .setStyle(ButtonStyle.Link),
		];

		await new Pagination(interaction, embeds, "Page", buttons).paginate();
	},
	async autocomplete(interaction, database) {},
};
