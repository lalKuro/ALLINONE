const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube');
const musicIcons = require('../../UI/icons/musicicons'); 
module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Spiele den Song weiter'),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply('Du musst in einem Voice Channel sein um den Song weiterzuspielen!');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return interaction.reply('Ich berauche die Erlaubnis um ihren Voice Channel beizutreten.');
        }

        try {
            await interaction.reply('**Spiele den pausierten song weiter...**');

            // Resume the song
            await interaction.client.distube.resume(voiceChannel);

            const resumedEmbed = new EmbedBuilder()
                .setColor('#DC92FF')
                .setAuthor({ 
                    name: "Song weitergespielt", 
                    iconURL: musicIcons.pauseresumeIcon ,
                    url: "https://discord.gg/dvWvS8kuWV"
                })
                .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })
                .setDescription('**Der Pausierte Song wurde weitergespielt.**');

            if (interaction.isCommand && interaction.isCommand()) {
                await interaction.editReply({ embeds: [resumedEmbed] });
            } else {
                await interaction.reply({ embeds: [resumedEmbed] });
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
                    .setDescription('**Kein Song wurde gefunden.**');

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
                    .setDescription('**Der Music Player wurde nicht pausiert**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [notPausedEmbed] });
                } else {
                    await interaction.reply({ embeds: [notPausedEmbed] });
                }
            } else if (error instanceof DisTubeError && error.code === 'RESUMED') {
                const alreadyResumedEmbed = new EmbedBuilder()
                    .setColor('#DC92FF')
                    .setAuthor({ 
                        name: "Oops!", 
                        iconURL: musicIcons.wrongIcon ,
                         url: "https://discord.gg/dvWvS8kuWV"
                        })
                    .setFooter({ text: 'Distube Player', iconURL: musicIcons.footerIcon })    
                    .setDescription('**Der Music Player wurde weitergespielt.**');

                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply({ embeds: [alreadyResumedEmbed] });
                } else {
                    await interaction.reply({ embeds: [alreadyResumedEmbed] });
                }
            } else {
                const errorMessage = 'Ein Fehler ist während der Command auführung aufgetaucht.';
                if (interaction.isCommand && interaction.isCommand()) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        }
    },
};
