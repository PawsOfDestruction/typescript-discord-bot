
import {ChatInputCommandInteraction, Interaction, SlashCommandBuilder} from 'discord.js'
export const data = new SlashCommandBuilder().setName('say').setDescription('make the bot say something').addStringOption(
    opt => opt.setName('text').setDescription('what to say').setRequired(true)
);

export async function execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('text')!;

    if (!interaction.channel?.isSendable()) {
        return;
    }
    await interaction.deferReply();
    await interaction.channel.send(text)
    await interaction.deleteReply();
}