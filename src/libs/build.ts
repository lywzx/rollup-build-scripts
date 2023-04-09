import { RbsConfig } from '../interfaces';
import { filteredPackages, scanWorkspacePackages, transformPackageConfigToRollupConfig } from '../util';
import { RollupOptions, rollup, OutputOptions } from 'rollup';

/**
 * roll build function
 */
export async function build(option: RbsConfig & { rootPath: string }) {
  const allPackages = await scanWorkspacePackages(option.workspace || '.', {
    rootPath: option.rootPath,
  });
  const filterPackages = filteredPackages(allPackages, option);

  const allRollup: Array<RollupOptions> = [];
  while (!!filterPackages.length) {
    const currentPackage = filterPackages.pop()!;
    allRollup.push(...(await transformPackageConfigToRollupConfig(currentPackage, option)));
  }

  while (allRollup.length) {
    const rollupConfig = allRollup.pop()!;
    const bundle = await rollup(rollupConfig);
    const outputOptionsList: Array<OutputOptions> = [];
    for (const outputOptions of outputOptionsList) {
      const { output } = await bundle.generate(outputOptions);

      for (const chunkOrAsset of output) {
        if (chunkOrAsset.type === 'asset') {
          // For assets, this contains
          // {
          //   fileName: string,              // the asset file name
          //   source: string | Uint8Array    // the asset source
          //   type: 'asset'                  // signifies that this is an asset
          // }
          console.log('Asset', chunkOrAsset);
        } else {
          // For chunks, this contains
          // {
          //   code: string,                  // the generated JS code
          //   dynamicImports: string[],      // external modules imported dynamically by the chunk
          //   exports: string[],             // exported variable names
          //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
          //   fileName: string,              // the chunk file name
          //   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
          //   imports: string[],             // external modules imported statically by the chunk
          //   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
          //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
          //   isEntry: boolean,              // is this chunk a static entry point
          //   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
          //   map: string | null,            // sourcemaps if present
          //   modules: {                     // information about the modules in this chunk
          //     [id: string]: {
          //       renderedExports: string[]; // exported variable names that were included
          //       removedExports: string[];  // exported variable names that were removed
          //       renderedLength: number;    // the length of the remaining code in this module
          //       originalLength: number;    // the original length of the code in this module
          //       code: string | null;       // remaining code in this module
          //     };
          //   },
          //   name: string                   // the name of this chunk as used in naming patterns
          //   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
          //   type: 'chunk',                 // signifies that this is a chunk
          // }
          console.log('Chunk', chunkOrAsset.modules);
        }
      }
    }
  }
}
