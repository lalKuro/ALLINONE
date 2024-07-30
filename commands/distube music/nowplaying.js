const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Zeige den aktuellen song'),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            await interaction.deferReply();
        }

        await this.executeNowPlaying(interaction);
    },

    async executePrefix(message) {
        await this.executeNowPlaying(message);
    },

    async executeNowPlaying(source) {
        try {
            const voiceChannel = source.member.voice.channel;

            if (!voiceChannel) {
                return source.channel.send('**Du musst in einem Voice channel sein um zu sehen welcher song immoment spielt!**');
            }

            const permissions = voiceChannel.permissionsFor(source.client.user);
            if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
                return source.channel.send('Ich brauche die Erlaubnis ihren Voice Channel beizutreten!');
            }

           
            const queue = source.client.distube.getQueue(source.guildId);
            if (!queue || !queue.playing) {
                const noSongEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription('Kein Song ist immoment am laufen.');

                return source.channel.send({ embeds: [noSongEmbed] });
            }

            const currentSong = queue.songs[0];
            const nowPlayingEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "spielt immoment..", 
                    iconURL: musicIcons.playerIcon,
                     url: "https://discord.gg/dvWvS8kuWV"
                    })
                .setDescription(`- **Hier sind Informationen über den aktuellen song**\n[${currentSong.name}](${currentSong.url})`)
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
                .addFields(
                    { name: 'Duration', value: currentSong.formattedDuration },
                    { name: 'Requested by', value: currentSong.user.username }
                );

            return source.channel.send({ embeds: [nowPlayingEmbed] });
        } catch (error) {
            console.error(error);

            if (error instanceof DisTubeError && error.code === 'NO_QUEUE') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription('**Es gibt keine aktuelle Warteschlange.**');

                return source.channel.send({ embeds: [noQueueEmbed] });
            } else {
                const errorMessage = 'Ein Fehler ist währenddessen aufgetaucht.';
                return source.channel.send(errorMessage);
            }
        }
    },
};
