import Enzyme from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';

// Currently there's no official enzyme support
// for reacts context api. FIXME
// https://github.com/airbnb/enzyme/issues/1553
import Adapter from './enzymeAdapter';

Enzyme.configure({ adapter: new Adapter() });
