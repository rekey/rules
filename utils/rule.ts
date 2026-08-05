import path from 'node:path';

import { list } from './index.ts';

export type RuleData = {
    domain: string[];
    ip: string[];
    name: string;
};

async function includeRule(rootDir: string, ruleFiles: string[], result: Set<string>) {
    for (const ruleFile of ruleFiles) {
        if (ruleFile.includes('@ads')) {
            console.log(ruleFile);
            continue;
        }
        const ruleFilePath = path.resolve(rootDir, ruleFile);
        try {
            const ruleContent = await Deno.readTextFile(ruleFilePath);
            ruleContent.split('\n').forEach((line) => {
                line = line.trim();
                if (line === '') {
                    return;
                }
                if (line[0] === '#') {
                    return;
                }
                line = line.replaceAll('+.', '');
                if (line[0] === '.') {
                    line = line.slice(1);
                }
                result.add(line);
            });
        } catch (e) {
            console.error(`Error reading rule file ${ruleFilePath}: ${e}`);
        }
    }
}

async function includeRules(rootDir: string, ruleFileTexts: string[]) {
    const result = new Set<string>();
    for (const ruleFileText of ruleFileTexts) {
        try {
            // console.log(path.resolve(rootDir, ruleFileText));
            const ruleFiles = await list(path.resolve(rootDir, ruleFileText));
            await includeRule(rootDir, ruleFiles, result);
        } catch (e) {
            console.error(`Error listing rule file ${path.resolve(rootDir, ruleFileText)}: ${e}`);
        }
    }
    return result;
}

/**
 * 读取规则配置文件并解析其中引用的所有条目
 * @param rootDir - 规则文件的根目录路径，用于解析相对路径
 * @param ruleFilePath - 规则配置文件的路径（JSON 格式，包含 domain 和 ip 字段）
 * @returns 包含去重后的条目集合的对象
 */
export async function ruleFileToList(rootDir: string, ruleFilePath: string) {
    const ruleContent = await Deno.readTextFile(ruleFilePath);
    const data: RuleData = JSON.parse(ruleContent);
    return {
        domains: await includeRules(rootDir, data.domain),
        ips: await includeRules(rootDir, data.ip),
        name: data.name,
    };
}