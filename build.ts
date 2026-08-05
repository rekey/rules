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

const indexItems: string[] = [];

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
    indexItems.push(`    <li><a href="clash/${data.name}.list">${data.name}.list</a></li>`);
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
    '<h1>rules</h1>',
    '<ul>',
    ...indexItems,
    '</ul>',
    '</body>',
    '</html>',
].join('\n') + '\n';
await fs.writeFile(path.resolve(ruleDstPath, 'index.html'), indexHtml);
