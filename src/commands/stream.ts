import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus, createAudioPlayer, DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { Client, CommandInteraction, GuildMember, VoiceChannel } from 'discord.js';
import ytdl from 'ytdl-core';
import { ServerQueue } from '../classes/ServerQueue';
import { getSongResourceByYouTubeUrl } from '../utils';

const player = createAudioPlayer();
const serverQueue = new ServerQueue();

export const data = new SlashCommandBuilder().setName('stream').setDescription('stream a song in VC').addStringOption(option =>
  option
    .setName('url')
    .setDescription('Provide a song URL')
    .setRequired(true));

export async function execute (interaction: CommandInteraction, client: Client): Promise<void> {
  await interaction.deferReply();
  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel;
  // const textChannel = interaction.channel as TextChannel;
  // const guild = interaction.guild as Guild;
  const url = interaction.options.getString('url');
  console.log(url);
  if (url === null) {
    await interaction.editReply('please provide a valid url!');
    return;
  }
  if (!ytdl.validateURL(url)) {
    await interaction.editReply('Invalid YouTube url!');
    return;
  }
  let connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection === undefined) {
    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
    });
  }

  connection.subscribe(player);
  serverQueue.addUrlToQueue(url);
  if (player.state.status === AudioPlayerStatus.Idle && (serverQueue.getQueuedUrls().length > 0)) {
    const resource = getSongResourceByYouTubeUrl(url);
    player.play(resource);
  }
  console.log('queued songs:', serverQueue.getQueuedUrls().length);
  connection.on(VoiceConnectionStatus.Signalling, () => {
    interaction.editReply('signalling').catch(console.error);
    console.log('signalling');
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('VoiceConnectionStatus: Ready');
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log('VoiceConnectionStatus: Destroyed');
    interaction.editReply('Voice connection destroyed').catch(console.error);
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log('VoiceConnectionStatus: Disconnected');
    interaction.editReply('Disconnected from voice channel!').catch(console.error);
    connection?.destroy();
  });

  player.on(AudioPlayerStatus.Buffering, () => {
    interaction.editReply(`Buffering resource for ${url}`).catch(console.error);
  });
  player.on(AudioPlayerStatus.Playing, () => {
    interaction.editReply(`Now playing: ${url}`).catch(console.error);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('player is idle');
    const nextUrl = serverQueue.getNextUrl();
    if (nextUrl === null) {
      return;
    }
    const resource = getSongResourceByYouTubeUrl(nextUrl);
    player.play(resource);
    interaction.editReply('Playing new song!').catch(console.error);
  });

  player.on('error', console.error);
}
