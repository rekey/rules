import path from 'node:path';
import fs from 'node:fs/promises';
import { fromFileUrl } from "@std/path";

import { list } from './utils/index.ts';

import { ruleFileToList } from './utils/rule.ts';

const _dirname = import.meta.dirname || path.dirname(fromFileUrl(import.meta.url));
const ruleConfigPath = path.resolve(_dirname, './rule-config');
const ruleDstPath = path.resolve(_dirname, './rule-dst');
const ruleDstClashPath = path.resolve(ruleDstPath, 'clash');

await fs.mkdir(ruleDstPath, { recursive: true });
await fs.mkdir(ruleDstClashPath, { recursive: true });

const ruleFiles = await list(ruleConfigPath);
if (ruleFiles.length === 0) {
    console.error(`No rule config files found in ${ruleConfigPath}`);
    Deno.exit(1);
}

for (const ruleFile of ruleFiles) {
    const ruleFilePath = path.resolve(ruleConfigPath, ruleFile);
    const data = await ruleFileToList(_dirname, ruleFilePath);
    const ruleClash: string[] = [];
    data.domains.forEach((domain) => {
        ruleClash.push(`DOMAIN-SUFFIX,${domain}`);
    });
    data.ips.forEach((ip) => {
        ruleClash.push(`IP-CIDR,${ip}`);
    });
    const ruleDstClashFilePath = path.resolve(ruleDstClashPath, `${data.name}.list`);
    await fs.writeFile(ruleDstClashFilePath, ruleClash.join('\n') + '\n');
}
