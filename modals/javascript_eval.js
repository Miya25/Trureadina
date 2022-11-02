module.exports = {
	data: {
		name: "javascript-eval",
	},
	async execute(client, interaction, database) {
		const code = interaction.fields.getTextInputValue("code");
		let inline = interaction.fields.getTextInputValue("inline") || "n";
		let hidden = interaction.fields.getTextInputValue("hidden") || "n";

		if (inline.toLowerCase() === "y") inline = true;
		else inline = false;

		const limit = (value) => {
			let max_chars = 700;
			let i;

			if (value.length > max_chars) i = value.substr(0, max_chars);
			else i = value;

			return i;
		};

		const clean = async (text) => {
			if (text && text.constructor.name == "Promise") text = await text;

			if (typeof text !== "string")
				text = require("util").inspect(text, {
					depth: 1,
				});

			text = text
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			return text;
		};

		try {
			let evaled = eval(code);
			let results = await clean(evaled);
			let type = typeof evaled;
			let typeOf = type.charAt(0).toUpperCase() + type.slice(1);

			const tree = (obj) => {
				const data = [];

				if (obj === undefined || obj === null) data.push(`${obj}`);

				while (obj) {
					data.push(obj.constructor.name);
					obj = Object.getPrototypeOf(obj);
				}

				return data.reverse().join(" -> ");
			};

			embed = new client.EmbedBuilder()
				.setTitle("Evaluation Results")
				.setColor(0x00ff00)
				.addFields(
					{
						name: "Input:",
						value: client.codeBlock("javascript", limit(code)),
						inline: inline,
					},
					{
						name: "Output:",
						value: client.codeBlock("javascript", limit(results)),
						inline: inline,
					},
					{
						name: "Type:",
						value: client.codeBlock("javascript", typeOf),
						inline: inline,
					},
					{
						name: "Prototype:",
						value: client.codeBlock("javascript", tree(evaled)),
						inline: inline,
					}
				)
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Executed by ${
						interaction.user.username
					}, in about ${Math.floor(
						Date.now() - interaction.createdAt
					)}ms.`,
				});
		} catch (error) {
			embed = new client.EmbedBuilder()
				.setTitle("Evaluation Results")
				.setColor(0x00ff00)
				.addFields(
					{
						name: "Input:",
						value: client.codeBlock("javascript", limit(code)),
						inline: inline,
					},
					{
						name: "Output:",
						value: client.codeBlock("javascript", limit(error)),
						inline: inline,
					},
					{
						name: "Type:",
						value: client.codeBlock("javascript", "Error"),
						inline: inline,
					}
				)
				.setFooter({
					iconURL: interaction.user.displayAvatarURL(),
					text: `Executed by ${
						interaction.user.username
					}, in about ${Math.floor(
						Date.now() - interaction.createdAt
					)}ms.`,
				});
		}

		if (hidden.toLowerCase() === "y") {
			await interaction.deferReply({
				ephemeral: true,
			});

			await interaction.followUp({
				embeds: [embed],
				ephemeral: true,
			});
		} else
			await interaction.reply({
				embeds: [embed],
			});
	},
};
