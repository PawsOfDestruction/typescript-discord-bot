
import { ActivityType, Client, IntentsBitField } from 'discord.js';

import { commands } from './commands';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        // IntentsBitField.Flags.Mes,
    ]
});

client.once('ready', () => {
    if (client.user) {
        client.user.setPresence({activities: [{name: 'with bun', url: 'https://bun.sh/',  type: ActivityType.Playing}], status: 'dnd'})
    }
    console.log('Trout monger is active!!! :O');
})



client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    
    const { commandName } = interaction;

    const cmd = commands.get(commandName); 
    if (!cmd) return;
    // @ts-expect-error execute does not exist
    cmd.execute(interaction, client);

    return;
})

client.login(process.env.DISCORD_BOT_TOKEN);