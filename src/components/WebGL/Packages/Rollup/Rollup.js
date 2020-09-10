import { rollup } from 'rollup/dist/rollup.browser'
import loklok from './loklok'

export async function buildInput ({ pack, mode = 'iframe' }) {
  let filesMap = {}
  pack.list.forEach((item) => {
    filesMap[item.path] = item.src
  })

  // console.log(pack.list)
  let entry = pack.list.find(e => e.isPreviewEntry).path

  if (mode === 'iframe') {
    entry = pack.list.find(e => e.isPreviewEntry).path
  }
  if (mode === 'package') {
    entry = pack.list.find(e => e.isPackageEntry).path
  }
  if (mode === 'monitor') {
    entry = pack.list.find(e => e.isMonitorEntry).path
  }

  let inputOptions = {
    input: entry,
    plugins: [
      loklok({
        filesMap,
        include: ['**/*.frag', '**/*.vert', '**/*.glsl'],
        exclude: []
      })
    ]
  }

  let outputOptions = {
    name: pack.name,
    file: 'bundle.js',
    format: 'umd',
    plugins: [
    ]
  }

  let bundle = await rollup(inputOptions)
  const { output } = await bundle.generate(outputOptions);
  // console.log(output[0].code)

  // for (const chunkOrAsset of output) {
  //   if (chunkOrAsset.type === 'asset') {
  //     // For assets, this contains
  //     // {
  //     //   fileName: string,              // the asset file name
  //     //   source: string | Uint8Array    // the asset source
  //     //   type: 'asset'                  // signifies that this is an asset
  //     // }
  //     console.log('Asset', chunkOrAsset);
  //   } else {
  //     // For chunks, this contains
  //     // {
  //     //   code: string,                  // the generated JS code
  //     //   dynamicImports: string[],      // external modules imported dynamically by the chunk
  //     //   exports: string[],             // exported variable names
  //     //   facadeModuleId: string | null, // the id of a module that this chunk corresponds to
  //     //   fileName: string,              // the chunk file name
  //     //   implicitlyLoadedBefore: string[]; // entries that should only be loaded after this chunk
  //     //   imports: string[],             // external modules imported statically by the chunk
  //     //   importedBindings: {[imported: string]: string[]} // imported bindings per dependency
  //     //   isDynamicEntry: boolean,       // is this chunk a dynamic entry point
  //     //   isEntry: boolean,              // is this chunk a static entry point
  //     //   isImplicitEntry: boolean,      // should this chunk only be loaded after other chunks
  //     //   map: string | null,            // sourcemaps if present
  //     //   modules: {                     // information about the modules in this chunk
  //     //     [id: string]: {
  //     //       renderedExports: string[]; // exported variable names that were included
  //     //       removedExports: string[];  // exported variable names that were removed
  //     //       renderedLength: number;    // the length of the remaining code in this module
  //     //       originalLength: number;    // the original length of the code in this module
  //     //     };
  //     //   },
  //     //   name: string                   // the name of this chunk as used in naming patterns
  //     //   referencedFiles: string[]      // files referenced via import.meta.ROLLUP_FILE_URL_<id>
  //     //   type: 'chunk',                 // signifies that this is a chunk
  //     // }
  //     console.log('Chunk', chunkOrAsset);
  //   }
  // }

  return output[0].code
}

// export async function build ({ pack }) {
//   let codes = await Promise.all([
//     buildInput({ pack, input: './demo.js' }),
//     buildInput({ pack, input: './package.js' })
//   ])

//   return codes
// }
