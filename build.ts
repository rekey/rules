import path from 'node:path';
import fs from 'node:fs/promises';
import { fromFileUrl } from "@std/path";

import { list } from './utils/index.ts';

import { ruleFileToList } from './utils/rule.ts';

const _dirname = import.meta.dirname || path.dirname(fromFileUrl(import.meta.url));
const ruleConfigPath = path.resolve(_dirname, './rule-config');
const ruleDstPath = path.resolve(_dirname, './rule-dst');
const ruleDstClashPath = path.resolve(ruleDstPath, 'clash');
const ruleDstOxidnsPath = path.resolve(ruleDstPath, 'oxidns');

await fs.mkdir(ruleDstPath, { recursive: true });
await fs.mkdir(ruleDstClashPath, { recursive: true });
await fs.mkdir(ruleDstOxidnsPath, { recursive: true });

const ruleFiles = await list(ruleConfigPath);
if (ruleFiles.length === 0) {
    console.error(`No rule config files found in ${ruleConfigPath}`);
    Deno.exit(1);
}

const htmlClashItems: string[] = [];
const htmlOxidnsItems: string[] = [];

for (const ruleFile of ruleFiles) {
    const ruleFilePath = path.resolve(ruleConfigPath, ruleFile);
    const data = await ruleFileToList(_dirname, ruleFilePath);
    const ruleClash: string[] = [];
    const ruleOxidns: string[] = [];
    data.domains.forEach((domain) => {
        ruleClash.push(`DOMAIN-SUFFIX,${domain}`);
        ruleOxidns.push(`domain:${domain}`);
    });
    data.ips.forEach((ip) => {
        ruleClash.push(`IP-CIDR,${ip}`);
    });
    // clash
    const ruleDstClashFilePath = path.resolve(ruleDstClashPath, `${data.name}.list`);
    await fs.writeFile(ruleDstClashFilePath, ruleClash.join('\n'));
    htmlClashItems.push(`    <li><a href="clash/${data.name}.list">${data.name}.list</a></li>`);
    // oxidns
    const ruleDstOxidnsFilePath = path.resolve(ruleDstOxidnsPath, `${data.name}.list`);
    await fs.writeFile(ruleDstOxidnsFilePath, ruleOxidns.join('\n'));
    htmlOxidnsItems.push(`    <li><a href="oxidns/${data.name}.list">${data.name}.list</a></li>`);
}

// 生成 Pages 目录页,便于像浏览仓库一样查看全部产物
const indexHtml = [
    '<!DOCTYPE html>',
    '<html lang="zh">',
    '<head>',
    '<meta charset="utf-8">',
    '<title>rules</title>',
    '</head>',
    '<body>',
    '<h2>clash</h2>',
    '<ul>',
    ...htmlClashItems,
    '</ul>',
    '<h2>oxidns</h2>',
    '<ul>',
    ...htmlOxidnsItems,
    '</ul>',
    '</body>',
    '</html>',
].join('\n') + '\n';
await fs.writeFile(path.resolve(ruleDstPath, 'index.html'), indexHtml);
