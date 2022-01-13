/**
* @param {NS} ns
**/
let hackablePorts;
let purchasedServersNum;
/* Searches for servers that are hackable,
 * cracks them if you don't have root access,
 * installs a hack script, and instructs them to
 * HACK THEMSELVES
 */
export const main = async function (ns) {
    findHackablePorts(ns);
    await findServer(ns, 'home', 'home', hackServer);
}

async function findServer(ns, startServer, targetServer, func) {
    let servers = ns.scan(targetServer, true).filter((server) => server !== startServer && !server.includes("faction!"));
    for (const server of servers) {
        const success = await func.call(this, ns, server);
        if (success) {
            await findServer(ns, targetServer, server, func);
        }
    }
}

async function buyServer(ns, ram=16) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    // var ram = 16;

    // Iterator we'll use for our loop
    // var i = 0;

    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    if (purchasedServersNum < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            const d = new Date();
            var hostname = ns.purchaseServer("pserv-" + d.getTime(), ram);
            ns.print('bought' + hostname);
            // scp("early-hack-template.script", hostname);
            // exec("early-hack-template.script", hostname, 3);
            ++purchasedServersNum;
        }
    }
}

async function hackServer(ns, server) {
    buyServer(ns);
    if (!crackServer(ns, server)) {
        return false;
    }
    return true;
}

function crackServer(ns, server) {
    if (ns.hasRootAccess(server)) {
        return true;
    }

    if (ns.fileExists('BruteSSH.exe')) {
        ns.brutessh(server);
    }
    if (ns.fileExists('FTPCrack.exe')) {
        ns.ftpcrack(server);
    }
    if (ns.fileExists('relaySMTP.exe')) {
        ns.relaysmtp(server);
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        ns.httpworm(server);
    }
    if (ns.fileExists('SQLInject.exe')) {
        ns.sqlinject(server);
    }
    if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel() ||
        ns.getServerNumPortsRequired(server) > hackablePorts) {
        return false;
    } else {
        ns.nuke(server);
        ns.tprint(`New Server Cracked: ${server}!`);
        return true;
    }
}

export function findHackablePorts(ns) {
    let hackPorts = 0;
    if (ns.fileExists('BruteSSH.exe')) {
        hackPorts += 1;
    }
    if (ns.fileExists('FTPCrack.exe')) {
        hackPorts += 1;
    }
    if (ns.fileExists('relaySMTP.exe')) {
        hackPorts += 1;
    }
    if (ns.fileExists('HTTPWorm.exe')) {
        hackPorts += 1;
    }
    if (ns.fileExists('SQLInject.exe')) {
        hackPorts += 1;
    }
    hackablePorts = hackPorts;
}