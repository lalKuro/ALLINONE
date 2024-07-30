const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('überspringe den aktuellen song in der Warteschlange'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('**Du musst in einem Voice channel dafür sein!**');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply('**Ich brsuche die Erlaubnis ihren Voice Channel beizutreten!**');
        }

        try {
            await interaction.reply('**Überspringe den aktuellen Song...**');

            // Skip the song
            await interaction.client.distube.skip(voiceChannel);

            // Check if there are songs left in the queue
            const queue = interaction.client.distube.getQueue(interaction.guildId);
            if (!queue || !queue.songs.length) {
                const noSongsEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })   
                    .setDescription('**Keine Lieder mehr in der Warteschlange.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    return interaction.editReply({ embeds: [noSongsEmbed] });
                } else {
                    return interaction.reply({ embeds: [noSongsEmbed] });
                }
            }

            // Get the next song
            const nextSong = queue.songs[0];
            const nextSongEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Song Übersprungen", 
                    iconURL: musicIcons.skipIcon ,
                     url: "https://discord.gg/dvWvS8kuWV"
                    })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
                .addFields(
                    { name: 'Title', value: nextSong.name },
                    { name: 'Duration', value: nextSong.formattedDuration }
                );

            if (interaction.isCommand && interaction.isCommand()) {
                await interaction.editReply({ embeds: [nextSongEmbed] });
            } else {
                await interaction.reply({ embeds: [nextSongEmbed] });
            }
        } catch (error) {

            if (error instanceof DisTubeError && error.code === 'NO_QUEUE') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
                    .setDescription('**Es ist kein Song in der Warteschlange.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [noQueueEmbed] });
                } else {
                    await interaction.reply({ embeds: [noQueueEmbed] });
                }
            } else if (error instanceof DisTubeError && error.code === 'NO_UP_NEXT') {
                const noQueueEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })  
                    .setDescription('**Es ist kein Song in der Warteschlange!**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [noQueueEmbed] });
                } else {
                    await interaction.reply({ embeds: [noQueueEmbed] });
                }
            } else {
                const errorMessage = 'Ein Fehler ist währenddessen aufgetaucht.';
                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};
