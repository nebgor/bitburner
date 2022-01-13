export async function main(ns) {
    const flags = ns.flags([
        ['refreshrate', 200],
        ['help', false],
    ])
    if (flags._.length === 0 || flags.help) {
        ns.tprint("This script helps visualize the money and security of a server.");
        ns.tprint(`USAGE: run ${ns.getScriptName()} SERVER_NAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`)
        return;
    }
    ns.tail();
    ns.disableLog('ALL');
    while (true) {
        const server = flags._[0];
        const hgw = hgw_time_threads(ns, server);
        ns.clearLog(server);
        ns.print(`${server}:`);
        ns.print(` $_______: ${ns.nFormat(hgw.money, "$0.000a")} / ${ns.nFormat(hgw.maxMoney, "$0.000a")} (${(hgw.money / hgw.maxMoney * 100).toFixed(2)}%)`);
        ns.print(` security: +${hgw.security}`);
        ns.print(` hack____: ${ns.tFormat(hgw.hack.time)} (t=${hgw.hack.threads})`);
        ns.print(` grow____: ${ns.tFormat(hgw.grow.time)} (t=${hgw.grow.threads})`);
        ns.print(` weaken__: ${ns.tFormat(hgw.weaken.time)} (t=${hgw.weaken.threads})`);
        await ns.sleep(flags.refreshrate);
    }
}

export function hgw_time_threads(ns, server) {
    let money = ns.getServerMoneyAvailable(server);
    if (money === 0) money = 1;
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    const sec = ns.getServerSecurityLevel(server);

    return {
        host: server,
        money,
        maxMoney,
        security: (sec - minSec).toFixed(2),
        usedgb : ns.getServerUsedRam(server).toFixed(2),
        maxgb : ns.getServerMaxRam(server).toFixed(2),
        hackChance : ns.hackAnalyzeChance(server).toFixed(2) * 100,        
        hack: {
            time: ns.getHackTime(server).toFixed(0),
            threads: Math.ceil(ns.hackAnalyzeThreads(server, money)),
        },
        grow: {
            time: ns.getGrowTime(server).toFixed(0),
            threads: Math.ceil(ns.growthAnalyze(server, (maxMoney / money)+1)),
        },
        weaken: {
            time: ns.getWeakenTime(server).toFixed(0),
            threads: Math.ceil((sec - minSec) * 20),
        }
    }
}

export function autocomplete(data, args) {
    return data.servers;
}