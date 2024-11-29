
const CONFIG = {
    GUILD_ID: process.env.DISCORD_GUILD_ID!,
    CLIENT_ID: process.env.DISCORD_CLIENT_ID!,
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN!,
} as const

Object.values(CONFIG).map(value => {
    if (!value) {
        throw new Error('Failed to load config', {cause: 'Missing env vars'})
    }
    return value;
})

export {CONFIG};