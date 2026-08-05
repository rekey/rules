import util from 'node:util';
import child_process from 'node:child_process';

const exec = util.promisify(child_process.exec);

/**
 * 列出指定路径下的文件和目录
 * @param path - 要列出的目录路径
 * @returns 目录下的文件/目录名称数组，若执行出错则返回空数组
 */
export async function list(path: string) {
    const resp = await exec(`ls ${path}`);
    if (resp.stderr !== '') {
        return [];
    }
    return resp.stdout.split('\n').filter((line) => {
        return line !== '';
    });
}
