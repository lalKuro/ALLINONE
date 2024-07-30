const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('./../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('spiele ein Lied oder eine Playlist in deinem Voice Channel')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('der Link oder name von deinem Song oder die Playlist')
                .setRequired(true)),
    async execute(interaction) {
        let input;

        if (interaction.isCommand && interaction.isCommand()) {
            
            input = interaction.options.getString('input');
        } else {
            const guildId = interaction.guildId;
            const prefix = config.prefixes.server_specific[guildId] || config.prefixes.default;
            const args = interaction.content.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            if (command === 'play') {
                input = args.join(' ');
            }
        }

        if (!input) {
            return interaction.reply('Du musst einen Link oder ein Name in der Zeile angeben!');
        }

        return executePlay(interaction, input);
    },
};

async function executePlay(interaction, input) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply('Du musst in einem Voice Channel sein um Music zu spielen!');
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return interaction.reply('Ich brauche Erlaubnis um den Voice Channel beizutreten!');
    }

    try {
        await interaction.reply(`🎵** Suche und Spiele: ${input}**`);
        
        if (isPlaylist(input)) {
            await interaction.client.distube.playlist(voiceChannel, input, {
                textChannel: interaction.channel,
                member: interaction.member,
            });
        } else {
            await interaction.client.distube.play(voiceChannel, input, {
                textChannel: interaction.channel,
                member: interaction.member,
            });
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply('Ein Fehler ist während des spielens aufgetaucht.');
    }
}

function isPlaylist(input) {
    const playlistPatterns = [
        /playlist\?list=/i, // YouTube playlist pattern
        /open\.spotify\.com\/playlist\//i, // Spotify playlist pattern
        /spotify:playlist:/i // Spotify playlist URI pattern
    ];
    return playlistPatterns.some(pattern => pattern.test(input));
}
