import typescript from 'rollup-plugin-typescript2';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';

const path = require('path');
const basePath = process.cwd();
const packageJson = require(path.resolve(basePath, './package.json'));

const externalDependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {})
];

const getBaseConfig = (showFilesize = false, noTsDeclaration = false) => {
  const tsconfigOverride = noTsDeclaration ? { 
    compilerOptions: { 
      declaration: false, 
      declarationMap: false 
    } 
  } : undefined;

  return {
    input: "src/index.ts",
    plugins: [
      nodeResolve({ 
        preferBuiltins: true, 
        browser: true 
      }),    
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
      showFilesize ? filesize() : null,
    ],
    external: (id) => {
      return externalDependencies.some(dep => id.indexOf(dep) === 0);
    },
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
