require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

// ======================
// VARIABLES SEGURAS (.env)
// ======================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ======================
// CLIENTE
// ======================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ======================
// COMANDOS
// ======================

const commands = [

    new SlashCommandBuilder()
        .setName('placa')
        .setDescription('Asigna una placa oficial')
        .addUserOption(option =>
            option.setName('usuario').setDescription('Usuario').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('prefijo').setDescription('Ejemplo: FGR').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nombre').setDescription('Nombre del agente').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('numero').setDescription('Número de placa').setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('ascenso')
        .setDescription('Ascender agente')
        .addUserOption(option =>
            option.setName('usuario').setDescription('Usuario').setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('nuevo_rango').setDescription('Nuevo rango').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('motivo').setDescription('Motivo del ascenso').setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rango_anterior').setDescription('Rango anterior')
        ),

    new SlashCommandBuilder()
        .setName('descenso')
        .setDescription('Descender agente')
        .addUserOption(option =>
            option.setName('usuario').setDescription('Usuario').setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('nuevo_rango').setDescription('Nuevo rango').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('motivo').setDescription('Motivo del descenso').setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rango_anterior').setDescription('Rango anterior')
        ),

    new SlashCommandBuilder()
        .setName('despido')
        .setDescription('Despedir agente')
        .addUserOption(option =>
            option.setName('usuario').setDescription('Usuario').setRequired(true)
        )
        .addStringOption(option =>
            option.setName('motivo').setDescription('Motivo del despido').setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rango').setDescription('Rango a quitar')
        )

].map(cmd => cmd.toJSON());

// ======================
// REGISTRO DE COMANDOS
// ======================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comandos...');

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log('✅ Comandos registrados.');
    } catch (error) {
        console.error(error);
    }
})();

// ======================
// INTERACCIONES
// ======================

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    // ===== /PLACA =====
    if (interaction.commandName === 'placa') {

        const usuario = interaction.options.getUser('usuario');
        const prefijo = interaction.options.getString('prefijo');
        const nombre = interaction.options.getString('nombre');
        const numero = interaction.options.getInteger('numero');

        const placa = `[${prefijo}-${String(numero).padStart(3, '0')}]`;

        const miembro = await interaction.guild.members.fetch(usuario.id);

        const nuevoApodo = `${placa} ${nombre}`;

        if (!miembro.manageable) {
            return interaction.reply({ content: '❌ No puedo cambiar el apodo.', ephemeral: true });
        }

        await miembro.setNickname(nuevoApodo);

        const embed = new EmbedBuilder()
            .setTitle('🚔 PLACA OFICIAL ASIGNADA')
            .setDescription(
                `👮 Usuario: ${usuario}\n📛 Nombre: ${nombre}\n🚓 Placa: ${placa}\n🆔 Apodo: ${nuevoApodo}`
            )
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed] });
    }

    // ===== /ASCENSO =====
    if (interaction.commandName === 'ascenso') {

        const usuario = interaction.options.getUser('usuario');
        const nuevoRango = interaction.options.getRole('nuevo_rango');
        const rangoAnterior = interaction.options.getRole('rango_anterior');
        const motivo = interaction.options.getString('motivo');

        const miembro = await interaction.guild.members.fetch(usuario.id);

        await miembro.roles.add(nuevoRango);
        if (rangoAnterior) await miembro.roles.remove(rangoAnterior);

        const embed = new EmbedBuilder()
            .setTitle('⬆️ ASCENSO OFICIAL')
            .setDescription(
                `👮 Usuario: ${usuario}\n🏅 Nuevo rango: ${nuevoRango}\n📄 Motivo: ${motivo}`
            )
            .setColor(0x00ff00);

        await interaction.reply({ embeds: [embed] });
    }

    // ===== /DESCENSO =====
    if (interaction.commandName === 'descenso') {

        const usuario = interaction.options.getUser('usuario');
        const nuevoRango = interaction.options.getRole('nuevo_rango');
        const rangoAnterior = interaction.options.getRole('rango_anterior');
        const motivo = interaction.options.getString('motivo');

        const miembro = await interaction.guild.members.fetch(usuario.id);

        await miembro.roles.add(nuevoRango);
        if (rangoAnterior) await miembro.roles.remove(rangoAnterior);

        const embed = new EmbedBuilder()
            .setTitle('⬇️ DESCENSO OFICIAL')
            .setDescription(
                `👮 Usuario: ${usuario}\n📉 Nuevo rango: ${nuevoRango}\n📄 Motivo: ${motivo}`
            )
            .setColor(0xffaa00);

        await interaction.reply({ embeds: [embed] });
    }

    // ===== /DESPIDO =====
    if (interaction.commandName === 'despido') {

        const usuario = interaction.options.getUser('usuario');
        const motivo = interaction.options.getString('motivo');
        const rango = interaction.options.getRole('rango');

        const miembro = await interaction.guild.members.fetch(usuario.id);

        if (rango) await miembro.roles.remove(rango);

        const embed = new EmbedBuilder()
            .setTitle('❌ DESPIDO OFICIAL')
            .setDescription(
                `👮 Usuario: ${usuario}\n📄 Motivo: ${motivo}`
            )
            .setColor(0xff0000);

        await interaction.reply({ embeds: [embed] });
    }
});

// ======================
// READY
// ======================

client.once('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ======================
// LOGIN
// ======================

client.login(TOKEN);