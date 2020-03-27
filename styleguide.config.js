// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  title: 'react-ocean-forms',
  pagePerSection: true,
  skipComponentsWithoutExample: true,
  // propsParser: require('react-docgen-typescript').withCustomConfig('./tsconfig.json', { skipPropsWithoutDoc: false }).parse,
  moduleAliases: {
    'react-ocean-forms': 'C:\\source\\github\\react-ocean-forms\\src',
  },
  getComponentPathLine(componentPath) {
    const componentName = path.basename(componentPath, '.tsx');
    return `import { ${componentName} } from 'react-ocean-forms';`;
  },
  sections: [
    {
      name: 'Introduction',
      content: 'docs/introduction.md',
    },
    {
      name: 'Changelog',
      content: 'CHANGELOG.md',
    },
    {
      name: 'Components',
      components: 'src/components/**/*.tsx',
      sectionDepth: 1,
    },
    {
      name: 'Hooks',
      sectionDepth: 1,
      sections: [
        {
          name: 'useField',
          content: 'src/hooks/useField/useField.md',
        },
        {
          name: 'useFormContext',
          content: 'src/hooks/useFormContext/useFormContext.md',
        },
        {
          name: 'useFormEventListener',
          content: 'src/hooks/useFormEventListener/useFormEventListener.md',
        },
        {
          name: 'useValidation',
          content: 'src/hooks/useValidation/useValidation.md',
        },
      ],
    },
  ],
  theme: {
    fontFamily: {
      base:
        '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;',
    },
  },
  styles: {
    StyleGuide: {
      logo: {
        'background-color': '#343A40',
      },
    },
    Logo: {
      logo: {
        color: '#FFF',
      },
    },
    Heading: {
      heading: {
        'font-weight': '300',
      },
    },
    TabButton: {
      button: {
        color: '#1673B1',
        'border-bottom': '1px #1673B1 solid',
        'padding-bottom': '0px',
      },
    },
    Playground: {
      preview: {
        'font-family':
          '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;',
      },
    },
  },
  ribbon: {
    url: 'https://github.com/environment-agency-austria/react-ocean-forms',
  },
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              noEmit: false,
              jsx: 'react',
            },
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts'],
    },
  },
};
