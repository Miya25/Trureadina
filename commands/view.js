const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("view")
		.setDescription("View information about a bot or user")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("user")
				.setDescription("View information about a user.")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("Select the User!")
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("userid")
						.setDescription("Enter the User ID!")
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("bot")
				.setDescription("View information about a bot.")
				.addUserOption((option) =>
					option
						.setName("user")
						.setDescription("Select the Bot!")
						.setRequired(false)
				)
				.addStringOption((option) =>
					option
						.setName("userid")
						.setDescription("Enter the Bot ID!")
						.setRequired(false)
				)
		),
	async execute(client, interaction, database) {
		// Fetch the subcommand name.
		const subcommand = interaction.options.getSubcommand();

		// Get the user/bot id from one of the fields
		let user;
		if (interaction.options.getUser("user"))
			user = interaction.options.getUser("user").id;
		else if (interaction.options.getString("userid"))
			user = interaction.options.getString("userid");
		else user = null;

		// Defer the interaction
		await interaction.deferReply();

		// Check if the user actually specified a user/bot id
		let error = null;

		if (user) {
			user = await client.users.fetch(user).catch((err) => {
				if (err.rawError.message === "Unknown User")
					error = `Error: The ${subcommand} id that you supplied is not valid.`;
				else
					error =
						"Error: Something went wrong with validating the information that you provided!";
			});
		} else error = `Error: You did not supply a valid ${subcommand} id.`;

		// If there was an error, send a error message.
		if (error)
			return interaction.followUp({
				content: error,
			});

		if (subcommand === "user") {
			if (user.bot)
				return interaction.followUp({
					content: `Error: You have supplied a bot id, not a user id. Please use the \`/view bot\` command instead.`,
				});
			else {
				user = await database.User.getUser(user.id);

				if (user) {
					const embed = new client.EmbedBuilder()
						.setTitle(`Viewing Profile`)
						.setColor("Random")
						.setThumbnail(user.avatar)
						.setFields(
							{
								name: "Username",
								value: String(user.username),
								inline: false,
							},
							{
								name: "User Identifier",
								value: String(user.user_id),
								inline: false,
							},
							{
								name: "Bio",
								value: String(user.bio),
								inline: false,
							},
							{
								name: "Roles",
								value: String(
									user.roles
										.join(", ")
										.replaceAll("_", " ") || "None"
								),
							}
						);

					return interaction.followUp({
						embeds: [embed],
					});
				} else
					return interaction.followUp({
						content: "Error: That user does not exist.",
					});
			}
		} else if (subcommand === "bot") {
			if (!user.bot)
				return interaction.followUp({
					content: `Error: You have supplied a user id, not a bot id. Please use the \`/view user\` command instead.`,
				});
			else {
				user = await database.Bots.getBot(user.id);

				if (user) {
					if (user.state != "APPROVED")
						return interaction.followUp({
							content:
								"Sorry, that bot cannot be viewed here at this time!\nReason: The bot was denied, or not yet reviewed by a Select List Staff Member.",
						});
					else {
						const discordData = await client.users.fetch(
							user.bot_id
						);

						const limit = (value) => {
							let max_chars = 130;
							let i;

							const x = value.substr(0, max_chars);

							if (value.length > max_chars)
								i = `${x}... (${
									value.length - max_chars
								} characters removed)`;
							else i = value;

							return i;
						};

						const embed = new client.EmbedBuilder()
							.setTitle(`Viewing Bot`)
							.setColor("Random")
							.setThumbnail(discordData.displayAvatarURL())
							.setFields(
								{
									name: "Username",
									value: String(user.username),
									inline: false,
								},
								{
									name: "Application Identifier",
									value: String(user.bot_id),
									inline: false,
								},
								{
									name: "Short Description",
									value: String(limit(user.description)),
									inline: false,
								},
								{
									name: "Long Description",
									value: String(limit(user.long_description)),
									inline: false,
								},
								{
									name: "Flags",
									value: String(
										`\n\t- ${
											user.flags
												.join("\n\t- ")
												.replaceAll("_", " ") || "None"
										}`
									),
									inline: false,
								},
								{
									name: "Owner(s)",
									value: String(
										`Primary: ${
											user.owner
										}\nExtra Owners: \n\t- ${
											user.extra_owners.join("\n\t- ") ||
											"None"
										}`
									),
								}
							);

						return interaction.followUp({
							embeds: [embed],
						});
					}
				} else
					return interaction.followUp({
						content: "Error: That bot does not exist.",
					});
			}
		}
	},
	async autocomplete(interaction, database) {},
};
