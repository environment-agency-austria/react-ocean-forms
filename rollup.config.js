import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

const path = require('path');
const basePath = process.cwd();
const packageJson = require(path.resolve(basePath, './package.json'));

const getBaseConfig = (minify = false, noTsDeclaration = false) => {
  const tsconfigOverride = noTsDeclaration ? { compilerOptions: { declaration: false, declarationMap: false } } : undefined;
  const fileSizePlugin = minify ? filesize() : null;

  return {
    input: "src/index.ts",
    plugins: [
      nodeResolve({ preferBuiltins: true, browser: true }),    
      typescript({
        clean: false,
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride,
      }),
      commonjs({
        namedExports: {
          'moment': [
            'locale',
          ],
        },
      }),
      fileSizePlugin,
    ],
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {})
    ],
    watch: {
      include: [
        'src/**',
        'node_modules/**'
      ]
    }
  };
};

export default (commands) => {
  const cjsConfig = {
    ...getBaseConfig(true),
    output: {
      file: packageJson.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },   
  };

  const esConfig = {
    ...getBaseConfig(false, true),
    output: {
      file: packageJson.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    }  
  };

  if (commands.watch === true) {
    return esConfig;
  } else {
    return [
      cjsConfig,
      esConfig,
    ];
  }
};
