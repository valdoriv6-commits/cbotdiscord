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
// VARIABLES
// ======================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ======================
// VALIDACIÓN
// ======================

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {

    console.log("❌ Faltan variables en .env");
    process.exit(1);

}

// ======================
// IMAGEN
// ======================

const IMG = "https://i.imgur.com/WyJrWv3.gif";

// ======================
// ROL CIVIL
// ======================

const ROL_CIVIL = "1351370954785423360";

// ======================
// ROLES FGR
// ======================

const ROLES_FGR = [
    "1389071787094184127",
    "1391149327057031169",
    "1351375724526829609",
    "1351356643438497863",
    "1385004865427603527",
    "1351351881657618535",
    "1351384226297024552",
    "1351384232144146512"
];

// ======================
// CLIENT
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

    // ======================
    // PLACA
    // ======================

    new SlashCommandBuilder()
        .setName('placa')
        .setDescription('Asignar placa')
        .addUserOption(o =>
            o.setName('usuario')
                .setDescription('Usuario')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('prefijo')
                .setDescription('Prefijo')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('nombre')
                .setDescription('Nombre')
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName('numero')
                .setDescription('Número')
                .setRequired(true)
        ),

    // ======================
    // ASCENSO
    // ======================

    new SlashCommandBuilder()
        .setName('ascenso')
        .setDescription('Ascender agente')
        .addUserOption(o =>
            o.setName('usuario')
                .setDescription('Usuario')
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName('nuevo_rango')
                .setDescription('Nuevo rango')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('motivo')
                .setDescription('Motivo')
                .setRequired(true)
        ),

    // ======================
    // DESCENSO
    // ======================

    new SlashCommandBuilder()
        .setName('descenso')
        .setDescription('Descender agente')
        .addUserOption(o =>
            o.setName('usuario')
                .setDescription('Usuario')
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName('nuevo_rango')
                .setDescription('Nuevo rango')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('motivo')
                .setDescription('Motivo')
                .setRequired(true)
        ),

    // ======================
    // DESPIDO
    // ======================

    new SlashCommandBuilder()
        .setName('despido')
        .setDescription('Despedir agente')
        .addUserOption(o =>
            o.setName('usuario')
                .setDescription('Usuario')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('motivo')
                .setDescription('Motivo')
                .setRequired(true)
        ),

    // ======================
    // SANCIÓN
    // ======================

    new SlashCommandBuilder()
        .setName('sancion')
        .setDescription('Aplicar sanción')
        .addUserOption(o =>
            o.setName('usuario')
                .setDescription('Agente sancionado')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('sancion')
                .setDescription('Tipo de sanción')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('motivo')
                .setDescription('Motivo')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('nota')
                .setDescription('Nota')
                .setRequired(true)
        )
        .addUserOption(o =>
            o.setName('autorizado')
                .setDescription('Quién autorizó')
                .setRequired(true)
        ),

    // ======================
    // EMBED PERSONALIZADO
    // ======================

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Crear embed personalizado')
        .addStringOption(o =>
            o.setName('titulo')
                .setDescription('Título')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('descripcion')
                .setDescription('Descripción')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('color')
                .setDescription('Color HEX Ej: #ff0000')
                .setRequired(false)
        )
        .addStringOption(o =>
            o.setName('imagen')
                .setDescription('URL imagen')
                .setRequired(false)
        )

].map(c => c.toJSON());

// ======================
// REGISTRAR COMANDOS
// ======================

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {

    try {

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands }
        );

        console.log("✅ Comandos registrados");

    } catch (err) {

        console.error("❌ Error registrando comandos:", err);

    }

})();

// ======================
// READY
// ======================

client.once('clientReady', () => {

    console.log(`🟢 ${client.user.tag} ONLINE`);

});

// ======================
// INTERACCIONES
// ======================

client.on('interactionCreate', async interaction => {

    if (!interaction.isChatInputCommand()) return;

    try {

        // ======================
        // PLACA
        // ======================

        if (interaction.commandName === 'placa') {

            const usuario = interaction.options.getUser('usuario');
            const prefijo = interaction.options.getString('prefijo');
            const nombre = interaction.options.getString('nombre');
            const numero = interaction.options.getInteger('numero');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            const placa = `[${prefijo}-${String(numero).padStart(3, '0')}]`;

            await miembro.setNickname(`${placa} ${nombre}`);

            for (const roleId of ROLES_FGR) {

                const role = interaction.guild.roles.cache.get(roleId);

                if (role) {
                    await miembro.roles.add(role).catch(() => {});
                }

            }

            const embed = new EmbedBuilder()
                .setTitle('🚔 PLACA ASIGNADA')
                .setColor(0x00ff00)
                .setImage(IMG)
                .addFields(
                    {
                        name: '👮 Oficial',
                        value: nombre,
                        inline: true
                    },
                    {
                        name: '👤 Usuario',
                        value: `${usuario}`,
                        inline: true
                    },
                    {
                        name: '🪪 Placa',
                        value: placa,
                        inline: true
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });

        }

        // ======================
        // ASCENSO
        // ======================

        if (interaction.commandName === 'ascenso') {

            const usuario = interaction.options.getUser('usuario');
            const nuevo = interaction.options.getRole('nuevo_rango');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            await miembro.roles.add(nuevo);

            const embed = new EmbedBuilder()
                .setTitle('⬆️ ASCENSO')
                .setColor(0x00ff00)
                .setImage(IMG)
                .addFields(
                    {
                        name: '👤 Usuario',
                        value: `${usuario}`
                    },
                    {
                        name: '🎖 Nuevo rango',
                        value: `${nuevo}`
                    },
                    {
                        name: '📄 Motivo',
                        value: motivo
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });

        }

        // ======================
        // DESCENSO
        // ======================

        if (interaction.commandName === 'descenso') {

            const usuario = interaction.options.getUser('usuario');
            const nuevo = interaction.options.getRole('nuevo_rango');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            await miembro.roles.add(nuevo);

            const embed = new EmbedBuilder()
                .setTitle('⬇️ DESCENSO')
                .setColor(0xff9900)
                .setImage(IMG)
                .addFields(
                    {
                        name: '👤 Usuario',
                        value: `${usuario}`
                    },
                    {
                        name: '📉 Nuevo rango',
                        value: `${nuevo}`
                    },
                    {
                        name: '📄 Motivo',
                        value: motivo
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });

        }

        // ======================
        // DESPIDO
        // ======================

        if (interaction.commandName === 'despido') {

            const usuario = interaction.options.getUser('usuario');
            const motivo = interaction.options.getString('motivo');

            const miembro = await interaction.guild.members.fetch(usuario.id);

            const roles = miembro.roles.cache.filter(
                role => role.id !== interaction.guild.id
            );

            for (const role of roles.values()) {

                await miembro.roles.remove(role).catch(() => {});

            }

            await miembro.setNickname(null).catch(() => {});

            const rolCivil = interaction.guild.roles.cache.get(ROL_CIVIL);

            if (rolCivil) {

                await miembro.roles.add(rolCivil).catch(() => {});

            }

            const embed = new EmbedBuilder()
                .setTitle('❌ DESPIDO')
                .setColor(0xff0000)
                .setImage(IMG)
                .addFields(
                    {
                        name: '👤 Usuario',
                        value: `${usuario}`
                    },
                    {
                        name: '📄 Motivo',
                        value: motivo
                    },
                    {
                        name: '🗑 Estado',
                        value: 'Roles eliminados y placa removida'
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });

        }

        // ======================
        // SANCIÓN
        // ======================

        if (interaction.commandName === 'sancion') {

            const usuario = interaction.options.getUser('usuario');
            const sancion = interaction.options.getString('sancion');
            const motivo = interaction.options.getString('motivo');
            const nota = interaction.options.getString('nota');
            const autorizado = interaction.options.getUser('autorizado');

            const embed = new EmbedBuilder()
                .setTitle('⚠️ SANCIÓN OFICIAL')
                .setColor(0xffff00)
                .setImage(IMG)
                .addFields(
                    {
                        name: '⚖️ Sanción',
                        value: sancion
                    },
                    {
                        name: '📄 Motivo',
                        value: motivo
                    },
                    {
                        name: '👮 Agente/s',
                        value: `${usuario}`
                    },
                    {
                        name: '📝 Nota',
                        value: nota
                    },
                    {
                        name: '✅ Autorizado',
                        value: `${autorizado}`
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });

        }

        // ======================
        // EMBED
        // ======================

        if (interaction.commandName === 'embed') {

            const titulo = interaction.options.getString('titulo');
            const descripcion = interaction.options.getString('descripcion');
            const color = interaction.options.getString('color') || '#0099ff';
            const imagen = interaction.options.getString('imagen');

            const embed = new EmbedBuilder()
                .setTitle(titulo)
                .setDescription(descripcion)
                .setColor(color);

            if (imagen) {
                embed.setImage(imagen);
            }

            return interaction.reply({
                embeds: [embed]
            });

        }

    } catch (err) {

        console.error("❌ ERROR:", err);

        if (!interaction.replied) {

            interaction.reply({
                content: "❌ Error ejecutando comando",
                ephemeral: true
            }).catch(() => {});

        }

    }

});

// ======================
// EVITAR CIERRE
// ======================

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Uncaught exception:', error);
});

// ======================
// LOGIN
// ======================

client.login(TOKEN);