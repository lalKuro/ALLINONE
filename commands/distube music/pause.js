const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons'); 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('den aktuellen song gestoppt!'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('**Du musst in einem Voice channel sein um den song zu pausieren!**');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply('Ich brauche Erlaubnis um ihren Voice Channel beitreten zu können.');
        }

        try {
            await interaction.reply('**Den aktuellen song pausiert...**');

            // Pause the song
            await interaction.client.distube.pause(voiceChannel);

            const pausedEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Song pausiert", 
                    iconURL: musicIcons.pauseresumeIcon ,
                    url: "https://discord.gg/dvWvS8kuWV"
                })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
                .setDescription('**Der aktuelle song ist Pausiert.**');
            if (interaction.isCommand && interaction.isCommand()) {
                await interaction.editReply({ embeds: [pausedEmbed] });
            } else {
                await interaction.reply({ embeds: [pausedEmbed] });
            }
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
                    .setDescription('**Kein song wird aktuell gespielt!**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [noQueueEmbed] });
                } else {
                    await interaction.reply({ embeds: [noQueueEmbed] });
                }
            } else if (error instanceof DisTubeError && error.code === 'NOT_PAUSED') {
                const notPausedEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })    
                    .setDescription('**Die Music ist aktuell nicht pausiert.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [notPausedEmbed] });
                } else {
                    await interaction.reply({ embeds: [notPausedEmbed] });
                }
            } else if (error instanceof DisTubeError && error.code === 'PAUSED') {
                const alreadyPausedEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })    
                    .setDescription('**Die Music ist schon pausiert.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [alreadyPausedEmbed] });
                } else {
                    await interaction.reply({ embeds: [alreadyPausedEmbed] });
                }
            } else {
                const errorMessage = 'Ein Fehler ist aufgetaucht während sie den Song pausieren wollten.';
                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};
