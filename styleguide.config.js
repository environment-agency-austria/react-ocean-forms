// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  title: 'react-ocean-forms',
  pagePerSection: true,
  usageMode: 'expand',
  propsParser: require('react-docgen-typescript').withCustomConfig('./tsconfig.json', { skipPropsWithoutDoc: false }).parse,
  moduleAliases: {
    'react-ocean-forms': 'C:\\source\\github\\react-ocean-forms\\src',
  },
  getComponentPathLine(componentPath) {
    const componentName = path.basename(componentPath, '.tsx')
    return `import { ${componentName} } from 'react-ocean-forms';`
  },
  sections: [
    {
      name: 'Changelog',
      content: 'CHANGELOG.md'
    },
    {
      name: 'Components',
      components: 'src/components/**/*.tsx',
      sectionDepth: 1
    }
  ],
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
              jsx: "react",
            }
          },
          exclude: /node_modules/,
        },
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts"]
    },
  }
};
