import execa from 'execa';
import { argv } from '../argv';
import { entries, loadRollupConfig } from '../constant';
import {
  clearDirs,
  generateOutputFilePath,
  generateOutputPackagePath,
  getAllowPackages,
  getAllPackages,
  packageOnlyEntryFilter,
  checkAllSizes,
  clearPackageOutPackageDts,
} from '../util';
import { flatten } from 'lodash';
import { join } from 'path';
import { getArgsArray } from '../util/args';
import { rollup, RollupOptions } from "rollup";
import { generateRollupAllAvailableEntries } from "./only-build-entry";
import RollupConfig from "../rollup.config";

export async function run() {
  const option = loadRollupConfig(argv['r-config']);
  const allPackages = getAllPackages(option);
  const allAllowPackages = getAllowPackages(allPackages, option);
  const allEntries = flatten(
    allAllowPackages.map((pkg) =>
      entries(option.ts)
        .map((entry) => {
          if (packageOnlyEntryFilter(pkg, entry, option)) {
            return generateOutputFilePath(entry.file, pkg, option);
          }
          return false;
        })
        .filter((i): i is string => !!i)
    )
  );

  // 清空所有的包输出文件
  await clearDirs(
    allAllowPackages.map((pkg) => {
      // 包的输出目录
      return generateOutputPackagePath('', pkg, option);
    })
  );

  const allConfig = generateRollupAllAvailableEntries();

  try {
    let config: RollupOptions;
    while ( config = allConfig.shift()!) {
      // create a bundle
      const bundle = await rollup(config);
      // an array of file names this bundle depends on
      console.log(bundle.watchFiles);


    }

  }


  // 代码构建
  await execa(
    'node',
    [
      '--max_old_space_size=8192',
      option.rollupPath!,
      '-c',
      join(__dirname, '..', 'rollup.config.js'),
      ...getArgsArray(),
    ],
    {
      stdio: 'inherit',
    }
  );

  // clear rollup other.d.ts
  if (option.dts) {
    await clearPackageOutPackageDts(allAllowPackages, option);
  }

  // 打印日志
  checkAllSizes(allEntries);
}
