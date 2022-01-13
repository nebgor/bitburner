import {main as openPorts} from 'openPorts.js' ;
import {list_servers, gw_rules} from 'opened_servers.js';
import {deploy_threads} from 'deploy.js';

/** @param {NS} ns **/
export async function main(ns) {
	const args = ns.flags([["help", false]]);
	// const script = args._[0];
	// const script_args = args._; //.slice(1);

	if (args.help || args._.length < 1) {
		ns.tprint("This script deploys specified script and args on all openable servers with maximum threads desirable.");
		ns.tprint(`Usage: run ${ns.getScriptName()} SCRIPT ARGUMENTS`);
		ns.tprint("Example:");
		ns.tprint(`> run ${ns.getScriptName()} basic_hack.js nontargetargs`);
		return;
	}
	const script = ns.args[0];
	const script_args =[];
	if (ns.args.length > 1) script_args = ns.args.slice(1);
	await opendeploy(ns, script, script_args);
}
export async function opendeploy(ns, script, script_args, wg_) {

	await openPorts(ns);

	const servers = list_servers(ns).filter(s => ns.hasRootAccess(s.host)); //.concat(['home']);
	const topserver = Object.assign({}, servers[0]);
	var targ_s = 0;
    for(const s of servers) {
		if (targ_s < servers.length) {
			ns.tprint('Deploy to ' + s.host + " exists: " + ns.serverExists(s.host));
			if (["home", "n00dles"].includes(s.host)) { // this IS and MUST BE SORTED as last server!
				// start
				if(s.host == "home") ns.run(`${s.host}.js`);

				// proc manage
				const processes = ns.ps(s.host);
				for (const proc of processes) {
					if ( proc.filename === "wg_hack.js") {
						ns.kill(proc.pid);
					}
					if ( proc.filename === "weaken.js") {
						ns.kill(proc.pid);
					}
					if ( proc.filename === "grow.js") {
						ns.kill(proc.pid);
					}
				}

				var scriptsize = ns.getScriptRam("grow.js");
				var maxram = ns.getServerMaxRam(s.host) - 20;
				var threadallot = Math.floor((maxram - ns.getServerUsedRam(s.host)) / scriptsize );
				var hometargets_maxmoney = servers.reduce( (prev,cur) =>
					(prev.maxMoney <= cur.maxMoney) ? cur.maxMoney : prev.maxMoney
				);
				var targ_share = Math.floor(threadallot / hometargets_maxmoney);
				ns.print("targ_share:"+targ_share);

				for(const targetserv of servers.filter( s => s.maxMoney > 0 && s.grow.threads > 1 ) ) {
					if (hometargets > 0 && targ_share > 0) {
						var shareused = 0;
						targetserv.grow.threads = Math.floor(targ_share*0.75*s.maxMoney);
						shareused += await count_thread(ns, s, "grow.js", targetserv, script_args);
						// last few for targ are weaken
						targetserv.grow.threads = Math.floor(targ_share*0.25*s.maxMoney);
						shareused += await count_thread(ns, s, "weaken.js", targetserv, script_args);
						threadallot -= shareused;
						ns.print("threads_left (for next target):"+ threadallot);
						targ_s++;
						hometargets--;
					}
				 }
			} else {
				ns.killall(s.host);
				await count_thread(ns, s, script, servers[targ_s], script_args);
				if (servers[targ_s].grow.threads < 1) {
					targ_s++;
					ns.tprint(`no threads left desired, incremented target server.`);
				}
			}
		}
	}
	return topserver;
}

async function count_thread(ns, s, script, targ_serv, script_args) {
	// ns.tprint(targ_serv);
	const deployed_threads = await deploy_threads(ns, s.host, script, targ_serv.host, script_args, targ_serv.grow.threads );
	targ_serv.grow.threads -= deployed_threads;
	ns.tprint(`deployed: ${deployed_threads}, desired threads: ${targ_serv.grow.threads}`);
	return deployed_threads;
}